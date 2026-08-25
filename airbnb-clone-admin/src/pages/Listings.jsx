/**
 * Listings page – host dashboard showing all their listings.
 * Each row has a thumbnail, key details and Update/Delete actions.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import './Listings.css';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=300&q=80';

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
    <>
      <Header />
      <main className="container listings-page">
        {/* Page header */}
        <div className="listings-header">
          <div>
            <h1 className="listings-title">My Listings</h1>
            <p className="listings-subtitle">
              {listings.length} property{listings.length !== 1 ? 'ies' : 'y'} listed
            </p>
          </div>
          <Link to="/listings/new" className="btn btn-primary">
            + Create Listing
          </Link>
        </div>

        {/* States */}
        {loading && (
          <div className="listings-status" aria-live="polite">
            <div className="spinner" style={{ borderTopColor: 'var(--color-primary)' }} aria-hidden="true" />
            <p>Loading listings…</p>
          </div>
        )}
        {!loading && error && (
          <p className="listings-status listings-error" role="alert">⚠ {error}</p>
        )}
        {!loading && listings.length === 0 && !error && (
          <div className="listings-empty">
            <p className="listings-empty__title">No listings yet.</p>
            <p className="listings-empty__subtitle">Create your first listing to start hosting.</p>
            <Link to="/listings/new" className="btn btn-primary">Create Listing</Link>
          </div>
        )}

        {/* Listing rows */}
        <div className="listings-list">
          {listings.map((listing) => (
            <article className="listing-row" key={listing._id}>
              <img
                src={listing.images?.[0] || PLACEHOLDER}
                alt={listing.title}
                className="listing-row__img"
                loading="lazy"
              />
              <div className="listing-row__info">
                <h3 className="listing-row__title">{listing.title}</h3>
                <p className="listing-row__type">{listing.type}</p>
                <p className="listing-row__desc">{listing.description}</p>
                <div className="listing-row__meta">
                  <span>📍 {listing.location}</span>
                  <span>🛏 {listing.bedrooms} bed · 🚿 {listing.bathrooms} bath · 👥 {listing.guests} guests</span>
                  <span className="listing-row__price">R{listing.price?.toLocaleString()}/night</span>
                </div>
              </div>
              <div className="listing-row__actions">
                <Link
                  to={`/listings/${listing._id}/edit`}
                  className="btn btn-primary listing-row__btn"
                >
                  Edit
                </Link>
                <button
                  className="btn btn-danger listing-row__btn"
                  onClick={() => handleDelete(listing._id, listing.title)}
                  disabled={deletingId === listing._id}
                  aria-busy={deletingId === listing._id}
                >
                  {deletingId === listing._id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
