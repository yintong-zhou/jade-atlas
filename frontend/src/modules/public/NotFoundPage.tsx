import { ButtonLink } from '../../shared/components/ButtonLink'
import { Container } from '../../shared/components/Container'
import { texts } from '../../shared/texts'

export function NotFoundPage() {
  return (
    <Container className="pt-8 pb-12 sm:pt-14 sm:pb-18">
      <title>{`${texts.notFound.title} · ${texts.owner.name}`}</title>
      <h1 className="type-h1 enter">{texts.notFound.title}</h1>
      <ButtonLink to="/" variant="secondary" className="mt-8">
        {texts.notFound.back}
      </ButtonLink>
    </Container>
  )
}
