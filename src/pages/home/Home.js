import React, { Fragment, useRef, useEffect, useState } from 'react'
import { animated, interpolate, useSpring } from 'react-spring'
import { Link } from 'react-router-dom'
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'

import store from '/data/store'
import Hero from './Hero'
import Grid from './Grid'
import ProjectCard from './ProjectCard'
import ProjectContent from '/pages/Project'
import Footer from '/footer/Footer'

import useMedia from '/shared/useMedia'
import useRouteParams from '/shared/useRouteParams'
import { classNames } from '/shared/utils'
import styles from './Home.scss'

if (window.history.scrollRestoration) {
  window.history.scrollRestoration = 'manual'
}

const rand = (min, max) => Math.random() * (max - min) + min

const generateRandomRotate = () => [
  rand(-2, 2),
  rand(-2, 2),
  rand(-2, 2),
  rand(-80, 80)
]

// eslint-disable-next-line max-lines-per-function
const transitionConfig = ({ margin, navbarHeight }) => ({
  unique: true,
  trail: 25,
  config: {
    mass: 5,
    tension: 500,
    friction: 100
  },
  from: ({ xy, width, height }) => ({
    xy,
    width,
    height,
    opacity: 0,
    scale: 0,
    rotate: generateRandomRotate(),
    zIndex: 1
  }),
  update: ({ xy, width, height, isOpen, offsetTop }) => {
    return {
      xy: isOpen ? [0, -offsetTop - margin - navbarHeight] : xy,
      width: isOpen ? window.innerWidth : width,
      height: isOpen ? window.innerHeight : height,
      opacity: 1,
      scale: 1,
      rotate: [0, 0, 0, 0],
      zIndex: isOpen ? 2 : 1
    }
  },
  enter: ({ xy, width, height }) => {
    return {
      xy,
      width,
      height,
      opacity: 1,
      scale: 1,
      rotate: [0, 0, 0, 0]
    }
  },
  leave: () => ({
    opacity: 0,
    scale: 0,
    rotate: generateRandomRotate()
  })
})

const contentStyle = {
  position: 'relative',
  top: '-50vh'
}

const contentStartStyle = {
  y: 100,
  opacity: 0
}

const contentRestStyle = {
  y: 0,
  opacity: 1
}

const remove = (arr, item) => arr.filter(i => i !== item)

const Project = ({ item, open, children, ...props }) => {
  const [classList, setClassList] = useState([])
  const removeDisabled = () =>
    setClassList(prev => remove(prev, styles.disabled))

  useEffect(() => {
    let timeout = null

    if (open === false) {
      timeout = setTimeout(removeDisabled, 1000)
    }

    setClassList([styles.projectLink, styles.disabled, open && styles.open])

    return () => clearTimeout(timeout)
  }, [open])

  return (
    <animated.div {...props}>
      <Link
        to={`/project/${item.id}`}
        aria-disabled={open}
        {...classNames(classList)}>
        <ProjectCard id={item.id} open={open} />
      </Link>
      {[children]}
    </animated.div>
  )
}

/* eslint-disable max-lines-per-function, max-statements */
const Home = () => {
  const { id: projectId } = useRouteParams('/project/:id')
  const isOpen = projectId != null
  const margin = 16
  const navbarHeight = 100
  const gridRef = useRef()
  const scrollRef = useRef()
  const contentRef = useRef()
  const columns = useMedia(
    ['(min-width: 1400px)', '(min-width: 1000px)', '(min-width: 600px)'],
    [3, 2, 1],
    1
  )

  const handleContentRest = () => {
    const innerGridStyle = gridRef.current.firstChild.style

    if (contentRef.current) {
      const { height } = contentRef.current.getBoundingClientRect()

      innerGridStyle.minHeight = `${height + navbarHeight + margin * 2}px`
    } else {
      innerGridStyle.minHeight = '100%'
    }
  }

  const [contentSpring, setContentSpring] = useSpring(() => {
    return {
      ...contentStartStyle,
      onRest: handleContentRest
    }
  })

  const handleTransitionBegin = () => {
    window.requestAnimationFrame(() => {
      disableBodyScroll()

      if (!isOpen && gridRef.current) {
        gridRef.current.style.top = null
        window.scroll(0, scrollRef.current)

        setContentSpring(contentStartStyle)
      }
    })
  }

  const handleTransitionComplete = () => {
    window.requestAnimationFrame(() => {
      enableBodyScroll()

      if (isOpen) {
        scrollRef.current = window.scrollY
        gridRef.current.style.top = `-${scrollRef.current}px`
        window.scroll(0, 0)

        setContentSpring(contentRestStyle)
      }
    })
  }

  return (
    <Fragment>
      <Hero show={!isOpen} />
      <Grid
        ref={gridRef}
        data={store.projects}
        columns={columns}
        margin={margin}
        width={window.innerWidth}
        keys={item => item.id}
        open={item => (isOpen ? projectId === item.id : item)}
        deps={[location.pathname]}
        config={transitionConfig({ margin, navbarHeight })}
        onTransitionBegin={handleTransitionBegin}
        onTransitionComplete={handleTransitionComplete}>
        {({ item, key, props: { xy, scale, rotate, ...rest } } = {}) => {
          const isProjectOpen = isOpen && projectId === item.id
          const projectTransform = interpolate(
            [xy, scale, rotate],
            ([x, y], s, [rx, ry, rz, rd]) =>
              `translate3d(${x}px, ${y}px, 0) scale(${s}) rotate3d(${rx}, ${ry}, ${rz}, ${rd}deg)`
          )
          const contentTransform = contentSpring.y.interpolate(
            y => `translate3d(0, ${y}px, 0)`
          )

          return (
            <Project
              key={key}
              item={item}
              open={isProjectOpen}
              style={{
                ...rest,
                transform: projectTransform
              }}>
              {isProjectOpen && (
                <animated.div
                  ref={contentRef}
                  style={{
                    ...contentStyle,
                    opacity: contentSpring.opacity,
                    transform: contentTransform
                  }}>
                  <ProjectContent id={item.id} />
                </animated.div>
              )}
            </Project>
          )
        }}
      </Grid>
      <Footer />
    </Fragment>
  )
}

export default () => <Home />
