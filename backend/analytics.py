import json
import os
import sqlite3
import uuid
from datetime import datetime, timezone
from typing import Optional

DB_FILENAME = "lingobridge.db"

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def get_db_path(base_dir: str) -> str:
    # base_dir is backend/ directory
    return os.path.join(base_dir, DB_FILENAME)

def connect(db_path: str) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def init_db(db_path: str, schema_path: str) -> None:
    # creates db file if it doesn't exist, applies schema
    with connect(db_path) as conn:
        with open(schema_path, "r", encoding="utf-8") as f:
            conn.executescript(f.read())
        conn.commit()

def start_session(db_path: str, mode: str = "live") -> str:
    session_id = str(uuid.uuid4())
    with connect(db_path) as conn:
        conn.execute(
            "INSERT INTO sessions (id, started_at, mode) VALUES (?, ?, ?)",
            (session_id, _now_iso(), mode),
        )
        conn.commit()
    return session_id

def end_session(db_path: str, session_id: str) -> None:
    with connect(db_path) as conn:
        conn.execute(
            "UPDATE sessions SET ended_at = ? WHERE id = ?",
            (_now_iso(), session_id),
        )
        conn.commit()

def log_event(db_path: str, session_id: str, event_type: str, payload: Optional[dict] = None) -> None:
    payload_str = json.dumps(payload or {}, ensure_ascii=False)
    with connect(db_path) as conn:
        conn.execute(
            "INSERT INTO events (session_id, ts, type, payload) VALUES (?, ?, ?, ?)",
            (session_id, _now_iso(), event_type, payload_str),
        )
        conn.commit()
        
def bump_counter(db_path: str, session_id: str, field: str, amount: int = 1) -> None:
    allowed = {"words_recognized", "signs_played", "fingerspelled_words", "pauses", "resumes"}
    if field not in allowed:
        raise ValueError(f"Invalid counter field: {field}")

    with connect(db_path) as conn:
        conn.execute(
            f"UPDATE sessions SET {field} = {field} + ? WHERE id = ?",
            (amount, session_id),
        )
        conn.commit()

def list_sessions(db_path: str, limit: int = 50):
    with connect(db_path) as conn:
        rows = conn.execute(
            """
            SELECT *
            FROM sessions
            ORDER BY started_at DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()
    return [dict(r) for r in rows]

def summary(db_path: str):
    with connect(db_path) as conn:
        total_sessions = conn.execute("SELECT COUNT(*) AS c FROM sessions").fetchone()["c"]
        totals = conn.execute(
            """
            SELECT
              COALESCE(SUM(words_recognized), 0) AS words_recognized,
              COALESCE(SUM(signs_played), 0) AS signs_played,
              COALESCE(SUM(fingerspelled_words), 0) AS fingerspelled_words,
              COALESCE(SUM(pauses), 0) AS pauses,
              COALESCE(SUM(resumes), 0) AS resumes
            FROM sessions
            """
        ).fetchone()

    return {
        "total_sessions": total_sessions,
        "words_recognized": totals["words_recognized"],
        "signs_played": totals["signs_played"],
        "fingerspelled_words": totals["fingerspelled_words"],
        "pauses": totals["pauses"],
        "resumes": totals["resumes"],
    }

def top_missing_words(db_path: str, limit: int = 10):
    with connect(db_path) as conn:
        rows = conn.execute(
            """
            SELECT payload
            FROM events
            WHERE type = 'missing_word'
            ORDER BY id DESC
            """
        ).fetchall()

    counts = {}
    for row in rows:
        payload = row["payload"] or "{}"
        try:
            word = (json.loads(payload).get("word") or "").strip().lower()
        except json.JSONDecodeError:
            continue

        if not word:
            continue
        counts[word] = counts.get(word, 0) + 1

    items = [{"word": word, "count": count} for word, count in counts.items()]
    items.sort(key=lambda item: (-item["count"], item["word"]))
    return items[:limit]
