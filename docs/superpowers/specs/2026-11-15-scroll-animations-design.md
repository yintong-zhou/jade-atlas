# Scroll animations: Home hero sequence and public pages

**Latest owner revision, 2026-11-15:** the single stone sequence is superseded by `../plans/2026-11-15-jade-sky-hero.md`: a jade sky drawn into a lower-center vortex, followed by individual name glyphs launching, falling and bouncing into place. Public navigation is centered without logo or divider. This direct instruction authorizes the hero-specific bounce and rotation.

**2026-11-15 owner revision:** the frame-sequence implementation and the restriction against a real-time stone model below are superseded by the owner's request for a Three.js model. See `../plans/2026-11-15-threejs-hero.md`. The scroll choreography, accessibility and other public-page goals remain applicable.

Design for the builder. Read with `PROJECT.md`, `brand-guidelines.md` (section "Motion"), `PROFILE.md` and `AGENTS.md`. Where this document and `brand-guidelines.md` disagree, this document wins and the guidelines get updated (see "Documents to update").

Lines marked **(call)** are choices made by the designer, not by the owner. The owner can change them when approving.

## Intent

The project is called `jade-atlas`, and the Home should tell that in one gesture: an ordinary grey rock opens, turns out to be jade, dissolves into dust, and the dust writes the owner's name. The visitor drives it with the scroll. The rest of the site stays minimal, so the sequence is the only loud thing on it.

The owner also wants every public page to respond to scrolling, and wants the result to feel smooth above everything else.

## Goals

- The Home opens on a white screen that shows only the grey rock.
- Scrolling plays the sequence rock → cracked rock → jade → dissolving jade → dust → the highlighted part of the title.
- Smooth on a mid-range phone and with a stepped mouse wheel.
- Every public page has scroll animation.
- The sequence can start today on the 5 still images and get smoother later, when the owner provides video clips, without code changes.

## Non-goals

- No real-time 3D model of the rock. three.js draws only the dust particles.
- No scroll hijacking and no smooth-scroll library. The scroll stays native.
- No route transitions, no GSAP, no React Three Fiber, no post-processing.
- No change to the private area, the API or the data model.

## Anti-goals

The work has failed, even if it runs, when any of these happens:

- the scroll stutters or the phone heats up in the hero;
- the Home is blank or broken when WebGL is missing, an image fails or reduced motion is on;
- the title is not real text in the HTML;
- the layout shifts while images or fonts load;
- three.js lands in the initial bundle or loads on pages other than the Home.

## Constraints

- Stack: React 19, Vite 8, TypeScript, Tailwind 4, Motion 14 (`motion/react`), AnimeJS 4.5. `useScroll`, `useSpring`, `useTransform`, `useMotionValueEvent` (Motion) and `onScroll` (AnimeJS) exist in the installed versions.
- New dependency: `three` (0.187 at the time of writing). Nothing else.
- Only semantic colour tokens. The accent is read from `--color-accent`, never written as hex.
- Copy comes verbatim from `PROFILE.md` through `src/shared/texts.ts`.
- One element is animated by one tool only.
- Tests run in jsdom, which has no canvas and no WebGL, and default to reduced motion (`src/test/setup.ts`).

## Approaches

| | A. Five stills | B. Frame sequence | C. Real-time 3D |
|---|---|---|---|
| How | Cross-fade between the 5 images, real particles at the end | About 100–120 pre-rendered frames scrubbed by the scroll, real particles at the end | three.js renders rock, fragments and jade models live |
| Needs | Nothing more | 4 short video clips from the owner | 3D models, fracture work, shaders |
| Smoothness | High, but the change is a dissolve | High and the change is a real transformation | Depends on the visitor's GPU |
| Cost | Lowest | Low: same code as A | Highest |

**Picked by the owner: B.** A and B share the same code, because the frame canvas always draws the two frames nearest to the scroll position and blends them. With 5 frames that is a cross-fade; with 120 it is a film. So the build starts on the 5 stills and the frames are swapped in when the clips arrive. C was rejected: the sequence is not interactive, so live 3D would cost more GPU, more work and a worse-looking jade for no visible gain.

The owner then asked to use three.js as well. **(call)** It draws the dust particles, which is the part where the GPU pays off: many thousands of points moved in the vertex shader, with no per-particle work in JavaScript.

## Part 1: Home hero sequence

### What the visitor sees

```
 scroll 0%            30%              50%              70%             85%            100%
 ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────────────┐
 │          │    │          │    │          │    │   · ·    │    │  ·  · ·  │    │  Yintong Zhou.   │ ← jade green
 │   rock   │ →  │ cracked  │ →  │   jade   │ →  │ jade+dust│ →  │ · dust · │ →  │ Fullstack .NET … │
 │          │    │          │    │          │    │   · ·    │    │  · ·  ·  │    │ subtitle         │
 │  scroll ↓│    │          │    │          │    │          │    │          │    │ [projects] [CV]  │
 └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────────────┘
```

- Everything sits on one vertical axis, centred. The rock is in the middle of the screen; the name forms where the rock was. **(call)** Centred, because the stone becoming the name in place needs no travel across the screen and works the same on a phone.
- The dust forms the owner's name at the start of the title ("Yintong Zhou."), in the accent colour. **(call)** Proposed to the owner and not contradicted. The rest of the title, the subtitle and the two buttons fade in under it once the dust has settled.
- The header is visible on the first screen and scrolls away with the page, as it does today on every page. It is not pinned. **(call)** The owner asked for a screen with only the rock, and a pinned header would be a site-wide change nobody asked for.
- The first screen is exactly the stage: the rock is in the true centre of the viewport and the scroll hint is above the fold. To get that, the hero starts under the header (the header overlays the top of the stage; both are white). How that is done in CSS is left to the builder; `Header` and `PublicLayout` keep working unchanged on the other pages.
- A small "Scroll" hint with a chevron sits at the bottom of the first screen and fades out as soon as the visitor scrolls. **(call)** A page that shows only a rock gives no reason to scroll. The label goes in `texts.ts`.
- Scrolling back up plays the sequence backwards.
- After the hero, the page continues as today: the three numbers, the projects preview, the contact section.

### Structure

```
<section>                      full width, white (bg-card), tall: about 400svh  ← scroll distance
  <div sticky stage>           top: 0, height: 100svh, overflow hidden
    <img rock 1>               normal image, eager, the LCP element, alt=""
    <canvas frames>            2D, aria-hidden
    <canvas particles>         three.js, aria-hidden
    <h1> name + rest of title  real text, verbatim title
    <p> subtitle, buttons
    scroll hint
  </div>
</section>
```

The hero leaves `Container` to be full width; its text block keeps the container's max width and side padding.

The h1 keeps the exact title as its text content. The highlight is the owner's name at the start of it, wrapped in a span. How the string is split is left to the builder, as long as `texts.home.title` stays verbatim.

### Two modes

The hero renders in one of two modes, chosen at the first render so nothing flashes.

| Mode | When | What it shows |
|---|---|---|
| Sequence | Motion allowed | The tall section above. The script hides the text at the start. |
| Static | Reduced motion, or any failure while setting up the sequence | One screen tall. The still jade stone (image 3) above the complete title, subtitle and buttons. No canvas, no three.js. |

Static is the default markup; Sequence is an upgrade applied by the script. A failed setup falls back to Static instead of leaving a half-built hero.

### Text and buttons before they appear

In Sequence mode the title, subtitle and buttons are in the HTML but invisible until the end, and they sit over the rock. **(call)**

- They take no pointer events until they are visible, so a click on the rock never follows a hidden link.
- They stay readable by screen readers the whole time: no `inert`, no `visibility: hidden`.
- When keyboard focus enters the hero text, the hero shows its final state (text visible, canvases hidden) for as long as the focus stays there, whatever the scroll position. The page is not scrolled for the user, and the focused button and its ring are always visible.

### Scroll timeline

Progress `p` goes from 0 to 1 over the scroll distance of the section. Values are a starting point, kept in one config object so the owner can tune them by eye.

| p | What happens |
|---|---|
| 0.00 – 0.08 | Rock holds. The scroll hint fades out by 0.05. |
| 0.08 – 0.28 | Rock → cracked rock |
| 0.28 – 0.48 | Cracked rock → jade |
| 0.48 – 0.52 | Jade holds |
| 0.52 – 0.68 | Jade → dissolving jade |
| 0.68 – 0.80 | Dissolving jade → dust |
| 0.78 – 0.82 | Frame layer fades out, particle layer fades in at the same positions |
| 0.80 – 0.94 | Particles travel to the name and take the accent colour |
| 0.94 – 1.00 | Particle name cross-fades to the real text. Rest of title, subtitle and buttons fade in (opacity, 12px rise). |

### Scroll wiring

- Motion gives the progress: `useScroll({ target: section, offset: ["start start", "end end"] })`.
- The raw progress is passed through `useSpring` (critically damped, short) before anything reads it. This is what makes a stepped mouse wheel look fluid. Spring values are left to the builder.
- One listener on the smoothed value schedules one `requestAnimationFrame` draw. Nothing draws when the value does not change, so the hero costs nothing at rest.
- The text elements are Motion elements whose opacity and y come from the same progress with `useTransform`.
- Drawing stops when the hero is out of the viewport.

### Frame layer

- A 2D canvas, square, centred. Backing store scaled by `min(devicePixelRatio, 2)`.
- Input: an ordered list of frame URLs plus the progress range they cover (0.08 – 0.80). At any progress the canvas draws the two neighbouring frames, the second with the blend factor as alpha.
- Today the list has the 5 stills, placed at the keyframes of the timeline. Files: `frontend/src/assets/home-hero/rock-{1..5}-{1024,640}.webp` (already converted). Use 640 on small screens, 1024 otherwise.
- Loading: image 1 is the plain `<img>`. The other frames load in the order the scroll will need them and are decoded before use. If a frame is not ready, the nearest ready frame is drawn.
- The images have a near-white background (253–254, not 255), invisible on the white hero. In images 4 and 5 the dust is cut by the image border and would leave a faint straight edge, so the edges of the frame canvas are feathered to white.

### Particle layer

- `three` is loaded with a dynamic `import()` after the first paint, only in Sequence mode. Plain three.js, driven from a hook; one `Points` object, one draw call.
- **Start positions and colours:** sampled from the dust image (image 5) on a small offscreen 2D canvas, taking the pixels clearly darker or more saturated than the near-white background.
- **Target positions:** the highlighted name is drawn on an offscreen 2D canvas with the font, size and position measured from the real span, then its filled pixels are sampled. Measured after `document.fonts.ready` and again on resize (debounced), never during scroll.
- **Movement:** computed in the vertex shader from one uniform (the progress): each particle goes from start to target with its own small delay and a swirl that is zero at both ends. JavaScript updates one number per frame.
- **Colour:** from the sampled dust colour to the accent as the particle arrives.
- **Budget (call):** about 18,000 particles on desktop, 8,000 on small screens; pixel ratio capped at 2; no antialias; render on demand, no continuous loop.
- **Failure:** if WebGL is unavailable, the context is lost or the chunk fails to load, the particle layer is skipped and the frame layer cross-fades straight to the real text. No second particle implementation.
- Everything is disposed on unmount.

### The three numbers

They sit below the hero now, so the count-up starts when the numbers block enters the viewport, once, instead of on page load. It stays on AnimeJS and still ends on the exact values. `useHomeIntro` is replaced by this; the timed title/subtitle/buttons introduction is removed.

### Frames from video clips (later, when the owner has them)

- The owner generates 4 clips with an image-to-video tool, each using one still as first frame and the next as last frame: `1-2`, `2-3`, `3-4`, `4-5`. Requirements: pure white background, same framing and scale as the stills, 1–2 seconds, 24–30 fps, at least 720px square, no watermark.
- The clips go in `.tmp/hero-clips/`. A script in `execution/` extracts the frames, resizes them and writes WebP into `frontend/src/assets/home-hero/`. Target: about 120 frames at 720px for desktop and 60 frames at 480px for small screens, to keep decoded images within memory on phones. `ffmpeg` is not installed on the owner's machine: the builder picks how to get it and asks before installing anything system-wide.
- The frame list is then built from those files. No component changes.
- Honest limit on the "3D look": because each clip starts and ends on a fixed still, the tool can add depth (light moving, fragments flying, a slight turn) but a full rotation is not guaranteed. The code does not depend on it.

## Part 2: scroll animation on every public page

**(call)** The whole of this part is the designer's proposal for "every public page is animated on scroll". It keeps the other pages quiet so the hero stays the centrepiece.

| Where | What |
|---|---|
| Every public page | A 2px line fixed at the top of the viewport, in the accent colour, that grows from left to right with the page scroll (Motion, `scaleX`). Hidden when the page does not scroll and under reduced motion. `aria-hidden`. |
| Every public page | Blocks below the page title enter with the existing `Reveal` (opacity, 24px rise, once). The page title itself is never hidden. |
| Home | Numbers block: `Reveal` plus the count-up. Projects preview and contact: `Reveal`, as today. |
| Projects list | Cards staggered by 40ms, as today. |
| Project detail | Cover, description, technologies and links each enter with `Reveal`. New. |
| CV | Sections enter with `Reveal`, as today. New: each experience enters with a 12px rise, and a second line in the foreground colour fills the timeline line from top to bottom as the visitor scrolls through it (Motion, `scaleY`). |
| About | The paragraph enters with `Reveal`. The page is one paragraph and usually fits one screen, so there is nothing more to link to the scroll. |
| Not found, footer | Nothing. |

three.js is not used outside the Home.

## Performance: how "smooth" is checked

- Chrome DevTools, Performance panel, CPU throttled 4×, scrolling through the whole hero: no task longer than 50ms, no visible dropped frames.
- The LCP element of the Home is image 1. Layout shift is 0.
- `three` is in its own chunk, requested only on the Home in Sequence mode.
- The final judgement on feel is the owner's, on their own phone and with a mouse wheel, with `npm run dev`.

## Tests

- Static mode (the jsdom default): the h1 has the verbatim title, subtitle and both buttons are present, the jade image has an empty `alt`, the three numbers show their exact values.
- Sequence mode (`stubMatchMedia(false)`): the title is still in the document, the canvases are `aria-hidden`, and three.js is not imported when WebGL is missing.
- Pure functions get unit tests: progress → the two frame indexes and blend factor; progress → the phase values of the timeline.
- Existing tests for `useHomeIntro` are replaced by tests for the count-up on viewport entry.
- Verification commands from `AGENTS.md`: `npm run lint`, `npm run build`, `npm run test`.

## Order of work

1. Hero on the 5 stills, with the particle finale. Stop: the owner tries it.
2. Scroll animation on the other public pages. Stop: the owner tries it.
3. Frame sequence, when the owner provides the clips.

## Documents to update

Already updated on the owner's instruction: `PROJECT.md` (Home scope, phase 5, three.js in the stack) and `brand-guidelines.md` (hero sequence, exceptions, three.js in the tool table).

To update when this design is approved: in `brand-guidelines.md`, the progress line and the CV timeline fill as allowed scroll-linked elements, the behaviour of the hero buttons before they appear (an exception to "links and buttons work from the first frame"), and the removal of the unused `--motion-intro-step` token; in `PROJECT.md`, phase 5 saying that every public page has scroll animation.

## Left to the builder

File and hook names, spring values, shader details, the sampling resolution, the exact stage and text sizes inside the type scale, how the title string is split for the highlight, how the frame list is assembled (`import.meta.glob` or other), and how `ffmpeg` is obtained for the extraction script.
