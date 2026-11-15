import { vi } from 'vitest'

// Full MediaQueryList shape: Motion calls the listener methods.
export function stubMatchMedia(reduced: boolean): void {
  window.matchMedia = vi.fn((query: string) => ({
    matches: reduced,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(() => false),
  })) as unknown as typeof window.matchMedia
}
