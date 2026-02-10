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

const STOP_WORDS = [
    "the", "is", "a", "an"
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
    alert("Speech recognition not supported. Use Chrome.");
}

/* =========================
   START
========================= */
startBtn.addEventListener("click", () => {
    if (!isListening) {
        recognition.start();
        isListening = true;
        startBtn.textContent = "🎙 Listening...";
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

    startBtn.textContent = "▶ Start";

    videoEl.pause();
    videoEl.src = "";
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
    transcriptEl.appendChild(line);
    transcriptEl.scrollTop = transcriptEl.scrollHeight;

    /* ---- Extract meaningful words ---- */
    const words = transcript.split(/\s+/);

    words.forEach(word => {
        if (
            word.length < 3 ||
            STOP_WORDS.includes(word) ||
            aslQueue.includes(word)
        ) return;

        aslQueue.push(word);
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
        return;
    }

    isPlayingASL = true;
    const word = aslQueue.shift();

    fetch(`/get_asl?word=${encodeURIComponent(word)}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
            if (data && data.video_url) {
                videoEl.src = data.video_url;
                videoEl.load();
                videoEl.play();
            } else {
                playNextASL(); // skip missing signs
            }
        })
        .catch(() => playNextASL());
}

/* =========================
   CHAIN VIDEOS
========================= */
videoEl.onended = () => {
    playNextASL();
};

/* =========================
   AUTO-RESTART LISTENING
========================= */
recognition.onend = () => {
    if (isListening && !isPaused) {
        recognition.start();
    }
};
