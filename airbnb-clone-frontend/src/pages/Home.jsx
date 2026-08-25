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

// ── Getaway tabs data ──────────────────────────────────────
const GETAWAY_TABS = ['Amazing views', 'Beachfront', 'Cabins', 'Trending'];

const GETAWAY_CARDS = {
  'Amazing views': [
    { id: 1, city: 'Drakensberg', country: 'South Africa', price: 'From R1 200/night', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80' },
    { id: 2, city: 'Table Mountain', country: 'South Africa', price: 'From R2 100/night', image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=400&q=80' },
    { id: 3, city: 'Pilanesberg', country: 'South Africa', price: 'From R850/night', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
    { id: 4, city: 'Tsitsikamma', country: 'South Africa', price: 'From R950/night', image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=80' },
  ],
  'Beachfront': [
    { id: 5, city: 'Clifton', country: 'Cape Town', price: 'From R3 500/night', image: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=400&q=80' },
    { id: 6, city: 'Umhlanga', country: 'Durban', price: 'From R1 800/night', image: 'https://images.unsplash.com/photo-1600002415506-dd746cef5356?w=400&q=80' },
    { id: 7, city: 'Plettenberg Bay', country: 'South Africa', price: 'From R2 200/night', image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&q=80' },
    { id: 8, city: 'Hermanus', country: 'Western Cape', price: 'From R1 500/night', image: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=400&q=80' },
  ],
  'Cabins': [
    { id: 9, city: 'Clarens', country: 'Free State', price: 'From R780/night', image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=400&q=80' },
    { id: 10, city: 'Dullstroom', country: 'Mpumalanga', price: 'From R650/night', image: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=400&q=80' },
    { id: 11, city: 'Hazyview', country: 'Limpopo', price: 'From R900/night', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80' },
    { id: 12, city: 'Swellendam', country: 'Western Cape', price: 'From R720/night', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80' },
  ],
  'Trending': [
    { id: 13, city: 'Johannesburg', country: 'Gauteng', price: 'From R1 100/night', image: 'https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=400&q=80' },
    { id: 14, city: 'Kruger', country: 'South Africa', price: 'From R1 600/night', image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400&q=80' },
    { id: 15, city: 'Franschhoek', country: 'Western Cape', price: 'From R2 400/night', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80' },
    { id: 16, city: 'Mossel Bay', country: 'Western Cape', price: 'From R980/night', image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80' },
  ],
};

export default function Home() {
  const [activeTab, setActiveTab] = useState('Amazing views');
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
          {INSPIRATION_CARDS.map((card) => (
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
              <div className="inspiration-card__body">
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
              onClick={() => setActiveTab(tab)}
              role="tab"
              aria-selected={activeTab === tab}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="getaways-grid" role="tabpanel" aria-label={activeTab}>
          {GETAWAY_CARDS[activeTab].map((card) => (
            <article
              key={card.id}
              className="getaway-card"
              onClick={() => navigate(`/locations?location=${encodeURIComponent(card.city)}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/locations?location=${encodeURIComponent(card.city)}`)}
            >
              <div className="getaway-card__img-wrap">
                <img src={card.image} alt={card.city} className="getaway-card__img" loading="lazy" />
              </div>
              <div className="getaway-card__body">
                <p className="getaway-card__city">{card.city}</p>
                <p className="getaway-card__country">{card.country}</p>
                <p className="getaway-card__price">{card.price}</p>
              </div>
            </article>
          ))}
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
              className="btn btn-dark hosting-banner__btn"
              onClick={() => navigate('/login')}
            >
              Learn more
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
