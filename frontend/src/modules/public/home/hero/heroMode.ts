import { prefersReducedMotion } from '../../../../shared/motion'
import { HERO } from './heroTimeline'

export const shortViewportQuery = `(max-height: ${HERO.minViewportHeight - 1}px)`

// Static under reduced motion, and on viewports too short for title, subtitle and buttons in a pinned stage.
export function heroMode(): 'static' | 'sequence' {
  return prefersReducedMotion() || window.matchMedia(shortViewportQuery).matches ? 'static' : 'sequence'
}

export function supportsWebGL(): boolean {
  try {
    return document.createElement('canvas').getContext('webgl2') != null
  } catch {
    return false
  }
}
