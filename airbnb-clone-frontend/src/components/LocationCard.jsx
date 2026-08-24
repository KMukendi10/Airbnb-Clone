import { Link } from 'react-router-dom';
import './LocationCard.css';

// used on the Location page - image left, details right, matches the Figma layout
export default function LocationCard({ listing }) {
  const image = listing.images?.[0] || 'https://placehold.co/400x300?text=Listing';

  return (
    <Link to={`/locations/${listing._id}`} className="listing-card">
      <img src={image} alt={listing.title} className="listing-card-img" />
      <div className="listing-card-body">
        <div className="listing-card-top">
          <span className="listing-card-type">{listing.type}</span>
          {listing.rating > 0 && (
            <span className="listing-card-rating">★ {listing.rating.toFixed(1)}</span>
          )}
        </div>
        <h3>{listing.title}</h3>
        <p className="listing-card-amenities">{listing.amenities?.slice(0, 3).join(' · ')}</p>
        {listing.reviews > 0 && <p className="listing-card-reviews">{listing.reviews} reviews</p>}
        <p className="listing-card-price">
          <strong>R{listing.price}</strong> / night
        </p>
      </div>
    </Link>
  );
}
