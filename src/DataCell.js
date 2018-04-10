// @flow

import React from 'react'
import type { ComponentType } from 'react'
import classnames from 'classnames'

type Props = {
  rowHeight: number,
  hovering?: boolean,
  isLastRow?: boolean,
  className?: string,
  style?: ?any
}

type InnerProps = {
  className?: string
}

const DataCell = ({ rowHeight, hovering, isLastRow, className, style, ...others }: Props) => (
  <div
    className={classnames(
      'data-cell',
      {
        'last-row': isLastRow,
        hovering
      },
      className
    )}
    style={{ height: rowHeight, ...style }}
    {...others}
  />
)

export const DataCellInner = ({ className, ...others }: InnerProps) => (
  <div
    className={classnames(
      'data-cell-inner',
      className
    )}
    {...others}
  />
)

export default (DataCell: ComponentType<Props>)
