import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LocationCard from '../components/LocationCard';
import { api } from '../api/client';
import './Location.css';

export default function Location() {
  const [searchParams, setSearchParams] = useSearchParams();
  const locationFilter = searchParams.get('location') || '';
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    api
      .getAccommodations(locationFilter)
      .then(setListings)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [locationFilter]);

  function handleFilter(newLocation) {
    setSearchParams(newLocation ? { location: newLocation } : {});
  }

  return (
    <>
      <Header onFilter={handleFilter} />

      <div className="container location-page">
        <h1>
          {listings.length} {listings.length === 1 ? 'stay' : 'stays'}
          {locationFilter ? ` in ${locationFilter}` : ''}
        </h1>

        {loading && <p className="location-status">Loading stays…</p>}
        {error && <p className="location-status location-error">{error}</p>}
        {!loading && !error && listings.length === 0 && (
          <p className="location-status">No stays found. Try a different destination.</p>
        )}

        <div className="location-grid">
          {listings.map((listing) => (
            <LocationCard key={listing._id} listing={listing} />
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}
