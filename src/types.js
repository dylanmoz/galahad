// @flow

import type { ComponentType } from 'react'

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
  renderHover?: ComponentType<DataColumnProps<*>>,
  renderLoading?: ComponentType<{ self: DataColumnDefinition }>,
  spanPercent: number,
  spanFixed: any,
  textAlign?: 'left' | 'right'
}
