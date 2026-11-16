import { Link, NavLink } from 'react-router'
import { texts } from '../../shared/texts'
import styles from './Header.module.css'

const links = [
  { to: '/projects', label: texts.nav.projects },
  { to: '/about', label: texts.nav.about },
]

const navLinkClass = `${styles.navLink} inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-3`

export function Header() {
  return (
    <header className="pointer-events-none sticky top-0 z-40 flex h-(--header-height) shrink-0 items-center justify-center">
      <div
        className={`${styles.island} pointer-events-auto flex max-w-[calc(100%-24px)] items-center rounded-full py-1 text-card-foreground`}
      >
        <Link to="/" className="inline-flex min-h-11 min-w-11 items-center rounded-full px-2 font-semibold">
          <span className="truncate">{texts.owner.name}</span>
        </Link>
        <nav className="shrink-0">
          <ul className="flex w-max md:gap-2">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} className={navLinkClass}>
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
