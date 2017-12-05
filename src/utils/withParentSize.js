// @flow

import React from 'react'
import type { ComponentType } from 'react'
import { debounce } from 'lodash'

type InputProps = {
  parentWidth: number,
  parentHeight: number
}

type Props = {
  windowResizeDebounceTime: number
}

type State = {
  parentWidth: ?number,
  parentHeight: ?number
}

function withParentSize(BaseComponent: ComponentType<any>) {
  class WrappedComponent extends React.Component<Props, State> {
    container: ?HTMLDivElement

    static defaultProps = {
      windowResizeDebounceTime: 300
    }

    constructor(props: Props) {
      super(props)

      this.state = {
        parentWidth: null,
        parentHeight: null,
      }
    }

    componentDidMount() {
      window.addEventListener('resize', this.resize, false)
      this.resize()
    }

    componentWillUnmount() {
      window.removeEventListener('resize', this.resize, false)
    }

    setContainerRef = (ref: ?HTMLDivElement) => { this.container = ref }

    resize = debounce(() => {
      if (this.container) {
        const boundingRect = this.container.getBoundingClientRect()

        this.setState({
          parentWidth: boundingRect.width,
          parentHeight: boundingRect.height,
        })
      }
    }, this.props.windowResizeDebounceTime)

    render() {
      const { windowResizeDebounceTime, ...others } = this.props
      const { parentWidth, parentHeight } = this.state

      return (
        <div
          style={{ width: '100%', height: '100%' }}
          ref={this.setContainerRef}
        >
          {parentWidth !== null && parentHeight !== null && (
            <BaseComponent
              parentWidth={parentWidth}
              parentHeight={parentHeight}
              {...others}
            />
          )}
        </div>
      )
    }
  }

  return WrappedComponent
}

export default withParentSize
