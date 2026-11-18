# Portfolio project

Personal portfolio of Yintong Zhou. The site is a frontend-only React + Vite application. Internal content management belongs to a separate future project. Database-backed updates are planned for a later phase; the integration has not yet been decided. Oracle remains the database choice.

The public pages, copy and personal data follow PROFILE.md and brand-guidelines.md. The existing GitHub snapshot workflow supplies project data; CV data is currently local. Never expose unpublished content or database credentials on the public site.

## Verification

From frontend/: npm run lint, npm run build, npm run test.

## Status

- Public frontend built ahead of the backend: Home (WebGPU hero, stack diagram, projects preview), Projects, project page, About with the CV and PDF. The CV runs on development sample data until the API exists. The backend is a skeleton (API, Oracle data project, tests).
- Decisions so far: name `jade-atlas`; single repository; frontend on Cloudflare Pages; API on a VPS with Ubuntu LTS, deployed by GitHub Actions; Oracle Autonomous Database Serverless; English-only site.
- Projects (2026-11-16): public projects come from GitHub through a daily snapshot. A GitHub Action at 05:00 UTC refreshes `frontend/src/shared/api/githubRepos.json`, which is bundled into the build; visitors never call GitHub. Forks, archived repos, the profile repo and `yintong-zhou.github.io` are excluded. Oracle and the admin form for projects are postponed: they will return as overrides (cover, texts, hide) without changing the components.
- Next step: decide the project card content (image, logo, skills, short title).
