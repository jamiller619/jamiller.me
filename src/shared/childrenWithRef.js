import React from 'react'

const Clone = React.forwardRef(({ element, ...props }, ref) =>
  React.cloneElement(element, { ref, ...props })
)

const childrenWithRef = (children, ref) => {
  ref.current = []
  return React.Children.map(children, child => {
    return <Clone ref={target => ref.current.push(target)} element={child} />
  })
}

export default childrenWithRef
