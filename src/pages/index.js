import React from 'react'
import AsyncPage from '/async-page/AsyncPage'

const Home = props => (
  <AsyncPage {...props} renders={() => import('./home/Home')} />
)

const About = props => (
  <AsyncPage {...props} renders={() => import('./about/About')} />
)

export { Home, About }
