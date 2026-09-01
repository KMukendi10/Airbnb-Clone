/**
 * UpdateListing – fetches the listing by :id, then renders the
 * shared ListingForm pre-filled with existing values.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import ListingForm from '../components/ListingForm';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import './FormPage.css';

export default function UpdateListing() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getListing(id)
      .then(setListing)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleUpdate(payload) {
    await api.updateListing(id, payload, token);
    navigate('/');
  }

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="form-page-wrapper">
        <Header toolbar={[{ label: 'View my listings', to: '/' }]} />
        <main className="form-page-main">
          <div className="form-page-status">
            <div className="spinner" aria-hidden="true" />
            <p>Loading listing…</p>
          </div>
        </main>
      </div>
    );
  }

  /* ── Error state ── */
  if (error || !listing) {
    return (
      <div className="form-page-wrapper">
        <Header toolbar={[{ label: 'View my listings', to: '/' }]} />
        <main className="form-page-main">
          <div className="form-page-status form-page-status--error" role="alert">
            <p>⚠ {error || 'Listing not found.'}</p>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/')}>
              ← Back to listings
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="form-page-wrapper">
      <Header toolbar={[{ label: 'View my listings', to: '/' }]} />

      <main className="form-page-main">
        {/* Breadcrumb */}
        <div className="container form-page-breadcrumb">
          <button
            className="form-page-back"
            onClick={() => navigate('/')}
            aria-label="Back to listings"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor" />
            </svg>
            Back to Listings
          </button>
          <span className="form-page-breadcrumb-sep" aria-hidden="true">/</span>
          <span className="form-page-breadcrumb-current">{listing.title}</span>
        </div>

        {/* Form card */}
        <div className="container form-page-container">
          <ListingForm
            initialValues={listing}
            submitLabel="Save Changes"
            onSubmit={handleUpdate}
            onCancel={() => navigate('/')}
          />
        </div>
      </main>
    </div>
  );
}
