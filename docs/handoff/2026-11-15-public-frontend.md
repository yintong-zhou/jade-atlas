---
type: handoff
date: 2026-11-15
status: in corso
seq: 1
prev: null
tags: [jade-atlas, frontend, public-site, plan-execution]
---

# Handoff: frontend pubblico

## Obiettivo

Costruire il sito portfolio personale `jade-atlas` (React + Vite, API ASP.NET Core su .NET 10, Oracle), primo modulo di un gestionale personale che crescerà per moduli. Il proprietario ha deciso di partire dal **lato pubblico del frontend, senza backend**, per vedere e provare subito il sito in locale; il backend arriva in una seconda fase. Specifiche: `PROJECT.md`, `brand-guidelines.md`, `PROFILE.md`, `AGENTS.md`.

## A che punto siamo

- **Fatto e verificato:** struttura del repository e dipendenze. `npm run lint`, `npm run build`, `npm run test` (frontend) e `dotnet build`, `dotnet test` (backend) passano. Non esiste ancora nessun test né codice applicativo: `App.tsx` restituisce `null`, `Program.cs` ha solo OpenAPI.
- **Fatto:** piano di implementazione del frontend pubblico, 10 task, in `docs/superpowers/plans/2026-11-15-public-frontend.md`. Il proprietario lo ha letto e ha scelto l'esecuzione in modalità **Native**.
- **Non iniziato:** l'esecuzione del piano. Nessun task è partito.
- **Git:** si è ancora su `main` e **non è stato committato nulla**: tutto lo scaffold è untracked. L'unico commit è `ee8704d Initial commit` (solo `LICENSE`). Il piano prevede, come primo step del Task 1, la creazione del branch `feat/public-frontend` e il commit dello scaffold.

## Cosa abbiamo provato che NON ha funzionato

- **`openapi-typescript` come devDependency:** `npm install` fallisce con ERESOLVE perché la 7.13.0 (e anche il tag `next`) accetta solo TypeScript `^5.x`, mentre il template usa TypeScript 6.0.3. Non è installato. Non forzare con `--legacy-peer-deps`. Per ora i tipi sono scritti a mano; quando arriva l'API le opzioni sono `npx openapi-typescript@7.13.0` a versione fissata oppure riportare il frontend a TypeScript 5.9 (da decidere con il proprietario).
- **Pacchetti EF Core e Identity all'ultima versione:** `dotnet add package` senza versione prende la 11.0.0, incompatibile con `net10.0` ("incompatible with all frameworks"). Lo stesso vale per `dotnet-ef`. Vanno fissati alla serie 10.0.x (oggi 10.0.15).
- **Icone Lucide di GitHub e LinkedIn:** in `lucide-react` 1.73 non esistono più (`Github` e `Linkedin` non sono esportati). Il footer usa link testuali.

## Problemi incontrati e come li abbiamo risolti

- **SDK .NET 10 assente** (c'era solo il 9.0.203): installato con `winget install Microsoft.DotNet.SDK.10` (10.0.404). Può comparire una richiesta UAC.
- **Vulnerabilità alta in `System.Security.Cryptography.Pkcs` 8.0.1**, portata da `Oracle.ManagedDataAccess.Core`: aggiunto un riferimento diretto alla 10.0.15 in `backend/JadeAtlas.Data/JadeAtlas.Data.csproj`, con commento. La build ora è a 0 warning.
- **`dotnet new sln` in .NET 10 crea `.slnx`:** usato `--format sln` perché `PROJECT.md` chiede `JadeAtlas.sln`.
- **`npm audit` segnala 7 avvisi moderati** su `minimatch` dentro `typescript-eslint`: solo strumento di lint, l'unico fix è un downgrade. Lasciato così di proposito.

## Decisioni prese

- **Frontend prima del backend** (scartato: seguire l'ordine delle fasi di `PROJECT.md`, che parte da una pagina che legge da Oracle). Deciso dal proprietario.
- **Dati di Projects e CV: campioni solo in sviluppo**, liste vuote nella build di produzione (scartati: mettere subito il CV reale in un file statico; lasciare Projects e CV fuori dal piano). Ogni stringa di esempio inizia con `Sample`.
- **Link GitHub: `https://github.com/yintong-zhou`** (scartato: omettere il link). Va scritto anche in `PROFILE.md` nel Task 2.
- **PDF del CV più avanti:** il link di download esiste nel codice ma compare solo se `site.cvPdfUrl` è valorizzato (scartato: mettere ora il PDF in `frontend/public`).
- **Nessun deploy in questa fase**, solo locale (scartata: anteprima su Cloudflare Pages).
- **Esecuzione Native** (scartata: subagent-driven): i task condividono molte interfacce e il lavoro è solo locale.
- **Pagina di dettaglio `/projects/:slug`:** la scheda è un solo link, quindi repo e sito stanno nel dettaglio (scartato: link dentro la scheda, sarebbero link annidati).
- **Le lingue sono skill con categoria `Languages`** (scartato: nuova tabella, sarebbe una modifica al modello dati di `PROJECT.md`).
- **ESLint invece di Oxlint** nel template Vite (scartato: il default Oxlint di create-vite 9).
- **File rinominati** in `AGENTS.md`, `PROJECT.md`, `PROFILE.md` come indicato in "Repository structure"; aggiunto `CLAUDE.md` con `@AGENTS.md`.
- **Da confermare ancora dal proprietario**, già segnalate e senza obiezioni finora: il testo "Get in touch" dell'invito al contatto (non è in `PROFILE.md`); l'uso dei testi di `PROFILE.md` così come sono, anche se marcati "draft for approval".

## File toccati

- `AGENTS.md`, `PROJECT.md`, `PROFILE.md` — solo rinominati, contenuto invariato.
- `CLAUDE.md` — nuovo, una riga: `@AGENTS.md`.
- `.gitignore` — nuovo: `.tmp/`, `.env*`, Python, editor.
- `directives/`, `execution/`, `.github/workflows/` — cartelle vuote con `.gitkeep`; `.tmp/` creata e ignorata.
- `frontend/` — scaffold Vite React TS con ESLint; dipendenze installate; demo rimossa; `vite.config.ts` con plugin Tailwind e Vitest (`environment: 'jsdom'`); `src/index.css` con il solo `@import "tailwindcss"`; cartelle `src/modules/{public,admin}` e `src/shared/{components,api}`; script `test` = `vitest run --passWithNoTests`; favicon a cerchio; titolo "Yintong Zhou".
- `backend/` — `JadeAtlas.sln`, `JadeAtlas.Api` (OpenAPI, EF Design), `JadeAtlas.Data` (Oracle EF Core, Identity, override Pkcs), `JadeAtlas.Tests` (xUnit, senza test), `dotnet-tools.json` con `dotnet-ef` 10.0.15.
- `docs/superpowers/plans/2026-11-15-public-frontend.md` — il piano.

## Dove vogliamo andare

1. Leggi `AGENTS.md`, `PROJECT.md`, `PROFILE.md`, `brand-guidelines.md` e il piano `docs/superpowers/plans/2026-11-15-public-frontend.md`.
2. Esegui il piano in modalità **Native** con la skill `superpowers:executing-plans`, partendo dal Task 1 Step 1 (crea il branch `feat/public-frontend` e committa lo scaffold), un task alla volta, con i commit previsti.
3. Alla fine (Task 10) proponi al proprietario il testo per la sezione "Status" di `PROJECT.md` e modificala solo dopo il suo assenso; poi fai controllare l'intero branch da un revisore.

## Da sapere prima di toccare qualcosa

- Parla con il proprietario in italiano; codice, commit e testi del sito sono in inglese.
- I comandi npm vanno lanciati da `frontend/`, quelli dotnet da `backend/`, git dalla radice.
- Il nome `jade-atlas` non deve mai comparire nel sito né in `dist/`.
- Non aggiungere dipendenze: il piano usa solo quelle già installate.
- Nei test il piano prevede che il moto ridotto sia attivo di default (`stubMatchMedia(true)`); i test sulle animazioni chiamano `stubMatchMedia(false)`. Lo stub di `matchMedia` deve avere la forma completa di `MediaQueryList`, altrimenti Motion lancia un errore.
- Tailwind 4 genera nel CSS solo le variabili di tema effettivamente usate: una variabile assente da `dist` non è per forza un errore.
- Gli esempi AnimeJS in `brand-guidelines.md` sono indicativi: vanno controllati sui tipi di `animejs` 4.5 installato.
- Il repository può essere pubblico: niente segreti, telefono o indirizzo; solo i dati presenti in `PROFILE.md`.
- `LICENSE` (MIT) è già committato, ma in `PROJECT.md` la licenza risulta ancora da confermare.
