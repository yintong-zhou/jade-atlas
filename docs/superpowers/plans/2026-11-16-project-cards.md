# Direct project cards and repository logos — Implementation Plan

**Goal:** GitHub cards show title, description, topics and logo, and open the repository directly (changed from website-first by the owner).
**Architecture:** Keep daily GitHub snapshot, existing filters and React/Vite design. Discover logos during snapshot refresh, never via visitor API calls.
**Tech Stack:** React, TypeScript, Vite, Node, Vitest.

- [x] Inspect mapping, snapshot script, cards, Home preview and routes.
- [x] Test website priority, blank/invalid website fallback, missing URLs, topics and descriptions.
- [x] Make the whole card one accessible external link; apply to Home too.
- [x] Remove intermediate detail page/route and unused detail-only code; update tests.
- [x] Investigate actual repository assets and implement conservative, deterministic recognizable logo discovery during snapshot refresh. No arbitrary image/avatar passed as logo. Missing logo retains title fallback. Validate paths/URLs; preserve snapshot on API failures. Test discovery and mapping; document supported logo convention.
- [x] Follow-up: inspect the real repository trees and widen detection to project-prefixed/suffixed names, light-background variants, app icon, icon, favicon, apple-touch-icon and named sizes, with ICO support, size fall-through, a known-defaults denylist and ambiguity handling; tests first, then refresh the snapshot and logos.
- [x] Follow-up (contributed repositories): a small explicit list `frontend/scripts/external-projects.json` (starting with `ICPN/subsmate`), fetched via `/repos/{owner}/{repo}` in the daily snapshot next to the owned repos; no automatic discovery. Tests first (config validation, private exclusion, duplicates, same-name external vs owned, metadata mapping, logo identity, failures), then `projectSnapshot.mjs`; `full_name` in the snapshot, owner-qualified slug and logo file for other owners, per-owner profile exclusions, deterministic order (last push, then full name); refresh the snapshot and find the logo; README explains how to add entries.
- [x] Run frontend lint/build/test and backend build/test; review diff, preserve existing icon edits.

**Review focus:** Empty/invalid homepage, missing URLs/topics/description/logo, ambiguous logo files, GitHub errors/rate limits, Home consistency and removed route references.
**Limits:** No deployment, paid/external service, database change, commits, directive edit or PROJECT.md edit. Propose Status update at completion.
