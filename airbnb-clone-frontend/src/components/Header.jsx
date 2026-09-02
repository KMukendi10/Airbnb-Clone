/**
 * Header.jsx
 *
 * Two-mode header matching the Airbnb Figma design:
 *
 * HERO mode (home page, `transparent` prop):
 *   - Sits on top of the hero image with a transparent/dark background
 *   - Row 1: logo | nav tabs (Places to stay / Experiences / Online Experiences) | Become a host + profile
 *   - Row 2: Search pill with Where (hotel dropdown) | Check in | Check out | Guests | Search btn
 *
 * STANDARD mode (all other pages):
 *   - White background with border-bottom
 *   - Single row: logo | compact search pill | profile
 */

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

// ── Airbnb logo SVG ──────────────────────────────────────────
function AirbnbLogo({ white }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className="header-logo-svg"
      aria-hidden="true"
      style={{ color: white ? '#fff' : 'var(--color-primary)' }}
    >
      <path
        d="M16 1C7.163 1 0 8.163 0 17c0 5.59 2.832 10.51 7.143 13.49L16 31l8.857-.51C29.168 27.51 32 22.59 32 17 32 8.163 24.837 1 16 1zm0 4c2.9 0 5.267 2.686 5.267 6S18.9 17 16 17s-5.267-2.686-5.267-6S13.1 5 16 5zm0 22.5c-3.77 0-7.13-1.72-9.37-4.42C8.2 20.42 11.9 19 16 19s7.8 1.42 9.37 3.08C23.13 25.78 19.77 27.5 16 27.5z"
        fill="currentColor"
      />
    </svg>
  );
}

// ── Hotel type options for the "Where" dropdown ──────────────
const HOTEL_TYPES = [
  { value: '', label: 'Anywhere' },
  { value: 'New York', label: 'New York' },
  { value: 'Cape Town', label: 'Cape Town' },
  { value: 'Johannesburg', label: 'Johannesburg' },
  { value: 'Stellenbosch', label: 'Stellenbosch' },
  { value: 'Durban', label: 'Durban' },
];

const NAV_TABS = ['Places to stay', 'Experiences', 'Online Experiences'];

export default function Header({ onFilter, transparent = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Profile dropdown
  const [menuOpen, setMenuOpen] = useState(false);

  // Hero search state
  const [activeTab, setActiveTab] = useState('Places to stay');
  const [whereOpen, setWhereOpen] = useState(false);
  const [whereValue, setWhereValue] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const whereRef = useRef(null);

  // Compact search (standard header)
  const [locationInput, setLocationInput] = useState('');

  // Today string for date min
  const today = new Date().toISOString().split('T')[0];

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Close where dropdown on outside click
  useEffect(() => {
    function handleOutside(e) {
      if (whereRef.current && !whereRef.current.contains(e.target)) {
        setWhereOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  function handleHeroSearch(e) {
    e.preventDefault();
    const loc = whereValue || locationInput;
    if (onFilter && loc) {
      onFilter(loc);
    } else {
      navigate(`/locations${loc ? `?location=${encodeURIComponent(loc)}` : ''}`);
    }
  }

  function handleCompactSearch(e) {
    e.preventDefault();
    navigate(`/locations${locationInput ? `?location=${encodeURIComponent(locationInput)}` : ''}`);
  }

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate('/');
  }

  const initials = user ? user.username[0].toUpperCase() : null;
  const isWhite = transparent;

  return (
    <header className={`site-header${transparent ? ' site-header--transparent' : ''}`}>
      <div className="header-inner">

        {/* ── Logo ── */}
        <Link to="/" className="header-logo" aria-label="Airbnb home">
          <AirbnbLogo white={isWhite} />
          <span className="header-logo-text" style={{ color: isWhite ? '#fff' : 'var(--color-primary)' }}>
            airbnb
          </span>
        </Link>

        {/* ── Centre: nav tabs (transparent) OR compact search (standard) ── */}
        {transparent ? (
          <nav className="header-nav-tabs" aria-label="Main navigation">
            {NAV_TABS.map((tab) => (
              <button
                key={tab}
                className={`header-nav-tab${activeTab === tab ? ' header-nav-tab--active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>
        ) : (
          <form className="header-search" onSubmit={handleCompactSearch} role="search">
            <div className="search-pill">
              <button
                type="button"
                className="search-segment search-segment--location"
                onClick={() => document.getElementById('header-search-input')?.focus()}
              >
                <span className="search-label">Where</span>
                <input
                  id="header-search-input"
                  type="text"
                  placeholder="Search destinations"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="search-input"
                  aria-label="Search destinations"
                />
              </button>
              <span className="search-divider" aria-hidden="true" />
              <button type="button" className="search-segment search-segment--date">
                <span className="search-label">Check in</span>
                <input
                  type="date"
                  className="search-input"
                  value={checkIn}
                  min={today}
                  onChange={(e) => { setCheckIn(e.target.value); if (checkOut && e.target.value >= checkOut) setCheckOut(''); }}
                  aria-label="Check-in date"
                />
              </button>
              <span className="search-divider" aria-hidden="true" />
              <button type="button" className="search-segment search-segment--date">
                <span className="search-label">Check out</span>
                <input
                  type="date"
                  className="search-input"
                  value={checkOut}
                  min={checkIn || today}
                  onChange={(e) => setCheckOut(e.target.value)}
                  aria-label="Check-out date"
                />
              </button>
              <span className="search-divider" aria-hidden="true" />
              <button type="button" className="search-segment search-segment--guests">
                <span className="search-label">Guests</span>
                <span className="search-value">{guests > 0 ? `${guests} guest${guests > 1 ? 's' : ''}` : 'Add guests'}</span>
              </button>
              <button type="submit" className="search-btn" aria-label="Search">
                <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
                  <path d="M13 24a11 11 0 1 1 0-22 11 11 0 0 1 0 22zm16.293 3.293-5.647-5.647a13 13 0 1 0-1.414 1.414l5.647 5.647a1 1 0 0 0 1.414-1.414z" fill="currentColor" />
                </svg>
              </button>
            </div>
          </form>
        )}

        {/* ── Right: Become a host + profile ── */}
        <nav className="header-right" aria-label="User navigation">
          {!user && (
            <Link
              to="/login"
              className={`header-host-link${isWhite ? ' header-host-link--white' : ''}`}
            >
              Become a host
            </Link>
          )}
          {user && (
            <span className={`header-welcome${isWhite ? ' header-welcome--white' : ''}`}>
              Hi, {user.username}
            </span>
          )}

          <button
            className={`header-globe${isWhite ? ' header-globe--white' : ''}`}
            aria-label="Language"
            title="Language"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM1.8 8.4A6.3 6.3 0 0 0 7 9.9v.6a5.3 5.3 0 0 1-5.2-2.1zm.4-1.1C3 5.5 5 4.2 7 4v1.7A7.7 7.7 0 0 1 2.2 7.3zm5.6 7.9A6.3 6.3 0 0 1 1.7 9.6h.1c.5.5 1.2.9 2 1.1v.5a1 1 0 0 0 1 1h2.6a1 1 0 0 0 .4-.1zM9 14.1V13a1 1 0 0 0-1-1H6.5v-.5c1-.2 1.8-.7 2.5-1.4V14l-.1.1zM9 7.3V4c2 .2 4 1.5 4.8 3.3A7.7 7.7 0 0 1 9 7.3zm0 1a7.7 7.7 0 0 0 4.8.2A6.3 6.3 0 0 1 9 9.9v-.6z" fill="currentColor" />
            </svg>
          </button>

          <div className="header-profile" ref={dropdownRef}>
            <button
              className={`header-profile-btn${isWhite ? ' header-profile-btn--white' : ''}`}
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              aria-label="Open user menu"
            >
              <svg className="header-hamburger" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
                <rect x="6" y="10" width="20" height="2" rx="1" fill="currentColor" />
                <rect x="6" y="15" width="20" height="2" rx="1" fill="currentColor" />
                <rect x="6" y="20" width="20" height="2" rx="1" fill="currentColor" />
              </svg>
              <span className="header-avatar" aria-hidden="true">
                {initials ?? (
                  <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
                    <path d="M16 .7C7.56.7.7 7.56.7 16S7.56 31.3 16 31.3 31.3 24.44 31.3 16 24.44.7 16 .7zm0 7a4.3 4.3 0 1 1 0 8.6 4.3 4.3 0 0 1 0-8.6zm0 22.4a14.3 14.3 0 0 1-10.86-5.01c.55-3.37 3.4-5.99 7.86-5.99h6c4.46 0 7.31 2.62 7.86 5.99A14.3 14.3 0 0 1 16 30.1z" fill="currentColor" />
                  </svg>
                )}
              </span>
            </button>

            {menuOpen && (
              <div className="header-dropdown" role="menu">
                {user ? (
                  <>
                    <span className="dropdown-user-info" role="none">
                      Signed in as <strong>{user.username}</strong>
                    </span>
                    <hr className="dropdown-divider" />
                    <Link to="/reservations" className="dropdown-item" role="menuitem" onClick={() => setMenuOpen(false)}>
                      View reservations
                    </Link>
                    <button className="dropdown-item" role="menuitem" onClick={handleLogout}>
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="dropdown-item dropdown-item--bold" role="menuitem" onClick={() => setMenuOpen(false)}>Log in</Link>
                    <Link to="/login" className="dropdown-item" role="menuitem" onClick={() => setMenuOpen(false)}>Sign up</Link>
                    <hr className="dropdown-divider" />
                    <Link to="/login" className="dropdown-item" role="menuitem" onClick={() => setMenuOpen(false)}>Airbnb your home</Link>
                    <Link to="/login" className="dropdown-item" role="menuitem" onClick={() => setMenuOpen(false)}>Help Centre</Link>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* ── Hero search bar (transparent mode only) ── */}
      {transparent && (
        <div className="header-hero-search-wrap">
          <form className="header-hero-search" onSubmit={handleHeroSearch} role="search" aria-label="Search accommodations">
            <div className="hero-search-pill">

              {/* WHERE — dropdown */}
              <div className="hero-segment hero-segment--where" ref={whereRef}>
                <button
                  type="button"
                  className="hero-segment-btn"
                  onClick={() => setWhereOpen((o) => !o)}
                  aria-expanded={whereOpen}
                  aria-haspopup="listbox"
                >
                  <span className="hero-segment-label">Where</span>
                  <span className="hero-segment-value">
                    {HOTEL_TYPES.find((t) => t.value === whereValue)?.label || 'Search destinations'}
                  </span>
                </button>
                {whereOpen && (
                  <ul className="hero-where-dropdown" role="listbox" aria-label="Destination options">
                    {HOTEL_TYPES.map((opt) => (
                      <li
                        key={opt.value}
                        role="option"
                        aria-selected={whereValue === opt.value}
                        className={`hero-where-option${whereValue === opt.value ? ' hero-where-option--active' : ''}`}
                        onClick={() => { setWhereValue(opt.value); setWhereOpen(false); }}
                        onKeyDown={(e) => e.key === 'Enter' && (setWhereValue(opt.value), setWhereOpen(false))}
                        tabIndex={0}
                      >
                        <span className="hero-where-icon" aria-hidden="true">📍</span>
                        {opt.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <span className="hero-divider" aria-hidden="true" />

              {/* CHECK IN */}
              <div className="hero-segment hero-segment--date">
                <label className="hero-segment-label" htmlFor="hero-checkin">Check in</label>
                <input
                  id="hero-checkin"
                  type="date"
                  className="hero-segment-input"
                  value={checkIn}
                  min={today}
                  onChange={(e) => {
                    setCheckIn(e.target.value);
                    if (checkOut && e.target.value >= checkOut) setCheckOut('');
                  }}
                  aria-label="Check-in date"
                />
              </div>

              <span className="hero-divider" aria-hidden="true" />

              {/* CHECK OUT */}
              <div className="hero-segment hero-segment--date">
                <label className="hero-segment-label" htmlFor="hero-checkout">Check out</label>
                <input
                  id="hero-checkout"
                  type="date"
                  className="hero-segment-input"
                  value={checkOut}
                  min={checkIn || today}
                  onChange={(e) => setCheckOut(e.target.value)}
                  aria-label="Check-out date"
                />
              </div>

              <span className="hero-divider" aria-hidden="true" />

              {/* GUESTS */}
              <div className="hero-segment hero-segment--guests">
                <span className="hero-segment-label">Add guests</span>
                <div className="hero-guest-counter" role="group" aria-label="Number of guests">
                  <button
                    type="button"
                    className="hero-guest-btn"
                    onClick={() => setGuests((g) => Math.max(1, g - 1))}
                    aria-label="Remove guest"
                    disabled={guests <= 1}
                  >−</button>
                  <span className="hero-guest-count" aria-live="polite">{guests}</span>
                  <button
                    type="button"
                    className="hero-guest-btn"
                    onClick={() => setGuests((g) => Math.min(16, g + 1))}
                    aria-label="Add guest"
                    disabled={guests >= 16}
                  >+</button>
                </div>
              </div>

              {/* SEARCH BUTTON */}
              <button type="submit" className="hero-search-btn" aria-label="Search">
                <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
                  <path d="M13 24a11 11 0 1 1 0-22 11 11 0 0 1 0 22zm16.293 3.293-5.647-5.647a13 13 0 1 0-1.414 1.414l5.647 5.647a1 1 0 0 0 1.414-1.414z" fill="currentColor" />
                </svg>
                <span>Search</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </header>
  );
}
