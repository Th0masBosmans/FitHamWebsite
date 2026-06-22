CREATE TABLE teams(
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    photo_url TEXT,
    sort_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
)
