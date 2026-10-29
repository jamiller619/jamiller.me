import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { MathUtils, type Group } from 'three'
import Card from './Card'
import { projects } from './projects'

const latitudeSpeed = 0.008 // Radians per second.

export default function RibbonCards({
  radius,
  ribbonWidth,
  ribbonSpacing,
  stagger = 0,
  letterOffset = 0,
  direction = 1,
}: {
  radius: number
  ribbonWidth: number
  ribbonSpacing: number
  stagger?: number
  letterOffset?: number
  direction?: 1 | -1
}) {
  const columns = useRef<Group>(null)
  const equatorSpacing = 2 * radius * Math.sin(ribbonSpacing)
  let width = Math.min(0.7, (equatorSpacing - ribbonWidth) * 0.6)

  const getLayout = (cardWidth: number) => {
    const height = (cardWidth * 3) / 4
    const halfAngle = Math.atan(height / 2 / (radius + 0.01))
    const latitudeStep = 2 * halfAngle * 1.35
    // Check clearance at the poleward edge, where neighboring loops are closest.
    const latitudeLimit = Math.max(
      0,
      Math.acos(Math.min(1, (cardWidth * 1.2 + ribbonWidth) / equatorSpacing)) -
        halfAngle
    )
    return { latitudeStep, latitudeLimit }
  }

  let layout = getLayout(width)

  // Keep the same card size and polar clearance for both stagger phases.
  while (layout.latitudeLimit < 2 * layout.latitudeStep) {
    width *= 0.95
    layout = getLayout(width)
  }

  const { latitudeStep, latitudeLimit } = layout

  // Add room beyond both edges to finish fading before recycling a card.
  const wrapLimit = Math.min(Math.PI / 2, latitudeLimit + latitudeStep / 2)
  const fadeStart = latitudeLimit - latitudeStep / 2
  const latitudeSpan = 2 * wrapLimit

  // Fit a whole number of slots so the wrap gap matches every other gap.
  const cardCount = Math.floor(latitudeSpan / latitudeStep)
  const slotSpacing = latitudeSpan / cardCount

  const getLatitude = (index: number, travel: number) =>
    MathUtils.euclideanModulo(
      (cardCount - index - 0.5 + stagger) * slotSpacing + travel,
      latitudeSpan
    ) - wrapLimit

  // Move before Card's visibility checks; retain each card's identity on wrap.
  useFrame(({ clock }) => {
    if (!columns.current) return
    const travel = clock.elapsedTime * latitudeSpeed * direction
    for (const column of columns.current.children) {
      column.children.forEach((card, index) => {
        card.rotation.x = -getLatitude(index, travel)
      })
    }
  }, -1)

  return (
    <group ref={columns}>
      {[0, Math.PI].map((longitude) => (
        // Turn the far-side cards outward while keeping their tops toward north.
        <group key={longitude} rotation={[0, longitude, 0]}>
          {Array.from({ length: cardCount }, (_, index) => {
            const latitude = getLatitude(index, 0)
            return (
              <group key={index} rotation={[-latitude, 0, 0]}>
                <Card
                  radius={radius}
                  width={width}
                  fadeStart={fadeStart}
                  fadeEnd={wrapLimit}
                  project={
                    projects[(index * 2 + letterOffset) % projects.length]
                  }
                />
              </group>
            )
          })}
        </group>
      ))}
    </group>
  )
}
