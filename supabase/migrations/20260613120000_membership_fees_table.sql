CREATE TABLE membership_fees(
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price INTEGER NOT NULL,
    benefits TEXT[] DEFAULT '{}'::text[] NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
)
