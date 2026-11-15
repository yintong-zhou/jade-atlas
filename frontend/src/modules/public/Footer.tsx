import { Container } from '../../shared/components/Container'
import { site } from '../../shared/site'
import { texts } from '../../shared/texts'

const links = [
  { href: site.githubUrl, label: texts.footer.github },
  { href: site.linkedinUrl, label: texts.footer.linkedin },
  { href: `mailto:${site.email}`, label: texts.footer.email },
]

export function Footer() {
  return (
    <footer className="border-t border-border">
      <Container className="flex flex-col gap-4 py-8 md:flex-row md:items-center md:justify-between">
        <p className="type-small text-muted-foreground">
          {[texts.owner.name, texts.owner.role, texts.owner.location].join(' · ')}
        </p>
        <ul className="flex gap-4">
          {links.map((l) => (
            <li key={l.label}>
              <a href={l.href} className="link inline-flex min-h-11 items-center">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </footer>
  )
}
