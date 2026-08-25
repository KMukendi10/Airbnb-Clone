/**
 * Listings page – host dashboard home.
 *
 * Layout:
 *   1. Welcome banner with quick stats (total listings, total guests capacity, avg price)
 *   2. Section header with "My Listings" title + "Create Listing" CTA
 *   3. Card grid – each card shows image, type badge, title, meta row, price and actions
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import './Listings.css';

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80';

/** Derive quick stats from the listings array */
function calcStats(listings) {
  if (!listings.length) return { total: 0, guests: 0, avgPrice: 0 };
  const guests = listings.reduce((s, l) => s + (l.guests || 0), 0);
  const avgPrice = Math.round(
    listings.reduce((s, l) => s + (l.price || 0), 0) / listings.length
  );
  return { total: listings.length, guests, avgPrice };
}

export default function Listings() {
  const { user, token } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!user) return;
    api
      .getMyListings(user._id)
      .then((data) => setListings(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  async function handleDelete(id, title) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await api.deleteListing(id, token);
      setListings((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  const stats = calcStats(listings);

  return (
    <div className="listings-page-wrapper">
      <Header />

      <main>
        {/* ══════════════════════════════════════
            Welcome / Stats banner
        ══════════════════════════════════════ */}
        <section className="listings-banner">
          <div className="container listings-banner__inner">
            <div className="listings-banner__text">
              <h1 className="listings-banner__title">
                Welcome back{user ? `, ${user.username}` : ''}! 👋
              </h1>
              <p className="listings-banner__subtitle">
                Manage your properties, track bookings and grow your hosting business.
              </p>
              <Link to="/listings/new" className="btn btn-primary listings-banner__cta">
                + Add New Listing
              </Link>
            </div>

            {/* Stat cards */}
            <div className="listings-stats">
              <div className="stat-card">
                <span className="stat-card__icon" aria-hidden="true">🏠</span>
                <p className="stat-card__value">{loading ? '—' : stats.total}</p>
                <p className="stat-card__label">Listings</p>
              </div>
              <div className="stat-card">
                <span className="stat-card__icon" aria-hidden="true">👥</span>
                <p className="stat-card__value">{loading ? '—' : stats.guests}</p>
                <p className="stat-card__label">Total guests capacity</p>
              </div>
              <div className="stat-card">
                <span className="stat-card__icon" aria-hidden="true">💰</span>
                <p className="stat-card__value">
                  {loading ? '—' : `R${stats.avgPrice.toLocaleString()}`}
                </p>
                <p className="stat-card__label">Avg price / night</p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            Section header + grid
        ══════════════════════════════════════ */}
        <div className="container listings-body">
          <div className="listings-section-header">
            <div>
              <h2 className="listings-section-title">My Listings</h2>
              {!loading && (
                <p className="listings-section-sub">
                  {stats.total} propert{stats.total !== 1 ? 'ies' : 'y'} listed
                </p>
              )}
            </div>
            <Link to="/listings/new" className="btn btn-outline btn-sm">
              + Create Listing
            </Link>
          </div>

          {/* ── Loading ── */}
          {loading && (
            <div className="listings-status" aria-live="polite">
              <div className="spinner" aria-hidden="true" />
              <p>Loading your listings…</p>
            </div>
          )}

          {/* ── Error ── */}
          {!loading && error && (
            <div className="listings-status listings-status--error" role="alert">
              <p>⚠ {error}</p>
            </div>
          )}

          {/* ── Empty ── */}
          {!loading && !error && listings.length === 0 && (
            <div className="listings-empty">
              <div className="listings-empty__icon" aria-hidden="true">🏡</div>
              <h3 className="listings-empty__title">No listings yet</h3>
              <p className="listings-empty__subtitle">
                Create your first listing to start accepting guests.
              </p>
              <Link to="/listings/new" className="btn btn-primary">
                Create your first listing
              </Link>
            </div>
          )}

          {/* ── Card grid ── */}
          {!loading && !error && listings.length > 0 && (
            <div className="listings-grid">
              {listings.map((listing) => (
                <article className="listing-card" key={listing._id}>
                  {/* Image */}
                  <div className="listing-card__img-wrap">
                    <img
                      src={listing.images?.[0] || PLACEHOLDER}
                      alt={listing.title}
                      className="listing-card__img"
                      loading="lazy"
                    />
                    {/* Type badge */}
                    <span className="listing-card__badge">{listing.type}</span>
                    {/* Price tag */}
                    <span className="listing-card__price-tag">
                      R{(listing.price || 0).toLocaleString()}<span>/night</span>
                    </span>
                  </div>

                  {/* Body */}
                  <div className="listing-card__body">
                    <h3 className="listing-card__title">{listing.title}</h3>

                    <p className="listing-card__location">
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/></svg>
                      {listing.location}
                    </p>

                    <div className="listing-card__meta">
                      <span>🛏 {listing.bedrooms} bed</span>
                      <span className="listing-card__meta-dot" aria-hidden="true">·</span>
                      <span>🚿 {listing.bathrooms} bath</span>
                      <span className="listing-card__meta-dot" aria-hidden="true">·</span>
                      <span>👥 {listing.guests} guests</span>
                    </div>

                    {listing.rating > 0 && (
                      <p className="listing-card__rating">
                        ★ {listing.rating.toFixed(1)}
                        {listing.reviews > 0 && (
                          <span className="listing-card__reviews">
                            {' '}({listing.reviews} review{listing.reviews !== 1 ? 's' : ''})
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="listing-card__actions">
                    <Link
                      to={`/listings/${listing._id}/edit`}
                      className="btn btn-accent btn-sm listing-card__btn"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true" width="14" height="14"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/></svg>
                      Edit
                    </Link>
                    <button
                      className="btn btn-danger btn-sm listing-card__btn"
                      onClick={() => handleDelete(listing._id, listing.title)}
                      disabled={deletingId === listing._id}
                      aria-busy={deletingId === listing._id}
                    >
                      {deletingId === listing._id ? (
                        '…'
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" aria-hidden="true" width="14" height="14"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/></svg>
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
