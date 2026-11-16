---
type: handoff
date: 2026-11-15
status: implementato e verificato, in attesa della prova dell'owner
seq: 3
prev: docs/handoff/2026-11-15-scroll-animations-2.md
tags: [jade-atlas, frontend, home-hero, scroll-animations, three.js, navbar]
---

# Handoff: cielo di giade, vortice e navbar centrale

## Obiettivo

Costruire il portfolio pubblico dell'owner con un'introduzione distintiva e fluida, guidata dallo scroll nativo. La direzione più recente è un cielo di piccole giade su bianco: vengono risucchiate in basso al centro e dal vortice emergono le lettere che cadono e rimbalzano formando «Yintong Zhou.». Navbar e pagina devono sembrare una superficie unica.

## A che punto siamo

- Branch `feat/scroll-animations`, HEAD ancora `d42ce9c`. **Tutto il lavoro di questa sessione è nel working tree, senza commit, push o merge.** Ci sono file nuovi non tracciati e cancellazioni intenzionali: non fare reset/clean.
- Ultima richiesta implementata: navbar con nome e link raccolti al centro, senza logo né divisore; cielo Three.js, risucchio a spirale nel vortice inferiore, lettere lanciate verso l'alto che ricadono con rimbalzo e compongono il nome. Seguono ruolo, sottotitolo e pulsanti.
- Three.js: 1100 istanze desktop, 440 mobile, geometria condivisa di 252 vertici/500 triangoli, venature procedurali e materiale riflettente. Risucchio nel vertex shader. Lettere visive da un atlante condiviso; il vero h1 rimane un testo HTML non spezzato.
- Motion controlla scroll e spring; AnimeJS fornisce `outCubic` e `outBounce`. Rendering solo su richiesta e se visibile; DPR massimo 2. Nessuna nuova dipendenza.
- Reduced motion, viewport sotto 560px e problemi WebGL mostrano subito il testo completo su bianco, senza vecchia immagine. Focus da tastiera continua a rivelare lo stato finale.
- **Ultime verifiche:** frontend `npm run lint`, `npm run build`, `npm run test` riusciti: **79 test, 23 file**. Backend `dotnet build` riuscito senza warning; `dotnet test` termina ma **non trova test** nel progetto esistente.
- Browser Orca: controllati scena iniziale, risucchio, lancio/rimbalzo, nome finale, crossfade HTML e scroll inverso a 1440×900 e 375×812; assenza di overflow anche a 768/1024px. A 667×375 ritorna allo statico. Navbar mobile misurata al centro esatto, bordo 0px, sfondo trasparente.
- Probe di scroll su 90 frame nel browser desktop a viewport mobile: mediana 6,1ms, p95 6,2ms. **Non è una misura su telefono reale né con CPU rallentata.** Vite conserva il warning dei chunk JS sopra 500kB; Three.js resta nel chunk dinamico separato. Nessuna vecchia immagine hero entra nel build finale.
- Revisione indipendente mirata conclusa: nessun rilievo importante sull'ultima implementazione. Nessun worker rimasto attivo.
- L'owner non ha ancora dato riscontro sull'ultima versione. Task 8–9 del vecchio piano (barra di avanzamento e animazioni delle altre sezioni/pagine) non iniziati. `PROJECT.md` non aggiornato: il suo Status è ancora quello vecchio e non descrive il codice attuale.

## Cosa abbiamo provato che NON ha funzionato

- **Fotogrammi della roccia/giada:** funzionavano, ma l'owner ha cambiato direzione, prima chiedendo un vero modello Three.js, poi eliminando la pietra singola. Non ripristinare la sequenza di immagini.
- **Singola roccia con 20 frammenti e nucleo di giada:** implementata e verificata come passaggio intermedio; scartata esplicitamente dall'owner a favore del cielo di piccole giade. La geometria riutilizzabile è conservata, ma guscio e roccia grande non vengono renderizzati.
- **Campionare il nome come una nuvola di punti:** non soddisfa l'ultima richiesta di lettere intere che emergono e rimbalzano. Ora si usano glifi visivi separati su canvas, mantenendo intatto l'h1 HTML.
- **Canvas con `textBaseline = 'middle'`:** causava due nomi sfalsati verticalmente durante il crossfade. Ora baseline alfabetica calcolata da `fontBoundingBoxAscent/Descent` e altezza della riga CSS.
- **Larghezza del testo con letter spacing su N−1 caratteri:** il browser lo include anche dopo l'ultimo carattere; produceva un piccolo disallineamento orizzontale. Il calcolo corrente usa N.
- **Giade dietro i link della navbar:** peggioravano la leggibilità. La distribuzione lascia libera una zona centrale in alto, senza aggiungere un pannello o un bordo.

## Problemi incontrati e come li abbiamo risolti

- **Buffer GPU sostituiti a ogni resize:** la revisione della versione intermedia ha rilevato che rimpiazzare `BufferAttribute` lasciava buffer precedenti senza eliminazione esplicita. Corretto e coperto da regressione. Nell'implementazione attuale `instanceMatrix` resta lo stesso; ogni vecchio atlante viene esplicitamente eliminato prima della sostituzione. `heroScene.test.ts` verifica riuso e disposal.
- **Vitest verde, TypeScript rosso:** una verifica del materiale con `'map' in material` intercettava anche `Array.map` nel tipo unione. Corretto usando il tipo concreto `MeshBasicMaterial`. Eseguire sempre il build, non solo Vitest.
- **Screenshot presi prima della fine della spring:** mostravano stati intermedi ingannevoli. Dopo `scrollTo`, attendere circa 1,3–1,5 secondi prima della cattura.
- **HMR durante regolazioni di font/atlante:** per verificare l'allineamento definitivo è stato necessario controllare anche dopo un reload completo e caricamento dei font, non fidarsi soltanto della scena già aperta.
- **Npm invocato dalla root:** non esiste `package.json` lì. Npm va eseguito in `frontend/`; dotnet in `backend/`.
- **PowerShell e argomenti npm:** per il server usare `npm.cmd run dev -- --host=127.0.0.1`; la prima variante con `npm` e `--host 127.0.0.1` aveva passato l'indirizzo come root di Vite.

## Decisioni prese

- **Owner:** navbar centrale, senza simbolo accanto al nome e senza linea col body; sostituisce il vecchio header distribuito ai lati.
- **Owner:** cielo pieno di piccole giade dettagliate, risucchio in basso al centro, lettere intere lanciate e rimbalzanti; sostituisce roccia/giada singola e relativo guscio. Le vecchie regole generiche contro bounce/rotazione sono superate per questo hero e aggiornate nelle brand guidelines.
- **Implementazione:** instancing e shader per le giade, invece di centinaia di oggetti React o trasformazioni JS per ogni pietra; dodici glifi visibili circa con geometrie leggere e atlante condiviso, invece di spezzare il DOM.
- **Implementazione:** modalità statica solo testo, invece della vecchia immagine di giada, perché quest'ultima rappresenterebbe la direzione scartata.
- **Owner:** conservare materiale riutilizzabile. Immagini originali, fotogrammi su disco, script di generazione, sampling e vecchia costruzione del guscio restano disponibili. Rimossi soltanto i moduli attivi del playback ormai superato.
- Nessuna modifica a stack, backend, DB o produzione. Nessuna nuova direttiva. Nessuna decisione su commit, PR o merge.

## File toccati

- `frontend/src/modules/public/Header.tsx`: gruppo centrale, superficie trasparente, senza logo/divisore.
- `frontend/src/index.css`: altezza header 64px; conservate regole per il focus nell'hero, rimossa maschera delle vecchie immagini.
- `frontend/src/modules/public/home/hero/heroScene.ts` **nuovo, non tracciato**: scena WebGL, giade instanziate, shader del risucchio, vortice, atlante e posizionamento delle lettere, cleanup.
- `frontend/src/modules/public/home/hero/heroTimeline.ts`: tempi della nuova sequenza, `modelState`, `glyphPose`, budget `HERO.gems`, curve AnimeJS e comportamento dei pulsanti.
- `frontend/src/modules/public/home/hero/HeroSequence.tsx`: riusa scroll/spring/observer/focus, un solo canvas e caricamento dinamico della nuova scena.
- `frontend/src/modules/public/home/hero/HomeHero.tsx`: fallback di testo su bianco continuo con l'header, senza immagine.
- `frontend/src/modules/public/home/hero/stoneModel.ts` **nuovo, non tracciato**: `stonePoint`, `createJadeGeometry` riusati dal cielo; `createStoneGeometry` col guscio intermedio conservato come utility, non chiamato dalla scena attuale.
- `frontend/src/modules/public/home/hero/{HeroModelSequence.test.tsx,heroScene.test.ts,stoneModel.test.ts}` **nuovi, non tracciati**: lifecycle/fallback/budget mobile, buffer/texture/disposal, geometria.
- `frontend/src/modules/public/home/hero/{heroTimeline.test.ts,HomeHero.test.tsx}`: nuova coreografia, rimbalzo, determinismo e fallback senza immagini.
- Eliminati: `hero/{dust.ts,frameCanvas.ts,frameCanvas.test.ts,heroFrames.ts,heroFrames.test.ts,HeroSequence.test.tsx}`. I test dell'integrazione sono sostituiti da `HeroModelSequence.test.tsx`.
- `brand-guidelines.md`: navbar e nuova animazione con eccezioni esplicite per glifi/bounce/spirale.
- `docs/superpowers/plans/2026-11-15-jade-sky-hero.md` **nuovo**: piano corrente e risultati delle verifiche.
- `docs/superpowers/plans/2026-11-15-threejs-hero.md` **nuovo**: piano intermedio della pietra, marcato superato.
- `docs/superpowers/specs/2026-11-15-scroll-animations-design.md`: annotazioni in testa indicano che la nuova richiesta supera la vecchia soluzione a fotogrammi.

## Dove vogliamo andare

1. **Fai provare all'owner navbar e nuovo hero**, riprendendo da questa versione, e raccogli eventuali regolazioni. L'ultimo messaggio gli ha già indicato `http://localhost:5173/`; attendi il suo riscontro invece di tornare alle vecchie scelte.
2. **Applica eventuali regolazioni nel punto corretto:** tempi/rimbalzo in `heroTimeline.ts`, distribuzione/materiale/vortice/atlante in `heroScene.ts`. Mantieni h1 accessibile, fallback, scroll nativo e rendering a richiesta.
3. **Prova su telefono reale e, se utile, CPU rallentata** prima di promettere fluidità universale. La simulazione nel browser desktop è già positiva ma non sostituisce questi controlli.
4. **Dopo l'accettazione dell'hero, riprendi i Task 8–9** di `docs/superpowers/plans/2026-11-15-scroll-animations.md` se l'owner vuole continuare con le animazioni delle altre pagine. Non considerarli già fatti.
5. **Proponi l'aggiornamento di Status in PROJECT.md**, scrivendolo solo con l'accordo dell'owner. Non decidere da solo commit/merge/push.

## Da sapere prima di toccare qualcosa

- Leggi prima `PROJECT.md`, `PROFILE.md`, `AGENTS.md`, `brand-guidelines.md`; la richiesta più recente e il piano jade-sky superano la descrizione della roccia ancora presente in PROJECT.md e nei documenti storici.
- Non toccare gli handoff precedenti e le dieci immagini `rock-*.webp` già non tracciate all'inizio della sessione. Anche `docs/handoff/2026-11-15-public-frontend-2.md` è preesistente e non tracciato.
- Non serve rigenerare i fotogrammi: la scena attuale non li carica e non li include nel build.
- Dev server avviato in questa sessione su `127.0.0.1:5173`; potrebbe non sopravvivere alla chiusura. Verifica prima di avviarne un altro.
- Shell PowerShell; Python solo `py -3 -I`. Formattazione: `npx.cmd prettier --no-semi --single-quote --print-width 120 --write <file>` da `frontend/`.
- Browser di Orca: usa la skill `orca-cli`, leggi il riferimento browser. Tab usata: `24f3b5bd-44b8-4ec5-9c67-de72cdfafdbf`, ultima viewport 1440×900 a inizio pagina; l'ID potrebbe non sopravvivere. Specifica sempre `--page`. Screenshot con `--scale 1`, perché scale 2 dava mosaici nella sessione precedente. Reload/goto possono resettare la viewport.
- Per p: `window.scrollTo(0, p * (document.querySelector('section[data-hero]').offsetHeight - innerHeight))`, poi attendi la spring. Per JS in PowerShell usa stringa esterna con doppi apici e selettori JS con apici singoli, evitando doppi apici interni che il passaggio degli argomenti può eliminare.
- Il numero delle giade si sceglie al montaggio; un resize desktop→mobile conserva il budget desktop fino al rimontaggio. Per una prova mobile autentica rimonta la scena, per esempio passando dalla modalità orizzontale statica al ritratto.
- Per completare: da `frontend/`, `npm run lint`, `npm run build`, `npm run test`; da `backend/`, `dotnet build`, `dotnet test`. Il warning Vite >500kB è noto; «nessun test disponibile» di dotnet non significa test backend passati.
