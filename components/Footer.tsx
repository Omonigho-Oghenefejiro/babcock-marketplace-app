import { Link } from 'react-router-dom';

const tokens = {
  green: '#1B4332',
  greenMid: '#2D6A4F',
  greenLight: '#D8F3DC',
  amber: '#F4A226',
  cream: '#FAF7F2',
  ink: '#1A1A1A',
  muted: '#9CA3AF',
};

const Footer = () => {
  const year = new Date().getFullYear();

  const columns = [
    {
      heading: 'Marketplace',
      links: [
        { label: 'Browse Products', to: '/shop' },
        { label: 'Sell an Item', to: '/sell' },
        { label: 'My Wishlist', to: '/wishlist' },
        { label: 'Shopping Cart', to: '/cart' },
      ],
    },
    {
      heading: 'Account',
      links: [
        { label: 'Sign In', to: '/login' },
        { label: 'Create Account', to: '/register' },
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'Messages', to: '/messages' },
      ],
    },
    {
      heading: 'Support',
      links: [
        { label: 'FAQ', to: '/faq' },
        { label: 'Contact Us', to: '/contact' },
        { label: 'Privacy Policy', to: '/privacy' },
        { label: 'Terms of Service', to: '/terms' },
      ],
    },
  ];

  const socials = [
    {
      label: 'Twitter / X',
      href: '#',
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.741l7.73-8.835L2.25 2.25h6.918l4.26 5.632 4.816-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
        </svg>
      ),
    },
    {
      label: 'Instagram',
      href: '#',
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
      ),
    },
    {
      label: 'WhatsApp',
      href: '#',
      icon: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.05 2a10 10 0 100 20A10 10 0 0012.05 2zm.01 18a7.96 7.96 0 01-4.268-1.233l-.306-.181-3.167.831.846-3.093-.2-.318A7.96 7.96 0 014.05 12a8 8 0 018-8 8 8 0 018 8 8 8 0 01-8 8z"/>
        </svg>
      ),
    },
  ];

  return (
    <footer
      style={{
        background: tokens.green,
        fontFamily: "'Instrument Sans', sans-serif",
      }}
    >
      {/* ── Wave Divider ── */}
      <div style={{ background: tokens.cream, lineHeight: 0 }}>
        <svg viewBox="0 0 1440 48" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 48 }}>
          <path d="M0,48 C360,0 1080,48 1440,16 L1440,48 Z" fill={tokens.green} />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-10">

        {/* ── Top: Brand + Columns ── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-5 group">
              <div
                style={{ background: tokens.amber, width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                  <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm-7 10.18V16l7 3.82 7-3.82v-2.82L12 17l-7-3.82z"/>
                </svg>
              </div>
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: '#fff', fontSize: '1.1rem' }}>
                Babcock Market
              </span>
            </Link>

            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem', lineHeight: 1.75, maxWidth: '22ch' }}>
              The campus marketplace built for Babcock University students. Buy, sell, and connect — safely on campus.
            </p>

            {/* Socials */}
            <div className="flex items-center gap-3 mt-6">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.6)',
                    width: 36, height: 36, borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = tokens.amber;
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav Columns */}
          {columns.map((col) => (
            <div key={col.heading}>
              <h4
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  color: tokens.amber,
                  fontSize: '0.7rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: '1rem',
                }}
              >
                {col.heading}
              </h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map((link) => (
                  <li key={link.to + link.label}>
                    <Link
                      to={link.to}
                      style={{
                        color: 'rgba(255,255,255,0.55)',
                        fontSize: '0.875rem',
                        transition: 'color 0.15s',
                        textDecoration: 'none',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Divider ── */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Trust badges row */}
          <div className="flex flex-wrap gap-3 mb-2">
            {[
              '🔒 Secure Payments via Paystack',
              '🎓 Babcock-verified students only',
              '📦 Campus pickup & delivery',
            ].map((badge) => (
              <span
                key={badge}
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '0.72rem',
                  borderRadius: 999,
                  padding: '4px 12px',
                  fontWeight: 500,
                }}
              >
                {badge}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' }}>
              © {year} Babcock Campus Marketplace. All rights reserved.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem' }}>
              Made with ❤️ for Babcock students
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;