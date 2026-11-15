import { render } from '@testing-library/react'
import { expect, it } from 'vitest'
import { stubMatchMedia } from '../../test/media'
import { Reveal } from './Reveal'

// Own file: Motion caches IntersectionObservers per threshold at module level.
it('triggers as soon as any part of a section is visible, so a very tall section still appears', () => {
  stubMatchMedia(false)
  const options: IntersectionObserverInit[] = []
  window.IntersectionObserver = class {
    constructor(_cb: IntersectionObserverCallback, init?: IntersectionObserverInit) {
      options.push(init ?? {})
    }
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  } as unknown as typeof IntersectionObserver
  render(<Reveal><p>content</p></Reveal>)
  expect(options.map((o) => o.threshold)).toEqual([0])
})
