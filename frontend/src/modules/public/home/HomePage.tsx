import { useRef } from 'react'
import { useProjects } from '../../../shared/api/queries'
import { ButtonLink } from '../../../shared/components/ButtonLink'
import { Container } from '../../../shared/components/Container'
import { texts } from '../../../shared/texts'
import { ProjectGrid } from '../projects/ProjectsPage'
import { HomeHero } from './hero/HomeHero'
import { StackDiagram } from './StackDiagram'
import { useCountUp } from './useCountUp'

export function HomePage() {
  const projects = useProjects().data ?? []
  const numbersRef = useRef<HTMLDivElement>(null)
  useCountUp(numbersRef)

  return (
    <>
      <title>{`${texts.owner.name} · ${texts.owner.role}`}</title>
      <HomeHero />
      <section className="section-pad min-h-svh bg-background">
        <Container>
          <h2 className="type-h2">{texts.home.stackTitle}</h2>
          <div className="mt-12">
            <StackDiagram />
          </div>
          <div ref={numbersRef} className="mt-18 grid grid-cols-1 gap-6 sm:grid-cols-12">
            {texts.home.numbers.map((n) => (
              <div key={n.label} className="min-w-0 sm:col-span-4">
                <p className="type-figure tabular-nums">
                  <span data-count-to={n.value}>{n.value}</span>
                  {n.suffix && <span>{n.suffix}</span>}
                </p>
                <p className="type-body mt-2 text-muted-foreground">{n.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {projects.length > 0 && (
        <section className="section-pad min-h-svh bg-muted">
          <Container>
            <h2 className="type-h2 mb-12">{texts.home.previewTitle}</h2>
            <ProjectGrid projects={projects.slice(0, 3)} tone="card" />
            <ButtonLink to="/projects" variant="secondary" className="mt-12">
              {texts.home.previewAll}
            </ButtonLink>
          </Container>
        </section>
      )}
    </>
  )
}
