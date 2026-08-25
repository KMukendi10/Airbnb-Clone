/**
 * api/client.js
 *
 * Central HTTP client for the Airbnb Clone frontend.
 * All requests go through the `request()` wrapper which:
 *   - Attaches Content-Type: application/json
 *   - Attaches Authorization: Bearer <token> when a token is passed
 *   - Parses JSON responses
 *   - Throws a descriptive Error on non-2xx responses (using the
 *     server's `message` field from the JSON body when available)
 *
 * Set VITE_API_URL in .env to point at a deployed backend.
 * Falls back to http://localhost:5000/api for local development.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * @param {string} path - API path, e.g. '/accommodations' (must start with /)
 * @param {{ method?: string, body?: object, token?: string }} [options]
 * @returns {Promise<any>} Parsed JSON response body
 * @throws {Error} When the HTTP response is not 2xx
 */
async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }

  return data;
}

export const api = {
  // ── Users ──────────────────────────────────────────────
  /** Returns { _id, username, role, token } */
  login: (username, password) =>
    request('/users/login', { method: 'POST', body: { username, password } }),

  /** Returns { _id, username, role, token } */
  register: (username, password, role) =>
    request('/users/register', { method: 'POST', body: { username, password, role } }),

  /** Returns { _id, username, role } — used to re-hydrate session on page refresh */
  getCurrentUser: (token) =>
    request('/users/me', { token }),

  // ── Accommodations ─────────────────────────────────────
  /** Optionally filter by ?location= (case-insensitive) */
  getAccommodations: (location) =>
    request(`/accommodations${location ? `?location=${encodeURIComponent(location)}` : ''}`),

  /** Returns a single accommodation with host.username populated */
  getAccommodation: (id) =>
    request(`/accommodations/${id}`),

  // ── Reservations ───────────────────────────────────────
  /** payload: { accommodationId, checkIn, checkOut, guests } */
  createReservation: (payload, token) =>
    request('/reservations', { method: 'POST', body: payload, token }),

  /** Returns this user's bookings with accommodation populated */
  getMyReservations: (token) =>
    request('/reservations/user', { token }),

  /** Cancels (deletes) a reservation – user or host can cancel */
  cancelReservation: (id, token) =>
    request(`/reservations/${id}`, { method: 'DELETE', token }),
};
