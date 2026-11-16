import type { ReactNode } from 'react'

// A list item: tags always sit in a <ul>.
export function Tag({ children }: { children: ReactNode }) {
  return <li className="type-label rounded-full bg-foreground/6 px-3 py-1 wrap-anywhere text-foreground">{children}</li>
}
