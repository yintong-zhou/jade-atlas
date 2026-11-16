import { Component, useEffect, useState, type ReactNode } from 'react'
import { reducedMotionQuery } from '../../../../shared/motion'
import { HeroCopy } from './HeroCopy'
import { heroMode, shortViewportQuery } from './heroMode'
import { HeroSequence } from './HeroSequence'

// Static hero: complete copy on the same white surface as the navigation.
function StaticHero() {
  return (
    <section
      data-hero="static"
      className="-mt-(--header-height) bg-card px-4 pb-16 pt-[calc(var(--header-height)+64px)] md:px-6 md:pb-24 md:pt-[calc(var(--header-height)+96px)] lg:px-8"
    >
      <HeroCopy />
    </section>
  )
}

// Any error while setting up the sequence falls back to the static hero.
class StaticOnError extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? <StaticHero /> : this.props.children
  }
}

export function HomeHero() {
  const [mode, setMode] = useState(heroMode)
  const [failed, setFailed] = useState(false)

  // A phone rotated to landscape, or reduced motion switched on, lands on Static (and back).
  useEffect(() => {
    const queries = [reducedMotionQuery, shortViewportQuery].map((q) => window.matchMedia(q))
    const update = () => setMode(heroMode())
    queries.forEach((q) => q.addEventListener('change', update))
    return () => queries.forEach((q) => q.removeEventListener('change', update))
  }, [])

  return (
    <StaticOnError key={mode}>
      {mode === 'sequence' && !failed ? <HeroSequence onFail={() => setFailed(true)} /> : <StaticHero />}
    </StaticOnError>
  )
}
