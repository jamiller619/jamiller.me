import React, { useRef, useEffect } from 'react'
import { useSpring, animated } from 'react-spring'
import { useLocation, useParams } from 'react-router-dom'
import Hero from './Hero'
import { ProjectGrid, ProjectPage } from '/pages/project'
import Footer from '/footer/Footer'

import useMeasure from '/shared/useMeasure'
import colors from '/shared/colors.scss'

const SlidingProjectGrid = animated(ProjectGrid)

const Home = () => {
  const location = useLocation()
  const { id } = useParams()
  const [bind, { width }] = useMeasure()
  const isHome = location.pathname === '/'

  const { value } = useSpring({
    value: isHome ? 0 : 1,
    from: {
      value: isHome ? 1 : 0
    }
    // onFrame(props) {
    //   window.scroll(0, window.scrollY - window.scrollY / props.value)
    // }
  })

  return (
    <div {...bind}>
      {id && <ProjectPage id={id} />}
      <Hero show={isHome} />
      {width && <ProjectGrid width={width} />}
      {/* {width && (
        <SlidingProjectGrid
          width={width}
          style={{
            transform: value.interpolate(v => `translate3d(0, ${v * -40}vh, 0)`)
          }}
        />
      )} */}
      {/* <Footer /> */}
    </div>
  )
}

export default () => <Home />
