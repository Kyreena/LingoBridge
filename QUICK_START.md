# 🚀 LingoBridge Quick Start Guide

Get LingoBridge up and running in 3 simple steps!

## ⚡ Quick Setup (5 minutes)

### Step 1: Install Dependencies
```bash
cd LingoBridge
pip install -r backend/requirements.txt
```

**Or use a virtual environment (recommended):**
```bash
python -m venv venv
source venv/bin/activate      # On Windows: venv\Scripts\activate
pip install -r backend/requirements.txt
```

### Step 2: Start the Server
```bash
python backend/app.py
```

You should see:
```
🚀 LingoBridge Backend Starting...
📂 Video Directory: /path/to/dataset/asl_videos
📄 Mapping File: /path/to/dataset/asl_mapping.json
📊 Total Signs Loaded: 100+
🌐 Open http://localhost:5000 in your browser
```

### Step 3: Use the Application
1. Open your browser to **http://localhost:5000**
2. Allow microphone access when prompted
3. Click the **"▶ Start"** button
4. Start speaking!
5. Watch as your words are converted to ASL videos

---

## 📁 What You Need

### Required Files Checklist
- ✅ `backend/app.py` - Main server
- ✅ `backend/config.py` - Configuration
- ✅ `backend/requirements.txt` - Dependencies
- ✅ `frontend/index.html` - Main page
- ✅ `frontend/script.js` - Speech recognition logic
- ✅ `frontend/style.css` - Styling
- ✅ `dataset/asl_mapping.json` - Word-to-video mappings
- ✅ `dataset/asl_videos/` - Video files (100+ MP4 files)

### Verify Your Structure
Run this command to check if all files are present:
```bash
ls -R LingoBridge/
```

Expected output:
```
LingoBridge/
├── backend/
│   ├── app.py
│   ├── config.py
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── script.js
│   └── style.css
└── dataset/
    ├── asl_mapping.json
    └── asl_videos/
        └── [100+ .mp4 files]
```

---

## 🔧 Troubleshooting

### Server Won't Start
**Error:** `ModuleNotFoundError: No module named 'flask'`
- **Fix:** Run `pip install -r backend/requirements.txt`

### No Videos Playing
**Error:** "Backend server is not running"
- **Fix:** Make sure Flask server is running (`python backend/app.py`)

**Error:** "Video file not found"
- **Fix:** Check that video files exist in `dataset/asl_videos/`

### Speech Recognition Not Working
**Error:** "Speech recognition not supported"
- **Fix:** Use Chrome or Edge browser (Safari and Firefox don't support Web Speech API)

**Error:** No speech detected
- **Fix:** Check microphone permissions in browser settings
- **Fix:** Speak closer to the microphone

---

## 🎤 Supported Words

Try saying these words to test the system:
- **Education**: teacher, student, book, write, listen
- **Actions**: help, stop, question, answer, explain
- **Objects**: desk, chair, pencil, calculator, keyboard
- **Academic**: practice, review, exercise, project, discuss

View the complete list in `dataset/asl_mapping.json`

---

## 💡 Tips

1. **Speak Clearly** - The Web Speech API works best with clear pronunciation
2. **Short Phrases** - Speak 2-3 words at a time for best results
3. **Common Words** - Words like "the", "is", "a" are filtered out automatically
4. **Queue System** - Multiple words are queued and played in sequence

---

## 📚 Learn More

- Read **PROJECT_STRUCTURE.md** for detailed documentation
- Read **README.md** for project overview and objectives
- Check browser console (F12) for debugging information

---

*Need help? Make sure you're following the exact structure shown above!*
