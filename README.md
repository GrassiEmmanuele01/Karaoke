# 🎤 Karaoke Wheel

Applicazione web interattiva per gestire serate karaoke. Gira la ruota per scegliere il prossimo cantante, poi assegna le canzoni con modalità flip-card — singola o a scelta multipla. Supporta anche le penitenze per chi non vuole cantare.

Nessuna dipendenza, nessun server: basta aprire `index.html` nel browser.

---

## Indice

- [Demo rapida](#demo-rapida)
- [Funzionalità](#funzionalità)
- [Come usare](#come-usare)
- [Formato CSV](#formato-csv)
- [Struttura del progetto](#struttura-del-progetto)
- [Architettura e stato applicativo](#architettura-e-stato-applicativo)

---

## Demo rapida

1. Apri `index.html` nel browser
2. Aggiungi almeno un partecipante e una canzone
3. Clicca **Gira la Ruota**
4. Scegli la modalità di estrazione canzone (o penitenza)
5. Ripeti per ogni turno — la ruota esclude automaticamente chi ha già cantato

---

## Funzionalità

### Gestione partecipanti

I partecipanti vengono aggiunti tramite campo testo (anche con tasto `Enter`) e visualizzati come tag rimovibili. Una volta estratti dalla ruota vengono marcati come "già cantati" e non riappaiono nei turni successivi finché non si esegue un reset.

- Aggiunta per nome, rimozione singola con `×`
- Pulsante **Elimina tutti** disponibile quando la lista non è vuota
- I tag dei partecipanti già cantati appaiono barrati e semitrasparenti

### Caricamento canzoni

Le canzoni si possono aggiungere in due modi, selezionabili tramite le tab **CSV** e **Manuale**:

**CSV** — Carica un file `.csv` con un titolo per riga. L'opzione *Aggiungi alle esistenti* permette di unire più file senza sovrascrivere la lista corrente. I duplicati vengono ignorati automaticamente con un conteggio a fine importazione.

**Manuale** — Inserimento testo libero, supporta il tasto `Enter`. Anche qui i duplicati vengono segnalati e scartati.

In entrambe le modalità la lista mostra tutte le canzoni caricate con numerazione, stato (usata/disponibile) e pulsante di rimozione singola.

### Gestione penitenze

Le penitenze si aggiungono tramite campo testo (anche con `Enter`) e vengono mostrate in una lista con numerazione, stato (usata/disponibile) e rimozione singola. Il pulsante **Elimina tutte** appare quando la lista non è vuota.

Le penitenze hanno due utilizzi distinti:

1. **Modalità penitenza diretta** — Il partecipante sceglie "Penitenza 😈" nella selezione modalità. Viene estratta una penitenza casuale e mostrata come flip-card. Il pulsante **Altra** propone una penitenza diversa; **Accetta 😈** la conferma, la segna come usata e torna alla ruota.

2. **Penitenza intermedia** — Se le penitenze sono presenti, vengono proposte automaticamente come "imprevisto" prima di ogni canzone (sia in modalità singola che cinque carte) e prima di ogni set **Altre 5**. Una volta accettata la penitenza con **Penitenza effettuata ✅**, l'app procede normalmente con la selezione della canzone.

Le penitenze già usate non vengono riproposte finché non si è esaurita la lista completa; a quel punto il ciclo riparte dall'inizio.

### Statistiche in tempo reale

Tre contatori sempre visibili:

| Contatore | Descrizione |
|---|---|
| **Partecipanti** | Numero totale di nomi aggiunti |
| **Canzoni** | Totale canzoni caricate |
| **Disponibili** | Canzoni non ancora assegnate in questa sessione |

Il pulsante **Gira la Ruota** si disabilita automaticamente se non ci sono partecipanti ancora da estrarre o canzoni disponibili.

### Ruota dei partecipanti

La ruota viene disegnata dinamicamente in SVG — una fetta per ogni partecipante non ancora estratto. Ogni fetta ha un colore pastello unico con etichetta ruotata al centro. La rotazione è animata con easing quartico per un effetto realistico.

Dopo lo spin appare il pulsante **Vedi Canzoni** che porta alla selezione della modalità.

### Modalità carta singola

Viene estratta una canzone casuale tra quelle disponibili e visualizzata come flip-card animata (rotazione 3D). Il partecipante può:

- **Girare la carta** cliccandoci sopra per vedere/nascondere il titolo
- Cliccare **Altra** per estrarne una diversa (senza ripetizioni fino ad esaurimento)
- Cliccare **Seleziona** per confermare la canzone

Le canzoni già mostrate nello stesso turno non vengono riproposte finché non si sono viste tutte quelle disponibili.

### Modalità cinque carte

Vengono estratte 5 canzoni casuali, mostrate come carte coperte che si girano automaticamente in sequenza con intervallo di 1 secondo. Il partecipante clicca la carta che preferisce per selezionare quella canzone. Il pulsante **Altre 5** propone un nuovo set senza ripetere le canzoni già mostrate.

### Selezione canzone e reset turno

Quando una canzone viene confermata (in qualsiasi modalità):

1. La canzone viene marcata come usata e non riappare nei turni successivi
2. Il partecipante viene marcato come già cantato
3. Il titolo viene copiato automaticamente negli appunti (`clipboard.writeText`)
4. La vista torna alla ruota, pronta per il turno successivo

Il pulsante **Reset** ripristina lo stato di "usato" di tutti i partecipanti, tutte le canzoni e tutte le penitenze, senza cancellarli — utile per ricominciare la serata con le stesse liste.

### Persistenza con localStorage

Lo stato dell'applicazione viene salvato automaticamente nel browser. Partecipanti, canzoni, penitenze e rispettivi stati di utilizzo sopravvivono alla chiusura e alla riapertura della pagina. Non è necessaria nessuna azione da parte dell'utente.

---

## Come usare

```
1. Apri index.html nel browser (doppio clic o trascina su Chrome/Firefox/Safari)

2. Aggiungi i partecipanti
   → Scrivi il nome nel campo "Nome partecipante" e premi Aggiungi o Enter

3. Carica le canzoni
   → CSV: clicca "Carica file CSV" e seleziona il file
   → Manuale: passa alla tab "Manuale" e inserisci i titoli uno per uno

4. (Opzionale) Aggiungi penitenze
   → Scrivi la descrizione nel campo "Descrizione penitenza" e premi Aggiungi o Enter
   → Se presenti, verranno proposte come imprevisto prima di ogni canzone

5. Gira la ruota
   → Clicca "Gira la Ruota" — attendi la fine dell'animazione

6. Seleziona la modalità
   → "Una canzone": flip-card singola, puoi chiedere un'altra prima di confermare
   → "Cinque carte": scegli tra 5 opzioni, clicca quella che vuoi
   → "Penitenza 😈": estrai una penitenza diretta invece di una canzone

7. Conferma la canzone o la penitenza
   → Il titolo viene copiato negli appunti automaticamente

8. Ripeti dal punto 5 per ogni turno

9. A fine serata, premi Reset per ricominciare con le stesse liste
```

---

## Formato CSV

Un titolo per riga, nessuna intestazione necessaria:

```
Bohemian Rhapsody
Don't Stop Me Now
We Are the Champions
Sweet Child O' Mine
Living on a Prayer
```

---

## Struttura del progetto

```
karaoke-wheel/
├── index.html      # Markup e struttura della pagina
├── style.css       # Stili, layout, animazioni flip-card
└── script.js       # Tutta la logica applicativa
```

---

## Architettura e stato applicativo

Lo stato è gestito interamente in memoria tramite variabili globali in `script.js` e viene persistito automaticamente in `localStorage` ad ogni modifica.

```js
let participants = []          // tutti i partecipanti aggiunti
let usedParticipants = []      // estratti dalla ruota in questa sessione
let songs = []                 // tutte le canzoni caricate
let usedSongs = []             // canzoni già assegnate
let penalties = []             // tutte le penitenze caricate
let usedPenalties = []         // penitenze già estratte in questa sessione
let currentParticipant = []    // il vincitore dell'ultimo spin
let availableSongsForTurn = [] // canzoni disponibili per il turno corrente
let shownSongsInTurn = []      // canzoni già mostrate nel turno (evita ripetizioni)
```

Le funzioni principali sono:

| Funzione | Responsabilità |
|---|---|
| `updateWheel()` | Ricalcola e ridisegna la ruota SVG |
| `spinWheel()` | Calcola il vincitore, anima la rotazione |
| `selectCardMode(mode)` | Smista tra modalità singola, cinque carte e penitenza |
| `withPenaltyInterrupt(callback)` | Mostra una penitenza intermedia prima di eseguire il callback |
| `pickRandomSong()` | Estrae una canzone non ancora mostrata nel turno |
| `createFiveCards()` | Genera 5 carte casuali e le inietta nel DOM |
| `selectSong(songName)` | Conferma la canzone, aggiorna lo stato, copia negli appunti |
| `showPenaltyCardMode()` | Gestisce la modalità penitenza diretta |
| `selectPenalty(penaltyName)` | Conferma la penitenza, aggiorna lo stato, copia negli appunti |
| `updateStats()` | Aggiorna i tre contatori visibili |
| `renderParticipants()` | Ridisegna i tag partecipanti |
| `renderSongList()` | Ridisegna la lista canzoni con stati usato/disponibile |
| `renderPenaltyList()` | Ridisegna la lista penitenze con stati usato/disponibile |
| `saveToStorage()` | Serializza tutto lo stato in localStorage |
| `loadFromStorage()` | Ripristina lo stato da localStorage all'avvio |

---

## Tecnologie

- **HTML5** — struttura semantica
- **CSS3** — flip-card 3D, layout responsive, animazioni keyframe
- **JavaScript vanilla** — nessuna dipendenza, nessun framework

---

## Autore

**Emmanuele Grassi**