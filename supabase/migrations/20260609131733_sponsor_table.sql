CREATE table sponsors(
    id SERIAL   PRIMARY KEY,
    name    TEXT   NOT NULL,
    image   TEXT  NOT NULL,
    website_url  TEXT    NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL
)