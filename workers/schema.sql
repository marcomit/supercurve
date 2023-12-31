CREATE TABLE IF NOT EXISTS highscores (
  id integer PRIMARY KEY AUTOINCREMENT,
  user string NOT NULL,
  score integer NOT NULL DEFAULT 0,
  timestamp string NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_highscores_score ON highscores (score);
CREATE INDEX IF NOT EXISTS idx_highscores_timestamp ON highscores (timestamp);
