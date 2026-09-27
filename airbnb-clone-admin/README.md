# Airbnb Clone — Admin Dashboard

React 18 / Vite admin panel for the Zaio Capstone project. Lets host-role users
manage their property listings and view incoming guest reservations.

## Tech Stack

- React 18 + React Router v6
- Vite
- Plain CSS with custom design tokens
- JWT authentication (separate `admin_token` key — both apps can run in the same browser)

## Pages

| Route | Component | Access | Description |
|---|---|---|---|
| `/login` | `Login` | Public | Host-only login form |
| `/` | `Listings` | Protected | "My Listings" with thumbnail, meta and Edit/Delete |
| `/listings/new` | `CreateListing` | Protected | New listing form |
| `/listings/:id/edit` | `UpdateListing` | Protected | Pre-filled update form |
| `/reservations` | `Reservations` | Protected | Incoming bookings table — dates shown are confirmed, conflict-free bookings (the backend now rejects overlapping/too-close bookings at creation time) |

## Setup

```bash
npm install
cp .env.example .env   # set VITE_API_URL=http://localhost:5000/api
npm run dev             # http://localhost:5174
```

Log in with the seeded host account: `jane@example.com` / `password321`  
(only `role: 'host'` accounts are accepted — `user`-role logins are rejected)

## Project Structure

```
src/
  api/client.js               Fetch wrapper (attaches JWT, parses errors)
  context/AuthContext.jsx     Host-only JWT auth; enforces role === 'host'
  components/
    Header.jsx / .css         Sticky admin nav with NavLink tabs
    ListingForm.jsx / .css    Shared form for Create and Update (validated)
    ProtectedRoute.jsx        Redirects unauthenticated users to /login
  pages/
    Login.jsx / .css
    Listings.jsx / .css
    CreateListing.jsx
    UpdateListing.jsx
    Reservations.jsx / .css
  index.css                   Admin design tokens and button system
```

## ListingForm Fields

Title · Type · Location · Price/night · Bedrooms · Bathrooms · Guests  
Amenities (tag chips) · Image URLs (tag chips) · Weekly discount % · Cleaning fee  
Service fee · Occupancy taxes · Description

All fields are validated client-side before submitting; server-side Mongoose
validation provides a second layer of protection.

## Build & Deploy

```bash
npm run build   # output in dist/
```

Deployed as a Render Static Site: https://airbnb-clone-admin.onrender.com
(Build command `npm install && npm run build`, publish directory `dist`, with
a `/*` → `/index.html` rewrite rule for React Router. See
`../airbnb-clone-backend/README.md` for full deploy steps.)

Set `VITE_API_URL=https://airbnb-clone-backend-xmit.onrender.com/api`.
Make sure `CLIENT_ORIGINS` on the backend includes this admin domain.