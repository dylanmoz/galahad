// @flow

import React from 'react'
import type { ComponentType } from 'react'
import classnames from 'classnames'

type Props = {
  isSelected: boolean,
  group: 'left' | 'right' | 'center',
  outsideDraggingGroup: boolean,
  lastLeftColumn: boolean,
  verticalLines: boolean,
  className?: string
}

const DataColumn = ({
  isSelected,
  group,
  outsideDraggingGroup,
  lastLeftColumn,
  verticalLines,
  className,
  ...others
}: Props) => (
  <div
    className={classnames(
      'data-column',
      `group-${group}`,
      {
        selected: isSelected,
        'outside-dragging-group': outsideDraggingGroup,
        'last-left-column': lastLeftColumn,
        'vertical-lines': verticalLines
      },
      className
    )}
    {...others}
  />
)

export default (DataColumn: ComponentType<Props>)
