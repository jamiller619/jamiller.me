import { useRef } from 'react'

const useTransitionEvents = ({ onComplete, onBegin }) => {
  const totalAnimations = useRef(0)
  const completedAnimations = useRef(0)

  const isAnimationComplete = () =>
    completedAnimations.current === totalAnimations.current - 1

  const complete = (...args) => {
    if (isAnimationComplete()) {
      onComplete && onComplete(...args)
    } else {
      completedAnimations.current += 1
    }
  }

  const begin = (...args) => {
    onBegin && onBegin(...args)
    totalAnimations.current += 1
  }

  return {
    complete,
    begin
  }
}

export default useTransitionEvents
