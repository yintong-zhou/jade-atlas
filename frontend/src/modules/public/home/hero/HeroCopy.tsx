import { ArrowRight, FileText } from 'lucide-react'
import { motion, type MotionStyle } from 'motion/react'
import { ButtonLink } from '../../../../shared/components/ButtonLink'
import { texts } from '../../../../shared/texts'

// .NET is the point of the title: it gets the jade glass chip.
const [lead, tail] = texts.home.title.split('.NET')

// What the owner does: title, subtitle and the two actions. Who the owner is lives on the About page.
export function HeroCopy({
  styles = {},
}: {
  styles?: { title?: MotionStyle; subtitle?: MotionStyle; actions?: MotionStyle }
}) {
  return (
    <div className="mx-auto max-w-[1280px] text-center">
      <motion.h1 className="type-display mx-auto max-w-[24ch] text-balance" style={styles.title}>
        {lead}
        <span className="hero-net">.NET</span>
        {tail}
      </motion.h1>
      <motion.p className="type-body-lg mx-auto mt-6 max-w-[62ch] text-muted-foreground" style={styles.subtitle}>
        {texts.home.subtitle}
      </motion.p>
      <motion.div className="mt-8 flex flex-wrap justify-center gap-4" style={styles.actions}>
        <ButtonLink to="/projects" variant="main">
          {texts.home.seeProjects}
          <ArrowRight aria-hidden="true" size={20} strokeWidth={1.75} className="glass-arrow" />
        </ButtonLink>
        <ButtonLink to="/about#experience" variant="secondary">
          <FileText aria-hidden="true" size={20} strokeWidth={1.5} />
          {texts.home.readCv}
        </ButtonLink>
      </motion.div>
    </div>
  )
}
