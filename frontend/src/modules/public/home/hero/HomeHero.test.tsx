import { screen } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import { publicApi } from '../../../../shared/api/publicApi'
import { texts } from '../../../../shared/texts'
import { renderRoute } from '../../../../test/render'

beforeEach(() => {
  vi.spyOn(publicApi, 'getProjects').mockResolvedValue([])
})

it('leads with what the owner does, without the owner name', () => {
  renderRoute('/')
  const h1 = screen.getByRole('heading', { level: 1, name: texts.home.title })
  expect(h1).not.toHaveTextContent(texts.owner.name)
})

it('shows subtitle and both actions', () => {
  renderRoute('/')
  expect(screen.getByText(texts.home.subtitle)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'See projects' })).toHaveAttribute('href', '/projects')
  expect(screen.getByRole('link', { name: 'Read my CV' })).toHaveAttribute('href', '/about#experience')
})

it('shows the complete copy without the old stone image or canvas in static mode', () => {
  renderRoute('/')
  const hero = document.querySelector('[data-hero="static"]')!
  expect(hero.querySelector('img')).toBeNull()
  expect(hero.querySelector('canvas')).toBeNull()
})
