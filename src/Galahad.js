// @flow

import React from 'react'
import type { ComponentType } from 'react'
import classnames from 'classnames'
import { Motion, spring } from 'react-motion'
import { range, keyBy, throttle } from 'lodash'
import { Scrollbars } from 'react-custom-scrollbars'

import moveArrayElement from './utils/moveArrayElement'
import withParentSize from './utils/withParentSize'
import cache from './utils/cache'
import getColumnGroups from './utils/getColumnGroups'
import getColumnWidth from './utils/getColumnWidth'
import DataCell, { DataCellInner } from './DataCell'
import HeaderCell from './HeaderCell'
import DataColumn from './DataColumn'
import Placeloader from './Placeloader'
import type { DataColumnDefinition } from './types'

const springConfig = { stiffness: 170, damping: 26 }

type TableData = Array<{}>

type Props = {
  tableData: ?TableData,
  columns: $ReadOnlyArray<DataColumnDefinition>,
  selectedColumns: string[],
  fixedWidth: boolean,
  onColumnChange: (selectedColumns: Array<string>) => void,
  loading: boolean,
  numLoadingRows?: number,
  onHeaderClick: (column: DataColumnDefinition) => void,
  parentWidth: number,
  parentHeight: number,
  className?: string
}

type State = {
  hoverRowIndex: ?string,
  selectedColumn: ?DataColumnDefinition,
  orderedIds: string[],
  mouseXFromTable: number,
  mouseXFromColumn: number,
  mouseXOnMouseDown: number,
  isDragging: boolean,
  columnMap: { [key: string]: DataColumnDefinition }
}

class Galahad extends React.Component<Props, State> {
  table: ?HTMLDivElement
  scrollbars: any
  hoverTimeout: ?number
  prevSelectedColumns: Array<string>
  columnsRecentlyChanged: boolean
  columnsRecentlyChangedTimeout: any

  constructor(props: Props) {
    super(props)

    const { columns, selectedColumns, fixedWidth } = this.props
    const columnMap = keyBy(columns, 'id')
    const columnGroups = getColumnGroups(selectedColumns, columnMap, this.getWidth(), fixedWidth)

    this.columnsRecentlyChanged = false
    this.prevSelectedColumns = selectedColumns
    this.state = {
      hoverRowIndex: null,
      selectedColumn: null,
      orderedIds: columnGroups.orderedIds,
      mouseXFromTable: 0,
      mouseXFromColumn: 0,
      mouseXOnMouseDown: 0,
      isDragging: false,
      columnMap
    }
  }

  componentDidMount() {
    window.addEventListener('touchmove', this.handleTouchMove)
    window.addEventListener('touchend', this.handleTouchEnd)
    window.addEventListener('mousemove', this.handleMouseMove)
    window.addEventListener('mouseup', this.handleMouseUp)
  }

  componentWillReceiveProps(nextProps) {
    const { columns, selectedColumns, fixedWidth } = this.props
    const { orderedIds } = this.state

    let { columnMap } = this.state
    if (columns !== nextProps.columns) {
      columnMap = keyBy(nextProps.columns, 'id')
      this.setState({ columnMap }) // eslint-disable-line react/no-did-update-set-state
    }

    if (selectedColumns !== nextProps.selectedColumns) {
      if (
        selectedColumns.length !== nextProps.selectedColumns.length ||
        !orderedIds.every((id, i) => id === nextProps.selectedColumns[i])
      ) {
        this.setState({ // eslint-disable-line react/no-did-update-set-state
          orderedIds: getColumnGroups(
            nextProps.selectedColumns,
            columnMap,
            this.getWidth(),
            fixedWidth
          ).orderedIds
        })
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('touchmove', this.handleTouchMove)
    window.removeEventListener('touchend', this.handleTouchEnd)
    window.removeEventListener('mousemove', this.handleMouseMove)
    window.removeEventListener('mouseup', this.handleMouseUp)
  }

  setTableRef = (ref: ?HTMLDivElement) => {
    this.table = ref
  }

  getTableRect = () => (this.table ? this.table.getBoundingClientRect() : null)

  setScrollbarsRef = (ref: ?Object) => {
    this.scrollbars = ref
  }

  /**
   * Should call once during render. Will set this.prevSelectedColumns to the passed in selected
   * columns so that next render has access to them
   */
  shouldAnimate = (selectedColumns: Array<string>) => {
    const equalColumns = this.prevSelectedColumns.length === selectedColumns.length
    const animate = equalColumns && !this.columnsRecentlyChanged
    this.prevSelectedColumns = selectedColumns

    if (!equalColumns) {
      this.columnsRecentlyChanged = true

      clearTimeout(this.columnsRecentlyChangedTimeout)
      this.columnsRecentlyChangedTimeout = setTimeout(() => {
        this.columnsRecentlyChanged = false
      }, 1000)
    }

    return animate
  }

  isDraggable = (column: DataColumnDefinition) => {
    const { groups } = this.getColumnGroups()

    const notDraggable =
      (column.group === 'left' && groups.left.length <= 1) ||
      (column.group === 'right' && groups.right.length <= 1)

    return !notDraggable
  }

  getWidth = () => this.props.parentWidth

  getColumnGroups = () => {
    const { fixedWidth } = this.props
    const { orderedIds, columnMap } = this.state

    return getColumnGroups(orderedIds, columnMap, this.getWidth(), fixedWidth)
  }

  isExpanded = cache(
    (orderedIds: Array<string>) => orderedIds.some(col => this.state.columnMap[col].expanded),
    { maxSize: 10 }
  )

  getRowHeight = cache(
    (orderedIds: Array<string>) => {
      const heights = orderedIds.map(col => this.state.columnMap[col].height || 60)

      return this.isExpanded(orderedIds) ? 84 : Math.max(...heights)
    },
    { maxSize: 10 }
  )

  handleMouseEnter = cache(
    (hoverRowIndex: string) => () => {
      this.handleHover(hoverRowIndex)
    },
    { maxSize: 50 }
  )

  handleMouseLeave = () => {
    this.handleHover(null)
  }

  handleHover = (hoverRowIndex: ?string) => {
    if (hoverRowIndex !== null) {
      // The hoverRowIndex is trying to be set,
      // clear any attempts to remove the hoverRowIndex and set the index
      clearTimeout(this.hoverTimeout)

      if (this.state.hoverRowIndex !== hoverRowIndex) {
        this.setState({ hoverRowIndex })
      }
    } else {
      // The hoverRowIndex is trying to be cleared. However, we may immediately receive a mouseEnter
      // event, so we need to hold off for a few milliseconds before clearing.
      this.hoverTimeout = setTimeout(() => this.setState({ hoverRowIndex: null }), 10)
    }
  }

  handleTouchEnd = () => {
    this.handleMouseUp()
  }

  handleMouseUp = e => {
    const { selectedColumns } = this.props
    const { orderedIds, selectedColumn, isDragging, mouseXOnMouseDown } = this.state

    if (selectedColumn) {
      if (!isDragging) {
        this.props.onHeaderClick(selectedColumn)
      } else if (!orderedIds.every((id, i) => id === selectedColumns[i])) {
        this.props.onColumnChange(orderedIds)
      } else if (e && Math.abs(mouseXOnMouseDown - e.pageX) <= 5) {
        // If the column was dragged, but only a very small amount (<= 5px), then still register
        // it as a click
        this.props.onHeaderClick(selectedColumn)
      }

      this.setState({
        selectedColumn: null,
        mouseXFromColumn: 0,
        mouseXOnMouseDown: 0,
        isDragging: false
      })
    }
  }

  handleTouchStart = (column, columnX) => e => {
    this.handleMouseDown(column, columnX)(e.touches[0])
  }

  handleMouseDown = (column, columnOffsetX) => e => {
    const tableRect = this.getTableRect()
    if (e.button !== 0 && !(e instanceof Touch)) return
    if (!tableRect || !this.scrollbars) return

    const scrollLeft = this.scrollbars.getScrollLeft()
    const tableLeft = this.scrollbars.view.getBoundingClientRect().left

    this.setState({
      selectedColumn: column,
      mouseXFromTable: e.pageX - tableLeft,
      mouseXOnMouseDown: e.pageX,
      mouseXFromColumn: e.pageX - tableLeft - columnOffsetX + scrollLeft
    })
  }

  handleTouchMove = e => {
    this.handleMouseMove(e.touches[0])
  }

  scroll = (scrollLeft: boolean) => {
    if (scrollLeft) {
      this.scrollLeft()
    } else {
      this.scrollRight()
    }
  }

  scrollLeft = () => {
    const { selectedColumn } = this.state

    if (!selectedColumn || !this.scrollbars) return

    this.scrollbars.scrollLeft(this.scrollbars.getScrollLeft() - 1)

    requestAnimationFrame(this.scrollLeft)
  }

  scrollRight = () => {
    const { selectedColumn } = this.state

    if (!selectedColumn || !this.scrollbars) return

    this.scrollbars.scrollLeft(this.scrollbars.getScrollLeft() + 1)

    requestAnimationFrame(this.scrollRight)
  }

  handleMouseMove = ({ pageX }) => {
    const tableRect = this.getTableRect()
    const { fixedWidth } = this.props
    const { selectedColumn, columnMap } = this.state

    if (!selectedColumn || !tableRect || !this.scrollbars) return

    const tableLeft = this.scrollbars.view.getBoundingClientRect().left
    const tableWidth = tableRect.width

    let runningX = 0
    // Pixel offset from the left side of table
    const mouseXFromTable = pageX + this.scrollbars.getScrollLeft() - tableLeft

    const leftOfTable = pageX < tableLeft
    const rightOfTable = pageX > tableLeft + tableWidth
    if (leftOfTable || rightOfTable) {
      this.scroll(leftOfTable)
      return
    }
    if (!this.isDraggable(selectedColumn)) return

    const { orderedIds, centerLeft, centerRight } = this.getColumnGroups()

    const { group } = selectedColumn

    if (group === 'left' && mouseXFromTable > centerLeft) return
    if (group === 'right' && mouseXFromTable < centerRight) return
    if (!group && (mouseXFromTable < centerLeft || mouseXFromTable > centerRight)) return

    // Find what index the selected column should be
    const columnIndex = range(0, orderedIds.length).find(i => {
      const currentColumn = columnMap[orderedIds[i]]
      const width = getColumnWidth(currentColumn, this.getWidth(), fixedWidth)
      const currentRunningX = runningX
      runningX += width

      if (i === 0) {
        return mouseXFromTable < width
      }

      if (i === orderedIds.length - 1) {
        return true
      }

      return mouseXFromTable > currentRunningX && mouseXFromTable < runningX
    })

    const currentIndex = range(0, orderedIds.length).find(i => orderedIds[i] === selectedColumn.id)

    this.setState({
      mouseXFromTable,
      isDragging: true
    })

    if (currentIndex !== columnIndex) {
      this.transition(currentIndex, columnIndex)
    }
  }

  transition = throttle(
    (from: any, to: any) => {
      this.setState({
        orderedIds: moveArrayElement(this.getColumnGroups().orderedIds, from, to)
      })
    },
    500,
    { leading: true, trailing: false }
  )

  renderColumnData = cache(
    (
      column: DataColumnDefinition,
      tableData: TableData,
      rowHeight: number,
      loading: boolean,
      hoverRowIndex: boolean
    ) => {
      const list = loading ? range(this.props.numLoadingRows || 10) : tableData

      return list.map((item, i) => {
        const renderKey = `${column.id}-${i}`

        if (loading) {
          return (
            <DataCell
              key={`cell-${i}-${column.id}`} // eslint-disable-line react/no-array-index-key
              rowHeight={rowHeight}
              isLastRow={i === list.length - 1}
            >
              <DataCellInner>
                {column.renderLoading ? (
                  <column.renderLoading key={renderKey} self={column} />
                ) : (
                  <Placeloader
                    key={renderKey}
                    w="60px"
                    style={{ float: column.textAlign || 'left' }}
                  />
                )}
              </DataCellInner>
            </DataCell>
          )
        }

        const hovering = i === hoverRowIndex

        const ColumnRender = hovering && column.renderHover ? column.renderHover : column.render

        return (
          <DataCell
            key={`${column.id}-${i}`} // eslint-disable-line react/no-array-index-key
            onMouseEnter={this.handleMouseEnter(i)}
            onMouseLeave={this.handleMouseLeave}
            rowHeight={rowHeight}
            hovering={hovering}
            isLastRow={i === list.length - 1}
            style={{ textAlign: column.textAlign || 'left' }}
          >
            {column.wrapper ? (
              <column.wrapper entity={item} self={column}>
                <DataCellInner>
                  <ColumnRender entity={item} self={column} />
                </DataCellInner>
              </column.wrapper>
            ) : (
              <DataCellInner>
                <ColumnRender entity={item} self={column} />
              </DataCellInner>
            )}
          </DataCell>
        )
      })
    },
    { maxSize: 50 }
  )

  getScrollWidth = cache(
    (orderedIds, columnMap, fixedWidth) =>
      orderedIds.reduce((sum, columnId) => {
        const column = columnMap[columnId]

        const width = getColumnWidth(column, this.getWidth(), fixedWidth)

        return sum + width
      }, 0),
    { maxSize: 25 }
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
      numLoadingRows,
      ...others
    } = this.props

    const {
      selectedColumn,
      columnMap,
      hoverRowIndex,
      isDragging,
      mouseXFromTable,
      mouseXFromColumn
    } = this.state

    let runningX = 0
    const { orderedIds, groups } = this.getColumnGroups()
    const rowHeight = this.getRowHeight(orderedIds)

    const data = tableData || []
    const numRows = numLoadingRows || 10

    const scrollWidth = this.getScrollWidth(orderedIds, columnMap, fixedWidth)
    const height = 42 + rowHeight * (loading ? numRows : data.length)

    const animate = this.shouldAnimate(selectedColumns)

    return (
      <Scrollbars ref={this.setScrollbarsRef} style={{ width: '100%', height }}>
        <div
          className={classnames('galahad', { selected: !!selectedColumn }, className)}
          ref={this.setTableRef}
          {...others}
        >
          <div
            style={{
              display: 'flex',
              width: `${scrollWidth}px`,
              height: `${height}px`
            }}
          >
            {orderedIds.map(columnId => {
              const column = columnMap[columnId]

              const width = getColumnWidth(column, this.getWidth(), fixedWidth)

              const isLastLeftColumn = column.id === groups.left[groups.left.length - 1]
              const isSelected = !!(selectedColumn && isDragging && selectedColumn.id === column.id)
              const outsideDraggingGroup = !!(
                selectedColumn &&
                isDragging &&
                selectedColumn.group !== column.group
              )

              const RenderHeader = column.renderHeader || (() => null)

              const touchStartCb = this.handleTouchStart(column, runningX)
              const mouseDownCb = this.handleMouseDown(column, runningX)

              const columnX = animate ? spring(runningX, springConfig) : runningX

              const style = {
                selected: spring(isSelected ? 1 : 0, springConfig),
                x: isSelected ? mouseXFromTable - mouseXFromColumn : columnX
              }

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
                        transform: `translate3d(${Math.floor(x)}px, 0, 0)`,
                        boxShadow: `0 ${selected * 16}px ${selected *
                          24}px 0 rgba(25, 29, 34, ${selected * 0.1})`
                      }}
                    >
                      <HeaderCell
                        isDraggable={this.isDraggable(column)}
                        onTouchStart={touchStartCb}
                        onMouseDown={mouseDownCb}
                        style={{
                          justifyContent: column.textAlign === 'right' ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <RenderHeader self={column} />
                      </HeaderCell>

                      {this.renderColumnData(
                        column,
                        data,
                        rowHeight,
                        loading,
                        isDragging ? null : hoverRowIndex
                      )}
                    </DataColumn>
                  )}
                </Motion>
              )
            })}
          </div>
        </div>
      </Scrollbars>
    )
  }
}

export default withParentSize(Galahad)
