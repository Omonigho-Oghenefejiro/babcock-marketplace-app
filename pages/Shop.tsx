import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronDown, Search, SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import BlurredProduct from '../components/BlurredProduct';
import { useStore } from '../contexts/StoreContext';

/* ── Design tokens ── */
const t = {
  green:      '#1B4332',
  greenMid:   '#2D6A4F',
  greenLight: '#D8F3DC',
  greenPale:  '#F0FAF2',
  amber:      '#F4A226',
  cream:      '#FAF7F2',
  ink:        '#1A1A1A',
  muted:      '#6B7280',
  border:     '#E8E2D9',
};

/* ── Category emoji map ── */
const categoryEmoji: Record<string, string> = {
  Textbooks:   '📚',
  Electronics: '💻',
  Hostel:      '🛏️',
  Fashion:     '👗',
  Tech:        '📱',
  Stationery:  '✏️',
  Food:        '🍱',
  Sports:      '⚽',
  All:         '🛒',
};

/* ── Sort options ── */
const SORT_OPTIONS = [
  { value: 'default',    label: 'Default'       },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating',     label: 'Top Rated'     },
  { value: 'newest',     label: 'Newest'        },
];

/* ════════════════════════════════
   SHOP PAGE
════════════════════════════════ */
const Shop = () => {
  const { products, searchQuery, setSearchQuery, user } = useStore();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState(50000);
  const [sortBy, setSortBy] = useState('default');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = useMemo(() => {
    let list = products.filter(p => {
      const matchSearch   = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchPrice    = p.price <= priceRange;
      return matchSearch && matchCategory && matchPrice;
    });

    switch (sortBy) {
      case 'price_asc':  list = [...list].sort((a, b) => a.price - b.price); break;
      case 'price_desc': list = [...list].sort((a, b) => b.price - a.price); break;
      case 'rating':     list = [...list].sort((a, b) => b.ratings - a.ratings); break;
    }
    return list;
  }, [products, searchQuery, selectedCategory, priceRange, sortBy]);

  const hasActiveFilters = selectedCategory !== 'All' || priceRange < 50000;

  const clearFilters = () => {
    setSelectedCategory('All');
    setPriceRange(50000);
    setSortBy('default');
  };

  const currentSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label ?? 'Sort';

  /* ── Filter sidebar content (shared between desktop + drawer) ── */
  const FilterContent = () => (
    <div style={{ fontFamily: "'Instrument Sans', sans-serif" }}>

      {/* Categories */}
      <div style={{ marginBottom: 32 }}>
        <p style={{
          fontFamily: "'Syne', sans-serif", fontWeight: 700,
          fontSize: '0.68rem', letterSpacing: '0.12em',
          textTransform: 'uppercase', color: t.muted, marginBottom: 12,
        }}>
          Category
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {categories.map(cat => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', borderRadius: 10, border: 'none',
                  background: active ? t.green : 'transparent',
                  cursor: 'pointer', textAlign: 'left', width: '100%',
                  transition: 'all 0.15s', fontFamily: "'Instrument Sans', sans-serif",
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = t.greenPale; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ fontSize: '1rem' }}>{categoryEmoji[cat] ?? '🏷️'}</span>
                <span style={{
                  fontWeight: active ? 600 : 500, fontSize: '0.875rem',
                  color: active ? '#fff' : t.ink, flex: 1,
                }}>
                  {cat}
                </span>
                {active && (
                  <span style={{
                    background: 'rgba(255,255,255,0.2)', color: '#fff',
                    fontSize: '0.65rem', fontWeight: 700, borderRadius: 99,
                    padding: '1px 7px',
                  }}>
                    {cat === 'All' ? products.length : products.filter(p => p.category === cat).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price range */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <p style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 700,
            fontSize: '0.68rem', letterSpacing: '0.12em',
            textTransform: 'uppercase', color: t.muted,
          }}>
            Max Price
          </p>
          <span style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 700,
            fontSize: '0.82rem', color: t.green,
          }}>
            ₦{priceRange.toLocaleString()}
          </span>
        </div>

        <input
          type="range" min={0} max={50000} step={500}
          value={priceRange}
          onChange={e => setPriceRange(Number(e.target.value))}
          style={{
            width: '100%', accentColor: t.green,
            height: 4, cursor: 'pointer',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ fontSize: '0.7rem', color: t.muted }}>₦0</span>
          <span style={{ fontSize: '0.7rem', color: t.muted }}>₦50,000+</span>
        </div>
      </div>

      {/* Clear button */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          style={{
            width: '100%', padding: '10px', borderRadius: 10,
            border: `1.5px solid ${t.border}`, background: 'transparent',
            color: t.muted, fontFamily: "'Instrument Sans', sans-serif",
            fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#EF4444'; e.currentTarget.style.color = '#EF4444'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.muted; }}
        >
          ✕ Clear Filters
        </button>
      )}
    </div>
  );

  return (
    <div style={{ background: t.cream, minHeight: '100vh', fontFamily: "'Instrument Sans', sans-serif" }}>

      {/* ── Page Header ── */}
      <div style={{
        background: t.green, padding: '48px 24px 56px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Texture lines */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 80px)`,
        }} />
        <div style={{
          position: 'absolute', right: -40, top: -40, width: 320, height: 320,
          background: `radial-gradient(circle, rgba(244,162,38,0.15) 0%, transparent 70%)`,
          borderRadius: '50%',
        }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(244,162,38,0.15)', color: t.amber,
              border: '1px solid rgba(244,162,38,0.25)',
              fontWeight: 600, fontSize: '0.7rem', letterSpacing: '0.1em',
              textTransform: 'uppercase', borderRadius: 999, padding: '5px 14px', marginBottom: 16,
            }}>
              🛒 Browse & Discover
            </span>
            <h1 style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 800,
              fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#fff',
              lineHeight: 1.1, marginBottom: 10,
            }}>
              Campus Marketplace
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.95rem' }}>
              Verified Babcock students buying & selling every day
            </p>
          </motion.div>
        </div>

        {/* Wave bottom */}
        <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, lineHeight: 0 }}>
          <svg viewBox="0 0 1440 40" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 40 }}>
            <path d="M0,40 C400,10 1040,38 1440,18 L1440,40 Z" fill={t.cream} />
          </svg>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 24px 0' }}>
        <div style={{
          background: '#fff', border: `1.5px solid ${t.border}`, borderRadius: 16,
          padding: '12px 16px', display: 'flex', alignItems: 'center',
          gap: 12, flexWrap: 'wrap',
        }}>

          {/* Search */}
          <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: t.muted }} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
                border: `1.5px solid ${t.border}`, borderRadius: 10,
                fontFamily: "'Instrument Sans', sans-serif", fontSize: '0.875rem',
                color: t.ink, background: t.cream, outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = t.greenMid; e.currentTarget.style.background = '#fff'; }}
              onBlur={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.background = t.cream; }}
            />
          </div>

          {/* Result count */}
          <span style={{ fontSize: '0.82rem', color: t.muted, whiteSpace: 'nowrap' }}>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: t.ink }}>{filteredProducts.length}</span> products
          </span>

          {/* Active filter chips */}
          {selectedCategory !== 'All' && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: t.greenLight, color: t.green,
              fontSize: '0.75rem', fontWeight: 600, borderRadius: 999, padding: '4px 10px',
            }}>
              {categoryEmoji[selectedCategory]} {selectedCategory}
              <button onClick={() => setSelectedCategory('All')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.green, padding: 0, lineHeight: 1 }}>×</button>
            </span>
          )}

          {priceRange < 50000 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: '#FEF3C7', color: '#92400E',
              fontSize: '0.75rem', fontWeight: 600, borderRadius: 999, padding: '4px 10px',
            }}>
              ≤ ₦{priceRange.toLocaleString()}
              <button onClick={() => setPriceRange(50000)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#92400E', padding: 0, lineHeight: 1 }}>×</button>
            </span>
          )}

          {/* Sort dropdown */}
          <div style={{ position: 'relative' }} ref={sortRef}>
            <button
              onClick={() => setSortOpen(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                border: `1.5px solid ${sortOpen ? t.greenMid : t.border}`,
                background: sortOpen ? t.greenPale : '#fff',
                borderRadius: 10, padding: '8px 12px', cursor: 'pointer',
                fontFamily: "'Instrument Sans', sans-serif", fontWeight: 600,
                fontSize: '0.8rem', color: t.ink, transition: 'all 0.15s',
              }}
            >
              <SlidersHorizontal size={13} /> {currentSortLabel}
              <ChevronDown size={12} style={{ transform: sortOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
            </button>
            {sortOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 20,
                background: '#fff', border: `1.5px solid ${t.border}`, borderRadius: 12,
                boxShadow: '0 8px 28px rgba(0,0,0,0.08)', minWidth: 180, overflow: 'hidden',
              }}>
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '10px 14px', border: 'none', cursor: 'pointer',
                      fontFamily: "'Instrument Sans', sans-serif", fontSize: '0.85rem',
                      fontWeight: sortBy === opt.value ? 600 : 400,
                      color: sortBy === opt.value ? t.green : t.ink,
                      background: sortBy === opt.value ? t.greenPale : '#fff',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (sortBy !== opt.value) e.currentTarget.style.background = t.cream; }}
                    onMouseLeave={e => { if (sortBy !== opt.value) e.currentTarget.style.background = '#fff'; }}
                  >
                    {sortBy === opt.value && '✓ '}{opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setDrawerOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: t.green, color: '#fff', border: 'none',
              borderRadius: 10, padding: '8px 14px', cursor: 'pointer',
              fontFamily: "'Instrument Sans', sans-serif", fontWeight: 600,
              fontSize: '0.8rem',
            }}
            className="lg:hidden"
          >
            <Filter size={13} /> Filters
            {hasActiveFilters && (
              <span style={{
                background: t.amber, color: t.ink, width: 16, height: 16,
                borderRadius: '50%', fontSize: '0.65rem', fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>!</span>
            )}
          </button>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 24px 72px', display: 'flex', gap: 28, alignItems: 'flex-start' }}>

        {/* ── Desktop Sidebar ── */}
        <aside
          style={{
            width: 240, flexShrink: 0, position: 'sticky', top: 104,
            background: '#fff', border: `1.5px solid ${t.border}`, borderRadius: 20,
            padding: '24px 20px',
          }}
          className="hidden lg:block"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <div style={{
              background: t.greenLight, width: 32, height: 32, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Filter size={14} color={t.green} />
            </div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.95rem', color: t.ink }}>Filters</span>
          </div>
          <FilterContent />
        </aside>

        {/* ── Product Grid ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <AnimatePresence mode="wait">
            {filteredProducts.length > 0 ? (
              <motion.div
                key={`${selectedCategory}-${priceRange}-${sortBy}-${searchQuery}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                  gap: 18,
                }}
              >
                {filteredProducts.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {user ? (
                      <ProductCard product={product} />
                    ) : (
                      i >= 4 ? <BlurredProduct index={i} /> : <ProductCard product={product} />
                    )}
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  background: '#fff', border: `1.5px dashed ${t.border}`,
                  borderRadius: 20, padding: '72px 32px', textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1.2rem', color: t.ink, marginBottom: 8 }}>
                  No products found
                </h3>
                <p style={{ color: t.muted, fontSize: '0.875rem', marginBottom: 24 }}>
                  Try adjusting your filters or search terms
                </p>
                <button
                  onClick={clearFilters}
                  style={{
                    background: t.green, color: '#fff', border: 'none',
                    borderRadius: 12, padding: '11px 28px', cursor: 'pointer',
                    fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.9rem',
                  }}
                >
                  Clear all filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Mobile Filter Drawer ── */}
      <>
        <div
          onClick={() => setDrawerOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 49,
            opacity: drawerOpen ? 1 : 0, pointerEvents: drawerOpen ? 'all' : 'none',
            transition: 'opacity 0.25s',
          }}
        />
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
          background: '#fff', borderRadius: '20px 20px 0 0',
          transform: drawerOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1)',
          maxHeight: '85vh', overflowY: 'auto',
          padding: '0 20px 40px',
        }}>
          {/* Handle */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 20px' }}>
            <div style={{ width: 40, height: 4, background: t.border, borderRadius: 99 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.1rem', color: t.ink }}>Filters</span>
            <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.muted }}>
              <X size={20} />
            </button>
          </div>
          <FilterContent />
          <button
            onClick={() => setDrawerOpen(false)}
            style={{
              width: '100%', marginTop: 24, padding: '14px', background: t.green,
              color: '#fff', border: 'none', borderRadius: 14, cursor: 'pointer',
              fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.95rem',
            }}
          >
            Show {filteredProducts.length} Products
          </button>
        </div>
      </>

    </div>
  );
};

export default Shop;