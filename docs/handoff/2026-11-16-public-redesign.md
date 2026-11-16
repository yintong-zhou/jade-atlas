---
type: handoff
date: 2026-11-16
status: implementato e verificato, in attesa della prova e di quattro risposte dell'owner
seq: 1
prev: nessuno (lavoro precedente sull'hero: docs/handoff/2026-11-16-scroll-animations.md)
tags: [jade-atlas, frontend, public-redesign, design-taste-frontend, liquid-glass, manrope, codex]
---

# Handoff: redesign delle pagine pubbliche (stile Apple iOS 26, vetro sui controlli)

## Obiettivo

Rifare l'aspetto delle pagine pubbliche del portfolio con la skill `design-taste-frontend`, perché il sito non sembri un template: minimal, stile Apple iOS 26, pulito, accogliente e professionale. L'owner vuole che Claude pianifichi e riveda, e che Codex esegua i task con un effort proporzionato alla difficoltà.

## A che punto siamo

- Branch `feat/public-redesign`, creato da `feat/scroll-animations` dopo il commit di sicurezza `b3ac342`. **Tutto il redesign è nel working tree, senza commit.** Le dieci `rock-*.webp` restano non tracciate di proposito.
- Fatto: specifica (`brand-guidelines.md` riscritto), copy nuova (`texts.ts` e bozza in `PROFILE.md`), piano, tre task eseguiti da Codex e rivisti.
- Verifiche a fine sessione: frontend `npm run lint`, `npm run build`, `npm run test` OK (**120 test**). Backend `dotnet build` OK; `dotnet test` non trova test.
- Screenshot guardati: Home, About, Projects, pagina di un progetto a 1440 e 390px; Home anche a 768px. La Home a 1024px è stata scattata ma non guardata.
- Lint della copy della skill: 0 errori, 0 avvisi, eseguito su una trascrizione dei testi, non sulle pagine renderizzate.
- **Non verificato:** telefono reale, navigazione da tastiera, screen reader. Gli impulsi del diagramma sono stati visti solo come fermo immagine.
- L'owner **non ha ancora provato** questa versione e non ha risposto alle quattro domande in "Dove vogliamo andare".
- `PROJECT.md` non è stato toccato: le modifiche sono solo proposte.

## Cosa abbiamo provato che NON ha funzionato

- **Importare il kit CSS/JS della skill** (`system.css`, `layout.css`, `motion.js`, circa 250 kB): scartato prima di provarlo. Vieta navbar flottante, blur e pulsanti con ombra, cioè le scelte dell'owner, e i suoi script si inizializzano una volta al caricamento, quindi non reggono i cambi di pagina della SPA. Le regole della skill sono applicate con i token Tailwind del progetto.
- **Armare il gate della skill nel progetto** (`gate.mjs`, hook di Stop): non fatto. Senza le classi del kit darebbe molti falsi errori, e con l'hero WebGL su CPU rischia di bloccarsi. I sorteggi (`start.mjs deal`) sono stati lanciati dalla scratchpad proprio per non armarlo qui.
- **Vetro al 94%** (scelta di Codex nel Task 1): riportato al 72%, il valore già deciso dall'owner; al 94% non si legge come vetro.
- **Linee del diagramma in `--color-border`**: quasi invisibili sul fondo muted. Ora sono al 16% del colore del testo.
- **Copertina 16:9 a tutta larghezza nella pagina del progetto**: riempiva lo schermo intero. Ora è limitata a `70svh`, ritagliata dal centro.
- **Card dei progetti con `grid h-full` senza `content-start`**: il blocco di testo si spostava in verticale e i titoli non erano allineati tra le card.
- **Screenshot della Home senza `--reduced` dentro il sandbox di Codex**: `shoot.mjs` si è bloccato. Fuori dal sandbox funziona anche dal vivo, ma è lento.
- **Primo abbinamento di font sorteggiato** (Funnel + DM Mono): scartato perché cambiava anche il mono; preso il secondo, Manrope + JetBrains Mono.
- **I due "momenti" animati sorteggiati** (`iris-opens`, `liquid-type`): non montati, richiedono il kit. L'hero resta l'unica scena.

## Problemi incontrati e come li abbiamo risolti

- **Codex non ha rete:** `npm install` e il download delle icone falliscono nel suo sandbox. Vanno fatti prima del lancio (`@fontsource-variable/manrope` e `frontend/src/assets/icons/` sono già a posto). Anche `npx prettier` non si risolve offline: Codex ha usato la copia in cache.
- **Sezione dello stack più alta di uno schermo a 1440×900:** i numeri venivano tagliati dal bordo. Ridotte le righe del diagramma solo da 1024px (`.tool` 56px, `.target` 4px, `.servicesTitle` 24px) in `StackDiagram.module.css`.
- **Loghi viola (.NET):** la skill li ammette solo piccoli; quello di C# è stato tolto per non raddoppiare il viola. ServiceNow e SQL Server non hanno un logo con licenza adatta: restano solo testo.
- **Dev server già attivo sulla 5173:** controllare con `curl http://127.0.0.1:5173/` prima di lanciarne un altro.

## Decisioni prese

- **Owner:** CV unito ad About, `/cv` reindirizza. Scartate le due pagine separate e lo stato precedente (About con il CV duplicato, CV fuori dal menu).
- **Owner:** vetro solo sui controlli (isola, pulsanti, pulsante di chiusura). Scartato il vetro anche su card e blocchi di contenuto.
- **Owner:** nuovo font per i testi, JetBrains Mono resta. Scartato IBM Plex Sans.
- **Owner:** commit di sicurezza e nuovo branch, senza push.
- **Implementazione:** tolte le comparse in dissolvenza allo scroll (`Reveal` eliminato). Restano hero, entrata del titolo al caricamento, hover, conteggio dei numeri. Scartato tenerle sulle sole sezioni: la skill le vieta. Tocca la frase sulle animazioni di `PROJECT.md`, ancora da approvare.
- **Implementazione:** sotto l'hero, un diagramma dello stack con i loghi reali al posto di card di testo, che avrebbero ripetuto il sottotitolo dell'hero. La sezione "Write to me" della Home è diventata la chiusura del footer, su ogni pagina.
- **Implementazione:** fondo `#FFFFFF` al posto di `#FAFAFA`, così non c'è stacco con l'uscita bianca dell'hero; una sola fascia muted per pagina.
- **Implementazione:** griglia dei progetti sempre a righe piene (`projectGridLayout.ts`). Scartata la griglia fissa a tre colonne, che lascia righe a metà.
- **Lavoro con Codex:** tre task in sequenza su `gpt-6.1-sol` (medio, medio, alto). Scartata l'esecuzione in parallelo: nello stesso working tree un task a metà rompe `tsc -b` dell'altro.

## File toccati

- `brand-guidelines.md`: riscritto (direzione, colori, tipografia, layout, componenti, motion).
- `PROFILE.md`: bozza della copy aggiornata (sezione stack, chiusura, titolo e paragrafi di About).
- `docs/superpowers/plans/2026-11-16-public-redesign.md` (nuovo): piano e brief dei tre task.
- `frontend/package.json`, `package-lock.json`, `src/main.tsx`: Manrope al posto di IBM Plex Sans.
- `frontend/src/index.css`: token colore, raggi, scala tipografica fluida, un solo set `--glass-*`, `--gut`/`--padt`/`--padb`, utility `section-pad`, `link`, `link-inline`, `tile-hover`, `enter`, `type-figure`.
- `frontend/src/shared/texts.ts`: chiavi nuove (`home.stackTitle`, `home.stack`, `closing`, `about.heading`, `about.paragraphs`, `cv.educationAndCertifications`, `footer.trademarks`); tolte `home.contactTitle`, `about.body`, `cv.title`.
- `frontend/src/shared/components/`: `Container.tsx` (gutter a variabile), `Tag.tsx` (chip), `buttonStyles.ts` (hover, press, taglia `xl`); eliminati `Reveal.tsx` e i suoi due test.
- `frontend/src/modules/public/Header.tsx`, `Header.module.css`: isola sui nuovi token, voce attiva jade senza alone.
- `frontend/src/modules/public/Footer.tsx`: chiusura "Write to me" con pulsante `xl`, poi nome, link e riga sui marchi.
- `frontend/src/modules/public/home/`: `HomePage.tsx` (sezione stack con numeri, fascia progetti), nuovi `StackDiagram.tsx`, `StackDiagram.module.css` e test; `hero/HeroCopy.tsx` e `hero/HomeHero.tsx` (larghezze del titolo, link a `/about#experience`).
- `frontend/src/modules/public/about/`: `AboutPage.tsx` con il CV dentro, nuovo `CvDownloadLink.tsx`, test; eliminati `cv/CvPage.tsx` e il suo test.
- `frontend/src/modules/public/projects/`: `ProjectCard.tsx`, `ProjectsPage.tsx`, `ProjectPage.tsx`, nuovo `projectGridLayout.ts`, test.
- `frontend/src/routes.tsx` (+ test nuovo): `/cv` → `/about`.
- `frontend/src/assets/icons/` (nuovo): cinque SVG e `icons-credits.json`.

## Dove vogliamo andare

1. Fai provare all'owner `http://127.0.0.1:5173/` (da `frontend/`: `npm.cmd run dev -- --host=127.0.0.1`) e raccogli le regolazioni.
2. Ottieni le quattro risposte rimaste aperte:
   - la copy nuova va bene? (titolo della sezione stack, riga della chiusura, titolo di About);
   - loghi di terzi nel diagramma, oppure solo testo per tutti?
   - approva le modifiche a `PROJECT.md`: via la pagina CV dallo scope, frase sulle animazioni della fase 5, Status;
   - commit su `feat/public-redesign`?
3. Scrivi `PROJECT.md` e fai il commit solo dopo il sì dell'owner. Niente push o merge senza richiesta.
4. Guarda la Home a 1024px e prova su un telefono reale, con la tastiera e con uno screen reader.
5. Quando l'owner fornisce il PDF del CV, imposta `cvPdfUrl` in `frontend/src/shared/site.ts`: il pulsante di download compare da solo.

## Da sapere prima di toccare qualcosa

- Leggi `PROJECT.md`, `PROFILE.md`, `AGENTS.md`, `brand-guidelines.md`. Il file dei brand ora è allineato al codice; `PROJECT.md` no, finché l'owner non approva.
- Non toccare i file dell'hero (`heroScene.ts`, `heroTimeline.ts`, `blackHoleLayer.ts`, `HeroSequence.tsx`, `vendor/`) né le `rock-*.webp`.
- I componenti non contengono testo: ogni stringa visibile sta in `frontend/src/shared/texts.ts` e viene da `PROFILE.md`.
- Pulsanti e isola restano jade e bianco traslucido, qualunque riferimento di stile arrivi.
- Shell: npm solo da `frontend/` (`npm.cmd` in PowerShell), dotnet da `backend/`. Formattazione: `npx prettier --no-semi --single-quote --print-width 120 --write <file>`. Python non è installato.
- Lanciare Codex: `codex exec -m gpt-6.1-sol -c 'model_reasoning_effort="medium"' -s workspace-write -C D:/DEVS/jade-atlas -o <file> - < brief.md`, in background, un task alla volta.
- Screenshot: `node ~/.claude/skills/design-taste-frontend/scripts/shoot.mjs --url http://127.0.0.1:5173/<pagina> --w 1440 --h 900 --out <file> --profile "$TEMP/taste-chrome-shoot" --no-tiles`. Sulla Home aggiungi `--reduced` per l'hero statico; senza, funziona ma impiega minuti.
- L'avviso di Vite sui chunk oltre 500 kB è noto (scena dell'hero, caricata dinamicamente).
- `texts.about.cvLink` è usata solo da un test che ne verifica l'assenza: non è un errore.
