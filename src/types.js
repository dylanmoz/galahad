// @flow

import type { ComponentType, Node } from 'react'

export type DataColumnProps<T> = {
  entity: T,
  self: DataColumnDefinition
}

export type DataColumnDefinition = {
  id: string,
  expanded?: boolean,
  group?: 'left' | 'right',
  renderHeader: ComponentType<{ self: DataColumnDefinition }>,
  render: ComponentType<DataColumnProps<*>>,
  wrapper: ComponentType<DataColumnProps<*> & { children: Node }>,
  renderHover?: ComponentType<DataColumnProps<*>>,
  renderLoading?: ComponentType<{ self: DataColumnDefinition }>,
  height?: number,
  spanPercent: number,
  spanFixed: any,
  textAlign?: 'left' | 'right'
}
