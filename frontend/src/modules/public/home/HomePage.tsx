import { useRef } from 'react'
import { Link } from 'react-router'
import { useProjects } from '../../../shared/api/queries'
import { ButtonLink } from '../../../shared/components/ButtonLink'
import { Container } from '../../../shared/components/Container'
import { Reveal } from '../../../shared/components/Reveal'
import { site } from '../../../shared/site'
import { texts } from '../../../shared/texts'
import { ProjectGrid } from '../projects/ProjectsPage'
import { useHomeIntro } from './useHomeIntro'

export function HomePage() {
  const projects = useProjects().data ?? []
  const introRef = useRef<HTMLElement>(null)
  useHomeIntro(introRef)

  return (
    <Container>
      <title>{`${texts.owner.name} · ${texts.owner.role}`}</title>

      <section ref={introRef} data-intro className="py-16 md:py-24">
        <h1 className="intro-title type-display max-w-[20ch]">{texts.home.title}</h1>
        <p className="intro-subtitle type-body-lg mt-6 max-w-[70ch] text-muted-foreground">{texts.home.subtitle}</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <ButtonLink to="/projects" variant="main" className="intro-action">
            {texts.home.seeProjects}
          </ButtonLink>
          <ButtonLink to="/cv" variant="secondary" className="intro-action">
            {texts.home.readCv}
          </ButtonLink>
        </div>
        <div className="intro-numbers mt-16 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
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
      </section>

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
        <a href={`mailto:${site.email}`} className="link type-body-lg inline-flex min-h-11 items-center wrap-anywhere">
          {site.email}
        </a>
      </Reveal>
    </Container>
  )
}
