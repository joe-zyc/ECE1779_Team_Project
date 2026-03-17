# Backend Implementation Summary

## Overview

The backend is an Express API using PostgreSQL (`pg`) with JWT-based authentication and file upload support (`multer`).

- Entry points:
  - `src/server.js`
  - `src/app.js`
- Base API path (default): `/api/v1`
- Health checks:
  - `GET /health/live`
  - `GET /health/ready`

## Current Architecture

- `src/api/routes/*`: route definitions by domain
- `src/api/controllers/*`: request handlers and SQL operations
- `src/api/middleware/*`: auth, role checks, ownership checks, upload config, and error handling
- `src/config/*`: environment and constants
- `src/core/http/*`: shared response and error primitives

## Implemented Features

### Auth

Implemented in `src/api/controllers/auth.controller.js` and `src/api/routes/auth.routes.js`:

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

Behavior includes:
- Password hashing with `bcryptjs`
- Access/refresh token issuance with `jsonwebtoken`
- Token refresh flow
- Authenticated profile fetch

### Listings

Implemented in `src/api/controllers/listings.controller.js` and `src/api/routes/listings.routes.js`:

- Public:
  - `GET /listings`
  - `GET /listings/:id`
- Seller:
  - `POST /listings`
  - `PATCH /listings/:id`
  - `DELETE /listings/:id`
  - `POST /listings/:id/publish`
  - `POST /listings/:id/unpublish`
  - `POST /listings/:id/images`
  - `DELETE /listings/:id/images/:imageId`
  - `GET /my/listings`
- Buyer:
  - `POST /listings/:id/report`

Behavior includes:
- SQL-backed CRUD against `car_listings` and `car_listing_images`
- Role-based and ownership-based access control
- Image upload constraints (JPEG/PNG/WebP, max 5MB each, max 10 files)

## Middleware and Shared Utilities

- `auth.middleware.js`: validates Bearer access token and sets `req.user`
- `requireRole.middleware.js`: enforces buyer/seller role restrictions
- `requireListingOwner.middleware.js`: verifies listing ownership
- `upload.middleware.js`: multer disk storage and file validation
- `notFound.middleware.js`: 404 for unmatched routes
- `error.middleware.js`: centralized API error format
- `core/http/errors.js`: `AppError` class
- `core/http/response.js`: response helpers

## Environment and Runtime Configuration

Defined in `.env.example` and loaded via `src/config/env.js`:

- `PORT`, `API_BASE_PATH`
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `ACCESS_TOKEN_TTL`, `REFRESH_TOKEN_TTL`
- `UPLOAD_DIR`
- SMTP variables are listed but notification service is not yet integrated

## Known Gaps and Risks

1. Preferences endpoints are still placeholders:
   - `src/api/controllers/preferences.controller.js` returns `501 Not Implemented`.
2. `publishListing` references `notifyMatchingBuyers(listing)` but the notification service import is commented/missing:
   - Runtime risk when calling `POST /listings/:id/publish`.
3. `src/db` has no migration/model implementation yet:
   - Schema management is not captured in code in this folder.
4. `README.md` still describes this backend as mostly scaffolded and does not reflect current implemented auth/listings behavior.

## Dependencies Currently Required

From `backend/package.json`:

- `express`
- `cors`
- `dotenv`
- `pg`
- `bcryptjs`
- `jsonwebtoken`
- `multer`
