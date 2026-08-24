import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please fill in both fields.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(username, password);
      } else {
        await api.register(username, password, role);
        await login(username, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header />
      <div className="login-page">
        <form className="login-card" onSubmit={handleSubmit}>
          <h1>{mode === 'login' ? 'Log in' : 'Sign up'}</h1>

          <label>
            Username
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </label>

          {mode === 'signup' && (
            <label>
              I want to
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="user">Book stays</option>
                <option value="host">Host my place</option>
              </select>
            </label>
          )}

          {error && <p className="login-error">{error}</p>}

          <button className="btn btn-primary login-submit" type="submit" disabled={submitting}>
            {submitting ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
          </button>

          <button
            type="button"
            className="login-toggle"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError('');
            }}
          >
            {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
}
