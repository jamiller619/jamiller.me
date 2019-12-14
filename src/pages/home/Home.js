import React, { useRef, useState, useEffect } from 'react'
import { useDrag, useGesture } from 'react-use-gesture'
import { animated, useSpring } from 'react-spring'
import { Link, useLocation } from 'react-router-dom'

import { useTransition } from '/transition/TransitionGroup'
import anime from '/anime'
import useMemoRef from '/shared/useMemoRef'
import styled from '/tachyons/styled'
import { easyEase } from '/shared/easing'

import Hero from './Hero'
import Footer from '/footer/Footer'
import store from '/data/store'
import styles from './home.scss'
import colors from '/shared/colors.scss'

const CoverImage = styled(animated.img, 'db center')
const ProjectsContainer = styled('div', 'ph0-ns', {
  className: styles.gallery
})

const ProjectLink = styled(animated(Link), 'db no-underline relative ma3 br2')

const BackdropGradient = ({ stops = [], rotate = 90, ...props }) => {
  return (
    <linearGradient {...props} gradientTransform={`rotate(${rotate})`}>
      {stops.map((props, i) => (
        <stop key={`${i}-${props.id}`} {...props} />
      ))}
    </linearGradient>
  )
}

const usePress = targets => {
  const t = useRef()
  const defs = {
    targets: targets.current,
    easing: 'easeOutElastic(2, 0.7)'
  }

  const handler = ({ down, first, last }) => {
    const tl = anime.timeline()
    const min = 0.96
    const half = (1 - min) / 3 + min

    if (down && first) {
      t.current = Date.now()
      anime({
        ...defs,
        scale: min
      })
    } else if (!down && last) {
      const tt = Date.now() - t.current
      const duration = ((1 - tt / 1000) * 1000) / 3 / 2

      if (duration > 130) {
        tl.add({
          ...defs,
          scale: half,
          easing: 'easeOutQuad',
          duration
        })
      }

      tl.add({
        ...defs,
        scale: 1
      })
    }
  }

  return useDrag(handler, {
    domTarget: targets.current
  })
}

const win = {
  scrollY: window.scrollY
}

window.addEventListener('scroll', () => {
  win.scrollY = window.scrollY
})

const useHoverGestures = ref => {
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
    const effectDamping = 20
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

const toPx = num => `${num}px`

const calcPageFillDimensions = (source, isActive = false) => {
  if (!source) {
    return {}
  }

  const { top, left, width, height } = source.getBoundingClientRect()
  const ww = window.innerWidth
  const wh = window.innerHeight

  const [start, mid, fin] = [
    {
      top: 0,
      left: 0,
      width,
      height,
      clipPath: 'circle(100%)'
      // clip: `rect(0px, ${rw}px, ${rh}px, 0px)`
    },
    {
      clipPath: 'circle(5%)'
      // clip: `rect(${wh * 0.1}px, ${ww * 0.25}px, ${wh / 2}px, ${ww * 0.75}px)`
    },
    {
      top: -top,
      left: -left,
      width: ww,
      height: wh,
      clipPath: 'circle(100%)'
      // clip: `rect(0px, ${ww}px, ${wh}px, 0px)`
    }
  ]

  return {
    delay: isActive ? 500 : 100,
    // to: isActive ? fin : start,
    from: isActive ? fin : start,
    to: [isActive ? mid : start, isActive ? fin : {}],
    config: {
      tension: 400,
      friction: 30
    }
  }
}

const bindIf = (bind, comparer) => (comparer ? bind() : {})

const useImagesLoaded = callback => {
  const state = {
    loadedCount: 0,
    loadingCount: 0
  }

  const handleLoadComplete = () => {
    state.loadedCount = state.loadedCount + 1

    if (state.loadingCount > 0 && state.loadingCount === state.loadedCount) {
      callback()
    }
  }

  return () => {
    state.loadingCount = state.loadedCount + 1

    return {
      onLoad: handleLoadComplete
    }
  }
}

const Project = ({ data, ...props } = {}) => {
  const projectRef = useRef()
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isActive = location.pathname.includes(data.id)
  const [isLoaded, setIsLoaded] = useState(false)
  // const bindPress = usePress(projectRef)
  const { onMouseMove, onMouseLeave, xyzs, leave } = useHoverGestures(
    projectRef
  )

  const hoverEvents = {
    onMouseLeave,
    onMouseMove
  }

  const watchImage = useImagesLoaded(() => {
    setIsLoaded(true)
  })

  const coverImageBackdrop = data.images['cover-backdrop']
    ? data.images['cover-backdrop'].jpg
    : null

  const backdropAnim = useSpring(
    isLoaded && calcPageFillDimensions(projectRef.current, isActive)
  )

  const test = () => {
    return {
      value: isActive ? 0 : 1,
      config: {
        duration: 300
      }
    }
  }

  const activeSpring = useSpring(test())

  return (
    <ProjectLink
      to={`/project/${data.id}`}
      forwardRef={projectRef}
      style={{
        perspective: 1000
        // overflow: isActive ? 'visible' : 'hidden'
        // ...animProps
      }}
      {...(isActive ? leave() : hoverEvents)}
      // {...bindIf(bindPress, isHome)}
      // {...bindIf(bindHover, isHome)}
      {...props}>
      {coverImageBackdrop && (
        <animated.img
          {...watchImage()}
          src={coverImageBackdrop}
          style={{
            position: 'absolute',
            maxWidth: 'unset',
            ...backdropAnim,
            transform: xyzs.interpolate(
              (x, y) => `translate(${x / 3}px, ${y / 3}px)`
            )
          }}
        />
      )}
      <CoverImage
        {...watchImage()}
        style={{
          opacity: activeSpring.value,
          transform: xyzs.interpolate(
            (x, y, z, scale) =>
              `translate3d(${x}px, ${y}px, ${z}px) scale(${scale})`
          )
        }}
        src={data.coverImage.src}
        alt={data.coverImage.alt}
      />
      {/* <div className={tachyons('child absolute-ns bottom-0 pa4-ns pa3')}>
        <h3 className={tachyons('f2 f1-ns lh-solid mv3')}>{data.title}</h3>
        <p className={tachyons('lh-title f4 f3-ns')}>{data.description}</p>
      </div> */}
    </ProjectLink>
  )
}

const getProjectIdFromLocation = ({ pathname = '' } = {}) => {
  const paths = pathname.split('/')

  if (paths && paths[2]) {
    return paths[2]
  }

  return ''
}

const getTargetsFromLocation = (location, portfolioContainer) => {
  const projectId = getProjectIdFromLocation(location)
  const target = document.getElementById(projectId)
  const index = [...target.parentNode.childNodes].indexOf(target)

  return {
    index,
    current: target,
    rest: [...portfolioContainer.children].filter(child => child !== target)
  }
}

const transitionAnimation = (el, isEnter, nextLocation, lastLocation) => {
  const portfolioContainer = el.children[1]
  let anim = {
    targets: portfolioContainer.children,
    scale: isEnter ? [0, 1] : 0,
    easing: 'easeInOutExpo',
    delay: anime.stagger(100)
  }

  if (nextLocation.pathname.includes('project')) {
    const targets = getTargetsFromLocation(nextLocation, portfolioContainer)
    const current = targets.current.querySelector('img:last-of-type')

    anim.targets = targets.rest
    anim.scale = 0
    anim.delay = anime.stagger(200, { from: targets.index })
  } else if (lastLocation && lastLocation.pathname.includes('project')) {
    anim.targets = getTargetsFromLocation(lastLocation, portfolioContainer).rest
  }

  return anime(anim).finished
}

const Projects = () => {
  const projectsRef = useRef()

  return (
    <ProjectsContainer forwardRef={projectsRef}>
      {store.projects.map(project => (
        <Project key={project.id} id={project.id} data={project} />
      ))}
    </ProjectsContainer>
  )
}

const Home = () => {
  const [isEntering, setState] = useState()
  const bind = useTransition('/', ({ state, el, next, last }) => {
    setState(next.pathname === '/')

    return transitionAnimation(el, state === 'enter', next, last)
  })

  const [{ x, y }, set] = useSpring(() => ({
    x: 0,
    y: 0
  }))

  const bindSpring = () => {
    return {
      style: {
        cx: x,
        cy: y
      },
      onMouseMove: e => {
        set({
          x: e.clientX,
          y: e.clientY
        })
      }
    }
  }

  const { onMouseMove, style } = bindSpring()

  return (
    <div
      {...bind()}
      onMouseMove={onMouseMove}
      style={{
        background: colors.black
      }}>
      {/* <svg
        style={{
          position: 'fixed',
          inset: '0px',
          width: '100%',
          height: '100%'
        }}>
        <filter id="dropShadow">
          <feGaussianBlur in="SourceGraphic" stdDeviation="30" />
        </filter>
        <animated.circle
          filter="url(#dropShadow)"
          r="300"
          fill="rgba(255, 255, 255, 0.005)"
          {...style}
        />
      </svg> */}
      <Hero transition={isEntering ? 'enter' : 'leave'} />
      <Projects />
      <Footer />
    </div>
  )
}

export default props => <Home {...props} />
