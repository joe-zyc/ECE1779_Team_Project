-- Run with: psql -d <db_name> -f ECE1779_Team_Project/db/ddl/99_apply_all.sql

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'admin');
CREATE TYPE listing_status AS ENUM ('draft', 'published', 'removed');

\ir users.sql
\ir car_listings.sql
\ir listing_images.sql
\ir buyer_preferences.sql
\ir email_notifications.sql

COMMIT;
