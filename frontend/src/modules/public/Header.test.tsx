import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { expect, it } from 'vitest'
import { Header } from './Header'

it('keeps the island rendered with the owner and navigation links', () => {
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>,
  )

  const owner = screen.getByRole('link', { name: 'Yintong Zhou' })
  expect(owner.parentElement).toBeInTheDocument()
  expect(owner).toHaveAttribute('href', '/')

  const navigation = within(screen.getByRole('navigation'))
  expect(navigation.getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '/projects')
  expect(navigation.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about')
  expect(navigation.getAllByRole('link')).toHaveLength(2)
  expect(navigation.queryByRole('link', { name: 'CV' })).not.toBeInTheDocument()
})
