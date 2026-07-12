-- Schema for the head-to-head race results table.
CREATE TABLE IF NOT EXISTS races (
  id TEXT PRIMARY KEY,
  game TEXT NOT NULL,
  track TEXT NOT NULL,
  car_class TEXT NOT NULL,
  conditions TEXT NOT NULL,
  winner TEXT NOT NULL,
  fastest_lap TEXT NOT NULL,
  fastest_lap_time TEXT NOT NULL,
  date TEXT NOT NULL,
  laps INTEGER,
  race_duration TEXT,
  harish_finishing_pos TEXT,
  shabesh_finishing_pos TEXT,
  harish_starting_pos INTEGER,
  shabesh_starting_pos INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_races_date ON races(date);
