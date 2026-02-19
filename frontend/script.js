const transcriptEl = document.getElementById("transcript");
const videoEl = document.getElementById("aslVideo");

const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const stopBtn = document.getElementById("stop-btn");

/* =========================
   ASL FLOW STATE
========================= */
let aslQueue = [];
let isPlayingASL = false;
let currentWord = null;  // NEW: Track which word is being signed

const STOP_WORDS = [
    "the", "is", "a", "an", "and", "or", "but"  // Added more stop words
];

/* =========================
   SPEECH STATE
========================= */
let recognition;
let isListening = false;
let isPaused = false;

/* =========================
   INIT SPEECH RECOGNITION
========================= */
if ("webkitSpeechRecognition" in window) {
    recognition = new webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;
} else {
    alert("Speech recognition not supported. Please use Chrome or Edge browser.");
}

/* =========================
   START
========================= */
startBtn.addEventListener("click", () => {
    if (!isListening) {
        recognition.start();
        isListening = true;
        isPaused = false;
        startBtn.textContent = "🎙 Listening...";
        startBtn.style.background = "#e74c3c";  // Red while active
    } else if (isPaused) {
        // Resume if paused
        recognition.start();
        isPaused = false;
        startBtn.textContent = "🎙 Listening...";
        startBtn.style.background = "#e74c3c";
    }
});

/* =========================
   PAUSE
========================= */
pauseBtn.addEventListener("click", () => {
    if (isListening && !isPaused) {
        recognition.stop();
        isPaused = true;
        startBtn.textContent = "▶ Resume";
        startBtn.style.background = "#52ab98";  // Back to green
    }
});

/* =========================
   STOP
========================= */
stopBtn.addEventListener("click", () => {
    recognition.stop();
    isListening = false;
    isPaused = false;
    aslQueue = [];
    isPlayingASL = false;
    currentWord = null;

    startBtn.textContent = "▶ Start";
    startBtn.style.background = "#52ab98";

    videoEl.pause();
    videoEl.src = "";
    
    // Clear transcript
    transcriptEl.innerHTML = '<p class="placeholder">Waiting for speech...</p>';
});

/* =========================
   SPEECH RESULT
========================= */
recognition.onresult = (event) => {
    const result = event.results[event.results.length - 1];

    if (!result.isFinal) return;

    const transcript = result[0].transcript.toLowerCase().trim();

    /* ---- Transcript display ---- */
    const line = document.createElement("p");
    line.textContent = transcript;
    line.classList.add("transcript-line");
    
    // Remove placeholder if it exists
    const placeholder = transcriptEl.querySelector(".placeholder");
    if (placeholder) placeholder.remove();
    
    transcriptEl.appendChild(line);
    transcriptEl.scrollTop = transcriptEl.scrollHeight;

    /* ---- Extract meaningful words ---- */
    const words = transcript.split(/\s+/);

    words.forEach(word => {
        // Clean the word
        const cleanWord = word.replace(/[^\w]/g, "");
        
        if (
            cleanWord.length < 3 ||
            STOP_WORDS.includes(cleanWord) ||
            aslQueue.includes(cleanWord)
        ) return;

        aslQueue.push(cleanWord);
    });

    /* ---- Start ASL flow ---- */
    if (!isPlayingASL && aslQueue.length > 0) {
        playNextASL();
    }
};

/* =========================
   ASL QUEUE PLAYER
========================= */
function playNextASL() {
    if (aslQueue.length === 0) {
        isPlayingASL = false;
        currentWord = null;
        return;
    }

    isPlayingASL = true;
    const word = aslQueue.shift();
    currentWord = word;

    // Show loading state
    showVideoStatus(`Loading sign for "${word}"...`, "loading");

    fetch(`http://localhost:5000/get_asl?word=${encodeURIComponent(word)}`)
        .then(res => {
            if (!res.ok) {
                throw new Error(`Video not found for "${word}"`);
            }
            return res.json();
        })
        .then(data => {
            if (data && data.video_url) {
                showVideoStatus(`Signing: "${word}"`, "playing");
                
                videoEl.src = `http://localhost:5000${data.video_url}`;
                videoEl.load();
                videoEl.play().catch(err => {
                    console.error("Video play error:", err);
                    showVideoStatus(`Error playing "${word}"`, "error");
                    playNextASL(); // Skip to next
                });
            } else {
                throw new Error("Invalid response");
            }
        })
        .catch(err => {
            console.log(`⚠ ${err.message}`);
            showVideoStatus(`No sign found for "${word}"`, "error");
            
            // Wait a moment then play next
            setTimeout(() => playNextASL(), 1000);
        });
}

/* =========================
   VIDEO STATUS DISPLAY (NEW)
========================= */
function showVideoStatus(message, status) {
    // You can create a status div in your HTML or just log it
    console.log(`[${status.toUpperCase()}] ${message}`);
    
    // Optional: Add visual indicator in the video panel
    // We'll add this to the HTML in the next step
}

/* =========================
   CHAIN VIDEOS
========================= */
videoEl.onended = () => {
    playNextASL();
};

/* =========================
   ERROR HANDLING
========================= */
recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    
    if (event.error === "no-speech") {
        console.log("No speech detected. Try speaking closer to the microphone.");
    } else if (event.error === "network") {
        alert("Network error. Please check your connection.");
    }
};

/* =========================
   SERVER CONNECTION CHECK (NEW)
========================= */
window.addEventListener("load", () => {
    // Check if backend is running
    fetch("http://localhost:5000/health")
        .then(res => res.json())
        .then(data => {
            console.log("✅ Backend connected!");
            console.log(`📊 Available signs: ${data.total_signs}`);
        })
        .catch(err => {
            console.error("❌ Cannot connect to backend!");
            alert("Backend server is not running. Please start the Flask server first.\n\nRun: python backend/app.py");
        });
});

/* =========================
   LOG QUEUE STATUS (Helpful for debugging)
========================= */
setInterval(() => {
    if (aslQueue.length > 0) {
        console.log(`📋 Queue: [${aslQueue.join(", ")}]`);
    }
}, 3000);