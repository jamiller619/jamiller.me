import React, { useEffect, useRef } from 'react'
import anime from 'animejs'
import { Link, useLocation } from 'react-router-dom'
import useOnload from 'react-useonload'
import styled from '/tachyons/styled'

import { ChevronLeft } from '/icons/Icon'

import styles from './header.scss'

const HeaderContainer = styled(
  'header',
  'flex justify-between items-start fw6 pb1 ph5-l ph3 mh3-m pt4',
  {
    className: styles.header
  }
)
const LogoLinkContainer = styled(Link, 'tl flex flex-column no-underline', {
  className: styles.link
})
const IndexLink = styled('span', 'inline-flex items-center')
const AboutLinkContainer = styled('div', 'tr flex flex-column')
const LinkWithoutUnderline = styled(Link, 'no-underline')

const Logo = () => {
  return (
    <svg viewBox="0 0 214.6 52.11" className={styles.logo}>
      <title>The portfolio of Jeff Miller</title>
      <path d="M43.29,0A30.61,30.61,0,0,1,0,43.29Zm64.42,1.69L82,50.42h51.48Zm82.1,24.79L164.14,1.69V50.42H214.6V1.69Z" />
    </svg>
  )
}

const useToggleLink = (containerRef, isOnPageCheck) => {
  const { pathname } = useLocation()

  useEffect(() => {
    const isOnPage = isOnPageCheck(pathname)
    const container = containerRef.current

    anime({
      targets: container,
      translateY: isOnPage ? '-1em' : '0'
    })

    anime({
      targets: container.children[0],
      opacity: isOnPage ? 0 : 1
    })

    anime({
      targets: container.children[1],
      opacity: isOnPage ? 1 : 0
    })
  }, [pathname])
}

const LogoLink = () => {
  const containerRef = useRef()

  useToggleLink(containerRef, pathname => pathname.includes('project'))

  return (
    <LogoLinkContainer to="/" forwardRef={containerRef}>
      <Logo />
      <IndexLink>
        <ChevronLeft />
        index
      </IndexLink>
    </LogoLinkContainer>
  )
}

const AboutLink = () => {
  const containerRef = useRef()

  useToggleLink(containerRef, pathname => pathname === '/about')

  return (
    <AboutLinkContainer forwardRef={containerRef}>
      <LinkWithoutUnderline to="/about">about</LinkWithoutUnderline>
      <LinkWithoutUnderline to="" onClick={() => history.back()}>
        close
      </LinkWithoutUnderline>
    </AboutLinkContainer>
  )
}

const Header = () => {
  const container = useRef()

  useOnload(() => {
    anime({
      targets: container.current.children,
      translateY: [-100, 0],
      opacity: [0, 1],
      delay: anime.stagger(200, { start: 500 })
    })
  })

  return (
    <HeaderContainer forwardRef={container}>
      <LogoLink />
      <AboutLink />
    </HeaderContainer>
  )
}

export default Header
