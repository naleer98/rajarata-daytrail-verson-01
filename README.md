# RajaRata DayTrail

A premium full-stack travel experience for exploring Anuradhapura. The project combines curated destination guides, a live Leaflet map, a smart one-day route planner, cultural guidance, an offline-capable travel assistant and a protected destination-management dashboard.

## Highlights

- Cinematic, responsive UI with a custom heritage design system
- HD hero artwork and locally bundled destination photography
- Searchable destination explorer with category filters and map/list views
- Numbered interactive map markers, location support, popups and route lines
- Smart route generation using distance, visit duration, opening times and pace
- RajaRata AI-style chat with backend knowledge and instant local fallback
- Detailed destination pages with etiquette, facilities and direct directions
- Secure administrator registration, login and destination CRUD workflow
- Usable demo content even when the backend is temporarily unavailable
- Mobile, tablet, desktop, keyboard and reduced-motion support

## Project structure

```text
rajarata-daytrail/
├── backend/   Express API, MongoDB models, auth, chat and route planner
└── frontend/  React, Vite, Leaflet and the complete user interface
```

## Requirements

- Node.js 18 or newer
- npm
- MongoDB running locally, or a MongoDB Atlas connection string

## 1. Start the backend

```bash
cd backend
npm install
```

Copy `.env.example` to `.env`, then replace every placeholder with your own values. Use long, private values for `JWT_SECRET`, `ADMIN_REGISTRATION_CODE` and `SEED_ADMIN_PASSWORD`.

```bash
npm run seed
npm run dev
```

The API runs at `http://localhost:5000` by default. The seed command replaces the existing users and places in the configured database, so use it only on a development database.

## 2. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

The frontend uses `/api` through the Vite development proxy. For a separate production API, set `VITE_API_BASE_URL` in `frontend/.env`, for example:

```env
VITE_API_BASE_URL=https://api.example.com/api
```

## Production build

```bash
cd frontend
npm run build
npm run preview
```

The optimized frontend is written to `frontend/dist`.

## Important deployment notes

- Never commit a real `.env` file or reuse the example secrets.
- Set `CLIENT_URL` in the backend to the permitted frontend origin. Multiple origins can be comma-separated.
- The map uses OpenStreetMap tiles and therefore needs an internet connection to display the basemap.
- The planner and guide retain useful local fallbacks, but saving data and administrator features require the backend and MongoDB.
- Confirm admission fees, opening hours and religious-event changes with the venue before travel.

