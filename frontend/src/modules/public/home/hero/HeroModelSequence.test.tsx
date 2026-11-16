import { act, screen, waitFor } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import { publicApi } from '../../../../shared/api/publicApi'
import { texts } from '../../../../shared/texts'
import { fireMediaChange, stubMatchMedia } from '../../../../test/media'
import { renderRoute } from '../../../../test/render'
import { copyState, HERO } from './heroTimeline'

const scene = vi.hoisted(() => ({ createHeroScene: vi.fn() }))
vi.mock('./heroScene', () => ({ createHeroScene: scene.createHeroScene }))
const model = { render: vi.fn(), layout: vi.fn(), dispose: vi.fn() }
let resize: () => void
let intersect: (visible: boolean) => void
const hero = () => document.querySelector<HTMLElement>('[data-hero]')!

beforeEach(() => {
  stubMatchMedia(false)
  vi.clearAllMocks()
  model.render.mockReset()
  scene.createHeroScene.mockReset().mockReturnValue(model)
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({})) as never
  window.ResizeObserver = class {
    constructor(cb: () => void) {
      resize = cb
    }
    observe() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
  window.IntersectionObserver = class {
    constructor(callback: IntersectionObserverCallback) {
      this.cb = callback
    }
    cb: IntersectionObserverCallback
    observe(el: Element) {
      if (el.matches('[data-hero]'))
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

it('layers two decorative canvases and keeps the real heading in the document', async () => {
  renderRoute('/')
  await waitFor(() => expect(model.render).toHaveBeenCalled())
  expect(hero()).toHaveAttribute('data-hero', 'sequence')
  expect(hero().querySelectorAll('canvas')).toHaveLength(2)
  hero()
    .querySelectorAll('canvas')
    .forEach((canvas) => expect(canvas).toHaveAttribute('aria-hidden', 'true'))
  expect(hero().querySelector('[data-layer="black-hole"]')).toBeInTheDocument()
  expect(screen.getByRole('heading', { level: 1, name: texts.home.title })).toBeInTheDocument()
  expect(hero().querySelector('img')).toBeNull()
})

it('keeps invisible links unclickable and reveals the copy for keyboard focus', () => {
  renderRoute('/')
  expect(hero().querySelector<HTMLElement>('[data-hero-copy]')!.style.pointerEvents).toBe('none')
  expect(copyState(0.95, false).interactive).toBe(false)
  expect(copyState(HERO.interactive, false).interactive).toBe(true)
  const link = screen.getByRole('link', { name: 'See projects' })
  act(() => link.focus())
  expect(hero()).toHaveAttribute('data-revealed', 'true')
  act(() => link.blur())
  expect(hero()).toHaveAttribute('data-revealed', 'false')
})

it('re-measures the model and particles on resize', async () => {
  renderRoute('/')
  await waitFor(() => expect(model.render).toHaveBeenCalled())
  model.layout.mockClear()
  act(() => resize())
  await waitFor(() => expect(model.layout).toHaveBeenCalled())
})

it('stops rendering offscreen and catches up when the hero returns', async () => {
  renderRoute('/')
  await waitFor(() => expect(model.render).toHaveBeenCalled())
  act(() => intersect(false))
  model.render.mockClear()
  act(() => resize())
  await new Promise((resolve) => setTimeout(resolve, 50))
  expect(model.render).not.toHaveBeenCalled()
  act(() => intersect(true))
  await waitFor(() => expect(model.render).toHaveBeenCalled())
})

it('continues rendering the live simulation while visible and stops offscreen', async () => {
  model.render.mockReturnValue(true)
  let hidden = false
  vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden)
  renderRoute('/')
  await waitFor(() => expect(model.render.mock.calls.length).toBeGreaterThan(1))
  hidden = true
  document.dispatchEvent(new Event('visibilitychange'))
  const beforeHidden = model.render.mock.calls.length
  await new Promise((resolve) => setTimeout(resolve, 60))
  expect(model.render).toHaveBeenCalledTimes(beforeHidden)
  hidden = false
  document.dispatchEvent(new Event('visibilitychange'))
  await waitFor(() => expect(model.render.mock.calls.length).toBeGreaterThan(beforeHidden))
  act(() => intersect(false))
  const count = model.render.mock.calls.length
  await new Promise((resolve) => setTimeout(resolve, 60))
  expect(model.render).toHaveBeenCalledTimes(count)
  model.render.mockReset()
})

it('shows the static hero without loading the scene when WebGL is unavailable', async () => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as never
  renderRoute('/')
  await waitFor(() => expect(hero()).toHaveAttribute('data-hero', 'static'))
  expect(scene.createHeroScene).not.toHaveBeenCalled()
})

it.each(['null', 'error'])('shows the static hero when scene initialization fails (%s)', async (failure) => {
  if (failure === 'null') scene.createHeroScene.mockReturnValue(null)
  else
    scene.createHeroScene.mockImplementation(() => {
      throw new Error('WebGL')
    })
  renderRoute('/')
  await waitFor(() => expect(hero()).toHaveAttribute('data-hero', 'static'))
  expect(screen.getByRole('heading', { level: 1, name: texts.home.title })).toBeInTheDocument()
})

it('disposes the scene and shows the static hero when the context is lost', async () => {
  renderRoute('/')
  await waitFor(() => expect(model.render).toHaveBeenCalled())
  act(() => scene.createHeroScene.mock.calls[0][0].onLost())
  await waitFor(() => expect(hero()).toHaveAttribute('data-hero', 'static'))
  expect(model.dispose).toHaveBeenCalledTimes(1)
})

it('disposes the scene on unmount', async () => {
  const { unmount } = renderRoute('/')
  await waitFor(() => expect(model.render).toHaveBeenCalled())
  unmount()
  expect(model.dispose).toHaveBeenCalledTimes(1)
})

it('switches live to static mode for reduced motion or a short viewport', async () => {
  let reduced = false
  stubMatchMedia(() => reduced)
  renderRoute('/')
  await waitFor(() => expect(model.render).toHaveBeenCalled())
  reduced = true
  act(() => fireMediaChange())
  expect(hero()).toHaveAttribute('data-hero', 'static')
  expect(model.dispose).toHaveBeenCalledTimes(1)
})

it('does not create a scene after the hero has unmounted', async () => {
  const { unmount } = renderRoute('/')
  unmount()
  await new Promise((resolve) => setTimeout(resolve, 20))
  expect(scene.createHeroScene).not.toHaveBeenCalled()
})

it('uses the smaller star instance budget on a mobile viewport', async () => {
  stubMatchMedia((query) => query.includes('max-width'))
  renderRoute('/')
  await waitFor(() => expect(scene.createHeroScene).toHaveBeenCalled())
  expect(scene.createHeroScene.mock.calls[0][0].count).toBe(HERO.stars.small)
})

it('disposes a scene that finishes initializing after unmount', async () => {
  let finish: (value: typeof model) => void = () => {}
  scene.createHeroScene.mockReturnValue(
    new Promise((resolve) => {
      finish = resolve
    }),
  )
  const { unmount } = renderRoute('/')
  await waitFor(() => expect(scene.createHeroScene).toHaveBeenCalled())
  unmount()
  await act(async () => finish(model))
  expect(model.dispose).toHaveBeenCalledTimes(1)
})
