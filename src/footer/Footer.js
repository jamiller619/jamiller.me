import React from 'react'
import { animated } from 'react-spring'
import tachyons from '@jamr/tachyons.js'

import styled from '/tachyons/styled'

const Container = styled(animated('footer'), 'ma3')
const InnerContainer = styled(
  'div',
  'pt5 ph6-l pa3 bt bw2 b--black-10 f5-ns f6 ph3 lh-copy center pb2'
)
const HugeLink = styled('a', 'f1-ns f3 fw6 hover-black mv4')
const Message = styled('p', 'lh-copy measure')
const Link = styled('a', 'hover-black')
const LinkList = styled('div', 'pt3')
const Copyright = styled('div', 'ph6-l pa3 pt5-ns db f4-ns f5 gray')

const Footer = props => {
  return (
    <Container {...props}>
      <InnerContainer>
        <HugeLink href="mailto:hello@jamiller.me">hello@jamiller.me</HugeLink>
        <Message>
          <span>
            I am currently exploring opportunities. Have something in mind?
            <br />
          </span>
          <Link href="mailto:hello@jamiller.me">Get in touch!</Link>
        </Message>
        <LinkList>
          <Link href="#" className={tachyons('pr2')}>
            Download CV
          </Link>
          <Link href="#" className={tachyons('pr2')}>
            LinkedIn
          </Link>
          <Link href="#">Github</Link>
        </LinkList>
      </InnerContainer>
      <Copyright>
        <small>
          &copy; 2017-{new Date().getFullYear()} Jeff Miller. All rights
          reserved.
        </small>
      </Copyright>
    </Container>
  )
}

export default Footer
