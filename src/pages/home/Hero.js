import React from 'react'
import { useSpring, animated } from 'react-spring'
import styled from '/tachyons/styled'

// const Container = styled(
//   React.forwardRef((props, ref) => <animated.div {...props} ref={ref} />),
//   'pv5-ns pt5 ph6-l ph3 relative flex flex-column justify-end'
// )
const Container = styled(
  animated.div,
  'pv5-ns pt5 ph6-l ph3 relative flex flex-column justify-end'
)
const Heading1 = styled(animated.h1, 'db f-5 f-6-ns')
const Heading2 = styled(animated.h2, 'db mt0 f2 f1-ns')
const Span = styled(animated.span, 'db')
const RedSpan = styled(Span, 'red')

// eslint-disable-next-line max-lines-per-function
const Hero = ({ forwardRef, show = true, ...props } = {}) => {
  const { value } = useSpring({
    value: show ? 1 : 0,
    from: {
      value: show ? 0 : 1
    }
  })

  const fadeToggle = () => ({ opacity: value.interpolate(v => v) })

  return (
    <Container
      {...props}
      ref={forwardRef}
      style={{
        transform: value
          .interpolate({ range: [0, 1], output: [-8, 0] })
          .interpolate(v => `translate3d(0, ${v}%, ${v * 0.8}px)`)
      }}>
      <Heading1 style={fadeToggle()}>
        {/* <TextSplitter tag={animated.span} {...bindTransition()}> */}
        Hello! I'm Jeff.
        {/* </TextSplitter> */}
      </Heading1>
      <Heading2 style={fadeToggle()}>
        <Span>
          A designer & developer of
          {/* <TextSplitter>A designer & developer of</TextSplitter> */}
        </Span>
        <RedSpan style={fadeToggle()}>
          all things digital.
          {/* <TextSplitter>all things digital.</TextSplitter> */}
        </RedSpan>
      </Heading2>
    </Container>
  )
}

// export default Hero

export default React.forwardRef((props, ref) => (
  <Hero {...props} forwardRef={ref} />
))
