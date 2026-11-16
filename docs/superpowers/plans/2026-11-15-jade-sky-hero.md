# Jade sky and centered navigation

The owner's new direction supersedes the single rock/jade hero. Keep the established fonts, colours, native scroll, sticky stage, HTML copy and reduced-motion/short-screen fallback. No new dependencies.

- Center the public header's name and navigation as one compact group; remove its logo placeholder and bottom border. Use a transparent surface so it merges with the page beneath it.
- Fill the white hero viewport with many small jade stones at different sizes and depths. Reuse the procedural jade geometry with instanced Three.js rendering and a single shared material; drive suction in a vertex shader instead of updating hundreds of React nodes.
- Scroll pulls the field into a small dark vortex at the lower center. After intake, individual name glyphs emerge upward from that point, fall and bounce into their final line. Use AnimeJS easing functions for the glyph paths; keep the actual HTML heading unsplit and crossfade to it after landing.
- Keep a single shared glyph atlas, dispose replaced textures on resize, and update existing geometry buffers. Render only on demand and while visible; cap DPR and scale instance count for mobile.
- Replace the obsolete static image with the complete copy on white. Preserve source assets and reusable geometry utilities on disk.

Implementation order: regression tests for header, choreography and fallback; timeline/path functions and shared geometry; instanced scene and glyph atlas; browser checks; full frontend and backend verification. Update brand guidelines to reflect the owner's direction. Leave PROJECT.md unchanged pending approval.

## Verification

- Frontend lint and production build pass; 79 tests pass across 23 files. Vite still reports chunks above 500 kB; Three.js remains a separate Home-only dynamic import. No old hero images appear in the production build.
- Backend build passes without warnings. `dotnet test` completes but discovers no tests in the existing backend project.
- Browser: inspected jade field, suction, launched glyphs, bounce, final name and HTML crossfade at 1440×900 and 375×812; checked no overflow at 768 and 1024px. At 667×375 the fallback is complete copy with no canvas or old image. Navigation center measured at exactly 187.5px in a 375px viewport, with zero border and transparent background.
- Corrected canvas baseline and letter spacing against the actual loaded font so glyphs align with the unsplit HTML name. Instance buffers are reused; old glyph atlases are disposed on resize.
- A 90-frame scripted scroll probe in the desktop browser at mobile viewport size measured a median interval of 6.1ms and p95 of 6.2ms. This is not a physical-phone or throttled-CPU benchmark.
- Focused independent review found no important correctness, atlas, geometry or resource issues; jade geometry has 252 vertices and 500 triangles with valid outward normals.
- Source images, scripts and reusable geometry utilities preserved. PROJECT.md not changed.
