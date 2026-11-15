import { useRef } from 'react'
import { Link } from 'react-router'
import { useProjects } from '../../../shared/api/queries'
import { Container } from '../../../shared/components/Container'
import { Reveal } from '../../../shared/components/Reveal'
import { site } from '../../../shared/site'
import { texts } from '../../../shared/texts'
import { ProjectGrid } from '../projects/ProjectsPage'
import { HomeHero } from './hero/HomeHero'
import { useCountUp } from './useCountUp'

export function HomePage() {
  const projects = useProjects().data ?? []
  const numbersRef = useRef<HTMLDivElement>(null)
  useCountUp(numbersRef)

  return (
    <>
      <title>{`${texts.owner.name} · ${texts.owner.role}`}</title>
      <HomeHero />
      <Container>
        <Reveal as="section" className="py-16 md:py-24">
          <div ref={numbersRef} className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
            {texts.home.numbers.map((n) => (
              <div key={n.label}>
                <p className="type-display font-mono tabular-nums">
                  <span data-count-to={n.value}>{n.value}</span>
                  {n.suffix && <span>{n.suffix}</span>}
                </p>
                <p className="type-small mt-2 text-muted-foreground">{n.label}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {projects.length > 0 && (
          <Reveal as="section" className="py-16 md:py-24">
            <h2 className="type-h2 mb-8">{texts.home.previewTitle}</h2>
            <ProjectGrid projects={projects.slice(0, 3)} />
            <Link to="/projects" className="link mt-8 inline-flex min-h-11 items-center">
              {texts.home.previewAll}
            </Link>
          </Reveal>
        )}

        <Reveal as="section" className="py-16 md:py-24">
          <h2 className="type-h2 mb-4">{texts.home.contactTitle}</h2>
          <a
            href={`mailto:${site.email}`}
            className="link type-body-lg inline-flex min-h-11 items-center wrap-anywhere"
          >
            {site.email}
          </a>
        </Reveal>
      </Container>
    </>
  )
}
