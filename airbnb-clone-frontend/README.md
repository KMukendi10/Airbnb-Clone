# Airbnb Clone - Frontend

React (Vite) frontend for the Zaio Capstone - Home, Location, and Location Details views.

## Setup

```bash
npm install
cp .env.example .env   # point VITE_API_URL at your backend, e.g. http://localhost:5000/api
npm run dev             # http://localhost:5173
```

Make sure the backend is running (and seeded) first - see `../backend/README.md`.

## Structure

- `src/pages/` - Home, Location, LocationDetails, Login, Reservations
- `src/components/` - Header (shared, logged-in/out states), Footer, LocationCard
- `src/context/AuthContext.jsx` - JWT auth state, persisted to localStorage
- `src/api/client.js` - fetch wrapper for the backend API

## Notes

- Inspiration cards and Discover Experiences on the Home page are static per the brief.
- Location and Location Details pull live data from `/api/accommodations`.
- The cost calculator recalculates on every date/guest change and posts to `/api/reservations` on Reserve.
- Deploy to Heroku with a static buildpack, or `npm run build` and serve `dist/`.
