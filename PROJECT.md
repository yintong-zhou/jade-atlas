# jade-atlas: project

## Overview

Personal portfolio site of its owner, a fullstack .NET software developer. The owner's name, contacts and the site copy are in `PROFILE.md`. The site has a public side that presents profile, projects and CV, and a private side behind login where the owner manages content through create, edit and delete forms.

It is the first piece of a personal management system that will grow by modules (finance, career, health). The structure must allow adding them without rewriting what already exists.

**Project name: `jade-atlas`.** .NET namespaces start from `JadeAtlas` (`JadeAtlas.Api`, `JadeAtlas.Data`, solution `JadeAtlas.sln`). The name is only used for the repository: it never appears on the public site, and the private area shows only a logo, without the name. The user provides the logo; until then, use a simple placeholder, for example a circle.

## Stack

| Layer    | Technologies                                                                                                                                                     |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend | React + Vite + TypeScript, Tailwind CSS, React Router, TanStack Query, React Hook Form + Zod, Motion for animations, AnimeJS ([animejs.com](http://animejs.com)) |
| Backend  | ASP.NET Core Web API on .NET 10 (LTS), EF Core with the Oracle provider, ASP.NET Core Identity, OpenAPI                                                          |
| Database | Oracle                                                                                                                                                           |
| Tests    | xUnit for the backend, Vitest for the frontend                                                                                                                   |

## Architecture

Three separate layers: the React SPA calls the API over HTTPS and JSON, and the API talks to Oracle. The frontend never accesses the database and holds no credentials.

In production the frontend is a static site on Cloudflare Pages (for example `www.<domain>`) and the API runs on a Linux VPS under a subdomain of the same domain (for example `api.<domain>`). The two hosts are same-site, so the session cookie (`HttpOnly`, `Secure`, `SameSite=Lax`) works. The API enables CORS with credentials only for the frontend origin. In development, use the Vite proxy to the API.

## v1 scope

**Public pages**

- Home: animated introduction, three highlighted numbers, projects preview, invitation to get in touch.
- Projects: cards with description, technologies, links to repo or site.
- CV: experience timeline, skills, education and certifications, languages, button to download the PDF.
- About: narrative text.
- Footer on every page: name and role, links to GitHub, LinkedIn and email (values in `PROFILE.md`).

**Private area (after login)**

- Create, edit and delete projects, experiences, skills, education and certifications.
- Every content item has a "published" state: while it is off, the item is visible only in the private area.

**Out of v1** (do not build now): Home and About texts editable from a form, other languages, dashboard, finance, health.

## Data

Tables are prefixed by module. All have `SORT_ORDER`, `IS_PUBLISHED`, `CREATED_AT`, `UPDATED_AT`.

| Table | Content |
|---|---|
| `PRJ_PROJECTS` | Title, slug, summary, description, technologies, repo link, site link, cover image |
| `CAR_EXPERIENCES` | Role, company, location, start date, end date, description |
| `CAR_SKILLS` | Category, name |
| `CAR_EDUCATION` | Type (education or certification), title, institution, year |

- Every schema change goes through an EF Core migration, never through manual changes to the database.
- The cover image is stored in Oracle. The API validates file type and size.
- CV data is loaded with a seed script in `execution/`, starting from the owner's CV (see `PROFILE.md`). Projects must not be loaded by script: the user enters them through the form to test it.
- Fixed interface texts live in a single frontend file, so adding a language in the future does not require hunting for them in components.

## API

| Area | Rule |
|---|---|
| `/api/public/*` | Read-only, no login, returns only published content |
| `/api/auth/*` | Login, logout, current user |
| `/api/admin/*` | Read and write, always requires login |

The frontend's TypeScript types are generated from the API's OpenAPI, so they are not written twice.

## Application security

- A single user, created by script. No public registration.
- Session with an httpOnly cookie, CSRF protection on write requests, account lockout after a few failed attempts.
- What the public site may show about the owner is defined in `PROFILE.md`.

## Preparing for future modules

The planned modules are personal finance (budget, net worth, cash flow, fixed costs, subscriptions), career path with goals, health and sport, plus a monitoring dashboard. Do not build them now. Just follow three conventions:

- One API area per module (`/api/finance`, `/api/health`) and one frontend folder per module, loaded only when needed.
- One table prefix per module (`FIN_`, `HLT_`).
- No direct dependencies between modules: whatever is shared lives in a common part.

## Repository structure

```
project-root/
├── frontend/            # React + Vite SPA
│   └── src/
│       ├── modules/     # public, admin, then one module per area
│       └── shared/      # components, API client, interface texts
├── backend/             # ASP.NET Core Web API
├── .github/workflows/   # build and deploy pipelines
├── directives/          # Markdown SOPs
├── execution/           # Python scripts
├── .tmp/                # intermediate files, never in the repository
├── AGENTS.md            # how the agent works
├── PROJECT.md           # this file
├── PROFILE.md           # owner's personal information and site copy
└── brand-guidelines.md  # optional
```

A single repository for frontend and backend. The deliverables are the code in the repository and the published site.

## Deploy

Frontend and API are published independently.

- **Frontend:** Cloudflare Pages connected to the repository, root directory `frontend`, command `npm run build`, build on every push to `main`.
- **API:** GitHub Actions workflow in `.github/workflows/`, triggered only when `backend/` changes (path filter). Steps: restore, build, test, `dotnet publish` for the VPS architecture, copy over SSH, restart the systemd service, check `/health`.
- **VPS:** Ubuntu LTS, runtime only (`aspnetcore-runtime-10.0`, not the SDK). The API runs as a systemd service behind Caddy with automatic HTTPS. Recommended specs: 2 vCPU, 2 GB RAM, 40 GB SSD, fixed IPv4, European data center.
- **Deploy user:** `deploy`, with access only through an SSH key and permission to restart only the API service. The private key is stored in GitHub Secrets.
- **Protected production:** the deploy job uses a GitHub `production` environment with manual approval.
- **Secrets:** the Oracle connection string lives in an environment file on the VPS, readable only by the service. It does not pass through GitHub and is not in the repository.
- **Migrations:** they do not run automatically on every deploy. They are a separate step that the user approves.
- **Database:** the VPS IP must be added to the Autonomous Database ACL; with the ACL enabled, the connection can use TLS without a wallet. If the instance is Always Free, it stops after 7 days without activity and has no manual backups: a daily job that runs a query and a periodic export (Data Pump) are needed. Ask the user which type of instance it is.

## v1 phases

| Phase | Done when |
|---|---|
| 1. Foundations | A React page shows data read from Oracle through the API; the verification commands pass |
| 2. Login and private area | The user can sign in, and private pages are inaccessible without login |
| 3. Projects | The user creates, edits, publishes and deletes a project from the form and sees it on the public page |
| 4. CV | Experiences, skills and education are manageable from forms; the public CV page has a downloadable PDF |
| 5. Home, About, footer | Complete pages with the copy in `PROFILE.md`; animations only on the Home introduction and on sections entering the viewport, disabled when the system asks for reduced motion |
| 6. Tests and deploy | Site online, deploy pipeline working, backup working and restore tested |

## To confirm with the user

- Oracle Autonomous Database Serverless: version and instance type (Always Free or paid).
- VPS provider and chosen Ubuntu version.
- Site domain and API subdomain.
- Public or private repository, and license. Pending proposal: MIT for the code, with texts, photos and CV data excluded (all rights reserved to the owner). The owner must first check their employment contract.
- Logo for the private area.

## Status

- Current phase: 1 (not started).
- Decisions so far: name `jade-atlas`; single repository; frontend on Cloudflare Pages; API on a VPS with Ubuntu LTS, deployed by GitHub Actions; Oracle Autonomous Database Serverless; English-only site.
- Next step: create the repository and start phase 1.
