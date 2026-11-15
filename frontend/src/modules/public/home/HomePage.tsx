import { Container } from '../../../shared/components/Container'
import { texts } from '../../../shared/texts'

export function HomePage() {
  return (
    <Container className="py-16 md:py-24">
      <title>{`${texts.owner.name} · ${texts.owner.role}`}</title>
      <h1 className="type-h1">{texts.home.title}</h1>
    </Container>
  )
}
