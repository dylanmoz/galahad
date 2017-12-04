// @flow

import React from 'react'
import Link from 'gatsby-link'

import '../../../src/styles.scss'
import Galahad from '../../../src'

type State = {
  columnOrder: string[]
}

const renderHeader = ({ self }) => <h6>{self.label}</h6>

class IndexPage extends React.Component<any, State> {
  constructor(props: any) {
    super(props)

    this.state = {
      columnOrder: ['id', 'name']
    }
  }

  handleColumnChange = (columnOrder) => {
    this.setState({
      columnOrder
    })
  }

  handleHeaderClick = () => {
    console.log('header click')
  }

  render() {
    return (
      <div style={{ width: '700px', marginLeft: 400 }}>
        <h1>Galahad</h1>
        <Galahad
          tableData={[{ id: '123', name: 'Bob' }, { id: '543', name: 'Dylan' }]}
          columns={[
            {
              id: 'id',
              label: 'ID',
              renderHeader,
              render: ({ entity }) => <div>id: {entity.id}</div>,
              spanPercent: 1 / 3
            },
            {
              id: 'name',
              label: 'Name',
              renderHeader,
              render: ({ entity }) => <div>The name is {entity.name}</div>,
              spanPercent: 2 / 3
            }
          ]}
          selectedColumns={this.state.columnOrder}
          onColumnChange={this.handleColumnChange}
          onHeaderClick={this.handleHeaderClick}
        />
      </div>
    )
  }
}

export default IndexPage
