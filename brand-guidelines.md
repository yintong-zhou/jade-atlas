# Brand guidelines

Visual rules for the public site and the private area: colour, type, layout, components and motion. Read together with `PROJECT.md` (scope, stack) and `PROFILE.md` (copy). If this file and `PROJECT.md` disagree on scope, `PROJECT.md` wins.

## Direction

**Minimalism & Swiss style, with restrained motion.** The site presents an enterprise software developer, so it should look engineered: a clear grid, strong type hierarchy, a lot of white space, one accent colour, no decoration that does not carry information.

- Content first. Every page must read well with animations and images switched off.
- One accent colour. Everything else is black, white and grey.
- Flat surfaces: 1px borders instead of shadows, gently rounded corners, no gradients.
- Avoid: generic corporate templates, stock illustrations, emoji used as icons, more than one call to action competing in the same view.
- One exception: the Home hero sequence (see "Motion"). It is the only illustrative, scroll-driven element on the site. Everything around it stays minimal.

## Logo and name

- The name `jade-atlas` never appears on the public site.
- The private area shows only the logo, without the name.
- Until the owner provides a logo, use a filled circle in `--color-primary`, 24px in the header.
- Keep clear space around the logo equal to half its height.

## Colour

Light theme only in v1. Components use the semantic tokens below, never raw hex values, so a dark theme can be added later by redefining the tokens.

| Token | Hex | Use |
|---|---|---|
| `--color-background` | `#FAFAFA` | Page background |
| `--color-foreground` | `#09090B` | Body text, headings |
| `--color-card` | `#FFFFFF` | Cards, form surfaces, header |
| `--color-card-foreground` | `#09090B` | Text on cards |
| `--color-primary` | `#18181B` | Secondary buttons border, logo placeholder, strong UI |
| `--color-on-primary` | `#FFFFFF` | Text on primary |
| `--color-secondary` | `#3F3F46` | Secondary text on dark surfaces, icons |
| `--color-on-secondary` | `#FFFFFF` | Text on secondary |
| `--color-accent` | `#00755A` | Jade green. Links, the main call to action, active navigation item |
| `--color-on-accent` | `#FFFFFF` | Text on accent |
| `--color-muted` | `#E8ECF0` | Subtle fills: tags, table header, skeletons |
| `--color-muted-foreground` | `#475569` | Secondary text, captions, dates |
| `--color-border` | `#E4E4E7` | Decorative dividers and card borders |
| `--color-border-strong` | `#71717A` | Borders of inputs and other controls |
| `--color-ring` | `#18181B` | Focus ring |
| `--color-destructive` | `#DC2626` | Delete actions, form errors |
| `--color-on-destructive` | `#FFFFFF` | Text on destructive |
| `--color-success` | `#00755A` | "Published" state, save confirmation. Same value as the accent: a second green would be indistinguishable from it |
| `--color-on-success` | `#FFFFFF` | Text on success |

Define the tokens once as CSS custom properties on `:root` and expose them to Tailwind as theme colours.

**Rules**

- The accent is for links, the single main call to action of a view, and the active navigation item. Do not use it for backgrounds of sections, headings or decoration. The only exception is the highlighted part of the Home title, which the hero sequence forms out of jade dust.
- The Home hero background is pure white (`--color-card`), because the hero images have a white background. The rest of the page keeps `--color-background`.
- Status is never colour alone: "Published", errors and confirmations always carry a text label or an icon.
- `--color-border` is too light to delimit a control (1.22:1). Inputs, checkboxes and selects use `--color-border-strong`.

**Measured contrast (WCAG 2)**

| Pair | Ratio |
|---|---|
| Foreground on background | 19.06 |
| Muted foreground on background | 7.26 |
| Muted foreground on muted | 6.38 |
| Accent on background (links) | 5.45 |
| Accent on muted | 4.79 |
| White on accent (button) | 5.69 |
| Accent on card (Home title highlight) | 5.69 |
| Destructive on background | 4.63 |
| Border strong on card | 4.83 |

Every text pair is at least 4.5:1 (AA). Recheck with the same method if a token changes.

## Typography

| Role | Font | Use |
|---|---|---|
| Interface and text | IBM Plex Sans | Headings, body, buttons, forms |
| Technical accent | JetBrains Mono | Highlighted numbers, technology tags, dates, code |

Both are open source (SIL Open Font License). Self-host the `woff2` files with `font-display: swap`, only weights 400, 500, 600 and 700 of Plex Sans and 400 and 500 of JetBrains Mono, so the site makes no request to a third-party font service.

```css
--font-sans: "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif;
--font-mono: "JetBrains Mono", ui-monospace, "Cascadia Code", monospace;
```

**Scale**

| Style | Size (mobile → desktop) | Weight | Line height |
|---|---|---|---|
| Display (Home title) | 40 → 64px | 700 | 1.1 |
| H1 | 32 → 48px | 600 | 1.15 |
| H2 | 24 → 32px | 600 | 1.2 |
| H3 | 18 → 24px | 600 | 1.3 |
| Body large (subtitle) | 18 → 20px | 400 | 1.6 |
| Body | 16px | 400 | 1.6 |
| Small | 14px | 400 | 1.5 |
| Label, tag (mono) | 12 → 14px | 500 | 1.4 |

**Rules**

- Body text is never below 16px; nothing is below 12px.
- Paragraphs are at most 65–75 characters wide.
- Headings use `text-wrap: balance`; Display and H1 use letter spacing `-0.02em`. Body text keeps the default spacing.
- Numbers that change or line up (the Home numbers, dates in the timeline, table columns) use tabular figures: `font-variant-numeric: tabular-nums`.
- Mono is an accent. Never set a paragraph in mono.
- Long URLs and identifiers wrap with `overflow-wrap: anywhere`.

## Layout and spacing

- **Spacing scale (4px base):** 4, 8, 12, 16, 24, 32, 48, 64, 96. No values outside the scale.
- **Container:** max width 1200px, centred, side padding 16px on mobile, 24px from 768px, 32px from 1024px.
- **Grid:** 12 columns with 24px gutter on desktop, 4 columns with 16px gutter on mobile.
- **Breakpoints to test:** 375, 768, 1024, 1440px. Mobile first, no horizontal scroll.
- **Vertical rhythm, public pages:** 96px between sections on desktop, 64px on mobile.
- **Private area:** same tokens, denser. 32–48px between blocks, 16px between form fields, tables with 12px cell padding.
- **Corners:** gently rounded, never pill-shaped. `--radius-sm` 4px for tags and checkboxes, `--radius` 6px for buttons and inputs, `--radius-lg` 8px for cards and images. The only fully round shape is the logo placeholder.
- **Elevation:** no shadows. Separate surfaces with a 1px `--color-border` line or a change of background.

## Components

- **Buttons.** Main: accent background, white text. Secondary: transparent, 1px `--color-primary` border. Destructive: destructive background, used only in the private area and always behind a confirmation. Height at least 44px, label weight 500, one main button per view.
- **Links.** Accent colour, underlined in running text. In navigation, underline on hover and for the active item.
- **Cards (projects).** Card background, 1px border, no shadow. On hover the border becomes `--color-foreground`. The whole card is one link.
- **Technology tags.** Mono, 12–14px, muted background, no border, not clickable.
- **Highlighted numbers (Home).** Mono, Display size, tabular figures, with a Small label underneath in muted foreground.
- **Timeline (CV).** A 1px vertical line in `--color-border`, dates in mono on the left, role and company on the right. On mobile the dates move above the role.
- **Forms (private area).** Always a visible label above the field, helper text below, the error next to the field in destructive colour with an icon. Never a placeholder used as a label.
- **Focus.** Every interactive element shows a 2px `--color-ring` outline with 2px offset on keyboard focus, following the radius of the element. Never remove it.
- **Icons.** Lucide, SVG, 1.5px stroke, 20px in the interface and 24px standalone. Icon-only buttons carry an `aria-label`. No emoji.

## Images

- Project covers are 16:9, cropped from the centre, with a 1px border. Reserve the space with `aspect-ratio` so the page does not shift while they load, and load them lazily below the fold.
- Every image has an `alt` text that describes it; decorative images have an empty `alt`.
- No stock photos or generic illustrations. A project without a cover shows a muted block with the project title in mono.
- The Home hero images (rock, jade, dust) are the exception. They live in `frontend/src/assets/home-hero/` as WebP, never PNG, in two widths (1024 and 640px). They are decorative: empty `alt`, hidden from screen readers. The first frame is a normal `<img>` loaded eagerly; the others are decoded before the sequence can reach them.

## Motion

Motion explains where content comes from. The scope is the one in `PROJECT.md`: the scroll sequence in the Home hero and sections entering the viewport. Nothing else moves, apart from state feedback on hover and press.

**Which tool for what**

| Case | Tool |
|---|---|
| Hover, press and focus feedback | CSS transitions |
| Sections entering the viewport | Motion (`motion/react`) |
| Home hero sequence: scroll progress | Motion (`useScroll`) |
| Home hero sequence: frames | A 2D `<canvas>`, redrawn from the scroll progress |
| Home hero sequence: dust particles | three.js (WebGL points), loaded on demand, only on the Home |
| Count-up of the three numbers, when they enter the viewport | AnimeJS |

One element is animated by one tool only. Never put Motion and AnimeJS on the same node.

**Tokens**

| Token | Value | Use |
|---|---|---|
| `--motion-fast` | 200ms | Hover and press: colour and border only |
| `--motion-reveal` | 500ms | A section entering the viewport |
| `--motion-intro-step` | 600ms | Each step of the Home introduction |
| `--motion-count` | 800ms | Count-up of the Home numbers |
| `--ease-out` | `cubic-bezier(0.33, 1, 0.68, 1)` | Reveals and state changes |
| `--ease-out-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | Home introduction |
| Distance | 24px for sections, 12px for small elements | Vertical offset at the start |
| Stagger | 80ms between blocks, 40ms between cards | At most 8 staggered elements |

**Rules**

- Animate `opacity` and `transform` only. Never width, height, top, left or anything that moves the layout.
- Elements arrive from below and decelerate. No bounce, no overshoot, no rotation, no parallax. Scroll-linked scrubbing is allowed only in the Home hero sequence.
- A section reveals once. It does not replay when scrolling back. The Home hero sequence is the exception: it follows the scroll in both directions.
- Animations never block input: links and buttons work from the first frame.
- Do not split DOM text into letters. In the hero the dust is drawn on the canvas, while the real title stays one text block in the HTML.
- The count-up runs once, uses tabular figures so the width does not jump, and ends on the exact value written in `PROFILE.md`.
- At most two animated groups visible at the same time.
- Content is visible by default in the HTML and CSS. The initial hidden state is set by the animation library, so a failed script never leaves an empty page.
- No route transitions, no animated loaders beyond a simple skeleton or spinner in the private area.

**Home hero sequence**

The Home opens on a white hero that shows only the grey rock. Scrolling drives the sequence: the rock cracks, opens into jade, dissolves into dust, and the dust composes the highlighted part of the Home title in the accent colour. The rest of the title, the subtitle and the buttons appear when the dust has settled.

- The scroll stays native. The hero is a tall section with a sticky stage; never intercept wheel or touch events, never scroll for the user, no scroll snapping.
- It is the only pinned section on the site.
- Smoothness comes first. Target 60fps on a mid-range phone:
  - draw only inside `requestAnimationFrame`, and only when the scroll progress has changed;
  - animate the canvas content, `opacity` and `transform` only; no layout reads while scrolling;
  - cap the canvas pixel ratio at 2 and scale the particle count to the viewport;
  - decode every image before the sequence can reach it, and reserve the stage size so nothing shifts;
  - stop drawing when the hero is out of the viewport.
- The real title, subtitle and buttons are in the HTML from the first frame, for screen readers and for a failed script. The canvas is `aria-hidden`.

**Reduced motion**

When the system asks for reduced motion, the site shows the final state at once: no translation, no count-up, no sequence. Colour feedback on hover stays. The Home hero becomes one screen tall, with the still jade stone and the complete title.

- Motion: wrap the application in `<MotionConfig reducedMotion="user">`.
- AnimeJS: do not start the timeline when `matchMedia("(prefers-reduced-motion: reduce)").matches` is true.
- CSS: `@media (prefers-reduced-motion: reduce)` sets transitions on transform to `none`.

**Reference snippets**

Indicative, to be checked against the installed versions of `motion` and `animejs` (v4) in phase 5.

```tsx
// Section entering the viewport (Motion)
import { motion } from "motion/react";

<motion.section
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.2 }}
  transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
/>
```

```tsx
// Home hero sequence: scroll progress from Motion, drawing on a canvas.
import { useMotionValueEvent, useScroll } from "motion/react";

const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end end"] });
useMotionValueEvent(scrollYProgress, "change", (progress) => requestDraw(progress));
```

## Voice

- First person, plain sentences, concrete numbers instead of adjectives.
- English only. Sentence case in headings and buttons ("See projects", not "See Projects").
- The copy comes from `PROFILE.md`. Do not add claims or personal details that are not there.

## Checklist before delivering a page

- [ ] Only semantic tokens, no raw hex or off-scale spacing
- [ ] Text contrast at least 4.5:1, controls at least 3:1
- [ ] Visible focus on every interactive element, full keyboard navigation
- [ ] Touch targets at least 44×44px
- [ ] Works at 375, 768, 1024 and 1440px without horizontal scroll
- [ ] No layout shift from images, fonts or animations
- [ ] Reduced motion shows the final state immediately
- [ ] No emoji as icons; icon-only buttons have a label

## Source

Generated with the `ui-ux-pro-max` skill for the product type "Portfolio/Personal". Style, neutral palette, type pairing and the animation rules come from its database. Chosen by the owner: the jade green accent (the skill proposed blue) and the gently rounded corners. Added on top of it for this project: `--color-success` and `--color-border-strong`, the type and spacing scales, and the translation of the motion presets from GSAP to Motion and AnimeJS.

Changed by the owner on 2026-11-15: the Home hero scroll sequence. It replaces the timed Home introduction and overrides three rules that came from the skill: no scroll-linked scrubbing, no accent on headings, no illustrations.
