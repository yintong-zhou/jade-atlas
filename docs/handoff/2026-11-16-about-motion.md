---
type: handoff
date: 2026-11-16
status: pronto per review
seq: 1
prev: nessuno
tags: [about, cv, home, footer, animazione]
---

# Handoff: portfolio e animazione About

## Obiettivo

Rifinire il portfolio e rendere più piacevole la lettura della carriera in About, rispettando la privacy. Il contesto precedente è in docs/handoff/2026-11-16-about-cv.md.

## A che punto siamo

Branch feat/public-redesign, HEAD 7e9bf36. Le modifiche della sessione sono locali e non committate: preservarle. About ha copy abbreviata, link ICPN, competenze per ruolo, lingue rimosse e corso Cyber Security con Cisco, CompTIA ed EC-Council annidati. Home ha stack aggiornato, servizi API generici e contatori rimossi. Footer ha pulsante email più piccolo e icone.

Claude Code ha aggiunto animazione CSS alle righe della carriera: linea jade e movimento di 14px con animation-timeline view; fallback statico per browser non compatibili e prefers-reduced-motion. Verifiche riferite: lint e build frontend passati, 108 test Vitest passati; dotnet build passato, dotnet test non rileva test. Screenshot desktop, mobile e reduced motion in .tmp/shots/; movimento non verificato fotogramma per fotogramma.

Gate design-taste-frontend: GATE: FAIL 30 al secondo giro, segnalazioni su regole generiche landing, dimensioni sezioni, visual, navigazione e scroll-linked/effect-kind. Nessuna waiver. File temporanei .taste-skill rimossi. Valutare singolarmente i rilievi prima di intervenire.

## Cosa abbiamo provato che NON ha funzionato

Opacità iniziale 0.4 riduceva il contrasto a 3.87:1: rimossa. I test del contatore rimosso fallivano: eliminati con il relativo hook non più usato. Il gate segnala anche regole per landing potenzialmente incompatibili con una pagina CV; non ridisegnare il sito senza valutare brief e istruzioni.

## Problemi incontrati e come li abbiamo risolti

I dati CV sono campioni di sviluppo: in produzione restano vuoti fino alla futura API. Competenze per ruolo e qualifiche annidate sono campi frontend provvisori, non ancora contratto backend. dotnet test non rileva test e non dimostra copertura backend. Screenshot statici non sostituiscono la verifica del movimento effettivo.

## Decisioni prese

Cisco, CompTIA ed EC-Council sono raggruppati sotto il corso Cyber Security, come richiesto. Animazione CSS con fallback statico, senza nuove dipendenze. Nessun commit, push o deploy. PROJECT.md non aggiornato: le istruzioni richiedono accordo dell'owner per lo Status.

## File toccati

- PROFILE.md e frontend/src/shared/texts.ts: copy.
- frontend/src/modules/public/about/AboutPage.tsx e relativi test: esperienza e formazione.
- frontend/src/index.css: animazione e fallback.
- frontend/src/shared/api/sampleData.ts e types.ts: dati provvisori e qualifiche.
- frontend/src/modules/public/home/: diagramma e rimozione contatori; rimossi hook useCountUp e relativo test.
- frontend/src/modules/public/Footer.tsx: pulsante e icone.
- Test collegati e docs/handoff/2026-11-16-about-cv.md sono modificati o non tracciati; controlla git status.

## Dove vogliamo andare

Prendi in carico il lavoro nello stesso workspace. Leggi le istruzioni e questo handoff, presenta lo stato all'owner e lascia che provi About; attendi le sue indicazioni prima di ulteriori modifiche. Se richiesto, verifica lo scrolling reale e valuta i rilievi del gate. Non fare commit, push o deploy senza richiesta.

## Da sapere prima di toccare qualcosa

Leggi PROJECT.md e PROFILE.md; parla in italiano. Oracle è l'unico database, React + Vite lo stack frontend. Non inserire telefono, indirizzi o dati privati; non pubblicare il CV sorgente. Ispeziona git status e preserva il lavoro non committato. Produzione, modifiche ai dati esistenti e cambi alle decisioni di progetto richiedono autorizzazione.

