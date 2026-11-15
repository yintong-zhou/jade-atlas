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

// Task 6: particle layer
const fakeDust = { render: vi.fn(), layout: vi.fn(), dispose: vi.fn() }
const webgl = () => {
  HTMLCanvasElement.prototype.getContext = vi.fn((kind: string) => (kind === '2d' ? ctx2d : {})) as never
}
const dustOptions = () => dust.createDust.mock.calls[0][0] as { onLost: () => void; count: number; imageUrl: string }

beforeEach(() => {
  fakeDust.render.mockClear()
  fakeDust.layout.mockClear()
  fakeDust.dispose.mockClear()
})

it('creates the particle layer from the last frame when WebGL is available', async () => {
  webgl()
  dust.createDust.mockResolvedValue(fakeDust)
  renderRoute('/')
  await waitFor(() => expect(dust.createDust).toHaveBeenCalledTimes(1))
  expect(dustOptions().count).toBe(HERO.particles.large)
  expect(dustOptions().imageUrl).toContain('f_119')
  await waitFor(() => expect(fakeDust.render).toHaveBeenCalled())
})

it('re-measures the particles on resize', async () => {
  webgl()
  dust.createDust.mockResolvedValue(fakeDust)
  renderRoute('/')
  await waitFor(() => expect(fakeDust.render).toHaveBeenCalled())
  act(() => resizeObserverCallback())
  await waitFor(() => expect(fakeDust.layout).toHaveBeenCalled())
})

it('carries on without particles when the layer cannot be created', async () => {
  webgl()
  dust.createDust.mockResolvedValue(null)
  renderRoute('/')
  await waitFor(() => expect(dust.createDust).toHaveBeenCalled())
  expect(hero()).toHaveAttribute('data-hero', 'sequence')
})

it('carries on without particles when the three.js chunk fails to load', async () => {
  webgl()
  dust.createDust.mockRejectedValue(new Error('chunk'))
  renderRoute('/')
  await waitFor(() => expect(dust.createDust).toHaveBeenCalled())
  await new Promise((r) => setTimeout(r, 0))
  expect(hero()).toHaveAttribute('data-hero', 'sequence')
})

it('drops the particles when the WebGL context is lost', async () => {
  webgl()
  dust.createDust.mockResolvedValue(fakeDust)
  renderRoute('/')
  await waitFor(() => expect(fakeDust.render).toHaveBeenCalled())
  fakeDust.render.mockClear()
  act(() => dustOptions().onLost())
  expect(fakeDust.dispose).toHaveBeenCalledTimes(1)
  expect(hero()).toHaveAttribute('data-hero', 'sequence')
  // without any scroll, the next frame redraws without dust: the frames canvas is visible again
  await waitFor(() => expect(framesCanvas().style.opacity).not.toBe('0'))
  await new Promise((r) => setTimeout(r, 50))
  expect(fakeDust.render).not.toHaveBeenCalled()
})

it('disposes a particle layer that arrives after unmount', async () => {
  webgl()
  let resolve!: (d: typeof fakeDust) => void
  dust.createDust.mockReturnValue(new Promise((r) => (resolve = r)))
  const { unmount } = renderRoute('/')
  await waitFor(() => expect(dust.createDust).toHaveBeenCalled())
  unmount()
  await act(async () => resolve(fakeDust))
  expect(fakeDust.dispose).toHaveBeenCalledTimes(1)
  expect(fakeDust.render).not.toHaveBeenCalled()
})

it('fades the particles once, through the canvas, not again in the shader', async () => {
  webgl()
  dust.createDust.mockResolvedValue(fakeDust)
  renderRoute('/')
  await waitFor(() => expect(fakeDust.render).toHaveBeenCalled())
  for (const call of fakeDust.render.mock.calls) expect(call[1]).toBe(1)
})

it('does not create the particle layer when the hero unmounts while three.js loads', async () => {
  webgl()
  const { unmount } = renderRoute('/')
  unmount()
  await new Promise((r) => setTimeout(r, 20))
  expect(dust.createDust).not.toHaveBeenCalled()
})
