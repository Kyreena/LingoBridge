# LingoBridge Project Structure

This document provides a complete overview of the LingoBridge project structure, including all directories, files, and their purposes.

## 📁 Complete Directory Tree

```
LingoBridge/
├── README.md                          # Project overview and documentation
├── PROJECT_STRUCTURE.md               # This file - detailed project structure guide
├── .gitignore                         # Git ignore rules
│
├── backend/                           # Flask backend server
│   ├── app.py                        # Main Flask application
│   ├── config.py                     # Configuration settings
│   └── requirements.txt              # Python dependencies
│
├── frontend/                          # Web-based user interface
│   ├── index.html                    # Main HTML page
│   ├── script.js                     # JavaScript for speech recognition & ASL playback
│   └── style.css                     # Styling and layout
│
└── dataset/                           # ASL video data
    ├── asl_mapping.json              # Word-to-video mapping file
    └── asl_videos/                   # Directory containing ASL video files
        ├── 02718.mp4
        ├── 03999.mp4
        ├── 05778.mp4
        └── ... (100+ more video files)
```

---

## 📂 Directory Descriptions

### `/backend/` - Flask Backend Server

The backend handles ASL video serving and text-to-ASL translation.

**Files:**
- **`app.py`** (127 lines) - Main Flask application
  - Serves frontend files
  - Provides `/get_asl` API endpoint for word-to-video translation
  - Serves video files from the dataset
  - Includes health check endpoint
  
- **`config.py`** (18 lines) - Configuration settings
  - Server settings (port, host, debug mode)
  - File path configurations
  - CORS settings
  
- **`requirements.txt`** (Empty currently) - Python dependencies
  - Should include: `flask`, `flask-cors`

---

### `/frontend/` - Web User Interface

The frontend provides the user interface for speech-to-ASL translation.

**Files:**
- **`index.html`** (88 lines) - Main HTML structure
  - Header with project title
  - Live transcript panel (displays spoken text)
  - ASL video panel (displays sign language videos)
  - Media controls (start, pause, stop buttons)
  
- **`script.js`** (237 lines) - JavaScript application logic
  - Web Speech API integration for real-time speech recognition
  - ASL queue system for sequential video playback
  - Backend API communication
  - Video status display and error handling
  
- **`style.css`** (252 lines) - Styling and layout
  - Modern, clean UI design
  - Responsive grid layout
  - Animations and transitions
  - Mobile-friendly responsive design

---

### `/dataset/` - ASL Video Data

Contains the ASL video library and mapping file.

**Files:**
- **`asl_mapping.json`** - Word-to-video mapping file
  - JSON format: `{ "word": { "video_id": "xxxxx", "file": "xxxxx.mp4" } }`
  - Contains ~100+ word mappings
  - Words include: teacher, student, write, book, listen, help, etc.

**Directory:**
- **`asl_videos/`** - Video file directory
  - Contains 100+ MP4 video files
  - Each file shows ASL signing for a specific word/phrase
  - Named with numeric IDs (e.g., `57044.mp4`, `69494.mp4`)

---

## 🚀 Getting Started

### Prerequisites
- Python 3.7+
- Modern web browser (Chrome or Edge for speech recognition)

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Kyreena/LingoBridge.git
   cd LingoBridge
   ```

2. **Install Python dependencies:**
   ```bash
   pip install flask flask-cors
   ```
   
   Or create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install flask flask-cors
   ```

3. **Start the Flask backend:**
   ```bash
   python backend/app.py
   ```
   
   The server will start on `http://localhost:5000`

4. **Open the application:**
   - Open your browser and navigate to `http://localhost:5000`
   - Allow microphone access when prompted
   - Click "Start" to begin speech-to-ASL translation

---

## 🔧 How It Works

### Architecture Flow

1. **Speech Input** → User speaks into microphone
2. **Speech Recognition** → Browser's Web Speech API converts speech to text
3. **Text Processing** → JavaScript filters out stop words and extracts meaningful words
4. **ASL Lookup** → Frontend sends word to backend `/get_asl` API
5. **Video Retrieval** → Backend looks up word in `asl_mapping.json` and returns video URL
6. **Video Display** → Frontend plays the ASL video for the user

### Key Features

- ✅ Real-time speech-to-text conversion
- ✅ Automatic ASL video lookup and playback
- ✅ Queue system for handling multiple words
- ✅ Stop word filtering (skips common words like "the", "is", "a")
- ✅ Clean, modern user interface
- ✅ Responsive design (works on desktop and mobile)

---

## 📝 File Details

### Root Level Files

**`.gitignore`**
```
# Python virtual environment
venv/

# Python cache
__pycache__/
*.pyc

# Node dependencies
node_modules/

# Environment variables
.env

# OS-generated files
Thumbs.db
.DS_Store
```

**`README.md`**
- Project overview and objectives
- Technology stack information
- Scope and methodology
- Academic project context

---

## 🛠️ Development Notes

### Adding New ASL Words

1. Add the video file to `dataset/asl_videos/`
2. Add the mapping to `dataset/asl_mapping.json`:
   ```json
   "newword": { "video_id": "xxxxx", "file": "xxxxx.mp4" }
   ```
3. Restart the Flask server

### Modifying the Frontend

- **HTML**: Edit `frontend/index.html`
- **Styling**: Edit `frontend/style.css`
- **Logic**: Edit `frontend/script.js`
- No build process required - just refresh the browser

### Backend API Endpoints

- `GET /` - Serves the main HTML page
- `GET /get_asl?word=<word>` - Returns ASL video URL for a word
- `GET /videos/<filename>` - Serves video files
- `GET /health` - Health check endpoint

---

## 🔒 Security & Privacy

- No user data is stored or transmitted to external servers
- Speech recognition uses browser's built-in API
- All ASL videos are served locally
- No authentication required (Phase 1)

---

## 📚 Dependencies

### Python (Backend)
- **Flask** - Web framework
- **flask-cors** - CORS support for frontend-backend communication

### JavaScript (Frontend)
- **Web Speech API** - Browser-based speech recognition (no external libraries)

---

## 🎓 Academic Context

This project is developed as a final-year undergraduate project for the Bachelor of Business Information Technology at Strathmore University. It demonstrates:
- Full-stack web development
- Real-time speech recognition
- Inclusive design for accessibility
- Practical application of AI in education

---

## 📞 Support

If you encounter any issues:
1. Ensure Flask server is running (`python backend/app.py`)
2. Check browser console for errors (F12)
3. Verify you're using Chrome or Edge (required for Web Speech API)
4. Check that video files exist in `dataset/asl_videos/`

---

## 🔄 Version Control

This project uses Git for version control. The `.gitignore` file prevents:
- Python virtual environments (`venv/`)
- Python cache files (`__pycache__/`, `*.pyc`)
- Node dependencies (`node_modules/`)
- Environment files (`.env`)
- OS-generated files (`Thumbs.db`, `.DS_Store`)

---

## 📊 Project Statistics

- **Total Files**: ~125 files
- **Backend Files**: 3 Python files
- **Frontend Files**: 3 web files
- **ASL Videos**: 100+ MP4 files
- **Supported Words**: 100+ ASL signs
- **Lines of Code**: 
  - Backend: ~145 lines
  - Frontend: ~577 lines
  - Total: ~722 lines

---

*Last Updated: 2026-02-19*
