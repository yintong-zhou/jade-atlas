import { screen, within } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { publicApi } from '../../../shared/api/publicApi'
import type { Experience } from '../../../shared/api/types'
import { renderRoute } from '../../../test/render'
import { texts } from '../../../shared/texts'

function stubCv({ experiences = [] }: { experiences?: Experience[] }) {
  vi.spyOn(publicApi, 'getExperiences').mockResolvedValue(experiences)
}

it('renders change items in data order and marks only current roles', async () => {
  stubCv({
    experiences: [
      {
        id: 1,
        role: 'Developer',
        company: 'Acme',
        location: 'Milan',
        startDate: '2020-04-01',
        endDate: null,
        description: 'Built things.\nConnected services.',
      },
      {
        id: 2,
        role: 'Junior developer',
        company: 'Beta',
        location: null,
        startDate: '2018-01-15',
        endDate: '2020-03-01',
        description: 'Learned things.',
      },
    ],
  })
  renderRoute('/about')
  expect(await screen.findByText('Apr 2020 – Present')).toBeInTheDocument()
  expect(screen.getByText('Jan 2018 – Mar 2020')).toBeInTheDocument()
  expect(screen.getByRole('heading', { level: 3, name: 'Developer' })).toBeInTheDocument()
  expect(screen.getByText('Acme · Milan')).toBeInTheDocument()
  expect(screen.getByText('Beta')).toBeInTheDocument()
  const developer = screen.getByRole('heading', { level: 3, name: 'Developer' }).closest('li')!
  expect(
    within(developer)
      .getAllByRole('listitem')
      .map((item) => item.textContent),
  ).toEqual(['Built things.', 'Connected services.'])
  const junior = screen.getByRole('heading', { level: 3, name: 'Junior developer' }).closest('li')!
  expect(within(junior).getByRole('listitem')).toHaveTextContent('Learned things.')
  expect(
    within(document.getElementById('experience')!)
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.textContent),
  ).toEqual(['Developer', 'Junior developer'])
  expect(within(developer).getByText('Current')).toBeInTheDocument()
  expect(within(junior).queryByText('Current')).toBeNull()
})

it('shows skills within their experience', async () => {
  stubCv({
    experiences: [
      {
        id: 1,
        role: 'Developer',
        company: 'Acme',
        location: null,
        startDate: '2020-01-01',
        endDate: null,
        description: 'Built things.',
        skills: ['C#', 'ASP.NET'],
      },
    ],
  })
  renderRoute('/about')
  const role = await screen.findByRole('heading', { name: 'Developer' })
  expect(within(role.closest('li')!).getByRole('list', { name: 'Skills' })).toHaveTextContent('C#ASP.NET')
})

it('shows the empty text when no experience is published', async () => {
  stubCv({})
  renderRoute('/about')
  expect(await screen.findAllByText('Nothing published yet.')).toHaveLength(1)
})

it('preserves the ICPN link in a single change item', async () => {
  stubCv({
    experiences: [
      {
        id: 1,
        role: 'Volunteer',
        company: 'ICPN',
        location: null,
        startDate: '2019-03-01',
        endDate: null,
        description: 'Run the icpn.it website.',
      },
    ],
  })
  renderRoute('/about')
  const link = await screen.findByRole('link', { name: 'icpn.it' })
  expect(link).toHaveAttribute('href', 'https://icpn.it/')
  expect(link.closest('li')).toHaveTextContent('Run the icpn.it website.')
})

it('keeps the bio available when experience fails to load', async () => {
  stubCv({})
  vi.spyOn(publicApi, 'getExperiences').mockRejectedValue(new Error('network'))
  renderRoute('/about')
  expect(await screen.findByRole('alert')).toHaveTextContent(texts.errors.load)
  expect(screen.getByRole('heading', { name: texts.cv.experience })).toBeInTheDocument()
  expect(screen.getByText(texts.about.paragraphs[0])).toBeInTheDocument()
})
