// ==========================================
// LingoBridge - Speech to ASL Translation
// ==========================================

// --------------------------
// CONFIGURATION
// --------------------------
const API_BASE_URL = 'http://localhost:5000';
const DEMO_TEXT = "Hello my name is Halima. I love learning sign language. Thank you for watching.";

// Chunking tuning (classroom-friendly defaults)
const COMMIT_SILENCE_MS = 700;     // commit after ~0.7s of silence
const MIN_WORDS_PER_CHUNK = 2;     // avoid committing tiny fragments too often

// Backpressure / classroom tuning
const MAX_QUEUE_ITEMS = 18;          // hard ceiling on queued items
const SOFT_QUEUE_ITEMS = 12;         // start dropping less-important items above this
const MAX_SIGNS_PER_CHUNK = 6;       // limit new items added per committed chunk

// Very small stopword list (safe starter). You can expand later.
const STOPWORDS = new Set([
  "the","a","an","and","or","but","so",
  "to","of","in","on","at","for","from","with","as",
  "is","am","are","was","were","be","been","being",
  "it","this","that","these","those",
  "i","you","he","she","we","they","me","him","her","us","them",
  "my","your","his","her","our","their",
  "do","does","did","doing",
  "have","has","had",
  "not","no","yes",
  "um","uh"
]);

function isStopword(w) {
  return STOPWORDS.has(w);
}
// --------------------------
// DOM ELEMENTS
// --------------------------
// Buttons
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const demoBtn = document.getElementById('demoBtn');
const clearBtn = document.getElementById('clearBtn');
const downloadBtn = document.getElementById('downloadBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resumeBtn = document.getElementById('resumeBtn');

const darkModeToggle = document.getElementById('darkModeToggle');
const helpBtn = document.getElementById('helpBtn');
const settingsBtn = document.getElementById('settingsBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const saveSettingsBtn = document.getElementById('saveSettings');
const resetSettingsBtn = document.getElementById('resetSettings');

// Display elements
const status = document.getElementById('status');
const transcript = document.getElementById('transcript');
const videoContainer = document.getElementById('videoContainer');
const aslVideoA = document.getElementById('aslVideoA');
const aslVideoB = document.getElementById('aslVideoB');
const currentWord = document.getElementById('currentWord');
const playbackSpeed = document.getElementById('playbackSpeed');

// Stats
const wordCount = document.getElementById('wordCount');
const signCount = document.getElementById('signCount');
const totalSigns = document.getElementById('totalSigns');

// Optional translation display (you can remove from HTML safely)
const currentSentence = document.getElementById('currentSentence');
const missingWords = document.getElementById('missingWords');

// Modals
const helpModal = document.getElementById('helpModal');
const settingsModal = document.getElementById('settingsModal');

// Settings inputs
const textSize = document.getElementById('textSize');
const autoPlay = document.getElementById('autoPlay');
const highlightWords = document.getElementById('highlightWords');
const showStats = document.getElementById('showStats');

// --------------------------
// STATE MANAGEMENT
// --------------------------
let recognition = null;
let isListening = false;
let isPaused = false;

let wordsRecognized = 0;
let signsPlayed = 0;

let videoQueue = [];
let isPlayingVideo = false;
let isFingerspelling = false;

// Speech buffering/chunking
let interimBuffer = '';
let silenceTimer = null;

// Lyrics highlighting
let currentTranscriptLineEl = null;

// --------------------------
// INITIALIZATION
// --------------------------
window.addEventListener('load', async () => {
  initializeSpeechRecognition();
  loadSettings();
  await checkServerHealth();
  setupEventListeners();
  setupKeyboardShortcuts();
  updateDarkModeIcon();

  // A/B sanity check
  if (!aslVideoA || !aslVideoB) {
    console.error('Missing aslVideoA/aslVideoB. Fix index.html video IDs.');
    updateStatus('❌ Video elements missing (check HTML ids)', 'error');
  }

  // Improve transcript container semantics for lyrics mode
  transcript.classList.add('transcript-lyrics');
});

// --------------------------
// SMOOTH VIDEO PLAYER (A/B)
// --------------------------
const smoothPlayer = (() => {
  let active = aslVideoA;
  let inactive = aslVideoB;

  function ensureInit() {
    if (!active || !inactive) return false;
    active.classList.add('is-active');
    inactive.classList.remove('is-active');
    return true;
  }

  ensureInit();

  function getFullUrl(videoUrl) {
    return `${API_BASE_URL}${videoUrl}`;
  }

  async function prime(url, rate) {
    if (!ensureInit()) return;

    inactive.pause();
    inactive.currentTime = 0;
    inactive.src = url;
    inactive.playbackRate = rate;

    await new Promise((resolve) => {
      const done = () => resolve();
      inactive.addEventListener('canplay', done, { once: true });
      inactive.addEventListener('loadeddata', done, { once: true });
      setTimeout(resolve, 400); // safety
    });
  }

  async function playNow(videoUrl, opts = {}) {
    if (!ensureInit()) return;

    // If paused, do not start new playback
    if (isPaused) return;

    const { rateMultiplier = 1.0 } = opts;
    const baseRate = parseFloat(playbackSpeed.value || '1');
    const rate = baseRate * rateMultiplier;
    const url = getFullUrl(videoUrl);

    await prime(url, rate);

    // swap
    const prev = active;
    active = inactive;
    inactive = prev;

    active.classList.add('is-active');
    inactive.classList.remove('is-active');

    active.playbackRate = rate;

    if (autoPlay.checked) {
      try {
        await active.play();
      } catch (e) {
        console.error('Autoplay prevented / play failed:', e);
      }
    }
  }

  function waitForEndOrError() {
    if (!ensureInit()) return Promise.resolve();

    return new Promise((resolve) => {
      const cleanupAndResolve = () => {
        active.removeEventListener('ended', onEnd);
        active.removeEventListener('error', onError);
        resolve();
      };
      const onEnd = () => cleanupAndResolve();
      const onError = () => cleanupAndResolve();

      active.addEventListener('ended', onEnd, { once: true });
      active.addEventListener('error', onError, { once: true });
    });
  }

  function updateRates(newRate) {
    if (aslVideoA) aslVideoA.playbackRate = newRate;
    if (aslVideoB) aslVideoB.playbackRate = newRate;
  }

  function stopAll() {
    if (aslVideoA) aslVideoA.pause();
    if (aslVideoB) aslVideoB.pause();
  }

  return { playNow, waitForEndOrError, updateRates, stopAll };
})();

// --------------------------
// VIDEO DISPLAY HELPERS
// --------------------------
async function displayVideo(videoUrl, word, isLetter) {
  const placeholder = videoContainer.querySelector('.video-placeholder');
  if (placeholder) placeholder.style.display = 'none';

  if (isLetter) {
    currentWord.textContent = `Fingerspelling: ${word}`;
    currentWord.style.backgroundColor = '#f39c12';
  } else {
    currentWord.textContent = `Signing: ${word.toUpperCase()}`;
    currentWord.style.backgroundColor = '';
  }
  currentWord.style.display = 'block';

  await smoothPlayer.playNow(videoUrl, { rateMultiplier: 1.0 });
}

async function displayVideoAndWait(videoUrl, label, isLetter) {
  const placeholder = videoContainer.querySelector('.video-placeholder');
  if (placeholder) placeholder.style.display = 'none';

  currentWord.textContent = label;
  if (isLetter) currentWord.style.backgroundColor = '#f39c12';

  await smoothPlayer.playNow(videoUrl, { rateMultiplier: 1.2 });
  await smoothPlayer.waitForEndOrError();
}

// --------------------------
// VIDEO EVENT HANDLERS
// --------------------------
function onAnyVideoEnded() {
  // if paused, do nothing
  if (isPaused) return;

  if (!isFingerspelling) {
    playNextVideo();
  }
}

function onAnyVideoError(e) {
  console.error('Video error:', e);
  if (isPaused) return;

  if (!isFingerspelling) {
    updateStatus('⚠️ Video failed to load', 'warning');
    playNextVideo();
  }
}

[aslVideoA, aslVideoB].forEach((v) => {
  if (!v) return;
  v.addEventListener('ended', onAnyVideoEnded);
  v.addEventListener('error', onAnyVideoError);
});

playbackSpeed.addEventListener('change', (e) => {
  const rate = parseFloat(e.target.value || '1');
  smoothPlayer.updateRates(rate);
});

// --------------------------
// SPEECH RECOGNITION SETUP
// --------------------------
function initializeSpeechRecognition() {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    updateStatus('❌ Speech recognition not supported in this browser', 'error');
    startBtn.disabled = true;
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    isListening = true;
    updateStatus('🎤 Listening...', 'listening');

    startBtn.disabled = true;
    stopBtn.disabled = false;

    // Pause/Resume controls
    if (pauseBtn) pauseBtn.disabled = false;
    if (resumeBtn) resumeBtn.disabled = true;
  };

  recognition.onresult = (event) => {
    if (isPaused) return;

    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const t = event.results[i][0].transcript;
      if (event.results[i].isFinal) finalTranscript += t + ' ';
      else interimTranscript += t;
    }

    // Track interim buffer for silence-based committing
    if (interimTranscript) {
      interimBuffer = interimTranscript;
      scheduleSilenceCommit();
    }

    if (finalTranscript.trim()) {
      // commit immediately on final
      commitChunk(finalTranscript);
      interimBuffer = '';
      clearSilenceCommit();
    }
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    if (event.error === 'no-speech') updateStatus('⚠️ No speech detected. Please try again.', 'warning');
    else if (event.error === 'not-allowed') updateStatus('❌ Microphone access denied', 'error');
    else updateStatus(`❌ Error: ${event.error}`, 'error');
  };

  recognition.onend = () => {
    // If user explicitly stopped or paused, do not auto-restart here.
    if (isPaused) return;
    if (!isListening) return;

    // Restart if it ends unexpectedly while listening
    try {
      recognition.start();
    } catch (e) {
      stopListening();
    }
  };
}

// --------------------------
// CHUNK COMMITTING (near real-time)
// --------------------------
function scheduleSilenceCommit() {
  clearSilenceCommit();
  silenceTimer = setTimeout(() => {
    if (isPaused) return;
    const text = interimBuffer.trim();
    if (text) {
      commitChunk(text);
      interimBuffer = '';
    }
  }, COMMIT_SILENCE_MS);
}

function clearSilenceCommit() {
  if (silenceTimer) {
    clearTimeout(silenceTimer);
    silenceTimer = null;
  }
}

async function commitChunk(text) {
  const cleaned = text.trim();
  if (!cleaned) return;

  // Avoid committing very tiny 1-word junk too frequently
  const wordLen = cleaned.split(/\s+/).filter(Boolean).length;
  if (wordLen < MIN_WORDS_PER_CHUNK && cleaned.length < 10) {
    // still show it in transcript, but you can change this behavior if you want
  }

  // Lyrics-style transcript: append and highlight this chunk
  addTranscriptChunk(cleaned);

  // Optional bottom section (safe if removed)
  if (currentSentence) currentSentence.textContent += (currentSentence.textContent ? ' ' : '') + cleaned;

  // Translate + queue ASL for this chunk
  await processText(cleaned);
}

// --------------------------
// CONTROL FUNCTIONS
// --------------------------
function startListening() {
  if (!recognition) {
    updateStatus('❌ Speech recognition not available', 'error');
    return;
  }

  isPaused = false;

  try {
    recognition.start();
    isListening = true;
  } catch (error) {
    console.error('Error starting recognition:', error);
    updateStatus('❌ Failed to start listening', 'error');
  }
}

function stopListening() {
  if (recognition) {
    isListening = false;
    try { recognition.stop(); } catch {}
  }

  clearSilenceCommit();
  interimBuffer = '';

  updateStatus('⏹️ Stopped listening', 'idle');

  startBtn.disabled = false;
  stopBtn.disabled = true;

  if (pauseBtn) pauseBtn.disabled = true;
  if (resumeBtn) resumeBtn.disabled = true;
}

function pauseInterpretation() {
  if (isPaused) return;
  isPaused = true;

  // Stop recognition (prevents random noise transcription)
  if (recognition) {
    isListening = false;
    try { recognition.stop(); } catch {}
  }

  clearSilenceCommit();
  interimBuffer = '';
  videoQueue = [];
  isPlayingVideo = false;
  isFingerspelling = false;

  smoothPlayer.stopAll();

  updateStatus('⏸️ Paused (not listening)', 'idle');

  startBtn.disabled = false;
  stopBtn.disabled = true;

  if (pauseBtn) pauseBtn.disabled = true;
  if (resumeBtn) resumeBtn.disabled = false;
}

function resumeInterpretation() {
  if (!isPaused) return;
  isPaused = false;      // ← Must be FIRST
  isListening = true;    // ← Must be SECOND
  
  // Clear state
  videoQueue = [];
  isPlayingVideo = false;
  isFingerspelling = false;
  
  updateStatus('▶️ Resuming...', 'listening');
  
  // Start recognition with error handling
  if (recognition) {
    try {
      recognition.start();  
    } catch (error) {
      if (error.name !== 'InvalidStateError') {
        console.error('Resume failed:', error);
        isListening = false;
        isPaused = true;
        return;
      }
    }
  }
  
  // Update button states
  startBtn.disabled = true;
  stopBtn.disabled = false;
  if (pauseBtn) pauseBtn.disabled = false;
  if (resumeBtn) resumeBtn.disabled = true;
}

function clearTranscript() {
  transcript.innerHTML = '<p class="placeholder">Spoken words will appear here...</p>';

  if (currentSentence) currentSentence.textContent = '';
  if (missingWords) {
    missingWords.textContent = 'None';
    missingWords.style.color = '#27ae60';
  }

  wordsRecognized = 0;
  signsPlayed = 0;

  videoQueue = [];
  isPlayingVideo = false;
  isFingerspelling = false;

  currentTranscriptLineEl = null;

  updateStats();
  updateStatus('🗑️ Transcript cleared', 'idle');
}

async function startDemo() {
  updateStatus('🎬 Demo mode active...', 'demo');

  // Stop mic listening if it was running, but DO NOT pause interpretation
  stopListening();
  isPaused = false;

  // Reset playback/queue state for a clean demo run
  videoQueue = [];
  isPlayingVideo = false;
  isFingerspelling = false;

  clearTranscript();

  // Commit demo in chunks so it behaves like classroom streaming
  const parts = DEMO_TEXT.split(/[.?!]/).map(s => s.trim()).filter(Boolean);
  for (const p of parts) {
    await commitChunk(p);
  }

  updateStatus('✅ Demo complete', 'success');
}

function downloadTranscript() {
  const text = transcript.innerText.replace('Spoken words will appear here...', '').trim();

  if (!text) {
    updateStatus('⚠️ Nothing to download', 'warning');
    return;
  }

  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lingobridge-transcript-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  updateStatus('✅ Transcript downloaded', 'success');
}

// --------------------------
// LYRICS-STYLE TRANSCRIPT
// --------------------------
function addTranscriptChunk(text) {
  const placeholder = transcript.querySelector('.placeholder');
  if (placeholder) placeholder.remove();

  // Un-highlight previous
  if (currentTranscriptLineEl) {
    currentTranscriptLineEl.classList.remove('is-current');
  }

  const p = document.createElement('p');
  p.textContent = text;
  p.className = 'transcript-line is-current';

  transcript.appendChild(p);
  currentTranscriptLineEl = p;

  // Auto-scroll like lyrics
  p.scrollIntoView({ block: 'center', behavior: 'smooth' });

  // Stats
  const words = text.trim().split(/\s+/).filter(Boolean);
  wordsRecognized += words.length;
  updateStats();
}

// --------------------------
// TEXT PROCESSING & ASL TRANSLATION
// --------------------------
function applyAdaptiveSpeed() {
  // Only adjust if playbackSpeed select exists
  if (!playbackSpeed) return;

  const q = videoQueue.length;

  // These values MUST exist as <option> values in index.html
  if (q > 12) playbackSpeed.value = "2.5";
  else if (q > 6) playbackSpeed.value = "3";
  else playbackSpeed.value = "1.75";

  const rate = parseFloat(playbackSpeed.value || "1");
  smoothPlayer.updateRates(rate);
}

async function processText(text) {
  // If paused, do not translate
  if (isPaused) return;

  let words = text
  .toLowerCase()
  .replace(/[^\w\s]/g, '')
  .split(/\s+/)
  .filter(w => w.length > 0);

// 1) remove stopwords first (keeps meaning better under time pressure)
words = words.filter(w => !isStopword(w));

// 2) simple priority: longer words first (often more semantic)
// (you can swap to frequency-based later)
words.sort((a, b) => b.length - a.length);

// 3) limit how many new signs we add for this chunk
words = words.slice(0, MAX_SIGNS_PER_CHUNK);

  const missingWordsList = [];

  for (const word of words) {
    try {
      const response = await fetch(`${API_BASE_URL}/get_asl?word=${encodeURIComponent(word)}`);
      if (response.ok) {
        videoQueue.push({ type: 'word', value: word });
      } else {
        missingWordsList.push(word);
        videoQueue.push({ type: 'fingerspell', value: word });
      }
    } catch (error) {
      console.error(`Error checking word "${word}":`, error);
      missingWordsList.push(word);
      videoQueue.push({ type: 'fingerspell', value: word });
    }
  }

  // Optional bottom section (safe if removed)
  if (missingWords) {
    if (missingWordsList.length > 0) {
      missingWords.textContent = missingWordsList.join(', ');
      missingWords.style.color = '#e67e22';
    } else {
      missingWords.textContent = 'None';
      missingWords.style.color = '#27ae60';
    }
  }
  // Backpressure: if queue is growing too large, drop older/less-meaningful items.
  // Strategy: remove items from the FRONT (oldest) until we're under SOFT_QUEUE_ITEMS.
if (videoQueue.length > MAX_QUEUE_ITEMS) {
  // hard reset to newest items
  videoQueue = videoQueue.slice(videoQueue.length - SOFT_QUEUE_ITEMS);
  updateStatus('⚡ Catching up (skipping older signs to stay real-time)', 'warning');
} else if (videoQueue.length > SOFT_QUEUE_ITEMS) {
  // soft trim a little (drop a few oldest)
  const trimCount = videoQueue.length - SOFT_QUEUE_ITEMS;
  videoQueue.splice(0, trimCount);
}
//Apply adaptive speed based on current queue length
applyAdaptiveSpeed();

  if (!isPlayingVideo) {
    playNextVideo();
  }
}

// --------------------------
// VIDEO PLAYBACK QUEUE
// --------------------------
async function playNextVideo() {
  if (isPaused) return;

  if (videoQueue.length === 0) {
    isPlayingVideo = false;
    isFingerspelling = false;
    currentWord.textContent = '';
    currentWord.style.backgroundColor = '';
    return;
  }

  isPlayingVideo = true;
  const item = videoQueue.shift();

  if (item.type === 'word') {
    await playWordSign(item.value);
  } else if (item.type === 'fingerspell') {
    await fingerspellWord(item.value);
  }
}

async function playWordSign(word) {
  if (isPaused) return;

  try {
    const response = await fetch(`${API_BASE_URL}/get_asl?word=${encodeURIComponent(word)}`);
    const data = await response.json();

    if (response.ok) {
      await displayVideo(data.video_url, word, false);
      signsPlayed++;
      updateStats();
      // continues on ended event
    } else {
      playNextVideo();
    }
  } catch (error) {
    console.error(`Error fetching ASL for "${word}":`, error);
    updateStatus('⚠️ Connection error. Check if backend is running.', 'warning');
    playNextVideo();
  }
}

async function fingerspellWord(word) {
  if (isPaused) return;

  isFingerspelling = true;

  currentWord.textContent = `Fingerspelling: ${word.toUpperCase()}`;
  currentWord.style.backgroundColor = '#f39c12';

  const letters = word.split('');

  for (let i = 0; i < letters.length; i++) {
    if (isPaused) break;

    const letterRaw = letters[i].toLowerCase();

    if (!/^[a-z]$/.test(letterRaw)) {
      await showLetterPlaceholder(letters[i].toUpperCase(), 350);
      continue;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/get_asl?word=${encodeURIComponent(letterRaw)}`);
      const data = await response.json();

      if (response.ok) {
        await displayVideoAndWait(data.video_url, `${letterRaw.toUpperCase()} (${i + 1}/${letters.length})`, true);
        signsPlayed++;
        updateStats();
      } else {
        await showLetterPlaceholder(letterRaw.toUpperCase(), 500);
      }
    } catch (error) {
      console.error(`Error fetching fingerspelling for "${letterRaw}":`, error);
      await showLetterPlaceholder(letterRaw.toUpperCase(), 500);
    }
  }

  isFingerspelling = false;
  currentWord.style.backgroundColor = '';

  playNextVideo();
}

function showLetterPlaceholder(letter, duration) {
  return new Promise((resolve) => {
    currentWord.textContent = `Letter: ${letter} (No video available)`;
    currentWord.style.backgroundColor = '#e74c3c';
    setTimeout(resolve, duration);
  });
}

// --------------------------
// STATS + HEALTH
// --------------------------
function updateStats() {
  wordCount.textContent = wordsRecognized;
  signCount.textContent = signsPlayed;
}

async function checkServerHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();

    totalSigns.textContent = data.total_signs || 0;
    updateStatus('✅ Connected to server', 'success');
  } catch (error) {
    console.error('Server not reachable:', error);
    updateStatus('⚠️ Backend server not connected', 'warning');
    totalSigns.textContent = '⚠️';
  }
}

// --------------------------
// UI
// --------------------------
function updateStatus(message, type = 'idle') {
  status.textContent = message;
  status.className = `status status-${type}`;
}

// --------------------------
// DARK MODE
// --------------------------
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDark);
  updateDarkModeIcon();
}

function updateDarkModeIcon() {
  const isDark = document.body.classList.contains('dark-mode');
  darkModeToggle.textContent = isDark ? '☀️' : '🌙';
}

// --------------------------
// SETTINGS
// --------------------------
function loadSettings() {
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
  }

  const savedTextSize = localStorage.getItem('textSize') || 'medium';
  textSize.value = savedTextSize;
  transcript.style.fontSize = getFontSize(savedTextSize);

  autoPlay.checked = localStorage.getItem('autoPlay') !== 'false';
  highlightWords.checked = localStorage.getItem('highlightWords') !== 'false';

  const statsVisible = localStorage.getItem('showStats') !== 'false';
  showStats.checked = statsVisible;
  const statsBar = document.querySelector('.stats-bar');
  if (statsBar) statsBar.style.display = statsVisible ? 'flex' : 'none';
}

function saveSettings() {
  localStorage.setItem('textSize', textSize.value);
  localStorage.setItem('autoPlay', autoPlay.checked);
  localStorage.setItem('highlightWords', highlightWords.checked);
  localStorage.setItem('showStats', showStats.checked);

  transcript.style.fontSize = getFontSize(textSize.value);
  const statsBar = document.querySelector('.stats-bar');
  if (statsBar) statsBar.style.display = showStats.checked ? 'flex' : 'none';

  closeModal(settingsModal);
  updateStatus('✅ Settings saved', 'success');
}

function resetSettings() {
  localStorage.clear();
  loadSettings();
  updateStatus('✅ Settings reset to defaults', 'success');
}

function getFontSize(size) {
  const sizes = { small: '0.9rem', medium: '1rem', large: '1.2rem', 'x-large': '1.5rem' };
  return sizes[size] || '1rem';
}

// --------------------------
// MODALS
// --------------------------
function openModal(modal) {
  modal.hidden = false;
  modal.style.display = 'flex';
}

function closeModal(modal) {
  modal.hidden = true;
  modal.style.display = 'none';
}

// --------------------------
// EVENT LISTENERS
// --------------------------
function setupEventListeners() {
  startBtn.addEventListener('click', startListening);
  stopBtn.addEventListener('click', stopListening);
  demoBtn.addEventListener('click', startDemo);
  clearBtn.addEventListener('click', clearTranscript);
  downloadBtn.addEventListener('click', downloadTranscript);

  if (pauseBtn) pauseBtn.addEventListener('click', pauseInterpretation);
  if (resumeBtn) resumeBtn.addEventListener('click', resumeInterpretation);

  darkModeToggle.addEventListener('click', toggleDarkMode);

  helpBtn.addEventListener('click', () => openModal(helpModal));
  helpModal.querySelector('.modal-close').addEventListener('click', () => closeModal(helpModal));

  settingsBtn.addEventListener('click', () => openModal(settingsModal));
  settingsModal.querySelector('.modal-close').addEventListener('click', () => closeModal(settingsModal));
  saveSettingsBtn.addEventListener('click', saveSettings);
  resetSettingsBtn.addEventListener('click', resetSettings);

  [helpModal, settingsModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });
}

// --------------------------
// FULLSCREEN
// --------------------------
fullscreenBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) videoContainer.requestFullscreen();
  else document.exitFullscreen();
});

// --------------------------
// KEYBOARD SHORTCUTS
// --------------------------
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.key.toLowerCase()) {
      case ' ':
        e.preventDefault();
        if (isPaused) resumeInterpretation();
        else if (isListening) pauseInterpretation();
        else startListening();
        break;
      case 'escape':
        clearTranscript();
        break;
      case 'd':
        startDemo();
        break;
      case 's':
        downloadTranscript();
        break;
      case '?':
        openModal(helpModal);
        break;
    }
  });
}

// --------------------------
// CONSOLE
// --------------------------
console.log('%c🌉 LingoBridge', 'font-size: 24px; font-weight: bold; color: #667eea;');
console.log('%cReal-time Speech to ASL Translation System', 'font-size: 14px; color: #718096;');