import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import type { DirectionalLight } from 'three'
import SoftOrbitControls from './SoftOrbitControls'
import styles from './Scene.module.css'
import RibbonCards from './RibbonCards'
import EdgeBlur from './EdgeBlur'
import ParticleSphere from './ParticleSphere'
import Atmosphere from './Atmosphere'

const ribbonGap = 1
const ribbonWidth = 0.25
const ribbonCount = 8
// Each full loop covers two opposite meridians; a half turn fills the sphere.
const ribbonSpacing = Math.PI / ribbonCount

export default function Scene() {
  return (
    <section
      className={styles.root}
      aria-label="Particle sphere surrounded by staggered 4:3 project cards"
    >
      <Canvas
        camera={{ position: [0, 0, 3.2], fov: 45 }}
        dpr={[1, 2]}
        frameloop="always"
        gl={{ alpha: true, antialias: true }}
      >
        <SoftOrbitControls />
        <ambientLight intensity={0.7} />
        <CameraLight />
        <SphereWithCards />
        <EdgeBlur />
      </Canvas>
    </section>
  )
}

function CameraLight() {
  const light = useRef<DirectionalLight>(null)

  // Follow the camera after orbit controls update; aim at the globe's origin.
  useFrame(({ camera }) => {
    if (light.current) camera.getWorldPosition(light.current.position)
  })

  return <directionalLight ref={light} intensity={2} />
}

function SphereWithCards() {
  const viewport = useThree((state) => state.viewport)
  const radius = Math.min(viewport.width, viewport.height) * 0.23
  const ribbonRadius = radius + ribbonGap

  return (
    <group>
      <Atmosphere radius={radius * 2} />
      <ParticleSphere radius={radius * 2} />
      {Array.from({ length: ribbonCount }, (_, index) => (
        <group key={index} rotation={[0, index * ribbonSpacing, 0]}>
          <RibbonCards
            radius={ribbonRadius}
            ribbonWidth={ribbonWidth}
            ribbonSpacing={ribbonSpacing}
            stagger={(index % 2) * 0.5}
            // Eight loops means opposite columns share the same parity.
            direction={index % 2 === 0 ? 1 : -1}
            letterOffset={index}
          />
        </group>
      ))}
    </group>
  )
}
