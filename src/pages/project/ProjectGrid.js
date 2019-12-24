import React, { useState, useEffect, useRef } from 'react'
import { useTransition, animated, config, interpolate } from 'react-spring'
import { Link, useLocation, useRouteMatch } from 'react-router-dom'

import { ProjectCard } from '/pages/project'
import useMedia from '/shared/useMedia'
import store from '/data/store'
import styles from './grid.scss'

const transitionConfig = {
  from: ({ xy, width, height }) => ({
    xy,
    width,
    height,
    opacity: 0,
    scale: 0
  }),
  enter: ({ xy, width, height }) => ({
    xy,
    width,
    height,
    opacity: 1,
    scale: 1
  }),
  update: ({ xy, width, height, isActive }) => {
    return isActive
      ? {
          xy: [0, 0],
          width: window.innerWidth,
          height: window.innerHeight * 0.6
        }
      : {
          xy,
          width,
          height,
          opacity: 1,
          scale: 1,
          zIndex: 2
        }
  },
  leave: {
    opacity: 0,
    scale: 0
  },
  trail: 100,
  config: config.gentle,
  unique: true
}

const Project = ({ item, ...props }) => {
  const { isActive } = item
  const style = {
    cursor: isActive ? 'default' : 'pointer'
  }
  const handleClick = e => {
    if (isActive) e.preventDefault()
  }

  return (
    <animated.div {...props}>
      <Link
        to={`/project/${item.id}`}
        style={style}
        disabled={item.isActive}
        onClick={handleClick}>
        <ProjectCard
          className={styles.project}
          id={item.id}
          disableHover={item.isActive}
        />
      </Link>
    </animated.div>
  )
}

const Container = React.forwardRef((props, ref) => (
  <animated.div className={styles.grid} {...props} ref={ref} />
))

const useRouteParams = route => {
  const match = useRouteMatch(route)

  if (match && match.params) return match.params

  const params = route.split(':').filter(parts => !parts.includes('/'))

  return params.map(param => ({
    [param]: null
  }))
}

const GridItem = ({ width, column, row, ...data }) => {
  const height = width * (3 / 4)
  const xy = [column * width, row * height]

  return Object.freeze({
    ...data,
    width,
    column,
    row,
    height,
    xy
  })
}

const updateGridLayout = (pageWidth, columns) => {
  const heights = new Array(columns).fill(0)

  return store.projects.map((data, i) => {
    const width = pageWidth / columns
    const column = heights.indexOf(Math.min(...heights))
    const row = Math.floor(i / columns)

    const item = GridItem({
      width,
      column,
      row,
      isActive: false,
      ...data
    })

    heights[column] += item.height

    return item
  })
}

/* eslint-disable max-lines-per-function, max-statements */
const ProjectGrid = ({ width: pageWidth, ...props }) => {
  const location = useLocation()
  const { id: activeItemId } = useRouteParams('/project/:id')
  const columns = useMedia(
    ['(min-width: 1500px)', '(min-width: 1000px)', '(min-width: 600px)'],
    [3, 2, 1],
    1
  )

  const gridRef = useRef(updateGridLayout(pageWidth, columns))
  const [items, setState] = useState(gridRef.current)

  const containerStyle = useRef({})

  useEffect(() => {
    gridRef.current = updateGridLayout(pageWidth, columns)

    const columnHeights = items.reduce(
      (cols, item) => {
        cols[item.column] += item.height

        return cols
      },
      [0, 0]
    )

    containerStyle.current = {
      position: 'fixed',
      top: 0,
      height: Math.max(...columnHeights)
    }
  }, [pageWidth, columns])

  useEffect(() => {
    if (activeItemId) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    const active =
      activeItemId && gridRef.current.find(item => item.id === activeItemId)

    setState(activeItemId ? [{ ...active, isActive: true }] : gridRef.current)
  }, [location.pathname])

  const transitions = useTransition(items, item => item.id, {
    ...transitionConfig
  })

  return (
    <Container {...props} style={containerStyle.current}>
      {transitions.map(({ item, key, props: { xy, scale, ...rest } } = {}) => {
        return (
          <Project
            key={key}
            item={item}
            className={styles.projectContainer}
            style={{
              transform: interpolate(
                [xy, scale],
                ([x, y], s) => `translate3d(${x}px, ${y}px, 0) scale(${s})`
              ),
              ...rest
            }}
          />
        )
      })}
    </Container>
  )
}

export default ProjectGrid
