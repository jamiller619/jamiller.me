import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { AdditiveBlending, MathUtils, type ShaderMaterial } from 'three'

const vertexShader = /* glsl */ `
  uniform float time;
  uniform float pixelRatio;
  attribute float seed;
  attribute float dust;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 direction = normalize(position);
    float ripple = sin(direction.y * 13.0 + direction.x * 7.0 + time * 0.4);
    vec3 p = position * (1.0 + ripple * 0.012);
    float angle = time * 0.035;
    p.xz = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * p.xz;
    vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
    vec3 viewNormal = normalize(normalMatrix * normalize(p));
    float facing = abs(dot(viewNormal, normalize(-viewPosition.xyz)));
    float rim = pow(1.0 - facing, 2.0);

    // Preserve the original orb's blue-to-pink palette and gold at the right edge.
    float warm = smoothstep(-0.45, 0.65, viewNormal.x - viewNormal.y * 0.7);
    vColor = mix(vec3(0.015, 0.55, 1.0), vec3(1.0, 0.015, 0.26), warm);
    float gold = pow(clamp(viewNormal.x, 0.0, 1.0), 5.0)
      * max(0.0, 1.0 - abs(viewNormal.y));
    vColor = mix(vColor, vec3(1.0, 0.42, 0.06), gold);

    // Uneven arcs concentrate light along a few portions of the silhouette.
    float edgeAngle = atan(viewNormal.y, viewNormal.x);
    float arcs = pow(0.5 + 0.5 * sin(edgeAngle * 3.0 + time * 0.12), 6.0);
    float highlight = rim * arcs;
    vColor *= 1.0 + highlight * 2.5;
    float shimmer = 0.8 + 0.2 * sin(time * 0.6 + seed * 40.0);
    vAlpha = min(1.0, 0.24 + rim * 0.7 + highlight * 0.6)
      * mix(0.7, 1.0, seed) * shimmer;
    vAlpha *= mix(1.0, 0.65, dust);

    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = clamp((1.5 + seed * 1.8) * pixelRatio * 3.2 / -viewPosition.z,
      1.5 * pixelRatio, 6.0 * pixelRatio);
  }
`

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float r = length(gl_PointCoord - 0.5) * 2.0;
    float light = exp(-2.0 * r * r) * (1.0 - smoothstep(0.7, 1.0, r));
    gl_FragColor = vec4(vColor, light * vAlpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

export default function ParticleSphere({ radius }: { radius: number }) {
  const material = useRef<ShaderMaterial>(null)
  const uniforms = useMemo(
    () => ({ time: { value: 0 }, pixelRatio: { value: 1 } }),
    []
  )
  const particles = useMemo(() => {
    const count = 18000
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count)
    const dust = new Float32Array(count)
    let state = 73
    const random = () => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0
      return state / 4294967296
    }
    for (let i = 0; i < count;) {
      const y = random() * 2 - 1
      const angle = random() * Math.PI * 2
      const ring = Math.sqrt(1 - y * y)
      const x = Math.cos(angle) * ring
      const z = Math.sin(angle) * ring
      // Keep the shell intact, but populate some regions more densely.
      // Match the atmosphere's broad patches and finer wisps.
      const broad = Math.sin(x * 3 + y * 2 + 0.7) * Math.cos(y * 4 - x + 1.2)
      const detail = Math.sin(x * 9 + y * 7 + 0.4)
      const density = MathUtils.smoothstep(
        broad * 0.8 + detail * 0.2,
        -0.7,
        0.7
      )
      // Use Atmosphere's coverage curve, with only a trace of dust in its voids.
      const coverage = MathUtils.smoothstep(density, 0.3, 0.9)
      if (random() > 0.02 + coverage * 0.98) continue
      const isDust = i >= count * 0.8
      // A thin shell defines the sphere; loose dust breaks up its silhouette.
      const distance = isDust
        ? 1.02 + random() ** 2 * 0.45
        : 1 + (random() - 0.5) * 0.035
      positions.set([x * distance, y * distance, z * distance], i * 3)
      seeds[i] = random()
      dust[i] = isDust ? 1 : 0
      i++
    }
    return { positions, seeds, dust }
  }, [])

  useFrame(({ gl }, delta) => {
    if (!material.current) return
    material.current.uniforms.time.value += Math.min(delta, 0.1)
    material.current.uniforms.pixelRatio.value = gl.getPixelRatio()
  })

  return (
    <group scale={radius}>
      {/* The opaque core writes depth before the transparent particles and haze. */}
      <mesh layers-mask={2} raycast={() => {}}>
        <sphereGeometry args={[0.98, 96, 64]} />
        <meshBasicMaterial color="#050914" depthWrite depthTest />
      </mesh>
      <points layers-mask={2}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particles.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-seed"
            args={[particles.seeds, 1]}
          />
          <bufferAttribute
            attach="attributes-dust"
            args={[particles.dust, 1]}
          />
        </bufferGeometry>
        <shaderMaterial
          ref={material}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </points>
    </group>
  )
}
