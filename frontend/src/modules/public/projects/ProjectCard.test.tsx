import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { expect, it } from 'vitest'
import type { Project } from '../../../shared/api/types'
import { bare, full } from '../../../test/fixtures'
import { ProjectCard } from './ProjectCard'

const renderCard = (project: Project) =>
  render(
    <MemoryRouter>
      <ProjectCard project={project} />
    </MemoryRouter>,
  )

it('is a single link to the project page with title, summary and tags', () => {
  renderCard(full)
  const links = screen.getAllByRole('link')
  expect(links).toHaveLength(1)
  expect(links[0]).toHaveAttribute('href', `/projects/${full.slug}`)
  for (const text of [full.title, full.summary, 'C#', 'Oracle']) expect(links[0]).toHaveTextContent(text)
})

it('shows the cover with alt text, lazy loading and reserved 16:9 space', () => {
  renderCard(full)
  const img = screen.getByRole('img', { name: `Cover image of ${full.title}` })
  expect(img).toHaveAttribute('loading', 'lazy')
  expect(img).toHaveClass('aspect-video')
})

it('shows a muted block with the title when there is no cover, and no empty tag list', () => {
  renderCard(bare)
  expect(screen.queryByRole('img')).toBeNull()
  expect(screen.queryByRole('list')).toBeNull()
  expect(screen.getAllByText(bare.title)).toHaveLength(2)
})

it('lets a long unbroken title wrap', () => {
  renderCard(bare)
  expect(screen.getByRole('heading', { name: bare.title })).toHaveClass('wrap-anywhere')
})
