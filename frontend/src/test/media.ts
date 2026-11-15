import { vi } from 'vitest'

// Full MediaQueryList shape: Motion calls the listener methods.
// `matches`: one answer for every query, or a function of the query.
export function stubMatchMedia(matches: boolean | ((query: string) => boolean)): void {
  window.matchMedia = vi.fn((query: string) => ({
    matches: typeof matches === 'function' ? matches(query) : matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(() => false),
  })) as unknown as typeof window.matchMedia
}
