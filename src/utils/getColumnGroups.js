// @flow

import type { DataColumnDefinition } from '../types'
import cache from './cache'
import getColumnWidth from './getColumnWidth'

/**
 * Creates the three groups of columns along with calculating
 * the distance, from the left side of the table, of the right most left fixed column (centerLeft),
 * and the left most right fixed column (centerRight)
 */
function getColumnGroups(
  columnIds: Array<string>,
  columnMap: { [id: string]: DataColumnDefinition },
  tableWidth: number,
  fixedWidth: boolean
) {
  const groups = {
    left: [],
    center: [],
    right: []
  }

  columnIds.forEach((id) => {
    const column = columnMap[id]
    groups[column.group || 'center'].push(id)
  })

  const orderedIds = [...groups.left, ...groups.center, ...groups.right]

  const sumWidths = (acc, curr) => acc + getColumnWidth(columnMap[curr], tableWidth, fixedWidth)
  const centerLeft = groups.left.reduce(sumWidths, 0)
  const centerRight = centerLeft + groups.center.reduce(sumWidths, 0)

  return {
    groups,
    orderedIds,
    centerLeft,
    centerRight
  }
}

export default getColumnGroups
// export default cache(getColumnGroups, { maxSize: 25 })
