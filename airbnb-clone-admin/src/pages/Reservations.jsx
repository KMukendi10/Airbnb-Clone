/**
 * Admin Reservations page – host's incoming reservations
 * displayed as a styled table with guest, property, dates
 * and a cancel action.
 */

import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import './Reservations.css';

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function nightsBetween(a, b) {
  return Math.max(0, Math.round((new Date(b) - new Date(a)) / 86400000));
}

export default function Reservations() {
  const { token } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    api
      .getHostReservations(token)
      .then((data) => setReservations(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleCancel(id) {
    if (!window.confirm('Cancel this reservation?')) return;
    setCancellingId(id);
    try {
      await api.cancelReservation(id, token);
      setReservations((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <>
      <Header />
      <main className="container reservations-admin-page">
        <div className="res-admin-header">
          <h1 className="res-admin-title">Incoming Reservations</h1>
          <p className="res-admin-subtitle">
            {loading ? '—' : reservations.length} booking{reservations.length !== 1 ? 's' : ''}
          </p>
        </div>

        {loading && (
          <div className="res-admin-status" aria-live="polite">
            <div className="spinner" style={{ borderTopColor: 'var(--color-primary)' }} aria-hidden="true" />
            <p>Loading reservations…</p>
          </div>
        )}

        {!loading && error && (
          <p className="res-admin-status res-admin-error" role="alert">⚠ {error}</p>
        )}

        {!loading && !error && reservations.length === 0 && (
          <div className="res-admin-empty">
            <p className="res-admin-empty__title">No reservations yet.</p>
            <p className="res-admin-empty__subtitle">When guests book your listings, they'll appear here.</p>
          </div>
        )}

        {!loading && !error && reservations.length > 0 && (
          <div className="admin-res-table-wrap">
            <table className="admin-res-table">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Property</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Nights</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => {
                  const nights = nightsBetween(r.checkIn, r.checkOut);
                  const total = r.totalCost ?? r.totalPrice;
                  return (
                    <tr key={r._id}>
                      <td className="res-guest">{r.user?.username ?? '—'}</td>
                      <td className="res-property">{r.accommodation?.title ?? 'Listing removed'}</td>
                      <td>{fmtDate(r.checkIn)}</td>
                      <td>{fmtDate(r.checkOut)}</td>
                      <td>{nights}</td>
                      <td>{total != null ? `R${Number(total).toLocaleString()}` : '—'}</td>
                      <td>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '7px 14px', fontSize: '12px' }}
                          onClick={() => handleCancel(r._id)}
                          disabled={cancellingId === r._id}
                          aria-busy={cancellingId === r._id}
                        >
                          {cancellingId === r._id ? 'Cancelling…' : 'Cancel'}
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
    </>
  );
}
