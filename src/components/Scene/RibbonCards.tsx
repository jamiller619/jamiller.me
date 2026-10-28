import Card from './Card'
import { projects } from './projects'

export default function RibbonCards({
  radius,
  ribbonWidth,
  ribbonSpacing,
  stagger = 0,
  letterOffset = 0,
}: {
  radius: number
  ribbonWidth: number
  ribbonSpacing: number
  stagger?: number
  letterOffset?: number
}) {
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
  // Use the same size for both stagger phases: five centered cards or four
  // offset cards per side, without squeezing their spacing or polar clearance.
  while (layout.latitudeLimit < 2 * layout.latitudeStep) {
    width *= 0.95
    layout = getLayout(width)
  }
  const { latitudeStep, latitudeLimit } = layout
  // Offset the grid, then clip both ends independently to the same latitude.
  const first = Math.ceil(-latitudeLimit / latitudeStep - stagger)
  const last = Math.floor(latitudeLimit / latitudeStep - stagger)

  return (
    <group>
      {[0, Math.PI].map((longitude) => (
        // Turn the far-side cards outward while keeping their tops toward north.
        <group key={longitude} rotation={[0, longitude, 0]}>
          {Array.from({ length: last - first + 1 }, (_, index) => {
            const latitude = (last - index + stagger) * latitudeStep
            return (
              <group key={index} rotation={[-latitude, 0, 0]}>
                <Card
                  radius={radius}
                  width={width}
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
