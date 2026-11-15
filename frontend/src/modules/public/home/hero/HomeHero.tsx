import { Component, useState, type ReactNode } from 'react'
import { HeroCopy } from './HeroCopy'
import { jadeStill } from './heroFrames'
import { heroMode } from './heroMode'

// Static hero: the still jade stone above the full title, subtitle and actions.
function StaticHero() {
  return (
    <section data-hero="static" className="bg-card px-4 py-16 md:px-6 md:py-24 lg:px-8">
      <img src={jadeStill} alt="" width={720} height={720} className="mx-auto mb-8 h-auto w-[min(60vw,320px)]" />
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
  const [mode] = useState(heroMode)
  // The sequence arrives in the next task; until then both modes show the static hero.
  return <StaticOnError>{mode === 'sequence' ? <StaticHero /> : <StaticHero />}</StaticOnError>
}
