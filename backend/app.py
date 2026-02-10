from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json
import os
import re

# --------------------------
# APP INITIALIZATION
# --------------------------
app = Flask(__name__, static_folder="../frontend", static_url_path="")
CORS(app)

# --------------------------
# PATH CONFIGURATION
# --------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
VIDEO_DIR = os.path.join(BASE_DIR, "..", "dataset", "asl_videos")
MAPPING_FILE = os.path.join(BASE_DIR, "asl_mapping.json")

# --------------------------
# LOAD ASL MAPPING
# --------------------------
with open(MAPPING_FILE, "r", encoding="utf-8") as f:
    asl_map = json.load(f)

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
    """
    Accepts spoken text and returns the first matching ASL video
    """

    raw_text = request.args.get("word", "")

    # 1. Normalize speech input (VERY IMPORTANT)
    clean_text = re.sub(r"[^\w\s]", "", raw_text).lower()
    words = clean_text.split()

    # 2. Try to match any word in the sentence
    for word in words:
        if word in asl_map:
            video_data = asl_map[word]

            # Support both mapping formats
            if isinstance(video_data, dict):
                video_file = video_data.get("file")
            else:
                video_file = video_data

            return jsonify({
                "word": word,
                "video_url": f"/videos/{video_file}"
            })

    return jsonify({
        "error": "No ASL video found for this word"
    }), 404

# --------------------------
# VIDEO SERVING ROUTE
# --------------------------
@app.route("/videos/<filename>")
def serve_video(filename):
    return send_from_directory(VIDEO_DIR, filename)

# --------------------------
# RUN SERVER
# --------------------------
if __name__ == '__main__':
    print("🚀 Flask server starting...")
    app.run(debug=True)
