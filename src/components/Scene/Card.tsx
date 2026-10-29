import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import {
  DoubleSide,
  MathUtils,
  SRGBColorSpace,
  Vector3,
  type Mesh,
  type MeshStandardMaterial,
} from 'three'
import type { Project } from './projects'

// Cosines of the viewing angle: finish fading before the card turns edge-on.
const edgeFadeStart = 0.35
const edgeFadeEnd = 0.1

type CardProps = {
  radius: number
  width: number
  project: Project
  fadeStart: number
  fadeEnd: number
}

export default function Card({
  radius,
  width,
  project,
  fadeStart,
  fadeEnd,
}: CardProps) {
  const mesh = useRef<Mesh>(null)
  const material = useRef<MeshStandardMaterial>(null)
  const positions = useMemo(
    () => ({ card: new Vector3(), camera: new Vector3() }),
    []
  )

  useFrame(({ camera }) => {
    if (!mesh.current) return
    mesh.current.getWorldPosition(positions.card)
    camera.getWorldPosition(positions.camera)

    // The globe is centered at the origin, so the radial direction is the normal.
    // Use the card-to-camera direction to account for perspective at the rim.
    positions.camera.sub(positions.card).normalize()
    positions.card.normalize()
    const facing = positions.card.dot(positions.camera)
    const edgeOpacity = MathUtils.smoothstep(facing, edgeFadeEnd, edgeFadeStart)
    mesh.current.visible = edgeOpacity > 0

    if (material.current && mesh.current.parent) {
      const latitude = Math.abs(mesh.current.parent.rotation.x)
      material.current.opacity =
        edgeOpacity * (1 - MathUtils.smoothstep(latitude, fadeStart, fadeEnd))
    }
  })

  const surface = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 384

    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Unable to create card label.')

    ctx.fillStyle = '#f4f0e8'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#242424'
    ctx.font = `700 50px stolzl, sans-serif`
    ctx.letterSpacing = '-0.05em'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'

    ctx.fillText(project.title, 20, canvas.height - 50, canvas.width - 64)

    return canvas
  }, [project.title])

  return (
    // The parent sets latitude and longitude; offset slightly above the ribbon.
    <mesh ref={mesh} position={[0, 0, radius + 0.01]} scale={0.9}>
      <planeGeometry args={[width, (width * 3) / 4]} />
      <meshStandardMaterial
        ref={material}
        roughness={0.85}
        side={DoubleSide}
        transparent
        depthWrite={false}
      >
        <canvasTexture
          attach="map"
          args={[surface]}
          colorSpace={SRGBColorSpace}
        />
      </meshStandardMaterial>
    </mesh>
  )
}
