CREATE TABLE buyer_preferences (
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
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
);
