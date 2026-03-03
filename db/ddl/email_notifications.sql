CREATE TABLE email_notifications (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  preference_id      UUID NOT NULL REFERENCES buyer_preferences(id) ON DELETE CASCADE,
  is_active          BOOLEAN DEFAULT TRUE
);