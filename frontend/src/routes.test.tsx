import { screen, waitFor } from '@testing-library/react'
import { expect, it } from 'vitest'
import { createMemoryRouter } from 'react-router'
import { QueryClient } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { App } from './App'
import { routes } from './routes'
import { texts } from './shared/texts'

it('replaces the legacy CV route with About', async () => {
  const router = createMemoryRouter(routes, { initialEntries: ['/cv'] })
  render(<App router={router} queryClient={new QueryClient()} />)
  await waitFor(() => expect(router.state.location.pathname).toBe('/about'))
  expect(router.state.historyAction).toBe('REPLACE')
  expect(screen.getByRole('heading', { level: 1, name: texts.about.heading })).toBeInTheDocument()
})
