# CV preview dialog on About

Owner request (2026-11-16): a CV button on About opens a popover that looks like a PDF preview of the full CV, with an ATS layout. The user can then download it.

Owner decisions:

- Download = the browser's print dialog ("Save as PDF") printing only the CV sheet. No PDF library and no static PDF file.
- The panel has rounded corners; behind it the page is dimmed and blurred.
- The sheet includes a professional summary and spoken languages, even though the rest of the site does not show them.

## Constraints

- Privacy: the sheet header shows only name, role, email, "Milan, Italy", LinkedIn and GitHub. No phone number and no other town or address. `frontend/src/shared/texts.test.ts` already scans `texts` and `sampleData` for phone and street patterns, so new strings in `texts.ts` are covered.
- Content comes from the data the site already has (`useExperiences`, `useSkills`, `useEducation`, `groupSkills`, `formatDateRange`) plus new strings in `texts.ts`. Do not re-transcribe the source CV. Sample data is development-only, so in production the sheet shows only the header, summary and languages until the API exists. That is known and accepted for now.
- No new dependencies. Native `<dialog>` with `showModal()`.
- Buttons stay jade and translucent white (`buttonClass('main' | 'secondary')`).

## Task 1 (Codex, medium effort): build it

See the brief in `.tmp/codex/cv-preview-brief.md` (same content as the section below).

## Task 2 (Codex, high effort, read-only): review the diff

## Verification

- `npm run lint`, `npm run build`, `npm run test` in `frontend/`.
- Screenshots of `/about#cv` at 1440 and 390, plus reduced motion.
- Headless Chrome `--print-to-pdf` on `/about#cv`: the PDF holds only the sheet, on A4 pages, with selectable text.

## Brief for task 1

You are working in `D:/DEVS/jade-atlas` (React 19 + Vite + TypeScript + Tailwind 4, tests with Vitest + Testing Library). Read `AGENTS.md`. The working tree has uncommitted work from the owner: preserve it, change only what this brief asks, and do not commit. You have no network: do not install packages.

### Goal

On the About page, replace the dead `CvDownloadLink` with a "View my CV" button. The button opens a modal dialog that looks like a PDF viewer showing the owner's CV as a single-column, ATS-style sheet. A "Download CV (PDF)" button in the dialog calls `window.print()`, and the print stylesheet prints only the sheet, so "Save as PDF" in the browser produces a text PDF of the CV.

### Files

- New `frontend/src/modules/public/about/CvPreview.tsx`: the button, the dialog and the sheet (one file; a `CvSheet` function inside it is fine).
- New `frontend/src/modules/public/about/CvPreview.test.tsx`.
- `frontend/src/modules/public/about/AboutPage.tsx`: render `<CvPreview />` where `<CvDownloadLink url={site.cvPdfUrl} />` is now; drop the now-unused imports.
- Delete `frontend/src/modules/public/about/CvDownloadLink.tsx`, its two tests in `CvSections.test.tsx` (keep the other tests in that file) and `cvPdfUrl` in `frontend/src/shared/site.ts` once nothing uses it.
- `frontend/src/shared/texts.ts`: new strings (below).
- `frontend/src/index.css`: dialog, sheet and print styles. Use the existing tokens (`--color-*`, `--glass-*`).
- `frontend/src/test/setup.ts`: only if jsdom lacks `HTMLDialogElement.prototype.showModal`/`close`, add minimal stubs that toggle the `open` attribute.

### Strings (add under `texts.cv`)

```ts
sheet: {
  open: 'View my CV',            // or reuse texts.about.cvLink, which has the same value; then do not duplicate it
  title: 'Curriculum vitae',
  close: 'Close',
  role: 'Software Developer - Fullstack .NET (C#, ASP.NET MVC)',
  location: 'Milan, Italy',
  headings: {
    summary: 'Professional summary',
    skills: 'Skills',
    experience: 'Professional experience',
    volunteer: 'Volunteer experience',
    education: 'Education and certifications',
    languages: 'Languages',
  },
  summary:
    'Fullstack Software Developer with 8+ years of experience building and maintaining enterprise web applications on the Microsoft .NET stack. Day-to-day stack: C#, ASP.NET MVC, ASP.NET Web API, Entity Framework, Oracle PL/SQL and SQL Server, plus HTML, CSS, JavaScript, jQuery and Bootstrap on the frontend. Built REST API integrations with external services. Background in cybersecurity and networking, with hands-on experience on Windows Server and VMware.',
  languages: ['Italian: Native', 'English: B2, professional working proficiency', 'Mandarin Chinese: C1 speaking, B1 writing'],
  printTitle: 'CV Yintong Zhou',
},
```

Reuse `texts.cv.download` ('Download CV (PDF)') for the download button and `texts.owner.name` for the name. Contacts come from `frontend/src/shared/site.ts` (`email`, `linkedinUrl`, `githubUrl`); show them without the protocol (`linkedin.com/in/yintong-zhou`, `github.com/yintong-zhou`).

### The sheet (ATS layout)

One column, real text, no tables, no icons, no columns, no images. Top to bottom:

1. Header, centred: the name (`h2`, about 32px, bold, `--color-accent`), the role line below (about 15px, medium), a thin grey rule, one contacts line (about 12.5px) joined by ` | `: email (mailto link) | Milan, Italy | linkedin (link) | github (link), then another thin rule.
2. Sections, each a `section` with an `h3` heading: uppercase, bold, about 12.5px, letter-spacing 0.12em, colour `--glass-jade-deep`, a 1.5px `--color-accent` bottom border, a little space above. Order:
   - Professional summary: one paragraph.
   - Skills: `groupSkills(skills)`, one bullet per category: `<strong>{category}:</strong> {names.join(', ')}`.
   - Professional experience: experiences whose role does not contain `(volunteer)`, in data order. Each entry: one line `<strong>{role}</strong>` followed by a muted ` | {company} - {location} | {formatDateRange(start, end)}` (skip the location part when it is null), then the description split on `\n` as bullets. Do not show the per-role skill tags.
   - Volunteer experience: experiences whose role contains `(volunteer)`, same format, with ` (volunteer)` removed from the shown role. Mark the filter with a `// ponytail:` comment: it relies on the role text until `Experience` has a type field.
   - Education and certifications: each education entry as `<strong>{title}</strong>` + muted ` | {institution} | {year}`, its `qualifications` (if any) as bullets `{title}, {institution}`.
   - Languages: bullets from `texts.cv.sheet.languages`.
   Skip a data section entirely when its list is empty (production has no data yet). Read the query data with `query.data ?? []`; no loading or error UI inside the sheet.
3. Body text about 13px, line-height 1.45, colour `--color-foreground` on white (`--color-card`). Bullets: `list-disc`, about 18px left padding, marker in `--color-accent`. Use the site font (do not load new fonts).

The paper itself: white, `max-width: 794px` (A4 at 96dpi), centred, padding about 48px 56px (24px below 640px), a soft shadow, small radius (about 4px), like a page in a PDF viewer.

### The dialog

- Trigger: `<button type="button" className={buttonClass('secondary')}>` with the lucide `FileText` icon (20px, strokeWidth 1.5, `aria-hidden`) and the label `View my CV`.
- Render the `<dialog>` into `document.body` with `createPortal`, class `cv-dialog`, `aria-labelledby` pointing at the toolbar title. Open with `showModal()`.
- Panel: `width: min(100% - 2rem, 920px)`, `max-height: calc(100dvh - 2rem)` (below 640px: `100% - 1rem` and `100dvh - 1rem`), `border-radius: 28px`, `1px solid var(--glass-edge)`, background `var(--glass-fill)` with `backdrop-filter: blur(var(--glass-blur))`, `box-shadow: var(--glass-rim), var(--glass-shadow)`, padding 0, `overflow: hidden`, laid out as a flex column.
- `::backdrop`: `color-mix(in srgb, var(--color-foreground) 40%, transparent)` with `backdrop-filter: blur(10px)`.
- Toolbar (class `cv-toolbar`, does not scroll): left the title `Curriculum vitae` (hidden below 640px, but keep it in the accessibility tree for `aria-labelledby`, e.g. `sr-only sm:not-sr-only`); right the download button (`buttonClass('main')`, lucide `Download` icon) and a close button (44x44, round, `glass-secondary`, lucide `X` icon, `aria-label="Close"`). Padding about 12px 16px.
- Viewport (class `cv-viewport`): `overflow-y: auto`, `overscroll-behavior: contain`, background `var(--color-muted)`, padding 32px (12px below 640px), containing the paper (class `cv-sheet`).
- Closing: the close button, Escape (native), and a click on the backdrop (`onClick` on the dialog when `event.target === event.currentTarget`).
- Page scroll lock: `html:has(dialog.cv-dialog[open]) { overflow: hidden; }`.
- Opening animation only: `@starting-style` from `opacity: 0; translate: 0 8px; scale: 0.98` over `var(--motion-fast)` or 200ms; none under `prefers-reduced-motion: reduce`.
- Deep link: on mount, if `window.location.hash === '#cv'`, open the dialog. On close, if the hash is `#cv`, remove it with `history.replaceState` (keep pathname and search).
- Download: set `document.title` to `texts.cv.sheet.printTitle`, call `window.print()`, then restore the previous title.

### Print stylesheet (inside `@media print`)

- `@page { size: A4; margin: 12mm 14mm; }`.
- `body:has(> dialog.cv-dialog[open]) > :not(dialog.cv-dialog) { display: none !important; }` so only the dialog prints.
- The open dialog, the viewport and the sheet lose every frame: no radius, border, shadow, backdrop-filter, background, padding, max-height or max-width, `overflow: visible`, `position: static`, `width: auto`, `margin: 0`. The toolbar and `::backdrop` are hidden.
- `print-color-adjust: exact` on the sheet so the jade headings print.
- `break-inside: avoid` on each experience entry header line plus its first bullet is overkill; use `break-after: avoid` on `h3` and on entry title lines, `break-inside: avoid` on `li`.

### Tests (`CvPreview.test.tsx`, follow the style of `AboutPage.test.tsx` and `CvSections.test.tsx`, `renderRoute('/about')` from `src/test/render.tsx`)

- The About page shows a `View my CV` button; clicking it opens a dialog named `Curriculum vitae` (`getByRole('dialog', { name: ... })`).
- With stubbed experiences, skills and education (spy on `publicApi` like `CvSections.test.tsx` does), the dialog shows the six section headings, a volunteer role (`... (volunteer)`) only under Volunteer experience and without the suffix, a skill category line, a qualification bullet, and the email link.
- With empty data, the skills, experience, volunteer and education headings are absent, while the summary and languages remain.
- The download button calls `window.print` (spy, `mockImplementation(() => {})`) and restores `document.title`.
- The close button closes the dialog.

### Done when

From `frontend/`: `npm run lint`, `npm run build` and `npm run test` all pass. Format the files you touched with `npx prettier --no-semi --single-quote --print-width 120 --write <files>`. In your final message list the files changed and the three command results.
