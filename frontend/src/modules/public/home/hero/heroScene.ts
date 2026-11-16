import {
  Color,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  InstancedMesh,
  Mesh,
  Object3D,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three'
import { createBlackHoleLayer, type BlackHoleLayer } from './blackHoleLayer'
import { modelState } from './heroTimeline'

export type HeroScene = { render(progress: number): boolean; layout(): void; dispose(): void }
type Options = {
  canvas: HTMLCanvasElement
  holeCanvas: HTMLCanvasElement
  stage: HTMLElement
  count: number
  onLost(): void
}

// Fixed seeds keep the sky identical across resize and reverse scrolling.
const seed = (i: number) => {
  const n = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return n - Math.floor(n)
}

const overlay = (fragmentShader: string, uniforms: ShaderMaterial['uniforms']) =>
  new ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader,
  })

export async function createHeroScene(o: Options): Promise<HeroScene | null> {
  const renderer = new WebGLRenderer({ canvas: o.canvas, alpha: true, antialias: true, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setClearColor(0, 0)
  const scene = new Scene()
  const camera = new OrthographicCamera(-1, 1, 1, -1, 1, 3000)
  camera.position.z = 1500
  const rootStyle = getComputedStyle(document.documentElement)
  const token = (name: string, fallback: string) => new Color(rootStyle.getPropertyValue(name).trim() || fallback)
  const accent = token('--color-accent', '#00755A')
  const paper = token('--color-card', '#FFFFFF')
  const time = { value: 0 }
  const half = { value: [1, 1] }

  // Stars on white: crisp jade points with a soft halo; the brightest carry four thin spikes.
  // They fall in inner-first, speed up as they spiral, flatten into the disk plane and stretch along their path.
  const suction = { value: 0 }
  const horizon = { value: 1 }
  const geometry = new PlaneGeometry(1, 1)
  geometry.setAttribute(
    'aSeed',
    new InstancedBufferAttribute(
      Float32Array.from({ length: o.count }, (_, i) => seed(i)),
      1,
    ),
  )
  const stars = new ShaderMaterial({
    uniforms: { uSuction: suction, uHorizon: horizon, uHalf: half, uTime: time, uJade: { value: accent } },
    transparent: true,
    depthWrite: false,
    depthTest: false,
    vertexShader: `attribute float aSeed;
      uniform float uSuction, uHorizon, uTime;
      uniform vec2 uHalf;
      varying vec2 vUv;
      varying float vAlpha, vHeat, vSpike;
      void main() {
        vUv = uv;
        vec3 center = instanceMatrix[3].xyz;
        float d0 = length(center.xy);
        float start = clamp(d0 / length(uHalf), 0.0, 1.0) * 0.55 + aSeed * 0.1;
        float t = clamp((uSuction - start) / 0.35, 0.0, 1.0);
        float fall = t * t;
        float r = d0 * (1.0 - fall);
        // Angular speed grows as the orbit shrinks; same sense as the disk.
        float angle = -t * t * (1.8 + 7.0 * t) * (0.8 + aSeed * 0.5);
        float c = cos(angle), s = sin(angle);
        mat2 spin = mat2(c, s, -s, c);
        vec2 orbit = spin * (center.xy * (r / max(d0, 0.001)));
        orbit.y *= mix(1.0, 0.3, smoothstep(0.25, 0.85, t));
        vec3 shape = position * vec3(1.0 + 5.0 * t * t, 1.0 - 0.55 * t, 1.0);
        vec2 local = spin * (instanceMatrix * vec4(shape, 0.0)).xy;
        float twinkle = 0.82 + 0.18 * sin(uTime * (1.3 + aSeed * 2.7) + aSeed * 40.0);
        vAlpha = smoothstep(uHorizon * 0.35, uHorizon * 0.8, length(orbit)) * mix(twinkle, 1.0, t);
        vHeat = t;
        vSpike = step(0.86, fract(aSeed * 7.31));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(orbit + local, center.z, 1.0);
      }`,
    fragmentShader: `uniform vec3 uJade;
      varying vec2 vUv;
      varying float vAlpha, vHeat, vSpike;
      void main() {
        vec2 p = vUv - 0.5;
        float r = length(p);
        float core = 1.0 - smoothstep(0.035, 0.075, r);
        float halo = exp(-r * r * 26.0) * 0.38;
        float spikes = vSpike * (exp(-abs(p.x) * 90.0 - abs(p.y) * 9.0) + exp(-abs(p.y) * 90.0 - abs(p.x) * 9.0)) * 0.55;
        float alpha = clamp(core + halo + spikes, 0.0, 1.0) * vAlpha * (1.0 - smoothstep(0.42, 0.5, r));
        vec3 deep = uJade * 0.55;
        vec3 color = mix(deep, uJade, halo * 1.6 + vHeat * 0.6);
        gl_FragColor = vec4(color, alpha);
        #include <colorspace_fragment>
      }`,
  })
  const sky = new InstancedMesh(geometry, stars, o.count)
  sky.frustumCulled = false // the shader moves every instance
  scene.add(sky)

  // Inside the hole: a deep jade night under the tunnel.
  const veilMaterial = overlay(
    `uniform vec3 uJade; uniform float uDark; varying vec2 vUv;
      void main() {
        float r = length(vUv - 0.5);
        vec3 night = mix(uJade * 0.07, uJade * 0.015, smoothstep(0.0, 0.7, r));
        gl_FragColor = vec4(night, uDark);
        #include <colorspace_fragment>
      }`,
    { uJade: { value: accent }, uDark: { value: 0 } },
  )
  const veil = new Mesh(new PlaneGeometry(1, 1), veilMaterial)
  veil.renderOrder = 1
  scene.add(veil)

  // Tunnel: streaks on a bent, twisting cylinder, projected in the shader. Faster = longer, whiter, more bent.
  const tunnelCount = Math.round(o.count * 1.5)
  const tunnelGeometry = new InstancedBufferGeometry()
  tunnelGeometry.index = geometry.index
  tunnelGeometry.setAttribute('position', geometry.getAttribute('position'))
  tunnelGeometry.setAttribute(
    'aStar',
    new InstancedBufferAttribute(
      Float32Array.from({ length: tunnelCount * 4 }, (_, k) => {
        const i = Math.floor(k / 4)
        return [
          seed(i + 401) * Math.PI * 2,
          seed(i + 409) < 0.12 ? 0.15 + seed(i + 419) * 0.5 : 0.75 + seed(i + 421) * 0.6,
          seed(i + 431),
          seed(i + 443),
        ][k % 4]
      }),
      4,
    ),
  )
  tunnelGeometry.instanceCount = tunnelCount
  const tunnelUniforms = {
    uTravel: { value: 0 },
    uSpeed: { value: 0 },
    uFocal: { value: 1 },
    uOpacity: { value: 0 },
    uTime: time,
    uJade: { value: accent },
  }
  const tunnelMaterial = new ShaderMaterial({
    uniforms: tunnelUniforms,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    vertexShader: `attribute vec4 aStar; // angle, radius, phase, seed
      uniform float uTravel, uSpeed, uFocal, uOpacity, uTime;
      varying float vAlong, vAcross, vAlpha, vHot;
      const float NEAR = 0.04;
      vec2 project(float z) {
        float bend = 0.25 + 0.9 * uSpeed;
        vec2 axis = bend * z * z * vec2(sin(z * 2.3 + uTime * 0.35), cos(z * 1.9 - uTime * 0.27));
        float a = aStar.x + (0.6 + 2.6 * uSpeed) * z + uTime * 0.05;
        return (vec2(cos(a), sin(a)) * aStar.y + axis) / z * uFocal;
      }
      void main() {
        float z = mix(NEAR, 1.0, fract(aStar.z - uTravel));
        float tail = z + mix(0.003, 0.42, uSpeed * uSpeed) * (0.6 + 0.8 * aStar.w);
        vec2 head = project(z);
        vec2 back = project(tail);
        vec2 dir = head - back;
        float len = length(dir);
        dir = len > 0.001 ? dir / len : normalize(head + 0.0001);
        float width = (0.7 + 1.3 * aStar.w) * clamp(0.35 / z, 0.8, 3.2);
        if (len < width) back = head - dir * width;
        vec2 normal = vec2(-dir.y, dir.x);
        vAlong = position.x + 0.5;
        vAcross = position.y * 2.0;
        vec2 p = mix(back, head, vAlong) + normal * position.y * width;
        vAlpha = uOpacity * (1.0 - smoothstep(0.75, 1.0, z)) * smoothstep(NEAR, NEAR + 0.06, z);
        vHot = uSpeed * (1.0 - smoothstep(0.1, 0.6, z));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 200.0, 1.0);
      }`,
    fragmentShader: `uniform vec3 uJade;
      varying float vAlong, vAcross, vAlpha, vHot;
      void main() {
        float body = (1.0 - vAcross * vAcross) * pow(vAlong, 1.6);
        vec3 mint = mix(uJade, vec3(0.62, 1.0, 0.84), 0.75);
        vec3 color = mix(mint, vec3(1.0), clamp(vHot * vAlong, 0.0, 1.0));
        gl_FragColor = vec4(color, body * vAlpha);
        #include <colorspace_fragment>
      }`,
  })
  const tunnel = new Mesh(tunnelGeometry, tunnelMaterial)
  tunnel.frustumCulled = false
  tunnel.renderOrder = 2
  scene.add(tunnel)

  // Light at the end of the tunnel, then the white opening that becomes the page.
  const exitMaterial = overlay(
    `uniform vec3 uPaper; uniform vec3 uJade; uniform float uLight, uExit; uniform vec2 uAspect; varying vec2 vUv;
      void main() {
        float r = length((vUv - 0.5) * uAspect);
        float edge = uExit * (length(uAspect) * 0.5 + 0.04);
        float open = (1.0 - smoothstep(edge - 0.03, edge, r)) * step(0.0001, uExit);
        float glow = uLight * (exp(-r * r * 90.0) + 0.35 * exp(-r * r * 14.0));
        vec3 color = mix(mix(uJade, vec3(0.75, 1.0, 0.9), 0.85), uPaper, max(open, smoothstep(0.4, 1.0, glow)));
        gl_FragColor = vec4(color, clamp(max(open, glow), 0.0, 1.0));
        #include <colorspace_fragment>
      }`,
    {
      uPaper: { value: paper },
      uJade: { value: accent },
      uLight: { value: 0 },
      uExit: { value: 0 },
      uAspect: { value: [1, 1] },
    },
  )
  const exit = new Mesh(new PlaneGeometry(1, 1), exitMaterial)
  exit.renderOrder = 3
  scene.add(exit)

  const dummy = new Object3D()
  let blackHole: BlackHoleLayer | undefined
  let disposed = false
  let previous: number | undefined
  let lastProgress: number | undefined
  const lost = (event: Event) => {
    event.preventDefault()
    o.onLost()
  }
  const dispose = () => {
    if (disposed) return
    disposed = true
    o.canvas.removeEventListener('webglcontextlost', lost)
    sky.dispose()
    geometry.dispose()
    stars.dispose()
    tunnelGeometry.dispose()
    tunnelMaterial.dispose()
    for (const mesh of [veil, exit]) {
      mesh.geometry.dispose()
      mesh.material.dispose()
    }
    blackHole?.dispose()
    renderer.dispose()
    renderer.forceContextLoss()
  }
  const layout = () => {
    const { width, height } = o.stage.getBoundingClientRect()
    if (!width || !height) throw new Error('Empty hero layout')
    half.value = [width / 2, height / 2]
    horizon.value = Math.min(width * 0.14, height * 0.2)
    tunnelUniforms.uFocal.value = Math.hypot(width, height) * 0.16
    exitMaterial.uniforms.uAspect.value = width > height ? [width / height, 1] : [1, height / width]
    veil.scale.set(width, height, 1)
    exit.scale.set(width, height, 1)
    blackHole?.layout(width, height)
    renderer.setSize(width, height, false)
    camera.left = -width / 2
    camera.right = width / 2
    camera.top = height / 2
    camera.bottom = -height / 2
    camera.updateProjectionMatrix()
    const columns = Math.ceil(Math.sqrt((o.count * width) / height))
    const rows = Math.ceil(o.count / columns)
    for (let i = 0; i < o.count; i++) {
      dummy.position.set(
        (((i % columns) + 0.15 + seed(i + 1) * 0.7) / columns - 0.5) * width,
        (0.5 - (Math.floor(i / columns) + 0.15 + seed(i + 3) * 0.7) / rows) * height,
        (seed(i + 5) - 0.5) * 200,
      )
      // Keep the navigation island legible where it overlays the first screen.
      if (Math.abs(dummy.position.x) < 220 && dummy.position.y > height / 2 - 90) dummy.position.y -= 90
      dummy.rotation.set(0, 0, Math.atan2(dummy.position.y, dummy.position.x) + Math.PI / 2)
      dummy.scale.setScalar(5 + Math.pow(seed(i + 19), 3) * (width < 768 ? 16 : 24))
      dummy.updateMatrix()
      sky.setMatrixAt(i, dummy.matrix)
    }
    sky.instanceMatrix.needsUpdate = true
  }
  try {
    blackHole = await createBlackHoleLayer(o.holeCanvas, o.onLost)
    layout()
    o.canvas.addEventListener('webglcontextlost', lost)
  } catch {
    dispose()
    return null
  }
  return {
    layout,
    render(p) {
      const state = modelState(p)
      const now = performance.now() / 1000
      const delta = previous === undefined ? 0 : Math.min(now - previous, 0.05)
      previous = now
      time.value += delta
      // Travel moves with time (alive at rest) and with scroll (forward and back).
      const scrolled = lastProgress === undefined ? 0 : p - lastProgress
      lastProgress = p
      const travel = tunnelUniforms.uTravel.value + delta * (0.05 + 1.6 * state.speed ** 2) + scrolled * 4
      tunnelUniforms.uTravel.value = travel - Math.floor(travel) // the shader only reads fract(); keeps float32 precise
      tunnelUniforms.uSpeed.value = state.speed
      tunnelUniforms.uOpacity.value = state.tunnel
      suction.value = state.suction
      sky.visible = state.suction < 1
      blackHole?.render(p, state.holeScale)
      veil.visible = state.dark > 0
      veilMaterial.uniforms.uDark.value = state.dark
      tunnel.visible = state.tunnel > 0
      exit.visible = state.light > 0 && state.exit < 1
      exitMaterial.uniforms.uLight.value = state.light * (1 - state.exit)
      exitMaterial.uniforms.uExit.value = state.exit
      renderer.render(scene, camera)
      const alive = state.holeScale > 0 || state.tunnel > 0
      if (!alive) previous = undefined
      return alive
    },
    dispose,
  }
}
