import { expect, it } from 'vitest'
import { stubMatchMedia } from './media'

it('provides jest-dom matchers and browser API stubs', () => {
  document.body.innerHTML = '<p>ready</p>'
  expect(document.querySelector('p')).toBeInTheDocument()
  expect(window.matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(true)
  stubMatchMedia(false)
  expect(window.matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(false)
  expect(typeof IntersectionObserver).toBe('function')
})
