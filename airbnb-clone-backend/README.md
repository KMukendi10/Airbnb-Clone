# Airbnb Clone — Backend

Node.js / Express / MongoDB API for the Zaio Capstone Airbnb clone. Serves both the
public Airbnb Frontend and the Admin Dashboard.

## Tech stack
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication (`jsonwebtoken`, `bcryptjs`)
- Multer (ready for image upload — optional per brief)

## Project structure
```
controllers/      accommodationController.js, reservationController.js, userController.js
models/            Accommodation.js, Reservation.js, User.js
routes/            accommodationRoutes.js, reservationRoutes.js, userRoutes.js
middleware/        auth.js (JWT guard + role check), errorHandler.js
config/            db.js (Mongoose connection)
utils/             asyncHandler.js
seed/              seed.js (sample users + listings)
server.js
```

## Setup
1. `npm install`
2. Copy `.env.example` to `.env` and fill in:
   - `MONGO_URI` — your MongoDB Atlas connection string
   - `JWT_SECRET` — any long random string
   - `CLIENT_ORIGINS` — comma-separated frontend URLs allowed to call the API
3. `npm run seed` — creates three sample users and 20 sample listings
   - Host login: `Jane Doe` / `password321`
   - Guest login: `John Doe` / `password123`
4. `npm run dev` — starts on `http://localhost:5000` (or `npm start` without nodemon)

## API Reference

### Users — `/api/users`
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Create a new user (`username`, `email`, `password`, `role`) |
| POST | `/login` | Public | Returns `{ _id, username, email, role, token }` |
| GET | `/me` | Private | Returns the logged-in user (for session persistence on refresh) |

### Accommodations — `/api/accommodations`
| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/?location=&host=` | Public | List all, optionally filtered by location (Location page) or host id (admin "My Listings") |
| GET | `/:id` | Public | Single listing (Location Details page + admin prefill on Update) |
| POST | `/` | Private (host) | Create listing |
| PUT | `/:id` | Private (host, owner only) | Update listing |
| DELETE | `/:id` | Private (host, owner only) | Delete listing |

### Reservations — `/api/reservations`
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/` | Private | Create reservation. Body: `{ accommodationId, checkIn, checkOut, guests }`. Cost breakdown is calculated server-side from the listing's own fees — never trust a client-sent total. Returns `409` if the dates (or the 1-day cleaning buffer around them) are already held on that listing. |
| GET | `/host` | Private | Reservations for listings owned by the logged-in host |
| GET | `/user` | Private | Reservations made by the logged-in user |
| DELETE | `/:id` | Private (owner or host) | Cancel a reservation. Also releases its held dates on the listing. |

## Booking concurrency control

`Reservation.create` alone doesn't stop two guests from booking overlapping
dates at the same time — nothing was checking availability before insert.
Since MongoDB has no SQL-style row locks, `createReservation` instead does a
single atomic `findOneAndUpdate` on the `Accommodation` document: it checks
for an overlapping range in `accommodation.bookedDates` and pushes the new
range in one indivisible operation. MongoDB serializes writes to a single
document, so of two racing requests, only the one applied first can match
"no overlap" — the other gets `null` back and the route returns `409`.

Two extra details:
- `CLEANING_BUFFER_DAYS` (in `reservationController.js`, default `1`) widens
  the overlap check on both sides, so back-to-back same-day turnovers are
  blocked too.
- If `Reservation.create` fails *after* the date range is claimed, the claim
  is rolled back (`$pull` on `bookedDates`) so the hold doesn't get stuck.

Cancelling a reservation (`DELETE /api/reservations/:id`) pulls its entry out
of `bookedDates` again so the dates become bookable once more.

## Auth flow
Send the JWT from login/register as `Authorization: Bearer <token>` on any private route.
`protect` middleware verifies the token and attaches `req.user`. `authorize('host')`
further restricts a route to host-role accounts (e.g. creating a listing).

## Error handling
All controllers are wrapped in `asyncHandler` so thrown errors are forwarded to the
central `errorHandler` middleware, which returns a consistent
`{ success: false, message }` shape with the correct status code (400/401/403/404/500),
including handling for Mongoose CastError, ValidationError, and duplicate-key errors.

## Live deployment

- **Backend API:** https://airbnb-clone-backend-xmit.onrender.com
- **Frontend:** https://airbnb-clone-frontend-46hl.onrender.com
- **Admin:** https://airbnb-clone-admin.onrender.com

## Deploying to Render

All three apps are deployed as separate services on [Render](https://render.com).

### Backend (Web Service)

1. New → Web Service → connect the GitHub repo, set **Root Directory** to `airbnb-clone-backend`.
2. Build Command: `npm install`
   Start Command: `npm start`
3. Add environment variables under the service's **Environment** tab:
   - `MONGO_URI` — your MongoDB Atlas connection string
   - `JWT_SECRET` — any long random string
   - `JWT_EXPIRES_IN` — e.g. `7d`
   - `CLIENT_ORIGINS` — comma-separated frontend + admin URLs allowed to call the API, e.g.
     `https://airbnb-clone-frontend-46hl.onrender.com,https://airbnb-clone-admin.onrender.com`
   - `NODE_ENV` — `production`
4. Deploy. Render redeploys automatically on every push to the connected branch.
5. Confirm it's live: `curl https://airbnb-clone-backend-xmit.onrender.com/api/health`

Render's free tier spins the service down after inactivity, so the first
request after a while can be noticeably slower (cold start) — see
"Production Performance" in the root README.

### Frontend & Admin (Static Site)

For each (`airbnb-clone-frontend`, `airbnb-clone-admin`):

1. New → Static Site → connect the repo, set **Root Directory** to that app's folder.
2. Build Command: `npm install && npm run build`
   Publish Directory: `dist`
3. Add the environment variable:
   - `VITE_API_URL` — `https://airbnb-clone-backend-xmit.onrender.com/api`
4. Add a rewrite rule (`/*` → `/index.html`) so client-side routing (React Router) works on refresh/deep links.
5. Deploy.

### Environment variable summary

| Variable | Used by | Description |
|---|---|---|
| `MONGO_URI` | Backend | MongoDB Atlas connection string |
| `JWT_SECRET` | Backend | Secret key for signing JWTs |
| `JWT_EXPIRES_IN` | Backend | Token lifetime (e.g. `7d`) |
| `PORT` | Backend | Port — set automatically by Render |
| `CLIENT_ORIGINS` | Backend | Comma-separated allowed frontend/admin origins |
| `VITE_API_URL` | Frontend / Admin | Full URL of the backend API (no trailing slash) |

### Seeding the database after deploy

Run the seed script from a Render Shell on the backend service (Dashboard →
service → **Shell**):

```bash
node seed/seed.js
```

This creates the sample users and listings. After seeding:
- **Host login:** `jane@example.com` / `password321`
- **Guest login:** `john@example.com` / `password123`

### Verifying the deployment

```bash
# Health check
curl https://airbnb-clone-backend-xmit.onrender.com/api/health

# List accommodations
curl https://airbnb-clone-backend-xmit.onrender.com/api/accommodations
```