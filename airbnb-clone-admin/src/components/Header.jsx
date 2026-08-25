/**
 * Admin Header – sticky top nav with:
 *  - Airbnb logo mark + "Admin" badge
 *  - Nav links with active underline indicator
 *  - Profile pill with avatar initial + username + dropdown
 */

import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

function AirbnbMark() {
  return (
    <svg viewBox="0 0 32 32" className="admin-logo-mark" aria-hidden="true">
      <path
        d="M16 1C7.163 1 0 8.163 0 17c0 5.59 2.832 10.51 7.143 13.49L16 31l8.857-.51C29.168 27.51 32 22.59 32 17 32 8.163 24.837 1 16 1zm0 4c2.9 0 5.267 2.686 5.267 6S18.9 17 16 17s-5.267-2.686-5.267-6S13.1 5 16 5zm0 22.5c-3.77 0-7.13-1.72-9.37-4.42C8.2 20.42 11.9 19 16 19s7.8 1.42 9.37 3.08C23.13 25.78 19.77 27.5 16 27.5z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function Header() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  /* Close dropdown on outside click */
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate('/login');
  }

  const initial = user?.username?.[0]?.toUpperCase() ?? '?';

  return (
    <header className="admin-header">
      <div className="container admin-header-inner">

        {/* ── Logo ── */}
        <Link to="/" className="admin-logo" aria-label="Admin dashboard home">
          <AirbnbMark />
          <span className="admin-logo-text">airbnb</span>
          <span className="admin-logo-badge">Admin</span>
        </Link>

        {/* ── Nav links (only when logged in) ── */}
        {user && (
          <nav className="admin-nav" aria-label="Admin navigation">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                'admin-nav-link' + (isActive ? ' admin-nav-link--active' : '')
              }
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor"/></svg>
              My Listings
            </NavLink>

            <NavLink
              to="/listings/new"
              className={({ isActive }) =>
                'admin-nav-link' + (isActive ? ' admin-nav-link--active' : '')
              }
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/></svg>
              Create Listing
            </NavLink>

            <NavLink
              to="/reservations"
              className={({ isActive }) =>
                'admin-nav-link' + (isActive ? ' admin-nav-link--active' : '')
              }
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" fill="currentColor"/></svg>
              Reservations
            </NavLink>
          </nav>
        )}

        {/* ── Profile pill ── */}
        {user && (
          <div className="admin-profile" ref={dropdownRef}>
            <button
              className="admin-profile-btn"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              aria-label="Open profile menu"
            >
              <span className="admin-avatar" aria-hidden="true">{initial}</span>
              <span className="admin-username">{user.username}</span>
              <svg
                className={`admin-chevron${menuOpen ? ' admin-chevron--open' : ''}`}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M7 10l5 5 5-5z" fill="currentColor" />
              </svg>
            </button>

            {menuOpen && (
              <div className="admin-dropdown" role="menu">
                <div className="admin-dropdown-user" role="none">
                  <span className="admin-dropdown-avatar" aria-hidden="true">{initial}</span>
                  <div>
                    <p className="admin-dropdown-name">{user.username}</p>
                    <p className="admin-dropdown-role">Host · Admin</p>
                  </div>
                </div>

                <hr className="admin-dropdown-divider" />

                <Link
                  to="/"
                  className="admin-dropdown-item"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor"/></svg>
                  My Listings
                </Link>

                <Link
                  to="/reservations"
                  className="admin-dropdown-item"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" fill="currentColor"/></svg>
                  View Reservations
                </Link>

                <hr className="admin-dropdown-divider" />

                <button
                  className="admin-dropdown-item admin-dropdown-item--danger"
                  role="menuitem"
                  onClick={handleLogout}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" fill="currentColor"/></svg>
                  Log out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
