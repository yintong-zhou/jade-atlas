import { expect, it } from 'vitest'
import { isDust, isInk, samplePoints } from './sampling'

const px = (...rgba: number[][]) => new Uint8ClampedArray(rgba.flat())
const white = [254, 254, 254, 255]
const green = [0, 128, 0, 255]

it('places every point inside a kept pixel and copies its colour', () => {
  const pixels = { data: px(white, white, white, green), width: 2, height: 2 } // kept pixel: bottom right
  const { positions, colors } = samplePoints(pixels, 50, isDust)
  expect(positions).toHaveLength(100)
  expect(colors).toHaveLength(150)
  for (let i = 0; i < 50; i++) {
    expect(positions[i * 2]).toBeGreaterThanOrEqual(0.5)
    expect(positions[i * 2 + 1]).toBeGreaterThanOrEqual(0.5)
    expect(colors[i * 3 + 1]).toBeCloseTo(128 / 255)
  }
})

it('returns no points when nothing is kept', () => {
  const { positions, colors } = samplePoints({ data: px(white, white), width: 2, height: 1 }, 50, isDust)
  expect(positions).toHaveLength(0)
  expect(colors).toHaveLength(0)
})

it('treats the 253–254 background of the frames as empty', () => {
  expect(isDust(253, 253, 253, 255)).toBe(false)
  expect(isDust(200, 240, 200, 255)).toBe(true)
})

it('keeps only the drawn part of the text', () => {
  expect(isInk(0, 0, 0, 200)).toBe(true)
  expect(isInk(0, 0, 0, 40)).toBe(false)
})
