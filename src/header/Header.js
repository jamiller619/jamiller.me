import React from 'react'
import { animated, useTransition } from 'react-spring'
import { Link, useLocation } from 'react-router-dom'
import styled from '/tachyons/styled'

import { ChevronLeft } from '/icons/Icon'

import styles from './header.scss'

const HeaderContainer = styled(
  'header',
  'flex justify-between items-start fw6 ph5-l ph4',
  {
    className: styles.header
  }
)

const LogoLinkContainer = styled(Link, 'tl flex flex-column no-underline', {
  className: styles.link
})

const IndexLink = styled(animated.span, 'inline-flex items-center')

const AboutLinkContainer = styled('div', 'tr flex flex-column')

const LinkWithoutUnderline = styled(animated(Link), 'no-underline')

const Logo = props => {
  return (
    <animated.svg viewBox="0 0 214.6 52.11" className={styles.logo} {...props}>
      <title>The portfolio of Jeff Miller</title>
      <path d="M43.29,0A30.61,30.61,0,0,1,0,43.29Zm64.42,1.69L82,50.42h51.48Zm82.1,24.79L164.14,1.69V50.42H214.6V1.69Z" />
    </animated.svg>
  )
}

const useToggleTransition = itemCallback => {
  const location = useLocation()

  return useTransition(itemCallback(location.pathname), null, {
    from: {
      transform: 'translateY(-30px)',
      opacity: 0
    },
    enter: {
      transform: 'translateY(0px)',
      opacity: 1
    },
    leave: {
      transform: 'translateY(30px)',
      opacity: 0
    },
    config: {
      tension: 300,
      friction: 15
    }
  })
}

const LogoLink = () => {
  const transitions = useToggleTransition(path => path.includes('project'))

  return (
    <LogoLinkContainer to="/">
      {transitions.map(({ item, key, props }) => {
        return item ? (
          <IndexLink key={key} style={props}>
            <ChevronLeft />
            index
          </IndexLink>
        ) : (
          <Logo key={key} style={props} />
        )
      })}
    </LogoLinkContainer>
  )
}

const AboutLink = () => {
  const transitions = useToggleTransition(path => path.includes('about'))
  const style = props => ({ style: { ...props, right: 0 } })

  return (
    <AboutLinkContainer>
      {transitions.map(({ item, key, props }) => {
        return item ? (
          <LinkWithoutUnderline
            to=""
            onClick={() => history.back()}
            key={key}
            {...style(props)}>
            close
          </LinkWithoutUnderline>
        ) : (
          <LinkWithoutUnderline to="/about" key={key} {...style(props)}>
            about
          </LinkWithoutUnderline>
        )
      })}
    </AboutLinkContainer>
  )
}

const Header = () => {
  return (
    <HeaderContainer>
      <LogoLink />
      <AboutLink />
    </HeaderContainer>
  )
}

export default Header
