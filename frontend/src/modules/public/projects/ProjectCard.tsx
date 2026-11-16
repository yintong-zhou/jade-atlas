import { ArrowUpRight } from 'lucide-react'
import type { Project } from '../../../shared/api/types'
import { Tag } from '../../../shared/components/Tag'
import { texts } from '../../../shared/texts'

// Both the logo and the title fallback are decorative: the card's heading already names the project.
function ProjectLogo({ project }: { project: Project }) {
  return (
    <div
      data-cover
      className="type-label flex aspect-video w-full items-center justify-center bg-foreground/6 p-4 text-center wrap-anywhere text-muted-foreground"
    >
      {project.logoUrl ? (
        <img src={project.logoUrl} alt="" loading="lazy" decoding="async" className="h-20 max-w-[60%] object-contain" />
      ) : (
        <span aria-hidden="true">{project.title}</span>
      )}
    </div>
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
  // Cards always open the repository; without one, show a plain tile.
  const href = project.repoUrl
  const className = `grid h-full min-w-0 content-start rounded-lg p-2 text-card-foreground ${tone === 'card' ? 'bg-card' : 'bg-muted'} ${horizontal ? 'lg:grid-cols-12' : ''}`
  const content = (
    <>
      <div className={`min-w-0 self-start overflow-hidden rounded-md ${horizontal ? 'lg:col-span-7' : ''}`}>
        <ProjectLogo project={project} />
      </div>
      <div className={`min-w-0 space-y-4 p-4 ${horizontal ? 'lg:col-span-5' : ''}`}>
        <div className="flex items-start justify-between gap-3">
          <h3 className="type-h3 wrap-anywhere">{project.title}</h3>
          {href && <ArrowUpRight size={20} strokeWidth={1.5} aria-hidden="true" className="mt-1 shrink-0 text-muted-foreground" />}
          {href && <span className="sr-only">{texts.projects.newTab}</span>}
        </div>
        {project.summary && <p className="type-body max-w-[62ch] text-muted-foreground">{project.summary}</p>}
        {project.technologies.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {project.technologies.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </ul>
        )}
      </div>
    </>
  )

  return (
    <article className="h-full">
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" className={`tile-hover ${className}`}>
          {content}
        </a>
      ) : (
        <div className={className}>{content}</div>
      )}
    </article>
  )
}
