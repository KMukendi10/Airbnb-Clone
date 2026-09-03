/**
 * Listings page – host dashboard home.
 *
 * Layout (per Figma "My Hotel List"):
 *   1. Simple page heading
 *   2. Row list – each row shows image + stacked Update/Delete actions
 *      on the left, and details (type/title/stats/amenities/rating/price)
 *      on the right
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { api, resolveImageUrl } from '../api/client';
import './Listings.css';

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80';

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

  return (
    <div className="listings-page-wrapper">
      <Header />

      <main className="container listings-body">
        <h1 className="listings-heading">My Hotel List</h1>
        <hr className="listings-heading-divider" />

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

        {/* ── Row list ── */}
        {!loading && !error && listings.length > 0 && (
          <div className="listings-list">
            {listings.map((listing) => {
              const statsLine = [
                listing.guests ? `${listing.guests} guest${listing.guests !== 1 ? 's' : ''}` : null,
                listing.type,
                listing.bedrooms ? `${listing.bedrooms} bed${listing.bedrooms !== 1 ? 's' : ''}` : null,
                listing.bathrooms ? `${listing.bathrooms} bath${listing.bathrooms !== 1 ? 's' : ''}` : null,
              ]
                .filter(Boolean)
                .join(' · ');
              const amenitiesLine = (listing.amenities || []).slice(0, 3).join(' · ');

              return (
                <article className="listing-row" key={listing._id}>
                  {/* Left: image + stacked actions */}
                  <div className="listing-row__left">
                    <div className="listing-row__img-wrap">
                      <img
                        src={resolveImageUrl(listing.images?.[0]) || PLACEHOLDER}
                        alt={listing.title}
                        className="listing-row__img"
                        loading="lazy"
                      />
                    </div>

                    <Link
                      to={`/listings/${listing._id}/edit`}
                      className="listing-row__btn listing-row__btn--update"
                    >
                      Update
                    </Link>
                    <button
                      className="listing-row__btn listing-row__btn--delete"
                      onClick={() => handleDelete(listing._id, listing.title)}
                      disabled={deletingId === listing._id}
                      aria-busy={deletingId === listing._id}
                    >
                      {deletingId === listing._id ? '…' : 'Delete'}
                    </button>
                  </div>

                  {/* Right: details */}
                  <div className="listing-row__body">
                    <span className="listing-row__type">
                      {listing.type} in {listing.location}
                    </span>
                    <p className="listing-row__title">{listing.title}</p>

                    {statsLine && <p className="listing-row__stats">{statsLine}</p>}
                    {amenitiesLine && <p className="listing-row__amenities">{amenitiesLine}</p>}

                    <hr className="listing-row__divider" />

                    <div className="listing-row__bottom">
                      {listing.rating > 0 && (
                        <span className="listing-row__rating">
                          ★ {listing.rating.toFixed(1)}
                          {listing.reviews > 0 && (
                            <span className="listing-row__reviews">
                              {' '}({listing.reviews} review{listing.reviews !== 1 ? 's' : ''})
                            </span>
                          )}
                        </span>
                      )}
                      <p className="listing-row__price">
                        <span className="listing-row__price-amount">
                          R{(listing.price || 0).toLocaleString()}
                        </span>
                        <span className="listing-row__price-night"> / night</span>
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
