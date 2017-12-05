// @flow

import React from 'react'
import GitHubButton from 'react-github-button'
import Helmet from 'react-helmet'
import { Container, Row, Col } from 'glamorous-grid'

// const Header = () => (

// )

const TemplateWrapper = ({ children }: any) => (
  <div style={{ width: '100%' }}>
    <Helmet
      title="Galahad"
      meta={[
        { name: 'description', content: 'A table, made with React' },
        { name: 'keywords', content: 'react, grid, table, columns' },
      ]}
    />

    {/* <Header /> */}

    <div style={{ width: '100%', display: 'flex', position: 'relative' }}>
      {children()}
    </div>
  </div>
)

export default TemplateWrapper
