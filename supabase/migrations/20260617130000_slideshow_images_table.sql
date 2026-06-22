CREATE TABLE slideshow_images(
    id SERIAL PRIMARY KEY,
    image_path TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
)
