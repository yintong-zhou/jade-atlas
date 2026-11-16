import { render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { texts } from '../../../shared/texts'
import { StackDiagram } from './StackDiagram'

it('enables pulses only while the diagram intersects the viewport and disconnects on unmount', () => {
  let notify: IntersectionObserverCallback = () => {}
  let observed: Element | undefined
  const disconnect = vi.fn()
  window.IntersectionObserver = class {
    constructor(callback: IntersectionObserverCallback) {
      notify = callback
    }
    observe(target: Element) {
      observed = target
    }
    disconnect = disconnect
  } as unknown as typeof IntersectionObserver

  const { unmount } = render(<StackDiagram />)
  const figure = screen.getByRole('figure', { name: texts.home.stack.summary })
  expect(observed).toBe(figure)
  expect(figure).not.toHaveAttribute('data-in-view', 'true')
  notify([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
  expect(figure).toHaveAttribute('data-in-view', 'true')
  notify([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver)
  expect(figure).toHaveAttribute('data-in-view', 'false')
  unmount()
  expect(disconnect).toHaveBeenCalledOnce()
})

it('keeps the diagram readable when IntersectionObserver is unavailable', () => {
  const observer = window.IntersectionObserver
  Object.defineProperty(window, 'IntersectionObserver', { configurable: true, value: undefined, writable: true })
  try {
    render(<StackDiagram />)
    expect(screen.getByRole('figure', { name: texts.home.stack.summary })).toBeVisible()
    expect(screen.getByText('JavaScript')).toBeVisible()
    expect(screen.getByText('Google APIs')).toBeVisible()
  } finally {
    window.IntersectionObserver = observer
  }
})
