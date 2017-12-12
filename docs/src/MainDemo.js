// @flow

import React from 'react'
import { capitalize } from 'lodash'

import Galahad from '../../src'
import Table from './Table'

const Image = ({ url }) => (
  <div style={{ display: 'flex', height: '100%', alignItems: 'center' }}>
    <img src={url} style={{ height: '36px' }} alt="banner" />
  </div>
)

const renderHeader = ({ self }) => <h6>{capitalize(self.id)}</h6>
const simpleRender = ({ entity, self }) => <div style={{ padding: '18px 0' }}>{entity[self.id]}</div>

const definitions = [
  {
    id: 'house',
    renderHeader,
    render: simpleRender,
    spanPercent: 2/5
  },
  {
    id: 'region',
    renderHeader,
    render: simpleRender,
    spanPercent: 2/5
  },
  {
    id: 'capital',
    renderHeader,
    render: simpleRender,
    spanPercent: 2/5
  },
  {
    id: 'banner',
    renderHeader,
    render: ({ entity }) => <Image url={entity.banner} />,
    spanPercent: 2/5,
    noSort: true
  }
]

const data = [
  { house: 'Arryn', region: 'Vale of Arryn', capital: 'Eyrie', banner: 'https://vignette.wikia.nocookie.net/gameofthrones/images/6/62/House-Arryn-Square.PNG/revision/latest/scale-to-width-down/185?cb=20170512000629' },
  { house: 'Frey', region: 'The Riverlands', capital: 'Riverrun', banner: 'https://vignette.wikia.nocookie.net/gameofthrones/images/8/8b/House-Frey-heraldry.jpg/revision/latest/scale-to-width-down/185?cb=20140402112515' },
  { house: 'Greyjoy', region: 'The Iron Islands', capital: 'Pyke', banner: 'https://vignette.wikia.nocookie.net/gameofthrones/images/c/c0/House-Greyjoy-heraldry.jpg/revision/latest/scale-to-width-down/185?cb=20140402113620' },
  { house: 'Lannister', region: 'Westerlands', capital: 'Casterly Rock', banner: 'https://vignette.wikia.nocookie.net/gameofthrones/images/0/0b/House-Lannister-heraldry.jpg/revision/latest/scale-to-width-down/185?cb=20140402110342' },
  { house: 'Stark', region: 'The North', capital: 'Winterfell', banner: 'https://vignette.wikia.nocookie.net/gameofthrones/images/8/8a/House-Stark-Main-Shield.PNG/revision/latest/scale-to-width-down/154?cb=20170101103142' },
  { house: 'Targaryen', region: 'Crownlands', capital: 'Dragonstone', banner: 'https://vignette.wikia.nocookie.net/gameofthrones/images/1/16/House-Targaryen-heraldry.jpg/revision/latest/scale-to-width-down/185?cb=20151004105028' }
]

// eslint-disable-next-line
export default class MainDemo extends React.Component<any> {
  render() {
    return (
      <Table
        columns={definitions}
        data={data}
      />
    )
  }
}

export const code = `
import Galahad from 'galahad'

const data = [
  { house: 'Arryn', region: 'Vale of Arryn', capital: 'Eyrie', banner: '...' },
  { house: 'Frey', region: 'The Riverlands', capital: 'Riverrun', banner: '...' },
  { house: 'Greyjoy', region: 'The Iron Islands', capital: 'Pyke', banner: '...' },
  { house: 'Lannister', region: 'Westerlands', capital: 'Casterly Rock', banner: '...' },
  { house: 'Stark', region: 'The North', capital: 'Winterfell', banner: '...' },
  { house: 'Targaryen', region: 'Crownlands', capital: 'Dragonstone', banner: '...' }
]

const definitions = [
  {
    id: 'house',
    renderHeader: ({ self }) => _.uppercase(self.id),
    render: ({ entity, self }) => entity[self.id],
    spanPercent: 1/4
  },
  { id: 'region', renderHeader: ..., render: ..., spanPercent: 1/4 },
  { id: 'capital', renderHeader: ..., render: ..., spanPercent: 1/4 },
  {
    id: 'banner',
    renderHeader: ...,
    render: ({ entity }) => <Image url={entity.banner} />,
    spanPercent: 1/4,
    noSort: true
  }
]

class Demo extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      sortBy: { field: 'house', order: 'ASC' },
      columnOrder: ['house', 'region', 'capital', 'banner']
    }
  }

  handleColumnChange = (columnOrder) => {
    this.setState({ columnOrder })
  }

  handleHeaderClick = (column) => {
    const { sortBy } = this.state

    this.setState({
      sortBy: {
        field: column.id,
        order: column.id === sortBy.field && sortBy.order === 'ASC' ? 'DESC' : 'ASC'
      }
    })
  }

  render() {
    const { sortBy } = this.state
    const sortedData = data.sort(
      (a, b) => (a[sortBy.field] < b[sortBy.field] ^ sortBy.order === 'ASC') === 0 ? -1 : 1)
    )

    return (
      <Galahad
        loading={false}
        numLoadingRows={5}
        tableData={sortedData}
        columns={definitions}
        selectedColumns={this.state.columnOrder}
        onColumnChange={this.handleColumnChange}
        onHeaderClick={this.handleHeaderClick}
      />
    )
  }
}
`
