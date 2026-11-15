import { createScope, createTimeline, stagger, type Scope } from 'animejs'
import { useEffect, type RefObject } from 'react'
import { prefersReducedMotion } from '../../../shared/motion'

// Home introduction (AnimeJS). Content is visible by default; the library sets the hidden start state.
export function useHomeIntro(rootRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    if (prefersReducedMotion() || !rootRef.current) return
    let scope: Scope | undefined
    try {
      const root = rootRef.current
      scope = createScope({ root: rootRef }).add(() => {
        const timeline = createTimeline({ defaults: { duration: 600, ease: 'outExpo' } })
          .add('.intro-title', { opacity: [0, 1], y: [24, 0] })
          .add('.intro-subtitle', { opacity: [0, 1], y: [24, 0] }, '-=450')
          .add('.intro-action', { opacity: [0, 1], y: [12, 0], delay: stagger(80) }, '-=450')
          .add('.intro-numbers', { opacity: [0, 1], y: [12, 0] }, '-=450')

        root.querySelectorAll<HTMLElement>('[data-count-to]').forEach((el) => {
          const target = el.dataset.countTo ?? ''
          const counter = { value: 0 }
          timeline.add(
            counter,
            {
              value: Number(target),
              duration: 800,
              onUpdate: () => {
                el.textContent = String(Math.round(counter.value))
              },
              onComplete: () => {
                el.textContent = target
              },
            },
            '<<',
          )
        })
      })
    } catch {
      // The page is already readable without the introduction.
    }
    return () => scope?.revert()
  }, [rootRef])
}
