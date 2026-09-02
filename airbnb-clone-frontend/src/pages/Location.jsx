/**
 * Location / Search-results page
 * Reads ?location= from the URL, fetches matching accommodations
 * and renders them in an Airbnb-style responsive grid.
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import Header from '../components/Header';
import LocationCard from '../components/LocationCard';
import Footer from '../components/Footer';
import './Location.css';

export default function Location() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const locationFilter = searchParams.get('location') || '';

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /* ── Filter state ── */
  const [freeCancellation, setFreeCancellation] = useState(false);
  const [instantBook, setInstantBook] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [minBedrooms, setMinBedrooms] = useState(0);
  const [minBathrooms, setMinBathrooms] = useState(0);

  /* ── Popover open state + outside-click handling ── */
  const [typeOpen, setTypeOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const typeRef = useRef(null);
  const priceRef = useRef(null);
  const moreRef = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (typeRef.current && !typeRef.current.contains(e.target)) setTypeOpen(false);
      if (priceRef.current && !priceRef.current.contains(e.target)) setPriceOpen(false);
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

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

  // Distinct property types present in the current result set, for the
  // "Type of place" popover — always reflects real data, never a hardcoded list.
  const availableTypes = useMemo(
    () => [...new Set(listings.map((l) => l.type).filter(Boolean))].sort(),
    [listings]
  );

  function toggleType(t) {
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  const hasMoreFilters = minBedrooms > 0 || minBathrooms > 0;
  const hasPriceFilter = priceMin !== '' || priceMax !== '';
  const hasTypeFilter = selectedTypes.length > 0;
  const anyFilterActive =
    freeCancellation || instantBook || hasTypeFilter || hasPriceFilter || hasMoreFilters;

  function clearAllFilters() {
    setFreeCancellation(false);
    setInstantBook(false);
    setSelectedTypes([]);
    setPriceMin('');
    setPriceMax('');
    setMinBedrooms(0);
    setMinBathrooms(0);
  }

  // Apply every active filter client-side against the fetched result set
  const filteredListings = useMemo(() => {
    return listings.filter((l) => {
      if (freeCancellation && !l.freeCancellation) return false;
      if (instantBook && !l.instantBook) return false;
      if (hasTypeFilter && !selectedTypes.includes(l.type)) return false;
      if (priceMin !== '' && l.price < Number(priceMin)) return false;
      if (priceMax !== '' && l.price > Number(priceMax)) return false;
      if (minBedrooms > 0 && l.bedrooms < minBedrooms) return false;
      if (minBathrooms > 0 && l.bathrooms < minBathrooms) return false;
      return true;
    });
  }, [listings, freeCancellation, instantBook, selectedTypes, hasTypeFilter, priceMin, priceMax, minBedrooms, minBathrooms]);

  const resultsCount = filteredListings.length > 0 ? `${filteredListings.length}+` : filteredListings.length;
  const countLabel = loading
    ? 'Finding stays…'
    : locationFilter
    ? `${resultsCount} Airbnb Luxe stays in ${locationFilter}`
    : `${resultsCount} Airbnb Luxe stays available`;

  const priceLabel = hasPriceFilter
    ? `R${priceMin || 0}${priceMax ? ` – R${priceMax}` : '+'}`
    : 'Price';

  const typeLabel = hasTypeFilter
    ? selectedTypes.length === 1
      ? selectedTypes[0]
      : `${selectedTypes.length} types`
    : 'Type of place';

  return (
    <div className="location-page">
      <Header onFilter={handleFilter} defaultLocation={locationFilter} />

      <main className="location-main container">
        {/* ── Results toolbar: count line + filter pill row ── */}
        <div className="results-toolbar">
          <p className="results-count">{countLabel}</p>

          <div className="filter-bar" role="list" aria-label="Filter results">
            {/* Free cancellation — simple toggle */}
            <button
              type="button"
              className={`filter-pill${freeCancellation ? ' filter-pill--active' : ''}`}
              onClick={() => setFreeCancellation((v) => !v)}
              role="listitem"
              aria-pressed={freeCancellation}
            >
              Free cancellation
            </button>

            {/* Type of place — multi-select popover */}
            <div className="filter-pill-wrap" ref={typeRef}>
              <button
                type="button"
                className={`filter-pill${hasTypeFilter ? ' filter-pill--active' : ''}`}
                onClick={() => { setTypeOpen((o) => !o); setPriceOpen(false); setMoreOpen(false); }}
                aria-expanded={typeOpen}
                aria-haspopup="dialog"
              >
                {typeLabel}
              </button>
              {typeOpen && (
                <div className="filter-popover" role="dialog" aria-label="Filter by type of place">
                  {availableTypes.length === 0 && (
                    <p className="filter-popover__empty">No types available yet</p>
                  )}
                  {availableTypes.map((t) => (
                    <label key={t} className="filter-popover__option">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(t)}
                        onChange={() => toggleType(t)}
                      />
                      {t}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Price — min/max range popover */}
            <div className="filter-pill-wrap" ref={priceRef}>
              <button
                type="button"
                className={`filter-pill${hasPriceFilter ? ' filter-pill--active' : ''}`}
                onClick={() => { setPriceOpen((o) => !o); setTypeOpen(false); setMoreOpen(false); }}
                aria-expanded={priceOpen}
                aria-haspopup="dialog"
              >
                {priceLabel}
              </button>
              {priceOpen && (
                <div className="filter-popover filter-popover--price" role="dialog" aria-label="Filter by price range">
                  <label className="filter-popover__field">
                    <span>Min price (R)</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                    />
                  </label>
                  <label className="filter-popover__field">
                    <span>Max price (R)</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="Any"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Instant Book — simple toggle */}
            <button
              type="button"
              className={`filter-pill${instantBook ? ' filter-pill--active' : ''}`}
              onClick={() => setInstantBook((v) => !v)}
              role="listitem"
              aria-pressed={instantBook}
            >
              Instant Book
            </button>

            {/* More filters — bedrooms / bathrooms minimums */}
            <div className="filter-pill-wrap" ref={moreRef}>
              <button
                type="button"
                className={`filter-pill filter-pill--more${hasMoreFilters ? ' filter-pill--active' : ''}`}
                onClick={() => { setMoreOpen((o) => !o); setTypeOpen(false); setPriceOpen(false); }}
                aria-expanded={moreOpen}
                aria-haspopup="dialog"
              >
                <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                  <path d="M1 2h14M4 8h8M6.5 14h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
                </svg>
                More filters
              </button>
              {moreOpen && (
                <div className="filter-popover filter-popover--more" role="dialog" aria-label="More filters">
                  <label className="filter-popover__field">
                    <span>Min bedrooms</span>
                    <input
                      type="number"
                      min="0"
                      value={minBedrooms}
                      onChange={(e) => setMinBedrooms(Math.max(0, Number(e.target.value)))}
                    />
                  </label>
                  <label className="filter-popover__field">
                    <span>Min bathrooms</span>
                    <input
                      type="number"
                      min="0"
                      value={minBathrooms}
                      onChange={(e) => setMinBathrooms(Math.max(0, Number(e.target.value)))}
                    />
                  </label>
                </div>
              )}
            </div>

            {anyFilterActive && (
              <button type="button" className="filter-clear-all" onClick={clearAllFilters}>
                Clear all
              </button>
            )}
          </div>
        </div>

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

        {!loading && !error && listings.length > 0 && filteredListings.length === 0 && (
          <div className="location-status location-status--empty">
            <p className="location-empty__title">No exact matches</p>
            <p className="location-empty__subtitle">
              Try different dates, removing some filters, or a different destination.
            </p>
            <button className="btn btn-outline" onClick={clearAllFilters}>
              Clear filters
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
        {!loading && !error && filteredListings.length > 0 && (
          <div className="listings-grid" aria-label="Available stays">
            {filteredListings.map((listing) => (
              <LocationCard key={listing._id} listing={listing} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

