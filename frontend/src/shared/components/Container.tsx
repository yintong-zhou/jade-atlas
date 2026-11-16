import type { ReactNode } from 'react'

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-[min(100%-2*var(--gut),1280px)] ${className}`}>{children}</div>
}
