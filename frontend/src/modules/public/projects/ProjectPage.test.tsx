import { screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { publicApi } from '../../../shared/api/publicApi'
import { texts } from '../../../shared/texts'
import { bare, full } from '../../../test/fixtures'
import { renderRoute } from '../../../test/render'

it('shows title, summary, description, tags and both links', async () => {
  vi.spyOn(publicApi, 'getProject').mockResolvedValue(full)
  renderRoute(`/projects/${full.slug}`)
  expect(await screen.findByRole('heading', { level: 1, name: full.title })).toBeInTheDocument()
  expect(screen.getByText(full.summary)).toBeInTheDocument()
  expect(screen.getByText(/First paragraph/)).toBeInTheDocument()
  expect(screen.getByText('C#')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Repository' })).toHaveAttribute('href', full.repoUrl)
  expect(screen.getByRole('link', { name: 'Website' })).toHaveAttribute('href', full.siteUrl)
  for (const name of [texts.projects.repo, texts.projects.site]) {
    expect(screen.getByRole('link', { name })).toHaveAttribute('target', '_blank')
    expect(screen.getByRole('link', { name })).toHaveAttribute('rel', 'noreferrer')
  }
  expect(screen.getByRole('link', { name: texts.projects.back })).toHaveAttribute('href', '/projects')
  expect(document.title).toBe(`${full.title} · Yintong Zhou`)
})

it('omits the links and the tag list that have no data', async () => {
  vi.spyOn(publicApi, 'getProject').mockResolvedValue(bare)
  renderRoute(`/projects/${bare.slug}`)
  expect(await screen.findByRole('heading', { level: 1, name: bare.title })).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Repository' })).toBeNull()
  expect(screen.queryByRole('link', { name: 'Website' })).toBeNull()
  expect(screen.queryByRole('img')).toBeNull()
  expect(screen.queryAllByRole('list').filter((l) => l.closest('main'))).toHaveLength(0)
})

it('shows an error when loading fails', async () => {
  vi.spyOn(publicApi, 'getProject').mockRejectedValue(new Error('network'))
  renderRoute(`/projects/${full.slug}`)
  expect(await screen.findByRole('alert')).toHaveTextContent(texts.errors.load)
})

it('shows the not-found page for an unknown slug', async () => {
  vi.spyOn(publicApi, 'getProject').mockResolvedValue(null)
  renderRoute('/projects/unknown-slug')
  expect(await screen.findByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument()
})
