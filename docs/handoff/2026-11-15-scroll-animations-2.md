---
type: handoff
date: 2026-11-15
status: in attesa dell'owner (pausa dopo il Task 7)
seq: 2
prev: docs/handoff/2026-11-15-scroll-animations.md
tags: [jade-atlas, frontend, home-hero, scroll-animations, three.js, codex]
---

# Handoff: animazioni di scroll, hero della Home fatto

## Obiettivo

La Home di `jade-atlas` racconta il nome del progetto con un gesto: su fondo bianco un sasso grigio si crepa, rivela la giada, si dissolve in polvere e la polvere compone "Yintong Zhou." in verde giada. Lo guida lo scroll nativo. Poi ogni pagina pubblica deve avere animazioni di scroll sobrie. L'owner mette la fluidità sopra tutto e ha chiesto di lavorare insieme a Codex.

## A che punto siamo

- **Fatto e committato (Task 1–7 del piano), branch `feat/scroll-animations`, 11 commit da `c4eaee7` a `d42ce9c`.** Nessun push, nessun merge.
- L'hero usa i 240 fotogrammi consegnati dall'owner, ridotti a 120 a 720px per desktop (3,6 MB) e 60 a 480px per telefono (0,9 MB). Particelle three.js nel finale, caricate a parte (chunk `dust-*.js`).
- **Verifiche:** lint, build e test passano (94 test). Controllato nel browser di Orca a 1440×900, a 375×812 dopo un resize a sequenza avviata, e a 667×375, dove passa da solo alla versione statica. Controllata anche la ricarica oltre l'hero: lo stato finale è subito visibile.
- **Codex:** ha approvato il piano al 4° giro dopo 14 rilievi, tutti integrati. Ha poi ispezionato il codice due volte: 3 rilievi corretti, il 4° lasciato all'owner (vedi "Dove vogliamo andare").
- **Non misurato:** prova in DevTools con CPU rallentata 4×, sensazione su un telefono vero, interruttore reduced motion del sistema operativo (coperto solo dai test).
- **Non iniziato:** Task 8 (linea di avanzamento) e Task 9 (comparsa dei blocchi, riempimento della timeline del CV, aggiornamento dei documenti).
- **Siamo fermi alla pausa del Task 7:** l'owner deve provare l'hero e dare il via. Il messaggio all'owner è già stato mandato.

## Cosa abbiamo provato che NON ha funzionato

- **Maschera radiale per sfumare i bordi dei fotogrammi:** tagliava i frammenti del guscio in un disco visibile (fotogrammi ~48–100). Sostituita da due gradienti lineari intersecati (`.hero-feather` in `index.css`).
- **Colore accento passato a three.js con `new Color(accent)`:** il nome di particelle usciva più scuro di `--color-accent`, perché three.js tiene i colori in spazio lineare e lo `ShaderMaterial` scrive i valori grezzi. Corretto con `.convertLinearToSRGB()`.
- **Spazio iniziale dentro lo span del resto del titolo:** il nome accessibile dell'h1 perdeva lo spazio ("Zhou.Fullstack"). Ora lo spazio è un nodo di testo `{' '}` tra i due span.
- **Opacità delle particelle applicata sia al canvas sia allo shader:** la dissolvenza risultava al quadrato. Ora dissolve solo il canvas e `render(travel, 1)`.
- **Il runner di claudex-loop rifiuta gli artefatti dentro il repo** (`.tmp/` compreso): vanno nella scratchpad di sessione.
- **Screenshot di Orca con `viewport --scale 2 --mobile`:** l'immagine esce a mosaico. Usare `--scale 1`. Inoltre `reload` e `goto` ripristinano la finestra grande: impostare la viewport dopo il caricamento.
- **`cat <<'EOF'` in Git Bash con un file TSX lungo:** errore "unexpected EOF" e nessun file scritto. Usare il tool Write.

## Problemi incontrati e come li abbiamo risolti

- **Test: `intersect` puntava all'observer sbagliato.** Anche `Reveal` crea degli `IntersectionObserver`, quindi ora il test aggancia solo l'observer che osserva `[data-hero]`.
- **Un `requestAnimationFrame` già in coda disegnava anche dopo che l'hero era uscito dallo schermo.** Ora `draw()` ricontrolla la visibilità e segna l'hero come da ridisegnare.
- **`tsc -b` trova errori che vitest non vede** (parameter properties con `erasableSyntaxOnly`, tipi dei mock). Lanciare sempre `npx tsc -b` o `npm run build`, non solo i test.
- **ESLint `react-refresh/only-export-components`:** niente funzioni esportate dai file dei componenti. Per questo `copyState` sta in `heroTimeline.ts`.
- **Un mio `git add -A frontend/src` ha committato le 10 immagini fisse non usate** (`rock-*.webp`). Le ho tolte dal tracking con `d42ce9c`; restano su disco e nella storia locale di `db30a5e`.

## Decisioni prese

Owner (sessione precedente): strada B con la sequenza di fotogrammi, three.js solo per le particelle, ogni pagina animata. Oggi: "lavora insieme a Codex".

Mie, registrate come `Ruling:` nel ledger `.superpowers/sdd/2026-11-15-scroll-animations/progress.md`:

- **Pacchetto spostato da `frontend/public/rock-sequence-v2/` a `.tmp/hero-sequence/`.** In `public/` il build avrebbe copiato 88 MB nel sito.
- **Fotogrammi:** 120 a 720px e 60 a 480px, scelti a distanza regolare con primo e ultimo inclusi. Scartato l'uso di tutti i 240 a 1254px: troppo peso e troppa memoria.
- **Timeline a nodi** (`HERO.track`): progresso dello scroll → posizione nella sequenza, a tratti lineari, con una pausa sulla giada intatta tra p=0,44 e p=0,52. Scartata la mappatura lineare: la pausa sulla giada sarebbe sparita.
- **Hero statico** sotto reduced motion, sotto i 560px di altezza e quando nessun fotogramma si carica. Passa da una modalità all'altra al volo se cambiano la viewport o la preferenza.
- **Stato finale con il focus da tastiera** imposto da due regole CSS con `!important` su `[data-revealed="true"]`. Motion continua a gestire i valori.
- **Pulsanti cliccabili da p ≥ 0,98** (`HERO.interactive`), cioè quando sono visibili almeno a metà.
- **`.hero-feather` con `filter: brightness(1.012)`** per portare a bianco puro lo sfondo 253–254 dei fotogrammi. Applicata anche alla giada dell'hero statico.
- **Rilievo di Codex sul nome non centrato sul sasso: NON corretto, lasciato all'owner.** Centrare il blocco titolo + sottotitolo + pulsanti invece del solo nome evita di tagliare il contenuto sugli schermi tra 560 e 700px di altezza. Il nome si forma comunque dentro la sagoma del sasso.
- **Non interrotto un count-up già partito se reduced motion si attiva durante i suoi 0,8 s.** Un count-up che non è ancora partito invece si blocca.
- **Ispezione finale fatta da Codex** in sessione nuova (claudex-loop), al posto di un sottoagente Claude.

## File toccati

- `docs/superpowers/plans/2026-11-15-scroll-animations.md`: revisione 2, adattato ai fotogrammi e alle correzioni di Codex (hash approvato `a5f46125…`).
- `execution/build_hero_frames.py`, `execution/test_build_hero_frames.py`: generano e controllano i fotogrammi web.
- `frontend/src/assets/home-hero/seq/{large,small}/f_NNN.webp`: fotogrammi generati.
- `frontend/src/modules/public/home/hero/`:
  - `heroTimeline.ts`: numeri, `frameAt`, `layers`, `copyState`.
  - `sampling.ts`: campionamento dei pixel.
  - `heroMode.ts`: scelta della modalità e controllo WebGL.
  - `heroFrames.ts`: elenco dei fotogrammi con glob.
  - `frameCanvas.ts`: caricamento e disegno, massimo 6 richieste insieme.
  - `HeroCopy.tsx`, `HeroSequence.tsx`, `HomeHero.tsx`.
  - `dust.ts`: l'unico file che importa three.
  - I test di ognuno.
- `frontend/src/modules/public/home/useCountUp.ts` (+ test): sostituisce `useHomeIntro`, che è stato cancellato.
- `frontend/src/modules/public/home/HomePage.tsx`: hero sopra il `Container`, numeri in un `Reveal` proprio.
- `frontend/src/modules/public/Header.tsx`: `relative z-10 h-(--header-height)`.
- `frontend/src/index.css`: aggiunti `--header-height`, le regole del focus e `.hero-feather`; tolto `--motion-intro-step`.
- `frontend/src/shared/texts.ts`: aggiunto `home.scrollHint`.
- `frontend/src/shared/motion.ts`: aggiunto `reducedMotionQuery`.
- `frontend/src/test/media.ts`: `stubMatchMedia` accetta un booleano o una funzione; aggiunto `fireMediaChange`.
- `brand-guidelines.md`: fotogrammi, eccezione dei pulsanti, regole della modalità statica, token count-up.
- `frontend/package.json`: `three`, `@types/three`.

## Dove vogliamo andare

1. **Aspetta il riscontro dell'owner sull'hero** (`npm run dev` in `frontend/`). Il dev server delle prove non è più attivo. Applica eventuali regolazioni cambiando solo i numeri in `HERO` (`heroTimeline.ts`) e `uSize`/`uSwirl` in `dust.ts`.
2. **Fatti dire dall'owner:**
   - (a) se il nome va centrato esattamente sul sasso: è il rilievo di Codex SA-001/SCROLL-004. Il costo è spostare il blocco del testo in `HeroSequence.tsx` e passare allo statico quando non c'è spazio;
   - (b) se cancellare `frontend/src/assets/home-hero/rock-*.webp`, che non sono tracciati né usati.
3. **Dopo il via, esegui i Task 8–9 del piano** con `superpowers:executing-plans`. Il ledger è in `.superpowers/sdd/2026-11-15-scroll-animations/progress.md`: i Task 1–7 sono già segnati come completi. Nel Task 8 la barra usa la sua misura (`scrollY / max`) e non `useScroll`: è una correzione di Codex già scritta nel piano.
4. **Alla fine del Task 9:** ispezione Codex in sessione nuova con base `c4eaee7`. Poi proponi all'owner il testo di "Status" per `PROJECT.md` e scrivilo solo dopo il suo sì.

## Da sapere prima di toccare qualcosa

- **Runner di claudex-loop:** `py -3 -I "C:/Users/zhouy/.claude/plugins/cache/claudex-loop/claudex-loop/2.1.0/skills/claudex-loop/scripts/runner.py"`. Usa `--artifacts` fuori dal repo (scratchpad). Le revisioni e ispezioni durano 5–15 minuti: lanciale in background.
- **Log del giro con Codex:** `.tmp/claudex/PLAN-REVIEW-LOG.md`, non committato. Gli artefatti dei risultati stavano nella scratchpad della sessione precedente e potrebbero non esserci più.
- **Formattazione:** non c'è una config prettier nel repo. Lo stile è senza punto e virgola, apici singoli, 120 colonne: `npx prettier --no-semi --single-quote --print-width 120 --write <file>`.
- **Verifica completa:** `npm run lint`, `npm run build` (che include `tsc -b`), `npm run test`. Il warning di Vite sui chunk oltre 500 kB è atteso, sia per `index` sia per `dust`.
- **In dev** il glob eager con `?url` produce 180 piccole richieste di moduli. Non è un difetto: in produzione gli URL sono incorporati.
- **Browser di Orca:** `orca tab create --url …`, poi `orca viewport … --scale 1`, `orca eval`, `orca screenshot`. Per scorrere a un progresso p: `scrollTo(0, section.offsetTop + p*(section.offsetHeight-innerHeight))`, poi aspetta circa 2,5 s per la spring.
- **Restano non tracciati e vanno lasciati così:** `docs/handoff/*`, e la decisione su `merge/PR` di `feat/public-frontend` (handoff `public-frontend-2`). Non decidere da solo.
- **Shell:** Python solo con `py -3 -I`; npm da `frontend/`, git dalla radice. Parla all'owner in italiano; codice e commit in inglese.
