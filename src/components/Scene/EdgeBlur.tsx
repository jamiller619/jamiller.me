import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { HalfFloatType, Vector2, WebGLRenderTarget } from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'

// CSS pixels: keep the effect consistent across screen sizes and pixel densities.
const maxBlur = 16
const edgeWidth = 0.24

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const blurShader = {
  uniforms: {
    tDiffuse: { value: null },
    resolution: { value: new Vector2(1, 1) },
    direction: { value: new Vector2(1, 0) },
    maxBlur: { value: maxBlur },
    edgeWidth: { value: edgeWidth },
  },
  vertexShader,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    uniform vec2 direction;
    uniform float maxBlur;
    uniform float edgeWidth;
    varying vec2 vUv;

    void main() {
      vec2 edgeDistance = min(vUv, 1.0 - vUv) * resolution;
      float distanceToEdge = min(edgeDistance.x, edgeDistance.y);
      float band = min(resolution.x, resolution.y) * edgeWidth;
      float strength = 1.0 - smoothstep(0.0, band, distanceToEdge);
      float sigma = maxBlur * strength;

      if (sigma < 0.1) {
        gl_FragColor = texture2D(tDiffuse, vUv);
        return;
      }

      // Separable Gaussian, with a spatially varying radius. Average RGBA
      // together so transparent gaps remain transparent instead of turning black.
      vec4 color = vec4(0.0);
      float totalWeight = 0.0;
      for (int i = -12; i <= 12; i++) {
        float offset = float(i) / 4.0;
        float weight = exp(-0.5 * offset * offset);
        vec2 sampleUv = vUv + direction * offset * sigma / resolution;
        color += texture2D(tDiffuse, clamp(sampleUv, 0.0, 1.0)) * weight;
        totalWeight += weight;
      }
      gl_FragColor = color / totalWeight;
    }
  `,
}

export default function EdgeBlur() {
  const { gl, scene, camera, size, viewport } = useThree()
  const pipeline = useRef<{
    composer: EffectComposer
    horizontal: ShaderPass
    vertical: ShaderPass
  } | null>(null)

  useEffect(() => {
    const target = new WebGLRenderTarget(1, 1, {
      type: HalfFloatType,
      samples: Math.min(4, gl.capabilities.maxSamples),
    })
    const composer = new EffectComposer(gl, target)
    const render = new RenderPass(scene, camera)
    const horizontal = new ShaderPass(blurShader)
    const vertical = new ShaderPass(blurShader)
    vertical.uniforms.direction.value.set(0, 1)
    const output = new ShaderPass({
      uniforms: { tDiffuse: { value: null } },
      vertexShader,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        varying vec2 vUv;
        void main() {
          gl_FragColor = texture2D(tDiffuse, vUv);
          // Unpremultiply before color conversion, then restore the canvas's
          // premultiplied alpha to avoid bright fringes on either color scheme.
          gl_FragColor.rgb /= max(gl_FragColor.a, 0.00001);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          gl_FragColor.rgb *= gl_FragColor.a;
        }
      `,
    })
    composer.addPass(render)
    composer.addPass(horizontal)
    composer.addPass(vertical)
    composer.addPass(output)
    pipeline.current = { composer, horizontal, vertical }

    return () => {
      pipeline.current = null
      render.dispose()
      horizontal.dispose()
      vertical.dispose()
      output.dispose()
      composer.dispose()
    }
  }, [gl, scene, camera])

  useEffect(() => {
    if (!pipeline.current) return
    const { composer, horizontal, vertical } = pipeline.current
    composer.setPixelRatio(viewport.dpr)
    composer.setSize(size.width, size.height)
    horizontal.uniforms.resolution.value.set(size.width, size.height)
    vertical.uniforms.resolution.value.set(size.width, size.height)
  }, [gl, scene, camera, size.width, size.height, viewport.dpr])

  // Render after the cards and controls update. Raycasting still uses the
  // original scene; the fullscreen passes never become interaction targets.
  useFrame((state, delta) => {
    if (pipeline.current) pipeline.current.composer.render(delta)
    else state.gl.render(state.scene, state.camera)
  }, 1)

  return null
}
