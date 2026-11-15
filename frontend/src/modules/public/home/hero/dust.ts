// The particle layer of the Home hero. The only module that imports three.js; loaded with import().
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  OrthographicCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three'
import { isDust, isInk, samplePoints, type Pixels, type Points as Sampled } from './sampling'

export type Dust = { render(travel: number, opacity: number): void; layout(): void; dispose(): void }

const vertexShader = /* glsl */ `
attribute vec2 aTarget;
attribute vec3 aColor;
attribute float aSeed;
uniform float uTravel;
uniform float uSize;
uniform float uSwirl;
uniform vec3 uAccent;
varying vec3 vColor;
void main() {
  float t = clamp((uTravel - aSeed * 0.35) / 0.65, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t);
  vec2 p = mix(position.xy, aTarget, t);
  float angle = aSeed * 6.2832 + t * 4.0;
  p += vec2(cos(angle), sin(angle)) * sin(t * 3.14159) * uSwirl; // zero at both ends
  vColor = mix(aColor, uAccent, t);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 0.0, 1.0);
  gl_PointSize = uSize;
}
`

const fragmentShader = /* glsl */ `
uniform float uOpacity;
varying vec3 vColor;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  gl_FragColor = vec4(vColor, uOpacity * (1.0 - smoothstep(0.2, 0.5, d)));
}
`

const SAMPLE_SIZE = 256
const none: Sampled = { positions: new Float32Array(0), colors: new Float32Array(0) }

function pixelsOf(canvas: HTMLCanvasElement, draw: (ctx: CanvasRenderingContext2D) => void): Pixels | null {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  draw(ctx)
  return ctx.getImageData(0, 0, canvas.width, canvas.height)
}

// Points of the final dust cloud, in 0..1 of the frame box.
function sampleImage(image: HTMLImageElement, count: number): Sampled {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = SAMPLE_SIZE
  const pixels = pixelsOf(canvas, (ctx) => ctx.drawImage(image, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE))
  return pixels ? samplePoints(pixels, count, isDust) : none
}

// Points of the target text, drawn with its own font, in 0..1 of its box.
function sampleText(target: HTMLElement, rect: DOMRect, count: number): Sampled {
  const width = Math.ceil(rect.width)
  const height = Math.ceil(rect.height)
  if (!width || !height) return none
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const style = getComputedStyle(target)
  const pixels = pixelsOf(canvas, (ctx) => {
    ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
    ctx.letterSpacing = style.letterSpacing
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = 'black' // sampling mask only, never shown
    ctx.fillText(target.textContent ?? '', width / 2, height / 2)
  })
  return pixels ? samplePoints(pixels, count, isInk) : none
}

export async function createDust(o: {
  canvas: HTMLCanvasElement
  stage: HTMLElement
  frameBox: HTMLElement
  target: HTMLElement
  imageUrl: string
  count: number
  onLost: () => void
}): Promise<Dust | null> {
  const image = new Image()
  image.src = o.imageUrl
  try {
    await image.decode()
  } catch {
    return null
  }
  const start = sampleImage(image, o.count)
  if (start.positions.length === 0) return null

  let renderer: WebGLRenderer
  try {
    renderer = new WebGLRenderer({ canvas: o.canvas, alpha: true, antialias: false })
  } catch {
    return null
  }
  const ratio = Math.min(window.devicePixelRatio || 1, 2)
  renderer.setPixelRatio(ratio)

  const accent = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim()
  const camera = new OrthographicCamera(0, 1, 0, 1, -1, 1) // stage pixels, y down
  const geometry = new BufferGeometry()
  const material = new ShaderMaterial({
    uniforms: {
      uTravel: { value: 0 },
      uOpacity: { value: 0 },
      uSize: { value: 2 * ratio },
      uSwirl: { value: 0 },
      // three.js stores colours as linear; the shader writes sRGB (like the sampled colours), so convert back.
      uAccent: { value: new Color(accent).convertLinearToSRGB() },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  })
  const points = new Points(geometry, material)
  points.frustumCulled = false
  const scene = new Scene()
  scene.add(points)
  const seeds = Float32Array.from({ length: o.count }, () => Math.random())
  geometry.setAttribute('aSeed', new BufferAttribute(seeds, 1))
  geometry.setAttribute('aColor', new BufferAttribute(start.colors, 3))

  // Measures stage, frame box and name, and rebuilds start and target positions. False when the
  // text cannot be sampled (zero size, no 2D context): the previous positions stay.
  const layout = (): boolean => {
    const stage = o.stage.getBoundingClientRect()
    const box = o.frameBox.getBoundingClientRect()
    const t = o.target.getBoundingClientRect()
    const text = sampleText(o.target, t, o.count)
    if (text.positions.length === 0 || stage.width === 0) return false
    renderer.setSize(stage.width, stage.height, false)
    camera.right = stage.width
    camera.bottom = stage.height
    camera.updateProjectionMatrix()
    const position = new Float32Array(o.count * 3)
    const target = new Float32Array(o.count * 2)
    for (let i = 0; i < o.count; i++) {
      position[i * 3] = box.left - stage.left + start.positions[i * 2] * box.width
      position[i * 3 + 1] = box.top - stage.top + start.positions[i * 2 + 1] * box.height
      target[i * 2] = t.left - stage.left + text.positions[i * 2] * t.width
      target[i * 2 + 1] = t.top - stage.top + text.positions[i * 2 + 1] * t.height
    }
    geometry.setAttribute('position', new BufferAttribute(position, 3))
    geometry.setAttribute('aTarget', new BufferAttribute(target, 2))
    material.uniforms.uSwirl.value = box.width * 0.12
    return true
  }

  const onContextLost = () => o.onLost()
  const dispose = () => {
    o.canvas.removeEventListener('webglcontextlost', onContextLost)
    geometry.dispose()
    material.dispose()
    renderer.dispose()
  }

  if (!layout()) {
    dispose()
    return null
  }
  o.canvas.addEventListener('webglcontextlost', onContextLost)

  return {
    render(travel, opacity) {
      material.uniforms.uTravel.value = travel
      material.uniforms.uOpacity.value = opacity
      renderer.render(scene, camera)
    },
    layout: () => void layout(),
    dispose,
  }
}
