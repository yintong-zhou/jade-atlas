import { Link } from 'react-router'
import type { Project } from '../../../shared/api/types'
import { Tag } from '../../../shared/components/Tag'
import { texts } from '../../../shared/texts'

export function ProjectCover({ project, lazy }: { project: Project; lazy: boolean }) {
  if (!project.coverImageUrl)
    return (
      <div className="type-label flex aspect-video items-center justify-center rounded-lg bg-muted p-4 text-center wrap-anywhere text-muted-foreground">
        {project.title}
      </div>
    )
  return (
    <img
      src={project.coverImageUrl}
      alt={texts.projects.coverAlt(project.title)}
      loading={lazy ? 'lazy' : undefined}
      className="aspect-video w-full rounded-lg border border-border object-cover"
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

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="h-full">
      <Link
        to={`/projects/${project.slug}`}
        className="flex h-full flex-col gap-4 rounded-lg border border-border bg-card p-4 text-card-foreground transition-[border-color] duration-(--motion-fast) hover:border-foreground"
      >
        <ProjectCover project={project} lazy />
        <h3 className="type-h3 wrap-anywhere">{project.title}</h3>
        <p className="text-muted-foreground">{project.summary}</p>
        <TagList items={project.technologies} />
      </Link>
    </article>
  )
}
