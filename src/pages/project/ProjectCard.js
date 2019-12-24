import React, { useRef } from 'react'
import { animated, useSpring } from 'react-spring'

import store from '/data/store'
import styled from '/tachyons/styled'
import useMemoRef from '/shared/useMemoRef'

const win = {
  scrollY: window.scrollY
}

window.addEventListener('scroll', () => {
  win.scrollY = window.scrollY
})

const useHoverGestures = ref => {
  const effectDamping = 75
  const offsetRef = useMemoRef(() => {
    return ref.current.getBoundingClientRect()
  }, [win])

  const [{ xyzs }, set] = useSpring(() => ({
    xyzs: [0, 0, 0, 1],
    config: {
      tension: 300,
      friction: 19
    }
  }))

  const reset = () => set({ xyzs: [0, 0, 0, 1] })
  const leave = () => {
    set({ xyzs: [0, 0, 0, 0.8] })

    setTimeout(reset, 900)
  }

  const onMouseMove = e => {
    const mx = offsetRef.current.x + offsetRef.current.width / 2
    const my = offsetRef.current.y + offsetRef.current.height / 2
    const x = (mx - e.clientX) / effectDamping
    const y = (my - e.clientY) / effectDamping

    set({ xyzs: [x, y, 120, 1] })
  }

  return {
    onMouseMove,
    onMouseLeave: reset,
    reset,
    xyzs,
    leave
  }
}

const getStoreData = id => {
  const match = store.projects.filter(data => data.id === id)

  if (match && match.length === 1) {
    return match[0]
  }

  throw Error(`Store data not found for project "${id}"`)
}

const Container = styled(animated.div, 'br2', {
  style: {
    perspective: 1000
  }
})

const CoverImage = styled(animated.img, 'db center')

const CoverImageBackdrop = ({ style, ...props }) => {
  return (
    <animated.img
      {...props}
      style={{
        position: 'absolute',
        inset: '0',
        minHeight: '100%',
        minWidth: '100%',
        maxHeight: '100%',
        borderRadius: '0.5rem',
        boxShadow: '0px 2px 40px #00000020, 0px 2px 5px #00000030',
        ...style
      }}
    />
  )
}

const ProjectCard = ({ id, disableHover, children, ...props } = {}) => {
  const data = getStoreData(id)
  const ref = useRef()

  const { onMouseMove, onMouseLeave, xyzs, leave } = useHoverGestures(ref)

  const pointerEvents = disableHover
    ? {}
    : {
        onMouseLeave,
        onMouseMove
      }

  const coverBackdropImageSrc =
    data.images &&
    data.images['cover-backdrop'] &&
    data.images['cover-backdrop'].jpg

  return (
    <Container forwardRef={ref} {...pointerEvents} {...props}>
      {coverBackdropImageSrc && (
        <CoverImageBackdrop
          src={coverBackdropImageSrc}
          style={{
            transform: xyzs.interpolate(
              (x, y) => `translate(${x / 3}px, ${y / 3}px)`
            )
          }}
        />
      )}
      <CoverImage
        style={{
          transform: xyzs.interpolate(
            (x, y, z, scale) =>
              `translate3d(${x}px, ${y}px, ${z}px) scale(${scale})`
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
