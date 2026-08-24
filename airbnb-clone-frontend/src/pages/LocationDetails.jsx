import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import './LocationDetails.css';

function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const ms = new Date(checkOut) - new Date(checkIn);
  const nights = Math.round(ms / (1000 * 60 * 60 * 24));
  return nights > 0 ? nights : 0;
}

export default function LocationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [reserving, setReserving] = useState(false);
  const [reserveMessage, setReserveMessage] = useState('');

  useEffect(() => {
    api
      .getAccommodation(id)
      .then(setListing)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // dynamic cost breakdown - recalculates any time dates or the listing change
  const costBreakdown = useMemo(() => {
    if (!listing) return null;
    const nights = nightsBetween(checkIn, checkOut);
    const subtotal = nights * listing.price;
    const weeklyDiscountAmount =
      nights >= 7 ? Math.round((subtotal * (listing.weeklyDiscount || 0)) / 100) : 0;
    const cleaningFee = listing.cleaningFee || 0;
    const serviceFee = listing.serviceFee || 0;
    const occupancyTaxes = listing.occupancyTaxes || 0;
    const total = subtotal - weeklyDiscountAmount + cleaningFee + serviceFee + occupancyTaxes;

    return { nights, subtotal, weeklyDiscountAmount, cleaningFee, serviceFee, occupancyTaxes, total };
  }, [listing, checkIn, checkOut]);

  async function handleReserve() {
    setReserveMessage('');

    if (!user) {
      navigate('/login');
      return;
    }
    if (!checkIn || !checkOut || costBreakdown.nights <= 0) {
      setReserveMessage('Pick valid check-in and check-out dates first.');
      return;
    }

    setReserving(true);
    try {
      await api.createReservation(
        {
          accommodation: listing._id,
          checkIn,
          checkOut,
          guests,
          totalPrice: costBreakdown.total,
        },
        token
      );
      setReserveMessage('Reservation confirmed! Check "View reservations" in your profile menu.');
    } catch (err) {
      setReserveMessage(err.message);
    } finally {
      setReserving(false);
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="container details-status">Loading listing…</div>
        <Footer />
      </>
    );
  }

  if (error || !listing) {
    return (
      <>
        <Header />
        <div className="container details-status details-error">{error || 'Listing not found.'}</div>
        <Footer />
      </>
    );
  }

  const [mainImage, ...smallImages] = listing.images?.length
    ? listing.images
    : ['https://placehold.co/800x500?text=Listing'];

  return (
    <>
      <Header />

      <div className="container details-page">
        <div className="details-heading">
          <h1>
            {listing.type} in {listing.location}
          </h1>
          <p className="details-subheading">
            {listing.rating > 0 && <span>★ {listing.rating.toFixed(1)}</span>}
            {listing.reviews > 0 && <span> · {listing.reviews} reviews</span>}
            <span> · {listing.location}</span>
          </p>
        </div>

        <div className="details-gallery">
          <img src={mainImage} alt={listing.title} className="gallery-main" />
          <div className="gallery-small">
            {[0, 1, 2, 3].map((i) => (
              <img
                key={i}
                src={smallImages[i] || mainImage}
                alt={`${listing.title} ${i + 2}`}
                className="gallery-thumb"
              />
            ))}
          </div>
        </div>

        <div className="details-columns">
          <div className="details-main">
            <h2>{listing.title}</h2>
            <p className="details-meta">
              {listing.guests} guests · {listing.bedrooms} bedrooms · {listing.bathrooms} bathrooms
            </p>

            <p className="details-description">{listing.description}</p>

            <hr />

            <h3>What this place offers</h3>
            <ul className="amenities-list">
              {(listing.amenities?.length ? listing.amenities : ['No amenities listed']).map((a) => (
                <li key={a}>✓ {a}</li>
              ))}
            </ul>

            <hr />

            <h3>Things to know</h3>
            <div className="policy-grid">
              <div>
                <h4>House Rules</h4>
                <p>Check-in after 3:00pm · Checkout before 11:00am · No smoking</p>
              </div>
              <div>
                <h4>Health &amp; Safety</h4>
                <p>Enhanced cleaning{listing.enhancedCleaning ? ' applied' : ' available on request'}</p>
              </div>
              <div>
                <h4>Cancellation Policy</h4>
                <p>Free cancellation for 48 hours after booking</p>
              </div>
            </div>
          </div>

          <aside className="cost-calculator">
            <p className="calc-price">
              <strong>R{listing.price}</strong> / night
            </p>

            <div className="calc-dates">
              <label>
                Check-in
                <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
              </label>
              <label>
                Check-out
                <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
              </label>
            </div>

            <label className="calc-guests">
              Guests
              <select value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
                {Array.from({ length: listing.guests || 1 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n} guest{n > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </label>

            <button className="btn btn-primary calc-reserve" onClick={handleReserve} disabled={reserving}>
              {reserving ? 'Reserving…' : 'Reserve'}
            </button>

            {reserveMessage && <p className="calc-message">{reserveMessage}</p>}

            {costBreakdown.nights > 0 && (
              <div className="calc-breakdown">
                <div>
                  <span>
                    R{listing.price} × {costBreakdown.nights} night{costBreakdown.nights > 1 ? 's' : ''}
                  </span>
                  <span>R{costBreakdown.subtotal}</span>
                </div>
                {costBreakdown.weeklyDiscountAmount > 0 && (
                  <div>
                    <span>Weekly discount</span>
                    <span>-R{costBreakdown.weeklyDiscountAmount}</span>
                  </div>
                )}
                <div>
                  <span>Cleaning fee</span>
                  <span>R{costBreakdown.cleaningFee}</span>
                </div>
                <div>
                  <span>Service fee</span>
                  <span>R{costBreakdown.serviceFee}</span>
                </div>
                <div>
                  <span>Occupancy taxes and fees</span>
                  <span>R{costBreakdown.occupancyTaxes}</span>
                </div>
                <div className="calc-total">
                  <span>Total</span>
                  <span>R{costBreakdown.total}</span>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      <Footer />
    </>
  );
}
