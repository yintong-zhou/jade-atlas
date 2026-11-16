# Public pages redesign (2026-11-16)

Planner: Claude. Implementer: Codex, one task per run, in order. Reviewer: Claude.

The design spec is `brand-guidelines.md` (rewritten today): read it in full before any task. The copy is already in `frontend/src/shared/texts.ts`. This file says what to build in each task and how to check it.

## Decisions (owner, 2026-11-16)

- Style: quiet minimalism, Apple iOS 26 feel. Liquid Glass (jade and translucent white) on controls only: navigation island, buttons, closing action. Content is flat.
- Font: Manrope Variable for text, JetBrains Mono kept for numbers, dates and chips.
- Structure: the CV merges into About. `/cv` redirects to `/about`. Menu: Projects · About.
- The Home hero sequence (black hole, tunnel) stays as it is. Only its copy block takes the new type and buttons.
- Method: the `design-taste-frontend` skill's rules, implemented with the project's own Tailwind tokens. The skill's CSS/JS kit is not imported.

## Rules for every task

- Work only in `frontend/` (plus what a task names). Do not touch `backend/`, `PROJECT.md`, `PROFILE.md`, `AGENTS.md`, `brand-guidelines.md`, `docs/`, the hero scene files (`home/hero/heroScene.ts`, `heroTimeline.ts`, `blackHoleLayer.ts`, `HeroSequence.tsx`, `vendor/`) or the untracked `rock-*.webp`.
- Do not edit `frontend/src/shared/texts.ts`: use its keys. If a text is missing, stop and say which one. Never write visible copy in a component.
- No new dependencies. `@fontsource-variable/manrope` is already installed; the icons are already in `frontend/src/assets/icons/`.
- Tailwind 4 with the tokens in `src/index.css`. Semantic tokens only: no raw hex in components, no spacing outside the scale in `brand-guidelines.md`.
- Keep components small and local. No new abstraction with one user, no config objects, no helper used once.
- Accessibility stays: visible focus ring, 44px touch targets, heading levels in order, `alt` on images, `prefers-reduced-motion` and `prefers-reduced-transparency` honoured.
- Tests: update the tests of what you change so they still check behaviour (what is rendered, where links go). Delete a test only when its component is deleted. Do not weaken an assertion to make it pass.
- Format changed files: `npx prettier --no-semi --single-quote --print-width 120 --write <files>` (from `frontend/`).
- Finish with, from `frontend/`: `npm run lint`, `npm run build`, `npm run test`. All three must pass. Report the commands' results, the files changed, and anything you could not do. Do not commit.
- Python is not installed on this machine.

Reference for the hover and motion numbers, if a detail is missing here: `C:\Users\zhouy\.claude\skills\design-taste-frontend\references\motion.md` (sections "The hover layer" and "Reduced motion"). Do not copy the kit's files into the project.

---

## Task 1: foundations and shell (effort: medium)

Tokens, type, glass, shared components, header and footer. After this task every page still works, with the new look on shared parts.

**1.1 Fonts** (`src/main.tsx`, `package.json`)
- Import `@fontsource-variable/manrope/wght.css` (check the package's files for the exact path; prefer the latin subset file if the package ships one). Remove the four `@fontsource/ibm-plex-sans` imports and uninstall that package. Keep the two JetBrains Mono imports.

**1.2 Tokens** (`src/index.css`)
- Colours, radii and fonts exactly as the tables in `brand-guidelines.md` ("Colour", "Typography", "Layout and spacing": `--radius-sm` 10px, `--radius-md` 16px, `--radius-lg` 24px; `--color-background` #ffffff; `--color-muted` #f3f5f4; `--color-muted-foreground` #52525b; `--color-ring` = accent).
- Type utilities `type-display`, `type-h1`, `type-h2`, `type-h3`, `type-body-lg`, `type-body`, `type-small`, `type-label`, plus a new `type-figure` (mono, H2 size): sizes, weights, line heights and tracking from the scale table, fluid with `clamp()` between 390px and 1440px viewports. No weight above 500 anywhere in the public site (check `font-semibold`, `font-bold` in components).
- Glass: one set of tokens, jade and translucent white: `--glass-jade`, `--glass-jade-deep`, `--glass-jade-light`, `--glass-fill`, `--glass-jade-fill`, `--glass-tint`, `--glass-edge`, `--glass-rim`, `--glass-shadow`, `--glass-blur`. Delete the `--header-glass-*`, `--glass-moss*`, `--glass-sand*`, `--glass-soft-*`, `--glass-gloss`, `--glass-white-fill` generations after moving what the island and the buttons still need onto the new names. `glass-main` becomes jade glass (white label, at least 4.5:1 against the darkest and the lightest point of the fill composited over white); `glass-secondary` is translucent white glass with a `--glass-jade-deep` label. Keep the `@supports` and `prefers-reduced-transparency` fallbacks, and add them to `glass-main`.
- Section rhythm tokens on `:root`: `--gut` 24px, 48px from 640px, 80px from 1024px; `--padt` 96px, 120px from 640px; `--padb` 48px, 72px from 640px. Add a `section-pad` utility (`padding-block: var(--padt) var(--padb)`).
- Hover layer utilities: `link` (accent; underline that draws on hover with `background-size`, static underline under reduced motion), a `link-inline` variant that is always underlined for running text if needed, `tile-hover` (the element rises 2px; a descendant marked `data-cover` zooms to 1.03 inside an `overflow: hidden` frame), button hover and press in `buttonStyles.ts` (rise 1px and brighten; `active:scale-[0.98]`). All transitions `--motion-fast`, `--ease-out`, removed on transform under reduced motion.
- Entrance utility `enter`: a CSS animation (opacity 0 → 1, translateY 12px → 0, `--motion-reveal`, `--ease-out`, `both`), delayed by `calc(var(--enter-i, 0) * 80ms)`; `animation: none` under reduced motion. Content must stay visible if the animation never runs.
- Keep `hero-net`, `glass-arrow`, the `[data-hero]` rules and `overflow-wrap: anywhere` on `body` (a test reads it).

**1.3 Shared components**
- `Container.tsx`: `mx-auto w-[min(100%-2*var(--gut),1280px)]` (no side padding classes).
- `Tag.tsx`: the chip from the spec (mono 13px, fully round, 6% foreground tint, `px-3 py-1`).
- `buttonStyles.ts`: add an `xl` size for the closing action (72px high on a phone, 96px from 640px, `type-h3` label, full container width). Keep the two variants.

**1.4 Header** (`modules/public/Header.tsx`, `Header.module.css`)
- Same structure and behaviour (island, hide on `data-hero-nav='hidden'`, fallbacks). Move it onto the new glass tokens. The name is weight 500. The active item is jade without the text glow.

**1.5 Footer** (`modules/public/Footer.tsx`)
The footer is the page's closing section on every page, on the white ground, two rows inside one `Container`:
- Row 1, the close: `h2` `texts.closing.title` (`type-h1` size), one line `texts.closing.line` (`type-body-lg`, muted foreground, 16px under the title), then 48px lower the closing action: an `a href="mailto:…"` with the `xl` main button, label `texts.closing.action` and the trailing `ArrowRight` with `glass-arrow`. `section-pad` on the close.
- Row 2, the directory, 96px under the button: left the owner's name (`type-h3`) with `role · location` under it (`type-small`, muted); right the three links (GitHub, LinkedIn, Email) as `link`, each at least 44px high. Under both, one `type-small` muted line: `© <current year> <owner name>` and `texts.footer.trademarks`. Bottom padding 48px.
- No top border on the footer. `id="contact"` on the footer.

**1.6 Home contact section**
- Remove the "Write to me" section from `HomePage.tsx` (the footer's close replaces it) and fix the Home test.

**Check:** the three commands pass; `grep -rn "glass-moss\|glass-sand\|header-glass\|ibm-plex" frontend/src frontend/package.json` finds nothing.

---

## Task 2: About (with the CV) and Projects (effort: medium)

**2.1 One rows template** (`modules/public/about/`)
A small local component (or plain markup repeated) for "label left, content right": a 12-column grid from 1024px, the label in columns 1–4, the content in columns 5–12, a 1px `border-border` rule closing each row, 32px padding above and below; under 1024px the label stacks above the content. Used by experience, skills and education.

**2.2 About page** (`modules/public/about/AboutPage.tsx`; move what is needed out of `cv/CvPage.tsx`, then delete `cv/CvPage.tsx` and its test)
- `<title>`: `About · <owner name>`.
- Head section, at least one screen tall minus the header (`min-h-[calc(100svh-var(--header-height))]`), top padding 56px (32 on a phone): `h1` `texts.about.heading` (`type-h1`, columns 1–9, `enter`, `--enter-i: 0`). 48px lower, a split on the same grid: left (columns 1–4) the CV download button (`CvDownloadLink`, renders nothing while `site.cvPdfUrl` is null); right (columns 5–12) the three `texts.about.paragraphs`: the first as `type-body-lg`, the others `type-body`, each at most 62 characters wide (`max-w-[62ch]`), 24px apart, `enter` with `--enter-i: 1`.
- Section `id="experience"` (white ground, `section-pad`): `h2` `texts.cv.experience`; 48px lower the rows: left the date range (`type-label`, tabular, muted) and under it `company · location` (`type-small`, muted); right the role (`h3`, `type-h3`) and the description (`whitespace-pre-line`, `max-w-[62ch]`).
- One muted band (`bg-muted`) holding two sections:
  - `id="skills"`: `h2` `texts.cv.skills`; rows: left the category (`h3`, `type-h3`), right the chips. On the muted ground the chips keep the 6% tint.
  - `id="education"`: `h2` `texts.cv.educationAndCertifications`; rows for education first, then certifications: left the year (`type-label`) and under it the group name (`texts.cv.education` / `texts.cv.certifications`, `type-small`, muted); right the title (`type-h3`, as a `p` or `h3`) and the institution (muted).
- Keep `QueryBoundary` and the empty texts as today. No `Reveal`.

**2.3 Routes** (`src/routes.tsx`)
- `/cv` renders `<Navigate to="/about" replace />`. Update links that pointed to `/cv`: the hero's second button (`home/hero/HeroCopy.tsx`) goes to `/about#experience`.

**2.4 Projects list** (`modules/public/projects/ProjectsPage.tsx`, `ProjectCard.tsx`)
- Page: one section, top padding 56px (32 on a phone), `h1` `texts.projects.title` (`type-h1`, `enter`), 48px lower the grid.
- Tile: as in the spec ("Tiles"): `bg-muted` on the white ground, `bg-card` on the muted ground (a `tone` prop or a parent CSS variable, whichever is smaller), `rounded-lg`, 8px padding, cover 16:9 with `rounded-md` inside an `overflow-hidden` frame, then a 16px-padded block with the title (`h3`, `type-h3`), the summary (muted foreground) and the chips. The whole tile is one link with `tile-hover`. No border.
- A project without a cover: a block with a 6% foreground tint and the title in `type-label`.
- `ProjectGrid`: a 6-column grid from 1024px, 2 columns from 640px, 1 on a phone, gap 24px (12 on a phone). Every row is full: from 1024px, with `n % 3 === 1` the first tile spans all six columns and lays out horizontally (cover on the left seven twelfths, text on the right); with `n % 3 === 2` the first two tiles span three columns each; all other tiles span two. Between 640px and 1023px an odd `n` makes the first tile span both columns. Put the span rule in one small pure function with a test. No `Reveal` around the tiles.

**2.5 Project page** (`modules/public/projects/ProjectPage.tsx`)
- Top padding 56px (32). Back link (`link`, with a leading `ArrowLeft` icon), then the `h1` (`type-h1`, at most columns 1–9, `enter`), then the cover across the container (`rounded-lg`, 16:9), then a split on the rows grid: left (columns 1–4) the chips and, under them, the repository and website links as secondary buttons (external links: `target="_blank" rel="noreferrer"`, a trailing `ArrowUpRight`); right (columns 5–12) the summary (`type-body-lg`) and the description (`max-w-[62ch]`, `whitespace-pre-line`).

**2.6 Not found** (`NotFoundPage.tsx`): top padding 56px (32), `h1` with `enter`, the button 32px lower.

**Check:** the three commands pass; `/cv` redirects in a test; `grep -rn "Reveal" frontend/src/modules/public/about frontend/src/modules/public/projects` finds nothing.

---

## Task 3: Home below the hero (effort: high)

Order on the Home: the hero (unchanged), the stack section (white), the projects band (muted), then the footer's close.

**3.1 Hero copy** (`home/hero/HeroCopy.tsx`, `HomeHero.tsx` static variant only)
- New type utilities apply by themselves. Make sure the title takes at most three lines at 1440px and at 390px: widen the title's own max width if needed (the subtitle keeps `max-w-[62ch]`). Do not touch `HeroSequence.tsx`.

**3.2 Stack section** (`home/HomePage.tsx`, new `home/StackDiagram.tsx` and `StackDiagram.module.css`)
- A `section` at least one screen tall (`min-h-svh`), `section-pad`, in the `Container`: `h2` `texts.home.stackTitle` (`type-h2`), 48px lower the diagram, 72px lower the three numbers.
- **Diagram.** One muted panel (`bg-muted`, `rounded-lg`, padding 48px, 24px on a phone) with white nodes (`bg-card`, `rounded-md`, padding 16px–24px). Texts from `texts.home.stack`. From 1024px, three columns:
  - left: the front end node (JavaScript logo, label "Front end", detail "JavaScript");
  - centre: the backend node, larger, with a 1px jade ring (the .NET logo, label, detail);
  - right: two groups, each with its `type-label` muted group name above its nodes: Data (Oracle logo; "SQL Server" as text only) and External services (Salesforce logo; "ServiceNow" as text only; Google logo with "Google APIs").
  - Lines: front end → backend, and backend → each of the five nodes on the right, 1px, `--color-border-strong` at low opacity or `--color-border`. A short jade pulse travels along each line from left to right, one cycle every 3s, the lines a little out of phase.
  - Under 1024px the diagram stacks top to bottom (front end, backend, Data group, External services group) with vertical lines between the levels; the two groups' nodes wrap in a row.
- Logos: import the SVG files from `src/assets/icons/` as URLs and render `<img alt="" width height>` at 24–28px tall (the Oracle wordmark is wide: give it a fixed height of 12px). The node's text names the tool, so the image is decorative. No logo is redrawn, tinted or enlarged.
- Semantics: the diagram is real text. Wrap it in a `figure` with `aria-label={texts.home.stack.summary}`; the lines and pulses are `aria-hidden`.
- Technique: CSS only (grid or flex, pseudo-elements or small inline SVG for the lines, a CSS animation for the pulse). No layout measuring in JavaScript, no canvas, no new library. The pulses run only while the diagram is in the viewport (an `IntersectionObserver` that toggles one data attribute is fine) and never under reduced motion.
- It must hold together at 1440, 1024, 768 and 390px with no horizontal scroll at 320px, and with long labels wrapping inside their node.
- **Numbers.** Three columns on the 12-column grid (4 + 4 + 4; one column on a phone, 24px apart): the figure in `type-figure` with `tabular-nums`, the label under it (`type-body`, muted foreground). Keep `useCountUp` and the `data-count-to` markup as they are.

**3.3 Projects band** (`home/HomePage.tsx`)
- Rendered only when there is at least one project. A `section` on `bg-muted`, at least one screen tall, `section-pad`: `h2` `texts.home.previewTitle`, 48px lower `ProjectGrid` with the first three projects and white tiles, 48px lower a secondary `ButtonLink` to `/projects` with `texts.home.previewAll`.

**3.4 Remove the scroll reveals**
- Delete `shared/components/Reveal.tsx` and its two tests once nothing imports it. The Home sections do not fade in.

**3.5 Footer trademark line**: already in the footer from Task 1; nothing to do unless it is missing.

**Check:** the three commands pass; `grep -rn "Reveal" frontend/src` finds nothing; the Home renders the diagram's seven tool names as text.

---

## Review (Claude, after each task)

- Run lint, build and test again.
- Start the dev server and shoot every route at 1440×900, 1024×768, 768×1024 and 390×844 with the skill's `shoot.mjs`; read each screenshot against the checklist in `brand-guidelines.md`.
- Run the skill's `copy-lint.mjs` on the rendered pages.
- Clean the unused keys in `texts.ts`, then propose the `PROJECT.md` updates to the owner.
