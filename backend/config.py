import os

class Config:
    """Configuration settings for the Flask app"""
    
    # Server settings
    DEBUG = True
    PORT = 5000
    HOST = '127.0.0.1'  # localhost
    
    # File paths
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATASET_DIR = os.path.join(BASE_DIR, "..", "dataset")
    VIDEO_DIR = os.path.join(DATASET_DIR, "asl_videos")
    MAPPING_FILE = os.path.join(DATASET_DIR, "asl_mapping.json")
    
    # CORS settings (allows frontend to connect)
    CORS_ORIGINS = ["http://localhost:5000", "http://127.0.0.1:5000"]