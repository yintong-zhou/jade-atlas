import { expect, it } from 'vitest'
import { projectGridLayout } from './projectGridLayout'

it.each([1, 2, 3, 4, 5, 6, 7, 8])('fills every desktop row for %i tiles', (count) => {
  const spans = Array.from({ length: count }, (_, index) => projectGridLayout(count, index).desktopSpan)
  let row = 0
  for (const span of spans) {
    row += span
    expect(row).toBeLessThanOrEqual(6)
    if (row === 6) row = 0
  }
  expect(row).toBe(0)
  expect(spans[0]).toBe(count % 3 === 1 ? 6 : count % 3 === 2 ? 3 : 2)
  if (count % 3 === 2) expect(spans[1]).toBe(3)
})

it.each([1, 2, 3, 4, 5, 6, 7, 8])('fills every tablet row for %i tiles', (count) => {
  const spans = Array.from({ length: count }, (_, index) => projectGridLayout(count, index).tabletSpan)
  expect(spans[0]).toBe(count % 2 ? 2 : 1)
  expect(spans.slice(1).every((span) => span === 1)).toBe(true)
  expect(spans.reduce((a, b) => a + b, 0) % 2).toBe(0)
})

it('only uses a horizontal tile for the full-width desktop lead', () => {
  expect(projectGridLayout(4, 0).horizontal).toBe(true)
  expect(projectGridLayout(4, 1).horizontal).toBe(false)
  expect(projectGridLayout(5, 0).horizontal).toBe(false)
  expect(projectGridLayout(3, 0).horizontal).toBe(false)
})
