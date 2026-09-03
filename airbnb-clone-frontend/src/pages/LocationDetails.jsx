/**
 * LocationDetails page – single listing view, matching the Figma mock:
 *  - Heading (title, rating/reviews/location) + Share/Save
 *  - Photo gallery + "Show all photos" lightbox
 *  - Host intro row + highlights + description
 *  - Where you'll sleep (photo card)
 *  - What this place offers (amenities, with a "show all" toggle)
 *  - Interactive 2-month date-range calendar ("X nights in Y")
 *  - Reviews (rating bars + review cards grid)
 *  - Host card (avatar, stats, Contact Host)
 *  - Things to know
 *  - Explore other options / Unique stays + breadcrumb
 *  - Right sticky sidebar: price calculator with full breakdown
 */

import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import './LocationDetails.css';

// ── Amenity icons (simple emoji fallback map) ──────────────
const AMENITY_ICONS = {
  wifi: '📶',
  pool: '🏊',
  kitchen: '🍳',
  parking: '🅿️',
  gym: '🏋️',
  tv: '📺',
  washer: '🧺',
  dryer: '🌬️',
  heating: '🔥',
  'air conditioning': '❄️',
  default: '✓',
};

function amenityIcon(name = '') {
  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(AMENITY_ICONS)) {
    if (key.includes(k)) return v;
  }
  return AMENITY_ICONS.default;
}

// ── Superhost badge icon (ribbon/medal) ────────────────────
function SuperhostBadge() {
  return (
    <svg viewBox="0 0 32 40" className="superhost-badge__icon" aria-hidden="true">
      <path d="M16 0 30 6v10c0 8-6 14-14 16C8 30 2 24 2 16V6L16 0z" fill="#E31C5F" />
      <path d="M16 0 30 6v10c0 8-6 14-14 16V0z" fill="#FF385C" />
      <path d="M16 6l2.5 5.1 5.6.8-4 3.9.9 5.6L16 18.7l-5 2.7.9-5.6-4-3.9 5.6-.8L16 6z" fill="#FFC107" />
      <path d="M12 30l4 8 4-8-4-2-4 2z" fill="#FFC107" />
      <circle cx="16" cy="34" r="3" fill="#FF385C" />
    </svg>
  );
}

// ── Sample guest reviews (illustrative — the backend only
//    stores aggregate rating/review counts, not full comments) ──
const SAMPLE_REVIEWS = [
  { name: 'Jose', date: 'December 2021', comment: 'Host was very attentive.' },
  { name: 'Luke', date: 'December 2021', comment: 'Nice place to stay!' },
  {
    name: 'Shayna',
    date: 'December 2021',
    comment:
      'Wonderful neighborhood, easy access to restaurants and the subway, cozy studio apartment with a super comfortable bed. Great host, super helpful and responsive. Cool murphy bed…',
  },
  {
    name: 'Josh',
    date: 'November 2021',
    comment: 'Well designed and fun space, neighborhood has lots of energy and amenities.',
  },
  {
    name: 'Vladko',
    date: 'November 2020',
    comment:
      'This is amazing place. It has everything one needs for a monthly business stay. Very clean and organized place. Amazing hospitality affordable price.',
  },
  {
    name: 'Jennifer',
    date: 'January 2022',
    comment:
      'A centric place, near of a sub station and a supermarket with everything you need…',
  },
];

// ── Nearby destinations (Explore other options) — matches the
//    cities already seeded in this app rather than fictional ones ──
const EXPLORE_CITIES = [
  'Cape Town', 'Johannesburg', 'Durban', 'Pretoria',
  'Port Elizabeth', 'Stellenbosch', 'Knysna', 'Bloemfontein',
];

const UNIQUE_STAYS = [
  'Beach House Rentals', 'Camper Rentals', 'Glamping Rentals', 'Treehouse Rentals',
  'Cabin Rentals', 'Tiny House Rentals', 'Lakehouse Rentals', 'Mountain Chalet Rentals',
];

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/** Calculate nights between two ISO date strings */
function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const ms = new Date(checkOut) - new Date(checkIn);
  const nights = Math.round(ms / (1000 * 60 * 60 * 24));
  return nights > 0 ? nights : 0;
}

/** Format number as currency string */
function fmt(n) {
  return Number(n || 0).toLocaleString('en-ZA');
}

/** yyyy-mm-dd for a Date, in local time (avoids UTC off-by-one) */
function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Build a 6-row calendar grid (Sun-start) of Date|null for a given month */
function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const startOffset = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function formatLongDate(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Placeholder image ──────────────────────────────────────
const PLACEHOLDER = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80';

export default function LocationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Reservation form state
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [reserving, setReserving] = useState(false);
  const [reserveMessage, setReserveMessage] = useState('');
  const [reserveSuccess, setReserveSuccess] = useState(false);

  // Section toggles
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  // Calendar — first of the two displayed months
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Fetch listing on mount
  useEffect(() => {
    setLoading(true);
    api
      .getAccommodation(id)
      .then(setListing)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Today's date string for min date on inputs
  const today = new Date().toISOString().split('T')[0];

  // Dynamic cost breakdown
  const costBreakdown = useMemo(() => {
    if (!listing) return null;
    const nights = nightsBetween(checkIn, checkOut);
    const subtotal = nights * (listing.price || 0);
    const weeklyDiscountAmount =
      nights >= 7 ? Math.round((subtotal * (listing.weeklyDiscount || 0)) / 100) : 0;
    const cleaningFee = listing.cleaningFee || 0;
    const serviceFee = listing.serviceFee || 0;
    const occupancyTaxes = listing.occupancyTaxes || 0;
    const total =
      subtotal - weeklyDiscountAmount + cleaningFee + serviceFee + occupancyTaxes;

    return {
      nights,
      subtotal,
      weeklyDiscountAmount,
      cleaningFee,
      serviceFee,
      occupancyTaxes,
      total,
    };
  }, [listing, checkIn, checkOut]);

  // Reserve handler
  async function handleReserve() {
    setReserveMessage('');
    setReserveSuccess(false);

    if (!user) {
      navigate('/login');
      return;
    }
    if (!checkIn || !checkOut || costBreakdown.nights <= 0) {
      setReserveMessage('Please pick valid check-in and check-out dates first.');
      return;
    }

    setReserving(true);
    try {
      await api.createReservation(
        {
          accommodationId: listing._id,
          checkIn,
          checkOut,
          guests,
        },
        token
      );
      setReserveSuccess(true);
      setReserveMessage(
        'Reservation confirmed! View it in your profile → "View reservations".'
      );
    } catch (err) {
      setReserveMessage(err.message);
    } finally {
      setReserving(false);
    }
  }

  // Share handler — copies the current URL to the clipboard
  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard not available — silently ignore */
    }
  }

  // Calendar day click — first click sets check-in, second sets check-out
  function handleDayClick(date) {
    if (!date) return;
    const iso = toISODate(date);
    if (iso < today) return;

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(iso);
      setCheckOut('');
    } else if (iso <= checkIn) {
      setCheckIn(iso);
      setCheckOut('');
    } else {
      setCheckOut(iso);
    }
  }

  function clearDates() {
    setCheckIn('');
    setCheckOut('');
  }

  // ── Loading & Error states ──
  if (loading) {
    return (
      <>
        <Header />
        <div className="details-status container" aria-live="polite">
          <div className="spinner" aria-hidden="true" />
          <p>Loading listing…</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !listing) {
    return (
      <>
        <Header />
        <div className="details-status details-status--error container" role="alert">
          <p>{error || 'Listing not found.'}</p>
          <button className="btn btn-outline" onClick={() => navigate(-1)}>
            ← Go back
          </button>
        </div>
        <Footer />
      </>
    );
  }

  // Build gallery images
  const images = listing.images?.length ? listing.images : [PLACEHOLDER];
  const [mainImage, ...restImages] = images;

  const visibleAmenities = showAllAmenities
    ? listing.amenities || []
    : (listing.amenities || []).slice(0, 6);

  const visibleReviews = showAllReviews ? SAMPLE_REVIEWS : SAMPLE_REVIEWS.slice(0, 6);

  const hostJoined = listing.host?.createdAt
    ? new Date(listing.host.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  // Calendar: two consecutive months
  const monthA = calendarMonth;
  const monthB = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1);
  const calendarNights = nightsBetween(checkIn, checkOut);

  function renderMonth(monthDate) {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const cells = buildMonthGrid(year, month);
    const label = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
      <div className="cal-month" key={label}>
        <p className="cal-month__label">{label}</p>
        <div className="cal-weekdays">
          {WEEKDAY_LABELS.map((w) => (
            <span key={w} className="cal-weekday">{w}</span>
          ))}
        </div>
        <div className="cal-grid">
          {cells.map((date, i) => {
            if (!date) return <span key={i} className="cal-day cal-day--empty" />;
            const iso = toISODate(date);
            const isPast = iso < today;
            const isStart = iso === checkIn;
            const isEnd = iso === checkOut;
            const inRange = checkIn && checkOut && iso > checkIn && iso < checkOut;
            const classes = [
              'cal-day',
              isPast ? 'cal-day--disabled' : '',
              isStart || isEnd ? 'cal-day--selected' : '',
              inRange ? 'cal-day--in-range' : '',
            ].filter(Boolean).join(' ');

            return (
              <button
                key={i}
                type="button"
                className={classes}
                disabled={isPast}
                onClick={() => handleDayClick(date)}
                aria-pressed={isStart || isEnd}
                aria-label={date.toDateString()}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />

      <article className="details-page container">

        {/* ════ Heading ════ */}
        <header className="details-heading">
          <div className="details-heading__top">
            <h1 className="details-title">{listing.title}</h1>
            <div className="details-heading__actions">
              <button type="button" className="details-action-btn" onClick={handleShare}>
                <span aria-hidden="true">⤴</span> {copied ? 'Link copied!' : 'Share'}
              </button>
              <button
                type="button"
                className="details-action-btn"
                onClick={() => setSaved((s) => !s)}
                aria-pressed={saved}
              >
                <span aria-hidden="true">{saved ? '♥' : '♡'}</span> Save
              </button>
            </div>
          </div>
          <div className="details-meta-row">
            {listing.rating > 0 && (
              <span className="details-meta-item details-rating">
                ★ {listing.rating.toFixed(1)}
              </span>
            )}
            {listing.reviews > 0 && (
              <span className="details-meta-item">
                <a href="#reviews" className="details-underline-link">
                  {listing.reviews} review{listing.reviews !== 1 ? 's' : ''}
                </a>
              </span>
            )}
            {listing.rating >= 4.5 && (
              <>
                <span className="details-meta-dot" aria-hidden="true">·</span>
                <span className="details-meta-item">🏅 Superhost</span>
              </>
            )}
            <span className="details-meta-dot" aria-hidden="true">·</span>
            <span className="details-meta-item details-location-link">
              <a href="#map" className="details-underline-link">{listing.location}</a>
            </span>
          </div>
        </header>

        {/* ════ Gallery ════ */}
        <div className="details-gallery" aria-label="Property photos">
          <img
            src={mainImage}
            alt={listing.title}
            className="gallery-main"
          />
          <div className="gallery-grid">
            {[0, 1, 2, 3].map((i) => (
              <img
                key={i}
                src={restImages[i] || mainImage}
                alt={`${listing.title} – photo ${i + 2}`}
                className="gallery-thumb"
                loading="lazy"
              />
            ))}
          </div>
          {images.length > 1 && (
            <button
              type="button"
              className="gallery-show-all-btn"
              onClick={() => setShowAllPhotos(true)}
            >
              <span aria-hidden="true">▦</span> Show all photos
            </button>
          )}
        </div>

        {/* ════ Photo lightbox ════ */}
        {showAllPhotos && (
          <div className="photo-lightbox" role="dialog" aria-modal="true" aria-label="All photos">
            <button
              type="button"
              className="photo-lightbox__close"
              onClick={() => setShowAllPhotos(false)}
              aria-label="Close photo gallery"
            >
              ✕ Close
            </button>
            <div className="photo-lightbox__grid">
              {images.map((src, i) => (
                <img key={i} src={src} alt={`${listing.title} – photo ${i + 1}`} />
              ))}
            </div>
          </div>
        )}

        {/* ════ Two-column body ════ */}
        <div className="details-body">

          {/* ── Left column ── */}
          <div className="details-main">

            {/* Type + host intro */}
            <div className="details-host-row">
              <div>
                <h2 className="details-host-title">
                  {listing.type} hosted by{' '}
                  {listing.host?.username ?? 'a Superhost'}
                </h2>
                <p className="details-host-meta">
                  {listing.guests} guest{listing.guests !== 1 ? 's' : ''} &middot;{' '}
                  {listing.bedrooms} bedroom{listing.bedrooms !== 1 ? 's' : ''} &middot;{' '}
                  {listing.bathrooms} bathroom{listing.bathrooms !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="details-host-avatar" aria-hidden="true">
                {(listing.host?.username?.[0] ?? 'H').toUpperCase()}
              </div>
            </div>

            <hr className="details-divider" />

            {/* Self check-in badge */}
            {listing.selfCheckIn && (
              <div className="details-highlight">
                <span className="details-highlight__icon" aria-hidden="true">🔑</span>
                <div>
                  <p className="details-highlight__title">Self check-in</p>
                  <p className="details-highlight__desc">Check yourself in with the keypad.</p>
                </div>
              </div>
            )}

            {/* Enhanced cleaning badge */}
            {listing.enhancedCleaning && (
              <div className="details-highlight">
                <span className="details-highlight__icon" aria-hidden="true">✨</span>
                <div>
                  <p className="details-highlight__title">Enhanced cleaning</p>
                  <p className="details-highlight__desc">This host follows Airbnb's 5-step enhanced cleaning process.</p>
                </div>
              </div>
            )}

            <hr className="details-divider" />

            {/* Description */}
            <section aria-label="About this place">
              <p className="details-description">{listing.description}</p>
            </section>

            <hr className="details-divider" />

            {/* Where you'll sleep */}
            <section aria-label="Where you'll sleep">
              <h3 className="details-section-title">Where you&rsquo;ll sleep</h3>
              <div className="sleep-photo-card">
                <img
                  src={restImages[0] || mainImage}
                  alt="Bedroom"
                  className="sleep-photo-card__img"
                  loading="lazy"
                />
                <p className="sleep-photo-card__name">Bedroom</p>
                <p className="sleep-photo-card__desc">1 queen bed</p>
              </div>
            </section>

            <hr className="details-divider" />

            {/* Amenities */}
            <section aria-label="Amenities">
              <h3 className="details-section-title">What this place offers</h3>
              {listing.amenities?.length ? (
                <>
                  <ul className="amenities-grid">
                    {visibleAmenities.map((a) => (
                      <li key={a} className="amenity-item">
                        <span className="amenity-icon" aria-hidden="true">{amenityIcon(a)}</span>
                        {a}
                      </li>
                    ))}
                  </ul>
                  {listing.amenities.length > 6 && (
                    <button
                      type="button"
                      className="amenities-show-all-btn"
                      onClick={() => setShowAllAmenities((s) => !s)}
                    >
                      {showAllAmenities ? 'Show less' : `Show all ${listing.amenities.length} amenities`}
                    </button>
                  )}
                </>
              ) : (
                <p className="details-empty-text">No amenities listed.</p>
              )}
            </section>

            <hr className="details-divider" />

            {/* ════ Calendar ════ */}
            <section aria-label="Select dates" className="calendar-section">
              <h3 className="details-section-title">
                {calendarNights > 0
                  ? `${calendarNights} night${calendarNights !== 1 ? 's' : ''} in ${listing.location}`
                  : `Select check-in date`}
              </h3>
              <p className="calendar-subtitle">
                {checkIn && checkOut
                  ? `${formatLongDate(checkIn)} – ${formatLongDate(checkOut)}`
                  : checkIn
                  ? `${formatLongDate(checkIn)} – Add checkout date`
                  : 'Add your travel dates for exact pricing'}
              </p>

              <div className="calendar-wrap">
                <button
                  type="button"
                  className="calendar-nav calendar-nav--prev"
                  onClick={() => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                  aria-label="Previous month"
                >
                  ‹
                </button>
                <div className="calendar-months">
                  {renderMonth(monthA)}
                  {renderMonth(monthB)}
                </div>
                <button
                  type="button"
                  className="calendar-nav calendar-nav--next"
                  onClick={() => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                  aria-label="Next month"
                >
                  ›
                </button>
              </div>

              {(checkIn || checkOut) && (
                <button type="button" className="calendar-clear-btn" onClick={clearDates}>
                  Clear dates
                </button>
              )}
            </section>

            <hr className="details-divider" />

            {/* Reviews summary */}
            {listing.rating > 0 && (
              <section id="reviews" aria-label="Ratings">
                <h3 className="details-section-title">
                  ★ {listing.rating.toFixed(1)} &middot; {listing.reviews} review{listing.reviews !== 1 ? 's' : ''}
                </h3>
                {listing.specificRatings && (
                  <div className="ratings-grid">
                    {[
                      ['Cleanliness', listing.specificRatings.cleanliness],
                      ['Communication', listing.specificRatings.communication],
                      ['Check-in', listing.specificRatings.checkIn],
                      ['Accuracy', listing.specificRatings.accuracy],
                      ['Location', listing.specificRatings.location],
                      ['Value', listing.specificRatings.value],
                    ].map(([label, val]) => (
                      <div key={label} className="rating-row">
                        <span className="rating-label">{label}</span>
                        <div className="rating-bar-wrap">
                          <div
                            className="rating-bar"
                            style={{ width: `${((val || 0) / 5) * 100}%` }}
                            role="meter"
                            aria-valuenow={val}
                            aria-valuemin={0}
                            aria-valuemax={5}
                            aria-label={`${label}: ${val ?? 0} out of 5`}
                          />
                        </div>
                        <span className="rating-val">{val?.toFixed(1) ?? '—'}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="reviews-list">
                  {visibleReviews.map((r) => (
                    <div className="review-card" key={r.name}>
                      <div className="review-card__header">
                        <div className="review-card__avatar" aria-hidden="true">
                          {r.name[0]}
                        </div>
                        <div>
                          <p className="review-card__name">{r.name}</p>
                          <p className="review-card__date">{r.date}</p>
                        </div>
                      </div>
                      <p className="review-card__comment">{r.comment}</p>
                    </div>
                  ))}
                </div>

                {!showAllReviews && listing.reviews > SAMPLE_REVIEWS.length && (
                  <button
                    type="button"
                    className="reviews-show-more"
                    onClick={() => setShowAllReviews(true)}
                  >
                    Show all {listing.reviews} reviews
                  </button>
                )}
              </section>
            )}

            <hr className="details-divider" />

            {/* ════ Host card ════ */}
            <section aria-label="Meet your host" className="host-card">
              <div className="host-card__top">
                <div className="host-card__avatar" aria-hidden="true">
                  {(listing.host?.username?.[0] ?? 'H').toUpperCase()}
                </div>
                <div>
                  <h3 className="host-card__name">Hosted by {listing.host?.username ?? 'your host'}</h3>
                  {hostJoined && <p className="host-card__joined">Joined {hostJoined}</p>}
                </div>
              </div>

              {listing.rating >= 4.5 && (
                <p className="host-card__badges">
                  {listing.reviews > 0 && <span>{listing.reviews} Reviews</span>}
                  <span aria-hidden="true">·</span>
                  <span>✓ Identity verified</span>
                  <span aria-hidden="true">·</span>
                  <span>🏅 Superhost</span>
                </p>
              )}

              {listing.rating >= 4.5 && (
                <>
                  <p className="host-card__title">{listing.host?.username ?? 'This host'} is a Superhost</p>
                  <p className="host-card__desc">
                    Superhosts are experienced, highly rated hosts who are committed to
                    providing great stays for guests.
                  </p>
                </>
              )}

              <p className="host-card__stat">Response rate: 100%</p>
              <p className="host-card__stat">Response time: within an hour</p>

              <button type="button" className="btn btn-outline host-card__contact-btn">
                Contact host
              </button>

              <p className="host-card__safety">
                🛡 To protect your payment, never transfer money or communicate outside of
                the Airbnb website or app.
              </p>
            </section>

            <hr className="details-divider" />

            {/* Things to know */}
            <section aria-label="Things to know">
              <h3 className="details-section-title">Things to know</h3>
              <div className="know-grid">
                <div className="know-col">
                  <h4 className="know-col__title">House rules</h4>
                  <ul className="know-col__list">
                    <li>Check-in: after 3:00 PM</li>
                    <li>Checkout: before 11:00 AM</li>
                    <li>Self check-in with lockbox</li>
                    <li>No smoking</li>
                    <li>No pets</li>
                    <li>No parties or events</li>
                  </ul>
                </div>
                <div className="know-col">
                  <h4 className="know-col__title">Health &amp; safety</h4>
                  <ul className="know-col__list">
                    <li>
                      {listing.enhancedCleaning
                        ? "Committed to Airbnb's enhanced cleaning process"
                        : 'Standard cleaning process'}
                    </li>
                    <li>Carbon monoxide alarm</li>
                    <li>Smoke alarm</li>
                  </ul>
                </div>
                <div className="know-col">
                  <h4 className="know-col__title">Cancellation policy</h4>
                  <ul className="know-col__list">
                    <li>Free cancellation for 48 hours</li>
                    <li>Review the full policy before booking</li>
                  </ul>
                </div>
              </div>
            </section>

            <hr className="details-divider" />

            {/* ════ Explore other options / Unique stays ════ */}
            <section aria-label="Explore other options" className="explore-section">
              <h3 className="details-section-title">Explore other options nearby</h3>
              <div className="explore-grid">
                {EXPLORE_CITIES.map((city) => (
                  <button
                    key={city}
                    type="button"
                    className="explore-link"
                    onClick={() => navigate(`/locations?location=${encodeURIComponent(city)}`)}
                  >
                    {city}
                  </button>
                ))}
              </div>

              <h3 className="details-section-title explore-section__subtitle">Unique stays on Airbnb</h3>
              <div className="explore-grid">
                {UNIQUE_STAYS.map((stay) => (
                  <span key={stay} className="explore-link explore-link--static">
                    {stay}
                  </span>
                ))}
              </div>

              <nav className="details-breadcrumb" aria-label="Breadcrumb">
                <Link to="/">Airbnb</Link>
                <span aria-hidden="true">›</span>
                <Link to="/locations">Explore</Link>
                <span aria-hidden="true">›</span>
                <span>{listing.location}</span>
              </nav>
            </section>
          </div>

          {/* ── Right sidebar (sticky calculator) ── */}
          <aside className="cost-calculator" aria-label="Booking calculator">
            <div className="calc-header">
              <p className="calc-price">
                <strong>R{fmt(listing.price)}</strong>
                <span className="calc-per-night"> / night</span>
              </p>
              {listing.rating > 0 && (
                <p className="calc-rating">
                  ★ {listing.rating.toFixed(1)}{' '}
                  <span className="calc-rating-count">
                    ({listing.reviews} review{listing.reviews !== 1 ? 's' : ''})
                  </span>
                </p>
              )}
            </div>

            {/* Date range */}
            <div className="calc-date-row">
              <label className="calc-date-label">
                <span>CHECK-IN</span>
                <input
                  type="date"
                  className="calc-date-input"
                  value={checkIn}
                  min={today}
                  onChange={(e) => {
                    setCheckIn(e.target.value);
                    if (checkOut && e.target.value >= checkOut) setCheckOut('');
                  }}
                  aria-label="Check-in date"
                />
              </label>
              <label className="calc-date-label">
                <span>CHECKOUT</span>
                <input
                  type="date"
                  className="calc-date-input"
                  value={checkOut}
                  min={checkIn || today}
                  onChange={(e) => setCheckOut(e.target.value)}
                  aria-label="Checkout date"
                />
              </label>
            </div>

            {/* Guests */}
            <label className="calc-guests-label">
              <span className="calc-guests-title">GUESTS</span>
              <select
                className="calc-guests-select"
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                aria-label="Number of guests"
              >
                {Array.from({ length: listing.guests || 1 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n} guest{n > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </label>

            {/* Reserve button */}
            <button
              className="btn btn-primary calc-reserve-btn"
              onClick={handleReserve}
              disabled={reserving}
              aria-busy={reserving}
            >
              {reserving ? 'Reserving…' : 'Reserve'}
            </button>

            {/* Feedback message */}
            {reserveMessage && (
              <p
                className={`calc-message${reserveSuccess ? ' calc-message--success' : ' calc-message--error'}`}
                role="status"
              >
                {reserveMessage}
              </p>
            )}

            <p className="calc-no-charge">You won&apos;t be charged yet</p>

            {/* Cost breakdown (only when dates are selected) */}
            {costBreakdown && costBreakdown.nights > 0 && (
              <div className="calc-breakdown" aria-label="Cost breakdown">
                <div className="calc-line">
                  <span>
                    R{fmt(listing.price)} × {costBreakdown.nights} night
                    {costBreakdown.nights > 1 ? 's' : ''}
                  </span>
                  <span>R{fmt(costBreakdown.subtotal)}</span>
                </div>

                {costBreakdown.weeklyDiscountAmount > 0 && (
                  <div className="calc-line calc-line--discount">
                    <span>Weekly discount</span>
                    <span>−R{fmt(costBreakdown.weeklyDiscountAmount)}</span>
                  </div>
                )}

                <div className="calc-line">
                  <span>Cleaning fee</span>
                  <span>R{fmt(costBreakdown.cleaningFee)}</span>
                </div>

                <div className="calc-line">
                  <span>Service fee</span>
                  <span>R{fmt(costBreakdown.serviceFee)}</span>
                </div>

                <div className="calc-line">
                  <span>Occupancy taxes &amp; fees</span>
                  <span>R{fmt(costBreakdown.occupancyTaxes)}</span>
                </div>

                <hr className="calc-divider" />

                <div className="calc-line calc-line--total">
                  <span>Total</span>
                  <span>R{fmt(costBreakdown.total)}</span>
                </div>
              </div>
            )}
          </aside>
        </div>
      </article>

      <Footer />
    </>
  );
}
