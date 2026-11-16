# Scroll Animations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Home hero into a scroll-driven sequence (rock → jade → dust → the owner's name) and give every public page scroll animation.

**Architecture:** Motion supplies a spring-smoothed scroll progress for a tall hero section with a sticky stage. One `requestAnimationFrame` draw per change paints a 2D canvas (two neighbouring frames blended) and a three.js `Points` cloud whose movement runs in the vertex shader. The hero renders in Static mode (reduced motion, short viewport, any setup failure) or Sequence mode; the title is real text in both. Other pages reuse `Reveal` plus two small scroll-linked Motion elements.

**Tech Stack:** React 19, Vite 8, TypeScript 6, Tailwind 4.3, Motion 14 (`motion/react`), AnimeJS 4.5, three 0.187 (new), Vitest 5 + Testing Library + jsdom.

**Spec:** `docs/superpowers/specs/2026-11-15-scroll-animations-design.md`. Read it first, with `brand-guidelines.md` ("Motion"), `PROJECT.md`, `PROFILE.md`, `AGENTS.md`.

**Revision 2 (frame sequence delivered):** the owner delivered the frame sequence the spec calls "Frames from video clips" as a ready package: 240 WebP frames, 1254×1254, 60 fps, white background (`rock_0000.webp` … `rock_0239.webp`, 47 MB) plus PNG keyframes, a preview MP4 and `manifest.json`. Phases in the package: shell cracks and flies off frames 0–119, intact jade 119–125, jade dissolves into green dust 126–239. This plan now builds the hero directly on that sequence; the 5 stills in `src/assets/home-hero/rock-*.webp` are no longer used and are not committed. The package was dropped in `frontend/public/rock-sequence-v2/`, where Vite would copy all 88 MB into `dist`; Task 1 moves it to `.tmp/hero-sequence/` (git-ignored) and a script derives the web frames from it.

## Global Constraints

- Run npm commands from `frontend/`, git commands from the repository root. Work on a new branch `feat/scroll-animations` created from `feat/public-frontend`. Never commit to `main`, never push, never merge.
- New packages: `three` (dependency) and `@types/three` (dev dependency). Nothing else.
- `three` is imported only by `hero/dust.ts`, and `dust.ts` is imported only with a dynamic `import()`.
- Code, identifiers, commit messages and site copy are in English. Every fixed string comes from `src/shared/texts.ts`. `texts.home.title` stays verbatim.
- Only theme tokens: no raw hex, no Tailwind default palette, no shadows. The accent is read from `--color-accent`.
- One element is animated by one tool only (Motion, AnimeJS, or direct canvas drawing).
- Animate `opacity` and `transform` only. No layout reads while scrolling: measure on mount, on `document.fonts.ready` and on resize.
- The scroll stays native: no wheel or touch listeners, no `scrollTo`, no scroll snapping.
- Canvases are `aria-hidden="true"`; decorative images have `alt=""`.
- Tests default to reduced motion (`src/test/setup.ts`); call `stubMatchMedia(false)` to test animation. jsdom has no canvas context, no `ResizeObserver`, no `document.fonts`.
- Before declaring a task done: `npm run lint`, `npm run build`, `npm run test` all pass. The Vite warning about a chunk over 500 kB is expected.
- Two stops for the owner: after Task 7 and after Task 9. Do not continue past a stop without the owner's go-ahead.

## Review Focus

1. **Page loaded or restored already scrolled past the hero** (reload, back navigation): the hero must show its final state, never invisible text. Test in Task 5.
2. **Resize or orientation change in the middle of the sequence:** the name must form where the real text now is. Test in Task 6.
3. **Short viewport** (phone in landscape, height under 560px): title, subtitle and buttons do not fit a pinned stage and would be clipped. Expected: Static mode. Test in Task 4.
4. **Fast scroll before the frames have loaded:** the canvas draws the nearest loaded frame and never a blank square. Test in Task 5.
5. **Dust image missing, text measured at zero size, or WebGL context lost:** no particles, the frames cross-fade to the real text, nothing throws. Tests in Tasks 2 and 6.

## File Structure

All paths under `frontend/src/`.

Plus, at the repository root: `execution/build_hero_frames.py` (derives the web frames from the delivered package) and its self-check `execution/test_build_hero_frames.py`.

| File | Responsibility |
|---|---|
| `assets/home-hero/seq/{large,small}/f_NNN.webp` | Generated web frames: 120 at 720px (large), 60 at 480px (small) |
| `modules/public/home/hero/heroTimeline.ts` | The timeline numbers and the pure functions that map progress to frames and layer opacities |
| `modules/public/home/hero/heroMode.ts` | Chooses Static or Sequence; WebGL support check |
| `modules/public/home/hero/heroFrames.ts` | Lists the generated frames (`import.meta.glob`) and exposes the frame lists |
| `modules/public/home/hero/sampling.ts` | Pure pixel sampling: picks particle positions and colours from image data |
| `modules/public/home/hero/frameCanvas.ts` | Loads frames and draws the blended pair on the 2D canvas |
| `modules/public/home/hero/dust.ts` | The three.js particle layer. The only file that imports `three` |
| `modules/public/home/hero/HeroCopy.tsx` | Title (name span + rest), subtitle, two buttons |
| `modules/public/home/hero/HeroSequence.tsx` | Tall section, sticky stage, scroll wiring, draw loop |
| `modules/public/home/hero/HomeHero.tsx` | Mode switch, error boundary, Static hero |
| `modules/public/home/useCountUp.ts` | Count-up of the three numbers on viewport entry (replaces `useHomeIntro.ts`) |
| `shared/components/ScrollProgress.tsx` | The 2px page progress line |

---

## Part 1: Home hero sequence

### Task 1: Branch, frames, dependency and timeline math

**Files:**
- Create: `execution/build_hero_frames.py`, `execution/test_build_hero_frames.py`, `assets/home-hero/seq/{large,small}/*.webp` (generated), `modules/public/home/hero/heroTimeline.ts`, `modules/public/home/hero/heroTimeline.test.ts`
- Move: `frontend/public/rock-sequence-v2/` → `.tmp/hero-sequence/rock-sequence-v2/`
- Modify: `frontend/package.json` (through npm)

**Interfaces:**
- Produces:

```ts
export const HERO = {
  hintEnd: 0.05,
  // progress → position in the sequence (0 = first frame, 1 = last), piecewise linear.
  // Knots: rock holds until 0.08; shell gone and jade intact at 0.44 (frame 119/239);
  // jade holds to 0.52 (frame 125/239); dust cloud complete at 0.8.
  track: [[0.08, 0], [0.44, 0.498], [0.52, 0.523], [0.8, 1]],
  framesOut: [0.78, 0.82],
  travel: [0.8, 0.94],
  settle: [0.94, 1],
  copy: { rest: [0.94, 0.98], subtitle: [0.95, 0.99], actions: [0.96, 1] },
  spring: { stiffness: 220, damping: 40, restDelta: 0.0005 },
  particles: { large: 18000, small: 8000 },
  minViewportHeight: 560,
  interactive: 0.98, // see Task 5: pointer events on the hero text from here
} as const
export function range(p: number, from: number, to: number): number // linear, clamped to 0..1
export function frameAt(
  p: number,
  count: number,
  track: readonly (readonly [number, number])[],
): { a: number; b: number; mix: number } // s = piecewise-linear track(p) clamped to 0..1; pos = s × (count − 1); a = floor, b = min(a + 1, count − 1), mix = pos − a
export function layers(p: number, hasDust: boolean): { frames: number; dust: number; travel: number; name: number }
```

```text
# execution/build_hero_frames.py  (run with py -3 -I from the repository root)
py -3 -I execution/build_hero_frames.py [SOURCE_DIR] [OUT_DIR]
  SOURCE_DIR default: .tmp/hero-sequence/rock-sequence-v2/frames
  OUT_DIR    default: frontend/src/assets/home-hero/seq
pick(n_source, n_out) -> list[int]   # round(i × (n_source − 1) / (n_out − 1)); first and last source frame always included
```

- [ ] **Step 1: Create the branch and move the package out of `public/`**

```bash
git checkout -b feat/scroll-animations
mkdir -p .tmp/hero-sequence && mv frontend/public/rock-sequence-v2 .tmp/hero-sequence/
```

- [ ] **Step 2: Write the frame script and its self-check.** `pick` as above. For each output set — `large`: 120 frames, 720px, WebP quality 72, method 6; `small`: 60 frames, 480px, quality 70 — it resizes with Lanczos, writes `f_000.webp …` (three digits, so string order is frame order), and first removes old `f_*.webp` files in that output folder only. It prints count and total size per set and exits non-zero when the source folder has fewer than 2 frames. `test_build_hero_frames.py` asserts `pick(240, 120)` starts at 0, ends at 239, has 120 strictly increasing items, and `pick(240, 60)` likewise; run with `py -3 -I execution/test_build_hero_frames.py`.
- [ ] **Step 3: Run it** and check the totals: large ≤ 8 MB, small ≤ 2.5 MB. If larger, lower the quality in the script, not the frame count.
- [ ] **Step 4: Commit what is on disk**

```bash
git add PROJECT.md brand-guidelines.md docs/superpowers execution/build_hero_frames.py execution/test_build_hero_frames.py frontend/src/assets/home-hero/seq
git commit -m "docs: add scroll animation design and plan; add hero frame sequence"
```

Leave `docs/handoff/*` untracked and leave the unused stills `frontend/src/assets/home-hero/rock-*.webp` uncommitted (ask the owner before deleting them).

- [ ] **Step 5: Install three**

Run from `frontend/`: `npm install three && npm install -D @types/three`

- [ ] **Step 6: Write the failing tests** in `heroTimeline.test.ts`

```ts
it('clamps a range to 0..1', () => {
  expect(range(0.5, 0, 1)).toBe(0.5)
  expect(range(-1, 0, 1)).toBe(0)
  expect(range(2, 0, 1)).toBe(1)
})
it('maps progress through the track to the two frames around it', () => {
  const track = [[0, 0], [0.5, 0.5], [1, 1]] as const
  expect(frameAt(0, 5, track)).toEqual({ a: 0, b: 1, mix: 0 })
  const mid = frameAt(0.375, 5, track) // pos 1.5
  expect([mid.a, mid.b]).toEqual([1, 2])
  expect(mid.mix).toBeCloseTo(0.5)
  expect(frameAt(1, 5, track)).toEqual({ a: 4, b: 4, mix: 0 })
})
it('holds the first frame before the track starts and the last after it ends', () => {
  expect(frameAt(0, 120, HERO.track)).toMatchObject({ a: 0, mix: 0 })
  expect(frameAt(0.9, 120, HERO.track)).toEqual({ a: 119, b: 119, mix: 0 })
})
it('holds the intact jade between the two jade knots', () => {
  const a = frameAt(0.45, 120, HERO.track).a
  const b = frameAt(0.51, 120, HERO.track).a
  expect(b - a).toBeLessThanOrEqual(3)
})
it('hands over from frames to dust to the real name', () => {
  expect(layers(0.5, true)).toEqual({ frames: 1, dust: 0, travel: 0, name: 0 })
  expect(layers(0.8, true).frames).toBeCloseTo(0.5)
  expect(layers(0.8, true).dust).toBeCloseTo(0.5)
  expect(layers(0.87, true)).toMatchObject({ frames: 0, dust: 1 })
  expect(layers(0.87, true).travel).toBeCloseTo(0.5)
  expect(layers(1, true)).toMatchObject({ dust: 0, name: 1 })
})
it('cross-fades the frames straight to the name when there is no dust', () => {
  expect(layers(0.9, false)).toMatchObject({ frames: 1, dust: 0 })
  expect(layers(0.97, false).frames).toBeCloseTo(0.5)
  expect(layers(0.97, false).name).toBeCloseTo(0.5)
})
```

- [ ] **Step 7: Run** `npm run test -- heroTimeline` → FAIL (module not found)

- [ ] **Step 8: Implement `heroTimeline.ts`**

`layers`: with dust, `frames = 1 − range(p, framesOut)` and `dust = range(p, framesOut) × (1 − range(p, settle))`; without dust, `frames = 1 − range(p, settle)` and `dust = 0`. Always `travel = range(p, travel)`, `name = range(p, settle)`.

- [ ] **Step 9: Run** `npm run test -- heroTimeline` → PASS

- [ ] **Step 10: Commit** `feat: add hero timeline math and three.js dependency` (`package.json`, `package-lock.json`, both new files)

### Task 2: Pixel sampling

**Files:**
- Create: `modules/public/home/hero/sampling.ts`, `modules/public/home/hero/sampling.test.ts`

**Interfaces:**
- Produces:

```ts
export type Pixels = { data: Uint8ClampedArray; width: number; height: number } // RGBA
export type Points = { positions: Float32Array; colors: Float32Array } // x,y in 0..1; r,g,b in 0..1
export function samplePoints(
  pixels: Pixels,
  count: number,
  keep: (r: number, g: number, b: number, a: number) => boolean,
  random: () => number = Math.random,
): Points
export const isDust = (r: number, g: number, b: number, a: number): boolean // not near-white
export const isInk = (r: number, g: number, b: number, a: number): boolean // alpha above 128
```

- [ ] **Step 1: Write the failing tests**

```ts
const px = (...rgba: number[][]) => new Uint8ClampedArray(rgba.flat())
const white = [254, 254, 254, 255]
const green = [0, 128, 0, 255]

it('places every point inside a kept pixel and copies its colour', () => {
  const pixels = { data: px(white, white, white, green), width: 2, height: 2 } // kept pixel: bottom right
  const { positions, colors } = samplePoints(pixels, 50, isDust)
  expect(positions).toHaveLength(100)
  expect(colors).toHaveLength(150)
  for (let i = 0; i < 50; i++) {
    expect(positions[i * 2]).toBeGreaterThanOrEqual(0.5)
    expect(positions[i * 2 + 1]).toBeGreaterThanOrEqual(0.5)
    expect(colors[i * 3 + 1]).toBeCloseTo(128 / 255)
  }
})
it('returns no points when nothing is kept', () => {
  const { positions, colors } = samplePoints({ data: px(white, white), width: 2, height: 1 }, 50, isDust)
  expect(positions).toHaveLength(0)
  expect(colors).toHaveLength(0)
})
it('treats the 253–254 background of the stills as empty', () => {
  expect(isDust(253, 253, 253, 255)).toBe(false)
  expect(isDust(200, 240, 200, 255)).toBe(true)
})
```

- [ ] **Step 2: Run** `npm run test -- sampling` → FAIL
- [ ] **Step 3: Implement.** Collect the indexes of kept pixels, then draw `count` of them with replacement and jitter each point inside its pixel. `isDust`: the darkest channel is below 235.
- [ ] **Step 4: Run** `npm run test -- sampling` → PASS
- [ ] **Step 5: Commit** `feat: add pixel sampling for hero particles`

### Task 3: Count-up on viewport entry

**Files:**
- Create: `modules/public/home/useCountUp.ts`, `modules/public/home/useCountUp.test.tsx`
- Delete: `modules/public/home/useHomeIntro.ts`, `modules/public/home/useHomeIntro.test.tsx`
- Modify: `modules/public/home/HomePage.tsx`, `src/index.css` (remove `--motion-intro-step`), `brand-guidelines.md` (remove the `--motion-intro-step` row)

**Interfaces:**
- Produces: `export function useCountUp(rootRef: RefObject<HTMLElement | null>): void`

- [ ] **Step 1: Write the failing tests** in `useCountUp.test.tsx`

Mock `animejs` (`animate`, `createScope` whose `add` runs the callback and whose `revert` is a spy), following the mock shape of the deleted `useHomeIntro.test.tsx`. Add a helper `enterViewport()` that replaces `window.IntersectionObserver` with a class calling its callback with `[{ isIntersecting: true }]` inside `observe()`.

```ts
it('starts one count-up per number when the numbers enter the viewport', () => {
  stubMatchMedia(false); enterViewport(); renderRoute('/')
  expect(anime.animate).toHaveBeenCalledTimes(3)
})
it('waits until the numbers are in the viewport', () => {
  stubMatchMedia(false); renderRoute('/')        // setup.ts observer never fires
  expect(anime.animate).not.toHaveBeenCalled()
  expect(countValues()).toEqual(['8', '38', '10'])
})
it('does not animate when reduced motion is requested', () => {
  enterViewport(); renderRoute('/')
  expect(anime.animate).not.toHaveBeenCalled()
  expect(countValues()).toEqual(['8', '38', '10'])
})
it('keeps the exact values when the animation library throws', () => {
  stubMatchMedia(false); enterViewport()
  anime.createScope.mockImplementation(() => { throw new Error('boom') })
  renderRoute('/')
  expect(countValues()).toEqual(['8', '38', '10'])
})
it('reverts on unmount', () => {
  stubMatchMedia(false); enterViewport()
  renderRoute('/').unmount()
  expect(anime.revert).toHaveBeenCalledTimes(1)
})
```

- [ ] **Step 2: Run** `npm run test -- useCountUp` → FAIL
- [ ] **Step 3: Implement `useCountUp`.** A plain `IntersectionObserver` on the root, disconnected after the first intersection. Each `[data-count-to]` counts from 0 to its target in 800ms with `outExpo`, writing the rounded value on update and the exact target on complete. Wrapped in `createScope`, reverted on unmount, in a `try/catch`.
- [ ] **Step 4: Move the numbers in `HomePage.tsx`** out of the intro section into their own `<Reveal as="section" className="py-16 md:py-24">` placed after the hero, with the ref passed to `useCountUp` on an inner `div` (Motion owns the section, AnimeJS owns the spans). Remove `useHomeIntro` and the `intro-*` classes. The old title/subtitle/buttons block stays in place for now; Task 4 replaces it.
- [ ] **Step 5: Run** `npm run test` → PASS (all files)
- [ ] **Step 6: Commit** `feat: count up the Home numbers when they enter the viewport`

### Task 4: Static hero and mode switch

**Files:**
- Create: `hero/heroMode.ts`, `hero/heroMode.test.ts`, `hero/heroFrames.ts`, `hero/HeroCopy.tsx`, `hero/HomeHero.tsx`, `hero/HomeHero.test.tsx`
- Modify: `modules/public/home/HomePage.tsx`, `modules/public/Header.tsx`, `src/index.css`, `shared/texts.ts`, `test/media.ts`

**Interfaces:**
- Consumes: `HERO.minViewportHeight`, `HERO.track`
- Produces:

```ts
// heroMode.ts
export function heroMode(): 'static' | 'sequence' // static: reduced motion, or (max-height: 559px)
export function supportsWebGL(): boolean          // a throwaway canvas returns a 'webgl2' context
// heroFrames.ts
export const heroFrames: { large: string[]; small: string[] } // 120 and 60 URLs, sorted by file name (= frame order)
export const jadeStill: string                                // the large frame at the intact-jade hold (index 61, source frame 122)
// HeroCopy.tsx
export function HeroCopy(props: {
  nameRef?: Ref<HTMLSpanElement>
  styles?: { name?: MotionStyle; rest?: MotionStyle; subtitle?: MotionStyle; actions?: MotionStyle }
})
// HomeHero.tsx
export function HomeHero()
// test/media.ts
export function stubMatchMedia(matches: boolean | ((query: string) => boolean)): void
```

- `texts.home.scrollHint = 'Scroll'`.
- `:root { --header-height: 45px; }` (44px row + 1px border). `Header` gets `relative z-10 h-(--header-height)`, so the hero can sit under it and its links stay clickable.

- [ ] **Step 1: Write the failing tests**

`heroMode.test.ts`:

```ts
it('uses the sequence when motion is allowed and the viewport is tall enough', () => {
  stubMatchMedia(false); expect(heroMode()).toBe('sequence')
})
it('is static under reduced motion', () => { expect(heroMode()).toBe('static') })
it('is static on a short viewport', () => {
  stubMatchMedia((q) => q.includes('max-height')); expect(heroMode()).toBe('static')
})
```

`HomeHero.test.tsx` (reduced motion, the setup default; `getProjects` mocked to `[]`):

```ts
it('shows the full title as one heading with the name highlighted', () => {
  renderRoute('/')
  const h1 = screen.getByRole('heading', { level: 1, name: texts.home.title })
  expect(within(h1).getByText('Yintong Zhou.')).toHaveClass('text-accent')
})
it('shows subtitle and both actions', () => {
  renderRoute('/')
  expect(screen.getByText(texts.home.subtitle)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'See projects' })).toHaveAttribute('href', '/projects')
  expect(screen.getByRole('link', { name: 'Read my CV' })).toHaveAttribute('href', '/cv')
})
it('shows the still jade stone as a decorative image and no canvas', () => {
  renderRoute('/')
  const hero = document.querySelector('[data-hero="static"]')!
  expect(hero.querySelector('img')).toHaveAttribute('alt', '')
  expect(hero.querySelector('canvas')).toBeNull()
})
```

- [ ] **Step 2: Run** `npm run test -- hero` → FAIL
- [ ] **Step 3: Implement `heroMode.ts`, `heroFrames.ts`, the `stubMatchMedia` change and the `texts`/CSS/`Header` edits.** `heroFrames.ts` lists the generated frames with `import.meta.glob('../../../../assets/home-hero/seq/large/*.webp', { eager: true, query: '?url', import: 'default' })` (same for `small`), sorting the keys. Add a test that `heroFrames.large` has 120 entries and `heroFrames.small` 60.
- [ ] **Step 4: Implement `HeroCopy`.** One `h1.type-display` whose text content is exactly `texts.home.title`: a `motion.span` with `block whitespace-nowrap text-accent` holding the owner's name plus the full stop (`texts.owner.name + '.'`, checked with `startsWith`), then a `motion.span` with the rest. Then a `motion.p` subtitle and a `motion.div` with the two `ButtonLink`s. Text centred, block max width 70ch.
- [ ] **Step 5: Implement `HomeHero`.** `useState(heroMode)`, plus one effect that listens to `change` on the two media queries (reduced motion, `max-height: 559px`) and sets the mode again, so a phone rotated to landscape mid-page, or reduced motion switched on, lands on Static and the sequence unmounts and frees its resources. Static: `<section data-hero="static">`, full width, `bg-card`, the jade still (`jadeStill`, `alt=""`, fixed width and height so nothing shifts) above `HeroCopy`. An error boundary class in the same file renders the Static hero when its child throws. Sequence mode renders the Static hero too until Task 5.
- [ ] **Step 6: Use it in `HomePage`.** `HomeHero` goes above `Container` (the page becomes a fragment); delete the old title/subtitle/buttons block.
- [ ] **Step 7: Run** `npm run test` → PASS (existing `HomePage.test.tsx` included)
- [ ] **Step 8: Commit** `feat: add static Home hero and mode switch`

### Task 5: Frame canvas and scroll sequence

**Files:**
- Create: `hero/frameCanvas.ts`, `hero/frameCanvas.test.ts`, `hero/HeroSequence.tsx`, `hero/HeroSequence.test.tsx`
- Modify: `hero/HomeHero.tsx`

**Interfaces:**
- Consumes: `HERO`, `frameAt`, `layers`, `range`, `heroFrames`, `HeroCopy`
- Produces:

```ts
// frameCanvas.ts
export function nearestReady(index: number, ready: readonly boolean[]): number // -1 when none is ready
export type FrameCanvas = { draw(p: number): void; resize(): void; dispose(): void }
export function createFrameCanvas(
  canvas: HTMLCanvasElement,
  urls: readonly string[],
  track: readonly (readonly [number, number])[],
  events: {
    onFirstDraw: () => void // first frame painted: the LCP <img> can be hidden
    onReady: () => void     // a frame finished decoding: schedule a redraw at the current progress
    onNoFrames: () => void  // every load settled and none succeeded: give up on the sequence
  },
): FrameCanvas // throws when the 2D context is unavailable
// HeroSequence.tsx
export function HeroSequence(props: { onFail: () => void }) // onFail: HomeHero switches to Static
export function copyState(p: number, revealed: boolean): { interactive: boolean } // pointer events on the text
```

- DOM contract used by tests: `<section data-hero="sequence" data-revealed="false">`; the text wrapper carries `data-hero-copy`; two `<canvas aria-hidden="true">`, the first for frames (`data-layer="frames"`), the second for dust (`data-layer="dust"`).

- [ ] **Step 1: Write the failing tests**

`frameCanvas.test.ts`:

```ts
it('falls back to the nearest loaded frame', () => {
  expect(nearestReady(3, [true, false, false, false, false, true])).toBe(5)
  expect(nearestReady(1, [true, false, false, false, false, true])).toBe(0)
  expect(nearestReady(2, [false, false, true])).toBe(2)
  expect(nearestReady(0, [false, false])).toBe(-1)
})
```

Also in `frameCanvas.test.ts`, with a fake 2D context and a stubbed `Image` whose loads the test resolves or rejects by hand:

```ts
it('redraws at the same progress when the right frame arrives late', () => {
  // draw(p) with only frame 0 ready → drawImage(frame 0); resolve the frame for p → onReady fires;
  // draw(p) again → drawImage(that frame)
})
it('redraws after resize even when the frame and mix did not change', () => {
  // draw(p); resize(); draw(p) → drawImage called again
})
it('reports when every frame failed', () => {
  // reject every load → onNoFrames called once, onFirstDraw never
})
```

Write these three with real assertions; the comments describe the steps.

`HeroSequence.test.tsx`. In `beforeEach`: `stubMatchMedia(false)`; stub `HTMLCanvasElement.prototype.getContext` so `'2d'` returns an object of `vi.fn()` methods (`clearRect`, `drawImage`, `setTransform`) and anything else returns `null`; set `window.ResizeObserver` to a class that stores its callback; mock `getProjects` to `[]`; `vi.mock('./dust', () => ({ createDust: dust.createDust }))` with a hoisted spy.

```ts
const hero = () => document.querySelector<HTMLElement>('[data-hero]')!

it('keeps the real title in the document and hides both canvases from assistive tech', () => {
  renderRoute('/')
  expect(hero()).toHaveAttribute('data-hero', 'sequence')
  expect(screen.getByRole('heading', { level: 1, name: texts.home.title })).toBeInTheDocument()
  const canvases = hero().querySelectorAll('canvas')
  expect(canvases).toHaveLength(2)
  canvases.forEach((c) => expect(c).toHaveAttribute('aria-hidden', 'true'))
})
it('ignores clicks on the text while it is invisible', () => {
  renderRoute('/')
  expect(hero().querySelector<HTMLElement>('[data-hero-copy]')!.style.pointerEvents).toBe('none')
})
it('enables clicks only once the buttons are at least half visible', () => {
  expect(copyState(0.95, false).interactive).toBe(false) // buttons still invisible
  expect(copyState(HERO.interactive, false).interactive).toBe(true)
  expect(copyState(0, true).interactive).toBe(true)      // keyboard focus inside
})
it('switches to the static hero when the viewport becomes too short', () => {
  // stubMatchMedia that records the 'change' listeners; render; flip the max-height query to
  // matching and fire its listeners → data-hero becomes 'static'
})
it('shows the final state while keyboard focus is inside the hero text', () => {
  renderRoute('/')
  const link = screen.getByRole('link', { name: 'See projects' })
  act(() => link.focus())
  expect(hero()).toHaveAttribute('data-revealed', 'true')
  act(() => link.blur())
  expect(hero()).toHaveAttribute('data-revealed', 'false')
})
it('draws once on mount', async () => {
  renderRoute('/')
  const frames = hero().querySelector<HTMLElement>('canvas[data-layer="frames"]')!
  await waitFor(() => expect(frames.style.opacity).toBe('1')) // set by the draw function, not by the markup
})
it('falls back to the static hero when no frame can be loaded', async () => {
  // stub Image so every load fails → data-hero becomes 'static', full title visible
})
it('falls back to the static hero when the 2D canvas is unavailable', () => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as never
  vi.spyOn(console, 'error').mockImplementation(() => {})
  renderRoute('/')
  expect(hero()).toHaveAttribute('data-hero', 'static')
  expect(screen.getByRole('heading', { level: 1, name: texts.home.title })).toBeInTheDocument()
})
it('does not load the particle layer when WebGL is missing', async () => {
  renderRoute('/')
  await new Promise((r) => setTimeout(r, 0))
  expect(dust.createDust).not.toHaveBeenCalled()
})
```

- [ ] **Step 2: Run** `npm run test -- hero` → FAIL
- [ ] **Step 3: Implement `frameCanvas.ts`.** Backing store = CSS size × `min(devicePixelRatio, 2)`. Frames load in list order with at most 6 requests in flight (the first frame is already the LCP `<img>`); each is marked ready after `decode()` (or `onload` where `decode` is missing); a failed frame stays not ready. Each successful decode calls `onReady`; when every load has settled and none succeeded, `onNoFrames` fires once. `draw(p)` takes `frameAt(p, urls.length, track)`, maps both indexes through `nearestReady`, draws `a` opaque and, when `b` differs and `mix > 0`, `b` with `globalAlpha = mix`; it does nothing when no frame is ready, and skips the draw when `a`, `b` and `mix` (rounded to 1/32) are unchanged since the last draw and no new frame became ready. `resize()` resets the backing store and clears that cache, so the next `draw` always paints. `onFirstDraw` fires once. `dispose` stops pending loads (clears `src`), drops the image references and silences all events.
- [ ] **Step 4: Implement `HeroSequence.tsx`.**

Layout: `<section class="relative h-[400svh] bg-card -mt-(--header-height)">` with a `sticky top-0 h-svh overflow-hidden` stage. Inside the stage, centred on one axis: a square frame box (`min(80vw, 60svh, 640px)`) holding the eager `<img>` of the first frame of the active list (`fetchpriority="high"`, `alt=""`, hidden after `onFirstDraw`) and the frames canvas, both under a radial CSS mask that feathers the edge to transparent; the dust canvas covering the whole stage; `HeroCopy`; the scroll hint (`aria-hidden`, `texts.home.scrollHint` in `type-label` with a Lucide `ChevronDown` 20px) at the bottom.

Wiring:

```tsx
const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
const progress = useSpring(scrollYProgress, HERO.spring)
useMotionValueEvent(progress, 'change', schedule) // schedule = one pending requestAnimationFrame
```

Restored scroll: the spring must not replay the sequence from 0 when the page opens already scrolled (reload, back navigation). The first `change` of `scrollYProgress` after mount calls `progress.jump(value)` instead of letting the spring animate; later changes go through the spring as usual. The image `onError` of the LCP `<img>` is ignored on its own: `onNoFrames` covers the case where nothing can be shown.

The frame canvas gets `heroFrames.small` under `(max-width: 767px)`, else `heroFrames.large` (chosen once on mount), with `HERO.track`. Frame loading starts after the first paint, so it never competes with the LCP image.

The draw function reads `progress.get()`, calls `frames.draw(p)`, and sets the opacity of the two canvases from `layers(p, hasDust)`. `schedule` is the only way to draw. An `IntersectionObserver` on the section keeps a `visible` flag (true until the observer reports otherwise, so the first draw happens in jsdom too). While the hero is off screen, `schedule` only marks the hero dirty: no `drawImage`, no `dust.render`. When the hero enters the viewport and it is dirty, one draw paints the current state. So: one draw on mount, then only on change, never off screen. `hasDust` is `false` in this task. Add a test: with the observer reporting the section out of view, a late `onReady` does not call `drawImage`; reporting it in view then draws once.

Text: `HeroCopy` styles come from `useTransform(progress, …)` with `HERO.settle` for the name and `HERO.copy.*` for the others (opacity 0→1; `y` 12→0 for rest, subtitle, actions). The wrapper's `pointerEvents` comes from `copyState(p, revealed)`: interactive when `revealed` or `p ≥ HERO.interactive`. `HERO.interactive` is 0.98 (the middle of `copy.actions`, where the buttons are half visible), so a click never follows a link that cannot be seen. The draw function sets it, so it changes without a React render. The hint's opacity goes 1→0 over `[0, HERO.hintEnd]`.

Focus: `onFocus`/`onBlur` on the wrapper toggle `data-revealed`; while it is `"true"` the text is fully visible with pointer events on, and the frame box and dust canvas are hidden.

Resize: one `ResizeObserver` on the stage sets a flag and calls `schedule`; the next draw calls `frames.resize()` first.

Load failure: `onReady` calls `schedule`; `onNoFrames` calls `onFail`, and `HomeHero` switches to Static. Anything that changes what is on screen without a scroll also calls `schedule`: a frame ready, a resize, the particle layer created or lost, and its `layout()` after `document.fonts.ready`.

Cleanup: each effect run owns a `disposed` flag. Cleanup sets it and disposes the frame canvas, the observer and any pending frame. Every async callback checks the flag first (StrictMode runs effects twice in development).

- [ ] **Step 5: Render `HeroSequence` from `HomeHero`** in sequence mode, inside the error boundary. `useCountUp.test.tsx` renders the Home with motion allowed: add `vi.mock('./hero/HomeHero', () => ({ HomeHero: () => null }))` there, so it stays about the numbers and does not hit the missing canvas of jsdom.
- [ ] **Step 6: Run** `npm run test` → PASS
- [ ] **Step 7: Commit** `feat: add scroll-driven frame sequence to the Home hero`

### Task 6: Dust particles

**Files:**
- Create: `hero/dust.ts`
- Modify: `hero/HeroSequence.tsx`, `hero/HeroSequence.test.tsx`

**Interfaces:**
- Consumes: `samplePoints`, `isDust`, `isInk`, `supportsWebGL`, `heroFrames` (the last frame of the active list is the dust image), `HERO.particles`
- Produces:

```ts
export type Dust = { render(travel: number, opacity: number): void; layout(): void; dispose(): void }
export function createDust(o: {
  canvas: HTMLCanvasElement
  stage: HTMLElement
  frameBox: HTMLElement   // where the dust image sits
  target: HTMLElement     // the name span
  imageUrl: string        // last frame of the active list (the final dust cloud)
  count: number
  onLost: () => void      // WebGL context lost
}): Promise<Dust | null>  // null: no context, image failed, or no points sampled
```

- [ ] **Step 1: Add the failing tests** to `HeroSequence.test.tsx`

```ts
const webgl = () => {
  HTMLCanvasElement.prototype.getContext = vi.fn((kind: string) => (kind === '2d' ? ctx2d : {})) as never
}
it('creates the particle layer when WebGL is available', async () => {
  webgl(); dust.createDust.mockResolvedValue(fakeDust)
  renderRoute('/')
  await waitFor(() => expect(dust.createDust).toHaveBeenCalledTimes(1))
})
it('re-measures the particles on resize', async () => {
  webgl(); dust.createDust.mockResolvedValue(fakeDust)
  renderRoute('/')
  await waitFor(() => expect(fakeDust.render).toHaveBeenCalled())
  act(() => resizeObserverCallback())
  await waitFor(() => expect(fakeDust.layout).toHaveBeenCalled())
})
it('carries on without particles when the layer cannot be created', async () => {
  webgl(); dust.createDust.mockResolvedValue(null)
  renderRoute('/')
  await waitFor(() => expect(dust.createDust).toHaveBeenCalled())
  expect(hero()).toHaveAttribute('data-hero', 'sequence')
})
it('drops the particles when the WebGL context is lost', async () => {
  webgl(); dust.createDust.mockResolvedValue(fakeDust)
  renderRoute('/')
  await waitFor(() => expect(dust.createDust).toHaveBeenCalled())
  act(() => dust.createDust.mock.calls[0][0].onLost())
  expect(fakeDust.dispose).toHaveBeenCalledTimes(1)
  // without any scroll, the next frame redraws without dust: the frames canvas is visible again
  await waitFor(() => expect(hero().querySelector<HTMLElement>('canvas[data-layer="frames"]')!.style.opacity).not.toBe('0'))
  expect(hero()).toHaveAttribute('data-hero', 'sequence')
})
```

`fakeDust` is `{ render: vi.fn(), layout: vi.fn(), dispose: vi.fn() }`.

- [ ] **Step 2: Run** `npm run test -- HeroSequence` → FAIL
- [ ] **Step 3: Implement `dust.ts`** with named imports from `three`.

`layout()` measures the stage, the frame box and the target (`getBoundingClientRect`, relative to the stage) and rebuilds the attributes:
- start points: the dust image drawn on a 256×256 offscreen 2D canvas, `samplePoints(…, isDust)`, mapped into the frame box;
- target points: the target's `textContent` drawn on an offscreen 2D canvas with the target's computed `font` and `letterSpacing`, `samplePoints(…, isInk)`, mapped into the target's box. If either returns no points, `layout` keeps the previous attributes, or `createDust` resolves `null` on the first call.

Scene: an orthographic camera in stage pixels, one `Points` with `frustumCulled = false`, a `ShaderMaterial` (transparent, no depth test). Renderer: `alpha: true`, `antialias: false`, pixel ratio `min(devicePixelRatio, 2)`. `render` sets the two uniforms and renders once; there is no loop. The accent comes from `getComputedStyle(document.documentElement).getPropertyValue('--color-accent')`. `webglcontextlost` calls `onLost`. `dispose` frees geometry, material and renderer.

Shaders:

```glsl
// vertex
attribute vec2 aTarget; attribute vec3 aColor; attribute float aSeed;
uniform float uTravel; uniform float uSize; uniform float uSwirl; uniform vec3 uAccent;
varying vec3 vColor;
void main() {
  float t = clamp((uTravel - aSeed * 0.35) / 0.65, 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t);
  vec2 p = mix(position.xy, aTarget, t);
  float angle = aSeed * 6.2832 + t * 4.0;
  p += vec2(cos(angle), sin(angle)) * sin(t * 3.14159) * uSwirl; // zero at both ends
  vColor = mix(aColor, uAccent, t);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 0.0, 1.0);
  gl_PointSize = uSize;
}
// fragment
uniform float uOpacity; varying vec3 vColor;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  gl_FragColor = vec4(vColor, uOpacity * (1.0 - smoothstep(0.2, 0.5, d))); // edge0 < edge1, portable
}
```

Starting values: `uSize` 2 × pixel ratio, `uSwirl` 12% of the frame box side.

- [ ] **Step 4: Wire it into `HeroSequence`.** After mount, if `supportsWebGL()`, `import('./dust')` and call `createDust` with `HERO.particles.small` under `(max-width: 767px)`, else `.large`. When it resolves with a layer, `hasDust` becomes true, `layout()` is called again after `document.fonts?.ready`, and the draw function calls `dust.render(l.travel, l.dust)`. The resize flag also triggers `dust.layout()`. `onLost` and a `null` result leave `hasDust` false. A rejected import is caught and treated as `null`. The effect's `disposed` flag guards every step: a layer that resolves after cleanup is disposed at once, the `document.fonts.ready` callback does nothing after cleanup, and cleanup disposes the live layer. Add a test: unmount before `createDust` resolves → the resolved `fakeDust.dispose` is called once and `render` never.
- [ ] **Step 5: Run** `npm run test` → PASS
- [ ] **Step 6: Check the bundle.** `npm run build`, then `grep -l WebGLRenderer dist/assets/*.js` → exactly one file, and it is not the `index-*.js` entry.
- [ ] **Step 7: Commit** `feat: form the name from dust particles with three.js`

### Task 7: Browser check, guideline update, stop

**Files:**
- Modify: `brand-guidelines.md`

- [ ] **Step 1: Run the app** (`npm run dev`) and capture the hero at progress 0, 0.3, 0.5, 0.7, 0.87 and 1, at 1440px and 375px wide. Check against the spec's sketch: only the rock at the start, hint visible above the fold, rock in the centre, name in jade green where the rock was, no straight image edge where shell fragments leave the frame (source frames ~48–100) or in the dust stages, header links clickable. In the Network panel the first image requested is `f_000`, and nothing shifts while images and fonts load. Note the total hero image weight per viewport size in the report.
- [ ] **Step 2: Check the cases from Review Focus by hand:** reload while scrolled below the hero then scroll up; resize the window at progress 0.9; a 667×375 viewport shows the Static hero; "reduce motion" in the OS shows the Static hero.
- [ ] **Step 3: Tune** the values in `HERO` and the two uniforms if a stage reads badly. Change numbers only.
- [ ] **Step 4: Update `brand-guidelines.md`, section "Motion":** hero text takes no pointer events until visible and shows its final state on keyboard focus (exception to "links and buttons work from the first frame"); Static mode also applies under 560px of viewport height.
- [ ] **Step 5: Run** `npm run lint`, `npm run build`, `npm run test` → all pass. Commit `docs: record hero interaction rules`.
- [ ] **Step 6: STOP.** Report to the owner what to try (`npm run dev` in `frontend/`, with a mouse wheel and on their phone) and what was not measured: the 4× CPU-throttled DevTools run and the feel on a real phone. Wait for their go-ahead.

---

## Part 2: scroll animation on every public page

### Task 8: Page progress line

**Files:**
- Create: `shared/components/ScrollProgress.tsx`, `shared/components/ScrollProgress.test.tsx`
- Modify: `modules/public/PublicLayout.tsx`

**Interfaces:**
- Produces: `export function ScrollProgress()` (renders nothing under reduced motion)

- [ ] **Step 1: Write the failing tests**

```ts
it('draws a decorative progress line when motion is allowed', () => {
  stubMatchMedia(false); renderRoute('/about')
  const line = document.querySelector('[data-scroll-progress]')!
  expect(line).toHaveAttribute('aria-hidden', 'true')
  expect(line).toHaveClass('fixed', 'bg-accent')
})
it('draws nothing under reduced motion', () => {
  renderRoute('/about')
  expect(document.querySelector('[data-scroll-progress]')).toBeNull()
})
```

- [ ] **Step 2: Run** `npm run test -- ScrollProgress` → FAIL
- [ ] **Step 3: Implement.** A `motion.div` with `fixed inset-x-0 top-0 z-20 h-0.5 origin-left bg-accent`, `style={{ scaleX: progress }}`, where `progress` is a `useMotionValue(0)`. The scrollable distance `max = scrollHeight − innerHeight` is measured and stored on mount, in a `ResizeObserver` on `document.body` (guarded: jsdom has none) and on `window` `resize`; each measurement also updates `progress` and the visibility at once. A passive `scroll` listener on `window` reads only `scrollY` and sets `progress = clamp(scrollY / max)`, with no layout read. The line is hidden (`opacity 0`) while `max ≤ 0`. All listeners and the observer are removed on unmount. Add a test: change only `innerHeight` and fire `resize` → `progress` updates. Measuring it here instead of with `useScroll` keeps progress and visibility right when the layout persists across routes and content arrives after a query. Returns `null` when `prefersReducedMotion()`. Rendered first in `PublicLayout`.
- [ ] **Step 4: Run** `npm run test` → PASS
- [ ] **Step 5: Check in the browser** that `/about` at 1440px, which does not scroll, shows no line; then navigate `/about` → a long project page inside the app without scrolling: the line appears near 0, not full. Load `/cv` and check the same once the data arrives.
- [ ] **Step 6: Commit** `feat: add page scroll progress line`

### Task 9: Reveals on the remaining pages, CV timeline fill, stop

**Files:**
- Modify: `modules/public/projects/ProjectPage.tsx`, `modules/public/about/AboutPage.tsx`, `modules/public/cv/CvPage.tsx`, their test files, `brand-guidelines.md`, `PROJECT.md`

- [ ] **Step 1: Write the failing tests**

`ProjectPage.test.tsx` and `PublicLayout.test.tsx` (About), with `stubMatchMedia(false)`:

```ts
it('lets the project description enter on scroll', async () => {
  // render a project with the `full` fixture
  expect((await screen.findByText(full.description)).parentElement!.style.opacity).toBe('0')
  expect(screen.getByRole('heading', { level: 1 }).style.opacity).not.toBe('0') // the title is never hidden
})
it('lets the About paragraph enter on scroll', () => {
  renderRoute('/about')
  expect(screen.getByText(/I'm a fullstack software developer/).parentElement!.style.opacity).toBe('0')
})
```

`CvPage.test.tsx`:

```ts
it('fills the timeline line as the visitor scrolls, when motion is allowed', async () => {
  stubMatchMedia(false) // then render /cv with experiences
  await screen.findAllByRole('listitem') // the timeline renders after the query resolves
  const fill = await waitFor(() => {
    const el = document.querySelector('[data-timeline-fill]')
    expect(el).not.toBeNull()
    return el!
  })
  expect(fill).toHaveAttribute('aria-hidden', 'true')
})
it('has no timeline fill under reduced motion', async () => {
  // render /cv with experiences, wait for the first role
  expect(document.querySelector('[data-timeline-fill]')).toBeNull()
})
```

- [ ] **Step 2: Run** `npm run test` → FAIL (the four new tests)
- [ ] **Step 3: `ProjectPage`:** wrap the cover, the description, the tag list and the links block each in `Reveal`. The back link, title and summary stay as they are.
- [ ] **Step 4: `AboutPage`:** wrap the paragraph in `Reveal`.
- [ ] **Step 5: `CvPage`:** extract the experience list into an `ExperienceTimeline` component in the same file. Each `li` becomes `Reveal as="li" distance={12}`. The `ol` becomes `relative` and, when motion is allowed, gets a `motion.span` with `data-timeline-fill`, `aria-hidden`, `absolute -left-px top-0 h-full w-px origin-top bg-foreground`, and `scaleY` from `useScroll({ target: olRef, offset: ['start center', 'end center'] }).scrollYProgress`.
- [ ] **Step 6: Run** `npm run test` → PASS
- [ ] **Step 7: Update the documents.** `brand-guidelines.md`, "Motion": add the progress line and the CV timeline fill to the tool table and to the rule on scroll-linked scrubbing. `PROJECT.md`, phase 5: every public page has scroll animation. Do not touch "Status".
- [ ] **Step 8: Check in the browser** `/projects`, one project, `/cv`, `/about` at 1440px and 375px: blocks enter once, the timeline fills, no horizontal scroll.
- [ ] **Step 9: Run** `npm run lint`, `npm run build`, `npm run test` → all pass. Commit `feat: add scroll animation to projects, CV and About`.
- [ ] **Step 10: STOP.** Report to the owner, and propose the text for the "Status" section of `PROJECT.md`. Write it only after they agree.
