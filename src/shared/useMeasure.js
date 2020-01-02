import { useRef, useState, useLayoutEffect } from 'react'

/**
 * measure a DOM node!
 * @example
 * const [bind, dimensions] = useMeasure()
 * // then, bind to element
 * <div {...bind}>Measure me</div>
 * @returns {Array.<{bind: Object, dimensions: Object}>}
 * returns an array
 */
const useMeasure = () => {
  const ref = useRef()
  const [dimensions, set] = useState(new DOMRect())

  const measure = () => {
    if (ref.current && ref.current.isConnected) {
      set(ref.current.getBoundingClientRect())
    }
  }

  useLayoutEffect(measure, [ref.current])

  return [ref, dimensions]
}

export default useMeasure
