import { screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { publicApi } from '../../../shared/api/publicApi'
import { texts } from '../../../shared/texts'
import { bare, full } from '../../../test/fixtures'
import { renderRoute } from '../../../test/render'

it('lists the published projects', async () => {
  vi.spyOn(publicApi, 'getProjects').mockResolvedValue([full, bare])
  renderRoute('/projects')
  expect(await screen.findAllByRole('article')).toHaveLength(2)
})

it('shows the empty state when nothing is published', async () => {
  vi.spyOn(publicApi, 'getProjects').mockResolvedValue([])
  renderRoute('/projects')
  expect(await screen.findByText('No projects published yet.')).toBeInTheDocument()
})

it('shows an error and keeps navigation usable when loading fails', async () => {
  vi.spyOn(publicApi, 'getProjects').mockRejectedValue(new Error('network'))
  renderRoute('/projects')
  expect(await screen.findByRole('alert')).toHaveTextContent(texts.errors.load)
  expect(screen.getByRole('navigation')).toBeInTheDocument()
  expect(screen.getByRole('contentinfo')).toBeInTheDocument()
})
