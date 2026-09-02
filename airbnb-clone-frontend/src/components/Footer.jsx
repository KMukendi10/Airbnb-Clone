/**
 * Footer – four-column layout matching Airbnb's footer with
 * Support / Community / Hosting / Airbnb columns plus the
 * copyright + language/currency bar at the bottom.
 */

import './Footer.css';

const FOOTER_COLUMNS = [
  {
    heading: 'Support',
    links: [
      'Help Center',
      'Safety information',
      'Cancellation options',
      'Our COVID-19 Response',
      'Supporting people with disabilities',
      'Report a neighborhood concern',
    ],
  },
  {
    heading: 'Community',
    links: [
      'Airbnb.org: disaster relief housing',
      'Support: Afghan refugees',
      'Celebrating diversity & belonging',
      'Combating discrimination',
    ],
  },
  {
    heading: 'Hosting',
    links: [
      'Try hosting',
      'AirCover: protection for Hosts',
      'Explore hosting resources',
      'Visit our community forum',
      'How to host responsibly',
    ],
  },
  {
    heading: 'About',
    links: [
      'Newsroom',
      'Learn about new features',
      'Letter from our founders',
      'Careers',
      'Investors',
      'Airbnb Luxe',
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer" aria-label="Site footer">

      {/* ── Logo banner row (matches Figma top of footer) ── */}
      <div className="footer-logo-row container">
        <div className="footer-logo-mark">
          <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden="true">
            <path
              d="M16 1C7.163 1 0 8.163 0 17c0 5.59 2.832 10.51 7.143 13.49L16 31l8.857-.51C29.168 27.51 32 22.59 32 17 32 8.163 24.837 1 16 1z"
              fill="var(--color-primary)"
            />
          </svg>
          <span className="footer-logo-text">Airbnb Footer</span>
        </div>
      </div>
      {/* ── Main columns ── */}
      <div className="footer-columns container">
        {FOOTER_COLUMNS.map((col) => (
          <nav key={col.heading} className="footer-col" aria-label={col.heading}>
            <h3 className="footer-col__heading">{col.heading}</h3>
            <ul className="footer-col__list">
              {col.links.map((link) => (
                <li key={link}>
                  {/* All links are internal anchors in this demo */}
                  <a href="#top" className="footer-link">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      {/* ── Bottom bar ── */}
      <div className="footer-bottom">
        <div className="footer-bottom__inner container">
          <p className="footer-copyright">
            &copy; {year} Airbnb, Inc. &middot;{' '}
            <a href="#top" className="footer-bottom__link">Privacy</a>
            {' · '}
            <a href="#top" className="footer-bottom__link">Terms</a>
            {' · '}
            <a href="#top" className="footer-bottom__link">Sitemap</a>
          </p>

          <div className="footer-bottom__right">
            <button className="footer-locale-btn" aria-label="Change language">
              <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" width="14" height="14">
                <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zM1.8 8.4A6.3 6.3 0 0 0 7 9.9v.6a5.3 5.3 0 0 1-5.2-2.1zm.4-1.1C3 5.5 5 4.2 7 4v1.7A7.7 7.7 0 0 1 2.2 7.3zm5.6 7.9A6.3 6.3 0 0 1 1.7 9.6h.1c.5.5 1.2.9 2 1.1v.5a1 1 0 0 0 1 1h2.6a1 1 0 0 0 .4-.1zM9 14.1V13a1 1 0 0 0-1-1H6.5v-.5c1-.2 1.8-.7 2.5-1.4V14l-.1.1zM9 7.3V4c2 .2 4 1.5 4.8 3.3A7.7 7.7 0 0 1 9 7.3zm0 1a7.7 7.7 0 0 0 4.8.2A6.3 6.3 0 0 1 9 9.9v-.6z" fill="currentColor" />
              </svg>
              English (ZA)
            </button>

            <button className="footer-locale-btn" aria-label="Change currency">
              R&nbsp;ZAR
            </button>

            <div className="footer-socials" aria-label="Social media links">
              <a href="#top" className="footer-social-link" aria-label="Facebook">
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" fill="currentColor" />
                </svg>
              </a>
              <a href="#top" className="footer-social-link" aria-label="Twitter">
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.3 4.3 0 0 0 1.88-2.37 8.6 8.6 0 0 1-2.72 1.04 4.28 4.28 0 0 0-7.29 3.9A12.14 12.14 0 0 1 3.1 4.9a4.28 4.28 0 0 0 1.32 5.71 4.25 4.25 0 0 1-1.94-.54v.05a4.28 4.28 0 0 0 3.43 4.2 4.3 4.3 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.97A8.59 8.59 0 0 1 2 19.54a12.1 12.1 0 0 0 6.56 1.92c7.87 0 12.18-6.52 12.18-12.18l-.01-.55A8.7 8.7 0 0 0 22.46 6z" fill="currentColor" />
                </svg>
              </a>
              <a href="#top" className="footer-social-link" aria-label="Instagram">
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.24 2.22.41.56.21.96.47 1.38.89.42.42.68.82.89 1.38.17.42.36 1.05.41 2.22.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.24 1.8-.41 2.22a3.7 3.7 0 0 1-.89 1.38 3.7 3.7 0 0 1-1.38.89c-.42.17-1.05.36-2.22.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.24-2.22-.41a3.7 3.7 0 0 1-1.38-.89 3.7 3.7 0 0 1-.89-1.38c-.17-.42-.36-1.05-.41-2.22-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.24-1.8.41-2.22.21-.56.47-.96.89-1.38.42-.42.82-.68 1.38-.89.42-.17 1.05-.36 2.22-.41 1.27-.06 1.65-.07 4.85-.07zM12 0C8.74 0 8.33.01 7.05.07c-1.28.06-2.15.26-2.91.56a5.9 5.9 0 0 0-2.13 1.39A5.9 5.9 0 0 0 .62 4.15c-.3.76-.5 1.63-.56 2.9C0 8.33 0 8.74 0 12s.01 3.67.06 4.95c.06 1.28.26 2.15.56 2.91a5.9 5.9 0 0 0 1.39 2.13 5.9 5.9 0 0 0 2.13 1.39c.76.3 1.63.5 2.9.56 1.29.06 1.7.06 4.96.06s3.67-.01 4.95-.06c1.28-.06 2.15-.26 2.91-.56a5.9 5.9 0 0 0 2.13-1.39 5.9 5.9 0 0 0 1.39-2.13c.3-.76.5-1.63.56-2.9.06-1.29.06-1.7.06-4.96s-.01-3.67-.06-4.95c-.06-1.28-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.39-2.13A5.9 5.9 0 0 0 19.86.62c-.76-.3-1.63-.5-2.9-.56C15.67 0 15.26 0 12 0zm0 5.84A6.16 6.16 0 1 0 12 18.16 6.16 6.16 0 0 0 12 5.84zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm7.84-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z" fill="currentColor" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
