import { screen } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import { publicApi } from '../../../shared/api/publicApi'
import { texts } from '../../../shared/texts'
import { stubMatchMedia } from '../../../test/media'
import { renderRoute } from '../../../test/render'

const anime = vi.hoisted(() => {
  const revert = vi.fn()
  const timeline = { add: vi.fn() }
  timeline.add.mockReturnValue(timeline)
  return {
    revert,
    timeline,
    createScope: vi.fn(),
    createTimeline: vi.fn(() => timeline),
    stagger: vi.fn(() => () => 0),
  }
})

vi.mock('animejs', () => ({
  createScope: anime.createScope,
  createTimeline: anime.createTimeline,
  stagger: anime.stagger,
}))

beforeEach(() => {
  anime.revert.mockClear()
  anime.createTimeline.mockClear()
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

const countValues = () => [...document.querySelectorAll('[data-count-to]')].map((el) => el.textContent)

it('builds one timeline when motion is allowed and reverts it on unmount', () => {
  stubMatchMedia(false)
  const { unmount } = renderRoute('/')
  expect(anime.createTimeline).toHaveBeenCalledTimes(1)
  unmount()
  expect(anime.revert).toHaveBeenCalledTimes(1)
})

it('does not start any animation when reduced motion is requested', () => {
  renderRoute('/')
  expect(anime.createScope).not.toHaveBeenCalled()
  expect(anime.createTimeline).not.toHaveBeenCalled()
  expect(countValues()).toEqual(['8', '38', '10'])
})

it('keeps the page readable when the animation library throws', () => {
  stubMatchMedia(false)
  anime.createScope.mockImplementation(() => {
    throw new Error('boom')
  })
  renderRoute('/')
  expect(screen.getByRole('heading', { level: 1, name: texts.home.title })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'See projects' })).toBeInTheDocument()
  expect(countValues()).toEqual(['8', '38', '10'])
})
