/**
 * CreateListing – thin wrapper that renders the shared ListingForm
 * inside a properly styled page with a back-link breadcrumb.
 */

import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ListingForm from '../components/ListingForm';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import './FormPage.css';

export default function CreateListing() {
  const { token } = useAuth();
  const navigate = useNavigate();

  async function handleCreate(payload) {
    await api.createListing(payload, token);
    navigate('/');
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
        </div>

        {/* Form card */}
        <div className="container form-page-container">
          <ListingForm
            submitLabel="Publish Listing"
            onSubmit={handleCreate}
            onCancel={() => navigate('/')}
          />
        </div>
      </main>
    </div>
  );
}
