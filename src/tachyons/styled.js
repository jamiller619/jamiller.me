import React from 'react'
import tachyons from '@jamr/tachyons.js'
import { classNames } from '/shared/utils'

const parseChildren = children => {
  if (typeof children === 'string' || typeof children === 'number') {
    return children
  }

  return children && children.length ? [children] : children
}

const styled = (tag = 'div', styles = '', additionalProps = {}) => ({
  children,
  className,
  forwardRef,
  ...restProps
}) => {
  const Container = tag
  const props = {
    ...additionalProps,
    ...restProps,
    ...classNames(className, tachyons(styles || ''), additionalProps.className)
  }

  if (forwardRef) {
    props.ref = forwardRef
  }

  return tag === 'img' ? (
    <Container {...props} />
  ) : (
    <Container {...props}>{parseChildren(children)}</Container>
  )
}

export default styled
