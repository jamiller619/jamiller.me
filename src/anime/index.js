import { useRef } from 'react'
import anime from 'animejs'
import useOnload from 'react-useonload'
import childrenWithRef from '/shared/childrenWithRef'
import { noop } from '/shared/utils'

export const playTo = (anim, percentage) => {
  const time = { current: null }

  return new Promise(resolve => {
    if (!anim.update) {
      anim.update = () => (time.current = anim.progress)

      if (time.current >= percentage) {
        anim.pause()

        resolve(anim)
      } else {
        anim.play()
      }
    }
  })
}

const resolveOptions = (ref, animeOpts, ...params) =>
  typeof animeOpts === 'function'
    ? animeOpts(ref.current, params)
    : { targets: ref.current, ...animeOpts }

const Anime = ({ targets, children, ...props }) => {
  const ref = useRef()

  useOnload(() => {
    anime(resolveOptions(ref, props))
  })

  return childrenWithRef(children, ref)
}

const useAnime = animeProps => params => {
  const ref = useRef()

  useOnload(() => {
    anime(resolveOptions(ref, animeProps, params))
  })

  return {
    ref
  }
}

const useTimeline = (
  timelineProps,
  { onBegin = noop, onComplete = noop, ...animeProps } = {}
) => params => {
  const ref = useRef()

  useOnload(() => {
    const tl = anime.timeline({
      begin: onBegin,
      complete: onComplete,
      ...animeProps
    })

    const props =
      typeof timelineProps === 'function'
        ? timelineProps(ref.current, params)
        : timelineProps

    props.map(({ targets, offset, ...tlRestProps }) => {
      tl.add(
        {
          targets: targets || ref.current,
          ...tlRestProps
        },
        offset
      )
    })
  })

  return {
    ref
  }
}

const Timeline = ({ children, onComplete, timelines = [], ...props }) => {
  const ref = useRef()

  useOnload(() => {
    const tl = anime.timeline({
      complete: onComplete,
      ...props
    })

    timelines.forEach(({ targets, offset, ...timeline }) => {
      const animProps = {
        ...timeline
      }

      if (typeof targets === 'function') {
        animProps.targets = targets(ref.current)
      }

      tl.add(animProps, offset)
    })
  })

  return childrenWithRef(children, ref)
}

export { anime as default, Anime, useAnime, Timeline, useTimeline }
