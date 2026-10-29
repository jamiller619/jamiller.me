import { Billboard } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { AdditiveBlending, type ShaderMaterial } from 'three'

const palette = /* glsl */ `
  vec3 glowColor(vec3 p) {
    float warm = smoothstep(-0.45, 0.65, p.x - p.y * 0.7);
    vec3 color = mix(vec3(0.015, 0.55, 1.0), vec3(1.0, 0.015, 0.26), warm);
    float gold = pow(clamp(p.x, 0.0, 1.0), 5.0) * max(0.0, 1.0 - abs(p.y));
    return mix(color, vec3(1.0, 0.42, 0.06), gold);
  }
`

const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDirection;
  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewDirection = -viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`

const fragmentShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDirection;
  void main() {
    float facing = max(dot(normalize(vNormal), normalize(vViewDirection)), 0.0);
    float rim = pow(1.0 - facing, 4.0);
    vec3 color = vec3(0.003, 0.005, 0.025);
    // Keep the body dark; the separate halo carries the colored emission.
    float edgeFade = smoothstep(0.0, 0.75, facing);
    gl_FragColor = vec4(color, (0.65 + rim * 0.35) * edgeFade);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

const particleVertex = /* glsl */ `
  uniform float time;
  attribute float sparkle;
  attribute vec4 drift;
  attribute float particleSize;
  varying vec3 vColor;
  varying float vSparkle;
  ${palette}
  void main() {
    float angle = time * drift.w;
    // Independent rotation axes let particles wander in different directions
    // while preserving their distance from the orb.
    vec3 axis = drift.xyz;
    vec3 drifting = position * cos(angle)
      + cross(axis, position) * sin(angle)
      + axis * dot(axis, position) * (1.0 - cos(angle));
    vec4 viewPosition = modelViewMatrix * vec4(drifting, 1.0);
    vColor = glowColor(normalize(drifting));
    vSparkle = sparkle;
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = clamp(particleSize * 2.5 / -viewPosition.z, 1.0, 16.0) * 2.5;
  }
`

const particleFragment = /* glsl */ `
  varying vec3 vColor;
  varying float vSparkle;
  void main() {
    float distanceToCenter = length(gl_PointCoord - 0.5) * 2.0;
    // A wider Gaussian glow softens each point without blurring the cards.
    float light = exp(-4.5 * distanceToCenter * distanceToCenter)
      * (1.0 - smoothstep(0.7, 1.0, distanceToCenter));
    gl_FragColor = vec4(mix(vColor, vec3(1.0), vSparkle * 0.45) * 2.0,
      light * (0.25 + vSparkle * 0.75) * 0.18);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

const haloVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const haloFragment = /* glsl */ `
  varying vec2 vUv;
  ${palette}
  void main() {
    vec2 p = (vUv - 0.5) * 4.4;
    float r = length(p);
    // Start outside the silhouette and disperse the color into the surrounding space.
    float outerDistance = max(r - 1.0, 0.0);
    float halo = exp(-pow(outerDistance / 0.35, 2.0)) * 0.22;
    halo += exp(-pow(outerDistance / 0.7, 2.0)) * 0.055;
    halo *= smoothstep(1.0, 1.06, r) * (1.0 - smoothstep(1.65, 2.2, r));
    gl_FragColor = vec4(glowColor(vec3(p, 0.0)), halo);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

export default function Orb({ radius }: { radius: number }) {
  const particleMaterial = useRef<ShaderMaterial>(null)
  const particleUniforms = useMemo(() => ({ time: { value: 0 } }), [])
  useFrame((_, delta) => {
    if (!particleMaterial.current) return
    particleMaterial.current.uniforms.time.value += Math.min(delta, 0.1)
  })

  const particles = useMemo(() => {
    const count = 2200
    const positions = new Float32Array(count * 3)
    const sparkles = new Float32Array(count)
    const drifts = new Float32Array(count * 4)
    const sizes = new Float32Array(count)
    let seed = 42
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
      return seed / 4294967296
    }
    for (let index = 0; index < count; index++) {
      const y = random() * 2 - 1
      const angle = random() * Math.PI * 2
      const ring = Math.sqrt(1 - y * y)
      // Keep only a small inner cloud; distribute the rest uniformly by volume
      // through a broad outer shell instead of biasing them toward the center.
      const distance =
        index < count * 0.2
          ? 1.2 + random() * 0.6
          : Math.cbrt(1.8 ** 3 + random() * (4 ** 3 - 1.8 ** 3))
      positions.set(
        [
          Math.cos(angle) * ring * distance,
          y * distance,
          Math.sin(angle) * ring * distance,
        ],
        index * 3
      )
      sparkles[index] = random() ** 3
      const axisY = random() * 2 - 1
      const axisAngle = random() * Math.PI * 2
      const axisRing = Math.sqrt(1 - axisY * axisY)
      drifts.set(
        [
          Math.cos(axisAngle) * axisRing,
          axisY,
          Math.sin(axisAngle) * axisRing,
          (0.015 + random() * 0.04) * (random() < 0.5 ? -1 : 1),
        ],
        index * 4
      )
      // Mostly fine dust, with occasional larger points independent of speed.
      sizes[index] = 0.7 + random() ** 4 * 11.3
    }
    return { positions, sparkles, drifts, sizes }
  }, [])

  return (
    <group scale={radius}>
      <mesh>
        <sphereGeometry args={[1, 96, 64]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite={false}
        />
      </mesh>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particles.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-sparkle"
            args={[particles.sparkles, 1]}
          />
          <bufferAttribute
            attach="attributes-drift"
            args={[particles.drifts, 4]}
          />
          <bufferAttribute
            attach="attributes-particleSize"
            args={[particles.sizes, 1]}
          />
        </bufferGeometry>
        <shaderMaterial
          ref={particleMaterial}
          vertexShader={particleVertex}
          fragmentShader={particleFragment}
          uniforms={particleUniforms}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>
      <Billboard>
        <mesh>
          <planeGeometry args={[4.4, 4.4]} />
          <shaderMaterial
            vertexShader={haloVertex}
            fragmentShader={haloFragment}
            transparent
            depthWrite={false}
            blending={AdditiveBlending}
          />
        </mesh>
      </Billboard>
    </group>
  )
}
