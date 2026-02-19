/**
 * LingoBridge - Main Application
 * Speech-to-Sign Language Translation System
 */

class LingoBridge {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.transcript = [];
        this.videoQueue = [];
        this.currentVideoIndex = 0;
        this.isPlayingVideo = false;
        
        // DOM elements
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.status = document.getElementById('status');
        this.transcriptBox = document.getElementById('transcript');
        this.videoContainer = document.getElementById('videoContainer');
        this.aslVideo = document.getElementById('aslVideo');
        this.currentWordDisplay = document.getElementById('currentWord');
        this.videoPlaceholder = document.querySelector('.video-placeholder');
        
        this.initializeSpeechRecognition();
        this.setupEventListeners();
        this.updateStatus('Ready to start');
    }
    
    /**
     * Initialize Web Speech API
     */
    initializeSpeechRecognition() {
        // Check for browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            this.updateStatus('Speech recognition not supported in this browser');
            this.startBtn.disabled = true;
            alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
            return;
        }
        
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        
        // Set up recognition event handlers
        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateStatus('Listening... Speak now');
            this.status.classList.add('listening');
        };
        
        this.recognition.onresult = (event) => {
            this.handleSpeechResult(event);
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.updateStatus(`Error: ${event.error}`);
            
            if (event.error === 'no-speech') {
                this.updateStatus('No speech detected. Please try again.');
            } else if (event.error === 'not-allowed') {
                this.updateStatus('Microphone access denied. Please enable microphone permissions.');
                this.stopListening();
            }
        };
        
        this.recognition.onend = () => {
            if (this.isListening) {
                // Restart recognition if we're still supposed to be listening
                try {
                    this.recognition.start();
                } catch (e) {
                    console.log('Recognition restart failed:', e);
                }
            }
        };
    }
    
    /**
     * Set up button event listeners
     */
    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startListening());
        this.stopBtn.addEventListener('click', () => this.stopListening());
        this.clearBtn.addEventListener('click', () => this.clearTranscript());
        
        // Video element event listeners
        this.aslVideo.addEventListener('ended', () => {
            this.playNextVideo();
        });
        
        this.aslVideo.addEventListener('error', (e) => {
            console.error('Video error:', e);
            this.playNextVideo(); // Skip to next video on error
        });
    }
    
    /**
     * Start listening for speech
     */
    startListening() {
        if (!this.recognition) {
            alert('Speech recognition is not available');
            return;
        }
        
        try {
            this.recognition.start();
            this.startBtn.disabled = true;
            this.stopBtn.disabled = false;
            this.updateStatus('Starting speech recognition...');
        } catch (e) {
            console.error('Failed to start recognition:', e);
            this.updateStatus('Failed to start. Please try again.');
        }
    }
    
    /**
     * Stop listening for speech
     */
    stopListening() {
        if (this.recognition && this.isListening) {
            this.isListening = false;
            this.recognition.stop();
            this.startBtn.disabled = false;
            this.stopBtn.disabled = true;
            this.status.classList.remove('listening');
            this.updateStatus('Stopped listening');
        }
    }
    
    /**
     * Clear transcript and reset
     */
    clearTranscript() {
        this.transcript = [];
        this.transcriptBox.innerHTML = '<p class="placeholder">Spoken words will appear here...</p>';
        this.videoQueue = [];
        this.currentVideoIndex = 0;
        this.currentWordDisplay.textContent = '';
        
        // Reset video display
        this.aslVideo.pause();
        this.aslVideo.src = '';
        this.aslVideo.classList.remove('active');
        if (this.videoPlaceholder) {
            this.videoPlaceholder.style.display = 'flex';
        }
        
        this.updateStatus('Cleared. Ready to start.');
    }
    
    /**
     * Handle speech recognition results
     */
    handleSpeechResult(event) {
        let interimTranscript = '';
        let finalTranscript = '';
        
        // Process all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }
        
        // Process final transcript
        if (finalTranscript) {
            this.processFinalTranscript(finalTranscript.trim());
        }
        
        // Update status with interim results
        if (interimTranscript) {
            this.updateStatus(`Listening: "${interimTranscript}"`);
        }
    }
    
    /**
     * Process finalized speech transcript
     */
    processFinalTranscript(text) {
        console.log('Final transcript:', text);
        
        // Split into words and process each
        const words = text.split(/\s+/).filter(word => word.length > 0);
        
        words.forEach(word => {
            // Clean the word (remove punctuation)
            const cleanWord = word.replace(/[.,!?;:]/g, '');
            this.transcript.push(cleanWord);
            
            // Check if word has ASL sign
            if (hasASLSign(cleanWord)) {
                const signInfo = getASLSign(cleanWord);
                this.videoQueue.push({
                    word: cleanWord,
                    videoUrl: signInfo.video,
                    description: signInfo.description
                });
            }
        });
        
        // Update transcript display
        this.updateTranscriptDisplay();
        
        // Start playing videos if not already playing
        if (!this.isPlayingVideo && this.videoQueue.length > 0) {
            this.playNextVideo();
        }
    }
    
    /**
     * Update the transcript display
     */
    updateTranscriptDisplay() {
        if (this.transcript.length === 0) {
            this.transcriptBox.innerHTML = '<p class="placeholder">Spoken words will appear here...</p>';
            return;
        }
        
        // Build HTML with word highlighting
        let html = '';
        this.transcript.forEach((word, index) => {
            const hasSign = hasASLSign(word);
            const className = hasSign ? 'word has-sign' : 'word';
            html += `<span class="${className}" data-index="${index}">${word}</span> `;
        });
        
        this.transcriptBox.innerHTML = html;
        
        // Scroll to bottom
        this.transcriptBox.scrollTop = this.transcriptBox.scrollHeight;
    }
    
    /**
     * Play next video in queue
     */
    playNextVideo() {
        if (this.currentVideoIndex >= this.videoQueue.length) {
            // No more videos to play
            this.isPlayingVideo = false;
            this.currentWordDisplay.textContent = '';
            
            // Hide video, show placeholder
            this.aslVideo.classList.remove('active');
            if (this.videoPlaceholder) {
                this.videoPlaceholder.style.display = 'flex';
            }
            return;
        }
        
        this.isPlayingVideo = true;
        const videoInfo = this.videoQueue[this.currentVideoIndex];
        
        console.log('Playing video for:', videoInfo.word);
        
        // Update current word display
        this.currentWordDisplay.textContent = `Signing: "${videoInfo.word}"`;
        
        // Highlight the word in transcript
        this.highlightWordInTranscript(videoInfo.word);
        
        // Load and play video
        this.aslVideo.src = videoInfo.videoUrl;
        this.aslVideo.load();
        
        // Show video, hide placeholder
        if (this.videoPlaceholder) {
            this.videoPlaceholder.style.display = 'none';
        }
        this.aslVideo.classList.add('active');
        
        // Play video
        this.aslVideo.play().then(() => {
            console.log('Video playing successfully');
        }).catch(error => {
            console.error('Video play error:', error);
            // Try next video on error
            this.currentVideoIndex++;
            setTimeout(() => this.playNextVideo(), 100);
        });
        
        this.currentVideoIndex++;
    }
    
    /**
     * Highlight word in transcript
     */
    highlightWordInTranscript(word) {
        // Remove all active highlights
        const allWords = this.transcriptBox.querySelectorAll('.word');
        allWords.forEach(el => el.classList.remove('active'));
        
        // Find and highlight matching words
        allWords.forEach(el => {
            if (el.textContent.trim().toLowerCase() === word.toLowerCase()) {
                el.classList.add('active');
            }
        });
    }
    
    /**
     * Update status message
     */
    updateStatus(message) {
        this.status.textContent = message;
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new LingoBridge();
    
    // Log library info
    console.log(`LingoBridge initialized with ${getSignCount()} ASL signs`);
    console.log('Available words:', getAvailableWords().join(', '));
});

/**
 * Enhanced Features Extension
 */

// Statistics tracking
LingoBridge.prototype.wordCount = 0;
LingoBridge.prototype.signCount = 0;

// Initialize enhanced features
LingoBridge.prototype.initializeEnhancedFeatures = function() {
    // Get new DOM elements
    this.demoBtn = document.getElementById('demoBtn');
    this.downloadBtn = document.getElementById('downloadBtn');
    this.darkModeToggle = document.getElementById('darkModeToggle');
    this.helpBtn = document.getElementById('helpBtn');
    this.settingsBtn = document.getElementById('settingsBtn');
    this.fullscreenBtn = document.getElementById('fullscreenBtn');
    this.playbackSpeed = document.getElementById('playbackSpeed');
    
    // Stats elements
    this.wordCountDisplay = document.getElementById('wordCount');
    this.signCountDisplay = document.getElementById('signCount');
    this.totalSignsDisplay = document.getElementById('totalSigns');
    
    // Modals
    this.helpModal = document.getElementById('helpModal');
    this.settingsModal = document.getElementById('settingsModal');
    
    // Setup enhanced event listeners
    this.setupEnhancedListeners();
    
    // Load settings from localStorage
    this.loadSettings();
    
    // Update total signs count
    if (this.totalSignsDisplay) {
        this.totalSignsDisplay.textContent = getSignCount();
    }
};

// Setup enhanced event listeners
LingoBridge.prototype.setupEnhancedListeners = function() {
    // Demo mode
    if (this.demoBtn) {
        this.demoBtn.addEventListener('click', () => this.startDemo());
    }
    
    // Download transcript
    if (this.downloadBtn) {
        this.downloadBtn.addEventListener('click', () => this.downloadTranscript());
    }
    
    // Dark mode toggle
    if (this.darkModeToggle) {
        this.darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
    }
    
    // Help modal
    if (this.helpBtn) {
        this.helpBtn.addEventListener('click', () => this.showModal('help'));
    }
    
    // Settings modal
    if (this.settingsBtn) {
        this.settingsBtn.addEventListener('click', () => this.showModal('settings'));
    }
    
    // Fullscreen
    if (this.fullscreenBtn) {
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    }
    
    // Playback speed
    if (this.playbackSpeed) {
        this.playbackSpeed.addEventListener('change', (e) => {
            this.aslVideo.playbackRate = parseFloat(e.target.value);
        });
    }
    
    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').hidden = true;
        });
    });
    
    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.hidden = true;
            }
        });
    });
    
    // Settings actions
    const saveSettingsBtn = document.getElementById('saveSettings');
    const resetSettingsBtn = document.getElementById('resetSettings');
    
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => this.saveSettings());
    }
    
    if (resetSettingsBtn) {
        resetSettingsBtn.addEventListener('click', () => this.resetSettings());
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
};

// Keyboard shortcuts handler
LingoBridge.prototype.handleKeyboardShortcuts = function(e) {
    // Don't trigger if user is typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
        return;
    }
    
    switch(e.key) {
        case ' ': // Space - Start/Stop
            e.preventDefault();
            if (this.isListening) {
                this.stopListening();
            } else {
                this.startListening();
            }
            break;
        case 'Escape': // Esc - Clear
            this.clearTranscript();
            break;
        case 'd':
        case 'D':
            this.startDemo();
            break;
        case 's':
        case 'S':
            this.downloadTranscript();
            break;
        case '?':
            this.showModal('help');
            break;
    }
};

// Demo mode - simulates speech recognition
LingoBridge.prototype.startDemo = function() {
    const demoText = "hello teacher thank you for helping me learn today i understand the lesson very well good class";
    const words = demoText.split(' ');
    
    this.updateStatus('Demo mode: Playing sample transcript');
    this.demoBtn.disabled = true;
    this.startBtn.disabled = true;
    
    let index = 0;
    const demoInterval = setInterval(() => {
        if (index >= words.length) {
            clearInterval(demoInterval);
            this.updateStatus('Demo complete');
            this.demoBtn.disabled = false;
            this.startBtn.disabled = false;
            return;
        }
        
        const word = words[index];
        this.transcript.push(word);
        this.wordCount++;
        this.updateStats();
        
        if (hasASLSign(word)) {
            const signInfo = getASLSign(word);
            this.videoQueue.push({
                word: word,
                videoUrl: signInfo.video,
                description: signInfo.description
            });
        }
        
        this.updateTranscriptDisplay();
        
        if (!this.isPlayingVideo && this.videoQueue.length > 0) {
            this.playNextVideo();
        }
        
        index++;
    }, 800); // Add word every 800ms
};

// Download transcript as text file
LingoBridge.prototype.downloadTranscript = function() {
    if (this.transcript.length === 0) {
        alert('No transcript to download. Please speak some words first.');
        return;
    }
    
    const text = this.transcript.join(' ');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `lingobridge-transcript-${timestamp}.txt`;
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    this.updateStatus(`Downloaded: ${filename}`);
};

// Toggle dark mode
LingoBridge.prototype.toggleDarkMode = function() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    
    // Update button icon
    if (this.darkModeToggle) {
        this.darkModeToggle.textContent = isDark ? '☀️' : '🌙';
    }
    
    // Save to localStorage
    localStorage.setItem('darkMode', isDark);
};

// Show modal
LingoBridge.prototype.showModal = function(type) {
    if (type === 'help' && this.helpModal) {
        this.helpModal.hidden = false;
    } else if (type === 'settings' && this.settingsModal) {
        this.settingsModal.hidden = false;
    }
};

// Toggle fullscreen for video
LingoBridge.prototype.toggleFullscreen = function() {
    if (!document.fullscreenElement) {
        this.videoContainer.requestFullscreen().catch(err => {
            console.error('Fullscreen error:', err);
        });
    } else {
        document.exitFullscreen();
    }
};

// Update statistics display
LingoBridge.prototype.updateStats = function() {
    if (this.wordCountDisplay) {
        this.wordCountDisplay.textContent = this.wordCount;
    }
    if (this.signCountDisplay) {
        this.signCountDisplay.textContent = this.signCount;
    }
};

// Enhanced processFinalTranscript with stats
const originalProcessFinalTranscript = LingoBridge.prototype.processFinalTranscript;
LingoBridge.prototype.processFinalTranscript = function(text) {
    const wordsBefore = this.transcript.length;
    originalProcessFinalTranscript.call(this, text);
    const wordsAfter = this.transcript.length;
    
    this.wordCount += (wordsAfter - wordsBefore);
    this.updateStats();
};

// Enhanced playNextVideo with stats
const originalPlayNextVideo = LingoBridge.prototype.playNextVideo;
LingoBridge.prototype.playNextVideo = function() {
    const indexBefore = this.currentVideoIndex;
    originalPlayNextVideo.call(this);
    const indexAfter = this.currentVideoIndex;
    
    if (indexAfter > indexBefore) {
        this.signCount++;
        this.updateStats();
    }
};

// Enhanced clearTranscript to reset stats
const originalClearTranscript = LingoBridge.prototype.clearTranscript;
LingoBridge.prototype.clearTranscript = function() {
    originalClearTranscript.call(this);
    this.wordCount = 0;
    this.signCount = 0;
    this.updateStats();
};

// Load settings from localStorage
LingoBridge.prototype.loadSettings = function() {
    // Dark mode
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
        document.body.classList.add('dark-mode');
        if (this.darkModeToggle) {
            this.darkModeToggle.textContent = '☀️';
        }
    }
    
    // Text size
    const textSize = localStorage.getItem('textSize') || 'medium';
    const textSizeSelect = document.getElementById('textSize');
    if (textSizeSelect) {
        textSizeSelect.value = textSize;
        this.applyTextSize(textSize);
    }
    
    // Auto-play
    const autoPlay = localStorage.getItem('autoPlay') !== 'false';
    const autoPlayCheckbox = document.getElementById('autoPlay');
    if (autoPlayCheckbox) {
        autoPlayCheckbox.checked = autoPlay;
    }
    
    // Highlight words
    const highlightWords = localStorage.getItem('highlightWords') !== 'false';
    const highlightWordsCheckbox = document.getElementById('highlightWords');
    if (highlightWordsCheckbox) {
        highlightWordsCheckbox.checked = highlightWords;
    }
    
    // Show stats
    const showStats = localStorage.getItem('showStats') !== 'false';
    const showStatsCheckbox = document.getElementById('showStats');
    if (showStatsCheckbox) {
        showStatsCheckbox.checked = showStats;
        this.toggleStats(showStats);
    }
};

// Save settings to localStorage
LingoBridge.prototype.saveSettings = function() {
    const textSize = document.getElementById('textSize').value;
    const autoPlay = document.getElementById('autoPlay').checked;
    const highlightWords = document.getElementById('highlightWords').checked;
    const showStats = document.getElementById('showStats').checked;
    
    localStorage.setItem('textSize', textSize);
    localStorage.setItem('autoPlay', autoPlay);
    localStorage.setItem('highlightWords', highlightWords);
    localStorage.setItem('showStats', showStats);
    
    // Apply settings
    this.applyTextSize(textSize);
    this.toggleStats(showStats);
    
    // Close modal
    this.settingsModal.hidden = true;
    this.updateStatus('Settings saved');
};

// Reset settings to defaults
LingoBridge.prototype.resetSettings = function() {
    localStorage.clear();
    document.getElementById('textSize').value = 'medium';
    document.getElementById('autoPlay').checked = true;
    document.getElementById('highlightWords').checked = true;
    document.getElementById('showStats').checked = true;
    
    this.applyTextSize('medium');
    this.toggleStats(true);
    
    this.updateStatus('Settings reset to defaults');
};

// Apply text size
LingoBridge.prototype.applyTextSize = function(size) {
    const sizeMap = {
        'small': '0.9em',
        'medium': '1.1em',
        'large': '1.3em',
        'x-large': '1.5em'
    };
    
    if (this.transcriptBox) {
        this.transcriptBox.style.fontSize = sizeMap[size] || '1.1em';
    }
};

// Toggle stats bar visibility
LingoBridge.prototype.toggleStats = function(show) {
    const statsBar = document.querySelector('.stats-bar');
    if (statsBar) {
        statsBar.style.display = show ? 'flex' : 'none';
    }
};

// Update the DOMContentLoaded event
document.addEventListener('DOMContentLoaded', () => {
    const app = new LingoBridge();
    
    // Initialize enhanced features
    app.initializeEnhancedFeatures();
    
    // Log library info
    console.log(`LingoBridge v1.0.0 initialized with ${getSignCount()} ASL signs`);
    console.log('Enhanced features enabled: Dark mode, Demo mode, Download, Settings');
});
