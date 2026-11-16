import { screen, within } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { publicApi } from '../../../shared/api/publicApi'
import { texts } from '../../../shared/texts'
import { renderRoute } from '../../../test/render'

it.each([0, 2000])('settles career rows on mount only when already visible (top %i)', async (top) => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ top } as DOMRect)
  vi.spyOn(publicApi, 'getExperiences').mockResolvedValue([
    { id: 1, role: 'Developer', company: 'Acme', location: null, startDate: '2020-04-01', endDate: null, description: 'Built things.' },
  ])
  renderRoute('/about')
  const row = (await screen.findByRole('heading', { name: 'Developer' })).closest('li')!
  if (top < window.innerHeight) expect(row).toHaveAttribute('data-scroll-settled', 'true')
  else expect(row).not.toHaveAttribute('data-scroll-settled')
})

it('settles rows brought above the fold by font loading', async () => {
  let top = 2000
  let fontsReady!: () => void
  const originalFonts = Object.getOwnPropertyDescriptor(document, 'fonts')
  Object.defineProperty(document, 'fonts', {
    configurable: true,
    value: { ready: new Promise<void>((resolve) => { fontsReady = resolve }) },
  })
  try {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => ({ top }) as DOMRect)
    vi.spyOn(publicApi, 'getExperiences').mockResolvedValue([
      { id: 1, role: 'Developer', company: 'Acme', location: null, startDate: '2020-04-01', endDate: null, description: 'Built things.' },
    ])
    renderRoute('/about')
    const row = (await screen.findByRole('heading', { name: 'Developer' })).closest('li')!
    expect(row).not.toHaveAttribute('data-scroll-settled')
    top = 100
    fontsReady()
    await document.fonts.ready
    expect(row).toHaveAttribute('data-scroll-settled', 'true')
  } finally {
    if (originalFonts) Object.defineProperty(document, 'fonts', originalFonts)
    else Reflect.deleteProperty(document, 'fonts')
  }
})

it('shows the three bio paragraphs followed by experience', async () => {
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
  renderRoute('/about')

  for (const paragraph of texts.about.paragraphs.slice(0, 2)) expect(screen.getByText(paragraph)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'ICPN' })).toHaveAttribute('href', 'https://icpn.it/')
  const facts = screen.getByText('Based in', { selector: 'dt' }).closest('dl')!
  expect(within(facts).getByText('Milan', { selector: 'dd' })).toBeInTheDocument()
  expect(within(facts).queryByText('Languages')).toBeNull()
  expect(screen.getByRole('heading', { level: 1, name: texts.about.heading })).toBeInTheDocument()
  expect(document.title).toBe(`${texts.about.title} · ${texts.owner.name}`)
  expect(screen.queryByRole('link', { name: texts.about.cvLink })).toBeNull()
  expect(screen.queryByRole('link', { name: texts.cv.download })).toBeNull()
  expect(await screen.findByRole('heading', { level: 3, name: 'Developer' })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { level: 2, name: texts.cv.skills })).toBeNull()
  expect(document.getElementById('experience')).toContainElement(screen.getByRole('heading', { name: 'Developer' }))
})

it('omits the education section even when education is published', async () => {
  vi.spyOn(publicApi, 'getExperiences').mockResolvedValue([])
  vi.spyOn(publicApi, 'getEducation').mockResolvedValue([
    { id: 1, type: 'education', title: 'Degree', institution: 'University', year: 2020 },
  ])
  renderRoute('/about')
  await screen.findByText('Nothing published yet.')
  expect(screen.queryByRole('heading', { name: 'Education and certifications' })).toBeNull()
  expect(screen.queryByRole('heading', { name: 'Degree' })).toBeNull()
  expect(document.getElementById('education')).toBeNull()
})
