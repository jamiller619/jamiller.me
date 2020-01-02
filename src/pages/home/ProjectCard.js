import React, { useRef, useEffect } from 'react'
import { animated, useSpring, interpolate } from 'react-spring'

import store from '/data/store'
import styled from '/tachyons/styled'
import useMemoRef from '/shared/useMemoRef'

const win = {
  scrollY: window.scrollY
}

window.addEventListener('scroll', () => {
  win.scrollY = window.scrollY
})

const springHoverState = {
  xyz: [0, 0, 80],
  scale: 0.96,
  rx: 34
}

const springRestState = {
  xyz: [0, 0, 0],
  scale: 1,
  rx: 22
}

const springPressState = {
  xyz: [0, 0, 120],
  scale: 0.92,
  rx: 100
}

const useHoverGestures = () => {
  const ref = useRef()
  const effectDamping = 50
  const offsetRef = useMemoRef(() => {
    return ref.current.getBoundingClientRect()
  }, [win])

  const [{ xyz, scale, rx }, set] = useSpring(() => ({
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
      scale: springHoverState.scale,
      rx: springHoverState.rx
    })
  }

  const bind = () => ({ ref })

  return {
    follow,
    reset,
    down,
    set,
    xyz,
    scale,
    rx,
    bind
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

const Backdrop = ({ style, ...props }) => {
  return (
    <svg
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        overflow: 'visible',
        position: 'absolute',
        inset: '0'
      }}>
      <animated.rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        style={{
          transformOrigin: 'center',
          ...style
        }}
        {...props}
      />
    </svg>
  )
  // return (
  //   <CoverImage
  //     {...props}
  //     style={{
  //       boxShadow: '0px 2px 40px #00000020, 0px 2px 5px #00000030',
  //       ...style
  //     }}
  //   />
  // )
}

/* eslint-disable max-lines-per-function, max-statements */
const ProjectCard = ({ id, disableHover, active, children, ...props } = {}) => {
  const data = getStoreData(id)

  const { follow, reset, down, xyz, scale, rx, set, bind } = useHoverGestures()
  const isDownRef = useRef(false)

  const onMouseMove = e => {
    if (!isDownRef.current) {
      follow(e)
    }
  }

  const onMouseLeave = () => {
    isDownRef.current = false
    reset()
  }

  const onPointerDown = () => {
    isDownRef.current = true
    down()
  }

  const onPointerUp = reset

  const pointerEvents = disableHover
    ? {}
    : { onMouseLeave, onMouseMove, onPointerDown, onPointerUp }

  const coverBackdropImageSrc =
    data.images &&
    data.images['cover-backdrop'] &&
    data.images['cover-backdrop'].jpg

  useEffect(() => {
    if (active) {
      set({ xyz: [0, 0, 0], scale: 0.5 })
    } else {
      reset()
    }
  }, [active])

  return (
    <Container {...bind()} {...pointerEvents} {...props}>
      {coverBackdropImageSrc && (
        <Backdrop
          src={coverBackdropImageSrc}
          style={{
            rx,
            transform: interpolate(
              [xyz, scale],
              ([x, y, z], s) =>
                `translate(${x / 3}px, ${active ? 0 : y}px) scale(${
                  active ? 1 : s
                })`
            )
          }}
        />
      )}
      <CoverImage
        style={{
          transform: interpolate(
            [xyz, scale],
            ([x, y, z], s) => `translate3d(${x}px, ${y}px, ${z}px) scale(${s})`
          )
        }}
        src={data.coverImage.src}
        alt={data.coverImage.alt}
      />
      {[children]}
    </Container>
  )
}

export default ProjectCard
