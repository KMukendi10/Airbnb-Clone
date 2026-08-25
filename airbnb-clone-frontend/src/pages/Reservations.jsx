/**
 * Reservations page – shows the logged-in user's bookings
 * as cards with property image, dates, cost and a cancel button.
 * Redirects to /login if not authenticated.
 */

import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import './Reservations.css';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80';

function fmt(n) {
  return Number(n || 0).toLocaleString('en-ZA');
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function nightsBetween(checkIn, checkOut) {
  const ms = new Date(checkOut) - new Date(checkIn);
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export default function Reservations() {
  const { user, token, loading: authLoading } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (!token) return;
    api
      .getMyReservations(token)
      .then((data) => setReservations(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleCancel(id) {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
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

  // Redirect if not logged in
  if (!authLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="reservations-page">
      <Header />

      <main className="container reservations-main">
        <h1 className="reservations-title">My Trips</h1>

        {/* Loading */}
        {loading && (
          <div className="reservations-status" aria-live="polite">
            <div className="spinner" aria-hidden="true" />
            <p>Loading your trips…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="reservations-status reservations-status--error" role="alert">
            <p>⚠ {error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && reservations.length === 0 && (
          <div className="reservations-empty">
            <div className="reservations-empty__icon" aria-hidden="true">✈️</div>
            <h2 className="reservations-empty__title">No trips booked…yet!</h2>
            <p className="reservations-empty__subtitle">
              Time to dust off your bags and start planning your next adventure.
            </p>
            <Link to="/locations" className="btn btn-dark reservations-empty__btn">
              Start searching
            </Link>
          </div>
        )}

        {/* Reservation cards */}
        {!loading && !error && reservations.length > 0 && (
          <div className="reservations-grid" aria-label="Your reservations">
            {reservations.map((r) => {
              const acc = r.accommodation;
              const image = acc?.images?.[0] || PLACEHOLDER;
              const nights = nightsBetween(r.checkIn, r.checkOut);
              const total = r.totalCost ?? r.totalPrice;

              return (
                <article key={r._id} className="reservation-card">
                  {/* Image */}
                  <Link
                    to={acc?._id ? `/locations/${acc._id}` : '#'}
                    className="reservation-card__img-link"
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    <img
                      src={image}
                      alt={acc?.title ?? 'Property'}
                      className="reservation-card__img"
                      loading="lazy"
                    />
                  </Link>

                  {/* Body */}
                  <div className="reservation-card__body">
                    <p className="reservation-card__location">{acc?.location ?? '—'}</p>
                    <h3 className="reservation-card__title">
                      <Link
                        to={acc?._id ? `/locations/${acc._id}` : '#'}
                        className="reservation-card__title-link"
                      >
                        {acc?.title ?? 'Listing no longer available'}
                      </Link>
                    </h3>

                    <div className="reservation-card__dates">
                      <div className="reservation-card__date-block">
                        <span className="reservation-card__date-label">Check-in</span>
                        <span className="reservation-card__date-value">{fmtDate(r.checkIn)}</span>
                      </div>
                      <span className="reservation-card__date-arrow" aria-hidden="true">→</span>
                      <div className="reservation-card__date-block">
                        <span className="reservation-card__date-label">Checkout</span>
                        <span className="reservation-card__date-value">{fmtDate(r.checkOut)}</span>
                      </div>
                    </div>

                    <div className="reservation-card__footer">
                      <div className="reservation-card__cost">
                        {nights > 0 && (
                          <p className="reservation-card__nights">{nights} night{nights !== 1 ? 's' : ''}</p>
                        )}
                        {total != null && (
                          <p className="reservation-card__total">Total: <strong>R{fmt(total)}</strong></p>
                        )}
                      </div>

                      <button
                        className="btn btn-outline reservation-card__cancel"
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
        )}
      </main>

      <Footer />
    </div>
  );
}
