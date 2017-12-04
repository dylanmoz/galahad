// @flow

import React from 'react'
import type { ComponentType } from 'react'
import classnames from 'classnames'
import { Motion, spring } from 'react-motion'
import { range, keyBy, throttle } from 'lodash'
import { Row, Card, TextPlaceloader } from '@classy/classy-components'

import moveArrayElement from './utils/moveArrayElement'
import withParentSize from './utils/withParentSize'
import cache from './utils/cache'
import getColumnGroups from './utils/getColumnGroups'
import getColumnWidth from './utils/getColumnWidth'
import DataCell from './DataCell'
import HeaderCell from './HeaderCell'
import DataColumn from './DataColumn'

type TableData = any[]

type DataColumnProps<T> = {
  entity: T,
  self: DataColumnDefinition
}

type DataColumnDefinition = {
  id: string,
  expanded?: boolean,
  group?: 'left' | 'right',
  label?: Node,
  linkable?: boolean,
  renderHeader: ComponentType<{ self: DataColumnDefinition }>,
  render: ComponentType<DataColumnProps<*>>,
  renderHover?: ComponentType<DataColumnProps<*>>,
  renderLoading?: ComponentType<DataColumnProps<*>>,
  spanPercent: number,
  spanFixed: number,
  textAlign?: 'left' | 'right'
}

type Props = {
  tableData: ?TableData,
  columns: $ReadOnlyArray<DataColumnDefinition>,
  selectedColumns: string[],
  fixedWidth: boolean,
  onColumnChange: (selectedColumns: Array<string>) => void,
  loading: boolean,
  onHeaderClick: (column: DataColumnDefinition) => void,
  parentWidth: number,
  parentHeight: number,
  className?: string
}

type State = {
  hoverId: ?string,
  selectedColumn: ?DataColumnDefinition,
  deltaX: number,
  mouseX: number,
  isDragging: boolean,
  columnMap: { [key: string]: DataColumnDefinition }
}

class Galahad extends React.Component<Props, State> {
  tableRect: ?{ top: number, left: number, width: number, height: number }
  hoverTimeout: ?number

  constructor(props: Props) {
    super(props)

    this.state = {
      hoverId: null,
      selectedColumn: null,
      deltaX: 0,
      mouseX: 0,
      isDragging: false,
      columnMap: keyBy(this.props.columns, 'id')
    }
  }

  componentDidMount() {
    window.addEventListener('mousemove', this.handleMouseMove)
    window.addEventListener('mouseup', this.handleMouseUp)
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.handleMouseMove)
    window.removeEventListener('mouseup', this.handleMouseUp)
  }

  setTableRef = (ref: ?HTMLDivElement) => {
    this.tableRect = ref ? ref.getBoundingClientRect() : null
  }

  isDraggable = (column: DataColumnDefinition) => {
    const { groups } = this.getColumnGroups()

    const notDraggable = (column.group === 'left' && groups.left.length <= 1)
    || (column.group === 'right' && groups.right.length <= 1)

    return !notDraggable
  }

  getWidth = () => this.props.parentWidth - 24

  getColumnGroups = () => {
    const { selectedColumns, fixedWidth } = this.props
    const { columnMap } = this.state

    return getColumnGroups(selectedColumns, columnMap, this.getWidth(), fixedWidth)
  }

  isExpanded = cache(
    (orderedIds: Array<string>) => (
      orderedIds.some(col => this.state.columnMap[col].expanded)
    ),
    { maxSize: 50 }
  )

  handleMouseEnter = cache(
    (hoverId: string) => () => {
      this.handleHover(hoverId)
    },
    { maxSize: 50 }
  )

  handleMouseLeave = () => {
    this.handleHover(null)
  }

  handleHover = (hoverId: ?string) => {
    if (hoverId) {
      // The hoverId is trying to be set, clear any attempts to remove the hoverId and set the id
      clearTimeout(this.hoverTimeout)

      if (this.state.hoverId !== hoverId) {
        this.setState({ hoverId })
      }
    } else {
      // The hoverId is trying to be cleared. However, we may immediately receive a mouseEnter
      // event, so we need to hold off for a few milliseconds before clearing.
      this.hoverTimeout = setTimeout(() => this.setState({ hoverId: null }), 10)
    }
  }

  handleMouseUp = () => {
    const { selectedColumn, isDragging } = this.state

    if (selectedColumn && !isDragging) {
      this.props.onHeaderClick(selectedColumn)
    }

    this.setState({
      selectedColumn: null,
      deltaX: 0,
      isDragging: false
    })
  }

  handleMouseDown = (column, columnX) => (e) => {
    if (e.button !== 0) return

    this.setState({
      selectedColumn: column,
      mouseX: columnX,
      deltaX: e.pageX - columnX
    })
  }

  handleMouseMove = ({ pageX }) => {
    const { fixedWidth } = this.props
    const { selectedColumn, deltaX, columnMap } = this.state

    if (!selectedColumn || !this.tableRect) return

    let runningX = 0
    const mouseX = pageX - deltaX
    const mousePos = pageX - this.tableRect.left

    if (pageX < this.tableRect.left || pageX > this.tableRect.left + this.tableRect.width) return
    if (!this.isDraggable(selectedColumn)) return

    const {
      orderedIds,
      centerLeft,
      centerRight
    } = this.getColumnGroups()

    const { group } = selectedColumn

    if (group === 'left' && mousePos > centerLeft) return
    if (group === 'right' && mousePos < centerRight) return
    if (!group && (mousePos < centerLeft || mousePos > centerRight)) return

    const columnIndex = range(0, orderedIds.length).find((i) => {
      const currentColumn = columnMap[orderedIds[i]]
      const width = getColumnWidth(currentColumn, this.getWidth(), fixedWidth)
      const currentRunningX = runningX
      runningX += width

      if (i === 0) {
        return mousePos < width
      }

      if (i === orderedIds.length - 1) {
        return true
      }

      return mousePos > currentRunningX && mousePos < runningX
    })

    const currentIndex = range(0, orderedIds.length).find(i => (
      orderedIds[i] === selectedColumn.id
    ))

    this.setState({
      mouseX,
      isDragging: true
    })

    if (currentIndex !== columnIndex) {
      this.transition(currentIndex, columnIndex)
    }
  }

  transition = throttle((from: any, to: any) => {
    this.props.onColumnChange(
      moveArrayElement(this.getColumnGroups().orderedIds, from, to)
    )
  }, 500, { leading: true, trailing: false })

  renderColumnData = cache(
    (
      column: any,
      tableData: TableData,
      isExpanded: boolean,
      loading: boolean,
      hoverId: boolean
    ) => (
      (loading ? range(10) : tableData).map((item) => {
        if (loading) {
          return (
            <DataCell
              key={`${item}-${column.id}`}
              isExpanded={isExpanded}
            >
              {column.renderLoading ? <column.renderLoading key={item} self={column} /> : (
                <TextPlaceloader
                  key={item}
                  text="body1"
                  w="60px"
                  style={{ float: column.textAlign || 'left' }}
                />
              )}
            </DataCell>
          )
        }

        const hovering = item.id === hoverId

        const ColumnRender = hovering && column.renderHover ?
          column.renderHover
          : column.render

        return (
          <DataCell
            key={`${item.id}-${column.id}`}
            onMouseEnter={this.handleMouseEnter(item.id)}
            onMouseLeave={this.handleMouseLeave}
            isExpanded={isExpanded}
            hovering={hovering}
          >
            <ColumnRender entity={item} self={column} />
          </DataCell>
        )
      })
    ),
    { maxSize: 50 }
  )

  render() {
    const {
      tableData,
      columns,
      selectedColumns,
      fixedWidth,
      onColumnChange,
      loading,
      onHeaderClick,
      parentWidth,
      parentHeight,
      className,
      ...others
    } = this.props

    const { selectedColumn, columnMap, hoverId, isDragging, mouseX } = this.state

    let runningX = 0
    const { orderedIds, groups } = this.getColumnGroups()
    const isExpanded = this.isExpanded(orderedIds)
    const rowHeight = isExpanded ? 84 : 60

    const data = tableData || []

    return (
      <div
        className={classnames(
          'galahad',
          { selected: !!selectedColumn },
          className
        )}
        ref={this.setTableRef}
        {...others}
      >
        <Row style={{ height: `${42 + (rowHeight * (loading ? 10 : data.length))}px` }}>
          {orderedIds.map((columnId) => {
            const column = columnMap[columnId]

            const isLastLeftColumn = column.id === groups.left[groups.left.length - 1]
            const isSelected = !!(selectedColumn && isDragging && selectedColumn.id === column.id)
            const outsideDraggingGroup = !!(
              selectedColumn && isDragging && selectedColumn.group !== column.group
            )

            const style = {
              selected: spring(isSelected ? 1 : 0),
              x: isSelected ? mouseX : spring(runningX),
            }

            const width = getColumnWidth(column, this.getWidth(), fixedWidth)

            const RenderHeader = column.renderHeader || (() => null)

            runningX += width

            return (
              <Motion style={style} key={column.id}>
                {({ selected, x }) => (
                  <DataColumn
                    group={column.group || 'center'}
                    verticalLines={false}
                    lastLeftColumn={isLastLeftColumn}
                    outsideDraggingGroup={outsideDraggingGroup}
                    isSelected={isSelected}
                    style={{
                      width: `${width}px`,
                      transform: `translate3d(${x}px, 0, 0) scale(${1 + (selected * 0.05)})`,
                      boxShadow: `0 ${selected * 16}px ${selected * 24}px 0 rgba(25, 29, 34, ${selected * 0.1})`,
                    }}
                  >
                    <HeaderCell
                      isDraggable={this.isDraggable(column)}
                      onMouseDown={this.handleMouseDown(column, x)}
                    >
                      <RenderHeader self={column} />
                    </HeaderCell>

                    {this.renderColumnData(
                      column,
                      data,
                      isExpanded,
                      loading,
                      isDragging ? null : hoverId,
                      isLastLeftColumn,
                      false
                    )}
                  </DataColumn>
                )}
              </Motion>
            )
          })}
        </Row>
      </div>
    )
  }
}

export default withParentSize(Galahad)
