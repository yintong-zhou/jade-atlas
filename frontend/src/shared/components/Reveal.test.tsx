import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { stubMatchMedia } from '../../test/media'
import { Reveal } from './Reveal'

it('starts hidden and offset when motion is allowed', () => {
  stubMatchMedia(false)
  render(<Reveal><p>content</p></Reveal>)
  expect(screen.getByText('content').parentElement!.style.opacity).toBe('0')
})

it('renders the final state at once when reduced motion is requested', () => {
  render(<Reveal><p>content</p></Reveal>)
  expect(screen.getByText('content').parentElement!.style.opacity).not.toBe('0')
})
