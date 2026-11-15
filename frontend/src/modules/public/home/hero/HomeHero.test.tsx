import { screen, within } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import { publicApi } from '../../../../shared/api/publicApi'
import { texts } from '../../../../shared/texts'
import { renderRoute } from '../../../../test/render'

beforeEach(() => {
  vi.spyOn(publicApi, 'getProjects').mockResolvedValue([])
})

it('shows the full title as one heading with the name highlighted', () => {
  renderRoute('/')
  const h1 = screen.getByRole('heading', { level: 1, name: texts.home.title })
  expect(within(h1).getByText('Yintong Zhou.')).toHaveClass('text-accent')
})

it('shows subtitle and both actions', () => {
  renderRoute('/')
  expect(screen.getByText(texts.home.subtitle)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'See projects' })).toHaveAttribute('href', '/projects')
  expect(screen.getByRole('link', { name: 'Read my CV' })).toHaveAttribute('href', '/cv')
})

it('shows the still jade stone as a decorative image and no canvas', () => {
  renderRoute('/')
  const hero = document.querySelector('[data-hero="static"]')!
  expect(hero.querySelector('img')).toHaveAttribute('alt', '')
  expect(hero.querySelector('canvas')).toBeNull()
})
