import type { UseQueryResult } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { texts } from '../texts'
import { QueryBoundary } from './QueryBoundary'

function query(state: 'pending' | 'error' | 'success', data?: string[]) {
  return {
    status: state,
    data,
    isPending: state === 'pending',
    isError: state === 'error',
  } as unknown as UseQueryResult<string[]>
}

function renderBoundary(q: UseQueryResult<string[]>) {
  return render(
    <QueryBoundary query={q} emptyText="Nothing here.">
      {(items) => <ul>{items.map((i) => <li key={i}>{i}</li>)}</ul>}
    </QueryBoundary>,
  )
}

it('renders nothing while pending', () => {
  const { container } = renderBoundary(query('pending'))
  expect(container).toBeEmptyDOMElement()
})

it('renders the load error as an alert', () => {
  renderBoundary(query('error'))
  expect(screen.getByRole('alert')).toHaveTextContent(texts.errors.load)
})

it('renders the empty text when the list is empty', () => {
  renderBoundary(query('success', []))
  expect(screen.getByText('Nothing here.')).toBeInTheDocument()
})

it('renders children with the items when there are any', () => {
  renderBoundary(query('success', ['a', 'b']))
  expect(screen.getAllByRole('listitem')).toHaveLength(2)
})
