# GitHub projects import

**Goal:** the Projects page and Home preview list public GitHub repositories from a bundled JSON snapshot, without a backend.

**Decision (owner, 2026-11-16):** a daily GitHub Action runs `frontend/scripts/fetch-projects.mjs` and commits `frontend/src/shared/api/githubRepos.json` only when it changes. A push to main triggers the Pages build. This replaces projects from Oracle via the admin form until curation is needed.

**Freshness:** one GitHub call per day at 05:00 UTC; manual refresh via `workflow_dispatch`. Data is at most a day old after a successful refresh and build.

**Limits:** visitors never call GitHub. The JSON is imported statically into the bundle. Only the workflow uses `GITHUB_TOKEN`; no token enters the frontend. There is no runtime fetch or rate-limit retry rule.

## Rules

- Keep non-fork, non-archived repos, excluding `yintong-zhou` and `yintong-zhou.github.io`. Preserve JSON order (most recent push first); Home shows the first three.
- Keep the existing repository mapping, homepage normalisation and six-technology cap.
- `githubProjects()` filters and maps the snapshot. Async `publicApi.getProjects()` and `getProject(slug)` use it; slug matching is exact.
- Project queries use plain `useQuery` and the app uses `new QueryClient()`.
- Tests never touch the network; keep the global rejecting fetch stub.

## Tasks

1. Original GitHub data layer and mapping tests: done.
2. Replace runtime fetching with the bundled daily snapshot; add the refresh workflow and update tests.

## Done when

From `frontend/`: `npm run lint`, `npm run build` and `npm run test` pass.

## Later (not now)

Card content, README descriptions and curation through Oracle overrides behind a .NET proxy.
