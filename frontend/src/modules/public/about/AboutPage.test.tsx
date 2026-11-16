import { screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { publicApi } from '../../../shared/api/publicApi'
import { texts } from '../../../shared/texts'
import { renderRoute } from '../../../test/render'

it('shows the three bio paragraphs followed by the career sections', async () => {
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

  for (const paragraph of texts.about.paragraphs) expect(screen.getByText(paragraph)).toBeInTheDocument()
  expect(screen.getByRole('heading', { level: 1, name: texts.about.heading })).toBeInTheDocument()
  expect(document.title).toBe(`${texts.about.title} · ${texts.owner.name}`)
  expect(screen.queryByRole('link', { name: texts.about.cvLink })).toBeNull()
  expect(screen.queryByRole('link', { name: texts.cv.download })).toBeNull()
  expect(await screen.findByRole('heading', { level: 3, name: 'Developer' })).toBeInTheDocument()
  expect(screen.getByRole('heading', { level: 2, name: texts.cv.skills })).toBeInTheDocument()
  expect(screen.getByRole('heading', { level: 2, name: texts.cv.educationAndCertifications })).toBeInTheDocument()
  expect(document.getElementById('experience')).toContainElement(screen.getByRole('heading', { name: 'Developer' }))
})
