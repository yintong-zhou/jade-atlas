import { expect, it } from 'vitest'
import { createStoneGeometry, stonePoint } from './stoneModel'

it('builds a closed shell from separate fragments around a smaller jade core', () => {
  const { core, fragments } = createStoneGeometry()
  expect(fragments).toHaveLength(20)
  core.computeBoundingSphere()
  expect(core.boundingSphere!.radius).toBeLessThan(1.1)
  for (const { geometry, direction } of fragments) {
    const p = geometry.getAttribute('position')
    expect(p.count).toBeGreaterThan(100)
    expect(direction.length()).toBeCloseTo(1)
    const edges = new Map<string, number>()
    const key = (i: number) => [p.getX(i), p.getY(i), p.getZ(i)].map((v) => v.toFixed(5)).join(',')
    for (let i = 0; i < p.count; i += 3) {
      for (let j = 0; j < 3; j++) {
        const edge = [key(i + j), key(i + ((j + 1) % 3))].sort().join('|')
        edges.set(edge, (edges.get(edge) ?? 0) + 1)
      }
    }
    expect([...edges.values()].every((n) => n === 2)).toBe(true)
    geometry.dispose()
  }
  core.dispose()
})

it('uses a deterministic irregular surface shared by the model and the particles', () => {
  const p = stonePoint(0.3, 0.8, 0.4)
  expect(p.toArray()).toEqual(stonePoint(0.3, 0.8, 0.4).toArray())
  expect(p.length()).toBeGreaterThan(0.6)
  expect(p.length()).toBeLessThan(1.2)
  expect(p.length()).not.toBeCloseTo(stonePoint(-0.3, 0.8, 0.4).length(), 3)
})
