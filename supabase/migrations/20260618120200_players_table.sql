CREATE TABLE players(
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX players_team_id_idx ON players(team_id);
