import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ListingForm from '../components/ListingForm';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function CreateListing() {
  const { token } = useAuth();
  const navigate = useNavigate();

  async function handleCreate(payload) {
    await api.createListing(payload, token);
    navigate('/');
  }

  return (
    <>
      <Header />
      <ListingForm submitLabel="Save" onSubmit={handleCreate} onCancel={() => navigate('/')} />
    </>
  );
}
