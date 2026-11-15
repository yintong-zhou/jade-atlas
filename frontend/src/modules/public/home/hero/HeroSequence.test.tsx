import { act, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { publicApi } from '../../../../shared/api/publicApi'
import { texts } from '../../../../shared/texts'
import { fireMediaChange, stubMatchMedia } from '../../../../test/media'
import { renderRoute } from '../../../../test/render'
import { copyState, HERO } from './heroTimeline'

const dust = vi.hoisted(() => ({ createDust: vi.fn() }))
vi.mock('./dust', () => ({ createDust: dust.createDust }))

const ctx2d = { clearRect: vi.fn(), drawImage: vi.fn(), setTransform: vi.fn(), globalAlpha: 1 }
let resizeObserverCallback: () => void = () => {}
let intersect: (visible: boolean) => void = () => {}

beforeEach(() => {
  stubMatchMedia(false)
  ctx2d.drawImage.mockClear()
  dust.createDust.mockReset()
  HTMLCanvasElement.prototype.getContext = vi.fn((kind: string) => (kind === '2d' ? ctx2d : null)) as never
  window.ResizeObserver = class {
    constructor(cb: () => void) {
      resizeObserverCallback = cb
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
  // `intersect` drives the observer watching the hero section (Reveal creates observers too).
  window.IntersectionObserver = class {
    cb: IntersectionObserverCallback
    constructor(cb: IntersectionObserverCallback) {
      this.cb = cb
    }
    observe(el: Element) {
      if (!el.matches('[data-hero]')) return
      intersect = (visible) =>
        this.cb([{ isIntersecting: visible } as IntersectionObserverEntry], this as unknown as IntersectionObserver)
    }
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  } as unknown as typeof IntersectionObserver
  vi.spyOn(publicApi, 'getProjects').mockResolvedValue([])
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const hero = () => document.querySelector<HTMLElement>('[data-hero]')!
const framesCanvas = () => hero().querySelector<HTMLElement>('canvas[data-layer="frames"]')!

// Images that decode at once (ok) or fail at once.
function stubImages(ok: boolean) {
  vi.stubGlobal(
    'Image',
    class {
      src = ''
      decode() {
        return ok ? Promise.resolve() : Promise.reject(new Error('404'))
      }
    },
  )
}

it('keeps the real title in the document and hides both canvases from assistive tech', () => {
  renderRoute('/')
  expect(hero()).toHaveAttribute('data-hero', 'sequence')
  expect(screen.getByRole('heading', { level: 1, name: texts.home.title })).toBeInTheDocument()
  const canvases = hero().querySelectorAll('canvas')
  expect(canvases).toHaveLength(2)
  canvases.forEach((c) => expect(c).toHaveAttribute('aria-hidden', 'true'))
})

it('ignores clicks on the text while it is invisible', () => {
  renderRoute('/')
  expect(hero().querySelector<HTMLElement>('[data-hero-copy]')!.style.pointerEvents).toBe('none')
})

it('enables clicks only once the buttons are at least half visible', () => {
  expect(copyState(0.95, false).interactive).toBe(false)
  expect(copyState(HERO.interactive, false).interactive).toBe(true)
  expect(copyState(0, true).interactive).toBe(true)
})

it('shows the final state while keyboard focus is inside the hero text', () => {
  renderRoute('/')
  const link = screen.getByRole('link', { name: 'See projects' })
  act(() => link.focus())
  expect(hero()).toHaveAttribute('data-revealed', 'true')
  act(() => link.blur())
  expect(hero()).toHaveAttribute('data-revealed', 'false')
})

it('draws once on mount', async () => {
  renderRoute('/')
  await waitFor(() => expect(framesCanvas().style.opacity).toBe('1')) // set by the draw function, not by the markup
})

it('does not draw while the hero is off screen, and catches up when it returns', async () => {
  // Images that decode only when the test says so.
  const pending: (() => void)[] = []
  vi.stubGlobal(
    'Image',
    class {
      src = ''
      decode() {
        return new Promise<void>((resolve) => pending.push(resolve))
      }
    },
  )
  renderRoute('/')
  act(() => pending[0]())
  await waitFor(() => expect(ctx2d.drawImage).toHaveBeenCalled())
  act(() => intersect(false))
  ctx2d.drawImage.mockClear()
  await act(async () => {
    pending.slice(1).forEach((resolve) => resolve()) // late frames arrive while off screen
  })
  await new Promise((r) => setTimeout(r, 50))
  expect(ctx2d.drawImage).not.toHaveBeenCalled()
  act(() => intersect(true))
  await waitFor(() => expect(ctx2d.drawImage).toHaveBeenCalled())
})

it('falls back to the static hero when the 2D canvas is unavailable', () => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as never
  vi.spyOn(console, 'error').mockImplementation(() => {})
  renderRoute('/')
  expect(hero()).toHaveAttribute('data-hero', 'static')
  expect(screen.getByRole('heading', { level: 1, name: texts.home.title })).toBeInTheDocument()
})

it('falls back to the static hero when no frame can be loaded', async () => {
  stubImages(false)
  renderRoute('/')
  await waitFor(() => expect(hero()).toHaveAttribute('data-hero', 'static'))
  expect(screen.getByRole('heading', { level: 1, name: texts.home.title })).toBeInTheDocument()
})

it('switches to the static hero when the viewport becomes too short', () => {
  let short = false
  stubMatchMedia((q) => (q.includes('max-height') ? short : false))
  renderRoute('/')
  expect(hero()).toHaveAttribute('data-hero', 'sequence')
  short = true
  act(() => fireMediaChange())
  expect(hero()).toHaveAttribute('data-hero', 'static')
})

it('does not load the particle layer when WebGL is missing', async () => {
  renderRoute('/')
  await new Promise((r) => setTimeout(r, 0))
  expect(dust.createDust).not.toHaveBeenCalled()
})

it('redraws on resize', async () => {
  stubImages(true)
  renderRoute('/')
  await waitFor(() => expect(ctx2d.drawImage).toHaveBeenCalled())
  ctx2d.drawImage.mockClear()
  act(() => resizeObserverCallback())
  await waitFor(() => expect(ctx2d.drawImage).toHaveBeenCalled())
})
