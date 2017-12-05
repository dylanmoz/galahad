// @flow

import React from 'react'
import Link from 'gatsby-link'
import glamorous from 'glamorous'
import { Motion, spring } from 'react-motion'
import Headroom from 'react-headroom'
import GitHubButton from 'react-github-button'
import { Container, Row, Col } from 'glamorous-grid'
import Sticky from 'react-stickynode'
import { Link as ScrollLink, Element } from 'react-scroll'
import 'prismjs'
import 'prismjs/components/prism-jsx'
import { PrismCode } from 'react-prism'
import MdKeyboardArrowDown from 'react-icons/lib/md/keyboard-arrow-down'

import Card from '../Card'
import MainDemo, { code as mainDemoCode } from '../MainDemo'
import Delay from '../Delay'
import '../../../src/styles.scss'
import API from '../API'

const Code = props => <PrismCode component="pre" className="language-jsx" {...props} />

const SlideUp = ({ style, children }: any) => (
  <Delay initial={1} value={0} period={300}>
    {delayed => (
      <Motion
        defaultStyle={{ top: 20, opacity: 0 }}
        style={{
          top: spring(delayed * 20, { stiffness: 80, damping: 17 }),
          opacity: spring(delayed === 1 ? 0 : 1)
        }}
      >
        {({ top, opacity }) => (
          <div
            style={{
              ...style,
              position: 'relative',
              top,
              opacity
            }}
          >
            {children}
          </div>
        )}
      </Motion>
    )}
  </Delay>
)

// eslint-disable-next-line react/prefer-stateless-function
class IndexPage extends React.Component<any> {
  render() {
    return (
      <div style={{ width: '100%' }}>
        <div style={{ width: '100%', background: 'white' }}>
          <nav className="navbar">
            <Container style={{ height: '100%' }}>
              <Row alignItems="center" style={{ height: '100%' }}>
                <Col span={{ xs: 1, lg: 10/12, xl: 8/12 }} offset={{ xs: 0, lg: 1/12, xl: 2/12 }}>
                  <Row>
                    <Col>
                      Galahad
                    </Col>
                    <Col style={{ height: 20 }}>
                      <GitHubButton
                        style={{ float: 'right' }}
                        type="stargazers"
                        namespace="dylanmoz"
                        repo="galahad"
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Container>
          </nav>

          <Container>
            <Row
              alignItems="center"
              style={{ height: 'calc(100vh)' }}
            >
              <Col
                style={{ position: 'relative' }}
                span={{ xs: 1, lg: 10/12, xl: 8/12 }}
                offset={{ xs: 0, lg: 1/12, xl: 2/12 }}
              >
                {/* <h1 style={{ textAlign: 'center', marginBottom: 36 }}></h1> */}
                {/* <h5 style={{ textAlign: 'center', marginBottom: 36 }}>A table, made in React.</h5> */}
                <SlideUp style={{ borderRadius: '3px' }}>
                  <Card>
                    <MainDemo />
                  </Card>
                  <ScrollLink
                    smooth
                    to="maindemo-code"
                    offset={-100}
                    style={{
                      paddingTop: 36,
                      position: 'absolute',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      textAlign: 'center',
                      lineHeight: '16px',
                      color: 'rgba(25, 29, 34, 0.54)',
                      cursor: 'pointer'
                    }}
                  >
                    Learn More<br /><MdKeyboardArrowDown />
                  </ScrollLink>
                </SlideUp>
              </Col>
            </Row>
          </Container>
        </div>
        <div>
          <Element name="maindemo-code" />
          <Container>
            <Row>
              <Col
                span={{ xs: 1, lg: 10/12, xl: 10/12 }}
                offset={{ xs: 0, lg: 1/12, xl: 1/12 }}
              >
                <Row>
                  <Col span={1}>
                    <div style={{ marginBottom: 36 }}>
                      <h5>Install</h5>
                      <Code>{'yarn add galahad'}</Code>
                    </div>

                    <div style={{ marginBottom: 36 }}>
                      <h5>Code</h5>
                      <Code>{mainDemoCode}</Code>
                    </div>

                    <div style={{ marginBottom: 36 }}>
                      <h5>API</h5>
                      <API />
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    )
  }
}

export default IndexPage
