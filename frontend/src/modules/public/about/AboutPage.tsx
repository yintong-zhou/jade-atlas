import { FileText } from 'lucide-react'
import { ButtonLink } from '../../../shared/components/ButtonLink'
import { Container } from '../../../shared/components/Container'
import { texts } from '../../../shared/texts'
import { CvSections } from '../cv/CvPage'

// Who the owner is, then the career: the full CV page (with the PDF) is one click away.
export function AboutPage() {
  return (
    <Container className="py-16 md:py-24">
      <title>{`${texts.about.title} · ${texts.owner.name}`}</title>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="type-h1">{texts.about.title}</h1>
        <ButtonLink to="/cv" variant="secondary">
          <FileText size={20} strokeWidth={1.5} aria-hidden="true" />
          {texts.about.cvLink}
        </ButtonLink>
      </div>
      <p className="mt-8 max-w-[70ch]">{texts.about.body}</p>
      <CvSections />
    </Container>
  )
}
