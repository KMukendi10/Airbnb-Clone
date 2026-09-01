/**
 * Admin Reservations page – matches the Figma "My Reservations" table:
 * Booked by / Property / Checkin / Checkout / Actions, with a red
 * Delete button per row.
 */

import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import './Reservations.css';

function fmtDate(iso) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

export default function Reservations() {
  const { token } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    api
      .getHostReservations(token)
      .then((data) => setReservations(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleDelete(id) {
    if (!window.confirm('Delete this reservation? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.cancelReservation(id, token);
      setReservations((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="res-page-wrapper">
      <Header />

      <main className="container res-body">
        <h1 className="res-heading">My Reservations</h1>

        {/* Loading */}
        {loading && (
          <div className="res-status-panel" aria-live="polite">
            <div className="spinner" aria-hidden="true" />
            <p>Loading reservations…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="res-status-panel res-status-panel--error" role="alert">
            <p>⚠ {error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && reservations.length === 0 && (
          <div className="res-empty">
            <div className="res-empty__icon" aria-hidden="true">📭</div>
            <h2 className="res-empty__title">No reservations yet</h2>
            <p className="res-empty__subtitle">
              When guests book your listings, their reservations will appear here.
            </p>
          </div>
        )}

        {/* ── Reservations table ── */}
        {!loading && !error && reservations.length > 0 && (
          <div className="res-table-wrap" aria-label="Reservations table">
            <table className="res-table">
              <thead>
                <tr>
                  <th>Booked by</th>
                  <th>Property</th>
                  <th>Checkin</th>
                  <th>Checkout</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => {
                  const acc = r.accommodation;

                  return (
                    <tr key={r._id}>
                      <td>{r.user?.username ?? '—'}</td>
                      <td>{acc?.title ?? 'Listing removed'}</td>
                      <td>{fmtDate(r.checkIn)}</td>
                      <td>{fmtDate(r.checkOut)}</td>
                      <td>
                        <button
                          className="res-delete-btn"
                          onClick={() => handleDelete(r._id)}
                          disabled={deletingId === r._id}
                          aria-busy={deletingId === r._id}
                        >
                          {deletingId === r._id ? '…' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
