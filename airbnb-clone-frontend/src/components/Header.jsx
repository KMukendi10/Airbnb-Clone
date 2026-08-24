import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

export default function Header({ onFilter }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const navigate = useNavigate();

  function handleFilterSubmit(e) {
    e.preventDefault();
    if (onFilter) {
      onFilter(locationInput);
    } else {
      navigate(`/locations?location=${encodeURIComponent(locationInput)}`);
    }
  }

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate('/');
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="header-logo">
          airbnb
        </Link>

        <form className="header-filter" onSubmit={handleFilterSubmit}>
          <input
            type="text"
            placeholder="Search destinations"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            aria-label="Search destinations"
          />
          <button type="submit" className="header-filter-btn" aria-label="Search">
            🔍
          </button>
        </form>

        <div className="header-right">
          {!user && (
            <Link to="/login" className="header-host-link">
              Become a host
            </Link>
          )}

          <div className="header-profile">
            <button
              className="header-profile-btn"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-haspopup="true"
            >
              <span className="header-avatar">{user ? user.username[0].toUpperCase() : '☰'}</span>
              {user && <span className="header-greeting">Hi, {user.username}</span>}
            </button>

            {menuOpen && (
              <div className="header-dropdown">
                {user ? (
                  <>
                    <Link to="/reservations" onClick={() => setMenuOpen(false)}>
                      View reservations
                    </Link>
                    <button onClick={handleLogout}>Log out</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMenuOpen(false)}>
                      Log in
                    </Link>
                    <Link to="/login" onClick={() => setMenuOpen(false)}>
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
