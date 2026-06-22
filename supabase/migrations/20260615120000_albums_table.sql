CREATE TABLE albums(
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    cover_image TEXT NOT NULL,
    images TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    date DATE NOT NULL,
    tags TEXT DEFAULT '' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
)
