import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import {
  AdditiveBlending,
  Box3,
  Euler,
  Mesh,
  Quaternion,
  Vector3,
  type BufferGeometry,
  type Points,
  type ShaderMaterial,
} from 'three'
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import modelUrl from '../../assets/jam.glb?url'

const maxYaw = (12 * Math.PI) / 180
const maxPitch = (8 * Math.PI) / 180
const objectSpacing = 0.85

const vertexShader = /* glsl */ `
  uniform float time;
  uniform float pixelRatio;
  attribute float seed;
  attribute float dust;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Each particle wanders around its surface sample; the emblem stays still.
    float phase = seed * 40.0;
    vec3 drift = vec3(
      sin(time * 0.4 + phase),
      sin(time * 0.31 + phase * 1.7),
      cos(time * 0.37 + phase * 2.3)
    );
    vec3 p = position + drift * mix(0.006, 0.025, dust);
    vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
    vec3 viewNormal = normalize(normalMatrix * normal);
    vec3 paletteDirection = normalize(normalMatrix * normalize(p));
    float facing = abs(dot(viewNormal, normalize(-viewPosition.xyz)));
    float rim = pow(1.0 - facing, 2.0);

    // Preserve the original orb's blue-to-pink palette and gold at the right edge.
    float warm = smoothstep(-0.45, 0.65, paletteDirection.x - paletteDirection.y * 0.7);
    vColor = mix(vec3(0.015, 0.55, 1.0), vec3(1.0, 0.015, 0.26), warm);
    float gold = pow(clamp(paletteDirection.x, 0.0, 1.0), 5.0)
      * max(0.0, 1.0 - abs(paletteDirection.y));
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

export default function ParticleModel({ radius }: { radius: number }) {
  const { scene } = useGLTF(modelUrl)
  const points = useRef<Points>(null)
  const material = useRef<ShaderMaterial>(null)
  const tilt = useMemo(
    () => ({
      direction: new Vector3(),
      rotation: new Euler(),
      quaternion: new Quaternion(),
    }),
    []
  )
  const uniforms = useMemo(
    () => ({ time: { value: 0 }, pixelRatio: { value: 1 } }),
    []
  )
  const particles = useMemo(() => {
    const count = 18000
    const positions = new Float32Array(count * 3)
    const normals = new Float32Array(count * 3)
    const seeds = new Float32Array(count)
    const dust = new Float32Array(count)
    let state = 73
    const random = () => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0
      return state / 4294967296
    }
    // Bake every object's transform before sampling so the emblem keeps its layout.
    scene.updateMatrixWorld(true)
    const geometries: BufferGeometry[] = []
    scene.traverse((object) => {
      if (!(object instanceof Mesh)) return
      const geometry = object.geometry.index
        ? object.geometry.toNonIndexed()
        : object.geometry.clone()
      geometry.applyMatrix4(object.matrixWorld)
      for (const attribute of Object.keys(geometry.attributes)) {
        if (attribute !== 'position' && attribute !== 'normal') {
          geometry.deleteAttribute(attribute)
        }
      }
      if (!geometry.getAttribute('normal')) geometry.computeVertexNormals()
      geometries.push(geometry)
    })

    // Pull the three pieces inward without compressing their individual shapes.
    const layoutBounds = new Box3()
    for (const part of geometries) {
      part.computeBoundingBox()
      layoutBounds.union(part.boundingBox!)
    }
    const layoutCenter = layoutBounds.getCenter(new Vector3())
    const partCenter = new Vector3()
    for (const part of geometries) {
      part.boundingBox!.getCenter(partCenter)
      part.translate(
        (partCenter.x - layoutCenter.x) * (objectSpacing - 1),
        0,
        0
      )
    }
    // Tighten the first gap further, leaving a little breathing room.
    const [left, middle, right] = [...geometries].sort(
      (a, b) => a.boundingBox!.min.x - b.boundingBox!.min.x
    )
    if (left && middle) {
      const gap = middle.boundingBox!.min.x - left.boundingBox!.max.x
      left.translate(Math.max(0, gap) * 0.75, 0, 0)
    }
    if (middle && right) {
      const gap = right.boundingBox!.min.x - middle.boundingBox!.max.x
      right.translate(-Math.max(0, gap) * 0.2, 0, 0)
    }
    const geometry = mergeGeometries(geometries)
    geometries.forEach((part) => part.dispose())
    if (!geometry) throw new Error('The JAM model has no sampleable geometry')

    // The asset lies on the X/Z plane; present its face to the camera.
    geometry.rotateX(Math.PI / 2)
    const bounds = new Box3().setFromBufferAttribute(
      geometry.getAttribute('position')
    )
    const center = bounds.getCenter(new Vector3())
    const size = bounds.getSize(new Vector3())
    const scale = 2 / Math.max(size.x, size.y, size.z)
    geometry.translate(-center.x, -center.y, -center.z)
    geometry.scale(scale, scale, scale)
    const sampler = new MeshSurfaceSampler(new Mesh(geometry))
      .setRandomGenerator(random)
      .build()
    const position = new Vector3()
    const normal = new Vector3()
    for (let i = 0; i < count; i++) {
      sampler.sample(position, normal)
      const isDust = i >= count * 0.8
      // Keep dust near the model's surfaces so the gaps between objects stay clear.
      position.addScaledVector(
        normal,
        isDust ? random() ** 2 * 0.12 : (random() - 0.5) * 0.015
      )
      position.toArray(positions, i * 3)
      normal.toArray(normals, i * 3)
      seeds[i] = random()
      dust[i] = isDust ? 1 : 0
    }
    geometry.dispose()
    return { positions, normals, seeds, dust }
  }, [scene])

  useFrame(({ camera, gl }, delta) => {
    if (points.current) {
      // Add a small camera-relative tilt. Normalized direction stays continuous
      // through a full orbit and bounds the tilt so the emblem never flips.
      tilt.direction.copy(camera.position).normalize()
      tilt.rotation.set(
        tilt.direction.y * maxPitch,
        -tilt.direction.x * maxYaw,
        0
      )
      tilt.quaternion.setFromEuler(tilt.rotation)
      points.current.quaternion
        .copy(camera.quaternion)
        .multiply(tilt.quaternion)
    }
    if (!material.current) return
    material.current.uniforms.time.value += Math.min(delta, 0.1)
    material.current.uniforms.pixelRatio.value = gl.getPixelRatio()
  })

  return (
    <points ref={points} scale={radius * 2} layers-mask={2}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-normal"
          args={[particles.normals, 3]}
        />
        <bufferAttribute attach="attributes-seed" args={[particles.seeds, 1]} />
        <bufferAttribute attach="attributes-dust" args={[particles.dust, 1]} />
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
  )
}
