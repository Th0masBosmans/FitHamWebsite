CREATE TABLE site_images(
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    page TEXT NOT NULL,
    image TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
)
