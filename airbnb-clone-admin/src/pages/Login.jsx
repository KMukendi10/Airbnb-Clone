import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-login-page">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <div className="admin-login-logo">airbnb</div>
        <h1>Login</h1>

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
            autoComplete="current-password"
          />
        </label>

        <a href="#forgot" className="admin-login-forgot">
          Forgot password?
        </a>

        {error && <p className="admin-login-error">{error}</p>}

        <button className="btn btn-primary admin-login-submit" type="submit" disabled={submitting}>
          {submitting ? 'Logging in…' : 'Login'}
        </button>

        <p className="admin-login-hint">Seeded host account: Jane Doe / password321</p>
      </form>
    </div>
  );
}
