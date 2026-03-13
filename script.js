let participants = [], usedParticipants = [], songs = [], usedSongs = [], currentParticipant = [];
let penalties = [], usedPenalties = [];
let songMode = 'csv';
let currentSongIndex = 0;
let availableSongsForTurn = [];
let shownSongsInTurn = [];
let currentCardMode = 'single';

// ==================== LOCALSTORAGE ====================
function saveToStorage() {
  localStorage.setItem('kw_participants', JSON.stringify(participants));
  localStorage.setItem('kw_songs', JSON.stringify(songs));
  localStorage.setItem('kw_usedParticipants', JSON.stringify(usedParticipants));
  localStorage.setItem('kw_usedSongs', JSON.stringify(usedSongs));
  localStorage.setItem('kw_penalties', JSON.stringify(penalties));
  localStorage.setItem('kw_usedPenalties', JSON.stringify(usedPenalties));
}

function loadFromStorage() {
  participants     = JSON.parse(localStorage.getItem('kw_participants') || '[]');
  songs            = JSON.parse(localStorage.getItem('kw_songs') || '[]');
  usedParticipants = JSON.parse(localStorage.getItem('kw_usedParticipants') || '[]');
  usedSongs        = JSON.parse(localStorage.getItem('kw_usedSongs') || '[]');
  penalties        = JSON.parse(localStorage.getItem('kw_penalties') || '[]');
  usedPenalties    = JSON.parse(localStorage.getItem('kw_usedPenalties') || '[]');
}

// ==================== SONG MODE ====================
function setSongMode(mode) {
  songMode = mode;
  document.getElementById('csvModeBtn').classList.toggle('active', mode === 'csv');
  document.getElementById('manualModeBtn').classList.toggle('active', mode === 'manual');
  document.getElementById('csvModeSection').style.display = mode === 'csv' ? 'block' : 'none';
  document.getElementById('manualModeSection').style.display = mode === 'manual' ? 'block' : 'none';
  renderSongList();
  updateSongsDisplay();
  updateSpinBtn();
  checkClearButtons();
}

// ==================== MANUAL SONGS ====================
document.getElementById('addSongBtn').onclick = () => {
  const input = document.getElementById('songInput');
  const song = input.value.trim();
  if (song && !songs.includes(song)) {
    songs.push(song);
    input.value = '';
    renderSongList();
    updateSongsDisplay();
    updateSpinBtn();
    checkClearButtons();
    saveToStorage();
  } else if (songs.includes(song)) {
    alert('⚠️ Questa canzone è già presente nella lista!');
  }
};

document.getElementById('songInput').addEventListener('keypress', e => {
  if (e.key === 'Enter') document.getElementById('addSongBtn').click();
});

window.removeManualSong = (index) => { removeSongByIndex(index); };

// ==================== CSV SONGS ====================
document.getElementById('csvFile').onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const content = ev.target.result;
    const newSongs = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (newSongs.length === 0) { alert('⚠️ Il file CSV sembra vuoto!'); e.target.value = ''; return; }
    const append = document.getElementById('appendCsv').checked;
    if (append) {
      let addedCount = 0;
      newSongs.forEach(song => { if (!songs.includes(song)) { songs.push(song); addedCount++; } });
      alert(`✅ Aggiunte ${addedCount} nuove canzoni! (${newSongs.length - addedCount} duplicate ignorate)`);
    } else {
      if (songs.length > 0) {
        if (!confirm('⚠️ Questo eliminerà tutte le canzoni esistenti. Continuare?')) { e.target.value = ''; return; }
      }
      songs = newSongs;
      usedSongs = [];
      alert(`✅ Caricate ${songs.length} canzoni!`);
    }
    renderSongList(); updateSongsDisplay(); updateStats(); updateSpinBtn(); checkClearButtons(); saveToStorage();
    e.target.value = '';
  };
  reader.onerror = () => { alert('❌ Errore nella lettura del file!'); e.target.value = ''; };
  reader.readAsText(file);
};

function updateSongsDisplay() {
  songs.filter(s => !usedSongs.includes(s)).length;
}

// ==================== SONG LIST RENDER ====================
function renderSongList() {
  const container = document.getElementById('songList');
  const countSpan = document.getElementById('songCount');
  countSpan.textContent = songs.length;
  if (songs.length === 0) { container.innerHTML = '<p class="empty">Nessuna canzone</p>'; return; }
  container.innerHTML = '';
  songs.forEach((song, index) => {
    const isUsed = usedSongs.includes(song);
    const item = document.createElement('div');
    item.className = `song-item ${isUsed ? 'used' : ''}`;
    item.innerHTML = `
      <span class="song-name">${index + 1}. ${song} ${isUsed ? '✅' : ''}</span>
      <button onclick="removeSongByIndex(${index})">×</button>
    `;
    container.appendChild(item);
  });
}

window.removeSongByIndex = (index) => {
  const songToRemove = songs[index];
  const usedIndex = usedSongs.indexOf(songToRemove);
  if (usedIndex > -1) usedSongs.splice(usedIndex, 1);
  songs.splice(index, 1);
  renderSongList(); updateSongsDisplay(); updateStats(); updateSpinBtn(); checkClearButtons(); saveToStorage();
};

// ==================== PARTICIPANTS ====================
document.getElementById('addNameBtn').onclick = () => {
  const input = document.getElementById('nameInput');
  const name = input.value.trim();
  if (name && !participants.includes(name)) {
    participants.push(name);
    input.value = '';
    renderParticipants(); updateWheel(); updateSpinBtn(); checkClearButtons(); saveToStorage();
  }
};

document.getElementById('nameInput').addEventListener('keypress', e => {
  if (e.key === 'Enter') document.getElementById('addNameBtn').click();
});

window.removeParticipant = (index) => {
  participants.splice(index, 1);
  renderParticipants(); updateWheel(); updateSpinBtn(); checkClearButtons(); saveToStorage();
};

function renderParticipants() {
  const list = document.getElementById('participantsList');
  list.innerHTML = '';
  participants.forEach((name, i) => {
    const tag = document.createElement('div');
    tag.className = `tag ${usedParticipants.includes(name) ? 'used' : ''}`;
    tag.innerHTML = `${name}<button onclick="removeParticipant(${i})">×</button>`;
    list.appendChild(tag);
  });
  updateStats();
}

function updateStats() {
  document.getElementById('totalParts').textContent = participants.length;
  document.getElementById('totalSongs').textContent = songs.length;
  document.getElementById('availableSongs').textContent = songs.filter(s => !usedSongs.includes(s)).length;
}

function updateSpinBtn() {
  const availableParts = participants.filter(p => !usedParticipants.includes(p));
  const availableSongsCount = songs.filter(s => !usedSongs.includes(s)).length;
  document.getElementById('spinBtn').disabled = availableParts.length === 0 || availableSongsCount === 0;
}

// ==================== CLEAR ALL BUTTONS ====================
function checkClearButtons() {
  document.getElementById('clearAllParticipantsBtn').style.display = participants.length > 0 ? 'inline-block' : 'none';
  document.getElementById('clearAllSongsBtn').style.display = songs.length > 0 ? 'inline-block' : 'none';
  document.getElementById('clearAllPenaltiesBtn').style.display = penalties.length > 0 ? 'inline-block' : 'none';
}

document.getElementById('clearAllParticipantsBtn').onclick = () => {
  if (confirm('Sei sicuro di voler eliminare tutti i cantanti?')) {
    participants = []; usedParticipants = [];
    renderParticipants(); updateWheel(); updateSpinBtn(); checkClearButtons(); saveToStorage();
  }
};

document.getElementById('clearAllSongsBtn').onclick = () => {
  if (confirm('Sei sicuro di voler eliminare tutte le canzoni?')) {
    songs = []; usedSongs = [];
    renderSongList(); updateSongsDisplay(); updateStats(); updateSpinBtn(); checkClearButtons(); saveToStorage();
  }
};

// ==================== RESET ====================
document.getElementById('resetBtn').onclick = () => {
  if (confirm('Sei sicuro di voler resettare tutto?')) {
    usedParticipants = []; usedSongs = []; usedPenalties = [];
    currentParticipant = []; currentSongIndex = 0;
    availableSongsForTurn = []; shownSongsInTurn = [];
    renderParticipants(); renderSongList(); renderPenaltyList();
    updateWheel(); updateStats(); updateSongsDisplay(); updateSpinBtn();
    hideAllCardSections(); saveToStorage();
    alert('✅ Tutto resettato! 🎉');
  }
};

function hideAllCardSections() {
  document.getElementById('cardModeSelection').style.display = 'none';
  document.getElementById('singleCardSection').style.display = 'none';
  document.getElementById('fiveCardsSection').style.display = 'none';
  document.getElementById('nextSongBtn').style.display = 'none';
  document.getElementById('selectSongBtn').style.display = 'none';
  document.getElementById('proposeMoreBtn').style.display = 'none';
  document.getElementById('currentPlayerSingle').textContent = '';
  document.getElementById('currentPlayerFive').textContent = '';
  document.getElementById('cardModePlayer').textContent = '';
  // reset button labels
  document.getElementById('selectSongBtn').textContent = 'Seleziona';
  document.getElementById('nextSongBtn').textContent = 'Altra';
}

// ==================== WHEEL ====================
function updateWheel() {
  const svg = document.getElementById('wheelSvg');
  svg.innerHTML = '';
  svg.style.transform = 'rotate(0deg)';
  const available = participants.filter(p => !usedParticipants.includes(p));
  if (available.length === 0) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', 200); circle.setAttribute('cy', 200); circle.setAttribute('r', 190);
    circle.setAttribute('fill', '#f4f3f0'); circle.setAttribute('stroke', 'rgba(0,0,0,0.08)'); circle.setAttribute('stroke-width', '2');
    svg.appendChild(circle);
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', 200); text.setAttribute('y', 200);
    text.setAttribute('text-anchor', 'middle'); text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('font-size', '14'); text.setAttribute('fill', '#999');
    text.textContent = participants.length ? 'Tutti hanno cantato! Clicca Reset.' : 'Aggiungi partecipanti';
    svg.appendChild(text);
    return;
  }
  createWheel(available);
}

function createWheel(names) {
  const svg = document.getElementById('wheelSvg');
  const centerX = 200, centerY = 200, radius = 190;
  const numSlices = names.length;
  const angleSlice = (Math.PI * 2) / numSlices;
  const colors = [
    '#e8e2fd', '#d4eaff', '#d4f5ec', '#fde8d4', '#fdd4e8',
    '#fff3d4', '#e2f0fd', '#ede2fd', '#d4f0e8', '#fde2e2'
  ];
  names.forEach((name, i) => {
    const startAngle = i * angleSlice - Math.PI / 2;
    const endAngle = (i + 1) * angleSlice - Math.PI / 2;
    const startX = centerX + radius * Math.cos(startAngle);
    const startY = centerY + radius * Math.sin(startAngle);
    const endX = centerX + radius * Math.cos(endAngle);
    const endY = centerY + radius * Math.sin(endAngle);
    const largeArc = angleSlice > Math.PI ? 1 : 0;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${centerX} ${centerY} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY} Z`);
    path.setAttribute('fill', colors[i % colors.length]);
    path.setAttribute('stroke', '#ffffff'); path.setAttribute('stroke-width', '2');
    svg.appendChild(path);
    const textAngle = startAngle + angleSlice / 2;
    const textRadius = radius * 0.65;
    const textX = centerX + textRadius * Math.cos(textAngle);
    const textY = centerY + textRadius * Math.sin(textAngle);
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', textX); text.setAttribute('y', textY);
    text.setAttribute('text-anchor', 'middle'); text.setAttribute('dominant-baseline', 'middle');
    const fontSize = numSlices > 10 ? 11 : numSlices > 6 ? 13 : 14;
    text.setAttribute('font-size', fontSize); text.setAttribute('fill', '#1c1a18');
    text.textContent = name.length > 12 ? name.substring(0, 12) + '...' : name;
    const rotation = (textAngle * 180 / Math.PI) + 90;
    text.setAttribute('transform', `rotate(${rotation}, ${textX}, ${textY})`);
    svg.appendChild(text);
  });
  const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  centerCircle.setAttribute('cx', centerX); centerCircle.setAttribute('cy', centerY);
  centerCircle.setAttribute('r', 10); centerCircle.setAttribute('fill', '#6041e8');
  svg.appendChild(centerCircle);
}

function spinWheel() {
  const available = participants.filter(p => !usedParticipants.includes(p));
  const numSlices = available.length;
  const sliceAngle = 360 / numSlices;
  const winnerIndex = Math.floor(Math.random() * numSlices);
  const winnerCenterAngle = winnerIndex * sliceAngle - 90 + sliceAngle / 2;
  const targetRotation = -winnerCenterAngle + 1800;
  const svg = document.getElementById('wheelSvg');
  let start = null;
  document.getElementById('spinBtn').disabled = true;

  function animate(time) {
    if (!start) start = time;
    const progress = Math.min((time - start) / 6000, 1);
    const easeOut = 1 - Math.pow(1 - progress, 4);
    const currentRotation = easeOut * targetRotation;
    svg.style.transform = `rotate(${currentRotation}deg)`;
    svg.style.transition = 'none';
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      currentParticipant = available[winnerIndex];
      document.getElementById('showSongsBtn').style.display = 'inline-block';
      document.getElementById('spinBtn').disabled = false;
    }
  }
  requestAnimationFrame(animate);
}

document.getElementById('spinBtn').onclick = () => {
  spinWheel();
  document.getElementById('showSongsBtn').style.display = 'none';
};

// ==================== SHOW CARD MODE SELECTION ====================
document.getElementById('showSongsBtn').onclick = () => {
  const availableCount = songs.filter(s => !usedSongs.includes(s)).length;
  if (availableCount === 0) {
    alert('⚠️ Tutte le canzoni sono state utilizzate! Reset per ricominciare.');
    return;
  }
  hideAllCardSections();
  document.getElementById('cardModePlayer').textContent = `${currentParticipant} - Scegli la tua canzone`;
  document.getElementById('cardModeSelection').style.display = 'block';
  setTimeout(() => {
    document.getElementById('cardModeSelection').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 300);
};

// ==================== SELECT CARD MODE ====================
function selectCardMode(mode) {
  document.getElementById('cardModeSelection').style.display = 'none';
  if (mode === 'single') {
    currentCardMode = 'single';
    showSingleCardMode();
  } else if (mode === 'five') {
    showFiveCardsMode();
  } else if (mode === 'penalty') {
    currentCardMode = 'penalty';
    showPenaltyCardMode();
  }
}

function backToModeSelection() {
  document.getElementById('singleCardSection').style.display = 'none';
  document.getElementById('fiveCardsSection').style.display = 'none';
  // reset button labels when going back
  document.getElementById('selectSongBtn').textContent = 'Seleziona';
  document.getElementById('nextSongBtn').textContent = 'Altra';
  document.getElementById('cardModeSelection').style.display = 'block';
}

// ==================== PENALTY INTERRUPT ====================
// Called before showing a new song card (single or five-cards).
// If penalties exist, shows a penalty card first. Once accepted, runs callback().
function withPenaltyInterrupt(callback) {
  if (penalties.length === 0) { callback(); return; }

  let available = penalties.filter(p => !usedPenalties.includes(p));
  if (available.length === 0) {
    usedPenalties = [];
    saveToStorage();
    available = [...penalties];
  }
  const penalty = available[Math.floor(Math.random() * available.length)];
  usedPenalties.push(penalty);
  saveToStorage();

  // Show penalty using the single card section
  document.getElementById('fiveCardsSection').style.display = 'none';
  document.getElementById('cardBack').textContent = penalty;
  document.getElementById('currentPlayerSingle').textContent = `${currentParticipant} — Penitenza 😈`;
  document.getElementById('singleCard').classList.remove('flipped');
  document.getElementById('singleCardSection').style.display = 'block';
  document.getElementById('nextSongBtn').style.display = 'none';
  document.getElementById('selectSongBtn').style.display = 'inline-block';
  document.getElementById('selectSongBtn').textContent = 'Penitenza effettuata ✅';

  document.getElementById('selectSongBtn').onclick = () => {
    // Restore defaults and run the actual song callback
    document.getElementById('selectSongBtn').textContent = 'Seleziona';
    document.getElementById('nextSongBtn').style.display = 'inline-block';
    callback();
  };

  setTimeout(() => {
    document.getElementById('singleCard').classList.add('flipped');
  }, 200);
  setTimeout(() => {
    document.getElementById('singleCardSection').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);
}

// ==================== SINGLE CARD MODE ====================
function showSingleCardMode() {
  availableSongsForTurn = songs.filter(s => !usedSongs.includes(s));
  if (availableSongsForTurn.length === 0) {
    alert('⚠️ Tutte le canzoni sono state utilizzate!');
    backToModeSelection();
    return;
  }
  shownSongsInTurn = [];

  withPenaltyInterrupt(() => _showSongCard());
}

function _showSongCard() {
  pickRandomSong();
  document.getElementById('currentPlayerSingle').textContent = `${currentParticipant} - Scegli la tua canzone`;
  document.getElementById('singleCardSection').style.display = 'block';
  document.getElementById('nextSongBtn').style.display = 'inline-block';
  document.getElementById('nextSongBtn').textContent = 'Altra';
  document.getElementById('selectSongBtn').style.display = 'inline-block';
  document.getElementById('selectSongBtn').textContent = 'Seleziona';
  document.getElementById('nextSongBtn').onclick = () => withPenaltyInterrupt(() => _showSongCard());
  document.getElementById('selectSongBtn').onclick = () => selectSong(availableSongsForTurn[currentSongIndex]);
  setTimeout(() => {
    document.getElementById('singleCardSection').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 300);
}

function pickRandomSong() {
  const notShownYet = availableSongsForTurn.filter(s => !shownSongsInTurn.includes(s));
  if (notShownYet.length === 0) shownSongsInTurn = [];
  const randomIndex = Math.floor(Math.random() * notShownYet.length);
  currentSongIndex = availableSongsForTurn.indexOf(notShownYet[randomIndex]);
  shownSongsInTurn.push(availableSongsForTurn[currentSongIndex]);
  showCurrentSong();
}

function showCurrentSong() {
  const song = availableSongsForTurn[currentSongIndex];
  document.getElementById('cardBack').textContent = song;
  document.getElementById('singleCard').classList.remove('flipped');
  setTimeout(() => {
    document.getElementById('singleCard').classList.add('flipped');
  }, 100);
}

document.getElementById('singleCard').onclick = () => {
  document.getElementById('singleCard').classList.toggle('flipped');
};

// ==================== FIVE CARDS MODE ====================
function showFiveCardsMode() {
  withPenaltyInterrupt(() => _showFiveCards());
}

function _showFiveCards() {
  createFiveCards();
  document.getElementById('currentPlayerFive').textContent = `${currentParticipant} - Scegli la tua canzone`;
  document.getElementById('fiveCardsSection').style.display = 'block';
  document.getElementById('proposeMoreBtn').style.display = 'inline-block';
  setTimeout(() => autoFlipCards(), 500);
  setTimeout(() => {
    document.getElementById('fiveCardsSection').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 300);
}

function createFiveCards() {
  const grid = document.getElementById('cardsGrid');
  grid.innerHTML = '';
  availableSongsForTurn = songs.filter(s => !usedSongs.includes(s));
  const tempSongs = [...availableSongsForTurn];
  const currentSongs = [];
  while (currentSongs.length < 5 && tempSongs.length) {
    const randomIndex = Math.floor(Math.random() * tempSongs.length);
    currentSongs.push(tempSongs.splice(randomIndex, 1)[0]);
  }
  currentSongs.forEach((song, i) => {
    const card = document.createElement('div');
    card.className = 'flip-card';
    card.setAttribute('data-song', song);
    card.innerHTML = `
      <div class="flip-inner">
        <div class="flip-front">${i + 1}</div>
        <div class="flip-back">${song}</div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function autoFlipCards() {
  document.querySelectorAll('#cardsGrid .flip-card').forEach((card, index) => {
    setTimeout(() => {
      card.classList.add('flipped');
    }, index * 1000);
  });
}

document.getElementById('proposeMoreBtn').onclick = () => {
  withPenaltyInterrupt(() => {
    createFiveCards();
    document.querySelectorAll('#cardsGrid .flip-card').forEach(card => card.classList.remove('flipped'));
    document.getElementById('fiveCardsSection').style.display = 'block';
    setTimeout(() => autoFlipCards(), 100);
  });
};

document.addEventListener('click', (e) => {
  const card = e.target.closest('#cardsGrid .flip-card');
  if (card) {
    document.querySelectorAll('#cardsGrid .flip-card').forEach(c => c.classList.remove('flipped'));
    card.classList.add('flipped');
    const songName = card.dataset.song;
    setTimeout(() => selectSong(songName), 300);
  }
});

// ==================== SELECT SONG ====================
function selectSong(songName) {
  usedSongs.push(songName);
  if (currentParticipant && !usedParticipants.includes(currentParticipant)) {
    usedParticipants.push(currentParticipant);
  }
  navigator.clipboard.writeText(songName).then(() => {
    alert(`"${songName}" copiato!\n${currentParticipant} canterà questa canzone`);
  });
  renderParticipants(); renderSongList(); updateWheel(); updateStats(); updateSongsDisplay(); updateSpinBtn();
  saveToStorage();
  setTimeout(() => {
    hideAllCardSections();
    currentParticipant = [];
    const wheelSection = document.querySelector('.wheel-section');
    if (wheelSection) wheelSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 1000);
}

// ==================== PENALTIES ====================

document.getElementById('addPenaltyBtn').onclick = () => {
  const input = document.getElementById('penaltyInput');
  const penalty = input.value.trim();
  if (penalty && !penalties.includes(penalty)) {
    penalties.push(penalty);
    input.value = '';
    renderPenaltyList();
    checkClearButtons();
    saveToStorage();
  } else if (penalties.includes(penalty)) {
    alert('⚠️ Questa penitenza è già presente nella lista!');
  }
};

document.getElementById('penaltyInput').addEventListener('keypress', e => {
  if (e.key === 'Enter') document.getElementById('addPenaltyBtn').click();
});


function renderPenaltyList() {
  const container = document.getElementById('penaltyList');
  const countSpan = document.getElementById('penaltyCount');
  countSpan.textContent = penalties.length;
  if (penalties.length === 0) { container.innerHTML = '<p class="empty">Nessuna penitenza</p>'; return; }
  container.innerHTML = '';
  penalties.forEach((penalty, index) => {
    const isUsed = usedPenalties.includes(penalty);
    const item = document.createElement('div');
    item.className = `song-item ${isUsed ? 'used' : ''}`;
    item.innerHTML = `
      <span class="song-name">${index + 1}. ${penalty} ${isUsed ? '✅' : ''}</span>
      <button onclick="removePenaltyByIndex(${index})">×</button>
    `;
    container.appendChild(item);
  });
}

window.removePenaltyByIndex = (index) => {
  const toRemove = penalties[index];
  const usedIdx = usedPenalties.indexOf(toRemove);
  if (usedIdx > -1) usedPenalties.splice(usedIdx, 1);
  penalties.splice(index, 1);
  renderPenaltyList(); checkClearButtons(); saveToStorage();
};

document.getElementById('clearAllPenaltiesBtn').onclick = () => {
  if (confirm('Sei sicuro di voler eliminare tutte le penitenze?')) {
    penalties = []; usedPenalties = [];
    renderPenaltyList(); checkClearButtons(); saveToStorage();
  }
};

// ==================== PENALTY CARD MODE ====================
function showPenaltyCardMode() {
  const available = penalties.filter(p => !usedPenalties.includes(p));

  if (available.length === 0) {
    if (penalties.length === 0) {
      alert('⚠️ Nessuna penitenza caricata! Aggiungile nella sezione Penitenze.');
      backToModeSelection();
      return;
    }
    if (confirm('⚠️ Tutte le penitenze sono state usate. Vuoi ricominciare dalla lista completa?')) {
      usedPenalties = [];
      saveToStorage();
    } else {
      backToModeSelection();
      return;
    }
  }

  const freshAvailable = penalties.filter(p => !usedPenalties.includes(p));
  const randomIndex = Math.floor(Math.random() * freshAvailable.length);
  const penalty = freshAvailable[randomIndex];

  window._currentPenalty = penalty;

  document.getElementById('cardBack').textContent = penalty;
  document.getElementById('currentPlayerSingle').textContent = `${currentParticipant} — Penitenza 😈`;
  document.getElementById('singleCard').classList.remove('flipped');
  document.getElementById('singleCardSection').style.display = 'block';
  document.getElementById('nextSongBtn').style.display = 'inline-block';
  document.getElementById('nextSongBtn').textContent = 'Altra';
  document.getElementById('selectSongBtn').style.display = 'inline-block';
  document.getElementById('selectSongBtn').textContent = 'Accetta 😈';

  document.getElementById('nextSongBtn').onclick = () => showPenaltyCardMode();
  document.getElementById('selectSongBtn').onclick = () => selectPenalty(window._currentPenalty);

  setTimeout(() => {
    document.getElementById('singleCard').classList.add('flipped');
  }, 500);
  setTimeout(() => {
    document.getElementById('singleCardSection').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 300);
}

function selectPenalty(penaltyName) {
  usedPenalties.push(penaltyName);
  if (currentParticipant && !usedParticipants.includes(currentParticipant)) {
    usedParticipants.push(currentParticipant);
  }
  navigator.clipboard.writeText(penaltyName).catch(() => {});
  alert(`😈 Penitenza per ${currentParticipant}:\n"${penaltyName}"`);

  renderParticipants(); renderPenaltyList(); updateWheel(); updateStats(); updateSpinBtn();
  saveToStorage();
  setTimeout(() => {
    hideAllCardSections();
    currentParticipant = [];
    const wheelSection = document.querySelector('.wheel-section');
    if (wheelSection) wheelSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 1000);
}

// ==================== INIT ====================
loadFromStorage();
renderParticipants();
renderSongList();
renderPenaltyList();
updateWheel();
updateStats();
updateSongsDisplay();
updateSpinBtn();
checkClearButtons();