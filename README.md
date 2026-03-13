# 🎤 Karaoke Wheel

Applicazione web interattiva per gestire serate karaoke. Gira la ruota per scegliere il prossimo cantante, poi assegna le canzoni con modalità flip-card — singola o a scelta multipla.

Nessuna dipendenza, nessun server: basta aprire `index.html` nel browser.

---

## Indice

- [Demo rapida](#demo-rapida)
- [Funzionalità](#funzionalità)
- [Come usare](#come-usare)
- [Formato CSV](#formato-csv)
- [Struttura del progetto](#struttura-del-progetto)
- [Architettura e stato applicativo](#architettura-e-stato-applicativo)
- [Implementazioni future](#implementazioni-future)

---

## Demo rapida

1. Apri `index.html` nel browser
2. Aggiungi almeno un partecipante e una canzone
3. Clicca **Gira la Ruota**
4. Scegli la modalità di estrazione canzone
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

Il pulsante **Reset** ripristina lo stato di "usato" di tutti i partecipanti e tutte le canzoni, senza cancellarli — utile per ricominciare la serata con la stessa lista.

---

## Come usare

```
1. Apri index.html nel browser (doppio clic o trascina su Chrome/Firefox/Safari)

2. Aggiungi i partecipanti
   → Scrivi il nome nel campo "Nome partecipante" e premi Aggiungi o Enter

3. Carica le canzoni
   → CSV: clicca "Carica file CSV" e seleziona il file
   → Manuale: passa alla tab "Manuale" e inserisci i titoli uno per uno

4. Gira la ruota
   → Clicca "Gira la Ruota" — attendi la fine dell'animazione

5. Seleziona la modalità canzone
   → "Una canzone": flip-card singola, puoi chiedere un'altra prima di confermare
   → "Cinque carte": scegli tra 5 opzioni, clicca quella che vuoi

6. Conferma la canzone
   → Il titolo viene copiato negli appunti automaticamente

7. Ripeti dal punto 4 per ogni turno

8. A fine serata, premi Reset per ricominciare con le stesse liste
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

Lo stato è gestito interamente in memoria tramite variabili globali in `script.js`. Non viene usato `localStorage` né alcun backend.

```js
let participants = []          // tutti i partecipanti aggiunti
let usedParticipants = []      // estratti dalla ruota in questa sessione
let songs = []                 // tutte le canzoni caricate
let usedSongs = []             // canzoni già assegnate
let currentParticipant = []    // il vincitore dell'ultimo spin
let availableSongsForTurn = [] // canzoni disponibili per il turno corrente
let shownSongsInTurn = []      // canzoni già mostrate nel turno (evita ripetizioni)
```

Le funzioni principali sono:

| Funzione | Responsabilità |
|---|---|
| `updateWheel()` | Ricalcola e ridisegna la ruota SVG |
| `spinWheel()` | Calcola il vincitore, anima la rotazione |
| `selectCardMode(mode)` | Smista tra modalità singola e cinque carte |
| `pickRandomSong()` | Estrae una canzone non ancora mostrata nel turno |
| `createFiveCards()` | Genera 5 carte casuali e le inietta nel DOM |
| `selectSong(songName)` | Conferma la canzone, aggiorna lo stato, copia negli appunti |
| `updateStats()` | Aggiorna i tre contatori visibili |
| `renderParticipants()` | Ridisegna i tag partecipanti |
| `renderSongList()` | Ridisegna la lista canzoni con stati usato/disponibile |

---

## Implementazioni future

### 1. Persistenza con localStorage

Attualmente chiudendo il browser si perde tutto. Per salvare le liste tra una sessione e l'altra, creare due funzioni dedicate da integrare nel flusso esistente:

```js
function saveToStorage() {
  localStorage.setItem('kw_participants', JSON.stringify(participants));
  localStorage.setItem('kw_songs', JSON.stringify(songs));
  localStorage.setItem('kw_usedParticipants', JSON.stringify(usedParticipants));
  localStorage.setItem('kw_usedSongs', JSON.stringify(usedSongs));
}

function loadFromStorage() {
  participants     = JSON.parse(localStorage.getItem('kw_participants') || '[]');
  songs            = JSON.parse(localStorage.getItem('kw_songs') || '[]');
  usedParticipants = JSON.parse(localStorage.getItem('kw_usedParticipants') || '[]');
  usedSongs        = JSON.parse(localStorage.getItem('kw_usedSongs') || '[]');
}
```

Chiamare `loadFromStorage()` all'avvio al posto delle chiamate init in fondo a `script.js`, e `saveToStorage()` alla fine di ogni funzione che modifica lo stato — ovvero `addNameBtn.onclick`, `removeSongByIndex`, `selectSong`, `resetBtn.onclick` e i due pulsanti "Elimina tutti".

---

### 2. Musica durante lo spin e il giro delle carte

Aggiungere in `index.html` due elementi audio nascosti, uno per la ruota e uno per le flip-card:

```html
<audio id="spinAudio" src="sounds/spin.mp3" preload="auto"></audio>
<audio id="flipAudio" src="sounds/flip.mp3" preload="auto"></audio>
```

In `script.js`, avviare e fermare `spinAudio` dentro `spinWheel()`:

```js
function spinWheel() {
  const spinAudio = document.getElementById('spinAudio');
  spinAudio.currentTime = 0;
  spinAudio.play();

  function animate(time) {
    // ...
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      spinAudio.pause();
      spinAudio.currentTime = 0;
      // resto del codice esistente
    }
  }
  requestAnimationFrame(animate);
}
```

Per il giro delle carte, aggiungere una funzione helper e richiamarla dentro `showCurrentSong()` (modalità singola) e `autoFlipCards()` (modalità cinque carte), subito prima che la classe `flipped` venga aggiunta alla carta:

```js
function playFlip() {
  const audio = document.getElementById('flipAudio');
  audio.currentTime = 0;
  audio.play();
}
```

---

### 3. Penitenze

Aggiungere in `index.html` una sezione dedicata, strutturata come quella delle canzoni, con lista, input manuale e caricamento CSV. In `script.js` introdurre due array separati:

```js
let penalties = [];
let usedPenalties = [];
```

La logica di estrazione è identica a quella delle canzoni — duplicare `pickRandomSong` e `selectSong` rinominandole `pickRandomPenalty` e `selectPenalty`, sostituendo i riferimenti a `songs`/`usedSongs` con `penalties`/`usedPenalties`.

La penitenza va proposta come terza opzione nella schermata di selezione modalità, accanto a "Una canzone" e "Cinque carte":

```html
<button class="option-card" onclick="selectCardMode('penalty')">
  <span class="option-icon">😈</span>
  <span>Penitenza</span>
</button>
```

In `selectCardMode()` aggiungere il caso `'penalty'`, che mostra una flip-card singola con il testo della penitenza estratta riutilizzando gli stessi elementi DOM della modalità singola (`singleCardSection`, `cardBack`) — senza creare nuovi elementi né nuovi stili.

---

## Tecnologie

- **HTML5** — struttura semantica
- **CSS3** — flip-card 3D, layout responsive, animazioni keyframe
- **JavaScript vanilla** — nessuna dipendenza, nessun framework

---

## Autore

**Emmanuele Grassi**