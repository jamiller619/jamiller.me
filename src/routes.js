import React from 'react'
import { Home, About } from '/pages'

export const interpolator = ({ opacity, xy, ...props }) => {
  return {
    position: 'absolute',
    inset: 0,
    opacity,
    transform: xy.interpolate((x, y) => `translate3d(${x}vw, ${y}vh, 0px)`),
    ...props
  }
}

export const routes = [
  {
    key: 'home',
    path: ['/', '/project/:id'],
    renders: () => <Home />,
    transition: {
      from: {
        opacity: 0,
        xy: [0, 0],
        zIndex: 1
      },
      enter: {
        opacity: 1,
        xy: [0, 0],
        zIndex: 1
      },
      leave: {
        opacity: 0,
        xy: [0, 0],
        zIndex: 1
      }
    }
  },
  {
    key: 'about',
    path: '/about',
    renders: () => <About />,
    transition: {
      from: {
        opacity: 0,
        xy: [0, 100],
        zIndex: 2
      },
      enter: {
        opacity: 1,
        xy: [0, 0],
        zIndex: 2
      },
      leave: {
        opacity: 0,
        xy: [100, 0],
        zIndex: 2
      }
    }
  }
]
