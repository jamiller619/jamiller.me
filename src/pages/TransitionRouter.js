import React from 'react'
import { useLocation, matchPath } from 'react-router-dom'
import { animated, useTransition } from 'react-spring'
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'

const useRoute = routes => {
  const { pathname } = useLocation()

  return routes.filter(route =>
    matchPath(pathname, { path: route.path, exact: true })
  )
}

const TransitionRouter = ({
  routes,
  interpolator,
  onRest,
  onStart,
  ...config
}) => {
  const handleRest = (...args) => {
    enableBodyScroll()

    if (typeof onRest === 'function') {
      onRest(...args)
    }
  }

  const handleStart = (...args) => {
    disableBodyScroll()

    if (typeof onStart === 'function') {
      onStart(...args)
    }
  }

  const transitions = useTransition(useRoute(routes), item => item.key, {
    unique: true,
    ...config,
    from: ({ transition: { from } }) => from,
    enter: ({ transition: { enter } }) => enter,
    leave: ({ transition: { leave } }) => leave,
    update: ({ transition: { enter } }) => enter,
    onRest: handleRest,
    onStart: handleStart
  })

  return transitions.map(({ item, key, props }) => {
    return (
      <animated.div key={key} style={interpolator(props)}>
        {item.renders()}
      </animated.div>
    )
  })
}

export default TransitionRouter
