CREATE TABLE training_days(
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    day TEXT NOT NULL,
    time TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX training_days_team_id_idx ON training_days(team_id);
