import React from 'react'
import tachyons from '@jamr/tachyons.js'
import { classNames } from '/shared/utils'

const styled = (tag = 'div', styles = '', additionalProps = {}) =>
  React.forwardRef(({ className, forwardRef, ...restProps }, ref) => {
    const Container = tag
    const props = {
      ...additionalProps,
      ...restProps,
      ...classNames(
        className,
        tachyons(styles || ''),
        additionalProps.className
      )
    }

    return <Container {...props} ref={ref || forwardRef} />
  })

export default styled
