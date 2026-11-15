# Public Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete public side of the site (Home, Projects, project detail, CV, About, header, footer) in `frontend/`, running locally with no backend.

**Architecture:** A React SPA with a data router. Pages read content through TanStack Query hooks that call a single `publicApi` object; today that object returns sample data in development and empty lists in a production build, later it will call `/api/public/*` without any page changing. All fixed copy lives in `src/shared/texts.ts`, all colours, type and spacing come from Tailwind theme tokens defined once in `src/index.css`.

**Tech Stack:** React 19, Vite 8, TypeScript 6, Tailwind CSS 4.3, React Router 8.5, TanStack Query 5, Motion 14 (`motion/react`), AnimeJS 4.5, Lucide, Vitest 5 + Testing Library + jsdom. All already installed; add no dependency.

**Spec:** `PROJECT.md` (scope, data, conventions), `brand-guidelines.md` (visual rules, motion), `PROFILE.md` (copy and public personal data), `AGENTS.md` (how to work). Read all four before starting.

**Decisions taken with the owner for this plan (they override the phase order in `PROJECT.md`):**

- Frontend first, backend later. No API call, no admin area, no login, no deploy in this plan.
- Projects and CV show sample data only in development. A production build contains no sample data and shows the empty state.
- GitHub link is `https://github.com/yintong-zhou`.
- The CV PDF comes later: the download link exists in code but renders only when a URL is configured.
- TypeScript types are hand-written in `src/shared/api/types.ts` and will be replaced by types generated from OpenAPI when the API exists.

## Global Constraints

- Run npm commands from `frontend/`, git commands from the repository root. Work on branch `feat/public-frontend`, never on `main`.
- Code, identifiers, commit messages and site copy are in English. Sentence case in headings and buttons.
- The string `jade-atlas` never appears in anything rendered or in `dist/`.
- Personal data and copy come only from `PROFILE.md`, verbatim. Never invent a personal detail. Every sample-data string starts with `Sample`.
- No fixed interface text inside components: every string comes from `src/shared/texts.ts`.
- Components use only theme tokens: no raw hex colour, no Tailwind default palette, no shadows, no gradients.
- Spacing uses only Tailwind steps 1, 2, 3, 4, 6, 8, 12, 16, 24 (4, 8, 12, 16, 24, 32, 48, 64, 96px).
- Radius: `rounded-sm` (4px) tags, `rounded-md` (6px) buttons, `rounded-lg` (8px) cards and images. Nothing pill-shaped.
- Body text at least 16px, nothing below 12px, paragraphs at most `max-w-[70ch]`.
- Interactive targets at least 44×44px. Never remove the focus outline.
- CSS transitions only on `color`, `background-color` and `border-color`, 200ms. One element is animated by one tool only (CSS, Motion or AnimeJS).
- Motion animates `opacity` and `transform` only, once, from below, no bounce.
- With `prefers-reduced-motion: reduce` every page shows its final state immediately.
- Tests run with reduced motion requested by default, so pages render their final state. A test that needs motion calls `stubMatchMedia(false)` first.
- Before each commit: `npm run lint`, `npm run build`, `npm run test` all pass.

## Review Focus

Conditions the spec implies and that are most likely to bite a visitor. Each is pinned by a test in the task that owns the code.

1. **A project with missing optional data** (no cover, no repository, no site, no technologies): the card and the detail page render without an empty link, an empty list or a broken image. Task 6.
2. **The content request fails**: the page shows an error message, header and footer stay usable, nothing crashes. Tasks 3 and 6.
3. **An unknown address** (`/nope`, `/projects/unknown-slug`): the visitor sees "Page not found" with a way back, not a blank screen. Tasks 5 and 6.
4. **The animation library throws**: the Home still shows title, buttons and the exact numbers. Task 9.
5. **Long unbroken text** (a long project title, a URL, a long technology name) at 375px: it wraps instead of causing horizontal scroll. Tasks 6 and 10.

---

## File Structure

```
frontend/
├── index.html                          # title, meta description
├── vite.config.ts                      # + test.setupFiles
└── src/
    ├── main.tsx                        # fonts, router, query client, render
    ├── App.tsx                         # providers: MotionConfig, QueryClientProvider, RouterProvider
    ├── routes.tsx                      # route table (used by main.tsx and by tests)
    ├── index.css                       # Tailwind theme tokens, base styles, type utilities
    ├── test/
    │   ├── setup.ts                    # jest-dom, cleanup, browser API stubs
    │   ├── media.ts                    # stubMatchMedia(reduced)
    │   └── render.tsx                  # renderRoute(path)
    ├── shared/
    │   ├── texts.ts                    # every fixed interface text and the site copy
    │   ├── site.ts                     # public links and optional CV PDF URL
    │   ├── format.ts                   # date range formatting, skill grouping
    │   ├── motion.ts                   # prefersReducedMotion()
    │   ├── api/
    │   │   ├── types.ts                # Project, Experience, Skill, Education
    │   │   ├── sampleData.ts           # development-only sample content
    │   │   ├── publicApi.ts            # the only place that knows where data comes from
    │   │   └── queries.ts              # TanStack Query hooks
    │   └── components/
    │       ├── Container.tsx
    │       ├── ButtonLink.tsx
    │       ├── Tag.tsx
    │       ├── Reveal.tsx
    │       └── QueryBoundary.tsx
    └── modules/public/
        ├── PublicLayout.tsx            # skip link, Header, <main>, Footer, ScrollRestoration
        ├── Header.tsx
        ├── Footer.tsx
        ├── NotFoundPage.tsx
        ├── about/AboutPage.tsx
        ├── home/HomePage.tsx
        ├── home/useHomeIntro.ts
        ├── projects/ProjectCard.tsx
        ├── projects/ProjectsPage.tsx
        ├── projects/ProjectPage.tsx
        └── cv/CvPage.tsx               # includes CvDownloadLink
```

Test files sit next to the file they test, named `*.test.ts(x)`. Delete each `.gitkeep` when its folder gets a real file.

---

### Task 1: Branch, test harness, design tokens

**Files:**
- Modify: `frontend/vite.config.ts`, `frontend/package.json`, `frontend/index.html`, `frontend/src/index.css`, `frontend/src/main.tsx`
- Create: `frontend/src/test/setup.ts`, `frontend/src/test/media.ts`, `frontend/src/test/setup.test.ts`

**Interfaces:**
- Produces: Tailwind colour utilities named after the brand tokens without the `--color-` prefix (`bg-background`, `text-foreground`, `bg-card`, `text-accent`, `bg-muted`, `text-muted-foreground`, `border-border`, `border-border-strong`, `text-destructive`, …); `font-sans`, `font-mono`; type utilities `type-display`, `type-h1`, `type-h2`, `type-h3`, `type-body-lg`, `type-body`, `type-small`, `type-label`; utility `link`.
- Produces for tests: `stubMatchMedia(reduced: boolean): void` in `src/test/media.ts`, which replaces `window.matchMedia` with a stub returning a complete `MediaQueryList` shape (`matches: reduced`, `media`, `addEventListener`, `removeEventListener`, `addListener`, `removeListener`, `dispatchEvent`, `onchange`) — Motion calls the listener methods, so a bare `{ matches }` object would throw. Before each test: `stubMatchMedia(true)`, an `IntersectionObserver` no-op stub and a `window.scrollTo` stub. After each test: `cleanup()` and `vi.restoreAllMocks()`.

- [ ] **Step 1: Create the branch and commit the existing scaffold**

```bash
git checkout -b feat/public-frontend
git add -A
git commit -m "chore: scaffold frontend and backend projects"
```

- [ ] **Step 2: Write the failing test** in `src/test/setup.test.ts`

```ts
it('provides jest-dom matchers and browser API stubs', () => {
  document.body.innerHTML = '<p>ready</p>'
  expect(document.querySelector('p')).toBeInTheDocument()
  expect(window.matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(true)
  stubMatchMedia(false)
  expect(window.matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(false)
  expect(typeof IntersectionObserver).toBe('function')
})
```

- [ ] **Step 3: Run it and see it fail**

Run: `npm run test -- src/test/setup.test.ts` — Expected: FAIL (`toBeInTheDocument` is not a function / `matchMedia` is not a function).

- [ ] **Step 4: Implement the harness**

`src/test/media.ts` as in Interfaces. `src/test/setup.ts`: import `@testing-library/jest-dom/vitest`; `beforeEach` assigns the three stubs; `afterEach` runs `cleanup()` and `vi.restoreAllMocks()`. In `vite.config.ts` add `setupFiles: ['./src/test/setup.ts']` under `test`. In `package.json` change the `test` script to `vitest run` (drop `--passWithNoTests`).

- [ ] **Step 5: Run it and see it pass**

Run: `npm run test` — Expected: 1 passed.

- [ ] **Step 6: Write the theme in `src/index.css`**

After `@import "tailwindcss";` add one `@theme` block that:
- resets the defaults that must not be usable: `--color-*: initial; --radius-*: initial; --shadow-*: initial; --font-*: initial;`
- declares every row of the Colour table in `brand-guidelines.md` with the same name and hex;
- declares `--font-sans` and `--font-mono` exactly as in the Typography section;
- declares `--radius-sm: 4px; --radius-md: 6px; --radius-lg: 8px;` (`--radius` in the guidelines is `--radius-md` here);
- declares `--ease-out: cubic-bezier(0.33, 1, 0.68, 1);`.

Then a `:root` rule with the four duration tokens of the Motion table (`--motion-fast: 200ms; --motion-reveal: 500ms; --motion-intro-step: 600ms; --motion-count: 800ms;`) and `--ease-out-expo`. CSS transitions use `var(--motion-fast)`.

Then `@layer base`: `body` gets background, foreground, `font-sans`, 16px, line height 1.6; `:focus-visible` gets `outline: 2px solid var(--color-ring); outline-offset: 2px;`.

Then one `@utility` per row of the Typography "Scale" table, named as in Interfaces above, each setting size, weight and line height; the desktop size applies from 768px; `type-display` and `type-h1` add `letter-spacing: -0.02em`; `type-display`, `type-h1`, `type-h2`, `type-h3` add `text-wrap: balance`; `type-label` adds `font-family: var(--font-mono)`.

Then `@utility link`: `color: var(--color-accent); text-decoration: underline; text-underline-offset: 2px;`.

- [ ] **Step 7: Load the fonts and set the document head**

In `src/main.tsx` import, before `./index.css`: `@fontsource/ibm-plex-sans/latin-400.css`, `latin-500.css`, `latin-600.css`, `latin-700.css` and `@fontsource/jetbrains-mono/latin-400.css`, `latin-500.css`. In `index.html` keep `<title>Yintong Zhou</title>` and add `<meta name="description">` with the Home subtitle from `PROFILE.md`.

- [ ] **Step 8: Verify the build carries the tokens**

Run: `npm run lint && npm run build && grep -il "fafafa" dist/assets/*.css && ls dist/assets | grep -c woff2`
Expected: lint and build succeed, grep prints one CSS file, the count is 6 or more.

- [ ] **Step 9: Commit**

```bash
git add frontend
git commit -m "feat: add test harness and brand design tokens"
```

---

### Task 2: Copy, site constants, formatting

**Files:**
- Create: `frontend/src/shared/texts.ts`, `frontend/src/shared/site.ts`, `frontend/src/shared/format.ts`, `frontend/src/shared/format.test.ts`, `frontend/src/shared/texts.test.ts`
- Modify: `PROFILE.md` (GitHub line)

**Interfaces:**
- Produces `texts` (a `const` object, `as const`):

```ts
texts.owner      // { name: 'Yintong Zhou', role: 'Fullstack .NET Software Developer', location: 'Milan' }
texts.nav        // { projects: 'Projects', cv: 'CV', about: 'About', skip: 'Skip to content' }
texts.home       // { title, subtitle, seeProjects: 'See projects', readCv: 'Read my CV',
                 //   numbers: [{ value: 8, suffix: '+', label: 'years of experience' },
                 //             { value: 38, suffix: '', label: 'web apps migrated' },
                 //             { value: 10, suffix: '+', label: 'applications under Single Sign-On' }],
                 //   previewTitle: 'Projects', previewAll: 'All projects', contactTitle: 'Get in touch' }
texts.projects   // { title: 'Projects', empty: 'No projects published yet.', repo: 'Repository',
                 //   site: 'Website', back: 'All projects', coverAlt: (title: string) => `Cover image of ${title}` }
texts.cv         // { title: 'CV', experience: 'Experience', skills: 'Skills', education: 'Education',
                 //   certifications: 'Certifications', present: 'Present',
                 //   download: 'Download CV (PDF)', empty: 'Nothing published yet.' }
texts.about      // { title: 'About', body }
texts.footer     // { github: 'GitHub', linkedin: 'LinkedIn', email: 'Email' }
texts.notFound   // { title: 'Page not found', back: 'Back to home' }
texts.errors     // { load: 'Could not load this content. Try again later.' }
```

  `home.title`, `home.subtitle` and `about.body` are copied verbatim from "Site copy" in `PROFILE.md`.
- Produces `site`: `{ githubUrl: 'https://github.com/yintong-zhou', linkedinUrl: 'https://www.linkedin.com/in/yintong-zhou', email: 'contactdm.yt@gmail.com', cvPdfUrl: null as string | null }`.
- Produces in `format.ts`:
  - `formatMonthYear(isoDate: string): string`
  - `formatDateRange(startDate: string, endDate: string | null): string`
  - `groupSkills(skills: { category: string; name: string }[]): { category: string; names: string[] }[]`

- [ ] **Step 1: Write the failing tests**

```ts
// format.test.ts
it('formats an ISO date as short month and year, independent of the time zone', () => {
  expect(formatMonthYear('2020-03-01')).toBe('Mar 2020')
  expect(formatMonthYear('2019-12-31')).toBe('Dec 2019')
})
it('formats a closed range and an open range', () => {
  expect(formatDateRange('2018-01-15', '2020-03-01')).toBe('Jan 2018 – Mar 2020')
  expect(formatDateRange('2020-04-01', null)).toBe('Apr 2020 – Present')
})
it('groups skills by category keeping first-appearance order', () => {
  expect(groupSkills([
    { category: 'Backend', name: 'C#' },
    { category: 'Languages', name: 'Italian' },
    { category: 'Backend', name: 'ASP.NET' },
  ])).toEqual([
    { category: 'Backend', names: ['C#', 'ASP.NET'] },
    { category: 'Languages', names: ['Italian'] },
  ])
  expect(groupSkills([])).toEqual([])
})

// texts.test.ts
it('carries the exact Home numbers from PROFILE.md', () => {
  expect(texts.home.numbers.map((n) => `${n.value}${n.suffix} ${n.label}`)).toEqual([
    '8+ years of experience',
    '38 web apps migrated',
    '10+ applications under Single Sign-On',
  ])
})
```

- [ ] **Step 2: Run and see them fail**

Run: `npm run test -- src/shared` — Expected: FAIL, modules not found.

- [ ] **Step 3: Implement `texts.ts`, `site.ts`, `format.ts`**

`formatMonthYear` uses `Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })`. The range separator is an en dash with a space on each side; the open end is `texts.cv.present`.

- [ ] **Step 4: Run and see them pass**

Run: `npm run test -- src/shared` — Expected: 4 passed.

- [ ] **Step 5: Record the GitHub link in `PROFILE.md`**

Under "Public contacts and links" replace `- GitHub: to be provided by the owner` with `- GitHub: github.com/yintong-zhou`, and add the same line to the Footer list in "Site copy".

- [ ] **Step 6: Commit**

```bash
git add frontend PROFILE.md
git commit -m "feat: add site copy, public links and formatting helpers"
```

---

### Task 3: Data layer

**Files:**
- Create: `frontend/src/shared/api/types.ts`, `sampleData.ts`, `publicApi.ts`, `queries.ts`, `publicApi.test.ts`, `frontend/src/shared/components/QueryBoundary.tsx`, `QueryBoundary.test.tsx`

**Interfaces:**
- Produces in `types.ts`:

```ts
export interface Project {
  slug: string; title: string; summary: string; description: string
  technologies: string[]
  repoUrl: string | null; siteUrl: string | null; coverImageUrl: string | null
}
export interface Experience {
  id: number; role: string; company: string; location: string | null
  startDate: string; endDate: string | null   // ISO dates, endDate null = current
  description: string
}
export interface Skill { id: number; category: string; name: string }
export interface Education {
  id: number; type: 'education' | 'certification'
  title: string; institution: string; year: number
}
```

- Produces in `publicApi.ts`: `export const publicApi` with `getProjects(): Promise<Project[]>`, `getProject(slug: string): Promise<Project | null>`, `getExperiences(): Promise<Experience[]>`, `getSkills(): Promise<Skill[]>`, `getEducation(): Promise<Education[]>`. Lists arrive already ordered; pages never sort.
- Produces in `queries.ts`: `useProjects()`, `useProject(slug: string)`, `useExperiences()`, `useSkills()`, `useEducation()`, each returning the `useQuery` result for the matching `publicApi` method, with keys `['public', 'projects']`, `['public', 'projects', slug]`, `['public', 'experiences']`, `['public', 'skills']`, `['public', 'education']`.
- Produces `QueryBoundary<T>({ query, emptyText, children }: { query: UseQueryResult<T[]>; emptyText: string; children: (items: T[]) => ReactNode })`.

- [ ] **Step 1: Write the failing tests**

```ts
// publicApi.test.ts — Vitest runs with import.meta.env.DEV === true
it('returns sample content in development, every title marked as sample', async () => {
  const projects = await publicApi.getProjects()
  expect(projects).toHaveLength(3)
  expect(projects.every((p) => p.title.startsWith('Sample'))).toBe(true)
  expect((await publicApi.getExperiences()).some((e) => e.endDate === null)).toBe(true)
  expect((await publicApi.getSkills()).some((s) => s.category === 'Languages')).toBe(true)
  const types = (await publicApi.getEducation()).map((e) => e.type)
  expect(types).toContain('education')
  expect(types).toContain('certification')
})
it('finds a project by slug and returns null for an unknown slug', async () => {
  const [first] = await publicApi.getProjects()
  expect(await publicApi.getProject(first.slug)).toEqual(first)
  expect(await publicApi.getProject('unknown-slug')).toBeNull()
})
```

```tsx
// QueryBoundary.test.tsx — build the query prop by hand: { status, data, isPending, isError } cast to UseQueryResult
it('renders nothing while pending')                      // container is empty
it('renders the load error as an alert')                 // getByRole('alert') has texts.errors.load
it('renders the empty text when the list is empty')      // getByText(emptyText)
it('renders children with the items when there are any') // children receives the array
```

- [ ] **Step 2: Run and see them fail**

Run: `npm run test -- src/shared` — Expected: FAIL, modules not found.

- [ ] **Step 3: Implement**

`sampleData.ts` exports `sampleData: { projects: Project[]; experiences: Experience[]; skills: Skill[]; education: Education[] }` with 3 projects, 3 experiences (one current), skills in 3 categories including `Languages`, and 2 education entries (one of each type). Every string value starts with `Sample`. One project has an empty `technologies` array and null `repoUrl`, `siteUrl`; the first project's `coverImageUrl` is an inline SVG data URI of a flat 16:9 rectangle, the others are null.

`publicApi.ts` loads `sampleData` with a dynamic `import('./sampleData')` inside an `if (import.meta.env.DEV)` block and otherwise resolves empty lists and `null`, so the production bundle contains no sample content. Mark it:

```ts
// ponytail: static sample data in dev, empty in production. Replace the bodies with fetch('/api/public/...') when the API exists.
```

- [ ] **Step 4: Run and see them pass**

Run: `npm run test -- src/shared` — Expected: all passed.

- [ ] **Step 5: Commit**

```bash
git add frontend
git commit -m "feat: add public data layer with development sample data"
```

---

### Task 4: Shared components

**Files:**
- Create: `frontend/src/shared/motion.ts`, `frontend/src/shared/components/Container.tsx`, `ButtonLink.tsx`, `Tag.tsx`, `Reveal.tsx`, `Reveal.test.tsx`, `ButtonLink.test.tsx`

**Interfaces:**
- Produces `prefersReducedMotion(): boolean` — reads `window.matchMedia('(prefers-reduced-motion: reduce)').matches` at call time.
- Produces `Container({ children, className? })` — max width 1200px, centred, side padding `px-4 md:px-6 lg:px-8`.
- Produces `ButtonLink({ to, variant, children, className? }: { to: string; variant: 'main' | 'secondary'; … })` — a router `Link`, min height 44px, label weight 500, `rounded-md`. `main`: accent background, on-accent text. `secondary`: transparent, 1px `border-primary`.
- Produces `Tag({ children })` — mono label, muted background, `rounded-sm`, no border, not interactive.
- Produces `Reveal({ children, as?, delay?, distance?, className? }: { as?: 'section' | 'div' | 'li'; delay?: number /* seconds */; distance?: 24 | 12 })` — defaults `as: 'div'`, `delay: 0`, `distance: 24`.

- [ ] **Step 1: Write the failing tests**

```tsx
// Reveal.test.tsx
it('starts hidden and offset when motion is allowed', () => {
  stubMatchMedia(false)
  render(<Reveal><p>content</p></Reveal>)
  expect(screen.getByText('content').parentElement!.style.opacity).toBe('0')
})
it('renders the final state at once when reduced motion is requested', () => {
  render(<Reveal><p>content</p></Reveal>)
  expect(screen.getByText('content').parentElement!.style.opacity).not.toBe('0')
})

// ButtonLink.test.tsx — render inside <MemoryRouter>
it('renders a link to the target', () => {
  expect(screen.getByRole('link', { name: 'See projects' })).toHaveAttribute('href', '/projects')
})
```

- [ ] **Step 2: Run and see them fail**

Run: `npm run test -- src/shared/components` — Expected: FAIL, modules not found.

- [ ] **Step 3: Implement**

`Reveal` renders the matching `motion.*` element with `whileInView={{ opacity: 1, y: 0 }}`, `viewport={{ once: true, amount: 0.2 }}`, `transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1], delay }}` and `initial={prefersReducedMotion() ? false : { opacity: 0, y: distance }}`.

- [ ] **Step 4: Run and see them pass**

Run: `npm run test -- src/shared/components` — Expected: all passed.

- [ ] **Step 5: Commit**

```bash
git add frontend
git commit -m "feat: add shared layout, button, tag and reveal components"
```

---

### Task 5: Layout, routing, About, Not found

**Files:**
- Create: `frontend/src/routes.tsx`, `frontend/src/test/render.tsx`, `frontend/src/modules/public/PublicLayout.tsx`, `Header.tsx`, `Footer.tsx`, `NotFoundPage.tsx`, `about/AboutPage.tsx`, `home/HomePage.tsx`, `projects/ProjectsPage.tsx`, `projects/ProjectPage.tsx`, `cv/CvPage.tsx`, `frontend/src/modules/public/PublicLayout.test.tsx`
- Modify: `frontend/src/App.tsx`, `frontend/src/main.tsx`

**Interfaces:**
- Produces `routes: RouteObject[]` — one parent route with element `PublicLayout` and children `/` → `HomePage`, `/projects` → `ProjectsPage`, `/projects/:slug` → `ProjectPage`, `/cv` → `CvPage`, `/about` → `AboutPage`, `*` → `NotFoundPage`.
- Produces `App({ router, queryClient }: { router: ReturnType<typeof createBrowserRouter>; queryClient: QueryClient })` — `MotionConfig reducedMotion="user"` › `QueryClientProvider` › `RouterProvider`.
- Produces `renderRoute(path: string): RenderResult` in `src/test/render.tsx` — renders `App` with `createMemoryRouter(routes, { initialEntries: [path] })` and a `QueryClient` with `retry: false`.
- Every page component is a named export matching its file name and renders `<title>` (React 19 hoists it) plus an `h1` with class `type-h1`. Titles: Home `Yintong Zhou · Fullstack .NET Software Developer`; the others `<page title> · Yintong Zhou`, built from `texts`.
- In this task `HomePage`, `ProjectsPage`, `ProjectPage` and `CvPage` contain only `<title>` and `h1`; Tasks 6–8 fill them.

- [ ] **Step 1: Write the failing tests** in `PublicLayout.test.tsx`

```tsx
it('shows the owner name and the three navigation links', () => {
  renderRoute('/about')
  const nav = screen.getByRole('navigation')
  expect(within(nav).getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '/projects')
  expect(within(nav).getByRole('link', { name: 'CV' })).toHaveAttribute('href', '/cv')
  expect(within(nav).getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'page')
  expect(screen.getByRole('banner')).toHaveTextContent('Yintong Zhou')
})
it('offers a skip link to the main content as the first link', () => {
  renderRoute('/')
  expect(screen.getAllByRole('link')[0]).toHaveAttribute('href', '#main')
  expect(screen.getByRole('main')).toHaveAttribute('id', 'main')
})
it('shows identity and public links in the footer', () => {
  renderRoute('/')
  const footer = screen.getByRole('contentinfo')
  expect(footer).toHaveTextContent('Yintong Zhou · Fullstack .NET Software Developer · Milan')
  expect(within(footer).getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/yintong-zhou')
  expect(within(footer).getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', 'https://www.linkedin.com/in/yintong-zhou')
  expect(within(footer).getByRole('link', { name: 'Email' })).toHaveAttribute('href', 'mailto:contactdm.yt@gmail.com')
})
it('renders the About copy and sets the document title', () => {
  renderRoute('/about')
  expect(screen.getByRole('heading', { level: 1, name: 'About' })).toBeInTheDocument()
  expect(screen.getByText(/I'm a fullstack software developer based in Milan/)).toBeInTheDocument()
  expect(document.title).toBe('About · Yintong Zhou')
})
it('shows a not-found page with a way back for an unknown address', () => {
  renderRoute('/nope')
  expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/')
})
it('never renders the repository name', () => {
  renderRoute('/')
  expect(document.body.textContent).not.toMatch(/jade-atlas/i)
})
```

- [ ] **Step 2: Run and see them fail**

Run: `npm run test -- src/modules/public` — Expected: FAIL, modules not found.

- [ ] **Step 3: Implement**

- `PublicLayout`: skip link (visually hidden until focused, `texts.nav.skip`), `Header`, `<main id="main">` with `Outlet`, `Footer`, `ScrollRestoration`.
- `Header`: `<header>` on `bg-card` with a 1px bottom `border-border`; the owner name is a `Link` to `/` on the left; `<nav>` on the right with three `NavLink`s, each at least 44px tall, the active one in accent colour and underlined, the others underlined on hover. No hamburger: the three links fit at 375px.
- `Footer`: 1px top border; the identity line joins `texts.owner` name, role and location with ` · `; three text links from `site` and `texts.footer` (no icons: Lucide 1.x ships no brand icons).
- `AboutPage`: `h1`, then `texts.about.body` in a paragraph with `max-w-[70ch]`.
- `main.tsx` creates `createBrowserRouter(routes)` and `new QueryClient()` and renders `<App router={…} queryClient={…} />` inside `StrictMode`.
- Vertical rhythm on public pages: `py-16 md:py-24` between sections.

- [ ] **Step 4: Run and see them pass**

Run: `npm run test` — Expected: all passed.

- [ ] **Step 5: Commit**

```bash
git add frontend
git commit -m "feat: add public layout, routing, About and not-found pages"
```

---

### Task 6: Projects

**Files:**
- Create: `frontend/src/modules/public/projects/ProjectCard.tsx`, `ProjectCard.test.tsx`, `ProjectsPage.test.tsx`, `ProjectPage.test.tsx`
- Modify: `frontend/src/modules/public/projects/ProjectsPage.tsx`, `ProjectPage.tsx`

**Interfaces:**
- Consumes: `useProjects`, `useProject`, `publicApi`, `Project` (Task 3); `QueryBoundary` (Task 3); `Reveal`, `Tag`, `Container` (Task 4); `renderRoute` (Task 5); `NotFoundPage` (Task 5).
- Produces `ProjectCard({ project }: { project: Project })` — used by Task 8 for the Home preview.

Tests stub data with `vi.spyOn(publicApi, 'getProjects').mockResolvedValue([...])` and await content with `findBy*`. Use two fixtures defined in the test file: `full` (all fields, `coverImageUrl: '/cover.png'`, `technologies: ['C#', 'Oracle']`, `repoUrl`, `siteUrl`) and `bare` (`technologies: []`, the three URLs null, title `'Averyveryverylongprojecttitlewithoutanyspaces'`).

- [ ] **Step 1: Write the failing tests**

```tsx
// ProjectCard.test.tsx — render inside <MemoryRouter>
it('is a single link to the project page with title, summary and tags', () => {
  // full: exactly one link, href '/projects/<slug>', contains title, summary, 'C#', 'Oracle'
  expect(screen.getAllByRole('link')).toHaveLength(1)
})
it('shows the cover with alt text, lazy loading and reserved 16:9 space', () => {
  // full: getByRole('img', { name: `Cover image of ${full.title}` }) has loading="lazy" and class 'aspect-video'
})
it('shows a muted block with the title when there is no cover, and no empty tag list', () => {
  // bare: queryByRole('img') is null; queryByRole('list') is null; the title appears twice (block + heading)
})
it('lets a long unbroken title wrap', () => {
  // bare: the heading has class 'wrap-anywhere'
})

// ProjectsPage.test.tsx
it('lists the published projects', async () => {
  // renderRoute('/projects') with [full, bare]: findAllByRole('article') has length 2
})
it('shows the empty state when nothing is published', async () => {
  // []: findByText('No projects published yet.')
})
it('shows an error and keeps navigation usable when loading fails', async () => {
  // mockRejectedValue(new Error('network')): findByRole('alert') has texts.errors.load;
  // getByRole('navigation') and getByRole('contentinfo') are in the document
})

// ProjectPage.test.tsx — spy on publicApi.getProject
it('shows title, summary, description, tags and both links', async () => {
  // full: h1 with title; links 'Repository' → repoUrl and 'Website' → siteUrl; document.title is `${full.title} · Yintong Zhou`
})
it('omits the links and the tag list that have no data', async () => {
  // bare: queryByRole('link', { name: 'Repository' }) and 'Website' are null; no img
})
it('shows the not-found page for an unknown slug', async () => {
  // getProject resolves null: findByRole('heading', { level: 1, name: 'Page not found' })
})
```

- [ ] **Step 2: Run and see them fail**

Run: `npm run test -- src/modules/public/projects` — Expected: FAIL.

- [ ] **Step 3: Implement**

- `ProjectCard`: an `<article>` whose only child is a `Link` to `/projects/${slug}`; `bg-card`, 1px `border-border`, `rounded-lg`, border becomes `border-foreground` on hover with a 200ms colour transition. Inside: the cover (`img`, `aspect-video`, `object-cover`, `loading="lazy"`, alt from `texts.projects.coverAlt`) or a `bg-muted` `aspect-video` block showing the title in `type-label`; then an `h3` (`type-h3 wrap-anywhere`), the summary, and a `<ul>` of `Tag`s only when `technologies` is not empty.
- `ProjectsPage`: `h1`, then `QueryBoundary` over `useProjects()` rendering a grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`, gap 16px mobile, 24px from `md`). Each card sits in `<Reveal distance={12} delay={Math.min(index, 7) * 0.04}>`.
- `ProjectPage`: reads `slug` with `useParams`, calls `useProject(slug)`. Pending → nothing; error → the same alert as `QueryBoundary`; `null` → `<NotFoundPage />`. Otherwise: `<title>`, a `Link` back to `/projects` (`texts.projects.back`), `h1` (`wrap-anywhere`), summary in `type-body-lg`, cover or muted block as in the card (cover not lazy here: it is above the fold), description with `whitespace-pre-line max-w-[70ch]`, tags, then `Repository` and `Website` as `link` anchors only when their URL is not null, with `wrap-anywhere`.

- [ ] **Step 4: Run and see them pass**

Run: `npm run test` — Expected: all passed.

- [ ] **Step 5: Commit**

```bash
git add frontend
git commit -m "feat: add projects list and project detail pages"
```

---

### Task 7: CV

**Files:**
- Modify: `frontend/src/modules/public/cv/CvPage.tsx`
- Create: `frontend/src/modules/public/cv/CvPage.test.tsx`

**Interfaces:**
- Consumes: `useExperiences`, `useSkills`, `useEducation`, `publicApi` (Task 3); `formatDateRange`, `groupSkills` (Task 2); `QueryBoundary`, `Reveal`, `Tag`; `site.cvPdfUrl`.
- Produces `CvDownloadLink({ url }: { url: string | null })`, exported from `CvPage.tsx`.

Languages have no table of their own: they are skills whose category is `Languages`, so they appear as one more skill group.

- [ ] **Step 1: Write the failing tests** (spy on the three `publicApi` methods)

```tsx
it('renders the experience timeline with a formatted range and "Present" for the current role', async () => {
  // experiences: [{ role: 'Developer', company: 'Acme', location: 'Milan', startDate: '2020-04-01', endDate: null, … },
  //               { role: 'Junior developer', company: 'Beta', location: null, startDate: '2018-01-15', endDate: '2020-03-01', … }]
  // findByText('Apr 2020 – Present'); getByText('Jan 2018 – Mar 2020'); 'Acme · Milan'; 'Beta' without a trailing separator
})
it('groups skills by category, languages included', async () => {
  // skills in 'Backend' and 'Languages': one h3 per category, each followed by its tags
})
it('separates education from certifications and hides an empty group', async () => {
  // education: only one entry of type 'certification' → heading 'Certifications' present, heading 'Education' absent
})
it('shows the empty text in each section when nothing is published', async () => {
  // all three resolve []: getAllByText('Nothing published yet.') has length 3 (after findAllByText)
})
it('renders the download link only when a PDF URL is configured', () => {
  // <CvDownloadLink url={null} /> renders nothing;
  // <CvDownloadLink url="/cv.pdf" /> renders a link named 'Download CV (PDF)' with href '/cv.pdf' and a download attribute
})
```

- [ ] **Step 2: Run and see them fail**

Run: `npm run test -- src/modules/public/cv` — Expected: FAIL.

- [ ] **Step 3: Implement**

`CvPage`: `h1` with `<CvDownloadLink url={site.cvPdfUrl} />` beside it, then three `<Reveal as="section">` blocks, each with an `h2` and a `QueryBoundary` with `texts.cv.empty`:
- **Experience:** an `<ol>` with a 1px left line in `border-border`. Each item: the date range in `type-label tabular-nums text-muted-foreground`, above the role on mobile and in a fixed left column from `md`; role as `h3`; company and location joined with ` · ` (company alone when location is null); description with `whitespace-pre-line`.
- **Skills:** `groupSkills` output, one `h3` per category followed by its `Tag`s.
- **Education:** entries split by `type`; `h3` "Education" and `h3` "Certifications", each rendered only if it has entries; each entry shows the year in `type-label tabular-nums`, the title and the institution.

`CvDownloadLink` is a secondary-styled anchor (not a router link) with the Lucide `Download` icon at 20px, `aria-hidden`.

- [ ] **Step 4: Run and see them pass**

Run: `npm run test` — Expected: all passed.

- [ ] **Step 5: Commit**

```bash
git add frontend
git commit -m "feat: add CV page with timeline, skills and education"
```

---

### Task 8: Home content

**Files:**
- Modify: `frontend/src/modules/public/home/HomePage.tsx`
- Create: `frontend/src/modules/public/home/HomePage.test.tsx`

**Interfaces:**
- Consumes: `texts.home`, `site.email`, `useProjects`, `ProjectCard` (Task 6), `ButtonLink`, `Reveal`, `Container`.
- Produces the DOM hooks Task 9 animates, all inside one root element `<section data-intro>`: `.intro-title` (the `h1`), `.intro-subtitle`, `.intro-action` (each of the two buttons), `.intro-numbers` (the numbers block), and inside each number a `<span data-count-to="8">8</span>` holding the integer, followed by the suffix in its own span.

- [ ] **Step 1: Write the failing tests** (spy on `publicApi.getProjects`)

```tsx
it('shows the title, subtitle and the two actions', async () => {
  // h1 with texts.home.title; link 'See projects' → '/projects'; link 'Read my CV' → '/cv'
})
it('shows the three numbers with their exact values in the initial render', () => {
  // the elements with [data-count-to] have text '8', '38', '10'; labels and '+' suffixes are present
})
it('previews at most three projects and links to the full list', async () => {
  // 4 projects: findAllByRole('article') has length 3; link 'All projects' → '/projects'
})
it('hides the preview section when no project is published', async () => {
  // []: after the query settles, queryByRole('heading', { name: 'Projects' }) is null
})
it('invites the visitor to get in touch by email', () => {
  // heading 'Get in touch'; link named 'contactdm.yt@gmail.com' → 'mailto:contactdm.yt@gmail.com'
})
```

- [ ] **Step 2: Run and see them fail**

Run: `npm run test -- src/modules/public/home` — Expected: FAIL.

- [ ] **Step 3: Implement**

- **Hero** (`<section data-intro>`, not wrapped in `Reveal`): `h1` in `type-display`, subtitle in `type-body-lg text-muted-foreground max-w-[70ch]`, the two `ButtonLink`s (`See projects` is `main`, `Read my CV` is `secondary`), then the numbers in a three-column grid from `md` (one column on mobile): value in `font-mono type-display tabular-nums`, label in `type-small text-muted-foreground`.
- **Preview** (`<Reveal as="section">`, rendered only when `useProjects().data` has items): `h2`, the first three `ProjectCard`s in the same grid as the Projects page, and a `link` to `/projects`.
- **Contact** (`<Reveal as="section">`): `h2` with `texts.home.contactTitle` and the email address as a `link` anchor. It is a text link, not a button: the view's single main action stays `See projects`.

- [ ] **Step 4: Run and see them pass**

Run: `npm run test` — Expected: all passed.

- [ ] **Step 5: Commit**

```bash
git add frontend
git commit -m "feat: add Home page content"
```

---

### Task 9: Home introduction

**Files:**
- Create: `frontend/src/modules/public/home/useHomeIntro.ts`, `useHomeIntro.test.tsx`
- Modify: `frontend/src/modules/public/home/HomePage.tsx` (attach the ref to `<section data-intro>` and call the hook)

**Interfaces:**
- Consumes: `prefersReducedMotion` (Task 4); the DOM hooks from Task 8.
- Produces `useHomeIntro(rootRef: RefObject<HTMLElement | null>): void`.

- [ ] **Step 1: Write the failing tests**

Mock the library with `vi.mock('animejs', …)`: `createScope` returns `{ add(cb) { cb(); return this }, revert }`, `createTimeline` returns an object whose `add` returns itself, `stagger` is a stub. Render `HomePage` through `renderRoute('/')`.

```tsx
it('builds one timeline when motion is allowed and reverts it on unmount', () => {
  // stubMatchMedia(false); createTimeline called once; after unmount(), revert called once
})
it('does not start any animation when reduced motion is requested', () => {
  // default stub (reduced); createScope and createTimeline not called; numbers read '8', '38', '10'
})
it('keeps the page readable when the animation library throws', () => {
  // stubMatchMedia(false); createScope.mockImplementation(() => { throw new Error('boom') })
  // the h1 with texts.home.title and the link 'See projects' are in the document; numbers read '8', '38', '10'
})
```

- [ ] **Step 2: Run and see them fail**

Run: `npm run test -- src/modules/public/home` — Expected: FAIL, `useHomeIntro` not found.

- [ ] **Step 3: Implement `useHomeIntro`**

Inside one `useEffect`: return early when `prefersReducedMotion()` is true; otherwise, in a `try/catch` that swallows the error, create `createScope({ root: rootRef })` and inside `scope.add(...)` build one timeline; the cleanup calls `scope.revert()`.

The timeline, with `defaults: { duration: 600, ease: 'outExpo' }`:

| Target | Animation | Position |
|---|---|---|
| `.intro-title` | `opacity: [0, 1]`, `y: [24, 0]` | start |
| `.intro-subtitle` | `opacity: [0, 1]`, `y: [24, 0]` | `'-=450'` |
| `.intro-action` | `opacity: [0, 1]`, `y: [12, 0]`, `delay: stagger(80)` | `'-=450'` |
| `.intro-numbers` | `opacity: [0, 1]`, `y: [12, 0]` | `'-=450'` |
| each `[data-count-to]` | count from 0 to its value over 800ms | same position as `.intro-numbers` |

The count animates a plain `{ value: 0 }` object and writes `String(Math.round(value))` into the element on every update; on completion it writes the exact `data-count-to` value. The whole sequence ends within 1500ms. Nothing sets `pointer-events`, so links work from the first frame. Check the exact option names against the AnimeJS 4.5 types in `node_modules/animejs` before relying on the table.

- [ ] **Step 4: Run and see them pass**

Run: `npm run test` — Expected: all passed.

- [ ] **Step 5: Commit**

```bash
git add frontend
git commit -m "feat: add Home introduction sequence with count-up"
```

---

### Task 10: Whole-site verification

**Files:** none created; fixes go in the file that owns the defect, with a test.

- [ ] **Step 1: Run the verification commands**

Run: `npm run lint && npm run build && npm run test` — Expected: no lint error, build succeeds, all tests pass.

- [ ] **Step 2: Check the production bundle**

```bash
grep -rl "Sample" dist/            # expected: no output (no sample data shipped)
grep -rli "jade-atlas" dist/       # expected: no output
grep -rnE "#[0-9a-fA-F]{3,8}\b" src --include=*.tsx   # expected: no output (tokens only)
```

If the first command prints a file, the development guard in `publicApi.ts` is not being removed: make sure the dynamic import sits inside an `if (import.meta.env.DEV) { … }` block statement and rebuild.

- [ ] **Step 3: Check the site by hand**

Run `npm run dev` and open the printed address. At 375, 768, 1024 and 1440px, on `/`, `/projects`, one project page, `/cv`, `/about` and `/nope`, confirm:
- no horizontal scroll, including the sample project with the long title;
- the whole site can be used with the keyboard, the focus outline is always visible, the skip link appears on the first Tab;
- the Home introduction plays once, finishes in about a second and a half, and the numbers stop on 8+, 38 and 10+;
- sections fade in once and do not replay when scrolling back;
- with the operating system set to reduce motion, everything appears in its final state at once;
- navigating between pages lands at the top of the new page.

Then run `npm run build && npm run preview` and confirm `/projects` and `/cv` show their empty states. Stop both servers afterwards.

- [ ] **Step 4: Walk the checklist at the end of `brand-guidelines.md`** for every page and fix what fails.

- [ ] **Step 5: Commit any fix**

```bash
git add frontend
git commit -m "fix: address findings from public frontend verification"
```

- [ ] **Step 6: Propose the status update, do not write it**

Show the owner this text for the "Status" section of `PROJECT.md` and edit the file only after they agree:

> - Current phase: public frontend complete on sample data; backend not started.
> - Decisions so far: (existing list) + frontend built before the backend; public pages read through `publicApi`, which returns development-only sample data until `/api/public/*` exists; languages are skills in the `Languages` category; project cards link to a detail page at `/projects/:slug`; GitHub link `github.com/yintong-zhou`.
> - Next step: phase 1 backend foundations (API reading from Oracle), then replace `publicApi` bodies with real requests and generate the TypeScript types from OpenAPI.
