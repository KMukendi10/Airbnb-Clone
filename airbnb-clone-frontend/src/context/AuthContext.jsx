/**
 * AuthContext.jsx
 *
 * Provides JWT-based authentication state for the entire app.
 *
 * Usage:
 *   const { user, token, loading, login, logout } = useAuth();
 *
 * State:
 *   token   — raw JWT string (or null)
 *   user    — { _id, username, role } (or null when logged out)
 *   loading — true while re-hydrating session from localStorage on first mount
 *
 * Persistence:
 *   Token is stored under the key 'token' in localStorage.
 *   On mount, if a token exists the user object is fetched from
 *   GET /api/users/me to validate it hasn't expired.
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

const STORAGE_KEY = 'token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [user, setUser]   = useState(null);
  const [loading, setLoading] = useState(true);

  // Re-hydrate the user object on every page refresh
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .getCurrentUser(token)
      .then((u) => setUser({ _id: u._id, username: u.username, role: u.role }))
      .catch(() => {
        // Token is invalid or expired — clear it silently
        localStorage.removeItem(STORAGE_KEY);
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  /**
   * Log in an existing user.
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{ _id: string, username: string, role: string }>}
   */
  async function login(username, password) {
    const data = await api.login(username, password);
    const loggedInUser = { _id: data._id, username: data.username, role: data.role };
    localStorage.setItem(STORAGE_KEY, data.token);
    setToken(data.token);
    setUser(loggedInUser);
    return loggedInUser;
  }

  /** Clear auth state and remove the stored token. */
  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/** @returns {{ token: string|null, user: object|null, loading: boolean, login: Function, logout: Function }} */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
