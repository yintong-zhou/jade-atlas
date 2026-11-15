import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { expect, it } from 'vitest'
import { ButtonLink } from './ButtonLink'

it('renders a link to the target', () => {
  render(
    <MemoryRouter>
      <ButtonLink to="/projects" variant="main">See projects</ButtonLink>
    </MemoryRouter>,
  )
  expect(screen.getByRole('link', { name: 'See projects' })).toHaveAttribute('href', '/projects')
})
