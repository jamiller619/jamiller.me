import { useEffect, useRef, useState } from 'react'

const transitionStates = ['enter', 'leave']

const useTransition = callback => {
  const ref = useRef()
  const hasRef = () => ref.current != null
  const transitionState = useRef(0)

  useEffect(() => {
    const event = transitionStates[transitionState.current]

    if (hasRef()) {
      Promise.resolve(callback(event, ref.current)).then(() => {
        transitionState.current = transitionState.current === 0 ? 1 : 0
      })
    }

    // setState({
    //   transitionState: transitionState === 0 ? 1 : 0
    // })

    // const timeline = hasRef()
    //   ? Promise.resolve(callback('leave', ref.current))
    //   : Promise.resolve(null)

    // timeline.then(() => {
    //   if (hasRef()) {
    //     callback('enter', ref.current)
    //   }
    // })
  }, [transitionState.current])

  return () => {
    return { ref }
  }
}

export default useTransition
