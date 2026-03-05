BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE IF NOT EXISTS user_role AS ENUM ('buyer', 'seller');

CREATE TYPE IF NOT EXISTS listing_status AS ENUM ('draft', 'published', 'removed');

CREATE TABLE IF NOT EXISTS users (
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


CREATE TABLE IF NOT EXISTS car_listings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  make              VARCHAR(64),
  model             VARCHAR(64),
  trim              VARCHAR(64),
  year              INT,
  vin               VARCHAR(17),
  body_type         VARCHAR(32),
  color             VARCHAR(32),
  mileage_km        INT,
  price             NUMERIC(12,2),
  description       TEXT,
  contact_email     VARCHAR(320),
  contact_phone     VARCHAR(32),
  status            listing_status NOT NULL DEFAULT 'draft',
  published_at      TIMESTAMPTZ,
  removed_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS car_listing_images (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id        UUID NOT NULL REFERENCES car_listings(id) ON DELETE CASCADE,
  storage_path      TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS buyer_preferences (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  make              VARCHAR(64),
  model             VARCHAR(64),
  year_min          INT,
  year_max          INT,
  price_max_cad     NUMERIC(12,2),
  mileage_max_km    INT,
  color             VARCHAR(32),
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMIT;
