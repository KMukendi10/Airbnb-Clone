/**
 * api/client.js – Admin Dashboard HTTP client
 *
 * All requests go through `request()` which attaches Auth headers,
 * parses JSON, and throws descriptive errors on non-2xx responses.
 *
 * Set VITE_API_URL in .env to point at the deployed backend.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// The backend serves uploaded photos as relative paths (e.g. "/uploads/167...jpg")
// from its own origin, not from the /api prefix. Strip "/api" off BASE_URL to get
// the origin, so <img> tags can resolve those paths regardless of environment.
const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, '');

/**
 * Resolves an accommodation image path to a fully-qualified URL.
 * - Absolute URLs (http/https), blob: previews, and data: URIs pass through unchanged.
 * - Relative paths returned by the backend (from a real file upload) are
 *   prefixed with the API's origin.
 */
export function resolveImageUrl(src) {
  if (!src) return src;
  if (/^(https?:|blob:|data:)/i.test(src)) return src;
  return `${API_ORIGIN}${src.startsWith('/') ? '' : '/'}${src}`;
}

/**
 * @param {string} path
 * @param {{ method?: string, body?: object|FormData, token?: string }} [options]
 * @returns {Promise<any>}
 */
async function request(path, { method = 'GET', body, token } = {}) {
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  const headers = {};
  // Let the browser set Content-Type (incl. multipart boundary) for FormData.
  if (!isFormData) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
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
