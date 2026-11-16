import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { useProject } from '../../../shared/api/queries'
import { Container } from '../../../shared/components/Container'
import { buttonClass } from '../../../shared/components/buttonStyles'
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
      <Container className="pt-8 pb-12 sm:pt-14 sm:pb-18">
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
    <Container className="pt-8 pb-12 sm:pt-14 sm:pb-18">
      <title>{`${project.title} · ${texts.owner.name}`}</title>
      <Link to="/projects" className="link inline-flex min-h-11 items-center gap-2">
        <ArrowLeft size={20} strokeWidth={1.5} aria-hidden="true" />
        {texts.projects.back}
      </Link>
      <div className="mt-6 grid gap-3 lg:grid-cols-12 lg:gap-6">
        <h1 className="type-h1 enter wrap-anywhere lg:col-span-9">{project.title}</h1>
      </div>
      {/* A 16:9 cover as wide as the container would fill the whole screen: cap it and crop from the centre. */}
      <div className="mt-12 flex max-h-[70svh] items-center overflow-hidden rounded-lg">
        <ProjectCover project={project} lazy={false} />
      </div>
      <div className="mt-12 grid gap-6 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-4">
          <TagList items={project.technologies} />
          {links.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-4">
              {links.map((l) => (
                <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className={buttonClass('secondary')}>
                  {l.label}
                  <ArrowUpRight size={20} strokeWidth={1.5} aria-hidden="true" />
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="min-w-0 lg:col-span-8">
          <p className="type-body-lg max-w-[62ch]">{project.summary}</p>
          <p className="type-body mt-6 max-w-[62ch] whitespace-pre-line">{project.description}</p>
        </div>
      </div>
    </Container>
  )
}
