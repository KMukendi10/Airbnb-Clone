/**
 * LocationDetails page – single listing view with:
 *  - Heading, subheading (rating, reviews, location)
 *  - 5-photo gallery (1 large + 4 thumbnails in 2×2 grid)
 *  - Left column: listing info, amenities, things to know
 *  - Right sticky sidebar: price calculator with full breakdown
 */

import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  {
    name: 'Naledi',
    date: 'January 2026',
    comment:
      'Beautiful place, exactly as pictured. The host was quick to respond and check-in was seamless. Would happily stay again.',
  },
  {
    name: 'Liam',
    date: 'November 2025',
    comment:
      'Great location and super clean. A couple of things were a little different from the listing, but the host sorted it out fast.',
  },
  {
    name: 'Amara',
    date: 'September 2025',
    comment:
      'Loved the neighbourhood and the amenities. Communication with the host was excellent from booking through checkout.',
  },
];

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
  const [showAllReviews, setShowAllReviews] = useState(false);

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

  return (
    <>
      <Header />

      <article className="details-page container">

        {/* ════ Heading ════ */}
        <header className="details-heading">
          <h1 className="details-title">{listing.title}</h1>
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
        </div>

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
                {listing.rating >= 4.5 && (
                  <div className="superhost-badge" aria-label="Superhost">
                    <SuperhostBadge />
                    <span>Superhost</span>
                  </div>
                )}
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

            {/* Amenities */}
            <section aria-label="Amenities">
              <h3 className="details-section-title">What this place offers</h3>
              {listing.amenities?.length ? (
                <ul className="amenities-grid">
                  {listing.amenities.map((a) => (
                    <li key={a} className="amenity-item">
                      <span className="amenity-icon" aria-hidden="true">{amenityIcon(a)}</span>
                      {a}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="details-empty-text">No amenities listed.</p>
              )}
            </section>

            <hr className="details-divider" />

            {/* Where you'll sleep */}
            <section aria-label="Where you'll sleep">
              <h3 className="details-section-title">Where you&rsquo;ll sleep</h3>
              <div className="sleep-grid">
                {Array.from({ length: listing.bedrooms || 1 }, (_, i) => (
                  <div key={i} className="sleep-card">
                    <span className="sleep-card__icon" aria-hidden="true">🛏️</span>
                    <p className="sleep-card__name">
                      {listing.bedrooms === 1 ? 'Bedroom' : `Bedroom ${i + 1}`}
                    </p>
                    <p className="sleep-card__desc">1 {i === 0 ? 'queen' : 'double'} bed</p>
                  </div>
                ))}
              </div>
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
                  {(showAllReviews ? SAMPLE_REVIEWS : SAMPLE_REVIEWS.slice(0, 2)).map((r) => (
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

                {!showAllReviews && SAMPLE_REVIEWS.length > 2 && (
                  <button
                    type="button"
                    className="reviews-show-more"
                    onClick={() => setShowAllReviews(true)}
                  >
                    Show more <span aria-hidden="true">›</span>
                  </button>
                )}
              </section>
            )}

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
                    <li>No smoking</li>
                    <li>No parties or events</li>
                  </ul>
                </div>
                <div className="know-col">
                  <h4 className="know-col__title">Health &amp; safety</h4>
                  <ul className="know-col__list">
                    <li>
                      {listing.enhancedCleaning
                        ? 'Enhanced cleaning process applied'
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
