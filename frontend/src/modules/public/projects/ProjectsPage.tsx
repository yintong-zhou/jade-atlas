import { Container } from '../../../shared/components/Container'
import { texts } from '../../../shared/texts'

export function ProjectsPage() {
  return (
    <Container className="py-16 md:py-24">
      <title>{`${texts.projects.title} · ${texts.owner.name}`}</title>
      <h1 className="type-h1">{texts.projects.title}</h1>
    </Container>
  )
}
