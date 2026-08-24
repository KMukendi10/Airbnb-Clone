import './Footer.css';

const columns = [
  {
    title: 'Support',
    links: ['Help Centre', 'AirCover', 'Anti-discrimination', 'Disability support', 'Cancellation options'],
  },
  {
    title: 'Hosting',
    links: ['Airbnb your home', 'AirCover for Hosts', 'Hosting resources', 'Community forum', 'Responsible hosting'],
  },
  {
    title: 'Airbnb',
    links: ['Newsroom', 'New features', 'Careers', 'Investors', 'Gift cards'],
  },
  {
    title: '2026',
    links: ['Terms', 'Sitemap', 'Privacy', 'Your privacy choices'],
  },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-columns">
        {columns.map((col) => (
          <div key={col.title} className="footer-col">
            <h4>{col.title}</h4>
            <ul>
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#top">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>© {new Date().getFullYear()} Airbnb Clone, Inc. · Built for the iHub/Zaio Capstone</span>
          <div className="footer-bottom-right">
            <span>English (ZA)</span>
            <span>R ZAR</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
