// ==========================================
// LingoBridge - Speech to ASL Translation
// ==========================================

// --------------------------
// CONFIGURATION
// --------------------------
const API_BASE_URL = window.location.origin;
const DEMO_TEXT = "Good morning class—settle in quickly, we’ve got a challenge today. I want you to imagine you’re problem-solvers in a real-world situation: a city has just experienced severe flooding, and your task is to come up with practical solutions to prevent it from happening again. Take out your notebooks and write the heading ‘Urban Flood Management.’ You’ll work in small groups, and each group must identify one cause of flooding, one immediate solution, and one long-term strategy. Think beyond the obvious—consider waste management, drainage systems, and even community behavior. In ten minutes, I’ll call on each group to present, so assign roles now: a speaker, a writer, and a timekeeper. Remember, this is about critical thinking and teamwork, not perfection. Alright, go ahead—discuss, debate, and build your ideas. ";

// Silence timer (used only for fallback flushing when punctuation isn't coming through)
const COMMIT_SILENCE_MS = 700;
const MIN_WORDS_PER_CHUNK = 2;

// Backpressure / classroom tuning
const MAX_QUEUE_ITEMS = 18;   // hard ceiling on queued items
const SOFT_QUEUE_ITEMS = 12;  // start trimming above this

// Sentence-aware buffering:
// prefer committing on stronger punctuation, but also allow natural reading pauses
// without waiting for a full stop every time
const MAX_WORDS_WITHOUT_PUNCTUATION = 20;
const HARD_SENTENCE_PUNCTUATION = '.!?';
const SOFT_SENTENCE_PUNCTUATION = ',;:';
const MIN_WORDS_FOR_SOFT_BREAK = 3;
const MAX_PHRASE_WORDS = 3;

// Adaptive “sign budget” per committed sentence
// (how many words from the sentence we will try to sign)
const SIGN_BUDGET = {
  // If queue is short, sign more to preserve meaning
  high: 10,     // when queue is very short
  medium: 8,    // when queue is moderate
  low: 5,       // when queue is getting long
  min: 3        // worst case when queue is overloaded
};

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
const serverDot = document.getElementById('serverDot');
const serverLabel = document.getElementById('serverLabel');

// Optional translation display (safe to remove from HTML)
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

// Track what item we are currently playing so pause/resume can resume mid-video.
let currentQueueItem = null;
let pausedMidItem = false;
const aslLookupCache = new Map();
const MAX_LOOKUP_CACHE_SIZE = 400;
let commitChain = Promise.resolve();
let commitGeneration = 0;
let currentSessionId = null;
let currentSessionMode = null;
let signManifest = new Map();
let isSignManifestLoaded = false;

// Speech buffering
let interimBuffer = '';
let silenceTimer = null;
let lastInterimTranscript = '';
let lastInterimSeenAt = 0;
const INTERIM_REPEAT_SUPPRESS_MS = 900;

// Sentence buffer (committed on punctuation/fallback)
let sentenceBuffer = '';

// Lyrics highlighting
let currentTranscriptLineEl = null;

// --------------------------
// INITIALIZATION
// --------------------------
window.addEventListener('load', async () => {
  initializeSpeechRecognition();
  loadSettings();
  await loadSignManifest();
  await checkServerHealth();
  setupEventListeners();
  setupKeyboardShortcuts();
  updateDarkModeIcon();

  if (!aslVideoA || !aslVideoB) {
    console.error('Missing aslVideoA/aslVideoB. Fix index.html video IDs.');
    updateStatus('❌ Video elements missing (check HTML ids)', 'error');
  }

  transcript.classList.add('transcript-lyrics');
});

window.addEventListener('beforeunload', () => {
  if (!currentSessionId) return;

  const payload = JSON.stringify({ session_id: currentSessionId });
  if (navigator.sendBeacon) {
    navigator.sendBeacon(`${API_BASE_URL}/api/session/end`, new Blob([payload], { type: 'application/json' }));
  }
});

async function loadSignManifest() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/sign-manifest`);
    if (!response.ok) throw new Error(`Request failed: ${response.status}`);

    const data = await response.json();
    signManifest = new Map(Object.entries(data.signs || {}));
    isSignManifestLoaded = true;
  } catch (error) {
    console.error('Failed to load sign manifest:', error);
    signManifest = new Map();
    isSignManifestLoaded = false;
  }
}

// --------------------------
// SMOOTH VIDEO PLAYER (A/B)
// --------------------------
const smoothPlayer = (() => {
  let active = aslVideoA;
  let inactive = aslVideoB;
  let preloadedUrl = null;
  let preloadedRate = null;
  let preloadPromise = null;

  function ensureInit() {
    if (!active || !inactive) return false;
    active.classList.add('is-active');
    inactive.classList.remove('is-active');
    return true;
  }

  ensureInit();

  function clearPreloadState() {
    preloadedUrl = null;
    preloadedRate = null;
    preloadPromise = null;
  }

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
      setTimeout(resolve, 400);
    });
  }

  function isInactivePreloaded(url, rate) {
    return (
      preloadedUrl === url &&
      preloadedRate === rate &&
      inactive &&
      inactive.src === url
    );
  }

  async function preload(videoUrl, opts = {}) {
    if (!ensureInit()) return false;
    if (isPaused) return false;

    const { rateMultiplier = 1.0 } = opts;
    const baseRate = parseFloat(playbackSpeed.value || '1');
    const rate = baseRate * rateMultiplier;
    const url = getFullUrl(videoUrl);

    if (active?.src === url) return false;
    if (isInactivePreloaded(url, rate)) {
      if (preloadPromise) await preloadPromise;
      return true;
    }

    preloadedUrl = url;
    preloadedRate = rate;
    preloadPromise = prime(url, rate)
      .catch((error) => {
        clearPreloadState();
        throw error;
      });

    await preloadPromise;
    return true;
  }

  async function playNow(videoUrl, opts = {}) {
    if (!ensureInit()) return;
    if (isPaused) return;

    const { rateMultiplier = 1.0 } = opts;
    const baseRate = parseFloat(playbackSpeed.value || '1');
    const rate = baseRate * rateMultiplier;
    const url = getFullUrl(videoUrl);

    if (isInactivePreloaded(url, rate)) {
      if (preloadPromise) await preloadPromise;
    } else {
      await prime(url, rate);
    }

    // swap
    const prev = active;
    active = inactive;
    inactive = prev;
    clearPreloadState();

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
    clearPreloadState();
  }

  function stopAll() {
    if (aslVideoA) aslVideoA.pause();
    if (aslVideoB) aslVideoB.pause();
    [aslVideoA, aslVideoB].forEach((video) => {
      if (!video) return;
      video.removeAttribute('src');
      video.load();
      video.classList.remove('is-active');
    });
    clearPreloadState();
    ensureInit();
  }

  function pauseActive() {
    if (active) active.pause();
  }

  async function resumeActive() {
    if (!active) return false;
    if (active.src && active.paused) {
      try {
        await active.play();
        return true;
      } catch (e) {
        console.error("Failed to resume active video:", e);
        return false;
      }
    }
    return false;
  }

  function hasActiveSrc() {
    return !!(active && active.src);
  }

  function isActivePaused() {
    return !!(active && active.paused);
  }

  return {
    playNow,
    waitForEndOrError,
    preload,
    updateRates,
    stopAll,
    pauseActive,
    resumeActive,
    hasActiveSrc,
    isActivePaused
  };
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
  if (isPaused) return;
  if (!isFingerspelling) playNextVideo();
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

    if (interimTranscript) {
      const normalizedInterim = interimTranscript.trim().replace(/\s+/g, ' ');
      const now = Date.now();
      const isRepeatedInterim =
        normalizedInterim &&
        normalizedInterim === lastInterimTranscript &&
        now - lastInterimSeenAt < INTERIM_REPEAT_SUPPRESS_MS;

      if (!isRepeatedInterim) {
        interimBuffer = interimTranscript;
        lastInterimTranscript = normalizedInterim;
        lastInterimSeenAt = now;
        scheduleSilenceFlush();
      }
    }

    if (finalTranscript.trim()) {
      sentenceBuffer += (sentenceBuffer ? ' ' : '') + finalTranscript.trim();
      interimBuffer = '';
      lastInterimTranscript = '';
      lastInterimSeenAt = 0;
      clearSilenceFlush();
      flushCompleteSentencesFromBuffer();
    }
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    if (event.error === 'no-speech') updateStatus('⚠️ No speech detected. Please try again.', 'warning');
    else if (event.error === 'not-allowed') updateStatus('❌ Microphone access denied', 'error');
    else updateStatus(`❌ Error: ${event.error}`, 'error');
  };

  recognition.onend = () => {
    if (isPaused) return;
    if (!isListening) return;

    try {
      recognition.start();
    } catch (e) {
      // rebuild once
      try {
        initializeSpeechRecognition();
        recognition.start();
      } catch {
        stopListening();
      }
    }
  };
}

function safeStartRecognition() {
  if (!recognition) initializeSpeechRecognition();

  try {
    recognition.start();
    return true;
  } catch (err) {
    if (err && err.name === 'InvalidStateError') {
      try {
        initializeSpeechRecognition();
        recognition.start();
        return true;
      } catch (e2) {
        console.error('Failed to restart recognition after rebuild:', e2);
        return false;
      }
    }
    console.error('Error starting recognition:', err);
    return false;
  }
}

// --------------------------
// SENTENCE BUFFERING / COMMITTING
// --------------------------
function splitIntoSentencesWithDelimiters(text) {
  const complete = [];
  let remainder = '';
  let start = 0;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (!HARD_SENTENCE_PUNCTUATION.includes(ch) && !SOFT_SENTENCE_PUNCTUATION.includes(ch)) {
      continue;
    }

    const next = text[i + 1] || '';
    const nextIsBoundary = !next || /\s/.test(next) || /["')\]]/.test(next);
    if (!nextIsBoundary) continue;

    const chunk = text.slice(start, i + 1).trim();
    const wordCount = chunk.split(/\s+/).filter(Boolean).length;
    const isSoftBreak = SOFT_SENTENCE_PUNCTUATION.includes(ch);
    if (isSoftBreak && wordCount < MIN_WORDS_FOR_SOFT_BREAK) continue;

    if (chunk) complete.push(chunk);
    start = i + 1;
  }

  remainder = text.slice(start).trim();
  return { complete, remainder };
}

function flushCompleteSentencesFromBuffer() {
  const buf = sentenceBuffer.trim();
  if (!buf) return;

  const { complete, remainder } = splitIntoSentencesWithDelimiters(buf);

  // Commit full sentences in order
  complete.forEach(s => enqueueCommitChunk(s));

  sentenceBuffer = remainder;

  // Fallback: if no punctuation is coming through, commit after buffer becomes long
  const wc = sentenceBuffer.split(/\s+/).filter(Boolean).length;
  if (wc >= MAX_WORDS_WITHOUT_PUNCTUATION) {
    const forced = sentenceBuffer.trim();
    sentenceBuffer = '';
    if (forced) enqueueCommitChunk(forced);
  }
}

function scheduleSilenceFlush() {
  clearSilenceFlush();
  silenceTimer = setTimeout(() => {
    if (isPaused) return;
    if (sentenceBuffer && sentenceBuffer.trim()) {
      flushCompleteSentencesFromBuffer();
    }
  }, COMMIT_SILENCE_MS);
}

function clearSilenceFlush() {
  if (silenceTimer) {
    clearTimeout(silenceTimer);
    silenceTimer = null;
  }
}

// --------------------------
// CHUNK COMMITTING
// --------------------------
async function commitChunk(text) {
  const cleaned = (text || '').trim();
  if (!cleaned) return;

  const wordLen = cleaned.split(/\s+/).filter(Boolean).length;
  if (wordLen < MIN_WORDS_PER_CHUNK && cleaned.length < 10) {
    // keep behavior as-is (still allow commit)
  }

  addTranscriptChunk(cleaned);

  // Optional section below (safe if removed from HTML)
  if (currentSentence) currentSentence.textContent += (currentSentence.textContent ? ' ' : '') + cleaned;

  await processText(cleaned);
}

function enqueueCommitChunk(text) {
  const generation = commitGeneration;
  commitChain = commitChain
    .then(async () => {
      if (generation !== commitGeneration) return;
      await commitChunk(text);
    })
    .catch((error) => {
      console.error('Error while committing chunk:', error);
    });

  return commitChain;
}

function resetCommitPipeline() {
  commitGeneration += 1;
  commitChain = Promise.resolve();
}

async function startAnalyticsSession(mode) {
  if (currentSessionId && currentSessionMode === mode) return currentSessionId;
  if (currentSessionId) await endAnalyticsSession();

  try {
    const response = await fetch(`${API_BASE_URL}/api/session/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode })
    });
    if (!response.ok) return null;

    const data = await response.json();
    currentSessionId = data.session_id || null;
    currentSessionMode = mode;
    return currentSessionId;
  } catch (error) {
    console.error('Failed to start analytics session:', error);
    return null;
  }
}

async function endAnalyticsSession() {
  if (!currentSessionId) return;

  const sessionId = currentSessionId;
  currentSessionId = null;
  currentSessionMode = null;

  try {
    await fetch(`${API_BASE_URL}/api/session/end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId })
    });
  } catch (error) {
    console.error('Failed to end analytics session:', error);
  }
}

async function bumpAnalyticsCounter(field, amount = 1) {
  if (!currentSessionId || amount <= 0) return;

  try {
    await fetch(`${API_BASE_URL}/api/session/bump`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: currentSessionId, field, amount })
    });
  } catch (error) {
    console.error(`Failed to bump analytics counter "${field}":`, error);
  }
}

async function logAnalyticsEvent(type, payload = {}) {
  if (!currentSessionId) return;

  try {
    await fetch(`${API_BASE_URL}/api/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: currentSessionId, type, payload })
    });
  } catch (error) {
    console.error(`Failed to log analytics event "${type}":`, error);
  }
}

// --------------------------
// CONTROL FUNCTIONS
// --------------------------
async function startListening() {
  isPaused = false;
  isListening = true;
  await startAnalyticsSession('live');

  if (!safeStartRecognition()) {
    isListening = false;
    updateStatus('❌ Failed to start listening', 'error');
    return;
  }
}

function stopListening() {
  if (recognition) {
    isListening = false;
    try { recognition.stop(); } catch {}
  }

  resetCommitPipeline();
  clearSilenceFlush();
  interimBuffer = '';
  lastInterimTranscript = '';
  lastInterimSeenAt = 0;
  sentenceBuffer = '';

  updateStatus('⏹️ Stopped listening', 'idle');

  startBtn.disabled = false;
  stopBtn.disabled = true;

  if (pauseBtn) pauseBtn.disabled = true;
  if (resumeBtn) resumeBtn.disabled = true;

  endAnalyticsSession();
}

function pauseInterpretation() {
  if (isPaused) return;
  isPaused = true;
  bumpAnalyticsCounter('pauses');

  // Stop recognition (no new transcript while paused)
  if (recognition) {
    isListening = false;
    try { recognition.stop(); } catch {}
  }

  resetCommitPipeline();
  clearSilenceFlush();
  interimBuffer = '';
  lastInterimTranscript = '';
  lastInterimSeenAt = 0;
  sentenceBuffer = '';

  // IMPORTANT: do NOT clear videoQueue here — we want to continue where we left off.
  // If we're currently mid-video, pause it so we can resume later.
  pausedMidItem = isPlayingVideo && smoothPlayer.hasActiveSrc() && !smoothPlayer.isActivePaused();
  smoothPlayer.pauseActive();

  updateStatus('⏸️ Paused (not listening)', 'idle');

  startBtn.disabled = false;
  stopBtn.disabled = true;

  if (pauseBtn) pauseBtn.disabled = true;
  if (resumeBtn) resumeBtn.disabled = false;
}

function resumeInterpretation() {
  if (!isPaused) return;

  isPaused = false;
  isListening = true;

  updateStatus('▶️ Resuming...', 'listening');

  bumpAnalyticsCounter('resumes');
  if (!safeStartRecognition()) {
    isListening = false;
    isPaused = true;
    updateStatus('❌ Resume failed (mic could not restart)', 'error');
    return;
  }

  // If we paused mid-video, resume it so the ended-event chain continues
  if (pausedMidItem) {
    smoothPlayer.resumeActive().then((ok) => {
      if (!ok) {
        // fallback: continue with queue if video resume fails
        playNextVideo();
      }
    });
  } else if (isPlayingVideo) {
    // If we think we were playing, ensure we keep going
    playNextVideo();
  } else if (!isPlayingVideo && videoQueue.length > 0) {
    playNextVideo();
  }

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
  currentQueueItem = null;
  pausedMidItem = false;
  smoothPlayer.stopAll();

  resetCommitPipeline();
  interimBuffer = '';
  lastInterimTranscript = '';
  lastInterimSeenAt = 0;
  sentenceBuffer = '';
  clearSilenceFlush();

  currentTranscriptLineEl = null;
  currentWord.textContent = '';
  currentWord.style.backgroundColor = '';

  const placeholder = videoContainer.querySelector('.video-placeholder');
  if (placeholder) placeholder.style.display = 'block';

  updateStats();
  updateStatus('🗑️ Transcript cleared', 'idle');
}

async function startDemo() {
  updateStatus('🎬 Demo mode active...', 'demo');

  stopListening();
  isPaused = false;
  await startAnalyticsSession('demo');

  videoQueue = [];
  isPlayingVideo = false;
  isFingerspelling = false;
  currentQueueItem = null;
  pausedMidItem = false;
  smoothPlayer.stopAll();

  clearTranscript();

  const parts = DEMO_TEXT.match(/[^.!?]+[.!?]*/g)?.map(s => s.trim()).filter(Boolean) || [];
  for (const p of parts) {
    await enqueueCommitChunk(p);
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

  if (currentTranscriptLineEl) {
    currentTranscriptLineEl.classList.remove('is-current');
    currentTranscriptLineEl.classList.add('is-past');
  }

  const p = document.createElement('p');
  p.textContent = text;
  p.className = 'transcript-line is-current';

  transcript.appendChild(p);
  currentTranscriptLineEl = p;

  p.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const words = text.trim().split(/\s+/).filter(Boolean);
  wordsRecognized += words.length;
  updateStats();
  bumpAnalyticsCounter('words_recognized', words.length);
}

// --------------------------
// TEXT PROCESSING & ASL TRANSLATION
// --------------------------
function applyAdaptiveSpeed() {
  if (!playbackSpeed) return;

  const q = videoQueue.length;

  if (q > 12) playbackSpeed.value = "3";
  else if (q > 6) playbackSpeed.value = "3";
  else playbackSpeed.value = "3";

  const rate = parseFloat(playbackSpeed.value || "1");
  smoothPlayer.updateRates(rate);
}

function getAdaptiveSignBudget() {
  const q = videoQueue.length;

  // Tweak thresholds as you observe real classroom behavior
  if (q <= 2) return SIGN_BUDGET.high;
  if (q <= 6) return SIGN_BUDGET.medium;
  if (q <= 10) return SIGN_BUDGET.low;
  return SIGN_BUDGET.min;
}

function tokenizeInSpokenOrder(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);
}

async function buildSignUnits(text, budget) {
  const tokens = tokenizeInSpokenOrder(text);
  const units = [];

  for (let i = 0; i < tokens.length && units.length < budget;) {
    let phraseMatch = null;
    const maxPhraseLength = Math.min(MAX_PHRASE_WORDS, tokens.length - i);

    for (let phraseLength = maxPhraseLength; phraseLength >= 2; phraseLength--) {
      const spokenText = tokens.slice(i, i + phraseLength).join(' ');
      const match = await fetchBestAslMatch(spokenText);
      if (!match?.videoUrl) continue;

      phraseMatch = { spokenText, match, phraseLength };
      break;
    }

    if (phraseMatch) {
      units.push({
        type: 'resolved',
        spokenText: phraseMatch.spokenText,
        match: phraseMatch.match
      });
      i += phraseMatch.phraseLength;
      continue;
    }

    const word = tokens[i];
    if (!isStopword(word)) {
      units.push({
        type: 'single',
        word
      });
      i += 1;
      continue;
    }

    const stopwordMatch = await fetchBestAslMatch(word);
    if (stopwordMatch?.videoUrl) {
      units.push({
        type: 'resolved',
        spokenText: word,
        match: stopwordMatch
      });
    }
    i += 1;
  }

  return units;
}

function getCachedAslMatch(word) {
  if (!aslLookupCache.has(word)) return undefined;

  const cached = aslLookupCache.get(word);
  // Refresh insertion order so repeated classroom words stay hot.
  aslLookupCache.delete(word);
  aslLookupCache.set(word, cached);
  return cached;
}

function setCachedAslMatch(word, value) {
  if (aslLookupCache.has(word)) {
    aslLookupCache.delete(word);
  }

  aslLookupCache.set(word, value);

  if (aslLookupCache.size > MAX_LOOKUP_CACHE_SIZE) {
    const oldestKey = aslLookupCache.keys().next().value;
    if (oldestKey !== undefined) {
      aslLookupCache.delete(oldestKey);
    }
  }
}

function generateLookupCandidates(word) {
  const candidates = [];
  const seen = new Set();
  const directAliases = {
    writer: ['write'],
    correction: ['correct']
  };

  const add = (candidate) => {
    const normalized = (candidate || '').trim().toLowerCase();
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    candidates.push(normalized);
  };

  add(word);

  (directAliases[word] || []).forEach(add);

  if (word.length > 4 && word.endsWith('ies')) {
    add(`${word.slice(0, -3)}y`);
  }

  const maybeDropDoubledTail = (base) => {
    if (base.length >= 2 && base.charAt(base.length - 1) === base.charAt(base.length - 2)) {
      return [base.slice(0, -1)];
    }
    return [];
  };

  const suffixRules = [
    ['ing', (w) => [w.slice(0, -3), `${w.slice(0, -3)}e`, ...maybeDropDoubledTail(w.slice(0, -3))]],
    ['ed', (w) => [w.slice(0, -2), w.slice(0, -1), `${w.slice(0, -2)}e`, ...maybeDropDoubledTail(w.slice(0, -2))]],
    ['ment', (w) => [w.slice(0, -4), `${w.slice(0, -4)}e`]],
    ['ness', (w) => [w.slice(0, -4)]],
    ['es', (w) => [w.slice(0, -2), w.slice(0, -1)]],
    ['s', (w) => [w.slice(0, -1)]],
    ['ly', (w) => [w.slice(0, -2)]],
    ['er', (w) => [w.slice(0, -2), `${w.slice(0, -2)}e`]],
    ['or', (w) => [w.slice(0, -2), `${w.slice(0, -2)}e`]],
    ['est', (w) => [w.slice(0, -3)]]
  ];

  for (const [suffix, transform] of suffixRules) {
    if (word.length <= suffix.length + 1 || !word.endsWith(suffix)) continue;
    transform(word).forEach(add);
  }

  return candidates;
}

function resolveFromManifest(word) {
  if (!isSignManifestLoaded || signManifest.size === 0) return null;

  for (const candidate of generateLookupCandidates(word)) {
    const videoUrl = signManifest.get(candidate);
    if (!videoUrl) continue;

    return {
      requestedWord: word,
      resolvedWord: candidate,
      videoUrl
    };
  }

  return null;
}

async function fetchBestAslMatch(word) {
  const cached = getCachedAslMatch(word);
  if (cached !== undefined) {
    return cached;
  }

  const manifestMatch = resolveFromManifest(word);
  if (manifestMatch) {
    setCachedAslMatch(word, manifestMatch);
    return manifestMatch;
  }

  if (isSignManifestLoaded) {
    setCachedAslMatch(word, null);
    return null;
  }

  for (const candidate of generateLookupCandidates(word)) {
    const response = await fetch(`${API_BASE_URL}/get_asl?word=${encodeURIComponent(candidate)}`);
    if (!response.ok) continue;

    const data = await response.json();
    const match = {
      requestedWord: word,
      resolvedWord: data.resolved_word || data.word || candidate,
      videoUrl: data.video_url
    };
    setCachedAslMatch(word, match);
    return match;
  }

  setCachedAslMatch(word, null);
  return null;
}

function getNextPreloadableQueueItem() {
  return videoQueue.find((item) => item?.type === 'word' && item.videoUrl);
}

function preloadUpcomingVideo() {
  if (isPaused || isFingerspelling) return;
  if (!currentQueueItem || currentQueueItem.type !== 'word') return;

  const nextItem = getNextPreloadableQueueItem();
  if (!nextItem) return;

  smoothPlayer.preload(nextItem.videoUrl).catch((error) => {
    console.error('Error preloading upcoming video:', error);
  });
}

function isSameQueueItem(a, b) {
  if (!a || !b) return false;
  return a.type === b.type && a.value === b.value;
}

function enqueueVideoItem(item) {
  const lastQueuedItem = videoQueue.length > 0 ? videoQueue[videoQueue.length - 1] : null;

  if (isSameQueueItem(lastQueuedItem, item) || isSameQueueItem(currentQueueItem, item)) {
    return false;
  }

  videoQueue.push(item);
  return true;
}

async function processText(text) {
  if (isPaused) return;

  const budget = getAdaptiveSignBudget();
  const signUnits = await buildSignUnits(text, budget);

  const missingWordsList = [];
  const missingSet = new Set();

  for (const unit of signUnits) {
    if (unit.type === 'resolved') {
      enqueueVideoItem({
        type: 'word',
        value: unit.match.resolvedWord,
        source: unit.spokenText,
        videoUrl: unit.match.videoUrl
      });
      continue;
    }

    const word = unit.word;
    try {
      const match = await fetchBestAslMatch(word);
      if (match) {
        enqueueVideoItem({
          type: 'word',
          value: match.resolvedWord,
          source: match.requestedWord,
          videoUrl: match.videoUrl
        });
      } else {
        if (!missingSet.has(word)) {
          missingSet.add(word);
          missingWordsList.push(word);
        }
        enqueueVideoItem({ type: 'fingerspell', value: word });
      }
    } catch (error) {
      console.error(`Error checking word "${word}":`, error);
      if (!missingSet.has(word)) {
        missingSet.add(word);
        missingWordsList.push(word);
      }
      enqueueVideoItem({ type: 'fingerspell', value: word });
    }
  }

  if (missingWords) {
    if (missingWordsList.length > 0) {
      missingWords.textContent = missingWordsList.join(', ');
      missingWords.style.color = '#e67e22';
    } else {
      missingWords.textContent = 'None';
      missingWords.style.color = '#27ae60';
    }
  }

  // Backpressure trimming (keeps system real-time)
  if (videoQueue.length > MAX_QUEUE_ITEMS) {
    videoQueue = videoQueue.slice(videoQueue.length - SOFT_QUEUE_ITEMS);
    updateStatus('⚡ Catching up (skipping older signs to stay real-time)', 'warning');
  } else if (videoQueue.length > SOFT_QUEUE_ITEMS) {
    const trimCount = videoQueue.length - SOFT_QUEUE_ITEMS;
    videoQueue.splice(0, trimCount);
  }

  applyAdaptiveSpeed();

  if (isPlayingVideo) {
    preloadUpcomingVideo();
  }

  if (!isPlayingVideo) {
    playNextVideo();
  }

  if (missingWordsList.length > 0) {
    bumpAnalyticsCounter('fingerspelled_words', missingWordsList.length);
    missingWordsList.forEach((word) => {
      logAnalyticsEvent('missing_word', { word });
    });
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
    currentQueueItem = null;
    currentWord.textContent = '';
    currentWord.style.backgroundColor = '';
    const placeholder = videoContainer.querySelector('.video-placeholder');
    if (placeholder) placeholder.style.display = 'block';
    return;
  }

  isPlayingVideo = true;
  const item = videoQueue.shift();
  currentQueueItem = item;
  pausedMidItem = false;

  if (item.type === 'word') {
    await playWordSign(item);
  } else if (item.type === 'fingerspell') {
    await fingerspellWord(item.value);
  }
}

async function playWordSign(wordOrItem) {
  if (isPaused) return;

  const item = typeof wordOrItem === 'string' ? { value: wordOrItem } : (wordOrItem || {});
  const word = item.value;

  try {
    if (item.videoUrl) {
      await displayVideo(item.videoUrl, item.source || word, false);
      signsPlayed++;
      updateStats();
      bumpAnalyticsCounter('signs_played');
      preloadUpcomingVideo();
      return;
    }

    const match = await fetchBestAslMatch(word);
    if (!match?.videoUrl) {
      playNextVideo();
      return;
    }

    await displayVideo(match.videoUrl, item.source || match.requestedWord || word, false);
    signsPlayed++;
    updateStats();
    bumpAnalyticsCounter('signs_played');
    preloadUpcomingVideo();
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
        bumpAnalyticsCounter('signs_played');
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

    // Green dot + label
    if (serverDot)   serverDot.className   = 'server-dot server-dot--connected';
    if (serverLabel) { serverLabel.textContent = 'Connected'; serverLabel.className = 'server-label server-label--connected'; }

    updateStatus('Ready', 'success');
  } catch (error) {
    console.error('Server not reachable:', error);

    // Red dot + label
    if (serverDot)   serverDot.className   = 'server-dot server-dot--disconnected';
    if (serverLabel) { serverLabel.textContent = 'Server offline'; serverLabel.className = 'server-label server-label--disconnected'; }

    updateStatus('Backend not connected — video signs unavailable', 'warning');
    totalSigns.textContent = '—';
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
  // Icons are now SVGs shown/hidden via CSS — just update accessibility labels
  darkModeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  darkModeToggle.setAttribute('title',      isDark ? 'Switch to light mode' : 'Switch to dark mode');
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
