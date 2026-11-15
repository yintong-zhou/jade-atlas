# Agent instructions

Read `PROJECT.md` and `PROFILE.md` before starting any work. `PROJECT.md` describes what to build (stack, data model, scope, phases). `PROFILE.md` holds the owner's personal information and the site copy. This file describes how to work.

The user's direct instructions take precedence over all three files. `PROJECT.md` and `PROFILE.md` take precedence over the generic directives in `directives/` when they concern stack or project structure.

Talk to the user in Italian. The site, the code, identifiers and commit messages are in English.

## How you work: 3 layers

- **Directives** (`directives/`): Markdown SOPs that define goals, inputs, scripts to use, outputs and edge cases.
- **Orchestration**: you. Read the directives, call the scripts in the right order, handle errors, ask for clarification.
- **Execution** (`execution/`): deterministic Python scripts for repeatable operations, such as data seeding, backups and post-deploy checks. Application logic lives in `frontend/` and `backend/`, not in scripts.

Intermediate files go in `.tmp/`, which is never committed and can be deleted and regenerated.

## Operating rules

- At the start of a session, read `PROJECT.md`, especially "Status" and "To confirm with the user", and `PROFILE.md`.
- Before writing a script, check whether a suitable one already exists in `execution/`.
- When something breaks: read the error, fix it, retry, then update the directive with what you learned. If a retry uses paid credits, ask first.
- Directives improve over time. Do not create new ones or overwrite existing ones without asking.
- If `brand-guidelines.md` exists in the root, use the fonts and colors it specifies.
- Ask the user for the information listed under "To confirm with the user" when it becomes necessary. Do not assume it.

## Working in phases

Work on one phase at a time (the phases are listed in `PROJECT.md`) and stop at the end of each one so the user can try it.

At the end of each phase, propose a short update for the "Status" section of `PROJECT.md`: decisions made, current state, next steps. Update the file only after the user agrees.

## Verification

Before declaring work finished, run these commands and report the result. If one does not exist yet, create it in phase 1.

- Backend: `dotnet build`, `dotnet test`
- Frontend: `npm run lint`, `npm run build`, `npm run test`

## Autonomy

Without asking, you may: read and modify the project code, run builds, tests and lint, create migrations and apply them to the development database.

Ask first before:

- running operations that delete or alter existing data;
- touching production or deploying;
- introducing external or paid services;
- changing a decision in `PROJECT.md` (stack, architecture, scope).

## Secrets and personal data

- The repository may be public. Never commit secrets, connection strings, private personal data (phone, address), or financial or health data.
- Secrets and connection strings live in `.env` or user-secrets, always listed in `.gitignore`.
- Only the personal data listed in `PROFILE.md` may appear in the repository or on the site. Never invent personal details: if something is missing, ask the owner.
- The CV seed script contains only what is already public on the site.

## Fixed limits

- Oracle is the only database: this is the user's decision, not a technical detail.
- The frontend is React + Vite only, no Next.js, even if a generic directive lists it as the default stack.
- Public endpoints never return unpublished content.
