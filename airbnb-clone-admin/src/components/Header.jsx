import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

export default function Header() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate('/login');
  }

  return (
    <header className="admin-header">
      <div className="container admin-header-inner">
        <Link to="/" className="admin-logo">
          airbnb
        </Link>

        {user && (
          <nav className="admin-nav">
            <NavLink to="/" end>
              My Listings
            </NavLink>
            <NavLink to="/listings/new">Create Listing</NavLink>
            <NavLink to="/reservations">Reservations</NavLink>
          </nav>
        )}

        {user && (
          <div className="admin-profile">
            <button
              className="admin-profile-btn"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-haspopup="true"
            >
              <span className="admin-avatar">{user.username[0].toUpperCase()}</span>
              <span className="admin-greeting">Hi, {user.username}</span>
            </button>

            {menuOpen && (
              <div className="admin-dropdown">
                <NavLink to="/reservations" onClick={() => setMenuOpen(false)}>
                  View reservations
                </NavLink>
                <button onClick={handleLogout}>Log out</button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
