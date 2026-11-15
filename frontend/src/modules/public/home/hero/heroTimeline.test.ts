import { expect, it } from 'vitest'
import { frameAt, HERO, layers, range } from './heroTimeline'

it('clamps a range to 0..1', () => {
  expect(range(0.5, 0, 1)).toBe(0.5)
  expect(range(-1, 0, 1)).toBe(0)
  expect(range(2, 0, 1)).toBe(1)
})

it('maps progress through the track to the two frames around it', () => {
  const track = [
    [0, 0],
    [0.5, 0.5],
    [1, 1],
  ] as const
  expect(frameAt(0, 5, track)).toEqual({ a: 0, b: 1, mix: 0 })
  const mid = frameAt(0.375, 5, track) // pos 1.5
  expect([mid.a, mid.b]).toEqual([1, 2])
  expect(mid.mix).toBeCloseTo(0.5)
  expect(frameAt(1, 5, track)).toEqual({ a: 4, b: 4, mix: 0 })
})

it('holds the first frame before the track starts and the last after it ends', () => {
  expect(frameAt(0, 120, HERO.track)).toMatchObject({ a: 0, mix: 0 })
  expect(frameAt(0.9, 120, HERO.track)).toEqual({ a: 119, b: 119, mix: 0 })
})

it('holds the intact jade between the two jade knots', () => {
  const a = frameAt(0.45, 120, HERO.track).a
  const b = frameAt(0.51, 120, HERO.track).a
  expect(b - a).toBeLessThanOrEqual(3)
})

it('hands over from frames to dust to the real name', () => {
  expect(layers(0.5, true)).toEqual({ frames: 1, dust: 0, travel: 0, name: 0 })
  expect(layers(0.8, true).frames).toBeCloseTo(0.5)
  expect(layers(0.8, true).dust).toBeCloseTo(0.5)
  expect(layers(0.87, true)).toMatchObject({ frames: 0, dust: 1 })
  expect(layers(0.87, true).travel).toBeCloseTo(0.5)
  expect(layers(1, true)).toMatchObject({ dust: 0, name: 1 })
})

it('cross-fades the frames straight to the name when there is no dust', () => {
  expect(layers(0.9, false)).toMatchObject({ frames: 1, dust: 0 })
  expect(layers(0.97, false).frames).toBeCloseTo(0.5)
  expect(layers(0.97, false).name).toBeCloseTo(0.5)
})
