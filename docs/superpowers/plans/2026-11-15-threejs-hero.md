# Three.js hero replacement

**Superseded by the owner's later direction:** `2026-11-15-jade-sky-hero.md`. Geometry and lifecycle helpers from this iteration are reused by the jade sky.

The owner approved the scroll choreography and requested replacing the frame sequence with a real Three.js model. This supersedes the frame-based implementation choice in the earlier scroll animation design; other public-page animation tasks remain out of scope.

Use the existing Three.js dependency directly, loaded only by the Home hero. Build an irregular jade core and a closed, fractured stone shell procedurally. Scroll opens and separates shell fragments, holds on jade, dissolves the core into particles sampled from its actual geometry, then forms the existing name. Keep native scrolling, the Motion spring, copy timing, keyboard focus behavior, reduced motion and short-screen fallback.

1. Replace frame-specific integration tests with scene lifecycle tests; add geometry and choreography checks. Run them before implementing.
2. Add deterministic stone geometry and a single on-demand WebGL scene with shell, jade and particles. Reuse text sampling and the existing particle-to-text shader approach. Dispose all GPU resources on unmount or failure.
3. Integrate the scene into HeroSequence. Remove obsolete frame playback code and tests; preserve source images, frame-generation scripts, sampling helpers and static fallback imagery. Keep the static fallback independent of the frame manifest.
4. Run backend build/tests and frontend lint/build/tests. Inspect desktop/mobile scroll stages in Orca. Leave PROJECT.md status unchanged pending the owner's approval.

No extra libraries, external models, paid services, backend changes, deploy, merge or push.

## Verification

- Frontend: lint and production build pass; 79 tests pass across 23 files. Vite retains its warning about JavaScript chunks above 500 kB; Three.js remains a separate dynamically imported chunk.
- Backend: `dotnet build` passes without warnings; `dotnet test` exits successfully but discovers no tests in the existing test project.
- Orca browser: inspected 1440×900 and 375×812, shell opening, jade hold, erosion, particles forming the name, final HTML copy and reverse scrolling. No horizontal overflow. At 667×375 the hero switches to static mode and releases the canvas. Forced loss of the actual WebGL context also shows the static hero with the complete heading.
- Source images and generation scripts preserved. The production build includes only the single fallback image, not the old frame sequence.
- Focused code review found a GPU target-buffer replacement leak on resize. Fixed by updating a single persistent attribute; the new scene test first reproduced the failure, then passed with the fix. Resource disposal is also covered.
- Physical-phone GPU performance and CPU-throttled performance have not been measured. PROJECT.md status awaits the owner's approval.
