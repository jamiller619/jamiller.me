import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { MathUtils, Spherical } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export default function SoftOrbitControls() {
  const { camera, gl } = useThree()
  const controls = useRef<OrbitControls | null>(null)
  const angles = useMemo(
    () => ({ current: new Spherical(), target: new Spherical() }),
    []
  )

  useEffect(() => {
    // Clamp the input camera; let the visible camera settle toward its limit.
    const orbit = new OrbitControls(camera.clone(), gl.domElement)
    orbit.enablePan = false
    orbit.enableZoom = false
    orbit.enableDamping = true
    orbit.dampingFactor = 0.08
    // Drift horizontally once every ten minutes; pause while dragging.
    orbit.autoRotate = true
    orbit.autoRotateSpeed = 0.1
    orbit.minPolarAngle = (70 * Math.PI) / 180
    orbit.maxPolarAngle = (110 * Math.PI) / 180
    angles.current.setFromVector3(camera.position)
    controls.current = orbit
    return () => {
      orbit.dispose()
      controls.current = null
    }
  }, [camera, gl, angles])

  // Update before card visibility checks and the postprocessing render.
  useFrame((_, delta) => {
    const orbit = controls.current
    if (!orbit) return
    orbit.update(delta)
    angles.target.setFromVector3(orbit.object.position)
    angles.current.radius = angles.target.radius
    angles.current.theta = angles.target.theta
    angles.current.phi = MathUtils.damp(
      angles.current.phi,
      angles.target.phi,
      10,
      Math.min(delta, 0.1)
    )
    camera.position.setFromSpherical(angles.current)
    camera.lookAt(orbit.target)
  }, -1)

  return null
}
