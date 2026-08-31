const express = require('express');
const cors = require('cors');
const path = require('path');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const userRoutes = require('./routes/userRoutes');
const accommodationRoutes = require('./routes/accommodationRoutes');
const reservationRoutes = require('./routes/reservationRoutes');

const app = express();

// --- Core middleware ---
app.use(express.json()); // parse JSON request bodies
app.use(express.urlencoded({ extended: true }));

// CORS: only allow the frontend origins listed in .env, comma-separated
const allowedOrigins = (process.env.CLIENT_ORIGINS || '').split(',').map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (Postman, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
  })
);

// --- Static files: images uploaded via the Create/Update Listing forms ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Health check (handy for confirming Heroku deploy is alive) ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    uptime: Math.round(process.uptime()),
  });
});

// --- Routes ---
app.use('/api/users', userRoutes);
app.use('/api/accommodations', accommodationRoutes);
app.use('/api/reservations', reservationRoutes);

// --- Error handling (must be registered last) ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
