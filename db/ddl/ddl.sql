BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TYPE user_role AS ENUM ('buyer', 'seller');
CREATE TYPE listing_status AS ENUM ('draft', 'published', 'removed');

\ir users.sql
\ir car_listings.sql
\ir listing_images.sql
\ir buyer_preferences.sql
\ir email_notifications.sql

COMMIT;
