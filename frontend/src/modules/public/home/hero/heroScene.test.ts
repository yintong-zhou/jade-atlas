import { beforeEach, expect, it, vi } from 'vitest'
import type { InstancedMesh, Mesh, Scene } from 'three'
import { createHeroScene } from './heroScene'

const gpu = vi.hoisted(() => ({
  render: vi.fn(),
  dispose: vi.fn(),
  forceContextLoss: vi.fn(),
  environmentDispose: vi.fn(),
}))
const hole = vi.hoisted(() => ({ render: vi.fn(), layout: vi.fn(), dispose: vi.fn() }))
vi.mock('./blackHoleLayer', () => ({ createBlackHoleLayer: vi.fn(async () => hole) }))
vi.mock('three', async (original) => {
  const three = await original<typeof import('three')>()
  return {
    ...three,
    WebGLRenderer: class {
      setPixelRatio() {}
      setClearColor() {}
      setSize() {}
      render = gpu.render
      dispose = gpu.dispose
      forceContextLoss = gpu.forceContextLoss
    },
    PMREMGenerator: class {
      fromScene() {
        return { texture: new three.Texture(), dispose: gpu.environmentDispose }
      }
      dispose() {}
    },
  }
})

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(window, 'getComputedStyle').mockReturnValue({
    getPropertyValue: () => '#00755A',
  } as unknown as CSSStyleDeclaration)
})

async function setup() {
  const stage = document.createElement('div')
  stage.getBoundingClientRect = () => ({ width: 1000, height: 900, left: 0, top: 0 }) as DOMRect
  return (await createHeroScene({
    canvas: document.createElement('canvas'),
    holeCanvas: document.createElement('canvas'),
    stage,
    count: 16,
    onLost: vi.fn(),
  }))!
}

const sceneOf = () => gpu.render.mock.calls.at(-1)![0] as Scene
const skyOf = () => sceneOf().children.find((child) => 'isInstancedMesh' in child) as InstancedMesh
const byOrder = (order: number) => sceneOf().children.find((child) => child.renderOrder === order) as Mesh

it('reuses the star buffer across resize', async () => {
  const scene = await setup()
  scene.render(0.2)
  const attribute = skyOf().instanceMatrix
  for (let i = 0; i < 3; i++) {
    scene.layout()
    scene.render(0.2)
    expect(skyOf().instanceMatrix).toBe(attribute)
  }
  expect(attribute.version).toBeGreaterThan(1)
  scene.dispose()
})

it('releases stars, tunnel, overlays, the black hole and both renderers', async () => {
  const scene = await setup()
  scene.render(0.7)
  const disposed: ReturnType<typeof vi.spyOn>[] = []
  sceneOf().traverse((object) => {
    if ('geometry' in object && 'material' in object) {
      const mesh = object as Mesh
      disposed.push(vi.spyOn(mesh.geometry, 'dispose'))
      if (!Array.isArray(mesh.material)) disposed.push(vi.spyOn(mesh.material, 'dispose'))
    }
  })
  scene.dispose()
  disposed.forEach((spy) => expect(spy).toHaveBeenCalled())
  expect(hole.dispose).toHaveBeenCalledTimes(1)
  expect(gpu.dispose).toHaveBeenCalledTimes(1)
  expect(gpu.forceContextLoss).toHaveBeenCalledTimes(1)
})

it('swallows the stars, dives into the hole, runs the tunnel and stops once out on white', async () => {
  const scene = await setup()
  expect(scene.render(0.4)).toBe(true)
  expect(hole.render).toHaveBeenLastCalledWith(0.4, 1)
  expect(skyOf().visible).toBe(false)
  scene.render(0.5)
  expect(hole.render.mock.lastCall![1]).toBeGreaterThan(1)
  expect(scene.render(0.7)).toBe(true)
  expect(hole.render).toHaveBeenLastCalledWith(0.7, 0)
  expect(byOrder(1).visible).toBe(true) // dark veil
  expect(byOrder(2).visible).toBe(true) // tunnel
  expect(scene.render(1)).toBe(false)
  expect(byOrder(1).visible).toBe(false)
  expect(byOrder(2).visible).toBe(false)
  expect(byOrder(3).visible).toBe(false)
  scene.render(0.2)
  expect(skyOf().visible).toBe(true)
  expect(hole.render).toHaveBeenLastCalledWith(0.2, 1)
  scene.dispose()
})
