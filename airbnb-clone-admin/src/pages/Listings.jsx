import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import './Listings.css';

export default function Listings() {
  const { user, token } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    api
      .getMyListings(user._id)
      .then(setListings)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  async function handleDelete(id, title) {
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return;
    try {
      await api.deleteListing(id, token);
      setListings((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <Header />
      <div className="container listings-page">
        <div className="listings-header">
          <h1>My Listings</h1>
          <Link to="/listings/new" className="btn btn-primary">
            + Create Listing
          </Link>
        </div>

        {loading && <p className="listings-status">Loading…</p>}
        {error && <p className="listings-status listings-error">{error}</p>}
        {!loading && listings.length === 0 && !error && (
          <p className="listings-status">No listings yet. Create your first one.</p>
        )}

        <div className="listings-table">
          {listings.map((listing) => (
            <div className="listing-row" key={listing._id}>
              <img
                src={listing.images?.[0] || 'https://placehold.co/120x90?text=Listing'}
                alt={listing.title}
                className="listing-row-img"
              />
              <div className="listing-row-info">
                <h3>{listing.title}</h3>
                <p>{listing.description}</p>
                <p className="listing-row-meta">
                  {listing.location} · R{listing.price}/night
                </p>
              </div>
              <div className="listing-row-actions">
                <Link to={`/listings/${listing._id}/edit`} className="btn btn-primary">
                  Update
                </Link>
                <button className="btn btn-danger" onClick={() => handleDelete(listing._id, listing.title)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
