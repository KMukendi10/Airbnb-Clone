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

### Prerequisites
- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed and logged in
- [Git](https://git-scm.com/) installed

### Backend deployment

```bash
# 1. Create the Heroku app (from the repo root or backend folder)
heroku create your-app-name-backend

# 2. Set all required environment variables
heroku config:set MONGO_URI="mongodb+srv://..." --app your-app-name-backend
heroku config:set JWT_SECRET="your-long-random-secret" --app your-app-name-backend
heroku config:set JWT_EXPIRES_IN="7d" --app your-app-name-backend
heroku config:set CLIENT_ORIGINS="https://your-frontend.herokuapp.com,https://your-admin.herokuapp.com" --app your-app-name-backend
heroku config:set NODE_ENV="production" --app your-app-name-backend

# 3. Deploy (from repo root, using a subtree push)
git subtree push --prefix airbnb-clone-backend heroku main

# 4. Confirm the API is live
curl https://your-app-name-backend.herokuapp.com/api/health
```

The `Procfile` in `airbnb-clone-backend/` tells Heroku to run `node server.js`.

### Frontend deployment (Airbnb Clone UI)

```bash
# 1. Create the Heroku app
heroku create your-app-name-frontend

# 2. Set the backend API URL
heroku config:set VITE_API_URL="https://your-app-name-backend.herokuapp.com/api" --app your-app-name-frontend

# 3. Add the Node.js buildpack
heroku buildpacks:set heroku/nodejs --app your-app-name-frontend

# 4. Deploy
git subtree push --prefix airbnb-clone-frontend heroku-frontend main
```

### Admin Dashboard deployment

```bash
# 1. Create the Heroku app
heroku create your-app-name-admin

# 2. Set the backend API URL
heroku config:set VITE_API_URL="https://your-app-name-backend.herokuapp.com/api" --app your-app-name-admin

# 3. Add the Node.js buildpack
heroku buildpacks:set heroku/nodejs --app your-app-name-admin

# 4. Deploy
git subtree push --prefix airbnb-clone-admin heroku-admin main
```

### Environment variable summary

| Variable | Used by | Description |
|---|---|---|
| `MONGO_URI` | Backend | MongoDB Atlas connection string |
| `JWT_SECRET` | Backend | Secret key for signing JWTs |
| `JWT_EXPIRES_IN` | Backend | Token lifetime (e.g. `7d`) |
| `PORT` | Backend | Port — set automatically by Heroku |
| `CLIENT_ORIGINS` | Backend | Comma-separated allowed frontend origins |
| `VITE_API_URL` | Frontend / Admin | Full URL of the backend API (no trailing slash) |

### Seeding the database after deploy

```bash
heroku run node seed/seed.js --app your-app-name-backend
```

This creates the sample users and listings. After seeding:
- **Host login:** `JaneDoe` / `password321`
- **Guest login:** `JohnDoe` / `password123`

### Verifying the deployment

```bash
# Health check
curl https://your-app-name-backend.herokuapp.com/api/health

# List accommodations
curl https://your-app-name-backend.herokuapp.com/api/accommodations
```

