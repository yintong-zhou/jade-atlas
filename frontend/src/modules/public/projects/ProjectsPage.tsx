import type { Project } from '../../../shared/api/types'
import { useProjects } from '../../../shared/api/queries'
import { Container } from '../../../shared/components/Container'
import { QueryBoundary } from '../../../shared/components/QueryBoundary'
import { texts } from '../../../shared/texts'
import { ProjectCard } from './ProjectCard'
import { projectGridLayout } from './projectGridLayout'

export function ProjectGrid({ projects, tone = 'muted' }: { projects: Project[]; tone?: 'muted' | 'card' }) {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-6">
      {projects.map((project, index) => {
        const layout = projectGridLayout(projects.length, index)
        return (
          <li
            key={project.slug}
            className={`min-w-0 ${layout.tabletSpan === 2 ? 'sm:col-span-2' : 'sm:col-span-1'} ${layout.desktopSpan === 6 ? 'lg:col-span-6' : layout.desktopSpan === 3 ? 'lg:col-span-3' : 'lg:col-span-2'}`}
          >
            <ProjectCard project={project} tone={tone} horizontal={layout.horizontal} />
          </li>
        )
      })}
    </ul>
  )
}

export function ProjectsPage() {
  return (
    <section className="pt-8 pb-12 sm:pt-14 sm:pb-18">
      <Container>
        <title>{`${texts.projects.title} · ${texts.owner.name}`}</title>
        <h1 className="type-h1 enter mb-12">{texts.projects.title}</h1>
        <QueryBoundary query={useProjects()} emptyText={texts.projects.empty}>
          {(projects) => <ProjectGrid projects={projects} />}
        </QueryBoundary>
      </Container>
    </section>
  )
}
