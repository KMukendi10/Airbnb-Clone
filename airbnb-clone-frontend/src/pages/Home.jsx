/**
 * Home page – mirrors the Airbnb homepage design:
 *   1. Hero with full-screen background + search bar
 *   2. Inspiration cards (destination grid)
 *   3. Discover Airbnb Experiences (two CTA cards)
 *   4. Shop Airbnb Gift Cards
 *   5. Inspiration for Future Getaways (tabs)
 *   6. Questions About Hosting banner
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Home.css';

// ── Inspiration destinations data ──────────────────────────
const INSPIRATION_CARDS = [
  {
    id: 1,
    city: 'Cape Town',
    time: '1 hour away',
    image:
      'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&q=80',
  },
  {
    id: 2,
    city: 'Johannesburg',
    time: '2 hours away',
    image:
      'https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=600&q=80',
  },
  {
    id: 3,
    city: 'Durban',
    time: '3 hours away',
    image:
      'https://images.unsplash.com/photo-1600002415506-dd746cef5356?w=600&q=80',
  },
  {
    id: 4,
    city: 'Pretoria',
    time: '30 min away',
    image:
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  },
  {
    id: 5,
    city: 'Port Elizabeth',
    time: '4 hours away',
    image:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
  },
  {
    id: 6,
    city: 'Stellenbosch',
    time: '1.5 hours away',
    image:
      'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=600&q=80',
  },
  {
    id: 7,
    city: 'Knysna',
    time: '5 hours away',
    image:
      'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80',
  },
  {
    id: 8,
    city: 'Bloemfontein',
    time: '4 hours away',
    image:
      'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=600&q=80',
  },
];

// Colour rotation for the inspiration cards, per Figma (pink/magenta/red/orange)
const INSPIRATION_COLORS = ['#E31C5F', '#B0219E', '#E1264A', '#E0562C'];

// ── Getaway tabs data (plain text destination grid, per Figma) ──
const GETAWAY_TABS = [
  'Destinations for arts & culture',
  'Destinations for outdoor adventure',
  'Mountain cabins',
  'Beach destinations',
  'Popular destinations',
  'Unique Stays',
];

const GETAWAY_DESTINATIONS = {
  'Destinations for arts & culture': [
    { id: 1, city: 'Johannesburg', country: 'Gauteng' },
    { id: 2, city: 'Cape Town', country: 'Western Cape' },
    { id: 3, city: 'Pretoria', country: 'Gauteng' },
    { id: 4, city: 'Durban', country: 'KwaZulu-Natal' },
    { id: 5, city: 'Stellenbosch', country: 'Western Cape' },
    { id: 6, city: 'Barcelona', country: 'Catalonia' },
    { id: 7, city: 'Prague', country: 'Czechia' },
    { id: 8, city: 'Washington', country: 'District of Columbia' },
    { id: 9, city: 'Keswick', country: 'England' },
    { id: 10, city: 'London', country: 'England' },
    { id: 11, city: 'Scarborough', country: 'England' },
  ],
  'Destinations for outdoor adventure': [
    { id: 12, city: 'Drakensberg', country: 'KwaZulu-Natal' },
    { id: 13, city: 'Kruger', country: 'Mpumalanga' },
    { id: 14, city: 'Tsitsikamma', country: 'Eastern Cape' },
    { id: 15, city: 'Pilanesberg', country: 'North West' },
  ],
  'Mountain cabins': [
    { id: 16, city: 'Dullstroom', country: 'Mpumalanga' },
    { id: 17, city: 'Clarens', country: 'Free State' },
    { id: 18, city: 'Hazyview', country: 'Limpopo' },
    { id: 19, city: 'Swellendam', country: 'Western Cape' },
  ],
  'Beach destinations': [
    { id: 20, city: 'Umhlanga', country: 'KwaZulu-Natal' },
    { id: 21, city: 'Clifton', country: 'Western Cape' },
    { id: 22, city: 'Hermanus', country: 'Western Cape' },
    { id: 23, city: 'Plettenberg Bay', country: 'Western Cape' },
  ],
  'Popular destinations': [
    { id: 24, city: 'Johannesburg', country: 'Gauteng' },
    { id: 25, city: 'Cape Town', country: 'Western Cape' },
    { id: 26, city: 'Durban', country: 'KwaZulu-Natal' },
    { id: 27, city: 'Phoenix', country: 'Arizona' },
    { id: 28, city: 'Los Angeles', country: 'California' },
    { id: 29, city: 'San Diego', country: 'California' },
    { id: 30, city: 'San Francisco', country: 'California' },
    { id: 31, city: 'Hot Springs', country: 'Arkansas' },
  ],
  'Unique Stays': [
    { id: 32, city: 'Franschhoek', country: 'Western Cape' },
    { id: 33, city: 'Mossel Bay', country: 'Western Cape' },
    { id: 34, city: 'Knysna', country: 'Western Cape' },
    { id: 35, city: 'Bloemfontein', country: 'Free State' },
  ],
};

export default function Home() {
  const [activeTab, setActiveTab] = useState(GETAWAY_TABS[0]);
  const [showAllGetaways, setShowAllGetaways] = useState(false);
  const navigate = useNavigate();

  function handleFilter(location) {
    navigate(`/locations?location=${encodeURIComponent(location)}`);
  }

  return (
    <div className="home-page">
      <Header onFilter={handleFilter} />

      {/* ════════════════════════════════════════
          1. Hero Section
      ════════════════════════════════════════ */}
      <section className="hero" aria-label="Hero banner">
        <div className="hero-bg">
          <img
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1800&q=90"
            alt="Modern luxury home"
            className="hero-image"
          />
          <div className="hero-overlay" aria-hidden="true" />
        </div>

        <div className="hero-content">
          <p className="hero-tagline">Not sure where to go? Perfect.</p>
          <button
            className="btn hero-flexible-btn"
            onClick={() => navigate('/locations')}
          >
            I&rsquo;m flexible
          </button>
        </div>
      </section>

      {/* ════════════════════════════════════════
          2. Inspiration cards
      ════════════════════════════════════════ */}
      <section className="section inspiration-section container" aria-label="Inspiration for your next trip">
        <h2 className="section-title">Inspiration for your next trip</h2>
        <div className="inspiration-grid">
          {INSPIRATION_CARDS.map((card, i) => (
            <article
              key={card.id}
              className="inspiration-card"
              onClick={() => navigate(`/locations?location=${encodeURIComponent(card.city)}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/locations?location=${encodeURIComponent(card.city)}`)}
              aria-label={`Explore ${card.city}`}
            >
              <div className="inspiration-card__img-wrap">
                <img src={card.image} alt={card.city} className="inspiration-card__img" loading="lazy" />
              </div>
              <div
                className="inspiration-card__body"
                style={{ backgroundColor: INSPIRATION_COLORS[i % INSPIRATION_COLORS.length] }}
              >
                <p className="inspiration-card__city">{card.city}</p>
                <p className="inspiration-card__time">{card.time}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          3. Discover Airbnb Experiences
      ════════════════════════════════════════ */}
      <section className="section experiences-section container" aria-label="Discover Airbnb Experiences">
        <h2 className="section-title">Discover Airbnb Experiences</h2>
        <div className="experiences-grid">
          <article className="experience-card" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=80')" }}>
            <div className="experience-card__body">
              <h3 className="experience-card__title">Things to do on your trip</h3>
              <button
                className="btn experience-card__btn"
                onClick={() => navigate('/locations')}
              >
                Experiences
              </button>
            </div>
          </article>

          <article className="experience-card" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80')" }}>
            <div className="experience-card__body">
              <h3 className="experience-card__title">Things to do from home</h3>
              <button
                className="btn experience-card__btn"
                onClick={() => navigate('/locations')}
              >
                Online Experiences
              </button>
            </div>
          </article>
        </div>
      </section>

      {/* ════════════════════════════════════════
          4. Shop Airbnb Gift Cards
      ════════════════════════════════════════ */}
      <section className="section shop-section container" aria-label="Shop Airbnb gift cards">
        <div className="shop-card">
          <div className="shop-card__text">
            <h2 className="shop-card__title">Shop Airbnb gift cards</h2>
            <p className="shop-card__description">
              Give the gift of travel to the people who matter most.
            </p>
            <button
              className="btn btn-dark shop-card__btn"
              onClick={() => navigate('/locations')}
            >
              Shop now
            </button>
          </div>
          <div className="shop-card__image-wrap">
            <img
              src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=700&q=80"
              alt="Airbnb gift cards"
              className="shop-card__image"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          5. Future Getaways (tabs)
      ════════════════════════════════════════ */}
      <section className="section getaways-section container" aria-label="Inspiration for future getaways">
        <h2 className="section-title">Inspiration for future getaways</h2>

        {/* Tab bar */}
        <div className="getaways-tabs" role="tablist">
          {GETAWAY_TABS.map((tab) => (
            <button
              key={tab}
              className={`getaways-tab${activeTab === tab ? ' getaways-tab--active' : ''}`}
              onClick={() => {
                setActiveTab(tab);
                setShowAllGetaways(false);
              }}
              role="tab"
              aria-selected={activeTab === tab}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Plain text destination grid, per Figma */}
        <div className="getaways-grid" role="tabpanel" aria-label={activeTab}>
          {(showAllGetaways
            ? GETAWAY_DESTINATIONS[activeTab]
            : GETAWAY_DESTINATIONS[activeTab].slice(0, 12)
          ).map((dest) => (
            <button
              key={dest.id}
              className="getaway-link"
              onClick={() => navigate(`/locations?location=${encodeURIComponent(dest.city)}`)}
            >
              <span className="getaway-link__city">{dest.city}</span>
              <span className="getaway-link__country">{dest.country}</span>
            </button>
          ))}
          {!showAllGetaways && GETAWAY_DESTINATIONS[activeTab].length > 12 && (
            <button className="getaway-link getaway-link--more" onClick={() => setShowAllGetaways(true)}>
              <span className="getaway-link__city getaway-link__city--underline">Show more</span>
            </button>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════
          6. Questions About Hosting
      ════════════════════════════════════════ */}
      <section className="section hosting-banner" aria-label="Questions about hosting">
        <div className="hosting-banner__inner container">
          <div className="hosting-banner__text">
            <h2 className="hosting-banner__title">Questions about hosting?</h2>
            <p className="hosting-banner__subtitle">
              Ask a Superhost — We'll match you with an experienced host in your area.
            </p>
            <button
              className="btn hosting-banner__btn"
              onClick={() => navigate('/login')}
            >
              Ask a Superhost
            </button>
          </div>
          <div className="hosting-banner__image-wrap" aria-hidden="true">
            <img
              src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80"
              alt=""
              className="hosting-banner__image"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
