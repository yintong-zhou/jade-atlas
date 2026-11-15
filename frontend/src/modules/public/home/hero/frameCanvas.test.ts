import { afterEach, beforeEach, expect, it, vi, type Mock } from 'vitest'
import { createFrameCanvas, nearestReady } from './frameCanvas'

it('falls back to the nearest loaded frame', () => {
  expect(nearestReady(3, [true, false, false, false, false, true])).toBe(5)
  expect(nearestReady(1, [true, false, false, false, false, true])).toBe(0)
  expect(nearestReady(2, [false, false, true])).toBe(2)
  expect(nearestReady(0, [false, false])).toBe(-1)
})

// Images whose decode the test settles by hand.
class FakeImage {
  static all: FakeImage[] = []
  src = ''
  resolve!: () => void
  reject!: () => void
  private done = new Promise<void>((res, rej) => {
    this.resolve = res
    this.reject = rej
  })
  constructor() {
    FakeImage.all.push(this)
  }
  decode() {
    return this.done
  }
}

const flush = () => new Promise((r) => setTimeout(r, 0))
const track = [
  [0, 0],
  [1, 1],
] as const
let ctx: {
  drawImage: Mock<(...args: unknown[]) => void>
  clearRect: Mock<(...args: unknown[]) => void>
  setTransform: Mock<(...args: unknown[]) => void>
  globalAlpha: number
}
let canvas: HTMLCanvasElement
let events: {
  onFirstDraw: Mock<() => void>
  onReady: Mock<() => void>
  onNoFrames: Mock<() => void>
}

beforeEach(() => {
  FakeImage.all = []
  vi.stubGlobal('Image', FakeImage)
  ctx = { drawImage: vi.fn(), clearRect: vi.fn(), setTransform: vi.fn(), globalAlpha: 1 }
  canvas = document.createElement('canvas')
  canvas.getContext = vi.fn(() => ctx) as never
  events = { onFirstDraw: vi.fn(), onReady: vi.fn(), onNoFrames: vi.fn() }
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const lastDrawn = () => ctx.drawImage.mock.calls.at(-1)?.[0]

it('throws when the 2D context is unavailable', () => {
  canvas.getContext = vi.fn(() => null) as never
  expect(() => createFrameCanvas(canvas, ['a', 'b'], track, events)).toThrow()
})

it('redraws at the same progress when the right frame arrives late', async () => {
  const frames = createFrameCanvas(canvas, ['a', 'b', 'c'], track, events)
  const [a, , c] = FakeImage.all
  a.resolve()
  await flush()
  expect(events.onReady).toHaveBeenCalledTimes(1)
  frames.draw(1)
  expect(lastDrawn()).toBe(a)
  expect(events.onFirstDraw).toHaveBeenCalledTimes(1)
  c.resolve()
  await flush()
  expect(events.onReady).toHaveBeenCalledTimes(2)
  frames.draw(1)
  expect(lastDrawn()).toBe(c)
})

it('draws nothing while no frame is ready', () => {
  const frames = createFrameCanvas(canvas, ['a', 'b'], track, events)
  frames.draw(0.5)
  expect(ctx.drawImage).not.toHaveBeenCalled()
  expect(events.onFirstDraw).not.toHaveBeenCalled()
})

it('blends the second frame over the first', async () => {
  const frames = createFrameCanvas(canvas, ['a', 'b'], track, events)
  FakeImage.all.forEach((i) => i.resolve())
  await flush()
  const alphas: number[] = []
  ctx.drawImage.mockImplementation(() => alphas.push(ctx.globalAlpha))
  frames.draw(0.5)
  expect(ctx.drawImage.mock.calls.map((c) => c[0])).toEqual(FakeImage.all)
  expect(alphas).toEqual([1, 0.5])
})

it('redraws after resize even when the frame and mix did not change', async () => {
  const frames = createFrameCanvas(canvas, ['a', 'b'], track, events)
  FakeImage.all[0].resolve()
  await flush()
  frames.draw(0)
  frames.draw(0)
  expect(ctx.drawImage).toHaveBeenCalledTimes(1)
  frames.resize()
  frames.draw(0)
  expect(ctx.drawImage).toHaveBeenCalledTimes(2)
})

it('reports when every frame failed', async () => {
  createFrameCanvas(canvas, ['a', 'b', 'c'], track, events)
  FakeImage.all.forEach((i) => i.reject())
  await flush()
  expect(events.onNoFrames).toHaveBeenCalledTimes(1)
  expect(events.onFirstDraw).not.toHaveBeenCalled()
})

it('keeps at most six loads in flight', async () => {
  createFrameCanvas(
    canvas,
    Array.from({ length: 10 }, (_, i) => `f${i}`),
    track,
    events,
  )
  expect(FakeImage.all).toHaveLength(6)
  FakeImage.all[0].resolve()
  await flush()
  expect(FakeImage.all).toHaveLength(7)
})

it('stops loading and stays silent after dispose', async () => {
  const frames = createFrameCanvas(canvas, ['a', 'b'], track, events)
  frames.dispose()
  FakeImage.all.forEach((i) => i.resolve())
  await flush()
  expect(events.onReady).not.toHaveBeenCalled()
  expect(FakeImage.all.every((i) => i.src === '')).toBe(true)
})
