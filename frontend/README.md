# Frontend (React + Vite)

This frontend was generated from `IMPLEMENTATION_PLAN.md` and the backend implementation summary.

## Features

- Public listing browse with client-side search and sort
- Listing detail view
- Auth flows: signup, login, logout, profile, refresh token usage
- Seller hub: create, edit, publish/unpublish/remove listing, upload images
- Buyer preferences UI wired to backend endpoints (with graceful 501 handling)
- Role-gated navigation and protected routes

## Setup

1. Copy env file:
   - `cp .env.example .env`
2. Install dependencies:
   - `npm install`
3. Run in dev mode:
   - `npm run dev`

## Backend Alignment

Expected backend base URL:

- `http://localhost:3001/api/v1`

If your backend runs elsewhere, set `VITE_API_BASE_URL` in `.env`.
