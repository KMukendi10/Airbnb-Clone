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
      'Help Centre',
      'AirCover',
      'Anti-discrimination',
      'Disability support',
      'Cancellation options',
      'Report neighbourhood concern',
    ],
  },
  {
    heading: 'Community',
    links: [
      'Airbnb.org: disaster relief housing',
      'Support Afghan refugees',
      'Combating discrimination',
    ],
  },
  {
    heading: 'Hosting',
    links: [
      'Airbnb your home',
      'AirCover for Hosts',
      'Explore hosting resources',
      'Visit our community forum',
      'How to host responsibly',
    ],
  },
  {
    heading: 'Airbnb',
    links: [
      'Newsroom',
      'Learn about new features',
      'Letter from our founders',
      'Careers',
      'Investors',
      'Gift cards',
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer" aria-label="Site footer">
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
          </div>
        </div>
      </div>
    </footer>
  );
}
