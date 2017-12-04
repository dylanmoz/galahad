// @flow

import React from 'react'
import classnames from 'classnames'
import type { ComponentType } from 'react'

type Props = {
  isDraggable: boolean
}

const HeaderCell = ({ isDraggable, ...others }: Props) => (
  <div
    className={classnames(
      'header-cell',
      {
        draggable: isDraggable
      }
    )}
    {...others}
  />
)

export default (HeaderCell: ComponentType<Props>)
