/**
 * Login / Sign-up page
 * Matches Airbnb's modal-style centered card with:
 *  - Mode toggle (Log in / Sign up)
 *  - Welcoming header with logo
 *  - Input fields with validation
 *  - Role selector for sign-up
 *  - Error feedback
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const ADMIN_URL = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5174';

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function toggleMode() {
    setMode((m) => (m === 'login' ? 'signup' : 'login'));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please enter your username.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        await api.register(username.trim(), password, role);
      }
      await login(username.trim(), password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      {/* Back to home */}
      <Link to="/" className="login-back" aria-label="Return to home">
        ← Back to home
      </Link>

      <div className="login-card">
        {/* Header */}
        <div className="login-card__header">
          {/* Airbnb logo mark */}
          <svg className="login-logo" viewBox="0 0 32 32" aria-hidden="true">
            <path
              d="M16 1C7.163 1 0 8.163 0 17c0 5.59 2.832 10.51 7.143 13.49L16 31l8.857-.51C29.168 27.51 32 22.59 32 17 32 8.163 24.837 1 16 1zm0 4c2.9 0 5.267 2.686 5.267 6S18.9 17 16 17s-5.267-2.686-5.267-6S13.1 5 16 5zm0 22.5c-3.77 0-7.13-1.72-9.37-4.42C8.2 20.42 11.9 19 16 19s7.8 1.42 9.37 3.08C23.13 25.78 19.77 27.5 16 27.5z"
              fill="currentColor"
            />
          </svg>
          <h1 className="login-title">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="login-subtitle">
            {mode === 'login'
              ? 'Log in to your Airbnb account'
              : 'Join Airbnb to start booking or hosting'}
          </p>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {/* Error banner */}
          {error && (
            <div className="login-error" role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          {/* Username */}
          <div className="login-field">
            <label className="login-label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="login-input"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
              required
            />
          </div>

          {/* Password */}
          <div className="login-field">
            <label className="login-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="login-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={6}
              required
            />
          </div>

          {/* Role selector – sign-up only */}
          {mode === 'signup' && (
            <div className="login-field">
              <label className="login-label" htmlFor="role">
                I want to
              </label>
              <div className="login-role-grid">
                <label
                  className={`login-role-option${role === 'user' ? ' login-role-option--active' : ''}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={role === 'user'}
                    onChange={() => setRole('user')}
                    className="sr-only"
                  />
                  <span className="login-role-icon" aria-hidden="true">🏠</span>
                  <span className="login-role-text">Book stays</span>
                </label>

                <label
                  className={`login-role-option${role === 'host' ? ' login-role-option--active' : ''}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="host"
                    checked={role === 'host'}
                    onChange={() => setRole('host')}
                    className="sr-only"
                  />
                  <span className="login-role-icon" aria-hidden="true">🔑</span>
                  <span className="login-role-text">Host my place</span>
                </label>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary login-submit"
            disabled={loading}
            aria-busy={loading}
          >
            {loading
              ? mode === 'login'
                ? 'Logging in…'
                : 'Creating account…'
              : mode === 'login'
              ? 'Log in'
              : 'Sign up'}
          </button>
        </form>

        {/* Host login */}
        <div className="login-switch-site">
          <p>Are you a host?</p>

          <a
            href={`${ADMIN_URL}/login`}
            className="login-host-link"
          >
            Log in as a host
          </a>
        </div>

        {/* Divider */}
        <div className="login-divider" aria-hidden="true">
          <span>or</span>
        </div>

        {/* Mode toggle */}
        <p className="login-toggle">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button type="button" className="login-toggle-btn" onClick={toggleMode}>
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
}
