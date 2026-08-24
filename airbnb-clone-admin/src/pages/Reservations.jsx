import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import './Reservations.css';

export default function Reservations() {
  const { token } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getHostReservations(token)
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

  return (
    <>
      <Header />
      <div className="container reservations-page">
        <h1>My Reservations</h1>

        {loading && <p className="listings-status">Loading…</p>}
        {error && <p className="listings-status listings-error">{error}</p>}
        {!loading && reservations.length === 0 && !error && (
          <p className="listings-status">No reservations yet.</p>
        )}

        {reservations.length > 0 && (
          <table className="admin-res-table">
            <thead>
              <tr>
                <th>Created by</th>
                <th>Property</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r._id}>
                  <td>{r.user?.username || 'Unknown'}</td>
                  <td>{r.accommodation?.title || 'Listing removed'}</td>
                  <td>{new Date(r.checkIn).toLocaleDateString()}</td>
                  <td>{new Date(r.checkOut).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-danger" onClick={() => handleCancel(r._id)}>
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
