---
type: handoff
date: 2026-11-16
status: implementato e verificato, in attesa della prova dell'owner
seq: 5
prev: docs/handoff/2026-11-15-scroll-animations-4.md
tags: [jade-atlas, frontend, home-hero, scroll-animations, three.js, webgpu, black-hole, tunnel, navbar, copy]
---

# Handoff: buco nero → tunnel interdimensionale, navbar a isola, copy Home

## Obiettivo

Portfolio pubblico dell'owner con un'introduzione d'impatto guidata dallo scroll nativo. Direzione attuale, voluta dall'owner: stelle verdi su bianco risucchiate da un buco nero 3D ruotabile; poi ci si tuffa nel buco, si attraversa un tunnel di stelle che si piega e accelera fino alla velocità della luce, e si esce sul bianco, dove compaiono i testi. La Home deve dire subito **cosa fa** l'owner, non chi è: il chi-sono sta in About.

## A che punto siamo

- Branch `feat/scroll-animations`, HEAD ancora `d42ce9c`. **Tutto è nel working tree, senza commit/push/merge.** Non fare reset/clean: ci sono file nuovi non tracciati e cancellazioni volute.
- Fatto e verificato in Orca (1440×900 e 375×812): stelle migliori + assorbimento, tuffo nel buco, tunnel, uscita bianca, copy senza nome, navbar a isola di vetro.
- Verifiche a fine sessione: frontend `npm run lint`, `npm run build`, `npm run test` OK (**92 test**). Backend `dotnet build` OK; `dotnet test` non trova test, quindi il backend non è testato.
- L'owner **non ha ancora provato** questa versione. Non è stata provata su un telefono reale.
- Aperte due domande all'owner: aggiornare `brand-guidelines.md` (dice ancora header trasparente, hero tutto bianco e con il nome) e lo Status di `PROJECT.md` + commit.
- Skill installata: `leonxlnx/taste-skill@design-taste-frontend` (globale, `~/.agents/skills/design-taste-frontend`). **Non ancora applicata** al resto del frontend: l'owner l'aveva chiesto, ma con priorità sotto l'hero.

## Cosa abbiamo provato che NON ha funzionato

- **Esplosione dopo il collasso** (onda d'inchiostro + eco + frammenti + nome sparato fuori in glifi canvas): implementata e buona, ma l'owner l'ha **tolta** e sostituita con il tunnel. Non ripristinarla, e non ripristinare i glifi del nome nel canvas (`glyphPose`, atlas, `nameRef`).
- **Il vecchio «pulse» ad anello sfocato** con `sin(explosion*PI)`: piatto, il picco arrivava quando l'anello era già largo. Superato.
- **Velo scuro che si schiariva insieme all'uscita** (`dark * (1 - exit)`): durante l'uscita lo sfondo diventava grigio. Ora il velo resta scuro finché l'apertura bianca non copre tutto.
- **Vetro della navbar al 94%:** sopra il tunnel l'effetto vetro non si vedeva. Ora è al 72%.
- **Disco con il tempo legato a `p`** (proposta di Codex): scartato perché l'owner vuole il disco animato anche a scroll fermo. Scartata anche la rimozione del damping di OrbitControls.
- Strade più vecchie (fotogrammi roccia, nome come nuvola di punti, cielo di giade, buco a camera fissa senza bloom): vedi gli handoff precedenti. Non ripristinarle.

## Problemi incontrati e come li abbiamo risolti

- **`smoothstep` con i bordi invertiti** negli shader: in GLSL ES 3 il risultato non è definito. Si usa sempre `1.0 - smoothstep(min, max, x)`.
- **L'apertura bianca non arrivava agli angoli** su schermi molto larghi. Il raggio finale ora è la semidiagonale calcolata con `uAspect`.
- **`uTravel` cresceva senza limite** e dopo ore perdeva precisione in float32. Ora viene riportato in [0,1) a ogni frame, perché lo shader legge solo `fract()`.
- **Rivelazione da tastiera:** il selettore in `index.css` non includeva `h1`, quindi il titolo restava invisibile. Corretto.
- **Screenshot Orca fuori sequenza:** gli hot reload (anche quelli dovuti alle modifiche di Codex) e i reload che resettano il viewport sballano i frame. Rifissare `orca viewport` dopo ogni reload e aspettare circa 2,5 s dopo ogni `scrollTo`.
- **Dev server:** il task in background viene ucciso dopo il limite di tempo, ma il processo Vite può restare vivo; un nuovo `npm run dev` fallisce allora per porta occupata. Controllare con `curl http://127.0.0.1:5173/` prima di rilanciarlo.

## Decisioni prese

- **Owner:** via l'esplosione, dentro un tunnel interdimensionale con uscita sui testi. Scartata l'esplosione col nome.
- **Owner:** il nome sparisce dall'hero; la Home presenta cosa fa l'owner. Il nome resta nella navbar, nel footer e nel `<title>`.
- **Owner:** navbar a isola tipo notch / Dynamic Island, con effetto vetro. Scartato l'header trasparente previsto da `brand-guidelines.md`.
- **Implementazione — tunnel scuro** (jade quasi nero) **dentro il buco:** il bianco torna con l'uscita. Scartato un tunnel su fondo bianco, che rendeva meno la profondità.
- **Implementazione — si entra ingrandendo il buco:** `holeScale` cresce fino a circa 14 e l'ombra copre lo schermo. Scartato il collasso su un punto.
- **Implementazione — tunnel tutto in shader nel canvas WebGL2 esistente:** streak istanziati proiettati in prospettiva nel vertex shader. Il viaggio avanza col tempo (vivo a scroll fermo) più lo scroll. Nessun nuovo renderer, nessuna dipendenza.
- **Copy:** riscritta con humanizer usando solo i fatti di `PROFILE.md`; aggiornata anche la sezione «Site copy» di `PROFILE.md`. Il testo di About non è stato toccato perché contiene già il chi-sono.
- **Divisione del lavoro con Codex:** Codex ha fatto la navbar (Header + CSS module + token), poi ha rivisto il tunnel (4 bug, tutti corretti). L'hero e la copy li ha fatti Claude.
- Nessuna modifica a stack, backend, DB o produzione. Nessun commit.

## File toccati

- `frontend/src/modules/public/home/hero/heroTimeline.ts` (+ test riscritto): fasi `suction`, `heat`, `dive`, `dark`, `tunnel`, `warp`, `light`, `exit`, `copy.{title,subtitle,actions}`; `smooth()`; tolti `glyphPose`, `burst` e `settle`.
- `frontend/src/modules/public/home/hero/heroScene.ts` (+ test riscritto): stelle nuove (nucleo, alone, raggi, scintillio, spirale, appiattimento nel disco), velo scuro, tunnel (`InstancedBufferGeometry`, attributo `aStar`), luce e apertura d'uscita. Tolti glifi, pulse e detriti; l'opzione `target` non esiste più.
- `frontend/src/modules/public/home/hero/blackHoleLayer.ts`: il disco accelera (`delta * (1 + 5*heat)`) e diventa più luminoso durante `HERO.heat`. Niente più restringimento del raggio.
- `frontend/src/modules/public/home/hero/vendor/webgpu-black-hole/blackhole.d.ts`: `uniforms: Record<string, { value: unknown }>`.
- `frontend/src/modules/public/home/hero/vendor/webgpu-black-hole/defaults.d.ts`: aggiunto `diskBrightness`.
- `frontend/src/modules/public/home/hero/HeroSequence.tsx`: niente `nameRef`; il titolo arriva in scala da 1.18 a 1; tolta la ri-misura dopo il caricamento dei font.
- `frontend/src/modules/public/home/hero/HeroCopy.tsx`: `h1` = `texts.home.title`, senza il nome.
- `frontend/src/modules/public/home/hero/HomeHero.test.tsx`, `home/HomePage.test.tsx`, `shared/texts.test.ts`: allineati alla nuova copy.
- `frontend/src/shared/texts.ts`, `PROFILE.md`: nuova copy della Home (titolo, sottotitolo, hint di scroll, etichette dei numeri, «Write to me»).
- `frontend/src/modules/public/Header.tsx`, `Header.module.css` (nuovo), `PublicLayout.tsx` (+ test): isola sticky di vetro (Codex).
- `frontend/src/index.css`: token `--header-glass-*` (superficie al 72%, blur 24px; `saturate(180%)` è in `Header.module.css`); `h1` nella regola di rivelazione da tastiera.

## Dove vogliamo andare

1. Fai provare all'owner `http://localhost:5173/` (da `frontend/`: `npm.cmd run dev -- --host=127.0.0.1`) e raccogli le regolazioni. Dove intervenire:
   - tempi: `HERO` in `heroTimeline.ts`;
   - densità, velocità e curvatura del tunnel: `tunnelCount`, `uTravel`, `project()` in `heroScene.ts`;
   - aspetto delle stelle: lo shader `stars`.
2. Chiedi all'owner se aggiornare `brand-guidelines.md` (header a isola di vetro, hero con tunnel scuro e senza nome, eccezione al divieto dei gradienti). Scrivi solo con il suo accordo.
3. Dopo l'accettazione proponi lo Status di `PROJECT.md`, poi chiedi se fare il commit. Non decidere da solo commit, merge o push.
4. Applica la skill `design-taste-frontend` al resto della Home e alle altre pagine pubbliche (Projects, CV, About), una sezione alla volta.
5. Prova su un telefono reale: raymarching, bloom e 1650 streak pesano.

## Da sapere prima di toccare qualcosa

- Leggi `PROJECT.md`, `PROFILE.md`, `AGENTS.md`, `brand-guidelines.md`. Le richieste recenti dell'owner superano `brand-guidelines.md` su header e hero, finché l'owner non approva l'aggiornamento del file.
- Non toccare gli handoff precedenti, le dieci `rock-*.webp` non tracciate e `docs/handoff/2026-11-15-public-frontend-2.md`.
- Shell: npm solo da `frontend/` (`npm.cmd` in PowerShell), dotnet da `backend/`. Formattazione: `npx prettier --no-semi --single-quote --print-width 120 --write <file>`.
- Python non è installato su questa macchina: per le modifiche usa Edit o sed.
- Shader: niente `smoothstep` con i bordi invertiti. `uTravel` va sempre riportato in [0,1).
- `render()` della scena restituisce `alive`: il RAF continua finché il buco o il tunnel sono visibili e si ferma sul bianco finale. Tornando indietro riparte tramite lo scheduler di `HeroSequence`.
- Il verde dei link attivi sul vetro al 72% scende a circa 2,5:1 solo sopra contenuti scuri. Sulla Home non ci sono link attivi.
- Browser Orca: skill `orca-cli`, sempre `--page`; dopo un reload rifai `orca viewport --width 1440 --height 900`. Helper per gli screenshot: `shot.sh p1 p2 …` nella scratchpad (non persistente). Formula per p: `window.scrollTo(0, p * (document.querySelector('section[data-hero]').offsetHeight - innerHeight))`.
- Il bundle `heroScene` è circa 1,2 MB (circa 323 kB gzip), caricato dinamicamente: l'avviso di Vite sui chunk oltre 500 kB è noto.
