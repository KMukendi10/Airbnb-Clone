/**
 * api/client.js – Admin Dashboard HTTP client
 *
 * All requests go through `request()` which attaches Auth headers,
 * parses JSON, and throws descriptive errors on non-2xx responses.
 *
 * Set VITE_API_URL in .env to point at the deployed backend.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * @param {string} path
 * @param {{ method?: string, body?: object, token?: string }} [options]
 * @returns {Promise<any>}
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
  // ── Auth ───────────────────────────────────────────────
  /** Returns { _id, username, role, token } */
  login: (username, password) =>
    request('/users/login', { method: 'POST', body: { username, password } }),

  /** Re-hydrates the session after a page refresh */
  getCurrentUser: (token) =>
    request('/users/me', { token }),

  // ── Listings ───────────────────────────────────────────
  /** Fetches only listings owned by this host */
  getMyListings: (hostId) =>
    request(`/accommodations?host=${hostId}`),

  /** Gets a single listing – used to prefill the Update form */
  getListing: (id) =>
    request(`/accommodations/${id}`),

  /** Creates a new listing (requires host token) */
  createListing: (payload, token) =>
    request('/accommodations', { method: 'POST', body: payload, token }),

  /** Updates an existing listing (must be the owner) */
  updateListing: (id, payload, token) =>
    request(`/accommodations/${id}`, { method: 'PUT', body: payload, token }),

  /** Deletes a listing (must be the owner) */
  deleteListing: (id, token) =>
    request(`/accommodations/${id}`, { method: 'DELETE', token }),

  // ── Reservations ───────────────────────────────────────
  /** Incoming reservations for all of this host's listings */
  getHostReservations: (token) =>
    request('/reservations/host', { token }),

  /** Cancels any reservation (host or original guest can cancel) */
  cancelReservation: (id, token) =>
    request(`/reservations/${id}`, { method: 'DELETE', token }),
};
