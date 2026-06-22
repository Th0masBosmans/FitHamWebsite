CREATE TABLE board_members(
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    function TEXT NOT NULL,
    email TEXT NOT NULL,
    profile_picture TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
)
