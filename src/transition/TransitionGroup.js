import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const useTransitionState = (location, path) => {
  if (location.pathname === path) {
    return 'enter'
  }

  return 'leave'
}

export const useTransition = (path, callback, deps) => () => {
  const location = useLocation()
  const lastLocation = useRef()
  const ref = useRef()
  const state = useTransitionState(location, path)

  useEffect(() => {
    callback({
      state,
      el: ref.current,
      next: location,
      last: lastLocation.current
    })

    setTimeout(() => {
      lastLocation.current = location
    }, 10)
  }, deps)

  return {
    ref
  }
}

// const pageEvents = {}
// const eventNameMap = {
//   onEnter: 'enter',
//   onLeave: 'leave'
// }

// const parseDomStyle = dom => {
//   const retStyles = {}
//   if (!dom) return retStyles

//   const styles = dom.hasAttribute('style')
//     ? dom
//         .getAttribute('style')
//         .split(';')
//         .filter(item => item !== '')
//     : {}

//   for (const style in styles) {
//     const [key, value] = style.split(':')

//     retStyles[key] = value
//   }

//   return retStyles
// }

// const getPrevPageStyle = prevPageContainer => {
//   return new Promise(resolve => {
//     window.requestAnimationFrame(() => {
//       const { scrollY } = window
//       const { scrollHeight: height } = document.body
//       // const prevStyles = parseDomStyle(
//       //   prevPageContainer && prevPageContainer.firstElementChild
//       // )

//       resolve({
//         // ...prevStyles,
//         position: 'fixed',
//         top: `-${scrollY}px`,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         width: '100vw',
//         pointerEvents: 'none',
//         height
//       })
//     })
//   })
// }

// const getTransitionEvent = (name, element) => {
//   const events = pageEvents[element.props.pageKey]

//   if (events && events[name]) {
//     return () => {
//       if (events.ref.current) {
//         return events[name](eventNameMap[name], events.ref.current)
//       }

//       return null
//     }
//   }

//   return null
// }

// export const useTransition = (key, transitionCallback) => {
//   const el = useRef()

//   return () => {
//     return {
//       forwardRef: el,
//       pageKey: key,
//       onEnter: () => {
//         if (el.current) {
//           return transitionCallback('enter', el.current)
//         }
//       },
//       onLeave: () => {
//         if (el.current) {
//           return transitionCallback('leave', el.current)
//         }
//       }
//     }
//   }
// }

// export const Page = ({
//   onEnter,
//   onLeave,
//   pageKey,
//   forwardRef,
//   tag = 'div',
//   children,
//   ...restProps
// }) => {
//   const Container = tag
//   const props = {
//     ...restProps
//   }

//   if (forwardRef) {
//     if (typeof tag === 'function') {
//       props.forwardRef = forwardRef
//     } else {
//       props.ref = forwardRef
//     }
//   }

//   useEffect(() => {
//     pageEvents[pageKey] = { onEnter, onLeave, ref: forwardRef }
//   }, [pageKey])

//   return <Container {...props}>{[children]}</Container>
// }

// const fade = (from, to, duration, element) => {
//   const start = Date.now()

//   return new Promise(resolve => {
//     const step = () => {
//       const now = Date.now()
//       const t = now - start
//       const v = ((to - from) * t) / duration + from

//       if ((from > to && v > to) || (to > from && v < to)) {
//         element.style.opacity = v
//         window.requestAnimationFrame(step)
//       } else {
//         element.style.opacity = to
//         resolve()
//       }
//     }

//     window.requestAnimationFrame(step)
//   })
// }

// const raf = callback => {
//   return new Promise(resolve => {
//     window.requestAnimationFrame(() => {
//       callback()

//       setTimeout(resolve, 1000)
//     })
//   })
// }

// const runTransitionEvent = (name, element, container) => {
//   if (!element) return Promise.resolve()

//   const event = getTransitionEvent(name, element)

//   return Promise.resolve(typeof event === 'function' ? event() : null)
// }

// const TransitionGroupPages = ({ current = {}, prev = {} } = {}) => {
//   // useEffect(() => {
//   //   raf(() => runTransitionEvent('onLeave', prev.page, prev.ref.current))
//   //     // .then(() => {
//   //     //   return raf(() => {
//   //     //     if (prev.page) {
//   //     //       return fade(1, 0, 200, prev.ref.current)
//   //     //     }

//   //     //     prev.ref.current.style.opacity = 0

//   //     //     return Promise.resolve()
//   //     //   })
//   //     // })
//   //     // .then(() => {
//   //     //   if (!prev.page) {
//   //     //     return raf(() => fade(0, 1, 200, current.ref.current))
//   //     //   }

//   //     //   return Promise.resolve()
//   //     // })
//   //     .then(() =>
//   //       raf(() =>
//   //         runTransitionEvent('onEnter', current.page, current.ref.current)
//   //       )
//   //     )
//   // })

//   return (
//     <Fragment>
//       <div ref={current.ref}>{current.page}</div>
//       <div ref={prev.ref} style={prev.style}>
//         {prev.page}
//       </div>
//     </Fragment>
//   )
// }

// export const TransitionGroup = ({ children }) => {
//   const location = useLocation()
//   const currentContainer = useRef()
//   const prevContainer = useRef()
//   const pages = useMemo(() => React.Children.toArray(children))

//   const [{ prevPage, currentPage, prevPageStyle } = {}, setState] = useState({
//     prevPage: null,
//     currentPage: null,
//     prevPageStyle: {}
//   })

//   const props = {
//     current: {
//       page: currentPage,
//       ref: currentContainer
//     },
//     prev: {
//       page: prevPage,
//       ref: prevContainer,
//       style: prevPageStyle
//     }
//   }

//   useEffect(() => {
//     getPrevPageStyle(currentContainer.current).then(prevPageStyle => {
//       setState(prevState => {
//         const currentPageFilter = pages.filter(child => {
//           return child.props.path === location.pathname
//         })

//         const current = currentPageFilter && currentPageFilter[0]

//         return {
//           prevPageStyle: prevState.currentPage ? prevPageStyle : {},
//           currentPage: current,
//           prevPage: prevState.currentPage
//         }
//       })
//     })
//   }, [location.pathname])

//   return <TransitionGroupPages {...props} />
// }
