import React, { useRef } from 'react'
import { Route, Switch, useLocation } from 'react-router-dom'
import { animated, useTransition } from 'react-spring'

import { Home, About } from './'

const aboutTransition = {
  from: {
    zIndex: 2,
    transform: 'translate3d(0%, 100%, 0px)'
  },
  enter: {
    zIndex: 2,
    transform: 'translate3d(0%, 0%, 0px)'
  },
  leave: {
    zIndex: 2,
    transform: 'translate3d(100%, 0%, 0px)'
  }
}

const homeTransition = (isEntering, otherLocation) => {
  const fromAboutPage = otherLocation && otherLocation.pathname === '/about'

  return {
    from: fromAboutPage
      ? {
          zIndex: 1,
          opacity: 0,
          transform: 'translate3d(-5%, 0%, 0px)'
        }
      : {
          opacity: 0
        },
    enter: fromAboutPage
      ? {
          zIndex: 1,
          opacity: 1,
          transform: 'translate3d(0%, 0%, 0px)'
        }
      : {
          opacity: 1
        },
    leave: fromAboutPage
      ? {
          zIndex: 1,
          opacity: 0,
          transform: 'translate3d(0%, 0%, -100px)'
        }
      : {
          opacity: 0
        }
  }
}

const getTransitionProps = (nextLocation, lastLocation) => {
  return {
    from:
      nextLocation.pathname === '/about'
        ? aboutTransition.from
        : homeTransition(true, lastLocation).from,
    enter:
      nextLocation.pathname === '/about'
        ? aboutTransition.enter
        : homeTransition(true, lastLocation).enter,
    leave:
      lastLocation && lastLocation.pathname === '/about'
        ? aboutTransition.leave
        : homeTransition(false, nextLocation).leave
  }
}

const TransitionContainer = () => {
  const location = useLocation()
  const lastLocation = useRef(null)

  const handleTransitionEnd = () => {
    lastLocation.current = location
  }

  const transitions = useTransition(location, null, {
    ...getTransitionProps(location, lastLocation),
    unique: true,
    reset: true,
    onRest: handleTransitionEnd
  })

  return transitions.map(({ item, key, props, state }) => {
    console.log('TransitionContainer state changed: ', state)

    return (
      <animated.div id="transition" key={key} style={props}>
        <Switch location={item}>
          <Route key="about" path="/about">
            <About />
          </Route>
          <Route key="home" path={['/', '/project/:id']}>
            <Home />
          </Route>
        </Switch>
      </animated.div>
    )
  })
}

export default TransitionContainer
