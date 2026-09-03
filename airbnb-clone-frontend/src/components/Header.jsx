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
      <path d="m15.9999986 1c1.5233269 0 2.8853262.63480054 3.8953593 1.81519027.3882762.45341363.68547.92629092 1.0843684 1.66682671.2077895.38580736.3771705.71048333.7298554 1.39396099 2.3978208 4.64232753 4.6209922 9.18314333 6.7016244 13.68538313.3594669.7766385.527891 1.1447222.7200167 1.5790784.1995583.4508363.3280074.7623354.4419855 1.0821517.3997766 1.1232419.5159428 2.1707386.3600275 3.2582239-.3240931 2.2557302-1.8367 4.1856521-3.95096 5.0409981-1.0254641.4151758-2.1422465.5625301-3.2696353.4321454-1.0267657-.118929-2.024688-.4558168-3.0351712-1.0229726-1.275365-.7159866-2.5350312-1.7827288-3.9051464-3.3033582l.2266757.2483722-.0856973.0946079c-1.145637 1.2281003-2.2190841 2.1368979-3.2968208 2.7889023l-.294092.1714995c-1.0104269.5671868-2.0081759.904038-3.03521001 1.0229618-1.12673901.1303811-2.24398199-.0169897-3.26921311-.4319769-2.11483177-.8556897-3.62749027-2.7857059-3.95111189-5.0412542-.1561593-1.0874722-.03988101-2.1352549.36013074-3.2579563.11409432-.3205601.24289579-.6332632.441636-1.0823287.01870988-.0422708.03714338-.0838012.05551118-.1250574l.11110373-.2479763c.13263376-.2941687.28269418-.6205865.52244291-1.1391507 2.09685793-4.5370071 4.31810871-9.0773027 6.63389165-13.56082146.3456232-.67003797.5228704-1.01175086.6839133-1.31498818l.0958986-.17964411.0487735-.090707c.3992391-.74059748.6959289-1.21278252 1.0833854-1.66583756 1.0105713-1.18121403 2.3727886-1.81627269 3.8964581-1.81627269zm0 2c-.9357093 0-1.7439367.37679147-2.376616 1.11630347-.2727479.31892556-.5058435.68989976-.8426534 1.31468985-.2066611.38352403-.3681548.69344615-.8119466 1.55379694-2.3026619 4.45811584-4.51106674 8.97215394-6.59567741 13.48266154-.33799415.7310639-.49440055 1.0730558-.67560657 1.4824502-.18028808.4073718-.29206578.6787447-.38641369.9438251-.29344585.823606-.37343524 1.5443898-.26452166 2.3028493.22246416 1.5505102 1.2666025 2.8827369 2.72167933 3.4714808.71257378.2884315 1.4926412.3913269 2.28896256.2991802.75498608-.0874224 1.50010934-.3389843 2.28616414-.7802234 1.0664463-.5987003 2.1638659-1.528022 3.3946495-2.893896l-.0050202.004882-.0460353-.0548826-.2509205-.3307798c-1.5986248-2.0506357-2.6945784-4.1266583-3.1953828-6.0163123l-.0869039-.3520744c-.2049003-.8980243-.2517696-1.7521883-.1293969-2.5444088.1129882-.7334321.3400138-1.3069957.7509809-1.9050448.9157202-1.332047 2.4906659-2.0765973 4.2246599-2.0765973 1.7345096 0 3.3089358.744586 4.2248369 2.0769638.4128117.600442.6794367 1.289915.7951886 2.0416792.1223241.793505.0752405 1.6482284-.1300758 2.5459202-.4596778 2.0107259-1.6826486 4.2124081-3.6358901 6.6190439l.006939-.0095071.2796231.3052286c1.0272775 1.102518 1.962231 1.8954979 2.8691353 2.4456635l.2466904.1440751c.7861051.4412186 1.531452.6928397 2.2861387.7802541.7968821.092161 1.5764803-.0107034 2.2893816-.299333 1.4546269-.5884846 2.4987869-1.9207192 2.7215543-3.4712094.1087392-.7584391.0287937-1.4793254-.2643894-2.3030746-.0939834-.2637121-.2055521-.5342749-.3868628-.9438867-.1861479-.4208417-.3513275-.7818347-.7063238-1.5488147-2.0684794-4.4759421-4.278793-8.9904961-6.6635078-13.60744971-.3475016-.67343258-.5131893-.99102902-.7135357-1.36301664-.3362982-.62432153-.5695057-.99538752-.8429089-1.31465716-.6324887-.73916697-1.4405312-1.11577939-2.375995-1.11577939zm.0000014 11.0179c-1.1044517 0-2.053392.4486084-2.5764348 1.2094494-.2403158.3497133-.355268.6401316-.422586 1.077108-.0817116.5289876-.048657 1.1313887.1026199 1.7943953.3578904 1.5670844 1.2547805 3.372518 2.6201179 5.2039558l.2762816.3631915.2705252-.3490551c1.3488597-1.7753983 2.2168226-3.3824571 2.5996521-4.7994463l.0700962-.2808572c.151582-.6627525.1847858-1.2655119.1030752-1.795561-.0708345-.4600426-.2276978-.8656798-.4666206-1.2131972-.5234347-.7614499-1.4718578-1.2099832-2.5767267-1.2099832z" fill="currentColor" />
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

export default function Header({ onFilter, transparent = false, defaultLocation = '' }) {
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
  const [locationInput, setLocationInput] = useState(defaultLocation);
  const [datesOpen, setDatesOpen] = useState(false);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const datesRef = useRef(null);
  const guestsRef = useRef(null);
  const compactSearchRef = useRef(null);

  // Collapsed "Start your search" pill vs. expanded segmented pill —
  // starts collapsed unless the page already has an active location/date/guest filter
  const [searchExpanded, setSearchExpanded] = useState(
    Boolean(defaultLocation)
  );

  // Today string for date min
  const today = new Date().toISOString().split('T')[0];

  // Keep the compact search location in sync with the page's active filter
  useEffect(() => {
    setLocationInput(defaultLocation);
  }, [defaultLocation]);

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

  // Close compact dates / guests popovers on outside click
  useEffect(() => {
    function handleOutside(e) {
      if (datesRef.current && !datesRef.current.contains(e.target)) setDatesOpen(false);
      if (guestsRef.current && !guestsRef.current.contains(e.target)) setGuestsOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Collapse the compact search back down to the plain "Start your search"
  // pill when clicking away with nothing entered (matches Figma default state)
  useEffect(() => {
    function handleOutside(e) {
      if (compactSearchRef.current && !compactSearchRef.current.contains(e.target)) {
        if (!locationInput && !checkIn && !checkOut && guests === 1) {
          setSearchExpanded(false);
        }
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [locationInput, checkIn, checkOut, guests]);

  // Format a yyyy-mm-dd string as "Feb 19"
  function formatShortDate(value) {
    if (!value) return '';
    const d = new Date(`${value}T00:00:00`);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  // Build the compact "Feb 19-26" style label for the dates segment
  const datesLabel = (() => {
    if (!checkIn && !checkOut) return 'Add dates';
    if (checkIn && !checkOut) return `${formatShortDate(checkIn)} –`;
    const inD = new Date(`${checkIn}T00:00:00`);
    const outD = new Date(`${checkOut}T00:00:00`);
    const sameMonth = inD.getMonth() === outD.getMonth();
    return sameMonth
      ? `${formatShortDate(checkIn)}-${outD.getDate()}`
      : `${formatShortDate(checkIn)} – ${formatShortDate(checkOut)}`;
  })();

  const guestsLabel = `${guests} guest${guests !== 1 ? 's' : ''}`;

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
        ) : !searchExpanded ? (
          /* ── Collapsed pill: matches the Figma "Start your search" default state ── */
          <div className="header-search" ref={compactSearchRef}>
            <button
              type="button"
              className="search-pill search-pill--collapsed"
              onClick={() => {
                setSearchExpanded(true);
                requestAnimationFrame(() => document.getElementById('header-search-input')?.focus());
              }}
            >
              <span className="search-pill--collapsed-label">Start your search</span>
              <span className="search-btn" aria-hidden="true">
                <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
                  <path d="M13 24a11 11 0 1 1 0-22 11 11 0 0 1 0 22zm16.293 3.293-5.647-5.647a13 13 0 1 0-1.414 1.414l5.647 5.647a1 1 0 0 0 1.414-1.414z" fill="currentColor" />
                </svg>
              </span>
            </button>
          </div>
        ) : (
          <form className="header-search" onSubmit={handleCompactSearch} role="search" ref={compactSearchRef}>
            <div className="search-pill search-pill--summary">
              {/* WHERE — plain-text destination segment */}
              <button
                type="button"
                className="search-seg search-seg--location"
                onClick={() => document.getElementById('header-search-input')?.focus()}
              >
                <input
                  id="header-search-input"
                  type="text"
                  placeholder="Anywhere"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="search-seg-input"
                  aria-label="Search destinations"
                />
              </button>

              <span className="search-divider" aria-hidden="true" />

              {/* DATES — merged check-in / check-out summary */}
              <div className="search-seg search-seg--dates" ref={datesRef}>
                <button
                  type="button"
                  className="search-seg-btn"
                  onClick={() => { setDatesOpen((o) => !o); setGuestsOpen(false); }}
                  aria-expanded={datesOpen}
                  aria-haspopup="dialog"
                >
                  {datesLabel}
                </button>
                {datesOpen && (
                  <div className="search-popover search-popover--dates" role="dialog" aria-label="Select dates">
                    <label className="search-popover-field">
                      <span>Check in</span>
                      <input
                        type="date"
                        value={checkIn}
                        min={today}
                        onChange={(e) => { setCheckIn(e.target.value); if (checkOut && e.target.value >= checkOut) setCheckOut(''); }}
                      />
                    </label>
                    <label className="search-popover-field">
                      <span>Check out</span>
                      <input
                        type="date"
                        value={checkOut}
                        min={checkIn || today}
                        onChange={(e) => setCheckOut(e.target.value)}
                      />
                    </label>
                  </div>
                )}
              </div>

              <span className="search-divider" aria-hidden="true" />

              {/* GUESTS — plain-text summary with stepper popover */}
              <div className="search-seg search-seg--guests" ref={guestsRef}>
                <button
                  type="button"
                  className="search-seg-btn"
                  onClick={() => { setGuestsOpen((o) => !o); setDatesOpen(false); }}
                  aria-expanded={guestsOpen}
                  aria-haspopup="dialog"
                >
                  {guestsLabel}
                </button>
                {guestsOpen && (
                  <div className="search-popover search-popover--guests" role="dialog" aria-label="Select number of guests">
                    <span className="search-popover-label">Guests</span>
                    <div className="hero-guest-counter">
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
                )}
              </div>

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
