import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import Header from '/header/Header'
import TransitionContainer from '/pages/TransitionContainer'
import tachyons from '@jamr/tachyons.js'
import '/shared/global.scss'

const App = () => {
  return (
    <Router>
      <Header />
      <TransitionContainer />
    </Router>
  )
}

const bodyClassNames = 'pl3-ns pr3-ns f4 f3-ns'

document.body.className = tachyons(bodyClassNames)

ReactDOM.render(<App />, document.getElementById('root'))
