import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import ListingForm from '../components/ListingForm';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

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

  if (loading) {
    return (
      <>
        <Header />
        <div className="container listing-form-page">
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0', color: 'var(--color-text-muted)' }}>
            Loading listing…
          </div>
        </div>
      </>
    );
  }

  if (error || !listing) {
    return (
      <>
        <Header />
        <div className="container listing-form-page">
          <div style={{ color: 'var(--color-danger)', padding: '80px 0', textAlign: 'center' }}>
            {error || 'Listing not found.'}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container listing-form-page">
        <ListingForm
          initialValues={listing}
          submitLabel="Update"
          onSubmit={handleUpdate}
          onCancel={() => navigate('/')}
        />
      </div>
    </>
  );
}
