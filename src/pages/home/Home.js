import React, { Fragment, useEffect } from 'react'
import { useSpring, animated } from 'react-spring'

import Hero from './Hero'
import ProjectGrid from './ProjectGrid'
import Fresh from '/pages/project/Fresh'
import Footer from '/footer/Footer'

import useRouteParams from '/shared/useRouteParams'
import useMeasure from '/shared/useMeasure'

if (window.history.scrollRestoration) {
  window.history.scrollRestoration = 'manual'
}

// const HeroWithRef = React.forwardRef((props, ref) => (
//   <Hero {...props} forwardRef={ref} />
// ))

const AnimatedProject = animated(Fresh)

const constantState = {
  position: 'relative',
  top: '-50vh',
  width: '100%'
}

const startState = {
  y: 100,
  opacity: 0
}

const restState = {
  y: 0,
  opacity: 1,
  delay: 400
}

const ProjectPage = ({ id }) => {
  const [{ y, ...spring }, set] = useSpring(() => startState)

  const style = {
    ...constantState,
    ...spring,
    transform: y.interpolate(v => `translate3d(0, ${v}px, 0)`)
  }

  const enter = () => set(restState)

  useEffect(() => {
    if (id != null) {
      setTimeout(enter, restState.delay)
    } else {
      set(startState)
    }
  }, [id])

  return id ? <AnimatedProject style={style} /> : null
}

const Home = () => {
  const { id: projectId } = useRouteParams('/project/:id')
  const isActive = projectId != null
  const [heroMeasureRef, { height, width }] = useMeasure()

  return (
    <Fragment>
      <Hero show={!isActive} ref={heroMeasureRef} />
      {(width && height && (
        <ProjectGrid width={width} top={height + 100}>
          {projectId ? <ProjectPage id={projectId} /> : null}
        </ProjectGrid>
      )) ||
        null}
      <Footer />
    </Fragment>
  )
}

export default () => <Home />
