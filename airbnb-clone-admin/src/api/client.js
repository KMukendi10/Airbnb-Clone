const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  // auth
  login: (username, password) => request('/users/login', { method: 'POST', body: { username, password } }),
  getCurrentUser: (token) => request('/users/me', { token }),

  // listings - host owns these, host param filters "my listings"
  getMyListings: (hostId) => request(`/accommodations?host=${hostId}`),
  getListing: (id) => request(`/accommodations/${id}`),
  createListing: (payload, token) =>
    request('/accommodations', { method: 'POST', body: payload, token }),
  updateListing: (id, payload, token) =>
    request(`/accommodations/${id}`, { method: 'PUT', body: payload, token }),
  deleteListing: (id, token) => request(`/accommodations/${id}`, { method: 'DELETE', token }),

  // reservations against this host's listings
  getHostReservations: (token) => request('/reservations/host', { token }),
  cancelReservation: (id, token) => request(`/reservations/${id}`, { method: 'DELETE', token }),
};
