// @flow

import React from 'react'
import type { ComponentType } from 'react'
import classnames from 'classnames'

type Props = {
  isExpanded: boolean,
  hovering?: boolean,
  isLastRow?: boolean,
  className?: string
}

const DataCell = ({ isExpanded, hovering, isLastRow, className, ...others }: Props) => (
  <div
    className={classnames(
      'data-cell',
      {
        expanded: isExpanded,
        'last-row': isLastRow,
        hovering
      },
      className
    )}
    {...others}
  />
)

export default (DataCell: ComponentType<Props>)
