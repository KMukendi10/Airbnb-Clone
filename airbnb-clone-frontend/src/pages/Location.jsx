/**
 * Location / Search-results page
 * Reads ?location= from the URL, fetches matching accommodations
 * and renders them in an Airbnb-style responsive grid.
 */

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import Header from '../components/Header';
import LocationCard from '../components/LocationCard';
import Footer from '../components/Footer';
import './Location.css';

// Popular filter chips shown above the results grid
const FILTER_CHIPS = [
  'Amazing views',
  'Beachfront',
  'Cabins',
  'Tiny homes',
  'Top cities',
  'Countryside',
  'Farms',
  'Design',
  'Luxe',
  'Trending',
];

export default function Location() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const locationFilter = searchParams.get('location') || '';

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeChip, setActiveChip] = useState('');

  /* Fetch whenever the location filter changes */
  useEffect(() => {
    setLoading(true);
    setError('');

    api
      .getAccommodations(locationFilter)
      .then((data) => setListings(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message || 'Failed to load listings'))
      .finally(() => setLoading(false));
  }, [locationFilter]);

  function handleFilter(value) {
    navigate(`/locations?location=${encodeURIComponent(value)}`);
  }

  const heading = locationFilter
    ? `${listings.length} stay${listings.length !== 1 ? 's' : ''} in ${locationFilter}`
    : `${listings.length} stay${listings.length !== 1 ? 's' : ''} available`;

  return (
    <div className="location-page">
      <Header onFilter={handleFilter} />

      <main className="location-main container">
        {/* ── Filter chip bar ── */}
        <div className="filter-chips" role="list" aria-label="Filter by category">
          {FILTER_CHIPS.map((chip) => (
            <button
              key={chip}
              className={`filter-chip${activeChip === chip ? ' filter-chip--active' : ''}`}
              onClick={() => {
                const next = activeChip === chip ? '' : chip;
                setActiveChip(next);
                handleFilter(next || locationFilter);
              }}
              role="listitem"
              aria-pressed={activeChip === chip}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* ── Heading ── */}
        <h1 className="location-heading">
          {locationFilter ? (
            <>
              <span className="location-heading__count">
                {loading ? '—' : listings.length}
              </span>{' '}
              stay{listings.length !== 1 ? 's' : ''} in{' '}
              <span className="location-heading__place">{locationFilter}</span>
            </>
          ) : (
            <span>Explore all stays</span>
          )}
        </h1>

        {locationFilter && (
          <p className="location-subheading">
            Review dates and prices to find the best fit for your trip
          </p>
        )}

        {/* ── States ── */}
        {loading && (
          <div className="location-status" aria-live="polite">
            <div className="spinner" aria-hidden="true" />
            <p>Finding great stays…</p>
          </div>
        )}

        {!loading && error && (
          <div className="location-status location-status--error" role="alert">
            <p>⚠ {error}</p>
            <button
              className="btn btn-outline"
              onClick={() => handleFilter(locationFilter)}
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && listings.length === 0 && (
          <div className="location-status location-status--empty">
            <p className="location-empty__title">No exact matches</p>
            <p className="location-empty__subtitle">
              Try different dates, removing some filters, or a different destination.
            </p>
            <button
              className="btn btn-outline"
              onClick={() => navigate('/locations')}
            >
              Clear filters
            </button>
          </div>
        )}

        {/* ── Listings grid ── */}
        {!loading && !error && listings.length > 0 && (
          <div className="listings-grid" aria-label="Available stays">
            {listings.map((listing) => (
              <LocationCard key={listing._id} listing={listing} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
