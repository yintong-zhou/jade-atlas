---
type: handoff
date: 2026-11-15
status: implementato e verificato, in attesa della prova dell'owner
seq: 4
prev: docs/handoff/2026-11-15-scroll-animations-3.md
tags: [jade-atlas, frontend, home-hero, scroll-animations, three.js, webgpu, black-hole]
---

# Handoff: buco nero verde ruotabile in 3D

## Obiettivo

Costruire il portfolio pubblico dell'owner con un'introduzione distintiva guidata dallo scroll nativo. Direzione attuale: su sfondo bianco, stelle verdi vengono risucchiate da un buco nero centrale (circa metà viewport) preso dal progetto `dgreenheck/webgpu-black-hole`. Dopo l'ultima stella il buco nero collassa su se stesso, un impulso verde fa esplodere fuori il nome «Yintong Zhou.», poi compare il resto del testo. Il buco nero deve essere fedele all'originale e ruotabile in 3D col trascinamento.

## A che punto siamo

- Branch `feat/scroll-animations`, HEAD ancora `d42ce9c`. **Tutto è nel working tree, senza commit/push/merge.** File nuovi non tracciati e cancellazioni intenzionali: non fare reset/clean.
- Implementata l'ultima richiesta dell'owner («controlla e correggi, rendi come nel repo girabile in 3D, copia il progetto»): progetto upstream copiato per intero, simulazione/defaults/camera prospettica/OrbitControls/bloom originali, palette verde su bianco, sequenza di scroll invariata.
- Il disco si anima anche a scroll fermo; il loop si sospende fuori viewport, a scheda nascosta (`visibilitychange`) e dopo il collasso.
- Trascinamento col mouse = orbita 3D. Rotella = scroll pagina (zoom/pan disabilitati). Touch verticale libero (`touch-action: pan-y pinch-zoom`).
- **Verifiche rilanciate a fine sessione:** frontend `npm run lint`, `npm run build`, `npm run test` OK: **90 test, 24 file**. Backend `dotnet build` OK; `dotnet test` non trova test.
- Verificati nella sessione precedente in Orca: desktop 1440×900, mobile 375×812, scroll inverso, fallback statico 667×375, perdita contesto, backend WebGL2 con `navigator.gpu` disabilitato, rotazione col drag e rotella che scorre la pagina.
- L'owner non ha ancora visto la versione 3D. Non provato su telefono reale. `PROJECT.md` Status ancora vecchio. Task 8–9 del vecchio piano non iniziati.

## Cosa abbiamo provato che NON ha funzionato

- **Prima integrazione del buco nero con parametri visivi modificati e camera fissa, senza bloom:** l'owner l'ha respinta mandando lo screenshot del demo originale. Non semplificare di nuovo shader/camera: usare `BlackHoleSimulation` e `defaults.js` upstream.
- **Sfondo opaco del demo (`colorNode`):** copriva il bianco. Ora `fragmentNode = colorNode` per conservare l'alpha di copertura, più boost della copertura nel pipeline di output.
- **Stelle/nebulose procedurali dello shader:** disabilitate (`starsEnabled: false`, `nebulaEnabled: false`) perché le stelle devono essere quelle separate, guidate dallo scroll, che finiscono tutte nel buco.
- **Zoom con la rotella in OrbitControls:** rubava lo scroll della pagina. Disabilitato.
- Strade scartate nelle sessioni precedenti (fotogrammi roccia, roccia singola con frammenti, nome come nuvola di punti, cielo di giade): vedi `prev`. Non ripristinarle.

## Problemi incontrati e come li abbiamo risolti

- **`renderer.dispose()` restituisce una Promise in Three r187** e riattende `init()`: se l'init GPU fallisce, il cleanup generava una rejection non gestita. Ora `await` in try/catch; regressione in `blackHoleLayer.test.ts` con dispose asincrona che rifiuta.
- **API rinominata:** il `PostProcessing` del demo in Three r187 si chiama `RenderPipeline`.
- **Costo dello shader raymarching:** risoluzione del solo canvas del buco nero limitata (`Math.min(1.5, 1440/width, 1000/height)`, pixel ratio 1); stelle e lettere restano nitide.

## Decisioni prese

- **Owner:** buco nero e tutte le luci in verde; dove c'è colore, adattato al tema bianco. Scartato il look scuro originale.
- **Owner:** copiare il progetto upstream intero e renderlo ruotabile in 3D. Scartata la versione semplificata a camera fissa.
- **Implementazione:** sorgenti vendorizzati con licenza MIT in `hero/vendor/webgpu-black-hole/` (commit `cf2fca75`), invece di una dipendenza npm (il repo è una demo, non un pacchetto). Licenza servita anche in `/licenses/webgpu-black-hole.txt`.
- **Implementazione:** `WebGPURenderer` su un secondo canvas decorativo; fallback automatico su WebGL2. Se l'init fallisce resta l'hero statico completo.
- **Implementazione:** GUI delle impostazioni e flythrough cinematico del demo copiati ma non montati.
- Nessuna modifica a stack, backend, DB o produzione. Nessuna decisione su commit/PR/merge.

## File toccati

- `frontend/src/modules/public/home/hero/blackHoleLayer.ts` **nuovo**: renderer WebGPU, camera, OrbitControls, bloom, composizione su bianco, resize, dispose sicuro.
- `frontend/src/modules/public/home/hero/blackHoleLayer.test.ts` **nuovo**: lifecycle, controlli, dispose asincrona che rifiuta.
- `frontend/src/modules/public/home/hero/vendor/` **nuovo**: progetto upstream completo + `LICENSE`, `README.md` con le modifiche elencate; `blackhole.d.ts`/`defaults.d.ts`/`defaults.js` aggiunti dall'host; `blackhole-shader.js` modificato (radiazione giada, uniform `sceneScale`, alpha di copertura).
- `frontend/public/licenses/webgpu-black-hole.txt` **nuovo**: licenza MIT distribuita.
- `frontend/src/modules/public/home/hero/heroScene.ts`: stelle verdi al posto delle giade, monta il layer del buco nero, passa `holeScale`.
- `frontend/src/modules/public/home/hero/heroTimeline.ts` (+ test): stelle assorbite prima del collasso, collasso prima del nome, impulso limitato e reversibile.
- `frontend/src/modules/public/home/hero/HeroSequence.tsx`: secondo canvas, sospensione su `visibilitychange`.
- `frontend/src/modules/public/home/hero/HeroModelSequence.test.tsx`: regressione pausa a scheda nascosta.
- `frontend/src/shared/texts.ts`: testi hero (hint di scroll).
- `docs/superpowers/plans/2026-11-15-green-black-hole.md` **nuovo**: piano e risultati; la sezione «Owner correction» ha ancora le checkbox non spuntate anche se il lavoro è fatto.

## Dove vogliamo andare

1. **Fai provare all'owner la versione 3D** su `http://localhost:5173/` (da `frontend/`: `npm.cmd run dev -- --host=127.0.0.1`) e raccogli le regolazioni. Non tornare alla versione a camera fissa.
2. **Applica le regolazioni nel punto giusto:** tempi in `heroTimeline.ts`; stelle/glifi/montaggio in `heroScene.ts`; camera/controlli/bloom/composizione in `blackHoleLayer.ts`; aspetto del disco in `vendor/.../blackhole-shader.js` o nei `defaults.js` passati alla simulazione.
3. **Prova su telefono reale** (shader raymarching + bloom pesano) prima di promettere fluidità.
4. Spunta le checkbox «Owner correction» nel piano `green-black-hole.md`.
5. Dopo l'accettazione: proponi l'aggiornamento di Status in `PROJECT.md` (scrivi solo con l'accordo), poi chiedi se fare commit e se riprendere i Task 8–9. Non decidere da solo commit/merge/push.

## Da sapere prima di toccare qualcosa

- Leggi `PROJECT.md`, `PROFILE.md`, `AGENTS.md`, `brand-guidelines.md`; le richieste recenti dell'owner superano la descrizione della roccia ancora in PROJECT.md e nei documenti storici.
- Non toccare gli handoff precedenti, le dieci `rock-*.webp` non tracciate e `docs/handoff/2026-11-15-public-frontend-2.md`.
- Shell: npm solo da `frontend/` (`npm.cmd` in PowerShell), dotnet da `backend/`. Formattazione: `npx.cmd prettier --no-semi --single-quote --print-width 120 --write <file>` da `frontend/`.
- Il bundle `heroScene` è ~1,23 MB (322 kB gzip), caricato dinamicamente: il warning Vite >500 kB è noto.
- I mock dei test per `renderer.dispose` devono essere asincroni: un mock sincrono nasconde la rejection.
- Il canvas del buco nero ha `pointer-events: auto` mentre è visibile e `none`/`hidden` dopo il collasso: se un click sull'hero non arriva al testo, guardare lì.
- Browser Orca: skill `orca-cli`, sempre `--page`, screenshot `--scale 1`; dopo `scrollTo` attendere ~1,5 s per la spring. Per p: `window.scrollTo(0, p * (document.querySelector('section[data-hero]').offsetHeight - innerHeight))`.
- «Nessun test disponibile» di `dotnet test` non significa test backend passati.
