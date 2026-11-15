import type { ReactNode } from 'react'

// A list item: tags always sit in a <ul>.
export function Tag({ children }: { children: ReactNode }) {
  return <li className="type-label rounded-sm bg-muted px-2 py-1 wrap-anywhere text-foreground">{children}</li>
}
