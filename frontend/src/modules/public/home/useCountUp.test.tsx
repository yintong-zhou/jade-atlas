import { beforeEach, expect, it, vi } from 'vitest'
import { publicApi } from '../../../shared/api/publicApi'
import { stubMatchMedia } from '../../../test/media'
import { renderRoute } from '../../../test/render'

const anime = vi.hoisted(() => ({
  animate: vi.fn(),
  revert: vi.fn(),
  createScope: vi.fn(),
}))

vi.mock('animejs', () => ({ animate: anime.animate, createScope: anime.createScope }))

beforeEach(() => {
  anime.animate.mockClear()
  anime.revert.mockClear()
  anime.createScope.mockReset()
  anime.createScope.mockImplementation(() => ({
    add(cb: () => void) {
      cb()
      return this
    },
    revert: anime.revert,
  }))
  vi.spyOn(publicApi, 'getProjects').mockResolvedValue([])
})

// Replaces the never-firing observer of setup.ts with one that reports the target as visible.
function enterViewport() {
  window.IntersectionObserver = class {
    constructor(private cb: IntersectionObserverCallback) {}
    observe() {
      this.cb([{ isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver)
    }
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  } as unknown as typeof IntersectionObserver
}

const countValues = () => [...document.querySelectorAll('[data-count-to]')].map((el) => el.textContent)

it('starts one count-up per number when the numbers enter the viewport', () => {
  stubMatchMedia(false)
  enterViewport()
  renderRoute('/')
  expect(anime.animate).toHaveBeenCalledTimes(3)
})

it('waits until the numbers are in the viewport', () => {
  stubMatchMedia(false)
  renderRoute('/')
  expect(anime.animate).not.toHaveBeenCalled()
  expect(countValues()).toEqual(['8', '38', '10'])
})

it('does not animate when reduced motion is requested', () => {
  enterViewport()
  renderRoute('/')
  expect(anime.animate).not.toHaveBeenCalled()
  expect(countValues()).toEqual(['8', '38', '10'])
})

it('keeps the exact values when the animation library throws', () => {
  stubMatchMedia(false)
  enterViewport()
  anime.createScope.mockImplementation(() => {
    throw new Error('boom')
  })
  renderRoute('/')
  expect(countValues()).toEqual(['8', '38', '10'])
})

it('reverts on unmount', () => {
  stubMatchMedia(false)
  enterViewport()
  renderRoute('/').unmount()
  expect(anime.revert).toHaveBeenCalledTimes(1)
})
