import React from 'react'
import AsyncPage from '/async-page/AsyncPage'

export const Home = props => (
  <AsyncPage {...props} renders={() => import('./home/Home')} />
)
export const About = props => (
  <AsyncPage {...props} renders={() => import('./about/About')} />
)
