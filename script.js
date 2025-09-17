/* -------------------------
 DOM refs & init
------------------------- */
const dayInput = document.getElementById('day');
const monthInput = document.getElementById('month');
const yearInput = document.getElementById('year');
const calcBtn = document.getElementById('calcBtn');
const clearBtn = document.getElementById('clearBtn');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalMsg = document.getElementById('modalMsg');
const outputArea = document.getElementById('outputArea');
const resultsGrid = document.getElementById('resultsGrid');
const birthdayCard = document.getElementById('birthdayCard');
const confettiCanvas = document.getElementById('confetti');
const ctx = confettiCanvas.getContext ? confettiCanvas.getContext('2d') : null;

// set year max to current year so max attribute is meaningful
yearInput.setAttribute('max', new Date().getFullYear());

/* -------------------------
 Modal helpers
------------------------- */
function showModal(title, msg) {
  modalTitle.textContent = title;
  modalMsg.textContent = msg;
  modal.classList.add('show');
  clearTimeout(modal._timeout);
  modal._timeout = setTimeout(()=> modal.classList.remove('show'), 4200);
}
// close on Escape
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') modal.classList.remove('show'); });
// close by clicking outside modal-card
modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('show'); });

/* -------------------------
 Input enforcement (maxlength & numeric-only)
 - maxlength is not reliable for type=number, so we enforce in JS
------------------------- */
const inputs = [dayInput, monthInput, yearInput];
inputs.forEach(inp=>{
  // remove non-digits as user types, respect maxlength when present
  inp.addEventListener('input', () => {
    let v = (inp.value || '').toString();
    // remove any non-digit
    v = v.replace(/[^\d]/g, '');
    const maxLen = parseInt(inp.getAttribute('maxlength') || '0', 10);
    if (!isNaN(maxLen) && maxLen > 0) v = v.slice(0, maxLen);
    inp.value = v;
  });

  // prevent pasting non-numeric content
  inp.addEventListener('paste', (e) => {
    const text = (e.clipboardData || window.clipboardData).getData('text');
    if (!/^\d+$/.test(text)) e.preventDefault();
  });

  // on blur, validate the min/max attributes but don't force values while typing
  inp.addEventListener('blur', () => {
    if (inp.value === '') return;
    const min = inp.hasAttribute('min') ? parseInt(inp.getAttribute('min'), 10) : null;
    const max = inp.hasAttribute('max') ? parseInt(inp.getAttribute('max'), 10) : null;
    const n = parseInt(inp.value, 10);
    if (!isNaN(min) && n < min) showModal('Invalid value', `Value must be ≥ ${min}`);
    if (!isNaN(max) && n > max) showModal('Invalid value', `Value must be ≤ ${max}`);
  });
});

/* quick UX: move focus as user completes each part */
dayInput.addEventListener('input', () => { if (dayInput.value.length >= 2) monthInput.focus(); });
monthInput.addEventListener('input', () => { if (monthInput.value.length >= 2) yearInput.focus(); });

/* -------------------------
 Utilities (zodiac, generation, life-stage)
------------------------- */
function isLeap(y){ return (y%4===0 && y%100!==0) || (y%400===0); }
function isValidDate(d,m,y){
  if (![d,m,y].every(n => Number.isFinite(n))) return false;
  if (y < 1 || m < 1 || m > 12 || d < 1) return false;
  const mdays = [31, (isLeap(y) ? 29 : 28), 31,30,31,30,31,31,30,31,30,31];
  return d <= mdays[m-1];
}
function calculateAge(d,m,y){
  const today = new Date();
  const birth = new Date(y, m-1, d);
  if (birth > today) return null;
  let age = today.getFullYear() - birth.getFullYear();
  const mDiff = today.getMonth() - birth.getMonth();
  if (mDiff < 0 || (mDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}
function getMonthName(m){ const names = ['January','February','March','April','May','June','July','August','September','October','November','December']; return names[m-1] || ''; }

function getZodiacSign(day, month){
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Pisces';
  return 'Unknown';
}
function getZodiacColor(day, month){
  const sign = getZodiacSign(day, month);
  const map = {Aries:'Red',Taurus:'Forest Green',Gemini:'Yellow',Cancer:'Deep Blue',Leo:'Orange',Virgo:'Brown',Libra:'Pink',Scorpio:'Black',Sagittarius:'Purple',Capricorn:'Gray',Aquarius:'Light Blue',Pisces:'Seafoam Green'};
  return map[sign] || 'Unknown';
}
function getZodiacCharacteristics(day, month){
  const sign = getZodiacSign(day, month);
  const map = {
    Aries:'Courageous, energetic, willful, commanding, leading.',
    Taurus:'Pleasure seeking, loves control, dependable, grounded, sensual.',
    Gemini:'Cerebral, chatty, loves learning and education, charming, adventurous.',
    Cancer:'Emotional, group oriented, seeks security, family.',
    Leo:'Generous, organized, protective, radiant.',
    Virgo:'Particular, logical, practical, sense of duty, critical.',
    Libra:'Balanced, seeks beauty, sense of justice.',
    Scorpio:'Passionate, exacting, loves extremes, combative, reflective.',
    Sagittarius:'Happy, absent minded, creative, adventurous.',
    Capricorn:'Timeless, driven, calculating, ambitious.',
    Aquarius:'Forward thinking, communicative, people oriented, stubborn, generous.',
    Pisces:'Likeable, energetic, passionate, sensitive.'
  };
  return map[sign] || 'Unknown';
}
function getGeneration(year){
  if (year <= 1924) return 'The Greatest Generation';
  if (year <= 1945) return 'The Silent Generation';
  if (year <= 1964) return 'The Baby Boomer Generation';
  if (year <= 1979) return 'Generation X';
  if (year <= 1994) return 'Millennials';
  if (year <= 2012) return 'Generation Z';
  return 'Gen Alpha';
}
function getLifeStage(age){
  if (age <= 1) return 'Infant';
  if (age <= 4) return 'Toddler';
  if (age <= 12) return 'Child';
  if (age <= 19) return 'Teen';
  if (age <= 39) return 'Adult';
  if (age <= 59) return 'Middle Age Adult';
  return 'Senior Adult';
}

/* -------------------------
 next birthday + daysBetween
------------------------- */
function nextBirthdayDate(d, m /* y not needed */) {
  const today = new Date();
  const thisYearBD = new Date(today.getFullYear(), m - 1, d);

  // If today is the birthday → return today
  if (today.getDate() === d && today.getMonth() === m - 1) return today;

  // If this year's birthday already passed → next year
  if (thisYearBD < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
    return new Date(today.getFullYear() + 1, m - 1, d);
  }

  // Otherwise later this year
  return thisYearBD;
}

function daysBetween(a, b) {
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((utcB - utcA) / (24 * 60 * 60 * 1000));
}

/* -------------------------
 confetti (canvas) particle system
------------------------- */
let confettiParticles = [];
let confettiRunning = false;

function resizeCanvas(){
  if(!ctx) return;
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function pickRandomColor(){
  const palette = ['#FF4D4D','#FFD166','#06D6A0','#4FD1C5','#7C5CFF','#FFA07A','#F472B6','#60A5FA'];
  return palette[Math.floor(Math.random()*palette.length)];
}
function spawnConfettiBurst(amount = 80){
  if(!ctx) return;
  confettiParticles = [];
  for (let i=0;i<amount;i++){
    confettiParticles.push({
      x: Math.random() * confettiCanvas.width,
      y: -10 - Math.random()*200,
      vx: (Math.random()-0.5) * 6,
      vy: Math.random()*3 + 2,
      size: Math.random()*8 + 6,
      rotation: Math.random()*360,
      vr: (Math.random()-0.5) * 8,
      color: pickRandomColor()
    });
  }
  if (!confettiRunning) {
    confettiRunning = true;
    requestAnimationFrame(confettiFrame);
    setTimeout(()=> { confettiRunning = false; confettiParticles = []; clearCanvas(); }, 4500);
  }
}
function confettiFrame(){
  if (!confettiRunning || !ctx) return;
  ctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
  for (let p of confettiParticles){
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.06; // gravity
    p.rotation += p.vr;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation * Math.PI / 180);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size * 0.6);
    ctx.restore();
  }
  confettiParticles = confettiParticles.filter(p => p.y < confettiCanvas.height + 50);
  requestAnimationFrame(confettiFrame);
}
function clearCanvas(){ if(ctx) ctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height); }

/* -------------------------
 DOM rendering helpers
------------------------- */
function clearResults(){
  resultsGrid.innerHTML = '';
  outputArea.style.display = 'none';
  birthdayCard.style.display = 'none';
}
function addResultRow(title, value){
  const row = document.createElement('div');
  row.className = 'result-row pop-in';
  const t = document.createElement('div');
  t.className = 'result-title';
  t.textContent = title;
  const v = document.createElement('div');
  v.className = 'result-value';
  v.textContent = value;
  row.appendChild(t);
  row.appendChild(v);
  resultsGrid.appendChild(row);
}
function prettyDate(dt){
  return dt.toLocaleDateString(undefined, {year:'numeric', month:'short', day:'numeric'});
}

/* -------------------------
 Main flow: Calculate button handler
------------------------- */
calcBtn.addEventListener('click', () => {
  clearTimeout(modal._timeout);

  const dRaw = (dayInput.value || '').trim();
  const mRaw = (monthInput.value || '').trim();
  const yRaw = (yearInput.value || '').trim();

  if (!dRaw || !mRaw || !yRaw) {
    showModal('Incomplete', 'All fields must be filled. Please enter day, month and year.');
    return;
  }

  const d = parseInt(dRaw, 10);
  const m = parseInt(mRaw, 10);
  const y = parseInt(yRaw, 10);

  if (!isValidDate(d,m,y)) {
    showModal('Invalid Date', 'Please provide a valid date. Check day-month-year combination (and leap years).');
    return;
  }

  const today = new Date();
  const birth = new Date(y, m-1, d);
  if (birth > today) {
    showModal('Future Date', 'Date of birth cannot be in the future.');
    return;
  }

  const age = calculateAge(d,m,y);
  if (age === null || age < 0) {
    showModal('Error', 'Could not calculate age.');
    return;
  }

  // Clear prior results
  resultsGrid.innerHTML = '';
  outputArea.style.display = 'block';

  // Basic infos
  addResultRow('Age', `${age} year${age !== 1 ? 's' : ''}`);
  addResultRow('Birth Day', `${d}`);
  addResultRow('Birth Month', `${getMonthName(m)}`);
  addResultRow('Birth Year', `${y}`);

  // Next birthday
  const nextBD = nextBirthdayDate(d,m);
  const daysLeft = daysBetween(today, nextBD);

  if (daysLeft === 0) {
    // Happy birthday
    birthdayCard.style.display = 'flex';
    addResultRow('Next Birthday', `${prettyDate(nextBD)} (Today!)`);
    addResultRow('Days left', `0 — It's your birthday!`);
    spawnConfettiBurst(140);
  } else {
    birthdayCard.style.display = 'none';
    addResultRow('Next Birthday', prettyDate(nextBD));
    addResultRow('Days left', `${daysLeft} day${daysLeft !== 1 ? 's' : ''}`);
  }

  // Life stage & generation
  addResultRow('Life Stage', getLifeStage(age));
  addResultRow('Generation', getGeneration(y));

  // Zodiac
  const sign = getZodiacSign(d,m) || 'Unknown';
  addResultRow('Zodiac Sign', sign);
  addResultRow('Zodiac Color', getZodiacColor(d,m));
  addResultRow('Zodiac Characteristics', getZodiacCharacteristics(d,m));

  

  // small flourish: staggered reveal
  setTimeout(()=> {
    resultsGrid.querySelectorAll('.result-row').forEach((r,i)=> r.style.animationDelay = (i*40) + 'ms');
    resultsGrid.scrollIntoView({behavior:'smooth', block:'center'});
  }, 50);
});

/* Clear button */
clearBtn.addEventListener('click', () => {
  dayInput.value = '';
  monthInput.value = '';
  yearInput.value = '';
  clearResults();
});

/* Allow pressing Enter (on mobile the numeric keyboard may not show enter) */
[dayInput, monthInput, yearInput].forEach(inp=>{
  inp.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      calcBtn.click();
    }
  });
});