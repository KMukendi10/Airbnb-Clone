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
3. `npm run seed` — creates two sample users and two listings
   - Host login: `Jane Doe` / `password321`
   - Guest login: `John Doe` / `password123`
4. `npm run dev` — starts on `http://localhost:5000` (or `npm start` without nodemon)

## API Reference

### Users — `/api/users`
| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Create a new user (`username`, `password`, `role`) |
| POST | `/login` | Public | Returns `{ _id, username, role, token }` |
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
| POST | `/` | Private | Create reservation. Body: `{ accommodationId, checkIn, checkOut, guests }`. Cost breakdown is calculated server-side from the listing's own fees — never trust a client-sent total. |
| GET | `/host` | Private | Reservations for listings owned by the logged-in host |
| GET | `/user` | Private | Reservations made by the logged-in user |
| DELETE | `/:id` | Private (owner or host) | Cancel a reservation |

## Auth flow
Send the JWT from login/register as `Authorization: Bearer <token>` on any private route.
`protect` middleware verifies the token and attaches `req.user`. `authorize('host')`
further restricts a route to host-role accounts (e.g. creating a listing).

## Error handling
All controllers are wrapped in `asyncHandler` so thrown errors are forwarded to the
central `errorHandler` middleware, which returns a consistent
`{ success: false, message }` shape with the correct status code (400/401/403/404/500),
including handling for Mongoose CastError, ValidationError, and duplicate-key errors.

## Deploying to Heroku
1. `heroku create your-app-name`
2. Set config vars matching your `.env`: `heroku config:set MONGO_URI=... JWT_SECRET=... CLIENT_ORIGINS=...`
3. `git push heroku main`
4. Confirm it's alive: `GET https://your-app-name.herokuapp.com/api/health`
