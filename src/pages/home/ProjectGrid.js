import React, { useState, useEffect, useRef } from 'react'
import {
  useTransition,
  useSpring,
  animated,
  interpolate,
  config
} from 'react-spring'
import { Link, useLocation } from 'react-router-dom'
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'

import ProjectCard from './ProjectCard'
import useMedia from '/shared/useMedia'
import useMeasure from '/shared/useMeasure'
import useRouteParams from '/shared/useRouteParams'
import store from '/data/store'
import { classNames } from '/shared/utils'
import styles from './ProjectGrid.scss'

const transitionConfig = {
  unique: true,
  trail: 50,
  config: config.gentle,
  // config: {
  //   tension: 200,
  //   friction: 20
  // },
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
    if (isActive) {
      return {
        xy: [0, window.scrollY],
        width: window.innerWidth - 32
      }
    }

    return { xy, width, height }
  },
  leave: {
    opacity: 0,
    scale: 0
  }
}

const Project = ({ item, active, children, ...props }) => {
  const handleClick = e => {
    if (active) e.preventDefault()
  }

  return (
    <animated.div
      {...props}
      {...classNames(styles.project, active && styles.active)}>
      <Link
        to={`/project/${item.id}`}
        disabled={item.isActive}
        onClick={handleClick}>
        <ProjectCard
          id={item.id}
          disableHover={item.isActive}
          active={active}
        />
      </Link>
      {[children]}
    </animated.div>
  )
}

const Grid = React.forwardRef((props, ref) => (
  <animated.div className={styles.grid} {...props} ref={ref} />
))

const GridDataItem = ({
  pageWidth,
  columns,
  heights,
  top,
  data,
  index,
  isActive
}) => {
  const padding = 16
  const width = pageWidth / columns - padding
  const row = Math.floor(index / columns)
  const column = heights.indexOf(Math.min(...heights))
  const height = width * (3 / 4) - padding
  const x = column * (pageWidth / columns) + padding / 2
  const y = row * (width * (3 / 4)) + padding / 2
  const xy = [x, y]

  return Object.freeze({
    width,
    height,
    xy,
    column,
    row,
    isActive,
    offsetTop: top,
    ...data
  })
}

const updateGridLayout = ({ pageWidth, columns, top, isActive }) => {
  const heights = new Array(columns).fill(0)

  return store.projects.map((data, index) => {
    const item = GridDataItem({
      pageWidth,
      columns,
      heights,
      top,
      data,
      index,
      isActive
    })

    heights[item.column] += item.height

    return item
  })
}

const useGridLayout = ({ isActive, pageWidth, columns, top }, deps) => {
  const gridItemsRef = useRef(
    updateGridLayout({ isActive, pageWidth, columns, top })
  )

  const [{ gridHeight, items }, setState] = useState({
    items: gridItemsRef.current,
    gridHeight: 0
  })

  useEffect(() => {
    if (isActive) {
      // containerHeightRef.current = 1700
      // containerHeight.current = height
    } else {
      gridItemsRef.current = updateGridLayout({
        isActive,
        pageWidth,
        columns,
        top
      })

      const columnHeights = items.reduce(
        (cols, item) => {
          cols[item.column] += item.height

          return cols
        },
        [0, 0]
      )

      setState(prev => ({
        ...prev,
        gridHeight: Math.max(...columnHeights) + 100
      }))
    }
  }, [pageWidth, columns, ...deps])

  return [
    gridItemsRef,
    {
      gridHeight,
      items
    },
    setState
  ]
}

const useTransitionWithComplete = (
  items,
  assignKey,
  config,
  completeHandler,
  effectDeps = []
) => {
  const animatedCounter = useRef(0)
  const totalAnimations = items.length
  const handleRest = () => {
    animatedCounter.current += 1

    if (animatedCounter.current === totalAnimations) {
      if (typeof completeHandler === 'function') completeHandler()
    }
  }

  const transitions = useTransition(items, assignKey, {
    ...config,
    onRest: handleRest
  })

  useEffect(() => {
    console.log(animatedCounter.current)
    animatedCounter.current = 0
  }, effectDeps)

  return transitions
}

/* eslint-disable max-lines-per-function, max-statements */
const ProjectGrid = ({ width: pageWidth, top, children, ...props }) => {
  const location = useLocation()
  const { id: activeItemId } = useRouteParams('/project/:id')
  const isActive = activeItemId != null
  const windowPositionY = useRef(0)
  const gridRef = useRef()
  const [projectMeasureRef, { height }] = useMeasure()
  const columns = useMedia(
    ['(min-width: 1400px)', '(min-width: 1000px)', '(min-width: 600px)'],
    [3, 2, 1],
    1
  )

  const [gridItemsRef, { gridHeight, items }, setState] = useGridLayout(
    {
      isActive,
      pageWidth,
      columns,
      top
    },
    [location.pathname]
  )

  const [containerSpring, setContainerSpring] = useSpring(() => ({
    height: window.innerHeight,
    // config: config.gentle,
    config: {
      duration: 100
    }
  }))

  useEffect(() => {
    const activePage =
      isActive && gridItemsRef.current.find(item => item.id === activeItemId)

    setState(prev => ({
      ...prev,
      items: activePage
        ? [{ ...activePage, isActive: true }]
        : gridItemsRef.current
    }))

    disableBodyScroll()

    if (activePage) {
      windowPositionY.current = window.scrollY
      setContainerSpring({ height: height - window.innerHeight })
    } else {
      window.requestAnimationFrame(() => {
        setContainerSpring({ height: gridHeight })

        window.scrollTo({
          top: windowPositionY.current,
          left: 0,
          behavior: 'smooth'
        })

        if (gridRef.current) {
          for (const child of gridRef.current.childNodes) {
            // child.style.top = 0
          }
        }
      })
    }
  }, [location.pathname])

  const handleTransitionComplete = () => {
    // debugger
    const delay = 500

    window.requestAnimationFrame(() => {
      if (isActive) {
        const activeProject = gridRef.current.firstChild
        const activeProjectContent = activeProject.lastChild

        setTimeout(() => {
          // gridRef.current.style.top = `${-window.scrollY}px`

          window.scroll(0, 0)

          enableBodyScroll()
        }, delay)

        if (activeProjectContent && activeProjectContent.isConnected) {
        }
      } else {
        // gridRef.current.style.top = top

        setTimeout(() => {
          enableBodyScroll()
        }, delay)
      }
    })
  }

  const transitions = useTransitionWithComplete(
    items,
    item => item.id,
    transitionConfig,
    handleTransitionComplete,
    [location.pathname]
  )

  const gridSpring = useSpring({
    top: isActive ? 0 : top,
    reset: true,
    // config: config.gentle
    onRest() {
      if (isActive) {
        gridRef.current.style.top = `${-window.scrollY}px`
      }
    },
    config: {
      duration: 100
    }
  })

  return (
    <animated.div style={containerSpring} {...props}>
      <Grid style={gridSpring} ref={gridRef}>
        {transitions.map(
          ({
            item,
            key,
            props: { xy, scale, minHeight, height: springHeight, ...rest }
          } = {}) => {
            const isProjectActive = activeItemId === item.id

            return (
              <Project
                key={key}
                item={item}
                active={isProjectActive}
                style={{
                  transform: interpolate(
                    [xy, scale],
                    ([x, y], s) => `translate3d(${x}px, ${y}px, 0) scale(${s})`
                  ),
                  minHeight: isProjectActive ? minHeight : 'auto',
                  height: isProjectActive ? '100%' : springHeight,
                  ...rest
                }}>
                <div ref={projectMeasureRef}>{[children]}</div>
              </Project>
            )
          }
        )}
      </Grid>
    </animated.div>
  )
}

export default ProjectGrid
