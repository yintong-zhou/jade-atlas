import { render, screen, within } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { publicApi } from '../../../shared/api/publicApi'
import type { Education, Experience, Skill } from '../../../shared/api/types'
import { renderRoute } from '../../../test/render'
import { CvDownloadLink } from './CvPage'

function stubCv({
  experiences = [],
  skills = [],
  education = [],
}: { experiences?: Experience[]; skills?: Skill[]; education?: Education[] }) {
  vi.spyOn(publicApi, 'getExperiences').mockResolvedValue(experiences)
  vi.spyOn(publicApi, 'getSkills').mockResolvedValue(skills)
  vi.spyOn(publicApi, 'getEducation').mockResolvedValue(education)
}

it('renders the experience timeline with a formatted range and "Present" for the current role', async () => {
  stubCv({
    experiences: [
      { id: 1, role: 'Developer', company: 'Acme', location: 'Milan', startDate: '2020-04-01', endDate: null, description: 'Built things.' },
      { id: 2, role: 'Junior developer', company: 'Beta', location: null, startDate: '2018-01-15', endDate: '2020-03-01', description: 'Learned things.' },
    ],
  })
  renderRoute('/cv')
  expect(await screen.findByText('Apr 2020 – Present')).toBeInTheDocument()
  expect(screen.getByText('Jan 2018 – Mar 2020')).toBeInTheDocument()
  expect(screen.getByRole('heading', { level: 3, name: 'Developer' })).toBeInTheDocument()
  expect(screen.getByText('Acme · Milan')).toBeInTheDocument()
  expect(screen.getByText('Beta')).toBeInTheDocument()
})

it('groups skills by category, languages included', async () => {
  stubCv({
    skills: [
      { id: 1, category: 'Backend', name: 'C#' },
      { id: 2, category: 'Languages', name: 'Italian' },
      { id: 3, category: 'Backend', name: 'ASP.NET' },
    ],
  })
  renderRoute('/cv')
  const backend = await screen.findByRole('heading', { level: 3, name: 'Backend' })
  const languages = screen.getByRole('heading', { level: 3, name: 'Languages' })
  const tagsOf = (heading: HTMLElement) =>
    within(heading.nextElementSibling as HTMLElement).getAllByRole('listitem').map((li) => li.textContent)
  expect(tagsOf(backend)).toEqual(['C#', 'ASP.NET'])
  expect(tagsOf(languages)).toEqual(['Italian'])
})

it('separates education from certifications and hides an empty group', async () => {
  stubCv({
    education: [{ id: 1, type: 'certification', title: 'Cert one', institution: 'Issuer', year: 2021 }],
  })
  renderRoute('/cv')
  expect(await screen.findByRole('heading', { level: 3, name: 'Certifications' })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { level: 3, name: 'Education' })).toBeNull()
  expect(screen.getByText('Cert one')).toBeInTheDocument()
  expect(screen.getByText('2021')).toBeInTheDocument()
})

it('shows the empty text in each section when nothing is published', async () => {
  stubCv({})
  renderRoute('/cv')
  expect(await screen.findAllByText('Nothing published yet.')).toHaveLength(3)
})

it('renders the download link only when a PDF URL is configured', () => {
  const { container, unmount } = render(<CvDownloadLink url={null} />)
  expect(container).toBeEmptyDOMElement()
  unmount()
  render(<CvDownloadLink url="/cv.pdf" />)
  const link = screen.getByRole('link', { name: 'Download CV (PDF)' })
  expect(link).toHaveAttribute('href', '/cv.pdf')
  expect(link).toHaveAttribute('download')
})
