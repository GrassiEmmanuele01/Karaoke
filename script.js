let participants = [], usedParticipants = [], songs = [], usedSongs = [], currentParticipant = [];
let songMode = 'csv';
let currentSongIndex = 0;
let availableSongsForTurn = [];
let shownSongsInTurn = [];

// ==================== SONG MODE ====================
function setSongMode(mode) {
  songMode = mode;
  
  document.getElementById('csvModeBtn').classList.toggle('active', mode === 'csv');
  document.getElementById('manualModeBtn').classList.toggle('active', mode === 'manual');
  
  document.getElementById('csvModeSection').style.display = mode === 'csv' ? 'block' : 'none';
  document.getElementById('manualModeSection').style.display = mode === 'manual' ? 'block' : 'none';
  
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
    renderManualSongs();
    updateSongsDisplay();
    updateSpinBtn();
    checkClearButtons();
  }
};

document.getElementById('songInput').addEventListener('keypress', e => {
  if (e.key === 'Enter') document.getElementById('addSongBtn').click();
});

window.removeManualSong = (index) => {
  const songToRemove = songs[index];
  const usedIndex = usedSongs.indexOf(songToRemove);
  if (usedIndex > -1) {
    usedSongs.splice(usedIndex, 1);
  }
  songs.splice(index, 1);
  renderManualSongs();
  updateSongsDisplay();
  updateSpinBtn();
  checkClearButtons();
};

function renderManualSongs() {
  const list = document.getElementById('manualSongsList');
  list.innerHTML = '';
  songs.forEach((song, i) => {
    const tag = document.createElement('div');
    const isUsed = usedSongs.includes(song);
    tag.className = `tag ${isUsed ? 'used' : ''}`;
    tag.innerHTML = `
      ${song} ${isUsed ? '✅' : ''}
      <button onclick="removeManualSong(${i})">×</button>
    `;
    list.appendChild(tag);
  });
}

// ==================== CSV ====================
document.getElementById('csvFile').onchange = e => {
  const reader = new FileReader();
  reader.onload = ev => {
    songs = ev.target.result.split('\n').map(l => l.trim()).filter(Boolean);
    usedSongs = [];
    updateSongsDisplay();
    updateSpinBtn();
    checkClearButtons();
  };
  reader.readAsText(e.target.files[0]);
};

function updateSongsDisplay() {
  const availableCount = songs.filter(s => !usedSongs.includes(s)).length;
  
  if (songMode === 'csv') {
    document.getElementById('csvSongsLoaded').textContent = 
      songs.length ? `${songs.length} canzoni caricate (${availableCount} disponibili)` : '';
  }
}

// ==================== PARTICIPANTS ====================
document.getElementById('addNameBtn').onclick = () => {
  const input = document.getElementById('nameInput');
  const name = input.value.trim();
  if (name && !participants.includes(name)) {
    participants.push(name);
    input.value = '';
    renderParticipants();
    updateWheel();
    updateSpinBtn();
    checkClearButtons();
  }
};

document.getElementById('nameInput').addEventListener('keypress', e => {
  if (e.key === 'Enter') document.getElementById('addNameBtn').click();
});

window.removeParticipant = (index) => {
  participants.splice(index, 1);
  renderParticipants();
  updateWheel();
  updateSpinBtn();
  checkClearButtons();
};

function renderParticipants() {
  const list = document.getElementById('participantsList');
  list.innerHTML = '';
  participants.forEach((name, i) => {
    const tag = document.createElement('div');
    tag.className = `tag ${usedParticipants.includes(name) ? 'used' : ''}`;
    tag.innerHTML = `
      ${name}
      <button onclick="removeParticipant(${i})">×</button>
    `;
    list.appendChild(tag);
  });
  updateStats();
}

function updateStats() {
  const available = participants.filter(p => !usedParticipants.includes(p));
  const availableSongsCount = songs.filter(s => !usedSongs.includes(s)).length;
  
  document.getElementById('totalParts').textContent = participants.length;
  document.getElementById('totalSongs').textContent = songs.length;
  document.getElementById('availableSongs').textContent = availableSongsCount;
}

function updateSpinBtn() {
  const availableParts = participants.filter(p => !usedParticipants.includes(p));
  const availableSongsCount = songs.filter(s => !usedSongs.includes(s)).length;
  document.getElementById('spinBtn').disabled = availableParts.length === 0 || availableSongsCount === 0;
}

// ==================== CLEAR ALL BUTTONS ====================
function checkClearButtons() {
  // Show/hide clear all participants button
  const clearParticipantsBtn = document.getElementById('clearAllParticipantsBtn');
  clearParticipantsBtn.style.display = participants.length > 0 ? 'inline-block' : 'none';
  
  // Show/hide clear all songs button
  const clearSongsBtn = document.getElementById('clearAllSongsBtn');
  clearSongsBtn.style.display = songs.length > 0 ? 'inline-block' : 'none';
}

// Clear all participants
document.getElementById('clearAllParticipantsBtn').onclick = () => {
  if (confirm('Sei sicuro di voler eliminare tutti i cantanti?')) {
    participants = [];
    usedParticipants = [];
    renderParticipants();
    updateWheel();
    updateSpinBtn();
    checkClearButtons();
  }
};

// Clear all songs
document.getElementById('clearAllSongsBtn').onclick = () => {
  if (confirm('Sei sicuro di voler eliminare tutte le canzoni?')) {
    songs = [];
    usedSongs = [];
    if (songMode === 'manual') {
      renderManualSongs();
    }
    updateSongsDisplay();
    updateSpinBtn();
    checkClearButtons();
  }
};

// ==================== RESET ====================
document.getElementById('resetBtn').onclick = () => {
  if (confirm('Sei sicuro di voler resettare tutto?')) {
    usedParticipants = [];
    usedSongs = [];
    currentParticipant = [];
    currentSongIndex = 0;
    availableSongsForTurn = [];
    shownSongsInTurn = [];
    
    renderParticipants();
    if (songMode === 'manual') renderManualSongs();
    updateWheel();
    updateStats();
    updateSongsDisplay();
    updateSpinBtn();
    
    hideAllCardSections();
    
    alert('✅ Tutto resettato! 🎉');
  }
};

function hideAllCardSections() {
  document.getElementById('cardModeSelection').classList.remove('showing');
  document.getElementById('singleCardSection').classList.remove('showing');
  document.getElementById('fiveCardsSection').classList.remove('showing');
  document.getElementById('nextSongBtn').style.display = 'none';
  document.getElementById('selectSongBtn').style.display = 'none';
  document.getElementById('proposeMoreBtn').style.display = 'none';
  document.getElementById('currentPlayerSingle').textContent = '';
  document.getElementById('currentPlayerFive').textContent = '';
  document.getElementById('cardModePlayer').textContent = '';
}

// ==================== WHEEL ====================
function updateWheel() {
  const svg = document.getElementById('wheelSvg');
  svg.innerHTML = '';
  svg.style.transform = 'rotate(0deg)';
  
  const available = participants.filter(p => !usedParticipants.includes(p));
  
  if (available.length === 0) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', 200);
    circle.setAttribute('cy', 200);
    circle.setAttribute('r', 190);
    circle.setAttribute('fill', '#fafafa');
    circle.setAttribute('stroke', '#e0e0e0');
    circle.setAttribute('stroke-width', '2');
    svg.appendChild(circle);
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', 200);
    text.setAttribute('y', 200);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('font-size', '14');
    text.setAttribute('fill', '#999');
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
    '#FFE5E5', '#E5FFE5', '#E5F0FF', '#FFFFE5', '#FFF0E5',
    '#F0FFE5', '#FFFFF0', '#FFE5F0', '#F0E5FF', '#FFE5F5'
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
    path.setAttribute('stroke', 'white');
    path.setAttribute('stroke-width', '2');
    svg.appendChild(path);

    const textAngle = startAngle + angleSlice / 2;
    const textRadius = radius * 0.65;
    const textX = centerX + textRadius * Math.cos(textAngle);
    const textY = centerY + textRadius * Math.sin(textAngle);
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', textX);
    text.setAttribute('y', textY);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    
    const fontSize = numSlices > 10 ? 11 : numSlices > 6 ? 13 : 14;
    text.setAttribute('font-size', fontSize);
    text.setAttribute('fill', '#333');
    text.textContent = name.length > 12 ? name.substring(0, 12) + '...' : name;
    
    const rotation = (textAngle * 180 / Math.PI) + 90;
    text.setAttribute('transform', `rotate(${rotation}, ${textX}, ${textY})`);
    
    svg.appendChild(text);
  });
  
  const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  centerCircle.setAttribute('cx', centerX);
  centerCircle.setAttribute('cy', centerY);
  centerCircle.setAttribute('r', 10);
  centerCircle.setAttribute('fill', '#ddd');
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
    const progress = Math.min((time - start) / 4000, 1);
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
  document.getElementById('cardModeSelection').classList.add('showing');
  
  setTimeout(() => {
    document.getElementById('cardModeSelection').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 300);
};

// ==================== SELECT CARD MODE ====================
function selectCardMode(mode) {
  document.getElementById('cardModeSelection').classList.remove('showing');
  
  if (mode === 'single') {
    showSingleCardMode();
  } else {
    showFiveCardsMode();
  }
}

function backToModeSelection() {
  document.getElementById('singleCardSection').classList.remove('showing');
  document.getElementById('fiveCardsSection').classList.remove('showing');
  document.getElementById('cardModeSelection').classList.add('showing');
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
  pickRandomSong();
  
  document.getElementById('currentPlayerSingle').textContent = `${currentParticipant} - Scegli la tua canzone`;
  document.getElementById('singleCardSection').classList.add('showing');
  document.getElementById('nextSongBtn').style.display = 'inline-block';
  document.getElementById('selectSongBtn').style.display = 'inline-block';
  
  setTimeout(() => {
    document.getElementById('singleCard').classList.add('flipped');
  }, 500);
  
  setTimeout(() => {
    document.getElementById('singleCardSection').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 300);
}

function pickRandomSong() {
  const notShownYet = availableSongsForTurn.filter(s => !shownSongsInTurn.includes(s));
  
  if (notShownYet.length === 0) {
    shownSongsInTurn = [];
  }
  
  const randomIndex = Math.floor(Math.random() * notShownYet.length);
  currentSongIndex = availableSongsForTurn.indexOf(notShownYet[randomIndex]);
  shownSongsInTurn.push(availableSongsForTurn[currentSongIndex]);
  
  showCurrentSong();
}

function showCurrentSong() {
  const song = availableSongsForTurn[currentSongIndex];
  document.getElementById('cardBack').textContent = song;
  document.getElementById('singleCard').classList.remove('flipped', 'selected');
  
  setTimeout(() => {
    document.getElementById('singleCard').classList.add('flipped');
  }, 100);
}

document.getElementById('nextSongBtn').onclick = () => {
  pickRandomSong();
};

document.getElementById('selectSongBtn').onclick = () => {
  const song = availableSongsForTurn[currentSongIndex];
  selectSong(song);
};

document.getElementById('singleCard').onclick = () => {
  document.getElementById('singleCard').classList.toggle('flipped');
};

// ==================== FIVE CARDS MODE ====================
function showFiveCardsMode() {
  createFiveCards();
  
  document.getElementById('currentPlayerFive').textContent = `${currentParticipant} - Scegli la tua canzone`;
  document.getElementById('fiveCardsSection').classList.add('showing');
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
    card.className = 'card';
    card.setAttribute('data-song', song);
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-face card-front">${i+1}</div>
        <div class="card-face card-back">${song}</div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function autoFlipCards() {
  document.querySelectorAll('#cardsGrid .card').forEach((card, index) => {
    setTimeout(() => card.classList.add('flipped'), index * 1000);
  });
}

document.getElementById('proposeMoreBtn').onclick = () => {
  createFiveCards();
  document.querySelectorAll('#cardsGrid .card').forEach(card => {
    card.classList.remove('flipped', 'chosen');
  });
  setTimeout(() => autoFlipCards(), 100);
};

document.addEventListener('click', (e) => {
  const card = e.target.closest('#cardsGrid .card');
  if (card) {
    document.querySelectorAll('#cardsGrid .card').forEach(c => c.classList.remove('chosen'));
    card.classList.add('chosen');
    
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
  
  renderParticipants();
  if (songMode === 'manual') renderManualSongs();
  updateWheel();
  updateStats();
  updateSongsDisplay();
  updateSpinBtn();
  
  setTimeout(() => {
    hideAllCardSections();
    currentParticipant = [];
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 1000);
}

// Init
updateSongsDisplay();
updateSpinBtn();
updateStats();
updateWheel();
checkClearButtons();