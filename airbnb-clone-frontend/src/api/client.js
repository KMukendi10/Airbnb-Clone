const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// central fetch wrapper - attaches the JWT if present, throws on non-2xx
// so callers can just try/catch instead of checking res.ok everywhere
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
  // users
  login: (username, password) => request('/users/login', { method: 'POST', body: { username, password } }),
  register: (username, password, role) =>
    request('/users/register', { method: 'POST', body: { username, password, role } }),
  getCurrentUser: (token) => request('/users/me', { token }),

  // accommodations
  getAccommodations: (location) =>
    request(`/accommodations${location ? `?location=${encodeURIComponent(location)}` : ''}`),
  getAccommodation: (id) => request(`/accommodations/${id}`),

  // reservations
  createReservation: (payload, token) =>
    request('/reservations', { method: 'POST', body: payload, token }),
  getMyReservations: (token) => request('/reservations/user', { token }),
  cancelReservation: (id, token) => request(`/reservations/${id}`, { method: 'DELETE', token }),
};
