import React, { useState, useRef, Fragment } from 'react'
import anime, { useAnime, useTimeline } from '/anime'
import { easyEaseOut, easyEase, easyEaseIn, toAnime } from '/shared/easing'
import { noop, classNames } from '/shared/utils'
import useMemoRef from '/shared/useMemoRef'
import styled from '/tachyons/styled'
import colors from '/shared/colors.scss'
import styles from './logo-animation.scss'

const { ww, wh } = useMemoRef(() => ({
  ww: window.innerWidth,
  wh: window.innerHeight
})).current

const isBetween = (num, min, max) => num > min && num < max

const calcPageFillRadius = ([x = ww / 2, y = wh / 2] = []) => {
  const w = Math.max(x - 0, ww - x)
  const h = Math.max(y - 0, wh - y)

  return Math.sqrt(Math.pow(w, 2) + Math.pow(h, 2))
}

const svg = {
  j: [
    'M 193.7 237.9 C 193.7 252.3 182 264 167.6 264 C 154 264.2 142.8 255.8 141.5 237.9 C 141.5 223.5 153.2 211.8 167.6 211.8 C 182 211.8 193.7 223.5 193.7 237.9 Z',
    'M 186.1 212.9 C 191.6 218.4 194.9 226 194.9 234.4 C 194.9 251.3 181.2 265 164.3 265 C 155.9 265 148.3 261.6 142.8 256.2 C 148.1 251.2 181 217.7 186.1 212.9 Z'
  ],
  a: [
    'M 275.7 237.9 C 275.7 252.3 264 264 249.6 264 C 235.2 264 223.5 252.3 223.5 237.9 C 223.5 230.4 226.7 223.6 231.8 218.9 C 236.4 214.5 242.7 211.8 249.6 211.8 C 256.5 211.8 262.8 214.5 267.5 218.9 C 272.6 223.7 275.7 230.4 275.7 237.9 Z',
    'M 250.5 214.6 C 247.7 220 243.2 228.7 238.5 237.6 C 233.5 247.2 228.3 257 224.8 263.3 C 229.9 263.3 239.8 263.3 249.8 263.3 C 259.7 263.3 269.9 263.3 276.3 263.3 C 273.1 257.5 268 247.9 263 238.5 C 258.1 229.2 253.2 220 250.5 214.6 Z'
  ],
  m: [
    'M 349.2 255.1 C 344.2 260.3 337.6 263.1 331 263.3 C 324.2 263.6 317.5 261.3 312.2 256.3 C 301.7 246.4 301.2 229.9 311.1 219.3 C 320.9 208.9 337.5 208.3 348 218.1 C 358.4 228.1 358.9 244.6 349.2 255.1 Z',
    'M 332.6 239.4 C 328.5 235.8 314.1 222.1 306.9 214.6 C 306.9 225.4 307 255.6 306.9 263.3 C 314.3 263.3 350.5 263.3 357.4 263.3 C 357.4 255.9 357.5 219.2 357.4 214.6 C 352.8 218.9 336.7 235.6 332.6 239.4 Z'
  ]
}

const LogoFrame = ({ onComplete }) => {
  const keyframes = [
    {
      d: el => svg[el.id],
      translateX: anime.stagger([-5, 5]),
      opacity: [0, 1],
      strokeWidth: 3,
      scale: [0, 1],
      duration: 800,
      easing: toAnime(easyEase)
    },
    {
      translateX: anime.stagger([-100, 100]),
      scale: 0.8,
      duration: 1500,
      delay: 20,
      easing: toAnime(easyEaseOut)
    },
    {
      d: el => svg[el.id][0],
      translateX: anime.stagger([-5, 5]),
      opacity: (_, i) => (i === 1 ? 1 : 0),
      rotate: 360,
      scale: 0.18,
      duration: 400,
      easing: toAnime(easyEase)
    }
  ]

  const bind = useAnime(ref => ({
    keyframes,
    targets: ref.children,
    delay: 500,
    begin() {
      const t = keyframes.reduce(
        (prev, { duration, delay = 0 }) => prev + duration + delay,
        0
      )

      setTimeout(() => (ref.children[1].style.fill = 'url(#pattern)'), t + 300)
    },
    complete() {
      ref.children[1].style.fill = 'url(#pattern)'

      onComplete()
    }
  }))

  return (
    <g {...bind()}>
      {Object.entries(svg).map(([key, value]) => {
        return (
          <path
            key={key}
            id={key}
            d={value[0]}
            fill="none"
            stroke="url(#pattern)"
          />
        )
      })}
    </g>
  )
}

const PageWipe = {}

PageWipe.Square = ({ animation, ...props }) => {
  const bind = useAnime(ref => ({
    targets: ref.children,
    x: (_, i) => (i === 0 ? -800 : 50),
    easing: toAnime(easyEase),
    duration: 500,
    ...animation
  }))

  return (
    <g {...props} {...bind()}>
      <rect x="-500" y="0" width="300" height="500" />
      <rect x="-250" y="0" width="300" height="500" />
    </g>
  )
}

PageWipe.Circle = ({ animation, ...props }) => {
  const bind = useAnime({
    r: [0, calcPageFillRadius()],
    easing: toAnime(easyEase),
    duration: 750,
    ...animation
  })

  return <circle cx="250" cy="250" {...props} {...bind()} />
}

const rand = (min, max) => anime.random(max ? min : -min, max || min)

const GreetingAnimation = ({ onComplete = noop }) => {
  const bind = useTimeline(ref => {
    const container = ref.querySelector('g')

    const tl = anime.timeline({
      autoplay: false,
      easing: toAnime(easyEaseIn),
      duration: 500
    })

    tl.add({
      targets: [...container.children].map(child => child.children),
      translateX: anime.stagger([-1000, 500], { from: 'center' }),
      translateY: anime.stagger([-1000, 500], { from: 'center' }),
      scale: () => rand(1, 18),
      rotate: () => rand(-720, 720)
    }).add(
      {
        targets: container.children,
        translateX: anime.stagger([-500, 500]),
        translateY: anime.stagger([-700, 700], { from: 'center' })
        // rotateX: () => rand(-50, 50),
        // rotateY: () => rand(-720, 720)
      },
      0
    )
    // .add(
    //   {
    //     targets: ref.querySelector('feTurbulence'),
    //     baseFrequency: [0, 0.003]
    //   },
    //   0
    // )

    // window.addEventListener('pointermove', e => {
    //   const x1 = ww / 2
    //   const y1 = wh / 2
    //   const x = x1 - e.x
    //   const y = y1 - e.y
    //   const distanceMax = (x1 * x1 + y1 * y1) * 0.75
    //   const distance = x * x + y * y
    //   const percentDone = tl.duration * (distance / distanceMax)

    //   tl.seek(percentDone)
    // })

    return [
      {
        targets: container.children,
        translateY: [420, 0],
        translateX: [480, 0],
        opacity: [0, 1],
        scale: [3.5, 1],
        delay: anime.stagger(25, { start: 300 }),
        easing: 'spring(1, 100, 70, 16)'
      },
      {
        targets: container,
        scale: 0.2,
        easing: toAnime(easyEase),
        duration: 150
      }
    ]
  })

  const letterProps = {
    style: {
      transformOrigin: 'center',
      opacity: 0
    }
  }

  return (
    <svg
      {...bind()}
      scale={0.7}
      className={styles.container}
      style={{ transformOrigin: 'center' }}
      x="50%"
      y="50%"
      width="300"
      height="100">
      <g
        style={{
          transform: 'scale(0.5) translateX(-50%) translateY(-50%)'
        }}>
        <g {...letterProps}>
          <polygon points="22.13 86.61 22.13 90.31 18.74 88.01 22.13 86.61" />
          <polygon points="64.86 9.11 57.15 9.11 57.15 14.99 62.01 18.37 64.86 9.11" />
          <polygon points="77.64 29.26 79.28 24.95 79.28 9.11 70.87 9.11 72.07 25.38 77.64 29.26" />
          <polygon points="4.01 47.3 22.13 66.23 22.13 64.31 23.83 64.31 19.13 44.06 4.01 47.3" />
          <polygon points="15.7 29.29 11.01 9.11 0 9.11 0 43.11 3.66 46.93 15.7 29.29" />
          <polygon points="0 95.73 0 100.24 22.13 100.24 22.13 95.19 12.56 90.55 0 95.73" />
          <polygon points="3.3 47.45 0 48.16 0 52.28 3.3 47.45" />
          <polygon points="77.61 100.24 79.28 100.24 79.28 67.75 74.81 62.33 77.61 100.24" />
          <polygon points="73.22 40.82 76.69 31.75 72.61 32.62 73.22 40.82" />
          <polygon points="79.28 53.32 79.28 46.85 75.18 49.84 79.28 53.32" />
          <polygon points="32.81 43.22 36.73 64.31 47.88 64.31 54.37 43.22 32.81 43.22" />
          <polygon points="57.15 64.31 57.15 82.82 67.67 55.32 55.34 64.31 57.15 64.31" />
          <polygon points="67.67 55.32 68.51 54.71 68.1 54.2 67.67 55.32" />
          <polygon points="73.8 48.68 73.22 40.82 71.09 46.38 73.8 48.68" />
          <polygon points="76.69 31.75 73.22 40.82 73.8 48.68 75.18 49.84 79.28 46.85 79.28 31.19 76.69 31.75" />
          <polygon points="71.09 46.38 68.1 54.2 68.51 54.71 73.95 50.74 73.8 48.68 71.09 46.38" />
          <polygon points="23.07 43.22 19.13 44.06 23.83 64.31 36.73 64.31 32.81 43.22 23.07 43.22" />
          <polygon points="0 84.46 0 95.73 12.56 90.55 0 84.46" />
          <polygon points="73.95 50.74 75.18 49.84 73.8 48.68 73.95 50.74" />
          <polygon points="3.3 47.45 3.66 46.93 0 43.11 0 48.16 3.3 47.45" />
          <polygon points="22.13 19.86 22.13 9.11 11.01 9.11 15.7 29.29 22.13 19.86" />
          <polygon points="79.28 30.41 79.28 24.95 77.64 29.26 79.28 30.41" />
          <polygon points="3.66 46.93 3.3 47.45 4.01 47.3 3.66 46.93" />
          <polygon points="23.07 43.22 22.13 43.22 22.13 19.86 15.7 29.29 19.13 44.06 23.07 43.22" />
          <polygon points="19.13 44.06 15.7 29.29 3.66 46.93 4.01 47.3 19.13 44.06" />
          <polygon points="72.07 25.38 70.87 9.11 64.86 9.11 62.01 18.37 72.07 25.38" />
          <polygon points="62.01 18.37 57.15 14.99 57.15 34.16 62.01 18.37" />
          <polygon points="22.13 66.23 4.01 47.3 3.3 47.45 0 52.28 0 75.31 18.74 88.01 22.13 86.61 22.13 66.23" />
          <polygon points="57.15 40.95 57.15 43.22 54.37 43.22 47.88 64.31 55.34 64.31 67.67 55.32 68.1 54.2 57.15 40.95" />
          <polygon points="58.42 35.65 72.61 32.62 72.07 25.38 62.01 18.37 57.15 34.16 57.15 34.58 58.42 35.65" />
          <polygon points="76.69 31.75 77.64 29.26 72.07 25.38 72.61 32.62 76.69 31.75" />
          <polygon points="68.51 54.71 67.67 55.32 57.15 82.82 57.15 100.24 77.61 100.24 74.81 62.33 68.51 54.71" />
          <polygon points="18.74 88.01 12.56 90.55 22.13 95.19 22.13 90.31 18.74 88.01" />
          <polygon points="75.18 49.84 73.95 50.74 74.81 62.33 79.28 67.75 79.28 53.32 75.18 49.84" />
          <polygon points="74.81 62.33 73.95 50.74 68.51 54.71 74.81 62.33" />
          <polygon points="0 84.46 12.56 90.55 18.74 88.01 0 75.31 0 84.46" />
          <polygon points="79.28 31.19 79.28 30.41 77.64 29.26 76.69 31.75 79.28 31.19" />
          <polygon points="57.15 34.58 57.15 35.92 58.42 35.65 57.15 34.58" />
          <polygon points="58.42 35.65 71.09 46.38 73.22 40.82 72.61 32.62 58.42 35.65" />
          <polygon points="57.15 35.92 57.15 40.95 68.1 54.2 71.09 46.38 58.42 35.65 57.15 35.92" />
        </g>
        <g {...letterProps}>
          <path d="M145.89,76.81l16,11.13a32,32,0,0,1-13.3,10.65l-5.5-19,2.08-2.74Z" />
          <path d="M125.39,101.5c.3,0,.6.07.9.11l3.92-5.16-3.4-2.88Z" />
          <path d="M152.18,38.94l1.76-4.81a36.1,36.1,0,0,0-15.36-6.53l-1.42,7.95Z" />
          <polygon points="130.86 97 131.86 94.28 130.21 96.45 130.86 97" />
          <path d="M129.08,101.85c.86.05,1.74.09,2.62.09,1.58,0,3.15-.09,4.71-.24L130.86,97Z" />
          <path d="M93.45,65.32c.26,12.7,6,23.54,15.66,30.06l1.11-15.86Z" />
          <path d="M143,79.5l0,0,2.08-2.74h-.81A11,11,0,0,1,143,79.5Z" />
          <path d="M135.46,84.47l-3.6,9.81,11.2-14.73,0,0A12,12,0,0,1,135.46,84.47Z" />
          <path d="M131.7,84.88a17.87,17.87,0,0,1-3.28-.31l-1.61,9,3.4,2.88,1.65-2.17,3.6-9.81A16.93,16.93,0,0,1,131.7,84.88Z" />
          <path d="M112.05,53.23,99,44.12a38.59,38.59,0,0,0-5.54,20.32c0,.3,0,.59,0,.88l16.77,14.2Z" />
          <path d="M152.18,38.94,141.09,69.13H151l14.7-19.34a36.27,36.27,0,0,0-4.94-8.91Z" />
          <path d="M126.81,93.57l-16.59-14-1.11,15.86a38.26,38.26,0,0,0,16.28,6.12Z" />
          <path d="M127.9,27.08l2,6.82,7.29,1.65,1.42-7.95a42.18,42.18,0,0,0-7.4-.65C130.07,27,129,27,127.9,27.08Z" />
          <path d="M160.74,40.88a34.24,34.24,0,0,0-6.8-6.75l-1.76,4.81Z" />
          <path d="M145.89,76.81l16,11.13a35.19,35.19,0,0,0,5.26-11.13Z" />
          <path d="M168.16,69.13a42.56,42.56,0,0,0-2.48-19.34L151,69.13Z" />
          <path d="M127.9,27.08a39.3,39.3,0,0,0-13.4,3.35l15.37,3.47Z" />
          <polygon points="131.58 66.84 131.17 69.13 134.87 69.13 131.58 66.84" />
          <polygon points="140.05 69.13 136.18 55.72 133.56 55.72 131.58 66.84 134.87 69.13 140.05 69.13" />
          <path d="M131.86,94.28l-1,2.72,5.55,4.7a40.33,40.33,0,0,0,12.15-3.11l-5.5-19Z" />
          <path d="M133.56,55.72h-17c1.83-6.9,6.51-11.72,14.45-11.72a16.86,16.86,0,0,1,1.77.1l-2.95-10.2L114.5,30.43c-.3.13-.59.28-.89.42l-1.56,22.38,19.53,13.61Z" />
          <path d="M130.21,96.45l-3.92,5.16q1.36.17,2.79.24L130.86,97Z" />
          <path d="M145.11,55.72h-8.94l3.88,13.41h1l11.09-30.19-15-3.39-1.61,9.05C140.78,46.09,144,50.24,145.11,55.72Z" />
          <path d="M99,44.12l13.08,9.11,1.56-22.38A35.14,35.14,0,0,0,99,44.12Z" />
          <path d="M135.55,44.6l1.61-9.05-7.29-1.65,2.95,10.2A15.53,15.53,0,0,1,135.55,44.6Z" />
          <path d="M116,69.13h15.22l.41-2.29L112.05,53.23l-1.83,26.29,16.59,14,1.61-9C122.11,83.37,116.84,78.59,116,69.13Z" />
        </g>
        <g {...letterProps}>
          <polygon points="179.7 31.35 179.61 31.02 179.61 1.28 186.99 21.76 179.7 31.35" />
          <polygon points="179.61 76.45 179.61 84.15 196.94 97.35 189.14 67.48 188.85 67.08 179.61 76.45" />
          <polygon points="199.44 56.35 200.43 55.35 198.47 53.65 199.44 56.35" />
          <polygon points="181.74 39.15 179.7 31.35 179.61 31.46 179.61 37.31 181.74 39.15" />
          <polygon points="197.7 100.24 200.74 100.24 196.94 97.35 197.7 100.24" />
          <polygon points="183.53 46.03 191.84 47.91 181.74 39.15 183.53 46.03" />
          <polygon points="198.47 53.65 196.81 49.03 191.84 47.91 198.47 53.65" />
          <polygon points="189 66.94 189.14 67.48 201.75 84.97 201.75 62.75 199.44 56.35 189 66.94" />
          <polygon points="200.43 55.35 199.44 56.35 201.75 62.75 201.75 56.49 200.43 55.35" />
          <polygon points="179.61 84.15 179.61 100.24 197.7 100.24 196.94 97.35 179.61 84.15" />
          <polygon points="196.94 97.35 200.74 100.24 201.75 100.24 201.75 84.97 189.14 67.48 196.94 97.35" />
          <polygon points="179.61 45.14 179.61 54.26 188.85 67.08 189 66.94 183.53 46.03 179.61 45.14" />
          <polygon points="179.61 54.26 179.61 76.45 188.85 67.08 179.61 54.26" />
          <polygon points="196.81 49.03 201.75 50.14 201.75 2.35 186.99 21.76 196.81 49.03" />
          <polygon points="201.75 2.35 201.75 0 179.61 0 179.61 1.28 186.99 21.76 201.75 2.35" />
          <polygon points="179.7 31.35 181.74 39.15 191.84 47.91 196.81 49.03 186.99 21.76 179.7 31.35" />
          <polygon points="201.75 50.14 196.81 49.03 198.47 53.65 200.43 55.35 201.75 54.02 201.75 50.14" />
          <polygon points="200.43 55.35 201.75 56.49 201.75 54.02 200.43 55.35" />
          <polygon points="191.84 47.91 183.53 46.03 189 66.94 199.44 56.35 198.47 53.65 191.84 47.91" />
          <polygon points="179.61 37.31 179.61 45.14 183.53 46.03 181.74 39.15 179.61 37.31" />
        </g>
        <g {...letterProps}>
          <polygon points="189.14 67.48 189 66.94 188.85 67.08 189.14 67.48" />
          <polygon points="179.61 31.02 179.61 31.46 179.7 31.35 179.61 31.02" />
          <polygon points="230.95 24.42 216.29 11.36 216.29 0 238.43 0 238.43 16.84 230.95 24.42" />
          <polygon points="216.29 70.28 216.29 100.24 238.43 100.24 238.43 88.28 216.84 69.57 216.29 70.28" />
          <polygon points="238.43 68.39 238.43 58.43 233.84 57.4 238.43 68.39" />
          <polygon points="223.32 32.15 216.29 39.27 216.29 53.43 227.23 55.9 231.1 50.81 223.32 32.15" />
          <polygon points="216.29 69.1 216.84 69.57 227.23 55.9 216.29 53.43 216.29 69.1" />
          <polygon points="231.1 50.81 233.84 57.4 238.43 58.43 238.43 41.17 231.1 50.81" />
          <polygon points="223.32 32.15 230.95 24.42 216.29 11.36 216.29 15.28 223.32 32.15" />
          <polygon points="238.43 31.09 238.43 16.84 230.95 24.42 238.43 31.09" />
          <polygon points="233.84 57.4 227.23 55.9 216.84 69.57 238.43 88.28 238.43 68.39 233.84 57.4" />
          <polygon points="216.29 15.28 216.29 39.27 223.32 32.15 216.29 15.28" />
          <polygon points="227.23 55.9 233.84 57.4 231.1 50.81 227.23 55.9" />
          <polygon points="238.43 41.17 238.43 31.09 230.95 24.42 223.32 32.15 231.1 50.81 238.43 41.17" />
          <polygon points="216.29 69.07 216.29 70.3 216.86 69.56 216.29 69.07" />
        </g>
        <g {...letterProps}>
          <path d="M304.75,90.2,310.08,95a36.93,36.93,0,0,1-11.27,5.45Z" />
          <polygon points="317.89 67.66 313.4 75.37 322.27 77.38 321.98 76.05 317.89 67.66" />
          <path d="M322.67,77.47l-.4-.09.34,1.53c.11-.29.23-.58.34-.88Z" />
          <path d="M323.84,53.69a36.43,36.43,0,0,0-10.49-17l2.33,10.66Z" />
          <polygon points="319.53 64.85 315.68 47.32 303.26 37.63 317.89 67.66 319.53 64.85" />
          <path d="M255,45.88l12.67,11.3-5.18-20.72A36.16,36.16,0,0,0,255,45.88Z" />
          <path d="M303.26,37.62l-4.44-9.11c-1-.28-2-.52-3-.73l-.66,3.56Z" />
          <path d="M250.48,61.15c-.09,1.09-.14,2.18-.14,3.29a37.29,37.29,0,0,0,11,26.92l8.05-25.93Z" />
          <path d="M325.32,64.44a39.68,39.68,0,0,0-.83-8.11l-5,8.52L322,76.05l.69,1.42.45.1A39.23,39.23,0,0,0,325.32,64.44Z" />
          <path d="M293.21,79.91,304.75,90.2l8.65-14.83-12.21-2.76A14.1,14.1,0,0,1,293.21,79.91Z" />
          <path d="M303.26,37.62l12.42,9.7-2.33-10.66a37,37,0,0,0-14.53-8.15Z" />
          <path d="M303.26,37.62l-8.06-6.28L292,48.61c6.42,1.77,10.89,7.64,10.89,15.83a18.69,18.69,0,0,1-1.74,8.17l12.21,2.76,4.49-7.71Z" />
          <polygon points="321.98 76.05 319.53 64.85 317.89 67.66 321.98 76.05" />
          <polygon points="322.27 77.38 322.67 77.47 321.98 76.05 322.27 77.38" />
          <path d="M271,60.14l10.11-32.61a37.27,37.27,0,0,0-18.62,8.93l5.18,20.72Z" />
          <path d="M272.91,61.82C274,53.42,280,48,287.83,48a15.68,15.68,0,0,1,4.21.57l3.16-17.27L289.63,27c-.59,0-1.2,0-1.8,0a38.8,38.8,0,0,0-6.69.58L271,60.14Z" />
          <path d="M313.4,75.37,304.75,90.2,310.08,95a36,36,0,0,0,12.53-16l-.34-1.53Z" />
          <path d="M293.21,79.91a15.79,15.79,0,0,1-5.38.94,15.47,15.47,0,0,1-1.68-.1l-3.81,20.81a41.25,41.25,0,0,0,5.49.38,39.52,39.52,0,0,0,11-1.54l5.94-10.2Z" />
          <path d="M269.39,65.43l-8.05,25.93a36.93,36.93,0,0,0,17.28,9.5l-8.83-35.34Z" />
          <path d="M272.91,61.82,271,60.14l-1.43,4.61.19.77,3,.68c-.05-.57-.07-1.16-.07-1.76A20.21,20.21,0,0,1,272.91,61.82Z" />
          <path d="M319.53,64.85l5-8.52c-.18-.9-.4-1.78-.65-2.64l-8.16-6.37Z" />
          <polygon points="269.39 65.43 269.79 65.52 269.6 64.75 269.39 65.43" />
          <polygon points="267.7 57.18 269.6 64.75 271.03 60.14 267.7 57.18" />
          <path d="M295.86,27.78a39.74,39.74,0,0,0-6.23-.79l5.57,4.35Z" />
          <path d="M272.8,66.2l-3-.68,8.83,35.34c1.22.29,2.46.52,3.72.7l3.81-20.81C279,80,273.48,74.56,272.8,66.2Z" />
          <path d="M322.67,77.47,323,78c.05-.15.11-.31.17-.46Z" />
          <path d="M269.6,64.75l-1.9-7.57L255,45.88a37.49,37.49,0,0,0-4.55,15.27l18.91,4.28Z" />
        </g>
      </g>
    </svg>
  )
}

const LogoAnimation = () => {
  const [frame, setFrame] = useState(0)
  const increment = () => setFrame(frame + 1)

  return (
    <svg viewBox="0 0 500 500" {...classNames(styles.container, styles.logo)}>
      <defs>
        <filter id="goo">
          <feGaussianBlur
            in="SourceGraphic"
            result="blur"
            stdDeviation="10" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            result="goo"
            values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 21 -7" />
          <feBlend in="SourceGraphic" result="mix" />
        </filter>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0">
          <stop offset="0%" style={{ stopColor: '#33235b' }} />
          <stop offset="25%" style={{ stopColor: '#D62229' }} />
          <stop offset="50%" style={{ stopColor: '#E97639' }} />
          <stop offset="75%" style={{ stopColor: '#792042' }} />
          <stop offset="100%" style={{ stopColor: '#33235b' }} />
        </linearGradient>
        <pattern
          id="pattern"
          x="0"
          y="0"
          width="300%"
          height="100%"
          patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="150%" height="100%" fill="url(#gradient)">
            <animate
              attributeType="XML"
              attributeName="x"
              from="0"
              to="150%"
              dur="7s"
              repeatCount="indefinite"
            />
          </rect>
          <rect
            x="-150%"
            y="0"
            width="150%"
            height="100%"
            fill="url(#gradient)">
            <animate
              attributeType="XML"
              attributeName="x"
              from="-150%"
              to="0"
              dur="7s"
              repeatCount="indefinite"
            />
          </rect>
        </pattern>
      </defs>
      {frame < 2 && <LogoFrame onComplete={increment} />}
      {frame === 1 && (
        <Fragment>
          <PageWipe.Circle fill={colors.blue} />
          <GreetingAnimation />
        </Fragment>
      )}
    </svg>
  )
}

export default LogoAnimation
