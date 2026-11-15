import { screen, within } from '@testing-library/react'
import { expect, it } from 'vitest'
import { renderRoute } from '../../test/render'

it('shows the owner name and the three navigation links', () => {
  renderRoute('/about')
  const nav = screen.getByRole('navigation')
  expect(within(nav).getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '/projects')
  expect(within(nav).getByRole('link', { name: 'CV' })).toHaveAttribute('href', '/cv')
  expect(within(nav).getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'page')
  expect(screen.getByRole('banner')).toHaveTextContent('Yintong Zhou')
})

it('offers a skip link to the main content as the first link', () => {
  renderRoute('/')
  expect(screen.getAllByRole('link')[0]).toHaveAttribute('href', '#main')
  expect(screen.getByRole('main')).toHaveAttribute('id', 'main')
})

it('shows identity and public links in the footer', () => {
  renderRoute('/')
  const footer = screen.getByRole('contentinfo')
  expect(footer).toHaveTextContent('Yintong Zhou · Fullstack .NET Software Developer · Milan')
  expect(within(footer).getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/yintong-zhou')
  expect(within(footer).getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', 'https://www.linkedin.com/in/yintong-zhou')
  expect(within(footer).getByRole('link', { name: 'Email' })).toHaveAttribute('href', 'mailto:contactdm.yt@gmail.com')
})

it('renders the About copy and sets the document title', () => {
  renderRoute('/about')
  expect(screen.getByRole('heading', { level: 1, name: 'About' })).toBeInTheDocument()
  expect(screen.getByText(/I'm a fullstack software developer based in Milan/)).toBeInTheDocument()
  expect(document.title).toBe('About · Yintong Zhou')
})

it('shows a not-found page with a way back for an unknown address', () => {
  renderRoute('/nope')
  expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/')
})

it('never renders the repository name', () => {
  renderRoute('/')
  expect(document.body.textContent).not.toMatch(/jade-atlas/i)
})
