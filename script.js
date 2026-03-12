let participants = [], usedParticipants = [], songs = [], usedSongs = [], currentSongs = [], currentParticipant = [];

// Aggiungi nome
document.getElementById('addNameBtn').onclick = () => {
  const input = document.getElementById('nameInput');
  const name = input.value.trim();
  if (name && !participants.includes(name)) {
    participants.push(name);
    input.value = '';
    renderParticipants();
    updateWheel();
    updateSpinBtn();
  }
};

document.getElementById('nameInput').addEventListener('keypress', e => {
  if (e.key === 'Enter') document.getElementById('addNameBtn').click();
});

// Rimuovi partecipante
window.removeParticipant = (index) => {
  participants.splice(index, 1);
  renderParticipants();
  updateWheel();
  updateSpinBtn();
};

// Carica CSV
document.getElementById('csvFile').onchange = e => {
  const reader = new FileReader();
  reader.onload = ev => {
    songs = ev.target.result.split('\n').map(l => l.trim()).filter(Boolean);
    usedSongs = [];
    updateSongsDisplay();
    updateSpinBtn();
  };
  reader.readAsText(e.target.files[0]);
};

function updateSongsDisplay() {
  document.getElementById('songsLoaded').textContent = 
    songs.length ? `${songs.length} canzoni caricate` : '';
}

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
  document.getElementById('totalParts').textContent = participants.length;
  document.getElementById('totalSongs').textContent = songs.length;
  document.getElementById('availableParts').textContent = available.length;
}

function updateSpinBtn() {
  const availableParts = participants.filter(p => !usedParticipants.includes(p));
  document.getElementById('spinBtn').disabled = availableParts.length === 0 || !songs.length;
}

// RESET TUTTO - SEMPRE DISPONIBILE
document.getElementById('resetBtn').onclick = () => {
  if (confirm('Sei sicuro di voler resettare tutto? Tutti i cantanti e le canzoni saranno di nuovo disponibili.')) {
    usedParticipants = [];
    usedSongs = [];
    currentParticipant = null;
    currentSongs = [];
    
    renderParticipants();
    updateWheel();
    updateStats();
    updateSpinBtn();
    
    // Nascondi sezione carte se visibile
    const cardsSection = document.getElementById('cardsSection');
    cardsSection.classList.remove('showing');
    document.getElementById('proposeMoreBtn').style.display = 'none';
    document.getElementById('currentPlayer').textContent = '';
    
    alert('✅ Tutto resettato! Si ricomincia da capo! 🎉');
  }
};

// Aggiorna ruota
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
    text.textContent = participants.length ? 'Tutti hanno cantato! Clicca Reset per ricominciare.' : 'Aggiungi partecipanti';
    svg.appendChild(text);
    return;
  }
  
  createWheel(available);
}

// Crea ruota
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
  
  // Centro
  const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  centerCircle.setAttribute('cx', centerX);
  centerCircle.setAttribute('cy', centerY);
  centerCircle.setAttribute('r', 10);
  centerCircle.setAttribute('fill', '#ddd');
  svg.appendChild(centerCircle);
}

// Gira ruota
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
      document.getElementById('currentPlayer').textContent = `${currentParticipant} - Scegli la tua canzone`;
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

// Mostra canzoni
document.getElementById('showSongsBtn').onclick = () => {
  createCards();
  
  setTimeout(() => {
    const cardsSection = document.getElementById('cardsSection');
    cardsSection.classList.add('showing');
    cardsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    document.getElementById('showSongsBtn').style.display = 'none';
    document.getElementById('proposeMoreBtn').style.display = 'inline-block';
    setTimeout(() => autoFlipCards(), 500);
  }, 300);
};

// Proponi altre 5
document.getElementById('proposeMoreBtn').onclick = () => {
  createCards();
  document.querySelectorAll('.card').forEach(card => {
    card.classList.remove('flipped', 'chosen');
  });
  setTimeout(() => autoFlipCards(), 100);
};

function createCards() {
  const grid = document.getElementById('cardsGrid');
  grid.innerHTML = '';
  const availableSongs = songs.filter(s => !usedSongs.includes(s));
  currentSongs = [];
  
  const tempSongs = [...availableSongs];
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
  document.querySelectorAll('.card').forEach((card, index) => {
    setTimeout(() => card.classList.add('flipped'), index * 1000);
  });
}

// Selezione carta
document.addEventListener('click', (e) => {
  const card = e.target.closest('.card');
  if (card) {
    document.querySelectorAll('.card').forEach(c => c.classList.remove('chosen'));
    card.classList.add('chosen');
    
    const songName = card.dataset.song;
    setTimeout(() => selectSong(songName), 300);
  }
});

function selectSong(songName) {
  usedSongs.push(songName);
  
  if (currentParticipant && !usedParticipants.includes(currentParticipant)) {
    usedParticipants.push(currentParticipant);
  }
  
  navigator.clipboard.writeText(songName).then(() => {
    alert(`"${songName}" copiato!\n${currentParticipant} canterà questa canzone`);
  });
  
  renderParticipants();
  updateWheel();
  updateStats();
  updateSpinBtn();
  
  setTimeout(() => {
    const cardsSection = document.getElementById('cardsSection');
    cardsSection.classList.remove('showing');
    document.querySelectorAll('.card').forEach(c => c.classList.remove('flipped', 'chosen'));
    document.getElementById('proposeMoreBtn').style.display = 'none';
    currentParticipant = null;
    document.getElementById('currentPlayer').textContent = '';
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 1000);
}

// Init
updateSongsDisplay();
updateSpinBtn();
updateStats();
updateWheel();