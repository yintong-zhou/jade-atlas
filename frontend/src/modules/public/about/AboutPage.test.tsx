import { screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { publicApi } from '../../../shared/api/publicApi'
import { texts } from '../../../shared/texts'
import { renderRoute } from '../../../test/render'

it('shows the bio, the career sections and a link to the full CV', async () => {
  vi.spyOn(publicApi, 'getExperiences').mockResolvedValue([
    {
      id: 1,
      role: 'Developer',
      company: 'Acme',
      location: null,
      startDate: '2020-04-01',
      endDate: null,
      description: 'Built things.',
    },
  ])
  vi.spyOn(publicApi, 'getSkills').mockResolvedValue([{ id: 1, category: 'Backend', name: 'C#' }])
  vi.spyOn(publicApi, 'getEducation').mockResolvedValue([])
  renderRoute('/about')

  expect(screen.getByText(texts.about.body)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: texts.about.cvLink })).toHaveAttribute('href', '/cv')
  expect(await screen.findByRole('heading', { level: 3, name: 'Developer' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { level: 2, name: texts.cv.skills })).toBeInTheDocument()
})
