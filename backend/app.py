from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json
import os
import re

from analytics import (
    get_db_path,
    init_db,
    start_session,
    end_session,
    log_event,
    bump_counter,
    list_sessions,
    summary,
    top_missing_words,
)

# --------------------------
# APP INITIALIZATION
# --------------------------
app = Flask(__name__, static_folder="../frontend", static_url_path="")
CORS(app)  # Allows frontend to talk to backend (important!)

# --------------------------
# PATH CONFIGURATION
# --------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # backend/ folder path
VIDEO_DIR = os.path.join(BASE_DIR, "..", "dataset", "asl_videos")
MAPPING_FILE = os.path.join(BASE_DIR, "..", "dataset", "asl_mapping.json")

# --------------------------
# ANALYTICS DB INIT (SQLite)
# --------------------------
DB_PATH = get_db_path(BASE_DIR)
SCHEMA_PATH = os.path.join(BASE_DIR, "schema.sql")
init_db(DB_PATH, SCHEMA_PATH)

# --------------------------
# LOAD ASL MAPPING
# --------------------------
try:
    with open(MAPPING_FILE, "r", encoding="utf-8") as f:
        asl_map = json.load(f)
    print(f"✅ Loaded {len(asl_map)} ASL signs from mapping file")
except FileNotFoundError:
    print(f"❌ ERROR: Could not find {MAPPING_FILE}")
    print("   Make sure asl_mapping.json is in the dataset/ folder")
    asl_map = {}
except json.JSONDecodeError:
    print(f"❌ ERROR: Invalid JSON in {MAPPING_FILE}")
    asl_map = {}

# --------------------------
# FRONTEND ROUTES
# --------------------------
@app.route("/")
def index():
    return app.send_static_file("index.html")

@app.route("/<path:path>")
def static_files(path):
    return app.send_static_file(path)

# --------------------------
# ASL TRANSLATION API
# --------------------------
@app.route("/get_asl")
def get_asl():
    raw_text = request.args.get("word", "")
    if not raw_text:
        return jsonify({"error": "No word provided"}), 400

    # 1. Normalize the input (remove punctuation, lowercase)
    clean_text = re.sub(r"[^\w\s]", "", raw_text).lower().strip()

    # 2. Check if the exact word exists in our mapping
    if clean_text in asl_map:
        video_data = asl_map[clean_text]
        
        video_file = video_data.get("file") if isinstance(video_data, dict) else video_data

        return jsonify({"word": clean_text, "video_url": f"/videos/{video_file}"})

    return jsonify({"error": f"No ASL video found for '{clean_text}'"}), 404

# --------------------------
# VIDEO SERVING ROUTE
# --------------------------
@app.route("/videos/<filename>")
def serve_video(filename):
    try:
        return send_from_directory(VIDEO_DIR, filename)
    except FileNotFoundError:
        return jsonify({"error": f"Video file {filename} not found"}), 404

# --------------------------
# HEALTH CHECK
# --------------------------
@app.route("/health")
def health():
    return jsonify(
        {
            "status": "running",
            "total_signs": len(asl_map),
            "video_directory": VIDEO_DIR,
        }
    )

# --------------------------
# ANALYTICS API
# --------------------------
@app.route("/api/session/start", methods=["POST"])
def api_session_start():
    data = request.get_json(silent=True) or {}
    mode = data.get("mode", "live")
    session_id = start_session(DB_PATH, mode=mode)
    return jsonify({"session_id": session_id})

@app.route("/api/session/end", methods=["POST"])
def api_session_end():
    data = request.get_json(silent=True) or {}
    session_id = data.get("session_id")
    if not session_id:
        return jsonify({"error": "session_id required"}), 400
    end_session(DB_PATH, session_id)
    return jsonify({"ok": True})

@app.route("/api/event", methods=["POST"])
def api_event():
    data = request.get_json(silent=True) or {}
    session_id = data.get("session_id")
    event_type = data.get("type")
    payload = data.get("payload") or {}

    if not session_id or not event_type:
        return jsonify({"error": "session_id and type are required"}), 400

    log_event(DB_PATH, session_id, event_type, payload)
    return jsonify({"ok": True})

@app.route("/api/session/bump", methods=["POST"])
def api_session_bump():
    data = request.get_json(silent=True) or {}
    session_id = data.get("session_id")
    field = data.get("field")
    amount = int(data.get("amount", 1))

    if not session_id or not field:
        return jsonify({"error": "session_id and field are required"}), 400

    bump_counter(DB_PATH, session_id, field, amount)
    return jsonify({"ok": True})

@app.route("/api/analytics/summary")
def api_analytics_summary():
    return jsonify(summary(DB_PATH))

@app.route("/api/analytics/sessions")
def api_analytics_sessions():
    limit = int(request.args.get("limit", "50"))
    return jsonify({"sessions": list_sessions(DB_PATH, limit=limit)})

@app.route("/api/analytics/top-missing-words")
def api_analytics_top_missing_words():
    limit = int(request.args.get("limit", "10"))
    return jsonify({"top_missing_words": top_missing_words(DB_PATH, limit=limit)})

# --------------------------
# RUN SERVER
# --------------------------
if __name__ == "__main__":
    print("\n" + "=" * 50)
    print("🚀 LingoBridge Backend Starting...")
    print("=" * 50)
    print(f"📂 Video Directory: {VIDEO_DIR}")
    print(f"📄 Mapping File: {MAPPING_FILE}")
    print(f"📊 Total Signs Loaded: {len(asl_map)}")
    print(f"🗄️  Analytics DB: {DB_PATH}")
    print("=" * 50)
    print("🌐 Open http://localhost:5000 in your browser")
    print("=" * 50 + "\n")

    app.run(debug=True, port=5000)