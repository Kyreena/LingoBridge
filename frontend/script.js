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
const aslVideo = document.getElementById('aslVideo');
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
let availableSigns = new Set();
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
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
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
    if (placeholder) {
        placeholder.remove();
    }

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
    // Show the original text
    currentSentence.textContent = text;
    
    // Clean and split text into words
    const words = text
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 0);

    const missingWordsList = [];

    // Check each word and queue for video playback
    for (const word of words) {
        try {
            const response = await fetch(`${API_BASE_URL}/get_asl?word=${encodeURIComponent(word)}`);
            
            if (response.ok) {
                // Word has a direct ASL sign
                videoQueue.push({ type: 'word', value: word });
            } else {
                // Word not found - will be fingerspelled
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

    // Display missing words that will be fingerspelled
    if (missingWordsList.length > 0) {
        missingWords.textContent = missingWordsList.join(', ');
        missingWords.style.color = '#e67e22'; // Orange for fingerspelling
    } else {
        missingWords.textContent = 'None';
        missingWords.style.color = '#27ae60'; // Green for all found
    }

    // Start playing videos if not already playing
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
        // Play full word sign
        await playWordSign(item.value);
    } else if (item.type === 'fingerspell') {
        // Fingerspell the word letter by letter
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
        } else {
            console.warn(`No ASL sign found for: ${word}`);
            playNextVideo(); // Continue to next item
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
    
    // Show fingerspelling indicator
    currentWord.textContent = `Fingerspelling: ${word.toUpperCase()}`;
    currentWord.style.backgroundColor = '#f39c12'; // Orange background
    
    const letters = word.split('');
    
    for (let i = 0; i < letters.length; i++) {
        const letter = letters[i].toLowerCase();
        
        try {
            const response = await fetch(`${API_BASE_URL}/get_asl?word=${encodeURIComponent(letter)}`);
            const data = await response.json();

            if (response.ok) {
                // Display each letter with brief pause
                await displayVideoAndWait(data.video_url, `${letter.toUpperCase()} (${i+1}/${letters.length})`, true);
                signsPlayed++;
                updateStats();
            } else {
                console.warn(`No fingerspelling sign for letter: ${letter}`);
                // Show placeholder for missing letter
                await showLetterPlaceholder(letter.toUpperCase(), 1000);
            }
        } catch (error) {
            console.error(`Error fetching fingerspelling for "${letter}":`, error);
            await showLetterPlaceholder(letter.toUpperCase(), 1000);
        }
    }
    
    // Finished fingerspelling this word
    isFingerspelling = false;
    currentWord.style.backgroundColor = '';
    
    // Continue with next item in queue
    playNextVideo();
}

function displayVideo(videoUrl, word, isLetter) {
    const fullUrl = `${API_BASE_URL}${videoUrl}`;
    
    // Hide placeholder, show video
    const placeholder = videoContainer.querySelector('.video-placeholder');
    if (placeholder) {
        placeholder.style.display = 'none';
    }
    
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
    
    // Auto-play if setting is enabled
    if (autoPlay.checked) {
        aslVideo.play();
    }
}

// Helper function to display video and wait for completion
function displayVideoAndWait(videoUrl, label, isLetter) {
    return new Promise((resolve) => {
        const fullUrl = `${API_BASE_URL}${videoUrl}`;
        
        const placeholder = videoContainer.querySelector('.video-placeholder');
        if (placeholder) {
            placeholder.style.display = 'none';
        }
        
        aslVideo.src = fullUrl;
        aslVideo.style.display = 'block';
        aslVideo.playbackRate = parseFloat(playbackSpeed.value) * 1.2; // Slightly faster for fingerspelling
        
        currentWord.textContent = label;
        if (isLetter) {
            currentWord.style.backgroundColor = '#f39c12';
        }
        
        // Remove old event listeners
        const newVideo = aslVideo.cloneNode(true);
        aslVideo.parentNode.replaceChild(newVideo, aslVideo);
        Object.assign(aslVideo, newVideo);
        
        aslVideo.onended = () => {
            resolve();
        };
        
        aslVideo.onerror = () => {
            console.error('Video playback error');
            resolve();
        };
        
        aslVideo.play().catch(err => {
            console.error('Video play error:', err);
            resolve();
        });
    });
}

// Show placeholder when letter video is missing
function showLetterPlaceholder(letter, duration) {
    return new Promise((resolve) => {
        currentWord.textContent = `Letter: ${letter} (No video available)`;
        currentWord.style.backgroundColor = '#e74c3c'; // Red for missing
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
    // Dark mode
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }

    // Text size
    const savedTextSize = localStorage.getItem('textSize') || 'medium';
    textSize.value = savedTextSize;
    transcript.style.fontSize = getFontSize(savedTextSize);

    // Auto-play
    autoPlay.checked = localStorage.getItem('autoPlay') !== 'false';

    // Highlight words
    highlightWords.checked = localStorage.getItem('highlightWords') !== 'false';

    // Show stats
    const statsVisible = localStorage.getItem('showStats') !== 'false';
    showStats.checked = statsVisible;
    document.querySelector('.stats-bar').style.display = statsVisible ? 'flex' : 'none';
}

function saveSettings() {
    localStorage.setItem('textSize', textSize.value);
    localStorage.setItem('autoPlay', autoPlay.checked);
    localStorage.setItem('highlightWords', highlightWords.checked);
    localStorage.setItem('showStats', showStats.checked);

    // Apply settings
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
    // Control buttons
    startBtn.addEventListener('click', startListening);
    stopBtn.addEventListener('click', stopListening);
    demoBtn.addEventListener('click', startDemo);
    clearBtn.addEventListener('click', clearTranscript);
    downloadBtn.addEventListener('click', downloadTranscript);
    
    // UI buttons
    darkModeToggle.addEventListener('click', toggleDarkMode);
    
    // Help modal
    helpBtn.addEventListener('click', () => openModal(helpModal));
    helpModal.querySelector('.modal-close').addEventListener('click', () => closeModal(helpModal));
    
    // Settings modal
    settingsBtn.addEventListener('click', () => openModal(settingsModal));
    settingsModal.querySelector('.modal-close').addEventListener('click', () => closeModal(settingsModal));
    saveSettingsBtn.addEventListener('click', saveSettings);
    resetSettingsBtn.addEventListener('click', resetSettings);
    
    // Close modals on background click
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
        // Ignore if typing in input field
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        switch(e.key.toLowerCase()) {
            case ' ': // Space - Start/Stop
                e.preventDefault();
                if (isListening) {
                    stopListening();
                } else {
                    startListening();
                }
                break;
            case 'escape': // Esc - Clear
                clearTranscript();
                break;
            case 'd': // D - Demo
                startDemo();
                break;
            case 's': // S - Save/Download
                downloadTranscript();
                break;
            case '?': // ? - Help
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