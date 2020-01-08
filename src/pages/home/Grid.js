import React, { useState, useEffect, useRef } from 'react'
import { useTransition } from 'react-spring'

const styles = {
  outer: {
    position: 'relative',
    width: '100%',
    height: '100%'
  },
  inner: {
    position: 'relative',
    width: '100%',
    minHeight: '100%'
  },
  item: {
    position: 'absolute',
    inset: 0
  }
}

const GridItem = ({ index, pageWidth, columns, heights, margin }) => {
  const width = pageWidth / columns
  const row = Math.floor(index / columns)
  const column = heights.indexOf(Math.min(...heights))
  const height = width * (3 / 4) - margin
  const x = column * (pageWidth / columns)
  const y = row * (width * (3 / 4))
  const xy = [x, y]

  return Object.freeze({
    width,
    height,
    xy,
    column,
    row
  })
}

// eslint-disable-next-line max-lines-per-function
const Grid = ({
  data,
  keys,
  open,
  deps,
  columns,
  margin,
  width,
  config,
  children,
  onTransitionComplete,
  onTransitionBegin,
  forwardRef,
  ...props
} = {}) => {
  const measureRef = useRef()
  const columnHeights = new Array(columns).fill(0)
  const gridItemsRef = useRef(
    data.map((item, index) => {
      const gridItem = GridItem({
        pageWidth: width,
        columns,
        heights: columnHeights,
        index,
        margin
      })

      columnHeights[gridItem.column] += gridItem.height + margin

      return {
        ...gridItem,
        ...item,
        key: keys(item)
      }
    })
  )

  const [{ items, gridHeight }, setState] = useState({
    gridHeight: 0,
    items: gridItemsRef.current
  })

  const animationCounterRef = useRef(0)
  const animationStartCounterRef = useRef(0)
  const transition = useTransition(items, keys, {
    ...config,
    onStart: () => {
      if (animationCounterRef.current === 0) {
        if (animationStartCounterRef.current === 0) {
          if (typeof onTransitionBegin === 'function') onTransitionBegin()
        }

        animationStartCounterRef.current += 1

        if (animationStartCounterRef.current === gridItemsRef.current.length) {
          animationStartCounterRef.current = 0
        }
      }
    },
    onRest: () => {
      animationCounterRef.current += 1

      if (animationCounterRef.current === gridItemsRef.current.length) {
        if (typeof onTransitionComplete === 'function') onTransitionComplete()
      }
    }
  })

  useEffect(() => {
    animationCounterRef.current = 0

    const {
      top: offsetTop,
      left: offsetLeft
    } = measureRef.current.getBoundingClientRect()

    const mapItem = item => {
      const isOpen = open(item) === true

      return {
        ...item,
        isOpen,
        offsetTop,
        offsetLeft
      }
    }

    setState({
      items: gridItemsRef.current.map(mapItem).filter(open),
      gridHeight: Math.max(...columnHeights)
    })
  }, deps)

  return (
    <div {...props} style={styles.outer} ref={forwardRef}>
      <div style={{ ...styles.inner, height: gridHeight }} ref={measureRef}>
        {transition.map(({ item, key, props: transitionProps }) =>
          children({
            item,
            key,
            props: { ...transitionProps, ...styles.item }
          })
        )}
      </div>
    </div>
  )
}

export default React.forwardRef((props, ref) => (
  <Grid forwardRef={ref} {...props} />
))
