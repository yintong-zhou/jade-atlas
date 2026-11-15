import { Link, useParams } from 'react-router'
import { useProject } from '../../../shared/api/queries'
import { Container } from '../../../shared/components/Container'
import { LoadError } from '../../../shared/components/QueryBoundary'
import { texts } from '../../../shared/texts'
import { NotFoundPage } from '../NotFoundPage'
import { ProjectCover, TagList } from './ProjectCard'

export function ProjectPage() {
  const { slug = '' } = useParams()
  const query = useProject(slug)

  if (query.isPending) return null
  if (query.isError)
    return (
      <Container className="py-16 md:py-24">
        <LoadError />
      </Container>
    )
  const project = query.data
  if (!project) return <NotFoundPage />

  const links = [
    { href: project.repoUrl, label: texts.projects.repo },
    { href: project.siteUrl, label: texts.projects.site },
  ].flatMap(({ href, label }) => (href ? [{ href, label }] : []))

  return (
    <Container className="py-16 md:py-24">
      <title>{`${project.title} · ${texts.owner.name}`}</title>
      <Link to="/projects" className="link inline-flex min-h-11 items-center">
        {texts.projects.back}
      </Link>
      <h1 className="type-h1 mt-6 wrap-anywhere">{project.title}</h1>
      <p className="type-body-lg mt-4 max-w-[70ch] text-muted-foreground">{project.summary}</p>
      <div className="mt-8 max-w-[960px]">
        <ProjectCover project={project} lazy={false} />
      </div>
      <p className="mt-8 max-w-[70ch] whitespace-pre-line">{project.description}</p>
      <div className="mt-6">
        <TagList items={project.technologies} />
      </div>
      {links.length > 0 && (
        <p className="mt-6 flex flex-wrap gap-6">
          {links.map((l) => (
            <a key={l.label} href={l.href} className="link inline-flex min-h-11 items-center wrap-anywhere">
              {l.label}
            </a>
          ))}
        </p>
      )}
    </Container>
  )
}
