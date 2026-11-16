import { QueryClient } from '@tanstack/react-query'
import { render, type RenderResult } from '@testing-library/react'
import { createMemoryRouter } from 'react-router'
import { App } from '../App'
import { routes } from '../routes'

export function renderRoute(path: string): RenderResult {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<App router={router} queryClient={queryClient} />)
}
