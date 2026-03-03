CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             VARCHAR(320) NOT NULL UNIQUE,
  password_hash     TEXT NOT NULL,
  role              user_role NOT NULL,
  display_name      VARCHAR(120) NOT NULL,
  phone             VARCHAR(32),
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
