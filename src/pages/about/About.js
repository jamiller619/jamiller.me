import React, { forwardRef } from 'react'
import anime from 'animejs'
import { useTransition } from '/transition/TransitionGroup'
import styled from '/tachyons/styled'
import { toAnime, easyEase } from '/shared/easing'

import styles from './about.scss'
import colors from '/shared/colors.scss'
import logoart from '/images/logoart.png'

const Container = styled('div', 'pb5')

const CopySection = styled('section', 'ph6-l ph5-m pa3 pt6 f3-ns f4 lh-copy')
const LogoArt = styled('div', 'pa3-ns nl3-ns w-75-l w-80', {
  className: styles.logoArt
})
const LogoImage = styled('img', 'db', {
  src: logoart
})
const Header = styled('h1', 'f-6-l f-5-m f1 lh-solid')
const Paragraph = styled('p', 'measure gray')
const ContactSection = styled(
  'section',
  'ph6-l ph5-m pa3 silver f3-ns f4 fw6 lh-copy measure cf'
)
const LinkList = styled('ul', 'list dib pl0 fl mr5')
const LinkItem = styled('li', 'ml0 pv2')

const transitionAnimation = (el, isEnter) => {
  console.log('running transition for about', 'is entering', isEnter, el)
  const enterProps = {
    translateY: ['50%', 0],
    opacity: [0, 1]
  }

  const exitProps = {
    translateX: [0, '100%'],
    opacity: [1, 0]
  }

  return new Promise(resolve => {
    const props = {
      targets: el,
      duration: 500,
      update: anim => {
        if (anim.progress > 50) {
          resolve()
        }
      },
      easing: toAnime(easyEase)
    }

    anime({
      ...props,
      ...(isEnter ? enterProps : exitProps)
    })
  })
}

const About = () => {
  const bind = useTransition('/about', ({ state, el }) => {
    return transitionAnimation(el, state === 'enter')
  })

  return (
    <Container
      {...bind()}
      style={{
        background: colors.black
      }}>
      <CopySection>
        <LogoArt>
          <LogoImage />
        </LogoArt>
        <Header>Creative for hire.</Header>
        <Paragraph>
          Over the last <b>thirteen years,</b> I have held a professional
          position in almost every creative field possible. From{' '}
          <b>Motion and Interactive Designer</b> to <b>JavaScript Developer</b>{' '}
          and even <b>Creative Director</b> ― I've experienced a lot, and
          nothing is off-limits.
        </Paragraph>
        <Paragraph>
          I currently reside in <b>Charlotte, North Carolina</b> and while I
          love the area I'm open to opportunities anywhere in the country and
          even abroad. So while the location doesn't matter ― the position does.
          I'm looking for something that I can grow into, something that
          challenges me, at some place that understands the value of building a
          team with great talent.
        </Paragraph>
      </CopySection>
      <ContactSection>
        <h2>Contact</h2>
        <LinkList>
          <LinkItem>
            <a href="mailto:hello@jamiller.me">hello@jamiller.me</a>
          </LinkItem>
          <LinkItem>
            <a href="#">LinkedIn</a>
          </LinkItem>
          <LinkItem>
            <a href="#">Twitter</a>
          </LinkItem>
        </LinkList>
        <LinkList>
          <LinkItem>
            <a href="#">Download CV</a>
          </LinkItem>
        </LinkList>
      </ContactSection>
    </Container>
  )
}

export default props => <About {...props} />
