import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('admin_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .getCurrentUser(token)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('admin_token');
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function login(username, password) {
    const data = await api.login(username, password);
    if (data.role !== 'host') {
      throw new Error('This account is not a host account. Log in with a host account to manage listings.');
    }
    const loggedInUser = { _id: data._id, username: data.username, role: data.role };
    localStorage.setItem('admin_token', data.token);
    setToken(data.token);
    setUser(loggedInUser);
    return loggedInUser;
  }

  function logout() {
    localStorage.removeItem('admin_token');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
