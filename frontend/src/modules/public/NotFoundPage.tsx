import { ButtonLink } from '../../shared/components/ButtonLink'
import { Container } from '../../shared/components/Container'
import { texts } from '../../shared/texts'

export function NotFoundPage() {
  return (
    <Container className="py-16 md:py-24">
      <title>{`${texts.notFound.title} · ${texts.owner.name}`}</title>
      <h1 className="type-h1">{texts.notFound.title}</h1>
      <ButtonLink to="/" variant="secondary" className="mt-8">
        {texts.notFound.back}
      </ButtonLink>
    </Container>
  )
}
