# Green black hole hero

## Owner correction: original project and 3D orbit

The owner rejected the simplified fixed-camera appearance and supplied the original demo image. Copy the complete upstream project, reuse its simulation, defaults, perspective camera, OrbitControls and bloom. Adapt only the green/white palette, size and existing scroll choreography. Mouse dragging rotates the view in 3D; wheel and vertical touch gestures retain native page scrolling. Run the live disk while visible, pause offscreen/when hidden, and stop after collapse. Preserve reduced-motion/static fallbacks and clean up controls, post-processing and GPU resources. Validate camera rotation and live-loop suspension with regressions and browser inspection.

- [ ] Copy upstream source with its MIT license; restore defaults and live 3D camera/bloom.
- [ ] Enable drag rotation and live rendering with native page scroll and complete cleanup.
- [ ] Run all required checks and inspect orbit, visual fidelity, collapse and mobile behavior.

**Goal:** Apply the owner's revised scroll choreography to the existing Home hero.

**Design:** Keep the white surface, IBM Plex Sans and jade accent. Replace stones with luminous green stars. Center Daniel Greenheck's raymarched black hole at roughly half the viewport width, with a green accretion disk and white escaped-ray background. Scrolling absorbs every star, then collapses the hole to zero, then releases one green pulse and the whole name glyphs. Reveal the HTML role, subtitle and actions afterwards. All phases reverse deterministically with scroll.

**Architecture:** Reuse the existing on-demand WebGL star/glyph canvas and accessible HTML. Render the supplied TSL shader on a second decorative canvas using Three.js WebGPURenderer (its WebGL backend remains available). Vendor the shader with MIT attribution; do not add a service or dependency. Bound its rendering resolution for mobile. Initialization failures retain the complete static hero.

**Scope:** Existing feature branch and uncommitted work remain intact. No backend, database, production, PROJECT.md status or historical handoff changes.

- [x] Update timeline regression tests first: stars finish before collapse; collapse finishes before name; pulse is bounded and reversible.
- [x] Implement stars, centered shader integration, green pulse and revised glyph paths; test resource cleanup and late initialization.
- [x] Run frontend lint/build/test and backend build/test. Inspect desktop/mobile, reverse scroll and static fallback in Orca; keyboard behavior covered by the integration suite.

**Review focus:** Async unmount and lost contexts; white edges on the shader layer; small portrait dimensions and short landscape fallback; exact glyph/HTML crossfade; GPU cost on real phones remains unverified.

## Results

- Frontend lint/build pass; 88 tests pass in 24 files. Vite retains its >500 kB chunk warning; the dynamically loaded hero is 1.18 MB / 309.5 kB gzip with the WebGPU/TSL code.
- Backend build passes with no warnings; dotnet test exits successfully but discovers no tests.
- Orca: desktop 1440×900 and mobile 375×812 checked through the sequence and backwards; no horizontal overflow. Short landscape 667×375 shows the static copy. Forcing an actual WebGL context loss returns the complete static hero. Explicitly disabling navigator.gpu and remounting confirms that the TSL shader renders with the WebGL2 backend.
- A separate reviewer found an async renderer-disposal rejection on failed initialization; fixed and covered by regression tests. No other important findings.
- Programmatic focus in a background Orca tab does not dispatch native focus events (document.hasFocus() is false); keyboard reveal remains covered by the existing integration tests. A background-tab frame probe includes a 1-second throttling outlier and is not a reliable performance benchmark. Real phone performance remains unverified.
- Source shader pinned to cf2fca75a9e774449057cbebe2197129249d96b8; original MIT license preserved alongside the source and shipped under /licenses/webgpu-black-hole.txt.
- Existing dirty feature branch preserved; no commit, push, deployment, directive creation or PROJECT.md status change.
