import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { AdditiveBlending, Matrix3, Matrix4, type Mesh } from 'three'

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform mat3 viewToOrb;
  varying vec2 vUv;
  void main() {
    vec2 p = (vUv - 0.5) * 3.6;
    float radius = length(p);
    float altitude = max(radius - 1.0, 0.0);
    vec2 direction = p / max(radius, 0.0001);
    // Sample the rotating sphere's surface so patches travel with the particles.
    vec3 surface = normalize(vec3(p, sqrt(max(0.0, 1.0 - dot(p, p)))));
    vec3 local = viewToOrb * surface;
    float broad = sin(local.x * 3.0 + local.y * 2.0 + 0.7)
      * cos(local.y * 4.0 - local.x + 1.2);
    float detail = sin(local.x * 9.0 + local.y * 7.0 + 0.4);
    float density = smoothstep(-0.7, 0.7, broad * 0.8 + detail * 0.2);
    // Leave clear gaps between the denser patches, with soft boundaries.
    float coverage = smoothstep(0.30, 0.90, density);

    // A thin luminous limb gives way to a broad, faint outer atmosphere.
    float limbWidth = mix(0.055, 0.12, density);
    float hazeWidth = mix(0.10, 0.27, density);
    float limb = exp(-pow((radius - 1.02) / limbWidth, 2.0)) * 0.22;
    float haze = exp(-altitude / hazeWidth) * 0.10;
    float atmosphere = (limb + haze) * 1.35 * coverage
      * smoothstep(0.78, 1.0, radius)
      * (1.0 - smoothstep(1.5, 1.8, radius));

    // Match the particles: cool blue on the left, rose and gold on the right.
    float warm = smoothstep(-0.45, 0.65, direction.x - direction.y * 0.7);
    vec3 color = mix(vec3(0.06, 0.48, 1.0), vec3(1.0, 0.08, 0.32), warm);
    float gold = pow(max(direction.x, 0.0), 5.0) * (1.0 - abs(direction.y));
    color = mix(color, vec3(1.0, 0.48, 0.12), gold);
    gl_FragColor = vec4(color, atmosphere);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

export default function Atmosphere({ radius }: { radius: number }) {
  const mesh = useRef<Mesh>(null)
  const time = useRef(0)
  const transform = useMemo(() => new Matrix4(), [])
  const uniforms = useMemo(() => ({ viewToOrb: { value: new Matrix3() } }), [])
  useFrame(({ camera }, delta) => {
    if (mesh.current) mesh.current.quaternion.copy(camera.quaternion)
    // Match ParticleSphere's spin and capped time step exactly.
    time.current += Math.min(delta, 0.1)
    camera.updateMatrixWorld()
    transform.makeRotationY(-time.current * 0.035).multiply(camera.matrixWorld)
    uniforms.viewToOrb.value.setFromMatrix4(transform)
  })

  return (
    <mesh ref={mesh} layers-mask={2} raycast={() => {}}>
      <planeGeometry args={[radius * 3.6, radius * 3.6]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </mesh>
  )
}
