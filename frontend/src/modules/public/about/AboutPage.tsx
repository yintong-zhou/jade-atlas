import type { CSSProperties } from 'react'
import { useEducation, useExperiences, useSkills } from '../../../shared/api/queries'
import { Container } from '../../../shared/components/Container'
import { QueryBoundary } from '../../../shared/components/QueryBoundary'
import { Tag } from '../../../shared/components/Tag'
import { formatDateRange, groupSkills } from '../../../shared/format'
import { site } from '../../../shared/site'
import { texts } from '../../../shared/texts'
import { CvDownloadLink } from './CvDownloadLink'

// The same two text lines serve every career row.
const row = 'grid gap-4 border-b border-border py-8 lg:grid-cols-12 lg:gap-6'

export function AboutPage() {
  const experiences = useExperiences()
  const skills = useSkills()
  const education = useEducation()
  return (
    <>
      <title>{`${texts.about.title} · ${texts.owner.name}`}</title>
      <section className="min-h-[calc(100svh-var(--header-height))] pt-8 pb-12 sm:pt-14 sm:pb-18">
        <Container>
          <div className="grid gap-3 lg:grid-cols-12 lg:gap-6">
            <h1 className="type-h1 enter lg:col-span-9">{texts.about.heading}</h1>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-12">
            <div className="enter lg:col-span-4" style={{ '--enter-i': 2 } as CSSProperties}>
              <CvDownloadLink url={site.cvPdfUrl} />
            </div>
            <div className="enter space-y-6 lg:col-span-8" style={{ '--enter-i': 1 } as CSSProperties}>
              {texts.about.paragraphs.map((paragraph, index) => (
                <p key={paragraph} className={`max-w-[62ch] ${index === 0 ? 'type-body-lg' : 'type-body'}`}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </Container>
      </section>
      <section id="experience" className="section-pad scroll-mt-(--header-height)">
        <Container>
          <h2 className="type-h2">{texts.cv.experience}</h2>
          <div className="mt-12">
            <QueryBoundary query={experiences} emptyText={texts.cv.empty}>
              {(entries) => (
                <ol>
                  {entries.map((entry) => (
                    <li key={entry.id} className={row}>
                      <div className="lg:col-span-4">
                        <p className="type-label tabular-nums text-muted-foreground">
                          {formatDateRange(entry.startDate, entry.endDate)}
                        </p>
                        <p className="type-small mt-2 text-muted-foreground">
                          {entry.location ? `${entry.company} · ${entry.location}` : entry.company}
                        </p>
                      </div>
                      <div className="lg:col-span-8">
                        <h3 className="type-h3">{entry.role}</h3>
                        <p className="type-body mt-4 max-w-[62ch] whitespace-pre-line">{entry.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </QueryBoundary>
          </div>
        </Container>
      </section>
      <div className="bg-muted">
        <section id="skills" className="section-pad">
          <Container>
            <h2 className="type-h2">{texts.cv.skills}</h2>
            <div className="mt-12">
              <QueryBoundary query={skills} emptyText={texts.cv.empty}>
                {(entries) => (
                  <ul>
                    {groupSkills(entries).map((group) => (
                      <li key={group.category} className={row}>
                        <h3 className="type-h3 lg:col-span-4">{group.category}</h3>
                        <ul className="flex flex-wrap gap-2 lg:col-span-8">
                          {group.names.map((name) => (
                            <Tag key={name}>{name}</Tag>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                )}
              </QueryBoundary>
            </div>
          </Container>
        </section>
        <section id="education" className="section-pad">
          <Container>
            <h2 className="type-h2">{texts.cv.educationAndCertifications}</h2>
            <div className="mt-12">
              <QueryBoundary query={education} emptyText={texts.cv.empty}>
                {(entries) => (
                  <ul>
                    {(['education', 'certification'] as const).flatMap((type) =>
                      entries
                        .filter((entry) => entry.type === type)
                        .map((entry) => (
                          <li key={entry.id} className={row}>
                            <div className="lg:col-span-4">
                              <p className="type-label tabular-nums text-muted-foreground">{entry.year}</p>
                              <p className="type-small mt-2 text-muted-foreground">
                                {type === 'education' ? texts.cv.education : texts.cv.certifications}
                              </p>
                            </div>
                            <div className="lg:col-span-8">
                              <h3 className="type-h3">{entry.title}</h3>
                              <p className="type-body mt-4 max-w-[62ch] text-muted-foreground">{entry.institution}</p>
                            </div>
                          </li>
                        )),
                    )}
                  </ul>
                )}
              </QueryBoundary>
            </div>
          </Container>
        </section>
      </div>
    </>
  )
}
