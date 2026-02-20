import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useRef } from 'react';
import {
  BookOpen, Laptop, Coffee, Shirt, Smartphone,
  ArrowRight, Shield, Users, Clock, Star,
  Flame, Zap, MapPin, Tag
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useStore } from '../contexts/StoreContext';

/* ── Design tokens ── */
const t = {
  green:      '#1B4332',
  greenMid:   '#2D6A4F',
  greenLight: '#D8F3DC',
  greenPale:  '#F0FAF2',
  amber:      '#F4A226',
  amberLight: '#FEF3C7',
  cream:      '#FAF7F2',
  ink:        '#1A1A1A',
  muted:      '#6B7280',
  border:     '#E8E2D9',
};

/* ── Reusable section label ── */
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: t.greenPale, color: t.greenMid,
    fontFamily: "'Instrument Sans', sans-serif",
    fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.1em',
    textTransform: 'uppercase', borderRadius: 999,
    padding: '5px 14px', border: `1px solid ${t.greenLight}`,
    marginBottom: 16,
  }}>
    {children}
  </span>
);

/* ── Animated section wrapper ── */
const Reveal = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

/* ══════════════════════════════════════════
   HOME PAGE
══════════════════════════════════════════ */
const Home = () => {
  const { products } = useStore();
  const [activeTab, setActiveTab] = useState('featured');

  const featuredProducts  = products?.slice(0, 8)  || [];
  const trendingProducts  = products?.slice(0, 8).sort(() => Math.random() - 0.5) || [];
  const newProducts       = products?.slice(4, 12) || [];

  const displayProducts = activeTab === 'trending'
    ? trendingProducts : activeTab === 'new'
    ? newProducts : featuredProducts;

  const categories = [
    { name: 'Textbooks',   icon: BookOpen,    count: '150+', emoji: '📚' },
    { name: 'Electronics', icon: Laptop,       count: '80+',  emoji: '💻' },
    { name: 'Hostel',      icon: Coffee,       count: '200+', emoji: '🛏️' },
    { name: 'Fashion',     icon: Shirt,        count: '120+', emoji: '👗' },
    { name: 'Tech',        icon: Smartphone,   count: '60+',  emoji: '📱' },
    { name: 'Stationery',  icon: BookOpen,     count: '90+',  emoji: '✏️' },
  ];

  const testimonials = [
    { text: 'Sold my 300L textbooks in under 3 hours. This is genuinely useful.', name: 'Tolu A.', level: '400L, Law', rating: 5 },
    { text: 'Got a barely-used fan for ₦3k. My hostel life changed that day.', name: 'Emeka O.', level: '200L, Engineering', rating: 5 },
    { text: 'Listed my graphics tablet and had 4 messages within an hour. Wow.', name: 'Chioma B.', level: '300L, Computer Science', rating: 5 },
  ];

  return (
    <div style={{ background: t.cream, fontFamily: "'Instrument Sans', sans-serif" }}>

      {/* ════════════════════════════════
          HERO
      ════════════════════════════════ */}
      <section
        style={{
          background: t.green,
          position: 'relative',
          overflow: 'hidden',
          minHeight: '92vh',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Background texture lines */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `repeating-linear-gradient(
            90deg, rgba(255,255,255,0.025) 0px,
            rgba(255,255,255,0.025) 1px,
            transparent 1px, transparent 80px
          )`,
        }} />

        {/* Amber glow orb */}
        <div style={{
          position: 'absolute', right: '-5%', top: '10%',
          width: 520, height: 520,
          background: `radial-gradient(circle, rgba(244,162,38,0.18) 0%, transparent 70%)`,
          borderRadius: '50%',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', left: '-8%', bottom: '-10%',
          width: 400, height: 400,
          background: `radial-gradient(circle, rgba(45,106,79,0.5) 0%, transparent 70%)`,
          borderRadius: '50%',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px', position: 'relative', zIndex: 1, width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>

            {/* Left */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(244,162,38,0.15)', color: t.amber,
                  border: '1px solid rgba(244,162,38,0.3)',
                  fontWeight: 600, fontSize: '0.72rem', letterSpacing: '0.12em',
                  textTransform: 'uppercase', borderRadius: 999, padding: '5px 14px',
                  marginBottom: 24,
                }}>
                  🎓 Babcock University • Campus Only
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 800,
                  fontSize: 'clamp(2.6rem, 5vw, 4rem)',
                  lineHeight: 1.08,
                  color: '#fff',
                  marginBottom: 24,
                }}
              >
                The market<br />
                <span style={{ color: t.amber }}>lives on campus.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1.05rem', lineHeight: 1.75, maxWidth: '44ch', marginBottom: 36 }}
              >
                Buy textbooks, sell hostel essentials, discover what fellow Babcock students are offering — all in one verified campus marketplace.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
              >
                <Link to="/shop" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: t.amber, color: t.ink,
                  fontFamily: "'Syne', sans-serif", fontWeight: 700,
                  fontSize: '0.9rem', padding: '14px 28px', borderRadius: 12,
                  textDecoration: 'none', transition: 'transform 0.15s, box-shadow 0.15s',
                  boxShadow: '0 4px 20px rgba(244,162,38,0.35)',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(244,162,38,0.45)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(244,162,38,0.35)'; }}
                >
                  Browse Items <ArrowRight size={16} />
                </Link>
                <Link to="/sell" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'rgba(255,255,255,0.08)', color: '#fff',
                  border: '1.5px solid rgba(255,255,255,0.2)',
                  fontFamily: "'Instrument Sans', sans-serif", fontWeight: 600,
                  fontSize: '0.9rem', padding: '14px 28px', borderRadius: 12,
                  textDecoration: 'none', transition: 'background 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
                >
                  List for Free
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                style={{ display: 'flex', gap: 32, marginTop: 48 }}
              >
                {[
                  { label: 'Students', value: '2.5k+', icon: '👥' },
                  { label: 'Active Listings', value: '1.8k+', icon: '📦' },
                  { label: 'Trades Done', value: '4.2k+', icon: '🤝' },
                ].map((s) => (
                  <div key={s.label}>
                    <div style={{
                      fontFamily: "'Syne', sans-serif", fontWeight: 800,
                      fontSize: '1.6rem', color: '#fff', lineHeight: 1,
                    }}>{s.icon} {s.value}</div>
                    <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — floating product cards preview */}
            <motion.div
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              className="hidden lg:flex"
            >
              {/* Big decorative card */}
              <div style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 24, padding: 28,
                width: 340, backdropFilter: 'blur(12px)',
              }}>
                <div style={{ marginBottom: 16 }}>
                  <span style={{
                    background: t.amber, color: t.ink, fontSize: '0.65rem',
                    fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                    borderRadius: 6, padding: '3px 8px',
                  }}>🔥 Trending now</span>
                </div>

                {/* Mini product list */}
                {[
                  { name: '300L Accounting Textbook', price: '₦3,500', tag: 'Textbook', img: '📗' },
                  { name: 'Havit Laptop Cooling Pad', price: '₦6,200', tag: 'Electronics', img: '💻' },
                  { name: 'Bedside Study Lamp', price: '₦2,100', tag: 'Hostel', img: '💡' },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 0',
                    borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 10,
                      background: 'rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.4rem', flexShrink: 0,
                    }}>{item.img}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 600 }}>{item.name}</div>
                      <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem' }}>{item.tag}</div>
                    </div>
                    <div style={{ color: t.amber, fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.9rem' }}>{item.price}</div>
                  </div>
                ))}

                <Link to="/shop" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  marginTop: 16, padding: '10px',
                  background: t.amber, color: t.ink,
                  borderRadius: 10, fontWeight: 700, fontSize: '0.82rem',
                  textDecoration: 'none', fontFamily: "'Syne', sans-serif",
                }}>
                  View all listings <ArrowRight size={14} />
                </Link>
              </div>

              {/* Floating badge top-right */}
              <motion.div
                animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                style={{
                  position: 'absolute', top: -16, right: -16,
                  background: '#fff', borderRadius: 14,
                  padding: '10px 14px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  fontSize: '0.75rem', fontWeight: 600, color: t.ink,
                  display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
                }}
              >
                <span style={{ color: '#22c55e', fontSize: '0.85rem' }}>●</span> 48 new listings today
              </motion.div>

              {/* Floating badge bottom-left */}
              <motion.div
                animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 4, delay: 1, ease: 'easeInOut' }}
                style={{
                  position: 'absolute', bottom: -12, left: -20,
                  background: t.amber, borderRadius: 14,
                  padding: '10px 14px', boxShadow: '0 8px 24px rgba(244,162,38,0.35)',
                  fontSize: '0.75rem', fontWeight: 700, color: t.ink,
                  display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
                  fontFamily: "'Syne', sans-serif",
                }}
              >
                🔒 Verified Babcock students only
              </motion.div>
            </motion.div>

          </div>
        </div>

        {/* Bottom wave */}
        <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, lineHeight: 0 }}>
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 60 }}>
            <path d="M0,60 C400,20 1040,50 1440,28 L1440,60 Z" fill={t.cream} />
          </svg>
        </div>
      </section>

      {/* ════════════════════════════════
          CATEGORIES
      ════════════════════════════════ */}
      <section style={{ padding: '88px 24px 72px', maxWidth: 1280, margin: '0 auto' }}>
        <Reveal>
          <SectionLabel><Tag size={12} /> Browse by Category</SectionLabel>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36, flexWrap: 'wrap', gap: 12 }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', color: t.ink, lineHeight: 1.1 }}>
              What are you<br />looking for?
            </h2>
            <Link to="/shop" style={{ display: 'flex', alignItems: 'center', gap: 6, color: t.greenMid, fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>
              See all <ArrowRight size={14} />
            </Link>
          </div>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
          {categories.map((cat, i) => (
            <Reveal key={cat.name} delay={i * 0.06}>
              <Link
                to={`/shop?category=${cat.name.toLowerCase()}`}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div
                  style={{
                    background: '#fff',
                    border: `1.5px solid ${t.border}`,
                    borderRadius: 16,
                    padding: '24px 16px',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget;
                    el.style.borderColor = t.greenMid;
                    el.style.background = t.greenPale;
                    el.style.transform = 'translateY(-4px)';
                    el.style.boxShadow = `0 8px 24px rgba(27,67,50,0.1)`;
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget;
                    el.style.borderColor = t.border;
                    el.style.background = '#fff';
                    el.style.transform = 'translateY(0)';
                    el.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: 10 }}>{cat.emoji}</div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.9rem', color: t.ink, marginBottom: 4 }}>
                    {cat.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: t.muted }}>{cat.count} items</div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════
          PRODUCTS SECTION
      ════════════════════════════════ */}
      <section style={{ background: '#fff', padding: '72px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <Reveal>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <SectionLabel><Flame size={12} /> Products</SectionLabel>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', color: t.ink }}>
                  Hot on campus
                </h2>
              </div>

              {/* Tab pills */}
              <div style={{ display: 'flex', gap: 6, background: '#F3F4F6', borderRadius: 12, padding: 4 }}>
                {[
                  { id: 'featured', label: 'Featured', icon: <Star size={13} /> },
                  { id: 'trending', label: 'Trending', icon: <Flame size={13} /> },
                  { id: 'new',      label: 'New',      icon: <Zap size={13} /> },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '8px 16px', borderRadius: 9, border: 'none',
                      fontFamily: "'Instrument Sans', sans-serif", fontWeight: 600,
                      fontSize: '0.8rem', cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: activeTab === tab.id ? t.green : 'transparent',
                      color:      activeTab === tab.id ? '#fff'   : t.muted,
                      boxShadow:  activeTab === tab.id ? '0 2px 8px rgba(27,67,50,0.25)' : 'none',
                    }}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}
          >
            {displayProducts.length > 0 ? (
              displayProducts.map((product, index) => (
                <ProductCard key={product.id || `${product.title}-${index}`} product={product} />
              ))
            ) : (
              [...Array(8)].map((_, i) => (
                <div key={i} style={{
                  background: '#F9FAFB', borderRadius: 16,
                  height: 280, animation: 'pulse 1.5s ease-in-out infinite',
                }} />
              ))
            )}
          </motion.div>

          <Reveal delay={0.2}>
            <div style={{ textAlign: 'center', marginTop: 48 }}>
              <Link to="/shop" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                border: `2px solid ${t.green}`, color: t.green,
                fontFamily: "'Syne', sans-serif", fontWeight: 700,
                fontSize: '0.9rem', padding: '13px 32px', borderRadius: 12,
                textDecoration: 'none', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = t.green; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = t.green; }}
              >
                View all listings <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════
          WHY US — HORIZONTAL CARDS
      ════════════════════════════════ */}
      <section style={{ padding: '72px 24px', maxWidth: 1280, margin: '0 auto' }}>
        <Reveal>
          <SectionLabel><Shield size={12} /> Why Babcock Market</SectionLabel>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', color: t.ink, marginBottom: 40 }}>
            Designed for campus life.
          </h2>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
          {[
            { icon: Shield,  emoji: '🔒', title: 'Verified Students',  desc: 'Every account is tied to a @babcock.edu.ng email. No strangers.',      accent: '#D8F3DC', accentDark: t.green },
            { icon: MapPin,  emoji: '📍', title: 'Campus Pickup',       desc: 'Meet at the gate, library, or your hostel. Safe and convenient.',      accent: '#FEF3C7', accentDark: '#B45309' },
            { icon: Clock,   emoji: '⚡', title: 'Quick Deals',         desc: 'Most items sell within 24 hours. Fast, simple, no broker fees.',        accent: '#FFE4E6', accentDark: '#BE123C' },
            { icon: Users,   emoji: '🎓', title: 'Community Driven',    desc: '2,500+ students — your course mates are already here.',                 accent: '#EDE9FE', accentDark: '#7C3AED' },
          ].map((f, i) => (
            <Reveal key={f.title} delay={i * 0.08}>
              <div
                style={{
                  background: '#fff', border: `1.5px solid ${t.border}`,
                  borderRadius: 20, padding: '28px 24px',
                  transition: 'all 0.25s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = f.accentDark;
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.07)`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = t.border;
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: f.accent, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', marginBottom: 16,
                }}>
                  {f.emoji}
                </div>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1rem', color: t.ink, marginBottom: 8 }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: t.muted, lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════ */}
      <section style={{ background: '#fff', padding: '72px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <Reveal>
            <SectionLabel>⭐ Student Reviews</SectionLabel>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', color: t.ink, marginBottom: 40 }}>
              Real students,<br />real deals.
            </h2>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {testimonials.map((review, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div style={{
                  background: i === 1 ? t.green : '#fff',
                  border: `1.5px solid ${i === 1 ? t.green : t.border}`,
                  borderRadius: 20, padding: '28px 24px',
                }}>
                  {/* Stars */}
                  <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
                    {[...Array(review.rating)].map((_, s) => (
                      <Star key={s} size={14} fill={i === 1 ? t.amber : t.green} color={i === 1 ? t.amber : t.green} />
                    ))}
                  </div>
                  <p style={{
                    fontSize: '0.95rem', lineHeight: 1.75,
                    color: i === 1 ? 'rgba(255,255,255,0.85)' : t.ink,
                    fontStyle: 'italic', marginBottom: 20,
                  }}>
                    "{review.text}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: i === 1 ? 'rgba(255,255,255,0.15)' : t.greenLight,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'Syne', sans-serif", fontWeight: 800,
                      color: i === 1 ? '#fff' : t.green, fontSize: '0.85rem',
                    }}>
                      {review.name[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: i === 1 ? '#fff' : t.ink }}>{review.name}</div>
                      <div style={{ fontSize: '0.72rem', color: i === 1 ? 'rgba(255,255,255,0.5)' : t.muted }}>{review.level}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════
          CTA BANNER
      ════════════════════════════════ */}
      <section style={{ padding: '0 24px 80px', maxWidth: 1280, margin: '0 auto' }}>
        <Reveal>
          <div style={{
            background: t.green, borderRadius: 28,
            padding: 'clamp(40px, 6vw, 72px) clamp(28px, 6vw, 72px)',
            display: 'flex', flexDirection: 'row',
            alignItems: 'center', justifyContent: 'space-between',
            gap: 32, flexWrap: 'wrap',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* bg glow */}
            <div style={{
              position: 'absolute', right: -40, top: -40,
              width: 300, height: 300,
              background: `radial-gradient(circle, rgba(244,162,38,0.2) 0%, transparent 70%)`,
              borderRadius: '50%', pointerEvents: 'none',
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <span style={{
                background: 'rgba(244,162,38,0.2)', color: t.amber,
                fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', borderRadius: 999,
                padding: '4px 12px', display: 'inline-block', marginBottom: 16,
              }}>
                📦 Free to list
              </span>
              <h2 style={{
                fontFamily: "'Syne', sans-serif", fontWeight: 800,
                fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                color: '#fff', lineHeight: 1.1, marginBottom: 12,
              }}>
                Got something to sell?<br />
                <span style={{ color: t.amber }}>List it in 2 minutes.</span>
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.95rem' }}>
                Reach 2,500+ verified Babcock students. No fees. No stress.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0, position: 'relative', zIndex: 1 }}>
              <Link to="/sell" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: t.amber, color: t.ink,
                fontFamily: "'Syne', sans-serif", fontWeight: 700,
                fontSize: '0.95rem', padding: '15px 32px', borderRadius: 14,
                textDecoration: 'none', boxShadow: '0 4px 20px rgba(244,162,38,0.4)',
                transition: 'transform 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Start Selling <ArrowRight size={16} />
              </Link>
              <Link to="/shop" style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 500,
                textDecoration: 'none',
              }}>
                Or browse listings →
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

    </div>
  );
};

export default Home;