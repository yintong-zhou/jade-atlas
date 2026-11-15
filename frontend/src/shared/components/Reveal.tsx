import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { prefersReducedMotion } from '../motion'

export function Reveal({
  children,
  as = 'div',
  delay = 0,
  distance = 24,
  className,
}: {
  children: ReactNode
  as?: 'section' | 'div' | 'li'
  delay?: number // seconds
  distance?: 24 | 12
  className?: string
}) {
  const Element = motion[as]
  return (
    <Element
      className={className}
      initial={prefersReducedMotion() ? false : { opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1], delay }}
    >
      {children}
    </Element>
  )
}
