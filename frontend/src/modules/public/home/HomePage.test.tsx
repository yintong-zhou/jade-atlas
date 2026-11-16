import { screen, waitFor, within } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { publicApi } from '../../../shared/api/publicApi'
import { texts } from '../../../shared/texts'
import { bare, full } from '../../../test/fixtures'
import { renderRoute } from '../../../test/render'

it('shows the title, subtitle and the two actions', async () => {
  vi.spyOn(publicApi, 'getProjects').mockResolvedValue([])
  renderRoute('/')
  expect(screen.getByRole('heading', { level: 1, name: texts.home.title })).toBeInTheDocument()
  expect(screen.getByText(texts.home.subtitle)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'See projects' })).toHaveAttribute('href', '/projects')
  expect(screen.getByRole('link', { name: 'Read my CV' })).toHaveAttribute('href', '/about#experience')
})

it('explains the stack with readable tool names before the numbers', () => {
  vi.spyOn(publicApi, 'getProjects').mockResolvedValue([])
  renderRoute('/')
  const heading = screen.getByRole('heading', { level: 2, name: texts.home.stackTitle })
  const diagram = screen.getByRole('figure', { name: texts.home.stack.summary })
  for (const name of [
    'Frontend',
    texts.home.stack.frontEnd.detail,
    'Backend',
    'C#, ASP.NET MVC, Web API',
    'Oracle',
    'SQL Server',
    'PostgreSQL',
    'External APIs',
  ]) {
    expect(within(diagram).getByText(name)).toBeVisible()
  }
  expect(within(diagram).getByRole('heading', { name: 'Data', level: 3 })).toBeVisible()
  expect(within(diagram).getByRole('heading', { name: 'External services', level: 3 })).toBeVisible()
  expect(diagram.querySelectorAll('img[alt=""], svg[aria-hidden="true"]').length).toBeGreaterThanOrEqual(6)
  expect(heading.compareDocumentPosition(diagram) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
})

it('previews at most three projects and links to the full list', async () => {
  const projects = [full, bare, { ...full, slug: 'third' }, { ...full, slug: 'fourth' }]
  vi.spyOn(publicApi, 'getProjects').mockResolvedValue(projects)
  renderRoute('/')
  expect(await screen.findAllByRole('article')).toHaveLength(3)
  expect(screen.getByRole('link', { name: texts.home.previewAll })).toHaveAttribute('href', '/projects')
  expect(document.querySelector('a[href="/projects/fourth"]')).not.toBeInTheDocument()
  const sections = screen.getByRole('main').querySelectorAll(':scope > section')
  expect(sections).toHaveLength(3)
  expect(within(sections[1] as HTMLElement).getByRole('figure', { name: texts.home.stack.summary })).toBeVisible()
  expect(
    within(sections[2] as HTMLElement).getByRole('heading', { level: 2, name: texts.home.previewTitle }),
  ).toBeVisible()
})

it('hides the preview section when no project is published', async () => {
  const spy = vi.spyOn(publicApi, 'getProjects').mockResolvedValue([])
  renderRoute('/')
  await waitFor(() => expect(spy).toHaveBeenCalled())
  await new Promise((r) => setTimeout(r, 0))
  expect(screen.queryByRole('heading', { name: 'Projects' })).toBeNull()
  expect(screen.queryByRole('link', { name: texts.home.previewAll })).not.toBeInTheDocument()
})

it('invites the visitor to get in touch by email', () => {
  vi.spyOn(publicApi, 'getProjects').mockResolvedValue([])
  renderRoute('/')
  expect(screen.getAllByRole('heading', { name: texts.closing.title })).toHaveLength(1)
  expect(screen.getByRole('main')).not.toHaveTextContent(texts.closing.title)
  expect(screen.getByRole('link', { name: texts.closing.action })).toHaveAttribute(
    'href',
    'mailto:contactdm.yt@gmail.com',
  )
})
