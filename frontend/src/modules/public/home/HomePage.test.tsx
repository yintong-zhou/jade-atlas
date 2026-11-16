import { screen, waitFor } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { publicApi } from '../../../shared/api/publicApi'
import { texts } from '../../../shared/texts'
import { bare, full } from '../../../test/fixtures'
import { renderRoute } from '../../../test/render'

const countValues = () => [...document.querySelectorAll('[data-count-to]')].map((el) => el.textContent)

it('shows the title, subtitle and the two actions', async () => {
  vi.spyOn(publicApi, 'getProjects').mockResolvedValue([])
  renderRoute('/')
  expect(screen.getByRole('heading', { level: 1, name: texts.home.title })).toBeInTheDocument()
  expect(screen.getByText(texts.home.subtitle)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'See projects' })).toHaveAttribute('href', '/projects')
  expect(screen.getByRole('link', { name: 'Read my CV' })).toHaveAttribute('href', '/cv')
})

it('shows the three numbers with their exact values in the initial render', () => {
  vi.spyOn(publicApi, 'getProjects').mockResolvedValue([])
  renderRoute('/')
  expect(countValues()).toEqual(['8', '38', '10'])
  for (const n of texts.home.numbers) expect(screen.getByText(n.label)).toBeInTheDocument()
  expect(screen.getAllByText('+')).toHaveLength(2)
})

it('previews at most three projects and links to the full list', async () => {
  const projects = [full, bare, { ...full, slug: 'third' }, { ...full, slug: 'fourth' }]
  vi.spyOn(publicApi, 'getProjects').mockResolvedValue(projects)
  renderRoute('/')
  expect(await screen.findAllByRole('article')).toHaveLength(3)
  expect(screen.getByRole('link', { name: 'All projects' })).toHaveAttribute('href', '/projects')
})

it('hides the preview section when no project is published', async () => {
  const spy = vi.spyOn(publicApi, 'getProjects').mockResolvedValue([])
  renderRoute('/')
  await waitFor(() => expect(spy).toHaveBeenCalled())
  await new Promise((r) => setTimeout(r, 0))
  expect(screen.queryByRole('heading', { name: 'Projects' })).toBeNull()
})

it('invites the visitor to get in touch by email', () => {
  vi.spyOn(publicApi, 'getProjects').mockResolvedValue([])
  renderRoute('/')
  expect(screen.getByRole('heading', { name: texts.home.contactTitle })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'contactdm.yt@gmail.com' })).toHaveAttribute(
    'href',
    'mailto:contactdm.yt@gmail.com',
  )
})
