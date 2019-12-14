import React, { useState, useEffect, Fragment } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Route, useLocation } from 'react-router-dom'
import { CSSTransition } from 'react-transition-group'
import tachyons from '@jamr/tachyons.js'

import { Home, About } from '/pages'
import Header from '/header/Header'

import '/shared/global.scss'

const getPageStyle = isTransitioning => {
  if (isTransitioning) {
    const { scrollHeight: height } = document.body

    return {
      position: 'fixed',
      inset: 0,
      width: '100vw',
      pointerEvents: 'none',
      height
    }
  }

  return {}
}

const Page = ({ pageKey, path, renders, timeout = 2000, ...props }) => {
  const location = useLocation()
  const [isTransitioning, setState] = useState(null)
  const pageStyles = getPageStyle(isTransitioning)
  const Child = renders

  useEffect(() => {
    if (isTransitioning) {
      setTimeout(() => {
        setState(false)
      }, timeout)
    }
  }, [location.pathname])

  return (
    <Route key={pageKey} path={path} {...props}>
      {({ match }) => (
        <CSSTransition in={match != null} timeout={timeout} unmountOnExit>
          <div style={pageStyles}>
            <Child />
          </div>
        </CSSTransition>
      )}
    </Route>
  )
}

const PageContainer = () => {
  return (
    <Fragment>
      <Page pageKey="about" exact path="/about" renders={About} />
      <Page pageKey="home" path="/" renders={Home} />
    </Fragment>
  )
}

const App = () => {
  return (
    <Router>
      <Header />
      <PageContainer />
    </Router>
  )
}

document.body.className = tachyons('pl3-ns pr3-ns f4 f3-ns')

ReactDOM.render(<App />, document.getElementById('root'))
