import { expect, it } from 'vitest'
import { heroFrames, jadeStill } from './heroFrames'

it('lists every generated frame in order', () => {
  expect(heroFrames.large).toHaveLength(120)
  expect(heroFrames.small).toHaveLength(60)
  expect(heroFrames.large[0]).toContain('f_000')
  expect(heroFrames.large[119]).toContain('f_119')
  expect(jadeStill).toContain('f_061')
})
