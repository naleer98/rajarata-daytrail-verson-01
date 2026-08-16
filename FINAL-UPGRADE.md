# RajaRata DayTrail — Final Upgrade

## Included

- Cinematic destination gallery with accessible lightbox
- Browser-saved favourites with Explore filter
- Local visitor reviews and ratings
- Live Open-Meteo weather, sunrise and sunset data (no API key required)
- Shareable itineraries and browser PDF export
- English, Tamil and Sinhala core navigation/hero translations
- Light/dark theme with saved preference
- Installable PWA, service worker and custom offline page
- Dynamic SEO metadata, structured data, robots.txt and sitemap.xml
- Privacy-friendly local admin analytics
- Custom animated 404 page
- Lazy-loaded/deferred images and improved focus/mobile behaviour
- Compact animated “Made by WebFixPro” footer credit

## Run

```bash
cd backend
npm install
npm run dev
```

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The PWA service worker activates in the production build (`npm run build` + `npm run preview`). Weather requires internet access. Favourites, reviews and analytics work locally even when the backend is unavailable.

## CORS

Development mode accepts localhost, `127.0.0.1` and LAN browser origins automatically. In production, set `CLIENT_URL` to the exact trusted frontend domain (multiple domains may be comma-separated).
