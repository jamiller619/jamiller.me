import { useRef, useState, useEffect } from 'react'
// import ResizeObserver from 'resize-observer-polyfill'

const useMeasure = (deps = []) => {
  const ref = useRef()
  const [bounds, setState] = useState(new DOMRect())
  const scrollHandler = () => {
    window.requestAnimationFrame(() => {
      if (ref.current && ref.current.isConnected) {
        setState(ref.current.getBoundingClientRect())
      }
    })
  }

  useEffect(() => {
    scrollHandler()
    // window.addEventListener('scroll', scrollHandler)

    return () => {
      // window.removeEventListener('scroll', scrollHandler)
    }
  }, deps)

  return [{ ref }, bounds]
}

// const useMeasure = () => {
//   const ref = useRef()
//   const [bounds, set] = useState({ left: 0, top: 0, width: 0, height: 0 })
//   const [ro] = useState(
//     () => new ResizeObserver(([entry]) => set(entry.contentRect))
//   )

//   useEffect(() => (ro.observe(ref.current), ro.disconnect), [])

//   return [{ ref }, bounds]
// }

export default useMeasure
