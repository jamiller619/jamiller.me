import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { DoubleSide, SRGBColorSpace, Vector3, type Mesh } from 'three'
import type { Project } from './projects'

export default function Card({
  radius,
  width,
  project,
}: {
  radius: number
  width: number
  project: Project
}) {
  const mesh = useRef<Mesh>(null)
  const positions = useMemo(
    () => ({ card: new Vector3(), camera: new Vector3() }),
    []
  )
  useFrame(({ camera }) => {
    if (!mesh.current) return
    mesh.current.getWorldPosition(positions.card)
    camera.getWorldPosition(positions.camera)
    // The globe is centered at the origin: hide the opposite hemisphere.
    mesh.current.visible = positions.card.dot(positions.camera) > 0
  })

  const surface = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 384
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Unable to create card label.')
    context.fillStyle = '#f4f0e8'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = '#242424'
    // Fit project titles inside the same card face as the original labels.
    let fontSize = 180
    context.font = `600 ${fontSize}px sans-serif`
    while (
      context.measureText(project.title).width > canvas.width - 64 &&
      fontSize > 12
    ) {
      fontSize -= 2
      context.font = `600 ${fontSize}px sans-serif`
    }
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(
      project.title,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width - 64
    )
    return canvas
  }, [project.title])

  return (
    // The parent sets latitude and longitude; offset slightly above the ribbon.
    <mesh ref={mesh} position={[0, 0, radius + 0.01]} scale={0.9}>
      <planeGeometry args={[width, (width * 3) / 4]} />
      <meshStandardMaterial roughness={0.85} side={DoubleSide}>
        <canvasTexture
          attach="map"
          args={[surface]}
          colorSpace={SRGBColorSpace}
        />
      </meshStandardMaterial>
    </mesh>
  )
}
