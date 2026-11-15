import { animate, createScope, type Scope } from 'animejs'
import { useEffect, type RefObject } from 'react'
import { prefersReducedMotion } from '../../../shared/motion'

// Counts each [data-count-to] up from 0 the first time the root enters the viewport (AnimeJS).
// The exact values are in the markup, so the numbers are right without the animation.
export function useCountUp(rootRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const root = rootRef.current
    if (prefersReducedMotion() || !root) return
    let scope: Scope | undefined
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return
      observer.disconnect()
      if (prefersReducedMotion()) return // switched on after the page opened
      try {
        scope = createScope({ root: rootRef }).add(() => {
          root.querySelectorAll<HTMLElement>('[data-count-to]').forEach((el) => {
            const target = el.dataset.countTo ?? ''
            const counter = { value: 0 }
            animate(counter, {
              value: Number(target),
              duration: 800,
              ease: 'outExpo',
              onUpdate: () => {
                el.textContent = String(Math.round(counter.value))
              },
              onComplete: () => {
                el.textContent = target
              },
            })
          })
        })
      } catch {
        // The exact values are already shown.
      }
    })
    observer.observe(root)
    return () => {
      observer.disconnect()
      scope?.revert()
    }
  }, [rootRef])
}
