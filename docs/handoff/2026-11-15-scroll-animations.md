---
type: handoff
date: 2026-11-15
status: in attesa di approvazione del piano
seq: 1
prev: nessuno
tags: [jade-atlas, frontend, home-hero, scroll-animations, three.js]
---

# Handoff: animazioni di scroll (hero della Home e pagine pubbliche)

Lavoro nuovo, distinto dalla catena `public-frontend` (ultimo: `docs/handoff/2026-11-15-public-frontend-2.md`, le cui due decisioni in sospeso restano aperte: vedi in fondo).

## Obiettivo

Il progetto si chiama `jade-atlas` e la Home deve raccontarlo con un gesto: su fondo bianco c'è solo un sasso grigio; scorrendo si crepa, si rivela giada, si dissolve in polvere, e la polvere compone il nome "Yintong Zhou." in verde giada. Il resto della pagina resta minimale. L'owner vuole inoltre che ogni pagina pubblica sia animata nello scroll, e mette la fluidità sopra tutto.

## A che punto siamo

- **Design approvato dall'owner:** `docs/superpowers/specs/2026-11-15-scroll-animations-design.md` (già passato dal controllo di un revisore).
- **Piano scritto, NON ancora approvato:** `docs/superpowers/plans/2026-11-15-scroll-animations.md`. 9 task: 1–7 hero della Home, 8–9 altre pagine, con una pausa per l'owner dopo il 7 e dopo il 9.
- **In sospeso, risposta dell'owner:** (a) il piano va bene? (b) esecuzione nativa (consigliata) o con sottoagenti?
- **Fatto su disco, niente commit:** immagini convertite in WebP; `PROJECT.md` e `brand-guidelines.md` aggiornati con le nuove regole (su istruzione dell'owner).
- **Non iniziato:** tutto il codice. `three` non è installato. Il branch `feat/scroll-animations` non esiste ancora; siamo su `feat/public-frontend`.

## Cosa abbiamo provato che NON ha funzionato

- **3D in tempo reale del sasso (three.js/WebGL con modelli GLB):** scartato. La sequenza non è interattiva, quindi dal vivo e pre-renderizzato appaiono identici; la giada traslucida verrebbe peggio, il telefono soffrirebbe, servirebbero tre modelli e la frattura in Blender. three.js resta solo per le particelle.
- **Solo le 5 immagini con dissolvenze come soluzione definitiva:** scartata dall'owner a favore della sequenza di fotogrammi. Le 5 immagini sono però il punto di partenza: stesso codice, si sostituiscono i fotogrammi dopo.
- **"Rotazione 3D completa" nelle clip video:** promessa mia poi corretta. Ogni clip parte e finisce su un'immagine fissa, quindi lo strumento può dare profondità (luce, frammenti, lieve rotazione) ma non una rotazione completa garantita.
- **`python` e `python3` da Git Bash:** non partono (alias del Microsoft Store). Funziona `py -3` (Python 3.12, Pillow 13 installato). L'handoff precedente diceva "Python non installato": è superato.
- **`ffmpeg`, `cwebp`, `magick`:** non installati. Per le immagini basta Pillow; per estrarre fotogrammi dalle clip servirà procurarsi ffmpeg (chiedere prima di installare a livello di sistema).

## Problemi incontrati e come li abbiamo risolti

- **Le regole del progetto vietavano la richiesta** (niente scroll-scrubbing, niente verde sui titoli, niente illustrazioni, intro ≤ 1,5 s) → l'owner ha detto di aggiornare i file; fatto in `brand-guidelines.md` e `PROJECT.md`.
- **PNG da 2,5 MB l'una (12,5 MB)** → WebP con Pillow, qualità 80: 604 KB a 1024px, 248 KB a 640px.
- **Fondo delle immagini non bianco puro (253–254) e polvere tagliata dal bordo in `rock-4` e `rock-5`** → hero su bianco puro (`--color-card`) e bordo del canvas sfumato con una maschera CSS. Il campionamento delle particelle tratta come vuoto tutto ciò che è quasi bianco.
- **Header prima schermata:** lo stage sticky coprirebbe i link dell'header → `Header` con `relative z-10` e altezza `--header-height: 45px`; l'hero parte sotto l'header con margine negativo.
- **jsdom non ha canvas, WebGL, `ResizeObserver`, `document.fonts`** → i test li simulano; senza contesto 2D l'hero ricade sulla modalità statica (previsto dal design).

## Decisioni prese

Dell'owner:
- **Strada B, sequenza di fotogrammi** scrubbata dallo scroll, con particelle vere nel finale. Scartate: A (solo dissolvenze) e C (3D dal vivo).
- **three.js tra le librerie.** Scartato l'uso per il sasso; usato solo per le particelle (scelta mia sul dove).
- **Ogni pagina pubblica animata nello scroll.**
- **Aggiornare le direttive** invece di rispettare le vecchie regole di motion.

Mie, accettate con l'approvazione del design (marcate `(call)` nel documento):
- La polvere compone **"Yintong Zhou."** in verde; scartato il titolo intero (troppo testo per le particelle).
- **Hero centrato su un asse:** il nome si forma dove stava il sasso. Scartato il layout a sinistra in stile Swiss, che richiederebbe un viaggio delle particelle attraverso lo schermo.
- **Header non fisso:** visibile nella prima schermata, poi scorre via. Scartato l'header sticky (cambio su tutto il sito, non richiesto).
- **Indicatore "Scroll"** nella prima schermata. Scartata la schermata muta: nessuno scorrerebbe.
- **Bottoni invisibili non cliccabili;** con il focus da tastiera l'hero mostra lo stato finale. Scartati `inert` e lo scroll automatico.
- **Frame su canvas 2D, particelle su un secondo canvas three.js.** Scartato un unico canvas WebGL con 120 texture (memoria GPU).
- **Solo `three`, senza React Three Fiber;** `dust.ts` è l'unico file che lo importa, caricato con `import()` dinamico.
- **Progresso passato da `useSpring`** per rendere fluida la rotella a scatti. Scartate librerie di smooth-scroll (lo scroll resta nativo).
- **Conteggio dei numeri all'ingresso nello schermo** (non più al caricamento), con `IntersectionObserver` semplice. Scartato `useInView` di Motion (cache degli observer che complica i test).
- **Altre pagine sobrie:** linea di avanzamento 2px, `Reveal` sui blocchi, timeline del CV che si riempie. L'owner non ha chiesto di più quando gliel'ho segnalato.

Mia, NON ancora vista dall'owner se non nel messaggio del piano:
- **Sotto 560px di altezza (telefono in orizzontale) hero statico**, perché titolo e bottoni verrebbero tagliati.

## File toccati

Nessun commit. Tutto è modificato o non tracciato.
- `PROJECT.md` — riga Home (sequenza di scroll), fase 5, three.js nello stack. "Status" non toccato.
- `brand-guidelines.md` — eccezioni (accent sul titolo Home, immagini dell'hero, hero bianco), tabella strumenti (Motion `useScroll`, canvas 2D, three.js), nuova sezione "Home hero sequence", reduced motion, snippet, nota di modifica.
- `frontend/src/assets/home-hero/rock-{1..5}-{1024,640}.webp` — nuovi. Ordine: 1 sasso, 2 crepato, 3 giada, 4 giada che si dissolve, 5 polvere. Originali PNG in `C:\Users\zhouy\Downloads\rock_{1..5}.png`.
- `docs/superpowers/specs/2026-11-15-scroll-animations-design.md` — design approvato.
- `docs/superpowers/plans/2026-11-15-scroll-animations.md` — piano da approvare.

## Dove vogliamo andare

1. Chiedi all'owner se il piano va bene e quale esecuzione sceglie (nativa consigliata). Segnalagli la scelta dei 560px.
2. Dopo il sì, esegui il piano dal Task 1 con la skill corrispondente (`superpowers:executing-plans` se nativa, `superpowers:subagent-driven-development` altrimenti). Il Task 1 crea il branch `feat/scroll-animations` e fa il primo commit con i file elencati sopra.
3. Fermati dopo il Task 7 e fai provare l'hero all'owner; poi Task 8–9 e seconda pausa.
4. Quando l'owner consegna le 4 clip video (`1-2`, `2-3`, `3-4`, `4-5`; fondo bianco, stessa inquadratura, 1–2 s, 24–30 fps, almeno 720px), scrivi un piano a parte per la sequenza a circa 120 fotogrammi.

## Da sapere prima di toccare qualcosa

- **L'approvazione del design non è l'approvazione del piano.** Niente codice, niente `npm install`, niente commit finché l'owner non dice sì al piano. Il piano prevede commit locali a ogni task: il suo sì li autorizza. Mai push né merge.
- Restano aperte dall'handoff `public-frontend-2`: come integrare `feat/public-frontend` (merge, PR o lasciare) e il testo "Status" di `PROJECT.md`. Non deciderle da solo. Il nuovo branch parte da `feat/public-frontend`, non da `main`.
- `docs/handoff/2026-11-15-public-frontend-2.md` è non tracciato: lasciarlo com'è.
- Shell: Git Bash su Windows. Python solo con `py -3 -I`. Comandi npm da `frontend/`, git dalla radice.
- Parlare all'owner in italiano; codice, commit e documenti di progetto in inglese.
- Nei test il default è reduced motion; `stubMatchMedia(false)` per testare le animazioni. Il warning Vite sul chunk > 500 kB è atteso.
- La ricerca della skill `ui-ux-pro-max` funziona con `py -3 "C:/Users/zhouy/.claude/skills/ui-ux-pro-max/scripts/search.py"`.
- Modalità ponytail attiva: soluzione minima che funziona, niente astrazioni non richieste.
