import { expect, it } from 'vitest'
import { stubMatchMedia } from '../../../../test/media'
import { heroMode } from './heroMode'

it('uses the sequence when motion is allowed and the viewport is tall enough', () => {
  stubMatchMedia(false)
  expect(heroMode()).toBe('sequence')
})

it('is static under reduced motion', () => {
  expect(heroMode()).toBe('static')
})

it('is static on a short viewport', () => {
  stubMatchMedia((q) => q.includes('max-height'))
  expect(heroMode()).toBe('static')
})
