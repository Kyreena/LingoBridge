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
