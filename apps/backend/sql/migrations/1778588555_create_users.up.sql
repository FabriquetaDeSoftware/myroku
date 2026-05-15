CREATE TABLE users (
    id UUID PRIMARY KEY,

    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    github_token TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);