/**
 * Admin Reservations page – incoming bookings for all of the
 * host's listings displayed as a rich card list (mobile-friendly)
 * with a summary stats bar at the top.
 */

import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import './Reservations.css';

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=200&q=70';

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function nightsBetween(a, b) {
  return Math.max(0, Math.round((new Date(b) - new Date(a)) / 86_400_000));
}

function fmt(n) {
  return Number(n || 0).toLocaleString('en-ZA');
}

/** Derive quick stats from the reservations array */
function calcStats(list) {
  const total = list.length;
  const revenue = list.reduce((s, r) => s + (r.totalCost ?? r.totalPrice ?? 0), 0);
  const nights = list.reduce((s, r) => s + nightsBetween(r.checkIn, r.checkOut), 0);
  return { total, revenue, nights };
}

/* Status pill colour map */
const STATUS_CLASS = {
  confirmed: 'res-status--confirmed',
  pending:   'res-status--pending',
  cancelled: 'res-status--cancelled',
};

export default function Reservations() {
  const { token } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    api
      .getHostReservations(token)
      .then((data) => setReservations(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleCancel(id) {
    if (!window.confirm('Cancel this reservation? This cannot be undone.')) return;
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

  const stats = calcStats(reservations);

  return (
    <div className="res-page-wrapper">
      <Header />

      <main>
        {/* ══════════════════════════════════════
            Stats banner
        ══════════════════════════════════════ */}
        <section className="res-banner">
          <div className="container res-banner__inner">
            <div className="res-banner__text">
              <h1 className="res-banner__title">Incoming Reservations</h1>
              <p className="res-banner__subtitle">
                Track and manage all bookings for your properties.
              </p>
            </div>

            <div className="res-stats">
              <div className="res-stat-card">
                <span className="res-stat-card__icon" aria-hidden="true">📋</span>
                <p className="res-stat-card__value">{loading ? '—' : stats.total}</p>
                <p className="res-stat-card__label">Total bookings</p>
              </div>
              <div className="res-stat-card">
                <span className="res-stat-card__icon" aria-hidden="true">🌙</span>
                <p className="res-stat-card__value">{loading ? '—' : stats.nights}</p>
                <p className="res-stat-card__label">Total nights</p>
              </div>
              <div className="res-stat-card">
                <span className="res-stat-card__icon" aria-hidden="true">💰</span>
                <p className="res-stat-card__value">
                  {loading ? '—' : `R${fmt(stats.revenue)}`}
                </p>
                <p className="res-stat-card__label">Total revenue</p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════
            Content
        ══════════════════════════════════════ */}
        <div className="container res-body">

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

          {/* ── Reservation cards ── */}
          {!loading && !error && reservations.length > 0 && (
            <>
              {/* Desktop table */}
              <div className="res-table-wrap" aria-label="Reservations table">
                <table className="res-table">
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Guest</th>
                      <th>Check-in</th>
                      <th>Check-out</th>
                      <th>Nights</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((r) => {
                      const nights = nightsBetween(r.checkIn, r.checkOut);
                      const total  = r.totalCost ?? r.totalPrice;
                      const status = r.status ?? 'confirmed';
                      const acc    = r.accommodation;

                      return (
                        <tr key={r._id}>
                          {/* Property cell with thumbnail */}
                          <td className="res-table__property">
                            <img
                              src={acc?.images?.[0] || PLACEHOLDER}
                              alt={acc?.title ?? 'Property'}
                              className="res-table__thumb"
                              loading="lazy"
                            />
                            <span className="res-table__prop-name">
                              {acc?.title ?? 'Listing removed'}
                            </span>
                          </td>
                          <td className="res-table__guest">{r.user?.username ?? '—'}</td>
                          <td>{fmtDate(r.checkIn)}</td>
                          <td>{fmtDate(r.checkOut)}</td>
                          <td className="res-table__nights">{nights}</td>
                          <td className="res-table__total">
                            {total != null ? `R${fmt(total)}` : '—'}
                          </td>
                          <td>
                            <span className={`res-status ${STATUS_CLASS[status] ?? ''}`}>
                              {status}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleCancel(r._id)}
                              disabled={cancellingId === r._id}
                              aria-busy={cancellingId === r._id}
                            >
                              {cancellingId === r._id ? '…' : 'Cancel'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards (shown below 720px) */}
              <div className="res-cards" aria-label="Reservations">
                {reservations.map((r) => {
                  const nights = nightsBetween(r.checkIn, r.checkOut);
                  const total  = r.totalCost ?? r.totalPrice;
                  const status = r.status ?? 'confirmed';
                  const acc    = r.accommodation;

                  return (
                    <article className="res-card" key={r._id}>
                      <img
                        src={acc?.images?.[0] || PLACEHOLDER}
                        alt={acc?.title ?? 'Property'}
                        className="res-card__img"
                        loading="lazy"
                      />
                      <div className="res-card__body">
                        <div className="res-card__top">
                          <h3 className="res-card__title">
                            {acc?.title ?? 'Listing removed'}
                          </h3>
                          <span className={`res-status ${STATUS_CLASS[status] ?? ''}`}>
                            {status}
                          </span>
                        </div>

                        <p className="res-card__guest">
                          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" fill="currentColor"/></svg>
                          {r.user?.username ?? '—'}
                        </p>

                        <div className="res-card__dates">
                          <div className="res-card__date">
                            <span className="res-card__date-label">Check-in</span>
                            <span className="res-card__date-val">{fmtDate(r.checkIn)}</span>
                          </div>
                          <span className="res-card__arrow" aria-hidden="true">→</span>
                          <div className="res-card__date">
                            <span className="res-card__date-label">Checkout</span>
                            <span className="res-card__date-val">{fmtDate(r.checkOut)}</span>
                          </div>
                        </div>

                        <div className="res-card__footer">
                          <div className="res-card__meta">
                            <span>{nights} night{nights !== 1 ? 's' : ''}</span>
                            {total != null && (
                              <span className="res-card__total">R{fmt(total)}</span>
                            )}
                          </div>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleCancel(r._id)}
                            disabled={cancellingId === r._id}
                            aria-busy={cancellingId === r._id}
                          >
                            {cancellingId === r._id ? 'Cancelling…' : 'Cancel'}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
