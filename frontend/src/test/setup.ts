import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'
import { stubMatchMedia } from './media'

if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '')
  }
}

if (!HTMLDialogElement.prototype.close) {
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
}

class NoopIntersectionObserver {
  readonly root = null
  readonly rootMargin = ''
  readonly thresholds = []
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Unmocked fetch in test')))
  stubMatchMedia(true)
  window.IntersectionObserver = NoopIntersectionObserver as unknown as typeof IntersectionObserver
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
