/**
 * Admin Header – matches the Figma admin mock:
 *  - Plain top bar: Airbnb logo, username text, hamburger/avatar menu
 *  - A separate pill-button toolbar row underneath (View Reservations /
 *    View Listings / Create Listing), which pages can override via the
 *    `toolbar` prop (e.g. the create/edit form pages show just one
 *    "View my listings" pill).
 */

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

// Default toolbar shown on the Listings & Reservations pages
const DEFAULT_TOOLBAR = [
  { label: 'View Reservations', to: '/reservations' },
  { label: 'View Listings', to: '/' },
  { label: 'Create Listing', to: '/listings/new' },
];

export default function Header({ toolbar = DEFAULT_TOOLBAR }) {
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
      {/* ── Top bar: logo, username, hamburger/avatar ── */}
      <div className="container admin-header-inner">
        <Link to="/" className="admin-logo" aria-label="Admin dashboard home">
          <AirbnbMark />
          <span className="admin-logo-text">airbnb</span>
        </Link>

        {user && (
          <div className="admin-header-right">
            <span className="admin-username-plain">{user.username}</span>

            <div className="admin-profile" ref={dropdownRef}>
              <button
                className="admin-profile-btn"
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                aria-label="Open profile menu"
              >
                <svg className="admin-hamburger" viewBox="0 0 32 32" aria-hidden="true">
                  <rect x="6" y="10" width="20" height="2" rx="1" fill="currentColor" />
                  <rect x="6" y="15" width="20" height="2" rx="1" fill="currentColor" />
                  <rect x="6" y="20" width="20" height="2" rx="1" fill="currentColor" />
                </svg>
                <span className="admin-avatar" aria-hidden="true">
                  <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
                    <path
                      d="M16 .7C7.56.7.7 7.56.7 16S7.56 31.3 16 31.3 31.3 24.44 31.3 16 24.44.7 16 .7zm0 7a4.3 4.3 0 1 1 0 8.6 4.3 4.3 0 0 1 0-8.6zm0 22.4a14.3 14.3 0 0 1-10.86-5.01c.55-3.37 3.4-5.99 7.86-5.99h6c4.46 0 7.31 2.62 7.86 5.99A14.3 14.3 0 0 1 16 30.1z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
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
                    View Listings
                  </Link>

                  <Link
                    to="/reservations"
                    className="admin-dropdown-item"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                  >
                    View Reservations
                  </Link>

                  <Link
                    to="/listings/new"
                    className="admin-dropdown-item"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                  >
                    Create Listing
                  </Link>

                  <hr className="admin-dropdown-divider" />

                  <button
                    className="admin-dropdown-item admin-dropdown-item--danger"
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Pill toolbar row ── */}
      {user && toolbar?.length > 0 && (
        <div className="admin-toolbar">
          <div className="container admin-toolbar-inner">
            <span className="admin-toolbar-divider" aria-hidden="true" />
            {toolbar.map((item) => (
              <Link key={item.label} to={item.to} className="admin-toolbar-pill">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
