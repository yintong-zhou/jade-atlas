import { Link, NavLink } from 'react-router'
import { Container } from '../../shared/components/Container'
import { texts } from '../../shared/texts'

const links = [
  { to: '/projects', label: texts.nav.projects },
  { to: '/cv', label: texts.nav.cv },
  { to: '/about', label: texts.nav.about },
]

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex min-h-11 items-center px-2 underline-offset-2 transition-[color] duration-(--motion-fast) ${
    isActive ? 'text-accent underline' : 'hover:underline'
  }`

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <Container className="flex items-center justify-between gap-4">
        <Link to="/" className="inline-flex min-h-11 items-center gap-2 font-semibold">
          <span aria-hidden="true" className="size-6 shrink-0 rounded-full bg-primary" />
          {texts.owner.name}
        </Link>
        <nav>
          <ul className="flex gap-1 md:gap-4">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} className={navLinkClass}>
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </header>
  )
}
