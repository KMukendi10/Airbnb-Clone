# Airbnb Clone - Admin Dashboard

React (Vite) admin dashboard - login, create/view/update/delete listings, reservations.

## Setup

```bash
npm install
cp .env.example .env   # point VITE_API_URL at your backend
npm run dev              # http://localhost:5174
```

Log in with the seeded host account: `Jane Doe` / `password321` (see `../backend/seed.js`).
Only accounts with role `host` can log in here - logging in with a `user`-role account is rejected client-side.

## Structure

- `src/pages/Login.jsx` - host-only login
- `src/pages/Listings.jsx` - "My Listings" table with Update/Delete
- `src/pages/CreateListing.jsx` / `UpdateListing.jsx` - thin wrappers around the shared form
- `src/components/ListingForm.jsx` - the actual form (validation, amenities/image add-chips), reused by both
- `src/components/ProtectedRoute.jsx` - redirects to /login if not authenticated
- `src/context/AuthContext.jsx` - JWT persisted to localStorage under `admin_token` (separate key from the public frontend so both can run in the same browser at once)

## Notes

- Buttons follow the Figma: blue for primary/save/update actions, red for destructive actions (delete/cancel).
- Deploy to Heroku with a static buildpack, or `npm run build` and serve `dist/`.
