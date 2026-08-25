import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import './Reservations.css';

export default function Reservations() {
  const { user, token, loading: authLoading } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    api
      .getMyReservations(token)
      .then(setReservations)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleCancel(id) {
    try {
      await api.cancelReservation(id, token);
      setReservations((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  if (!authLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Header />
      <div className="container reservations-page">
        <h1>My reservations</h1>

        {loading && <p className="reservations-status">Loading…</p>}
        {error && <p className="reservations-status reservations-error">{error}</p>}
        {!loading && reservations.length === 0 && !error && (
          <p className="reservations-status">You don&apos;t have any reservations yet.</p>
        )}

        {reservations.length > 0 && (
          <table className="reservations-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r._id}>
                  <td>{r.accommodation?.title || 'Listing removed'}</td>
                  <td>{new Date(r.checkIn).toLocaleDateString()}</td>
                  <td>{new Date(r.checkOut).toLocaleDateString()}</td>
                  <td>R{r.totalCost ?? r.totalPrice ?? '—'}</td>
                  <td>
                    <button className="btn-cancel" onClick={() => handleCancel(r._id)}>
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Footer />
    </>
  );
}
