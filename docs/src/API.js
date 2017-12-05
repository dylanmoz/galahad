// @flow

import React from 'react'
import { capitalize } from 'lodash'

import Galahad from '../../src'
import Card from './Card'
import Table from './Table'

export default () => (
  <div>
    <h6>Props</h6>
    <Card style={{ marginBottom: 36 }}>
      <Table
        columns={[
          { id: 'prop', spanPercent: 1/5 },
          {
            id: 'type',
            spanPercent: 2/5,
            render: ({ entity, self }) => <code>{entity[self.id]}</code>
          },
          { id: 'description', spanPercent: 2/5 }
        ]}
        data={[
          { prop: 'tableData', type: '?Array<any>', description: 'The array of data' },
          { prop: 'columns', type: 'Array<DataColumnDefinition>', description: 'The column definitions' },
          { prop: 'selectedColumns', type: 'string[]', description: 'Array of column ids to display' },
          { prop: 'fixedWidth', type: 'boolean', description: 'Use with fixedSpan for non-percent based column widths' },
          { prop: 'onColumnChange', type: '(selectedColumns: Array<string>) => void', description: 'Will be called when the column order has changed' },
          { prop: 'loading', type: 'boolean', description: 'Set to true for a loading interstitial' },
          { prop: 'numLoadingRows', type: ' number', description: 'The number of rows to display while loading' },
          { prop: 'onHeaderClick', type: '(column: DataColumnDefinition) => void', description: 'Called when a header is clicked' }
        ]}
      />
    </Card>

    <h6>DataColumnDefinition</h6>
    <Card>
      <Table
        columns={[
          { id: 'field', spanPercent: 1/5 },
          {
            id: 'type',
            spanPercent: 2/5,
            render: ({ entity, self }) => <code>{entity[self.id]}</code>
          },
          { id: 'description', spanPercent: 2/5 }
        ]}
        data={[
          { field: 'id', type: 'string', description: 'The unique identifier for this column' },
          { field: 'expanded', type: 'boolean', description: 'Currently Galahad only supports 60px and 84px row height. Set to true for 84px' },
          { field: 'group', type: '\'left\' | \'right\'', description: 'The group to set the column in, if not set the column will be in the center group' },
          { field: 'renderHeader', type: '?ComponentType<{ self: DataColumnDefinition }>', description: 'Component that will render the header of a given column' },
          { field: 'render', type: 'ComponentType<DataColumnProps<*>>', description: 'Component that will render a single cell in a column' },
          { field: 'renderHover', type: '?ComponentType<DataColumnProps<*>>', description: 'If provided, this will render when the row is hovered' },
          { field: 'renderLoading', type: 'ComponentType<DataColumnProps<*>>', description: 'Override a cell\'s loading interstitial with something of your own' },
          { field: 'spanPercent', type: 'number', description: 'If fixedWidth is false, set the column\'s width as a fraction of the table\'s width' },
          { field: 'spanFixed', type: 'width', description: 'If fixedWidth is true, set this property as the width of the column' },
          { field: 'textAlign', type: '\'left\' | \'right\'', description: '' }
        ]}
      />
    </Card>
  </div>
)
