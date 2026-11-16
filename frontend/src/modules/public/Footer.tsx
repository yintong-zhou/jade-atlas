import { ArrowRight } from 'lucide-react'
import { buttonClass } from '../../shared/components/buttonStyles'
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
    <footer id="contact" className="bg-background">
      <Container>
        <div className="section-pad">
          <h2 className="type-h1">{texts.closing.title}</h2>
          <p className="type-body-lg mt-4 text-muted-foreground">{texts.closing.line}</p>
          <a href={`mailto:${site.email}`} className={`${buttonClass('main', 'xl')} mt-12`}>
            {texts.closing.action}
            <ArrowRight aria-hidden="true" size={24} strokeWidth={1.5} className="glass-arrow shrink-0" />
          </a>
        </div>
        <div className="mt-12 flex flex-col gap-6 pb-12 sm:mt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            <h3 className="type-h3">{texts.owner.name}</h3>
            <p className="type-small mt-2 text-muted-foreground">
              {texts.owner.role} · {texts.owner.location}
            </p>
          </div>
          <ul className="flex flex-wrap gap-4">
            {links.map((l) => (
              <li key={l.label}>
                <a href={l.href} className="link inline-flex min-h-11 min-w-11 items-center">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="type-small w-full text-muted-foreground">
            © {new Date().getFullYear()} {texts.owner.name} · {texts.footer.trademarks}
          </p>
        </div>
      </Container>
    </footer>
  )
}
