import { expect, it } from 'vitest'
import { HERO, modelState, navHidden, range } from './heroTimeline'

it('clamps a range to 0..1', () => {
  expect(range(0.5, 0, 1)).toBe(0.5)
  expect(range(-1, 0, 1)).toBe(0)
  expect(range(2, 0, 1)).toBe(1)
})

it('absorbs every star, falls into the hole, crosses the tunnel and comes out on white', () => {
  expect(modelState(0)).toMatchObject({ suction: 0, holeScale: 1, dark: 0, tunnel: 0, exit: 0 })
  expect(modelState(0.2).suction).toBeGreaterThan(0)
  expect(modelState(0.4)).toMatchObject({ suction: 1, holeScale: 1 })
  expect(modelState(0.5).holeScale).toBeGreaterThan(3)
  expect(modelState(0.53)).toMatchObject({ holeScale: 0, dark: 1 })
  expect(modelState(0.6).tunnel).toBe(1)
  expect(modelState(0.6).speed).toBeLessThan(0.2)
  expect(modelState(0.86).speed).toBeGreaterThan(0.8)
  expect(modelState(0.86).light).toBeGreaterThan(0.9)
  expect(modelState(1)).toMatchObject({ holeScale: 0, dark: 0, tunnel: 0, exit: 1 })
})

it('speeds up monotonically and stays bounded and reversible at every scroll position', () => {
  let speed = 0
  for (let i = 0; i <= 1000; i++) {
    const p = i / 1000
    const state = modelState(p)
    expect(state.speed).toBeGreaterThanOrEqual(speed)
    speed = state.speed
    for (const key of ['suction', 'heat', 'dark', 'tunnel', 'speed', 'light', 'exit'] as const) {
      expect(state[key]).toBeGreaterThanOrEqual(0)
      expect(state[key]).toBeLessThanOrEqual(1)
    }
    modelState(1)
    expect(modelState(p)).toEqual(state)
  }
})

it('shows the copy only once the page is white again', () => {
  expect(HERO.copy.title[0]).toBeGreaterThan(HERO.exit[0])
  expect(modelState(HERO.copy.title[1]).exit).toBe(1)
})

it('hides the navigation only while the sequence plays', () => {
  expect(navHidden(0, false)).toBe(false)
  expect(navHidden(0.5, false)).toBe(true)
  expect(navHidden(0.5, true)).toBe(false)
  expect(navHidden(1, false)).toBe(false)
})
