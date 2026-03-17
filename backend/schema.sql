CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  mode TEXT NOT NULL,                 -- 'live' | 'demo'
  words_recognized INTEGER NOT NULL DEFAULT 0,
  signs_played INTEGER NOT NULL DEFAULT 0,
  fingerspelled_words INTEGER NOT NULL DEFAULT 0,
  pauses INTEGER NOT NULL DEFAULT 0,
  resumes INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  ts TEXT NOT NULL,                   -- ISO timestamp (UTC)
  type TEXT NOT NULL,                 -- e.g. 'missing_word', 'pause', etc.
  payload TEXT,                       -- JSON string (NO raw transcript)
  FOREIGN KEY(session_id) REFERENCES sessions(id)
);

CREATE INDEX IF NOT EXISTS idx_events_session_ts ON events(session_id, ts);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);