import { beforeEach, expect, it, vi } from 'vitest'
import { createBlackHoleLayer } from './blackHoleLayer'

const gpu = vi.hoisted(() => ({
  init: vi.fn(),
  compile: vi.fn(),
  render: vi.fn(),
  size: vi.fn(),
  dispose: vi.fn(),
  pipelineDispose: vi.fn(),
}))
vi.mock('three/webgpu', async (original) => {
  const three = await original<typeof import('three/webgpu')>()
  return {
    ...three,
    WebGPURenderer: class {
      init = gpu.init
      compileAsync = gpu.compile
      render = gpu.render
      setPixelRatio() {}
      setClearColor() {}
      setSize = gpu.size
      dispose = gpu.dispose
    },
    RenderPipeline: class {
      render = gpu.render
      dispose = gpu.pipelineDispose
    },
  }
})

beforeEach(() => {
  vi.clearAllMocks()
  gpu.init.mockResolvedValue(undefined)
  gpu.compile.mockResolvedValue(undefined)
  gpu.dispose.mockResolvedValue(undefined)
  vi.spyOn(window, 'getComputedStyle').mockReturnValue({
    getPropertyValue: () => '#ffffff',
  } as unknown as CSSStyleDeclaration)
})

it('bounds render resolution and restores the hole when scrolling backwards from collapse', async () => {
  const canvas = document.createElement('canvas')
  const hole = await createBlackHoleLayer(canvas, vi.fn())
  hole.layout(1440, 900)
  expect(gpu.size).toHaveBeenLastCalledWith(1440, 900, false)
  hole.render(0.7, 0)
  expect(canvas.style.visibility).toBe('hidden')
  expect(gpu.render).not.toHaveBeenCalled()
  hole.render(0.2, 1)
  expect(canvas.style.visibility).toBe('visible')
  expect(gpu.render).toHaveBeenCalledTimes(1)
  hole.dispose()
})

it('uses an orbitable perspective camera while leaving wheel scrolling to the page', async () => {
  const canvas = document.createElement('canvas')
  const hole = await createBlackHoleLayer(canvas, vi.fn())
  hole.layout(1000, 700)
  const camera = gpu.compile.mock.calls.at(-1)![1]
  expect(camera.isPerspectiveCamera).toBe(true)
  expect(canvas.style.pointerEvents).toBe('auto')
  expect(canvas.style.touchAction).toContain('pan-y')
  Object.defineProperties(canvas, { clientWidth: { value: 1000 }, clientHeight: { value: 700 } })
  canvas.setPointerCapture = vi.fn()
  canvas.releasePointerCapture = vi.fn()
  const position = camera.position.clone()
  for (const [type, x, y] of [
    ['pointerdown', 500, 350],
    ['pointermove', 700, 450],
    ['pointerup', 700, 450],
  ] as const) {
    const event = new MouseEvent(type, { clientX: x, clientY: y, button: 0, bubbles: true })
    Object.defineProperties(event, { pointerId: { value: 1 }, pointerType: { value: 'mouse' } })
    ;(type === 'pointerdown' ? canvas : canvas.ownerDocument).dispatchEvent(event)
  }
  hole.render(0, 1)
  expect(camera.position.distanceTo(position)).toBeGreaterThan(0.1)
  const wheel = new WheelEvent('wheel', { deltaY: 100, cancelable: true })
  canvas.dispatchEvent(wheel)
  expect(wheel.defaultPrevented).toBe(false)
  hole.render(0.7, 0)
  expect(canvas.style.pointerEvents).toBe('none')
  hole.render(0, 1)
  expect(canvas.style.pointerEvents).toBe('auto')
  await hole.dispose()
})

it.each(['init', 'compile'] as const)('releases GPU resources when %s fails', async (step) => {
  gpu[step].mockRejectedValueOnce(new Error('GPU failed'))
  await expect(createBlackHoleLayer(document.createElement('canvas'), vi.fn())).rejects.toThrow('GPU failed')
  expect(gpu.dispose).toHaveBeenCalledTimes(1)
  expect(gpu.pipelineDispose).toHaveBeenCalledTimes(1)
})

it('contains asynchronous teardown rejection after GPU initialization fails', async () => {
  gpu.init.mockRejectedValueOnce(new Error('GPU failed'))
  gpu.dispose.mockRejectedValueOnce(new Error('Renderer cannot dispose before init'))
  await expect(createBlackHoleLayer(document.createElement('canvas'), vi.fn())).rejects.toThrow('GPU failed')
  await new Promise((resolve) => setTimeout(resolve, 0))
})

it('completes teardown even when the renderer rejects during disposal', async () => {
  const hole = await createBlackHoleLayer(document.createElement('canvas'), vi.fn())
  gpu.dispose.mockRejectedValueOnce(new Error('Device already lost'))
  await expect(hole.dispose()).resolves.toBeUndefined()
})

it('handles context loss and releases each resource once even after repeated disposal', async () => {
  const canvas = document.createElement('canvas')
  const lost = vi.fn()
  const hole = await createBlackHoleLayer(canvas, lost)
  canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }))
  expect(lost).toHaveBeenCalledTimes(1)
  const scene = gpu.compile.mock.calls[0][0]
  const geometry = vi.spyOn(scene.children[0].geometry, 'dispose')
  const material = vi.spyOn(scene.children[0].material, 'dispose')
  hole.dispose()
  hole.dispose()
  canvas.dispatchEvent(new Event('webglcontextlost'))
  hole.render(0, 1)
  expect(lost).toHaveBeenCalledTimes(1)
  expect(geometry).toHaveBeenCalledTimes(1)
  expect(material).toHaveBeenCalledTimes(1)
  expect(gpu.dispose).toHaveBeenCalledTimes(1)
  expect(gpu.render).not.toHaveBeenCalled()
})
