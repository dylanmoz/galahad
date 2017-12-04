// @flow

import type { DataColumnDefinition } from '../types'

function getColumnWidth(column: DataColumnDefinition, tableWidth: number, fixedWidth: boolean) {
  return fixedWidth ? column.spanFixed : tableWidth * column.spanPercent
}

export default getColumnWidth
