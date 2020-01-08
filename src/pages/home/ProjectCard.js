import React, { useRef, useEffect, Fragment } from 'react'
import { animated, useSpring, interpolate } from 'react-spring'
import { Curtains } from 'curtainsjs'

import store from '/data/store'
import styled from '/tachyons/styled'
import useMemoRef from '/shared/useMemoRef'
import colors from '/shared/colors.scss'

const win = {
  scrollY: window.scrollY
}

window.addEventListener('scroll', () => {
  win.scrollY = window.scrollY
})

const springHoverState = {
  xyz: [0, 0, 80],
  scale: 0.96
}

const springRestState = {
  xyz: [0, 0, 0],
  scale: 1
}

const springPressState = {
  xyz: [0, 0, 120],
  scale: 0.92
}

const useHoverGestures = userRef => {
  const ref = userRef || useRef()
  const effectDamping = 50
  const offsetRef = useMemoRef(() => {
    return ref.current && ref.current.getBoundingClientRect()
  }, [win])

  const [{ xyz, scale }, set] = useSpring(() => ({
    ...springRestState,
    config: {
      tension: 300,
      friction: 19
    }
  }))

  const reset = () => set({ ...springRestState })

  const down = () => set({ ...springPressState })

  const follow = e => {
    const mx = offsetRef.current.x + offsetRef.current.width / 2
    const my = offsetRef.current.y + offsetRef.current.height / 2
    const x = (mx - e.clientX) / effectDamping
    const y = (my - e.clientY) / effectDamping

    set({
      xyz: [x, y, springHoverState.xyz[2]],
      scale: springHoverState.scale
    })
  }

  return {
    follow,
    reset,
    down,
    set,
    xyz,
    scale,
    ref
  }
}

const getStoreData = id => {
  const match = store.projects.filter(data => data.id === id)

  if (match && match.length === 1) {
    return match[0]
  }

  throw Error(`Store data not found for project "${id}"`)
}

const Container = styled(animated.span, 'db')

const CoverImage = styled(animated.img, 'db center absolute absolute--fill-m')

// eslint-disable-next-line max-lines-per-function
const Curtain = ({ children, ...props }) => {
  const containerRef = useRef()
  const style = {
    position: 'relative',
    width: '100%',
    height: '100%'
  }

  const setup = () => {
    const [curtainElement, planeElement] = Array.from(
      containerRef.current.childNodes
    )

    const curtains = new Curtains({
      container: curtainElement
    })

    const params = {
      vertexShaderID: 'plane-vs',
      fragmentShaderID: 'plane-fs',
      uniforms: {
        time: {
          name: 'uTime',
          type: '1f',
          value: 0
        }
      }
    }

    const plane = curtains.addPlane(planeElement, params)

    if (plane) {
      console.log(plane)
      plane.onRender(() => (plane.uniforms.time.value += 1))
    }
  }

  useEffect(() => {
    setTimeout(setup, 1500)
  }, [])

  return (
    <div ref={containerRef} {...props} style={style}>
      <div style={style} />
      <div style={{ display: 'none' }}>{[children]}</div>
    </div>
  )
}

// eslint-disable-next-line max-lines-per-function
const Backdrop = ({
  id,
  gradient: { stops, ...gradientProps },
  style,
  open,
  ...props
}) => {
  const fillId = `${id}-backdrop`
  const maskId = `${id}-mask`

  const { rx, opacity } = useSpring({
    opacity: open ? 1 : 0,
    rx: open ? 0 : 5
  })

  return (
    <Fragment>
      <svg
        viewBox="0 0 100 75"
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          overflow: 'visible',
          position: 'absolute',
          inset: '0'
        }}>
        <defs>
          <linearGradient id={maskId} x1="0.5" y1="1" x2="0.5" y2="0">
            <stop offset="0" stopOpacity="1" stopColor={colors.black} />
            <stop offset="40" stopOpacity="0.5" stopColor={colors.black} />
            <stop offset="90" stopOpacity="0" stopColor={colors.black} />
          </linearGradient>
          <linearGradient id={fillId} {...gradientProps}>
            {stops.map((stopProps, i) => (
              <stop key={i} {...stopProps} />
            ))}
          </linearGradient>
        </defs>
        <animated.rect
          x="0"
          y="0"
          width="100"
          height="75"
          rx={rx}
          fill={`url(#${fillId})`}
          style={{
            transformOrigin: 'center',
            ...style
          }}
          {...props}
        />
        <animated.rect
          x="0"
          y="0"
          width="100"
          height="75"
          fill={`url(#${maskId})`}
          style={{ opacity }}
        />
      </svg>
    </Fragment>
  )
}

/* eslint-disable max-lines-per-function, max-statements */
const ProjectCard = ({ id, open, children, ...props } = {}) => {
  const data = getStoreData(id)

  const { follow, reset, down, xyz, scale, ref } = useHoverGestures()

  const pointerEvents = {
    onMouseLeave: reset,
    onMouseMove: follow,
    onPointerDown: down,
    onPointerUp: reset
  }

  return (
    <Container ref={ref} {...pointerEvents} {...props}>
      <Backdrop
        id={id}
        gradient={data.gradient}
        src={data.coverBackdrop}
        open={open}
        style={{
          transform: interpolate(
            [xyz, scale],
            ([x, y], s) =>
              `translate(${x / 2}px, ${open ? 0 : y / 2}px) scale(${
                open ? 1 : s
              })`
          )
        }}
      />
      {/* <Curtain open={open}> */}
      <CoverImage
        style={{
          transform: interpolate(
            [xyz, scale],
            ([x, y, z], s) =>
              `translate3d(${x}px, ${y}px, ${z}px) scale(${s * 0.8})`
          )
        }}
        src={data.coverImage.src}
        alt={data.coverImage.alt}
      />
      {/* </Curtain> */}
      {[children]}
    </Container>
  )
}

export default ProjectCard
