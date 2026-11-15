import { Container } from '../../../shared/components/Container'
import { texts } from '../../../shared/texts'

export function CvPage() {
  return (
    <Container className="py-16 md:py-24">
      <title>{`${texts.cv.title} · ${texts.owner.name}`}</title>
      <h1 className="type-h1">{texts.cv.title}</h1>
    </Container>
  )
}
