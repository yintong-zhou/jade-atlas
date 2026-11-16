import type { CSSProperties } from 'react'
import { useExperiences } from '../../../shared/api/queries'
import { Container } from '../../../shared/components/Container'
import { QueryBoundary } from '../../../shared/components/QueryBoundary'
import { Tag } from '../../../shared/components/Tag'
import { formatDateRange } from '../../../shared/format'
import { texts } from '../../../shared/texts'
import { CvPreview } from './CvPreview'

// Rows already on screen when data arrives should start at rest.
function settleVisibleRow(node: HTMLLIElement | null) {
  if (!node) return
  const initialScroll = window.scrollY
  const settle = () => {
    if (node.isConnected && window.scrollY === initialScroll && node.getBoundingClientRect().top < window.innerHeight) {
      node.dataset.scrollSettled = 'true'
    }
  }
  settle()
  // Font loading can bring another row above the fold without a scroll.
  void document.fonts?.ready.then(settle)
}

export function AboutPage() {
  const experiences = useExperiences()
  return (
    <>
      <title>{`${texts.about.title} · ${texts.owner.name}`}</title>
      <section className="section-pad">
        <Container>
          <div className="grid gap-3 lg:grid-cols-12 lg:gap-6">
            <h1 className="type-h1 enter lg:col-span-9">{texts.about.heading}</h1>
            <div
              className="enter mt-3 lg:col-span-3 lg:mt-0 lg:self-end lg:justify-self-end"
              style={{ '--enter-i': 1 } as CSSProperties}
            >
              <CvPreview />
            </div>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-12">
            <div
              className="enter space-y-6 lg:col-span-8 lg:col-start-5 lg:row-start-1"
              style={{ '--enter-i': 1 } as CSSProperties}
            >
              {texts.about.paragraphs.map((paragraph, index) => (
                <p key={paragraph} className={`max-w-[62ch] ${index === 0 ? 'type-body-lg' : 'type-body'}`}>
                  {index === 2 ? (
                    <>
                      {paragraph.split('ICPN')[0]}
                      <a className="link" href="https://icpn.it/">
                        ICPN
                      </a>
                      {paragraph.split('ICPN')[1]}
                    </>
                  ) : (
                    paragraph
                  )}
                </p>
              ))}
            </div>
            <div
              className="enter space-y-6 lg:col-span-4 lg:col-start-1 lg:row-start-1"
              style={{ '--enter-i': 2 } as CSSProperties}
            >
              <dl className="space-y-6">
                <div>
                  <dt className="type-small text-muted-foreground">{texts.about.facts.basedInLabel}</dt>
                  <dd className="type-body mt-2">{texts.about.facts.basedIn}</dd>
                </div>
              </dl>
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
                <ol className="career-log">
                  {entries.map((entry) => {
                    const lines = entry.description.split('\n')
                    return (
                      <li key={entry.id} ref={settleVisibleRow} className="career-entry">
                        <span className="career-node" aria-hidden="true" />
                        <div className="career-date">
                          <div className="career-date-tag">
                            <p className="type-label tabular-nums text-muted-foreground">
                              {formatDateRange(entry.startDate, entry.endDate)}
                            </p>
                            {entry.endDate === null && (
                              <p className="type-label mt-2 text-accent">{texts.cv.current}</p>
                            )}
                          </div>
                        </div>
                        <div className="career-content min-w-0">
                          <h3 className="type-h3">{entry.role}</h3>
                          <p className="type-small mt-2 text-muted-foreground">
                            {entry.location ? `${entry.company} · ${entry.location}` : entry.company}
                          </p>
                          <ul className="career-changes type-body mt-6 max-w-[62ch] space-y-3">
                            {lines.map((line, index) => (
                              <li key={index}>
                                {line.includes('icpn.it') ? (
                                  <>
                                    {line.split('icpn.it')[0]}
                                    <a className="link" href="https://icpn.it/">
                                      icpn.it
                                    </a>
                                    {line.split('icpn.it')[1]}
                                  </>
                                ) : (
                                  line
                                )}
                              </li>
                            ))}
                          </ul>
                          {entry.skills && entry.skills.length > 0 && (
                            <ul aria-label={texts.cv.skills} className="mt-5 flex flex-wrap gap-2">
                              {entry.skills.map((skill) => (
                                <Tag key={skill}>{skill}</Tag>
                              ))}
                            </ul>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ol>
              )}
            </QueryBoundary>
          </div>
        </Container>
      </section>
    </>
  )
}
