import { Download } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEducation, useExperiences, useSkills } from '../../../shared/api/queries'
import type { Education } from '../../../shared/api/types'
import { buttonClass } from '../../../shared/components/buttonStyles'
import { Container } from '../../../shared/components/Container'
import { QueryBoundary } from '../../../shared/components/QueryBoundary'
import { Reveal } from '../../../shared/components/Reveal'
import { Tag } from '../../../shared/components/Tag'
import { formatDateRange, groupSkills } from '../../../shared/format'
import { site } from '../../../shared/site'
import { texts } from '../../../shared/texts'

export function CvDownloadLink({ url }: { url: string | null }) {
  if (!url) return null
  return (
    <a href={url} download className={buttonClass('secondary')}>
      <Download size={20} aria-hidden="true" />
      {texts.cv.download}
    </a>
  )
}

function CvSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Reveal as="section" className="mt-16 md:mt-24">
      <h2 className="type-h2 mb-8">{title}</h2>
      {children}
    </Reveal>
  )
}

function EducationGroup({ title, entries }: { title: string; entries: Education[] }) {
  if (!entries.length) return null
  return (
    <div>
      <h3 className="type-h3 mb-4">{title}</h3>
      <ul className="flex flex-col gap-4">
        {entries.map((e) => (
          <li key={e.id}>
            <p className="type-label tabular-nums text-muted-foreground">{e.year}</p>
            <p className="font-medium">{e.title}</p>
            <p className="text-muted-foreground">{e.institution}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function CvPage() {
  return (
    <Container className="py-16 md:py-24">
      <title>{`${texts.cv.title} · ${texts.owner.name}`}</title>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="type-h1">{texts.cv.title}</h1>
        <CvDownloadLink url={site.cvPdfUrl} />
      </div>
      <CvSections />
    </Container>
  )
}

// Experience, skills, education and certifications: shown on the CV page and on About.
export function CvSections() {
  return (
    <>
      <CvSection title={texts.cv.experience}>
        <QueryBoundary query={useExperiences()} emptyText={texts.cv.empty}>
          {(experiences) => (
            <ol className="border-l border-border">
              {experiences.map((e) => (
                <li
                  key={e.id}
                  className="flex flex-col gap-1 pb-8 pl-6 last:pb-0 md:grid md:grid-cols-[12rem_1fr] md:gap-6"
                >
                  <p className="type-label pt-1 tabular-nums text-muted-foreground">
                    {formatDateRange(e.startDate, e.endDate)}
                  </p>
                  <div>
                    <h3 className="type-h3">{e.role}</h3>
                    <p className="text-muted-foreground">{e.location ? `${e.company} · ${e.location}` : e.company}</p>
                    <p className="mt-2 max-w-[70ch] whitespace-pre-line">{e.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </QueryBoundary>
      </CvSection>

      <CvSection title={texts.cv.skills}>
        <QueryBoundary query={useSkills()} emptyText={texts.cv.empty}>
          {(skills) => (
            <div className="flex flex-col gap-6">
              {groupSkills(skills).map((g) => (
                <div key={g.category}>
                  <h3 className="type-h3 mb-3">{g.category}</h3>
                  <ul className="flex flex-wrap gap-2">
                    {g.names.map((n) => (
                      <Tag key={n}>{n}</Tag>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </QueryBoundary>
      </CvSection>

      <CvSection title={texts.cv.education}>
        <QueryBoundary query={useEducation()} emptyText={texts.cv.empty}>
          {(entries) => (
            <div className="flex flex-col gap-8 md:flex-row md:gap-24">
              <EducationGroup title={texts.cv.education} entries={entries.filter((e) => e.type === 'education')} />
              <EducationGroup
                title={texts.cv.certifications}
                entries={entries.filter((e) => e.type === 'certification')}
              />
            </div>
          )}
        </QueryBoundary>
      </CvSection>
    </>
  )
}
