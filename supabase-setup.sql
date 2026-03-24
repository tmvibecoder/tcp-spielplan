-- ============================================
-- TC Pliening Spielplan — Supabase Setup
-- Führe dieses SQL im Supabase SQL Editor aus
-- ============================================

-- Tabelle 1: Ein Eintrag pro Mannschaftsspiel
CREATE TABLE match_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id TEXT NOT NULL,
  match_date TEXT NOT NULL,
  match_time TEXT NOT NULL,
  home_wins SMALLINT DEFAULT 0,
  away_wins SMALLINT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team_id, match_date, match_time)
);

-- Tabelle 2: Ein Eintrag pro Einzel/Doppel
CREATE TABLE individual_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_score_id UUID REFERENCES match_scores(id) ON DELETE CASCADE,
  position SMALLINT NOT NULL,
  match_type TEXT NOT NULL CHECK (match_type IN ('singles', 'doubles')),
  home_player TEXT DEFAULT '',
  away_player TEXT DEFAULT '',
  set1_home SMALLINT,
  set1_away SMALLINT,
  set2_home SMALLINT,
  set2_away SMALLINT,
  set3_home SMALLINT,
  set3_away SMALLINT,
  winner TEXT CHECK (winner IN ('home', 'away') OR winner IS NULL),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(match_score_id, position)
);

-- Indizes für schnelle Lookups
CREATE INDEX idx_match_scores_lookup ON match_scores(team_id, match_date, match_time);
CREATE INDEX idx_individual_matches_score_id ON individual_matches(match_score_id);

-- Row Level Security aktivieren
ALTER TABLE match_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE individual_matches ENABLE ROW LEVEL SECURITY;

-- Policies: Jeder darf lesen und schreiben (kein Auth nötig)
CREATE POLICY "Jeder kann match_scores lesen"
  ON match_scores FOR SELECT
  TO anon USING (true);

CREATE POLICY "Jeder kann match_scores erstellen"
  ON match_scores FOR INSERT
  TO anon WITH CHECK (true);

CREATE POLICY "Jeder kann match_scores updaten"
  ON match_scores FOR UPDATE
  TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Jeder kann individual_matches lesen"
  ON individual_matches FOR SELECT
  TO anon USING (true);

CREATE POLICY "Jeder kann individual_matches erstellen"
  ON individual_matches FOR INSERT
  TO anon WITH CHECK (true);

CREATE POLICY "Jeder kann individual_matches updaten"
  ON individual_matches FOR UPDATE
  TO anon USING (true) WITH CHECK (true);

-- Realtime aktivieren
ALTER PUBLICATION supabase_realtime ADD TABLE match_scores;
ALTER PUBLICATION supabase_realtime ADD TABLE individual_matches;
