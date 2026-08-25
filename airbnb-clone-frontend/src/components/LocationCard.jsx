/**
 * LocationCard – Airbnb-style vertical card used in the
 * search/listing grid. Shows a large image on top with
 * property details below (type badge, title, amenities,
 * rating, price).
 */

import { Link } from 'react-router-dom';
import './LocationCard.css';

// Fallback placeholder when no image URL is provided
const PLACEHOLDER = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80';

export default function LocationCard({ listing }) {
  const {
    _id,
    title,
    type,
    location,
    price,
    rating,
    reviews,
    amenities = [],
    images = [],
  } = listing;

  const image = images[0] || PLACEHOLDER;
  const displayAmenities = amenities.slice(0, 3).join(' · ');
  const hasRating = rating > 0;

  return (
    <Link to={`/locations/${_id}`} className="loc-card" aria-label={`View ${title}`}>
      {/* ── Image ── */}
      <div className="loc-card__img-wrap">
        <img
          src={image}
          alt={title}
          className="loc-card__img"
          loading="lazy"
        />
        {/* Type badge */}
        <span className="loc-card__badge">{type}</span>
        {/* Wishlist button (decorative in this demo) */}
        <button
          className="loc-card__wishlist"
          aria-label="Save to wishlist"
          onClick={(e) => e.preventDefault()}
        >
          <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
            <path
              d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-7c-1.8 0-3.58.68-4.95 2.05L16 8.1l-2.05-2.05a6.98 6.98 0 0 0-9.9 9.9L16 28z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </button>
      </div>

      {/* ── Body ── */}
      <div className="loc-card__body">
        <div className="loc-card__row">
          <p className="loc-card__location">{location}</p>
          {hasRating && (
            <span className="loc-card__rating" aria-label={`Rating: ${rating.toFixed(1)}`}>
              ★ {rating.toFixed(1)}
            </span>
          )}
        </div>

        <p className="loc-card__title">{title}</p>

        {displayAmenities && (
          <p className="loc-card__amenities">{displayAmenities}</p>
        )}

        {reviews > 0 && (
          <p className="loc-card__reviews">{reviews} review{reviews !== 1 ? 's' : ''}</p>
        )}

        <p className="loc-card__price">
          <span className="loc-card__price-amount">R{price.toLocaleString()}</span>
          <span className="loc-card__price-night"> / night</span>
        </p>
      </div>
    </Link>
  );
}
