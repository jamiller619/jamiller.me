import React from 'react'

import { classNames } from '/shared/utils'
import styles from './icon.scss'

export const ChevronLeft = ({ className, ...props }) => {
  const classNameProps = className
    ? [styles.icon, ...className.split(' ')]
    : [styles.icon]

  return (
    <svg viewBox="0 0 18 30" {...classNames(classNameProps)} {...props}>
      <path d="M14 0l4 4L8 15l10 11-4 4L0 15z" />
    </svg>
  )
}
