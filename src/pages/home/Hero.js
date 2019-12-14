import React from 'react'
import { animated, useTransition } from 'react-spring'
import styled from '/tachyons/styled'
import TextSplitter from '/text-splitter/TextSplitter'

const Container = styled(
  'div',
  'pt6-ns pb5-ns pt5 ph6-l ph3 relative flex flex-column justify-end'
)

const Heading1 = styled('h1', 'db f-5 f-6-ns')
const Heading2 = styled('h2', 'db mt0 f2 f1-ns')
const Span = styled('span', 'db')
const RedSpan = styled(Span, 'red')

const Hero = ({ transition }) => {
  const bindTransition = () => {
    return useTransition(transition === 'enter', null, {
      from: {
        opacity: 0,
        translateY: '100%'
      },
      enter: {
        opacity: 1,
        translateY: '0%'
      },
      leave: {
        opacity: 0,
        translateY: '100%'
      }
    })
  }
  // const ref = useRef()

  // useEffect(() => {
  //   const isEntering = transition === 'enter'

  //   anime({
  //     targets: [...ref.current.childNodes].map(child => child.childNodes),
  //     opacity: isEntering ? [0, 1] : 0,
  //     translateY: ['100%', '0%'],
  //     delay: anime.stagger(200, {
  //       start: isEntering ? 500 : 0
  //     }),
  //     easing: 'easeOutExpo'
  //     // duration: 500
  //   })
  // }, [transition])

  return (
    <Container>
      <Heading1>
        <TextSplitter tag={animated.span} {...bindTransition()}>
          Hello! I'm Jeff.
        </TextSplitter>
      </Heading1>
      <Heading2>
        <Span>
          <TextSplitter>A designer & developer of</TextSplitter>
        </Span>
        <RedSpan>
          <TextSplitter>all things digital.</TextSplitter>
        </RedSpan>
      </Heading2>
    </Container>
  )
}

export default Hero
