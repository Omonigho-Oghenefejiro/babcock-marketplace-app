import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, Search, Heart, X, LogOut, ChevronDown } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';

const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Instrument+Sans:wght@400;500;600&display=swap');
  `}</style>
);

const tokens = {
  green: '#1B4332',
  greenMid: '#2D6A4F',
  greenLight: '#D8F3DC',
  amber: '#F4A226',
  cream: '#FAF7F2',
  ink: '#1A1A1A',
  muted: '#6B7280',
};

const Navbar = () => {
  const { user, cart, wishlist, searchQuery, setSearchQuery, logout } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const firstName = user?.name?.split(' ')[0] || 'Account';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
    setIsUserMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (isSearchOpen) searchRef.current?.focus();
  }, [isSearchOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navLinks = user?.role === 'admin'
    ? [
        { label: 'Admin', to: '/admin' },
        { label: 'Messages', to: '/messages' },
      ]
    : [
        { label: 'Shop', to: '/shop' },
        { label: 'Sell', to: '/sell' },
        { label: 'Messages', to: '/messages' },
      ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <FontLoader />

      <div
        style={{
          background: tokens.green,
          fontFamily: "'Instrument Sans', sans-serif",
        }}
        className="text-center text-xs py-2 px-4 text-white/80 tracking-wide"
      >
        🎓 Exclusively for Babcock University students — verify with your{' '}
        <span className="text-amber-300 font-semibold">@babcock.edu.ng</span> email
      </div>

      <nav
        style={{
          background: isScrolled ? 'rgba(250,247,242,0.97)' : tokens.cream,
          borderBottom: isScrolled ? '1px solid #E8E2D9' : '1px solid transparent',
          backdropFilter: isScrolled ? 'blur(12px)' : 'none',
          boxShadow: isScrolled ? '0 2px 20px rgba(27,67,50,0.06)' : 'none',
          transition: 'all 0.25s ease',
          fontFamily: "'Instrument Sans', sans-serif",
        }}
        className="fixed top-8 w-full z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
              <div
                style={{ background: tokens.green }}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm-7 10.18V16l7 3.82 7-3.82v-2.82L12 17l-7-3.82z" />
                </svg>
              </div>
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800 }} className="text-lg leading-none">
                <span style={{ color: tokens.green }}>Babcock</span>
                <span style={{ color: tokens.ink }}> Market</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    color: isActive(link.to) ? tokens.green : tokens.muted,
                    background: isActive(link.to) ? tokens.greenLight : 'transparent',
                    fontWeight: isActive(link.to) ? 600 : 500,
                    fontSize: '0.875rem',
                  }}
                  className="px-4 py-2 rounded-lg transition-all hover:bg-green-50 hover:text-green-800"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden md:block flex-1 max-w-xs mx-6">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: tokens.muted }}
                />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    background: '#F0EBE3',
                    border: '1.5px solid transparent',
                    borderRadius: '10px',
                    fontFamily: "'Instrument Sans', sans-serif",
                    fontSize: '0.875rem',
                    color: tokens.ink,
                    outline: 'none',
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.borderColor = tokens.greenMid;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.background = '#F0EBE3';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                  className="w-full pl-9 pr-4 py-2"
                />
              </div>
            </div>

            <div className="hidden md:flex items-center gap-1">
              {user?.role !== 'admin' && (
                <>
                  <Link
                    to="/wishlist"
                    className="relative p-2.5 rounded-xl transition-all hover:bg-green-50 group"
                    title="Wishlist"
                  >
                    <Heart
                      className="w-5 h-5 transition-colors group-hover:text-red-500"
                      style={{ color: wishlist.length > 0 ? '#EF4444' : tokens.muted }}
                      fill={wishlist.length > 0 ? '#EF4444' : 'none'}
                    />
                    {wishlist.length > 0 && (
                      <span
                        style={{ background: '#EF4444', fontFamily: "'Syne', sans-serif" }}
                        className="absolute -top-0.5 -right-0.5 w-4 h-4 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                      >
                        {wishlist.length}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/cart"
                    className="relative p-2.5 rounded-xl transition-all hover:bg-green-50 group"
                    title="Cart"
                  >
                    <ShoppingCart
                      className="w-5 h-5 transition-colors group-hover:text-green-700"
                      style={{ color: cartCount > 0 ? tokens.green : tokens.muted }}
                    />
                    {cartCount > 0 && (
                      <span
                        style={{ background: tokens.amber, fontFamily: "'Syne', sans-serif" }}
                        className="absolute -top-0.5 -right-0.5 w-4 h-4 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                      >
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </>
              )}

              {user ? (
                <div className="relative ml-1" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen((v) => !v)}
                    style={{
                      background: isUserMenuOpen ? tokens.green : tokens.greenLight,
                      color: isUserMenuOpen ? '#fff' : tokens.green,
                      fontFamily: "'Instrument Sans', sans-serif",
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      borderRadius: '10px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    className="flex items-center gap-2 px-3 py-2"
                  >
                    <div
                      style={{
                        background: isUserMenuOpen ? 'rgba(255,255,255,0.2)' : tokens.green,
                        color: '#fff',
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        fontFamily: "'Syne', sans-serif",
                        overflow: 'hidden',
                      }}
                    >
                      {user?.profileImage
                        ? <img src={user.profileImage} alt={user.name || 'Profile'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : firstName[0].toUpperCase()
                      }
                    </div>
                    {firstName}
                    <ChevronDown
                      className="w-3.5 h-3.5 transition-transform"
                      style={{ transform: isUserMenuOpen ? 'rotate(180deg)' : 'rotate(0)' }}
                    />
                  </button>

                  {isUserMenuOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        background: '#fff',
                        border: '1px solid #E8E2D9',
                        borderRadius: '14px',
                        boxShadow: '0 8px 32px rgba(27,67,50,0.12)',
                        minWidth: 180,
                        overflow: 'hidden',
                        fontFamily: "'Instrument Sans', sans-serif",
                      }}
                    >
                      <div style={{ padding: '12px 16px', borderBottom: '1px solid #F0EBE3' }}>
                        <p style={{ fontSize: '0.75rem', color: tokens.muted }}>Signed in as</p>
                        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: tokens.ink, marginTop: 2 }}>
                          {user.name}
                        </p>
                      </div>
                      {(user.role === 'admin'
                        ? [{ label: 'Admin Dashboard', to: '/admin' }]
                        : [
                            { label: 'Dashboard', to: '/dashboard' },
                            { label: 'My Orders', to: '/dashboard' },
                            { label: 'Purchased Items', to: '/purchased-items' },
                            { label: 'Sell an Item', to: '/sell' },
                          ]).map((item) => (
                        <Link
                          key={item.to + item.label}
                          to={item.to}
                          style={{
                            display: 'block',
                            padding: '10px 16px',
                            fontSize: '0.875rem',
                            color: tokens.ink,
                            fontWeight: 500,
                          }}
                          className="hover:bg-green-50 hover:text-green-800 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                      <button
                        onClick={() => {
                          logout();
                          navigate('/');
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          width: '100%',
                          padding: '10px 16px',
                          fontSize: '0.875rem',
                          color: '#EF4444',
                          fontWeight: 500,
                          borderTop: '1px solid #F0EBE3',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontFamily: "'Instrument Sans', sans-serif",
                        }}
                        className="hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 ml-1">
                  <Link
                    to="/login"
                    style={{ color: tokens.green, fontWeight: 600, fontSize: '0.875rem' }}
                    className="px-3 py-2 hover:underline"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    style={{
                      background: tokens.green,
                      color: '#fff',
                      fontFamily: "'Instrument Sans', sans-serif",
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      borderRadius: '10px',
                      padding: '8px 16px',
                      transition: 'background 0.2s, transform 0.15s',
                    }}
                    className="hover:opacity-90 active:scale-95"
                  >
                    Join Free
                  </Link>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 md:hidden">
              <button
                onClick={() => setIsSearchOpen((v) => !v)}
                style={{ color: tokens.muted }}
                className="p-2.5 rounded-xl hover:bg-green-50 transition-colors"
              >
                {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </button>

              <Link to="/cart" className="relative p-2.5 rounded-xl hover:bg-green-50 transition-colors">
                <ShoppingCart className="w-5 h-5" style={{ color: tokens.muted }} />
                {cartCount > 0 && (
                  <span
                    style={{ background: tokens.amber }}
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                    {cartCount}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setIsMenuOpen((v) => !v)}
                style={{ color: tokens.ink }}
                className="p-2.5 rounded-xl hover:bg-green-50 transition-colors"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div
            style={{
              maxHeight: isSearchOpen ? '80px' : '0',
              overflow: 'hidden',
              transition: 'max-height 0.3s ease',
            }}
          >
            <div className="pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: tokens.muted }} />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    background: '#F0EBE3',
                    border: '1.5px solid transparent',
                    borderRadius: '10px',
                    fontFamily: "'Instrument Sans', sans-serif",
                    fontSize: '0.875rem',
                    color: tokens.ink,
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.borderColor = tokens.greenMid;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.background = '#F0EBE3';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                  className="w-full pl-9 pr-4 py-2.5"
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <>
        <div
          onClick={() => setIsMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 49,
            opacity: isMenuOpen ? 1 : 0,
            pointerEvents: isMenuOpen ? 'all' : 'none',
            transition: 'opacity 0.25s ease',
          }}
        />

        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '76vw',
            maxWidth: 300,
            background: '#fff',
            zIndex: 50,
            transform: isMenuOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)',
            fontFamily: "'Instrument Sans', sans-serif",
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ background: tokens.green, padding: '24px 20px 20px' }}>
            <div className="flex items-center justify-between mb-4">
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: '#fff', fontSize: '1.1rem' }}>
                Babcock Market
              </span>
              <button onClick={() => setIsMenuOpen(false)} style={{ color: 'rgba(255,255,255,0.7)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            {user ? (
              <div className="flex items-center gap-3">
                <div
                  style={{
                    background: tokens.amber,
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 800,
                    color: '#fff',
                    fontSize: '1rem',
                    overflow: 'hidden',
                  }}
                >
                  {user?.profileImage
                    ? <img src={user.profileImage} alt={user.name || 'Profile'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : firstName[0].toUpperCase()
                  }
                </div>
                <div>
                  <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</p>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>{user.email}</p>
                </div>
              </div>
            ) : (
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>Sign in to start shopping</p>
            )}
          </div>

          <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 20px',
                  fontSize: '0.95rem',
                  fontWeight: isActive(link.to) ? 600 : 500,
                  color: isActive(link.to) ? tokens.green : tokens.ink,
                  background: isActive(link.to) ? tokens.greenLight : 'transparent',
                  borderLeft: isActive(link.to) ? `3px solid ${tokens.green}` : '3px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                {link.label}
              </Link>
            ))}

            <Link
              to="/wishlist"
              onClick={() => setIsMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 20px',
                fontSize: '0.95rem',
                fontWeight: 500,
                color: tokens.ink,
                borderLeft: '3px solid transparent',
              }}
              className="hover:bg-green-50"
            >
              <span>Wishlist</span>
              {wishlist.length > 0 && (
                <span
                  style={{
                    background: '#EF4444',
                    color: '#fff',
                    borderRadius: 999,
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '2px 7px',
                  }}
                >
                  {wishlist.length}
                </span>
              )}
            </Link>

            {user && (
              <Link
                to="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  display: 'block',
                  padding: '12px 20px',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  color: tokens.ink,
                  borderLeft: '3px solid transparent',
                }}
                className="hover:bg-green-50"
              >
                Dashboard
              </Link>
            )}
          </nav>

          <div style={{ padding: '16px 20px', borderTop: '1px solid #F0EBE3' }}>
            {user ? (
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                  setIsMenuOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1.5px solid #FEE2E2',
                  color: '#EF4444',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  background: 'none',
                  cursor: 'pointer',
                  fontFamily: "'Instrument Sans', sans-serif",
                }}
                className="hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '12px',
                    background: tokens.green,
                    color: '#fff',
                    borderRadius: '10px',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                  }}
                >
                  Join Free
                </Link>
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '12px',
                    border: `1.5px solid ${tokens.greenLight}`,
                    color: tokens.green,
                    borderRadius: '10px',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                  }}
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </>

      <div className="h-24" />
    </>
  );
};

export default Navbar;