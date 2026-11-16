import { ACESFilmicToneMapping, PerspectiveCamera, RenderPipeline, Scene, WebGPURenderer } from 'three/webgpu'
import { clamp, float, luminance, pass, uniform, vec4 } from 'three/tsl'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { bloom } from 'three/addons/tsl/display/BloomNode.js'
import { BlackHoleSimulation } from './vendor/webgpu-black-hole/blackhole.js'
import { defaultConfig } from './vendor/webgpu-black-hole/defaults.js'
import { HERO, smooth } from './heroTimeline'

export type BlackHoleLayer = {
  render(progress: number, scale: number): void
  layout(width: number, height: number): void
  dispose(): Promise<void>
}

// Upstream simulation, camera, controls and bloom; the host owns scroll and the white surface.
export async function createBlackHoleLayer(canvas: HTMLCanvasElement, onLost: () => void): Promise<BlackHoleLayer> {
  const renderer = new WebGPURenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' })
  renderer.toneMapping = ACESFilmicToneMapping
  renderer.setClearColor(0, 0)
  const scene = new Scene()
  const camera = new PerspectiveCamera(60, 1, 0.1, 1000)
  camera.position.set(0, -5, 20)
  camera.lookAt(0, 0, 0)
  const controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.rotateSpeed = -0.5
  controls.enablePan = false
  controls.enableZoom = false // the wheel belongs to the native page scroll
  controls.minPolarAngle = 0.05
  controls.maxPolarAngle = Math.PI - 0.05
  controls.target.set(0, 0, 0)
  canvas.style.touchAction = 'pan-y pinch-zoom'
  canvas.style.pointerEvents = 'auto'
  canvas.style.cursor = 'grab'

  const simulation = new BlackHoleSimulation(scene, {
    ...defaultConfig,
    starsEnabled: false, // the separate star field must all disappear into the hole
    nebulaEnabled: false,
    starBackgroundColor: '#000000',
  })
  const scaleUniform = uniform(1)
  simulation.uniforms.sceneScale = scaleUniform
  simulation.createBlackHole()
  const mesh = simulation.blackHoleMesh
  // Preserve coverage alpha for the white host instead of forcing the opaque demo background.
  mesh.material.fragmentNode = mesh.material.colorNode
  mesh.material.colorNode = null
  const scenePass = pass(scene, camera)
  const color = scenePass.getTextureNode()
  const glow = bloom(color, defaultConfig.bloomStrength, defaultConfig.bloomRadius, defaultConfig.bloomThreshold)
  // Boost coverage on white so the original thin luminous arcs retain green contrast.
  const coverage = clamp(color.a.mul(6).add(clamp(luminance(glow.rgb).mul(1.5), 0, 0.45)), 0, 1)
  const pipeline = new RenderPipeline(renderer)
  pipeline.outputNode = vec4(color.rgb.add(glow.rgb).div(coverage.max(float(0.001))), coverage)
  let disposed = false
  let fitScale = 1
  let previousTime: number | undefined
  const lost = (event: Event) => {
    event.preventDefault()
    if (!disposed) onLost()
  }
  const dispose = async () => {
    if (disposed) return
    disposed = true
    canvas.removeEventListener('webglcontextlost', lost)
    controls.dispose()
    glow.dispose()
    scenePass.dispose()
    pipeline.dispose()
    mesh.geometry.dispose()
    mesh.material.dispose()
    try {
      await renderer.dispose()
    } catch {
      // A failed GPU init may reject again during teardown; keep the original error.
    }
  }
  try {
    await renderer.init()
    renderer.onDeviceLost = () => {
      if (!disposed) onLost()
    }
    canvas.addEventListener('webglcontextlost', lost)
    await renderer.compileAsync(scene, camera)
  } catch (error) {
    await dispose()
    throw error
  }
  return {
    layout(width, height) {
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      simulation.onResize(width, height)
      fitScale = Math.min(1, (width / height) * 0.65)
      const ratio = Math.min(1.5, 1440 / width, 1000 / height)
      renderer.setPixelRatio(1)
      renderer.setSize(Math.round(width * ratio), Math.round(height * ratio), false)
    },
    render(progress, scale) {
      if (disposed) return
      controls.enabled = scale > 0
      canvas.style.pointerEvents = scale > 0 ? 'auto' : 'none'
      canvas.style.visibility = scale > 0 ? 'visible' : 'hidden'
      if (scale <= 0) {
        previousTime = undefined
        return
      }
      controls.update()
      const now = performance.now() / 1000
      const delta = previousTime === undefined ? 0 : Math.min(now - previousTime, 0.033)
      previousTime = now
      // The disk spins up and burns brighter while it swallows the last stars and we fall in.
      const heat = smooth(progress, ...HERO.heat)
      const u = simulation.uniforms
      const { diskBrightness } = defaultConfig
      u.diskBrightness.value = diskBrightness * (1 + 0.25 * heat)
      simulation.update(delta * (1 + 5 * heat), camera)
      scaleUniform.value = scale * fitScale
      pipeline.render()
    },
    dispose,
  }
}
