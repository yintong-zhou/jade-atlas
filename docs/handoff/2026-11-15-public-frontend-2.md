---
type: handoff
date: 2026-11-15
status: pronto per review
seq: 2
prev: docs/handoff/2026-11-15-public-frontend.md
tags: [jade-atlas, frontend, public-site, branch-finish]
---

# Handoff: frontend pubblico (chiusura branch)

## Obiettivo

Sito portfolio personale di Yintong Zhou (`jade-atlas`): React + Vite, poi API ASP.NET Core .NET 10 su Oracle. È il primo modulo di un'app di gestione personale che crescerà a moduli. Questa fase costruisce il frontend pubblico su dati di esempio, prima del backend, per vedere il sito subito e fissare il contratto dati.

## A che punto siamo

- Piano `docs/superpowers/plans/2026-11-15-public-frontend.md` eseguito per intero (Task 1–10) sul branch `feat/public-frontend`: 11 commit sopra `main`, ultimo `c4eaee7`. Working tree pulito.
- `npm run lint`, `npm run build`, `npm run test` (16 file, 46 test) tutti verdi.
- Review finale (Opus, contesto fresco): 0 Critical, 2 Important (entrambi corretti con test RED→GREEN in `c4eaee7`), 7 Minor rinviati.
- Workspace `.superpowers/sdd/2026-11-15-public-frontend` già cancellato (la storia git è il record).
- **In sospeso, decisione dell'owner:** (a) come integrare il branch (merge locale in `main` / push + PR / lasciare così); (b) approvazione del testo "Status" per `PROJECT.md`. Nulla è stato mergiato, pushato o scritto in `PROJECT.md`.
- Non provato da noi, va provato a mano con `npm run dev` in `frontend/`: navigazione da tastiera, durata intro Home (< 1,5 s, si ferma su 8+, 38, 10+), "riduci animazioni" di Windows, URL lungo in una descrizione progetto a 375px.

## Cosa abbiamo provato che NON ha funzionato

- Python per modifiche a file: non installato su questa macchina. Usare Edit/Write.
- Bash con più heredoc in un solo comando: errore "unexpected EOF". Un file per Write.
- Leggere CSS nei test con `import css from '...?raw'`: in Vitest restituisce `''`. Con `new URL(..., import.meta.url)`: in jsdom non è un URL `file:`. Funziona `readFileSync('src/index.css')` (Vitest gira da `frontend/`).
- Troncare file con `head -n -21`: ha tagliato troppo, ripristinato con `git checkout`.
- Edge headless sotto ~500px di larghezza: non scende. Per screenshot mobile usare una pagina HTML con iframe a 375/768px. Gli stati "pending" casuali negli screenshot sono artefatti del virtual time, non difetti.
- Esportare costanti da `ButtonLink.tsx`: errore lint react-refresh. Spostate in `buttonStyles.ts`.
- `.filter()` con type guard sui link in `ProjectPage`: TS2677/TS2322. Sostituito con `.flatMap`.

## Problemi incontrati e come li abbiamo risolti

- **Pagina che scorre di lato su mobile con URL lunghi** → causa: parole senza spazi non vanno a capo → `overflow-wrap: anywhere` sul `body` (`src/index.css`), test `src/test/overflow.test.ts`.
- **Sezioni CV alte mai rivelate** → causa: `Reveal` aspettava una frazione della sezione in vista, impossibile se più alta dello schermo → `viewport.amount: 'some'`. Test in file a parte `Reveal.threshold.test.tsx` perché Motion mette in cache gli observer per soglia.
- **Chunk JS > 500 kB** (ora 546 kB, librerie) → accettato; si riduce con split per route o `LazyMotion`.

## Decisioni prese

- Frontend prima del backend; `publicApi` restituisce dati di esempio solo in dev (`import('./sampleData')` dentro `if (import.meta.env.DEV)`), vuoti in produzione, così nessun dato di esempio finisce nella build (verificato: niente "Sample" in `dist`).
- Lingue = skill nella categoria `Languages`.
- Card progetto → pagina dettaglio `/projects/:slug`.
- Link GitHub `github.com/yintong-zhou` aggiunto a `PROFILE.md`.
- Branch nella cartella principale, niente worktree. Scaffold già su `main` (`ec2399a`), quindi saltato il commit del Task 1.
- Prefisso "Sample" solo sul testo visibile dei dati di esempio (non su slug, URL, date, categoria `Languages`).
- `Tag` rende sempre un `<li>`; classi bottone in `buttonStyles.ts`.
- Cerchio 24px come segnaposto logo; `App` export nominato.
- Fixture condivise in `src/test/fixtures.ts`; test extra per l'errore in `ProjectPage`.
- Count-up AnimeJS in posizione `'<<'` (inizio dell'animazione precedente, verificato nel sorgente animejs 4.5); sequenza ~1,33 s.
- Controllo visivo con screenshot Edge headless; tastiera e reduced-motion OS lasciati all'owner.

## File toccati

Tutto sotto `frontend/` salvo dove indicato.
- `vite.config.ts`, `package.json` — setup test, script `vitest run`.
- `index.html` — meta description.
- `src/index.css` — token brand, scala tipografica `@utility`, `link`, focus ring, `overflow-wrap`.
- `src/main.tsx`, `src/App.tsx`, `src/routes.tsx` — font, provider, router.
- `src/test/*` — setup, `stubMatchMedia`, `renderRoute`, fixture, test overflow.
- `src/shared/` — `texts.ts` (copy da PROFILE.md), `site.ts`, `format.ts`, `motion.ts`, `api/` (tipi, sampleData, publicApi, queries), `components/` (Container, ButtonLink, buttonStyles, Tag, Reveal, QueryBoundary).
- `src/modules/public/` — PublicLayout, Header, Footer, NotFoundPage, about, projects (Card, Page, Detail), cv, home (HomePage, useHomeIntro) + test.
- `PROFILE.md` (root) — riga GitHub.

## Dove vogliamo andare

1. Chiedi all'owner quale integrazione vuole (1. merge in `main` locale, 2. push + PR, 3. lasciare il branch) ed esegui solo quella, seguendo `superpowers:finishing-a-development-branch` (rilancia `npm run test` prima).
2. Chiedi l'approvazione del testo Status e, solo dopo il sì, scrivilo in `PROJECT.md`:
   > - Current phase: public frontend complete on sample data; backend not started.
   > - Decisions so far: (existing list) + frontend built before the backend; public pages read through `publicApi`, which returns development-only sample data until `/api/public/*` exists; languages are skills in the `Languages` category; project cards link to a detail page at `/projects/:slug`; GitHub link `github.com/yintong-zhou`.
   > - Next step: phase 1 backend foundations (API reading from Oracle), then replace `publicApi` bodies with real requests and generate the TypeScript types from OpenAPI.
3. Poi: fase 1 backend (API .NET 10 su Oracle), sostituire i corpi di `publicApi` con richieste reali, tipi TS da OpenAPI.

Minor rinviati, da proporre all'owner se vuole sistemarli: flash di un frame dell'hero prima dell'intro (`useLayoutEffect`); titolo letto due volte senza copertina (`aria-hidden` sul placeholder); `/projects` salta da h1 a h3; errore progetto senza h1 né `<title>`; header senza `flex-wrap` a 320px; icona download con stroke 2px invece di 1,5px; nessun `errorElement` sulla route layout.

## Da sapere prima di toccare qualcosa

- Shell: Git Bash su Windows, niente Python. Comandi npm da `frontend/`.
- Non mergiare, pushare o modificare `PROJECT.md` senza il sì esplicito dell'owner (AGENTS.md).
- Repo potenzialmente pubblico: solo dati presenti in `PROFILE.md`.
- `Reveal.threshold.test.tsx` deve restare in un file separato (cache observer di Motion per soglia).
- Il warning Vite sul chunk > 500 kB è atteso, non è un errore.
- In test, reduced motion è il default di `setup.ts`; per testare le animazioni chiama `stubMatchMedia(false)`.
