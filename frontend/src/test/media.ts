import { vi } from 'vitest'

let changeListeners: (() => void)[] = []

// Full MediaQueryList shape: Motion calls the listener methods.
// `matches`: one answer for every query, or a function of the query (asked again on every read).
export function stubMatchMedia(matches: boolean | ((query: string) => boolean)): void {
  changeListeners = []
  window.matchMedia = vi.fn((query: string) => ({
    get matches() {
      return typeof matches === 'function' ? matches(query) : matches
    },
    media: query,
    onchange: null,
    addEventListener: vi.fn((type: string, cb: () => void) => {
      if (type === 'change') changeListeners.push(cb)
    }),
    removeEventListener: vi.fn((_type: string, cb: () => void) => {
      changeListeners = changeListeners.filter((l) => l !== cb)
    }),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(() => false),
  })) as unknown as typeof window.matchMedia
}

// Fires the 'change' listeners registered on the stubbed media queries.
export function fireMediaChange(): void {
  ;[...changeListeners].forEach((l) => l())
}
