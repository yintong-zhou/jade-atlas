import { Outlet, ScrollRestoration } from 'react-router'
import { texts } from '../../shared/texts'
import { Footer } from './Footer'
import { Header } from './Header'

export function PublicLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:inline-flex focus:min-h-11 focus:items-center focus:rounded-md focus:bg-card focus:px-4"
      >
        {texts.nav.skip}
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  )
}
