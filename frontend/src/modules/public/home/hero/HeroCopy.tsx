import { motion, type MotionStyle } from 'motion/react'
import type { Ref } from 'react'
import { ButtonLink } from '../../../../shared/components/ButtonLink'
import { texts } from '../../../../shared/texts'

const name = `${texts.owner.name}.`
if (!texts.home.title.startsWith(name)) throw new Error('texts.home.title must start with the owner name')
const rest = texts.home.title.slice(name.length).trimStart()

// Title (owner name highlighted + rest), subtitle and the two actions. The h1 text is exactly texts.home.title.
export function HeroCopy({
  nameRef,
  styles = {},
}: {
  nameRef?: Ref<HTMLSpanElement>
  styles?: { name?: MotionStyle; rest?: MotionStyle; subtitle?: MotionStyle; actions?: MotionStyle }
}) {
  return (
    <div className="mx-auto max-w-[70ch] text-center">
      <h1 className="type-display">
        <motion.span ref={nameRef} className="block whitespace-nowrap text-accent" style={styles.name}>
          {name}
        </motion.span>{' '}
        <motion.span className="block" style={styles.rest}>
          {rest}
        </motion.span>
      </h1>
      <motion.p className="type-body-lg mt-6 text-muted-foreground" style={styles.subtitle}>
        {texts.home.subtitle}
      </motion.p>
      <motion.div className="mt-8 flex flex-wrap justify-center gap-4" style={styles.actions}>
        <ButtonLink to="/projects" variant="main">
          {texts.home.seeProjects}
        </ButtonLink>
        <ButtonLink to="/cv" variant="secondary">
          {texts.home.readCv}
        </ButtonLink>
      </motion.div>
    </div>
  )
}
