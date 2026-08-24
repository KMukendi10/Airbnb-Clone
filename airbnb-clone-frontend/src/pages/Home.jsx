import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Home.css';

const inspirationCards = [
  { name: 'Sandton City Hotel', subtitle: 'Johannesburg', color: '#c0155e' },
  { name: 'Joburg City Hotel', subtitle: 'Johannesburg', color: '#a3247a' },
  { name: 'Woodmead Hotel', subtitle: 'Johannesburg', color: '#d9663f' },
  { name: 'Hyde Park Hotel', subtitle: 'Johannesburg', color: '#e0473f' },
];

const getawayTabs = ['Amazing views', 'Beachfront', 'Cabins', 'Trending'];

export default function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(getawayTabs[0]);

  function handleHeroSearch() {
    navigate('/locations');
  }

  return (
    <>
      <Header onFilter={(loc) => navigate(`/locations?location=${encodeURIComponent(loc)}`)} />

      <section className="hero">
        <div className="hero-overlay">
          <h1>Not sure where to go? Perfect.</h1>
          <button className="btn btn-primary" onClick={handleHeroSearch}>
            I&apos;m flexible
          </button>
        </div>
      </section>

      <section className="container home-section">
        <h2>Inspiration for your next trip</h2>
        <div className="inspiration-grid">
          {inspirationCards.map((card) => (
            <button
              key={card.name}
              className="inspiration-card"
              style={{ background: `linear-gradient(160deg, ${card.color}, #1a1a1a)` }}
              onClick={() => navigate(`/locations?location=Johannesburg`)}
            >
              <span className="inspiration-name">{card.name}</span>
              <span className="inspiration-sub">{card.subtitle}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="container home-section">
        <h2>Discover Airbnb Experiences</h2>
        <div className="experience-grid">
          <div className="experience-card experience-card--canyon">
            <span className="experience-title">Things to do on your trip</span>
            <button className="btn btn-outline experience-btn">Explore</button>
          </div>
          <div className="experience-card experience-card--kitchen">
            <span className="experience-title">Things to do from home</span>
            <button className="btn btn-outline experience-btn">Explore</button>
          </div>
        </div>
      </section>

      <section className="container home-section shop-section">
        <div className="shop-copy">
          <h2>Shop Airbnb gift cards</h2>
          <button className="btn btn-dark">Buy now</button>
        </div>
        <div className="shop-cards">
          <div className="gift-card gift-card--1" />
          <div className="gift-card gift-card--2" />
          <div className="gift-card gift-card--3" />
        </div>
      </section>

      <section className="container home-section">
        <h2>Inspiration for future getaways</h2>
        <div className="getaway-tabs">
          {getawayTabs.map((tab) => (
            <button
              key={tab}
              className={`getaway-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <ul className="getaway-list">
          <li>
            <span>{activeTab} · Cape Town</span>
            <span>2h 10m flight</span>
          </li>
          <li>
            <span>{activeTab} · Durban</span>
            <span>1h 45m flight</span>
          </li>
          <li>
            <span>{activeTab} · Pretoria</span>
            <span>35m drive</span>
          </li>
        </ul>
      </section>

      <section className="hosting-banner">
        <div className="container hosting-banner-inner">
          <h2>Questions about hosting?</h2>
          <button className="btn btn-outline hosting-btn" onClick={() => navigate('/login')}>
            Ask a host
          </button>
        </div>
      </section>

      <Footer />
    </>
  );
}
