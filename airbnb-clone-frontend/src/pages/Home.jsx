/**
 * Home page – mirrors the Airbnb homepage Figma design:
 *   1. Hero with full-screen background + transparent header + search bar
 *   2. Inspiration hotel cards
 *   3. Discover Airbnb Experiences (two CTA cards)
 *   4. Shop Airbnb Gift Cards (text left, fanned cards right)
 *   5. Inspiration for Future Getaways (tabs + text grid)
 *   6. Questions About Hosting (full-bleed dark banner)
 *   7. Footer
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Home.css';

// ── Inspiration hotel cards (matches Figma) ─────────────────
const INSPIRATION_CARDS = [
  {
    id: 1,
    city: 'Sandton City Hotel',
    time: '53 km away',
    location: 'Johannesburg',
    image: 'https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=600&q=80',
  },
  {
    id: 2,
    city: 'Joburg City Hotel',
    time: '168 km away',
    location: 'Johannesburg',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
  },
  {
    id: 3,
    city: 'Woodmead Hotel',
    time: '30 miles away',
    location: 'Johannesburg',
    image: 'https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=600&q=80',
  },
  {
    id: 4,
    city: 'Hyde Park Hotel',
    time: '34 km away',
    location: 'Johannesburg',
    image: 'https://images.unsplash.com/photo-1549517045-bc93de075e53?w=600&q=80',
  },
  {
    id: 5,
    city: 'Cape Town Waterfront',
    time: '1 hour away',
    location: 'Cape Town',
    image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&q=80',
  },
  {
    id: 6,
    city: 'Stellenbosch Manor',
    time: '1.5 hours away',
    location: 'Stellenbosch',
    image: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=600&q=80',
  },
  {
    id: 7,
    city: 'Durban Beachfront',
    time: '3 hours away',
    location: 'Durban',
    image: 'https://images.unsplash.com/photo-1600002415506-dd746cef5356?w=600&q=80',
  },
  {
    id: 8,
    city: 'Clifton Beach House',
    time: '5 hours away',
    location: 'Cape Town',
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80',
  },
];

// Pink/magenta/red/orange rotation per Figma
const INSPIRATION_COLORS = ['#E31C5F', '#B0219E', '#E1264A', '#E0562C'];

// ── Getaway tabs data ────────────────────────────────────────
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
    { id: 1,  city: 'Phoenix',       country: 'Arizona' },
    { id: 2,  city: 'Hot Springs',   country: 'Arkansas' },
    { id: 3,  city: 'Los Angeles',   country: 'California' },
    { id: 4,  city: 'San Diego',     country: 'California' },
    { id: 5,  city: 'San Francisco', country: 'California' },
    { id: 6,  city: 'Barcelona',     country: 'Catalonia' },
    { id: 7,  city: 'Prague',        country: 'Czechia' },
    { id: 8,  city: 'Washington',    country: 'District of Columbia' },
    { id: 9,  city: 'Keswick',       country: 'England' },
    { id: 10, city: 'London',        country: 'England' },
    { id: 11, city: 'Scarborough',   country: 'England' },
    { id: 12, city: 'Johannesburg',  country: 'Gauteng' },
    { id: 13, city: 'Cape Town',     country: 'Western Cape' },
    { id: 14, city: 'Pretoria',      country: 'Gauteng' },
  ],
  'Destinations for outdoor adventure': [
    { id: 15, city: 'Drakensberg',   country: 'KwaZulu-Natal' },
    { id: 16, city: 'Kruger',        country: 'Mpumalanga' },
    { id: 17, city: 'Tsitsikamma',   country: 'Eastern Cape' },
    { id: 18, city: 'Pilanesberg',   country: 'North West' },
  ],
  'Mountain cabins': [
    { id: 19, city: 'Dullstroom',    country: 'Mpumalanga' },
    { id: 20, city: 'Clarens',       country: 'Free State' },
    { id: 21, city: 'Hazyview',      country: 'Limpopo' },
    { id: 22, city: 'Swellendam',    country: 'Western Cape' },
  ],
  'Beach destinations': [
    { id: 23, city: 'Umhlanga',      country: 'KwaZulu-Natal' },
    { id: 24, city: 'Clifton',       country: 'Western Cape' },
    { id: 25, city: 'Hermanus',      country: 'Western Cape' },
    { id: 26, city: 'Plettenberg Bay', country: 'Western Cape' },
  ],
  'Popular destinations': [
    { id: 27, city: 'Johannesburg',  country: 'Gauteng' },
    { id: 28, city: 'Cape Town',     country: 'Western Cape' },
    { id: 29, city: 'Durban',        country: 'KwaZulu-Natal' },
    { id: 30, city: 'Phoenix',       country: 'Arizona' },
    { id: 31, city: 'Los Angeles',   country: 'California' },
    { id: 32, city: 'San Diego',     country: 'California' },
    { id: 33, city: 'San Francisco', country: 'California' },
    { id: 34, city: 'Hot Springs',   country: 'Arkansas' },
  ],
  'Unique Stays': [
    { id: 35, city: 'Franschhoek',   country: 'Western Cape' },
    { id: 36, city: 'Mossel Bay',    country: 'Western Cape' },
    { id: 37, city: 'Knysna',        country: 'Western Cape' },
    { id: 38, city: 'Bloemfontein',  country: 'Free State' },
  ],
};

export default function Home() {
  const [activeTab, setActiveTab]           = useState(GETAWAY_TABS[0]);
  const [showAllGetaways, setShowAllGetaways] = useState(false);
  const navigate = useNavigate();

  function handleFilter(location) {
    navigate(`/locations?location=${encodeURIComponent(location)}`);
  }

  const destinations = GETAWAY_DESTINATIONS[activeTab];
  const visibleDests = showAllGetaways ? destinations : destinations.slice(0, 12);

  return (
    <div className="home-page">

      {/* ════ 1. Hero — header overlaid on the image ════ */}
      <section className="hero" aria-label="Hero banner">
        <Header onFilter={handleFilter} transparent />

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
          <button className="btn hero-flexible-btn" onClick={() => navigate('/locations')}>
            I&rsquo;m flexible
          </button>
        </div>
      </section>

      {/* ════ 2. Inspiration Cards ════ */}
      <section
        className="section inspiration-section container"
        aria-label="Inspiration for your next trip"
      >
        <h2 className="section-title">Inspiration for your next trip</h2>
        <div className="inspiration-grid">
          {INSPIRATION_CARDS.map((card, i) => (
            <article
              key={card.id}
              className="inspiration-card"
              onClick={() =>
                navigate(`/locations?location=${encodeURIComponent(card.location)}`)
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === 'Enter' &&
                navigate(`/locations?location=${encodeURIComponent(card.location)}`)
              }
              aria-label={`Explore ${card.city}`}
            >
              <div className="inspiration-card__img-wrap">
                <img
                  src={card.image}
                  alt={card.city}
                  className="inspiration-card__img"
                  loading="lazy"
                />
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

      {/* ════ 3. Discover Airbnb Experiences ════ */}
      <section
        className="section experiences-section container"
        aria-label="Discover Airbnb Experiences"
      >
        <h2 className="section-title">Discover Airbnb Experiences</h2>
        <div className="experiences-grid">
          <article
            className="experience-card"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=80')",
            }}
          >
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

          <article
            className="experience-card"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80')",
            }}
          >
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

      {/* ════ 4. Shop Airbnb Gift Cards ════ */}
      <section
        className="section shop-section container"
        aria-label="Shop Airbnb gift cards"
      >
        <div className="shop-card">
          {/* Left: text */}
          <div className="shop-card__text">
            <h2 className="shop-card__title">Shop Airbnb gift cards</h2>
            <button
              className="btn btn-dark shop-card__btn"
              onClick={() => navigate('/locations')}
            >
              Learn more
            </button>
          </div>

          {/* Right: fanned gift card visuals */}
          <div className="shop-card__cards-wrap" aria-hidden="true">
            <div className="gift-card gift-card--back" />
            <div className="gift-card gift-card--mid">
              <svg viewBox="0 0 32 32" className="gift-card__logo" aria-hidden="true">
                <path
                  d="M16 1C7.163 1 0 8.163 0 17c0 5.59 2.832 10.51 7.143 13.49L16 31l8.857-.51C29.168 27.51 32 22.59 32 17 32 8.163 24.837 1 16 1z"
                  fill="rgba(255,255,255,0.6)"
                />
              </svg>
            </div>
            <div className="gift-card gift-card--front">
              <svg viewBox="0 0 32 32" className="gift-card__logo" aria-hidden="true">
                <path
                  d="M16 1C7.163 1 0 8.163 0 17c0 5.59 2.832 10.51 7.143 13.49L16 31l8.857-.51C29.168 27.51 32 22.59 32 17 32 8.163 24.837 1 16 1z"
                  fill="rgba(255,255,255,0.85)"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ════ 5. Future Getaways (tabs + plain text grid) ════ */}
      <section
        className="section getaways-section container"
        aria-label="Inspiration for future getaways"
      >
        <h2 className="section-title">Inspiration for future getaways</h2>

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

        <div className="getaways-grid" role="tabpanel" aria-label={activeTab}>
          {visibleDests.map((dest) => (
            <button
              key={dest.id}
              className="getaway-link"
              onClick={() =>
                navigate(`/locations?location=${encodeURIComponent(dest.city)}`)
              }
            >
              <span className="getaway-link__city">{dest.city}</span>
              <span className="getaway-link__country">{dest.country}</span>
            </button>
          ))}
          {!showAllGetaways && destinations.length > 12 && (
            <button
              className="getaway-link"
              onClick={() => setShowAllGetaways(true)}
            >
              <span className="getaway-link__city getaway-link__city--underline">
                Show more
              </span>
            </button>
          )}
        </div>
      </section>

      {/* ════ 6. Questions About Hosting — full-bleed dark banner ════ */}
      <section className="hosting-banner" aria-label="Questions about hosting">
        <div className="hosting-banner__bg">
          <img
            src="https://images.unsplash.com/photo-1530053969600-caed2596d242?w=1800&q=85"
            alt="Happy host smiling"
            className="hosting-banner__img"
            loading="lazy"
          />
          <div className="hosting-banner__overlay" aria-hidden="true" />
        </div>
        <div className="hosting-banner__content container">
          <h2 className="hosting-banner__title">
            Questions<br />about<br />hosting?
          </h2>
          <button
            className="btn hosting-banner__btn"
            onClick={() => navigate('/login')}
          >
            Ask a Superhost
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
