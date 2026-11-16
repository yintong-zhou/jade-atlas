import { Link } from 'react-router'
import type { Project } from '../../../shared/api/types'
import { Tag } from '../../../shared/components/Tag'
import { texts } from '../../../shared/texts'

export function ProjectCover({ project, lazy }: { project: Project; lazy: boolean }) {
  if (!project.coverImageUrl)
    return (
      <div
        data-cover
        className="type-label flex aspect-video w-full items-center justify-center bg-foreground/6 p-4 text-center wrap-anywhere text-muted-foreground"
      >
        {project.title}
      </div>
    )
  return (
    <img
      src={project.coverImageUrl}
      alt={texts.projects.coverAlt(project.title)}
      loading={lazy ? 'lazy' : undefined}
      data-cover
      className="aspect-video w-full object-cover"
    />
  )
}

export function TagList({ items }: { items: string[] }) {
  if (!items.length) return null
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((t) => (
        <Tag key={t}>{t}</Tag>
      ))}
    </ul>
  )
}

export function ProjectCard({
  project,
  tone = 'muted',
  horizontal = false,
}: {
  project: Project
  tone?: 'muted' | 'card'
  horizontal?: boolean
}) {
  return (
    <article className="h-full">
      <Link
        to={`/projects/${project.slug}`}
        className={`tile-hover grid h-full min-w-0 content-start rounded-lg p-2 text-card-foreground ${tone === 'card' ? 'bg-card' : 'bg-muted'} ${horizontal ? 'lg:grid-cols-12' : ''}`}
      >
        <div className={`min-w-0 self-start overflow-hidden rounded-md ${horizontal ? 'lg:col-span-7' : ''}`}>
          <ProjectCover project={project} lazy />
        </div>
        <div className={`min-w-0 space-y-4 p-4 ${horizontal ? 'lg:col-span-5' : ''}`}>
          <h3 className="type-h3 wrap-anywhere">{project.title}</h3>
          <p className="type-body max-w-[62ch] text-muted-foreground">{project.summary}</p>
          <TagList items={project.technologies} />
        </div>
      </Link>
    </article>
  )
}
