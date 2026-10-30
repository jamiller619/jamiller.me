import { useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import {
  DoubleSide,
  MathUtils,
  Matrix4,
  Mesh,
  SRGBColorSpace,
  Shape,
  ShapeGeometry,
  Vector3,
  type CanvasTexture,
  type Group,
  type MeshStandardMaterial,
} from 'three'
import type { Project } from './projects'
import { revealDelay, revealDuration } from './cardReveal'

// Cosines of the viewing angle: finish fading before the card turns edge-on.
const edgeFadeStart = 0.35
const edgeFadeEnd = 0.1

type CardProps = {
  radius: number
  width: number
  project: Project
  fadeStart: number
  fadeEnd: number
  entranceDelay: number
}

export default function Card({
  radius,
  width,
  project,
  fadeStart,
  fadeEnd,
  entranceDelay,
}: CardProps) {
  const imageTexture = useTexture(project.image.src, (texture) => {
    // Center-crop the image to cover the existing 4:3 geometry without stretching.
    const imageAspect = project.image.width / project.image.height
    const cardAspect = 4 / 3
    texture.repeat.set(
      Math.min(1, cardAspect / imageAspect),
      Math.min(1, imageAspect / cardAspect)
    )
    texture.offset.set((1 - texture.repeat.x) / 2, (1 - texture.repeat.y) / 2)
    texture.colorSpace = SRGBColorSpace
    texture.needsUpdate = true
  })
  const mesh = useRef<Group>(null)
  const label = useRef<Mesh>(null)
  const material = useRef<MeshStandardMaterial>(null)
  const labelMaterial = useRef<MeshStandardMaterial>(null)
  const labelTexture = useRef<CanvasTexture>(null)
  const hovered = useRef(false)
  const hoverAmount = useRef(0)
  const revealStartedAt = useRef<number | null>(null)
  const reducedMotion = useRef(false)
  const cardGeometry = useMemo(() => {
    const height = (width * 3) / 4
    const corner = width * 0.06
    const left = -width / 2
    const right = width / 2
    const bottom = -height / 2
    const top = height / 2
    const shape = new Shape()
    shape.moveTo(left + corner, bottom)
    shape.lineTo(right - corner, bottom)
    shape.quadraticCurveTo(right, bottom, right, bottom + corner)
    shape.lineTo(right, top - corner)
    shape.quadraticCurveTo(right, top, right - corner, top)
    shape.lineTo(left + corner, top)
    shape.quadraticCurveTo(left, top, left, top - corner)
    shape.lineTo(left, bottom + corner)
    shape.quadraticCurveTo(left, bottom, left + corner, bottom)
    const geometry = new ShapeGeometry(shape, 8)
    const positions = geometry.getAttribute('position')
    const uv = geometry.getAttribute('uv')
    // Keep the image and label mapped across the full 4:3 card surface.
    for (let index = 0; index < positions.count; index++) {
      uv.setXY(
        index,
        positions.getX(index) / width + 0.5,
        positions.getY(index) / height + 0.5
      )
    }
    return geometry
  }, [width])
  useEffect(() => () => cardGeometry.dispose(), [cardGeometry])
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      reducedMotion.current = preference.matches
    }
    update()
    preference.addEventListener('change', update)
    return () => preference.removeEventListener('change', update)
  }, [])
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

  useFrame(({ camera, clock }, delta) => {
    if (!mesh.current || !mesh.current.parent) return
    revealStartedAt.current ??= clock.elapsedTime
    const progress = reducedMotion.current
      ? 1
      : MathUtils.clamp(
          (clock.elapsedTime -
            revealStartedAt.current -
            revealDelay -
            entranceDelay) /
            revealDuration,
          0,
          1
        )
    // Ease out past full size, then settle back for a spring-like entrance.
    const overshoot = 1.70158
    const remaining = progress - 1
    const reveal =
      1 + (overshoot + 1) * remaining ** 3 + overshoot * remaining ** 2
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
      (progress > 0 ? 1 : 0) *
      edgeOpacity *
      (1 - MathUtils.smoothstep(latitude, fadeStart, fadeEnd))
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
    mesh.current.scale.setScalar(
      Math.max(0, reveal) * (0.9 + 0.045 * hoverAmount.current)
    )
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
      ctx.fillStyle = '#ffffff'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)'
      ctx.shadowBlur = 8
      ctx.shadowOffsetY = 2
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
        <primitive object={cardGeometry} attach="geometry" />
        <meshStandardMaterial
          ref={material}
          opacity={0}
          map={imageTexture}
          roughness={0.85}
          side={DoubleSide}
          transparent
          depthWrite={false}
        />
      </mesh>
      <mesh ref={label} position={[0, 0, 0.002]} raycast={() => {}}>
        <primitive object={cardGeometry} attach="geometry" />
        <meshStandardMaterial
          ref={labelMaterial}
          opacity={0}
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
