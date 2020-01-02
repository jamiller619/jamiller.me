import React from 'react'
import { animated, useTransition } from 'react-spring'
import styled from '/tachyons/styled'

import styles from './about.scss'
import colors from '/shared/colors.scss'
import logoart from '/images/logoart.png'

const Container = styled(animated.div, 'pb5')
const LogoArt = styled('div', 'pa3-ns nl3-ns w-75-l w-80', {
  className: styles.logoArt
})
const LogoImage = styled('img', 'db', {
  src: logoart
})
const Header = styled('h1', 'f-6-l f-5-m f1 lh-solid')
const Paragraph = styled('p', 'measure gray')

const Copy = styled('section', 'ph6-l ph5-m pa3 pt6 f3-ns f4 lh-copy')
const Contact = styled(
  'section',
  'ph6-l ph5-m pa3 silver f3-ns f4 fw6 lh-copy measure cf'
)

const LinkList = styled('ul', 'list dib pl0 fl mr5')
const LinkItem = styled('li', 'ml0 pv2')

const Section = {}

Section.Contact = () => {
  return (
    <Contact>
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
    </Contact>
  )
}

Section.Copy = () => {
  return (
    <Copy>
      <LogoArt>
        <LogoImage />
      </LogoArt>
      <Header>Creative for hire.</Header>
      <Paragraph>
        Over the last <b>thirteen years,</b> I have held a professional position
        in almost every creative field possible. From{' '}
        <b>Motion and Interactive Designer</b> to <b>JavaScript Developer</b>{' '}
        and even <b>Creative Director</b> ― I've experienced a lot, and nothing
        is off-limits.
      </Paragraph>
      <Paragraph>
        I currently reside in <b>Charlotte, North Carolina</b> and while I love
        the area I'm open to opportunities anywhere in the country and even
        abroad. So while the location doesn't matter ― the position does. I'm
        looking for something that I can grow into, something that challenges
        me, at some place that understands the value of building a team with
        great talent.
      </Paragraph>
    </Copy>
  )
}

const About = props => {
  return (
    <Container
      {...props}
      style={{
        background: colors.black
      }}>
      <Section.Copy />
      <Section.Contact />
    </Container>
  )
}

export default props => <About {...props} />
