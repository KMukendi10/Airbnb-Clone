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
| `/locations/:id` | `LocationDetails` | Gallery, host info, amenities, ratings, sticky cost calculator |
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
- **Accessibility** — semantic HTML, `aria-*` attributes, accessible focus styles, `role="status"` on live feedback.

## Build & Deploy

```bash
npm run build   # output in dist/
```

Deploy the `dist/` folder to any static host (Netlify, Vercel, GitHub Pages, or
Heroku with the static buildpack).

Set `VITE_API_URL` to your deployed backend URL before building for production.
