import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import {
  DoubleSide,
  MathUtils,
  Matrix4,
  Mesh,
  SRGBColorSpace,
  Vector3,
  type CanvasTexture,
  type Group,
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
  const mesh = useRef<Group>(null)
  const label = useRef<Mesh>(null)
  const material = useRef<MeshStandardMaterial>(null)
  const labelMaterial = useRef<MeshStandardMaterial>(null)
  const labelTexture = useRef<CanvasTexture>(null)
  const hovered = useRef(false)
  const hoverAmount = useRef(0)
  const positions = useMemo(
    () => ({ card: new Vector3(), camera: new Vector3() }),
    []
  )

  const raycast = useMemo(() => {
    // Test both the animated surface and its resting footprint as one object.
    // One event target avoids pointer-out events between the two hit areas.
    const restingCard = new Mesh()
    const restingTransform = new Matrix4()
      .makeTranslation(0, 0, radius + 0.01)
      .scale(new Vector3(0.9, 0.9, 0.9))

    const hitTest: Mesh['raycast'] = function (raycaster, intersections) {
      if (!material.current || material.current.opacity < 0.1) return
      Mesh.prototype.raycast.call(this, raycaster, intersections)
      const column = mesh.current?.parent
      if (!column) return

      restingCard.geometry = this.geometry
      restingCard.material = this.material
      restingCard.matrixWorld.multiplyMatrices(
        column.matrixWorld,
        restingTransform
      )
      const firstRestingHit = intersections.length
      restingCard.raycast(raycaster, intersections)
      for (let index = firstRestingHit; index < intersections.length; index++) {
        intersections[index].object = this
      }
    }
    return hitTest
  }, [radius])

  useFrame(({ camera }, delta) => {
    if (!mesh.current || !mesh.current.parent) return
    // Measure visibility at rest so lifting a card doesn't change its fade.
    positions.card.set(0, 0, radius + 0.01)
    mesh.current.parent.localToWorld(positions.card)
    camera.getWorldPosition(positions.camera)

    // The globe is centered at the origin, so the radial direction is the normal.
    // Use the card-to-camera direction to account for perspective at the rim.
    positions.camera.sub(positions.card).normalize()
    positions.card.normalize()
    const facing = positions.card.dot(positions.camera)
    const edgeOpacity = MathUtils.smoothstep(facing, edgeFadeEnd, edgeFadeStart)
    const latitude = Math.abs(mesh.current.parent.rotation.x)
    const opacity =
      edgeOpacity * (1 - MathUtils.smoothstep(latitude, fadeStart, fadeEnd))
    mesh.current.visible = opacity > 0
    if (material.current) material.current.opacity = opacity
    if (labelMaterial.current) labelMaterial.current.opacity = opacity
    if (opacity < 0.1) hovered.current = false

    hoverAmount.current = MathUtils.damp(
      hoverAmount.current,
      hovered.current ? 1 : 0,
      12,
      delta
    )
    mesh.current.position.z = radius + 0.01 + width * 0.15 * hoverAmount.current
    mesh.current.scale.setScalar(0.9 + 0.045 * hoverAmount.current)
    if (label.current) {
      label.current.position.z = 0.002 + width * 0.06 * hoverAmount.current
    }
  })

  const surface = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 384
    return canvas
  }, [])

  useEffect(() => {
    const ctx = surface.getContext('2d')
    if (!ctx) throw new Error('Unable to create card label.')
    let cancelled = false
    const font = '700 50px stolzl, sans-serif'

    const draw = () => {
      if (cancelled) return
      ctx.clearRect(0, 0, surface.width, surface.height)
      ctx.fillStyle = '#242424'
      ctx.font = font
      ctx.letterSpacing = '-0.05em'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText(project.title, 20, surface.height - 50, surface.width - 64)
      if (labelTexture.current) labelTexture.current.needsUpdate = true
    }
    draw()
    // Canvas text does not refresh automatically when a web font loads.
    document.fonts
      .load(font, project.title)
      .then(draw)
      .catch(() => {
        // Keep the fallback label readable if the font service is unavailable.
      })
    return () => {
      cancelled = true
    }
  }, [surface, project.title])

  return (
    // The parent sets latitude and longitude; offset slightly above the ribbon.
    <group ref={mesh} position={[0, 0, radius + 0.01]} scale={0.9}>
      <mesh
        raycast={raycast}
        onPointerOver={(event) => {
          if (!material.current || material.current.opacity < 0.1) return
          event.stopPropagation()
          hovered.current = true
        }}
        onPointerOut={() => {
          hovered.current = false
        }}
      >
        <planeGeometry args={[width, (width * 3) / 4]} />
        <meshStandardMaterial
          ref={material}
          color="#f4f0e8"
          roughness={0.85}
          side={DoubleSide}
          transparent
          depthWrite={false}
        />
      </mesh>
      <mesh ref={label} position={[0, 0, 0.002]} raycast={() => {}}>
        <planeGeometry args={[width, (width * 3) / 4]} />
        <meshStandardMaterial
          ref={labelMaterial}
          roughness={0.85}
          side={DoubleSide}
          transparent
          depthWrite={false}
        >
          <canvasTexture
            ref={labelTexture}
            attach="map"
            args={[surface]}
            colorSpace={SRGBColorSpace}
          />
        </meshStandardMaterial>
      </mesh>
    </group>
  )
}
