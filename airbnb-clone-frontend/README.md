# Airbnb Clone — Frontend

React 18 / Vite frontend for the Zaio Capstone Airbnb Clone project. Mirrors the
public-facing Airbnb.com experience with a Home page, Location search, Listing
details with a cost calculator, user authentication and a reservations view.

## Tech Stack

- React 18 with Hooks
- React Router v6 (client-side routing)
- Vite (dev server + build)
- Plain CSS (no frameworks — custom design token system in `src/index.css`)
- Google Fonts — Inter

## Pages

| Route | Component | Description |
|---|---|---|
| `/` | `Home` | Hero, inspiration grid, experiences, gift cards, getaways tabs, hosting banner |
| `/locations` | `Location` | Search results grid with filter chips and ?location= param |
| `/locations/:id` | `LocationDetails` | Gallery, host info, amenities, ratings, sticky cost calculator, availability calendar |
| `/login` | `Login` | Log in / sign up card with role selector |
| `/reservations` | `Reservations` | "My Trips" — protected, shows user's bookings as cards |

## Setup

```bash
npm install
cp .env.example .env   # set VITE_API_URL=http://localhost:5000/api
npm run dev             # http://localhost:5173
```

Ensure the backend is running and seeded first — see `../airbnb-clone-backend/README.md`.

## Project Structure

```
src/
  api/client.js          Fetch wrapper (attaches JWT, parses errors)
  context/AuthContext.jsx JWT auth state persisted in localStorage
  components/
    Header.jsx / .css    Sticky nav with search pill, logo, profile dropdown
    Footer.jsx / .css    4-column link grid + locale bar
    LocationCard.jsx/.css Vertical listing card (image top, details below)
  pages/
    Home.jsx / .css
    Location.jsx / .css
    LocationDetails.jsx / .css
    Login.jsx / .css
    Reservations.jsx / .css
  index.css              Design tokens, button system, global reset
```

## Key Features

- **Responsive** — all pages stack gracefully down to 320 px.
- **Auth** — JWT stored in `localStorage` under `'token'`; re-hydrated on refresh via `GET /api/users/me`.
- **Cost calculator** — recalculates on every date change using `useMemo`; weekly discount applies at 7+ nights; cost is validated server-side before saving.
- **Availability calendar** — reads the listing's already-booked date ranges (plus a 1-day cleaning buffer) and disables those days so a guest can't select dates the backend would reject. If a booking still loses a race to another guest, the API returns `409` and the calendar refetches to show the up-to-date availability.
- **Accessibility** — semantic HTML, `aria-*` attributes, accessible focus styles, `role="status"` on live feedback.

## Build & Deploy

```bash
npm run build   # output in dist/
```

Deployed as a Render Static Site: https://airbnb-clone-frontend-46hl.onrender.com
(Build command `npm install && npm run build`, publish directory `dist`, with
a `/*` → `/index.html` rewrite rule for React Router. See
`../airbnb-clone-backend/README.md` for full deploy steps.)

Set `VITE_API_URL=https://airbnb-clone-backend-xmit.onrender.com/api` before building for production.