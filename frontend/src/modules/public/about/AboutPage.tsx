import { Container } from '../../../shared/components/Container'
import { texts } from '../../../shared/texts'

export function AboutPage() {
  return (
    <Container className="py-16 md:py-24">
      <title>{`${texts.about.title} · ${texts.owner.name}`}</title>
      <h1 className="type-h1">{texts.about.title}</h1>
      <p className="mt-8 max-w-[70ch]">{texts.about.body}</p>
    </Container>
  )
}
