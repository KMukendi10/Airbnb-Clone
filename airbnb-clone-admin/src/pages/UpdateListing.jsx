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
        <p className="listings-status" style={{ textAlign: 'center', marginTop: 40 }}>
          Loading listing…
        </p>
      </>
    );
  }

  if (error || !listing) {
    return (
      <>
        <Header />
        <p className="listings-status listings-error" style={{ textAlign: 'center', marginTop: 40 }}>
          {error || 'Listing not found.'}
        </p>
      </>
    );
  }

  return (
    <>
      <Header />
      <ListingForm
        initialValues={listing}
        submitLabel="Update"
        onSubmit={handleUpdate}
        onCancel={() => navigate('/')}
      />
    </>
  );
}
