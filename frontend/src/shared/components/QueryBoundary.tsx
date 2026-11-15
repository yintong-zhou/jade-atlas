import type { UseQueryResult } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { texts } from '../texts'

export function LoadError() {
  return (
    <p role="alert" className="text-destructive">
      {texts.errors.load}
    </p>
  )
}

export function QueryBoundary<T>({
  query,
  emptyText,
  children,
}: {
  query: UseQueryResult<T[]>
  emptyText: string
  children: (items: T[]) => ReactNode
}) {
  if (query.isPending) return null
  if (query.isError) return <LoadError />
  if (!query.data.length) return <p className="text-muted-foreground">{emptyText}</p>
  return children(query.data)
}
