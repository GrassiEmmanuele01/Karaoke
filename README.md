# 🎤 Karaoke Wheel

Un'applicazione web interattiva per gestire serate karaoke in modo divertente e dinamico. Gira la ruota per scegliere il prossimo cantante e assegna le canzoni tramite carte o estrazione casuale.

## Funzionalità

- **Ruota dei partecipanti** — Aggiungi i partecipanti e gira la ruota per scegliere chi canta
- **Gestione canzoni** — Carica canzoni tramite file CSV o inseriscile manualmente
- **Modalità carta singola** — Estrai una canzone alla volta con effetto flip card
- **Modalità cinque carte** — Proponi cinque canzoni tra cui scegliere
- **Statistiche in tempo reale** — Tieni traccia di partecipanti, canzoni totali e disponibili
- **Canzoni già usate** — Le canzoni selezionate vengono marcate come utilizzate

## Struttura del progetto

```
karaoke-wheel/
├── index.html    # Struttura della pagina
├── style.css     # Stili e layout
└── script.js     # Logica applicativa
```

## Come usare

1. Apri `index.html` nel browser
2. Aggiungi i nomi dei partecipanti
3. Carica un file CSV con le canzoni oppure inseriscile manualmente
4. Clicca **Gira la Ruota** per estrarre un partecipante
5. Scegli la modalità di selezione canzone (singola o cinque carte)
6. Gira la carta per rivelare la canzone assegnata

## Formato CSV

Il file CSV deve contenere i titoli delle canzoni, uno per riga:

```
Bohemian Rhapsody
Don't Stop Me Now
We Are the Champions
...
```

## Tecnologie

- HTML5
- CSS3 (animazioni flip card, layout responsive)
- JavaScript vanilla

## Autore

**Emmanuele Grassi**