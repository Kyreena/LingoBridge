// ==========================================
// LingoBridge - Speech to ASL Translation
// ==========================================

// --------------------------
// CONFIGURATION
// --------------------------
const API_BASE_URL = 'http://localhost:5000';
const DEMO_TEXT = "Hello my name is John. I love learning sign language. Thank you for watching.";

// --------------------------
// DOM ELEMENTS
// --------------------------
// Buttons
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const demoBtn = document.getElementById('demoBtn');
const clearBtn = document.getElementById('clearBtn');
const downloadBtn = document.getElementById('downloadBtn');
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
//const aslVideo = document.getElementById('aslVideo');
const currentWord = document.getElementById('currentWord');
const playbackSpeed = document.getElementById('playbackSpeed');

// Stats
const wordCount = document.getElementById('wordCount');
const signCount = document.getElementById('signCount');
const totalSigns = document.getElementById('totalSigns');

// Translation display
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
let wordsRecognized = 0;
let signsPlayed = 0;
let videoQueue = [];
let isPlayingVideo = false;
let isFingerspelling = false;

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
});

// --------------------------
// SMOOTH VIDEO PLAYER (A/B)
// --------------------------
const smoothPlayer = (() => {
    let active = aslVideoA;
    let inactive = aslVideoB;

    // initialize
    active.classList.add('is-active');
    inactive.classList.remove('is-active');

    function getFullUrl(videoUrl) {
        return `${API_BASE_URL}${videoUrl}`;
    }

    async function prime(url) {
        // Load on inactive and wait until it can play through enough to start smoothly
        inactive.pause();
        inactive.currentTime = 0;
        inactive.src = url;

        // Make sure playbackRate is set before play
        inactive.playbackRate = parseFloat(playbackSpeed.value);

        // Wait for readiness (best effort)
        await new Promise((resolve) => {
            const done = () => {
                inactive.removeEventListener('canplay', done);
                inactive.removeEventListener('loadeddata', done);
                resolve();
            };

            inactive.addEventListener('canplay', done, { once: true });
            inactive.addEventListener('loadeddata', done, { once: true });

            // Safety timeout so we never hang
            setTimeout(resolve, 400);
        });
    }

    async function playNow(videoUrl, opts = {}) {
        const { rateMultiplier = 1.0 } = opts;
        const url = getFullUrl(videoUrl);

        // Prime inactive with next clip
        await prime(url);

        // Swap
        const prev = active;
        active = inactive;
        inactive = prev;

        // Show active / hide inactive (crossfade)
        active.classList.add('is-active');
        inactive.classList.remove('is-active');

        // Play active
        active.playbackRate = parseFloat(playbackSpeed.value) * rateMultiplier;

        if (autoPlay.checked) {
            try {
                await active.play();
            } catch (e) {
                console.error('Autoplay prevented / play failed:', e);
            }
        }
    }

    function waitForEndOrError() {
        return new Promise((resolve) => {
            const onEnd = () => cleanupAndResolve();
            const onError = () => cleanupAndResolve();

            const cleanupAndResolve = () => {
                active.removeEventListener('ended', onEnd);
                active.removeEventListener('error', onError);
                resolve();
            };

            active.addEventListener('ended', onEnd, { once: true });
            active.addEventListener('error', onError, { once: true });
        });
    }

    return {
        playNow,
        waitForEndOrError,
        // Expose for debugging if needed
        getActive: () => active
    };
})();

// --------------------------
// Replace displayVideo + displayVideoAndWait
// --------------------------
async function displayVideo(videoUrl, word, isLetter) {
    // Hide placeholder
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

    // Start playing (no waiting here; queue continues via ended handler logic elsewhere)
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
// Update VIDEO EVENT HANDLERS section
// --------------------------
// IMPORTANT: remove old handlers that were attached to `aslVideo`
// and attach them to BOTH videos, since either can be active.

function onAnyVideoEnded() {
    if (!isFingerspelling) {
        playNextVideo();
    }
}

function onAnyVideoError(e) {
    console.error('Video error:', e);
    if (!isFingerspelling) {
        updateStatus('⚠️ Video failed to load', 'warning');
        playNextVideo();
    }
}

[aslVideoA, aslVideoB].forEach(v => {
    v.addEventListener('ended', onAnyVideoEnded);
    v.addEventListener('error', onAnyVideoError);
});

// Also update playbackSpeed handling:
playbackSpeed.addEventListener('change', (e) => {
    const rate = parseFloat(e.target.value);
    aslVideoA.playbackRate = rate;
    aslVideoB.playbackRate = rate;
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
    };

    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const t = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += t + ' ';
            } else {
                interimTranscript += t;
            }
        }

        if (finalTranscript) {
            addToTranscript(finalTranscript);
            processText(finalTranscript);
        }
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
            updateStatus('⚠️ No speech detected. Please try again.', 'warning');
        } else if (event.error === 'not-allowed') {
            updateStatus('❌ Microphone access denied', 'error');
        } else {
            updateStatus(`❌ Error: ${event.error}`, 'error');
        }
    };

    recognition.onend = () => {
        if (isListening) {
            try {
                recognition.start();
            } catch (e) {
                stopListening();
            }
        } else {
            stopListening();
        }
    };
}

// --------------------------
// CONTROL FUNCTIONS
// --------------------------
function startListening() {
    if (!recognition) {
        updateStatus('❌ Speech recognition not available', 'error');
        return;
    }

    try {
        recognition.start();
        isListening = true;
    } catch (error) {
        console.error('Error starting recognition:', error);
        updateStatus('❌ Failed to start listening', 'error');
    }
}

function stopListening() {
    if (recognition && isListening) {
        isListening = false;
        recognition.stop();
        updateStatus('⏹️ Stopped listening', 'idle');
        startBtn.disabled = false;
        stopBtn.disabled = true;
    }
}

function clearTranscript() {
    transcript.innerHTML = '<p class="placeholder">Spoken words will appear here...</p>';
    currentSentence.textContent = '';
    missingWords.textContent = 'None';
    wordsRecognized = 0;
    signsPlayed = 0;
    updateStats();
    updateStatus('🗑️ Transcript cleared', 'idle');
}

async function startDemo() {
    updateStatus('🎬 Demo mode active...', 'demo');
    stopListening();

    addToTranscript(DEMO_TEXT);
    await processText(DEMO_TEXT);

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
// TRANSCRIPT MANAGEMENT
// --------------------------
function addToTranscript(text) {
    const placeholder = transcript.querySelector('.placeholder');
    if (placeholder) placeholder.remove();

    const words = text.trim().split(/\s+/);
    wordsRecognized += words.length;
    updateStats();

    const p = document.createElement('p');
    p.textContent = text.trim();
    p.className = 'transcript-line';
    transcript.appendChild(p);
    transcript.scrollTop = transcript.scrollHeight;
}

// --------------------------
// TEXT PROCESSING & ASL TRANSLATION
// --------------------------
async function processText(text) {
    currentSentence.textContent = text;

    const words = text
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 0);

    const missingWordsList = [];

    for (const word of words) {
        try {
            const response = await fetch(`${API_BASE_URL}/get_asl?word=${encodeURIComponent(word)}`);
            if (response.ok) {
                videoQueue.push({ type: 'word', value: word });
            } else {
                console.log(`Word "${word}" not in library - will fingerspell`);
                missingWordsList.push(word);
                videoQueue.push({ type: 'fingerspell', value: word });
            }
        } catch (error) {
            console.error(`Error checking word "${word}":`, error);
            missingWordsList.push(word);
            videoQueue.push({ type: 'fingerspell', value: word });
        }
    }

    if (missingWordsList.length > 0) {
        missingWords.textContent = missingWordsList.join(', ');
        missingWords.style.color = '#e67e22';
    } else {
        missingWords.textContent = 'None';
        missingWords.style.color = '#27ae60';
    }

    if (!isPlayingVideo) {
        playNextVideo();
    }
}

// --------------------------
// VIDEO PLAYBACK
// --------------------------
async function playNextVideo() {
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
    try {
        const response = await fetch(`${API_BASE_URL}/get_asl?word=${encodeURIComponent(word)}`);
        const data = await response.json();

        if (response.ok) {
            displayVideo(data.video_url, word, false);
            signsPlayed++;
            updateStats();
            // Continue when the video ends via the global 'ended' handler
        } else {
            console.warn(`No ASL sign found for: ${word}`);
            playNextVideo();
        }
    } catch (error) {
        console.error(`Error fetching ASL for "${word}":`, error);
        updateStatus('⚠️ Connection error. Check if backend is running.', 'warning');
        playNextVideo();
    }
}

async function fingerspellWord(word) {
    console.log(`Fingerspelling word: ${word}`);
    isFingerspelling = true;

    currentWord.textContent = `Fingerspelling: ${word.toUpperCase()}`;
    currentWord.style.backgroundColor = '#f39c12';

    const letters = word.split('');

    for (let i = 0; i < letters.length; i++) {
        const letterRaw = letters[i].toLowerCase();

        // Only attempt a-z letters; skip digits/underscores etc.
        if (!/^[a-z]$/.test(letterRaw)) {
            await showLetterPlaceholder(letters[i].toUpperCase(), 600);
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
                console.warn(`No fingerspelling sign for letter: ${letterRaw}`);
                await showLetterPlaceholder(letterRaw.toUpperCase(), 800);
            }
        } catch (error) {
            console.error(`Error fetching fingerspelling for "${letterRaw}":`, error);
            await showLetterPlaceholder(letterRaw.toUpperCase(), 800);
        }
    }

    isFingerspelling = false;
    currentWord.style.backgroundColor = '';

    // Continue with next queued word
    playNextVideo();
}

function displayVideo(videoUrl, word, isLetter) {
    const fullUrl = `${API_BASE_URL}${videoUrl}`;

    const placeholder = videoContainer.querySelector('.video-placeholder');
    if (placeholder) placeholder.style.display = 'none';

    aslVideo.src = fullUrl;
    aslVideo.style.display = 'block';
    aslVideo.playbackRate = parseFloat(playbackSpeed.value);

    if (isLetter) {
        currentWord.textContent = `Fingerspelling: ${word}`;
        currentWord.style.backgroundColor = '#f39c12';
    } else {
        currentWord.textContent = `Signing: ${word.toUpperCase()}`;
        currentWord.style.backgroundColor = '';
    }
    currentWord.style.display = 'block';

    if (autoPlay.checked) {
        aslVideo.play().catch(err => console.error('Video play error:', err));
    }
}

// Helper function to display video and wait for completion
function displayVideoAndWait(videoUrl, label, isLetter) {
    return new Promise((resolve) => {
        const fullUrl = `${API_BASE_URL}${videoUrl}`;

        const placeholder = videoContainer.querySelector('.video-placeholder');
        if (placeholder) placeholder.style.display = 'none';

        // Configure video
        aslVideo.pause();
        aslVideo.currentTime = 0;
        aslVideo.src = fullUrl;
        aslVideo.style.display = 'block';
        aslVideo.playbackRate = parseFloat(playbackSpeed.value) * 1.2;

        currentWord.textContent = label;
        if (isLetter) currentWord.style.backgroundColor = '#f39c12';

        const cleanup = () => {
            aslVideo.removeEventListener('ended', onEnded);
            aslVideo.removeEventListener('error', onError);
        };

        const onEnded = () => {
            cleanup();
            resolve();
        };

        const onError = () => {
            console.error('Video playback error (letter)');
            cleanup();
            resolve();
        };

        aslVideo.addEventListener('ended', onEnded, { once: true });
        aslVideo.addEventListener('error', onError, { once: true });

        aslVideo.play().catch(err => {
            console.error('Video play error (letter):', err);
            cleanup();
            resolve();
        });
    });
}

// Show placeholder when letter video is missing
function showLetterPlaceholder(letter, duration) {
    return new Promise((resolve) => {
        currentWord.textContent = `Letter: ${letter} (No video available)`;
        currentWord.style.backgroundColor = '#e74c3c';
        setTimeout(resolve, duration);
    });
}

// --------------------------
// VIDEO EVENT HANDLERS
// --------------------------
aslVideo.addEventListener('ended', () => {
    if (!isFingerspelling) {
        playNextVideo();
    }
});

aslVideo.addEventListener('error', (e) => {
    console.error('Video error:', e);
    if (!isFingerspelling) {
        updateStatus('⚠️ Video failed to load', 'warning');
        playNextVideo();
    }
});

playbackSpeed.addEventListener('change', (e) => {
    aslVideo.playbackRate = parseFloat(e.target.value);
});

fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        videoContainer.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
});

// --------------------------
// STATISTICS
// --------------------------
function updateStats() {
    wordCount.textContent = wordsRecognized;
    signCount.textContent = signsPlayed;
}

async function checkServerHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();

        console.log('✅ Server Status:', data);
        totalSigns.textContent = data.total_signs || 0;
        updateStatus('✅ Connected to server', 'success');
    } catch (error) {
        console.error('❌ Server not reachable:', error);
        updateStatus('⚠️ Backend server not connected', 'warning');
        totalSigns.textContent = '⚠️';
    }
}

// --------------------------
// UI UPDATES
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
// SETTINGS MANAGEMENT
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
    document.querySelector('.stats-bar').style.display = statsVisible ? 'flex' : 'none';
}

function saveSettings() {
    localStorage.setItem('textSize', textSize.value);
    localStorage.setItem('autoPlay', autoPlay.checked);
    localStorage.setItem('highlightWords', highlightWords.checked);
    localStorage.setItem('showStats', showStats.checked);

    transcript.style.fontSize = getFontSize(textSize.value);
    document.querySelector('.stats-bar').style.display = showStats.checked ? 'flex' : 'none';

    closeModal(settingsModal);
    updateStatus('✅ Settings saved', 'success');
}

function resetSettings() {
    localStorage.clear();
    loadSettings();
    updateStatus('✅ Settings reset to defaults', 'success');
}

function getFontSize(size) {
    const sizes = {
        small: '0.9rem',
        medium: '1rem',
        large: '1.2rem',
        'x-large': '1.5rem'
    };
    return sizes[size] || '1rem';
}

// --------------------------
// MODAL MANAGEMENT
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

    darkModeToggle.addEventListener('click', toggleDarkMode);

    helpBtn.addEventListener('click', () => openModal(helpModal));
    helpModal.querySelector('.modal-close').addEventListener('click', () => closeModal(helpModal));

    settingsBtn.addEventListener('click', () => openModal(settingsModal));
    settingsModal.querySelector('.modal-close').addEventListener('click', () => closeModal(settingsModal));
    saveSettingsBtn.addEventListener('click', saveSettings);
    resetSettingsBtn.addEventListener('click', resetSettings);

    [helpModal, settingsModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });
}

// --------------------------
// KEYBOARD SHORTCUTS
// --------------------------
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch (e.key.toLowerCase()) {
            case ' ':
                e.preventDefault();
                if (isListening) stopListening();
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
// CONSOLE WELCOME MESSAGE
// --------------------------
console.log('%c🌉 LingoBridge', 'font-size: 24px; font-weight: bold; color: #667eea;');
console.log('%cReal-time Speech to ASL Translation System', 'font-size: 14px; color: #718096;');
console.log('%cFor support: https://github.com/Kyreena/LingoBridge', 'font-size: 12px; color: #4299e1;');