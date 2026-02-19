
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json
import os
import re

# --------------------------
# APP INITIALIZATION
# --------------------------
app = Flask(__name__, static_folder="../frontend", static_url_path="")
CORS(app)  # Allows frontend to talk to backend (important!)

# --------------------------
# PATH CONFIGURATION
# --------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # Gets backend/ folder path
VIDEO_DIR = os.path.join(BASE_DIR, "..", "dataset", "asl_videos")  # Points to dataset/asl_videos/
MAPPING_FILE = os.path.join(BASE_DIR, "..", "dataset", "asl_mapping.json")  # ✅ FIXED: Now points to dataset/asl_mapping.json

# --------------------------
# LOAD ASL MAPPING
# --------------------------
try:
    with open(MAPPING_FILE, "r", encoding="utf-8") as f:
        asl_map = json.load(f)
    print(f"✅ Loaded {len(asl_map)} ASL signs from mapping file")
except FileNotFoundError:
    print(f"❌ ERROR: Could not find {MAPPING_FILE}")
    print(f"   Make sure asl_mapping.json is in the dataset/ folder")
    asl_map = {}
except json.JSONDecodeError:
    print(f"❌ ERROR: Invalid JSON in {MAPPING_FILE}")
    asl_map = {}

# --------------------------
# FRONTEND ROUTES
# --------------------------
@app.route("/")
def index():
    """Serves the main HTML page"""
    return app.send_static_file("index.html")


@app.route("/<path:path>")
def static_files(path):
    """Serves CSS, JS, and other static files"""
    return app.send_static_file(path)

# --------------------------
# ASL TRANSLATION API
# --------------------------
@app.route("/get_asl")
def get_asl():
    """
    API Endpoint: /get_asl?word=hello
    Returns the ASL video URL for a given word
    """
    
    raw_text = request.args.get("word", "")
    
    if not raw_text:
        return jsonify({"error": "No word provided"}), 400
    
    # 1. Normalize the input (remove punctuation, lowercase)
    clean_text = re.sub(r"[^\w\s]", "", raw_text).lower().strip()
    
    # 2. Check if the exact word exists in our mapping
    if clean_text in asl_map:
        video_data = asl_map[clean_text]
        
        # Support both {"file": "xxx.mp4"} and "xxx.mp4" formats
        if isinstance(video_data, dict):
            video_file = video_data.get("file")
        else:
            video_file = video_data
        
        return jsonify({
            "word": clean_text,
            "video_url": f"/videos/{video_file}"
        })
    
    # 3. If not found, return 404
    return jsonify({
        "error": f"No ASL video found for '{clean_text}'"
    }), 404

# --------------------------
# VIDEO SERVING ROUTE
# --------------------------
@app.route("/videos/<filename>")
def serve_video(filename):
    """
    Serves video files from the dataset/asl_videos/ folder
    Example: /videos/57044.mp4
    """
    try:
        return send_from_directory(VIDEO_DIR, filename)
    except FileNotFoundError:
        return jsonify({"error": f"Video file {filename} not found"}), 404

# --------------------------
# HEALTH CHECK (NEW - useful for testing)
# --------------------------
@app.route("/health")
def health():
    """Quick check to see if server is running"""
    return jsonify({
        "status": "running",
        "total_signs": len(asl_map),
        "video_directory": VIDEO_DIR
    })

# --------------------------
# RUN SERVER
# --------------------------
if __name__ == '__main__':
    print("\n" + "="*50)
    print("🚀 LingoBridge Backend Starting...")
    print("="*50)
    print(f"📂 Video Directory: {VIDEO_DIR}")
    print(f"📄 Mapping File: {MAPPING_FILE}")
    print(f"📊 Total Signs Loaded: {len(asl_map)}")
    print("="*50)
    print("🌐 Open http://localhost:5000 in your browser")
    print("="*50 + "\n")
    
    app.run(debug=True, port=5000)
