import type { Project } from '../../../shared/api/types'
import { useProjects } from '../../../shared/api/queries'
import { Container } from '../../../shared/components/Container'
import { QueryBoundary } from '../../../shared/components/QueryBoundary'
import { Reveal } from '../../../shared/components/Reveal'
import { texts } from '../../../shared/texts'
import { ProjectCard } from './ProjectCard'

export function ProjectGrid({ projects }: { projects: Project[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
      {projects.map((p, index) => (
        <Reveal as="li" key={p.slug} distance={12} delay={Math.min(index, 7) * 0.04}>
          <ProjectCard project={p} />
        </Reveal>
      ))}
    </ul>
  )
}

export function ProjectsPage() {
  return (
    <Container className="py-16 md:py-24">
      <title>{`${texts.projects.title} · ${texts.owner.name}`}</title>
      <h1 className="type-h1 mb-12">{texts.projects.title}</h1>
      <QueryBoundary query={useProjects()} emptyText={texts.projects.empty}>
        {(projects) => <ProjectGrid projects={projects} />}
      </QueryBoundary>
    </Container>
  )
}
