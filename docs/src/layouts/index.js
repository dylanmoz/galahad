// @flow

import React from 'react'
import GitHubButton from 'react-github-button'
import Helmet from 'react-helmet'
import { Container, Row, Col } from 'glamorous-grid'

const Header = () => (
  <nav className="navbar">
    <Container style={{ height: '100%' }}>
      <Row alignItems="center" style={{ height: '100%' }}>
        <Col span={{ xs: 1, lg: 10/12, xl: 8/12 }} offset={{ xs: 0, lg: 1/12, xl: 2/12 }}>
          <Row>
            <Col>
              <code style={{ textTransform: 'lowercase' }}>REPO</code>
            </Col>
            <Col style={{ height: 20 }}>
              <GitHubButton
                style={{ float: 'right' }}
                type="stargazers"
                namespace="dylanmoz"
                repo="<repo>"
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  </nav>
)

const TemplateWrapper = ({ children }: any) => (
  <div>
    <Helmet
      title="glamorous-grid"
      meta={[
        { name: 'description', content: '<description>' },
        { name: 'keywords', content: '<tag1>, <tag2>' },
      ]}
    />

    <Header />

    <div style={{ marginTop: '6.5rem', width: '100%', display: 'flex', position: 'relative' }}>
      {children()}
    </div>
  </div>
)

export default TemplateWrapper
