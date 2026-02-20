import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star, ArrowLeft, Plus, Minus,
  ShoppingCart, MessageSquare, Smartphone, Heart
} from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import Reviews from '../components/Reviews';

/* ── Tokens ── */
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

const conditionConfig: Record<string, { bg: string; color: string }> = {
  'New':      { bg: '#D1FAE5', color: '#065F46' },
  'Like New': { bg: '#DBEAFE', color: '#1E40AF' },
  'Good':     { bg: '#FEF3C7', color: '#92400E' },
  'Fair':     { bg: '#FFE4E6', color: '#9F1239' },
};

const ProductDetail = () => {
  const { id } = useParams();
  const { products, addToCart, toggleWishlist, wishlist, user } = useStore();
  const navigate = useNavigate();
  const product = products.find(p => p.id === id);

  const [qty, setQty] = useState<number | string>(1);
  const [activeImg, setActiveImg] = useState(0);
  const [cartPopped, setCartPopped] = useState(false);

  const isWishlisted  = wishlist.some(w => w.id === id);
  const isOwnProduct  = user?.id === product?.seller?.id;
  const isAdmin       = user?.role === 'admin';
  const condition     = conditionConfig[product?.condition ?? ''] ?? { bg: '#F3F4F6', color: '#6B7280' };

  /* ── Not found ── */
  if (!product) {
    return (
      <div style={{ minHeight: '100vh', background: t.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>📦</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.4rem', color: t.ink, marginBottom: 8 }}>Product Not Found</h2>
          <p style={{ color: t.muted, marginBottom: 24 }}>This listing may have been removed or doesn't exist.</p>
          <Link to="/shop" style={{
            background: t.green, color: '#fff', textDecoration: 'none',
            fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.9rem',
            padding: '12px 28px', borderRadius: 12, display: 'inline-block',
          }}>Back to Shop</Link>
        </motion.div>
      </div>
    );
  }

  const images = product.images?.length ? product.images : ['https://placehold.co/600x600/E8E2D9/1A1A1A?text=No+Image'];

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login', { state: { from: `/product/${id}`, message: 'Sign in to add items to your cart' } });
      return;
    }
    addToCart(product, typeof qty === 'number' ? qty : 1);
    setCartPopped(true);
    setTimeout(() => setCartPopped(false), 1500);
  };

  const handleChat = () => {
    if (!user) {
      navigate('/login', { state: { from: `/product/${id}`, message: 'Sign in to message the seller' } });
      return;
    }
    navigate('/messages', { state: { sellerId: product.seller.id, productId: product.id, sellerName: product.seller.fullName || 'Seller' } });
  };

  const increment = () => setQty(q => (typeof q === 'number' ? q + 1 : 1));
  const decrement = () => setQty(q => (typeof q === 'number' && q > 1 ? q - 1 : 1));

  const stars = Array.from({ length: 5 }, (_, i) => i < Math.floor(product.ratings));

  return (
    <div style={{ background: t.cream, minHeight: '100vh', fontFamily: "'Instrument Sans', sans-serif" }}>

      {/* ── Breadcrumb ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 24px 0' }}>
        <Link to="/shop" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: t.muted, fontSize: '0.82rem', fontWeight: 500,
          textDecoration: 'none', transition: 'color 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.color = t.green; }}
          onMouseLeave={e => { e.currentTarget.style.color = t.muted; }}
        >
          <ArrowLeft size={14} /> Back to Shop
        </Link>
      </div>

      {/* ── Main product section ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 0' }}>
        <div style={{
          background: '#fff', border: `1.5px solid ${t.border}`,
          borderRadius: 24, overflow: 'hidden',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
        }}
          className="product-grid"
        >
          {/* ── Image panel ── */}
          <div style={{ background: t.cream, padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Main image */}
            <motion.div
              style={{
                borderRadius: 18, overflow: 'hidden',
                background: '#fff', border: `1px solid ${t.border}`,
                aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}
              layoutId="main-image"
            >
              <img
                src={images[activeImg]}
                alt={product.title}
                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 16 }}
              />

              {/* Condition badge */}
              {product.condition && (
                <div style={{
                  position: 'absolute', top: 14, left: 14,
                  background: condition.bg, color: condition.color,
                  fontSize: '0.68rem', fontWeight: 700, borderRadius: 6, padding: '3px 9px',
                }}>
                  {product.condition}
                </div>
              )}

              {/* Wishlist */}
              <button
                onClick={() => {
                  if (!user) { navigate('/login', { state: { from: `/product/${id}` } }); return; }
                  toggleWishlist(product);
                }}
                style={{
                  position: 'absolute', top: 12, right: 12,
                  width: 36, height: 36, borderRadius: '50%',
                  background: isWishlisted ? '#EF4444' : 'rgba(255,255,255,0.95)',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <Heart size={16} color={isWishlisted ? '#fff' : t.muted} fill={isWishlisted ? '#fff' : 'none'} />
              </button>
            </motion.div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} style={{
                    width: 64, height: 64, borderRadius: 10, overflow: 'hidden',
                    border: `2px solid ${activeImg === i ? t.green : t.border}`,
                    padding: 0, cursor: 'pointer', background: '#fff', transition: 'border-color 0.15s',
                  }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Details panel ── */}
          <div style={{ padding: '36px 40px', display: 'flex', flexDirection: 'column' }}>

            {/* Category pill */}
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              background: t.greenPale, color: t.greenMid,
              fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', borderRadius: 6, padding: '4px 10px',
              marginBottom: 14, alignSelf: 'flex-start',
              border: `1px solid ${t.greenLight}`,
            }}>
              {product.category}
            </span>

            {/* Title */}
            <h1 style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 800,
              fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', color: t.ink,
              lineHeight: 1.15, marginBottom: 14,
            }}>
              {product.title}
            </h1>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 2 }}>
                {stars.map((filled, i) => (
                  <Star key={i} size={16} fill={filled ? t.amber : 'none'} color={filled ? t.amber : '#D1D5DB'} />
                ))}
              </div>
              <span style={{ fontSize: '0.82rem', color: t.muted }}>{product.ratings.toFixed(1)} / 5.0</span>
            </div>

            {/* Description */}
            <p style={{ fontSize: '0.9rem', color: t.muted, lineHeight: 1.75, marginBottom: 24 }}>
              {product.description}
            </p>

            {/* Seller info */}
            <div style={{
              background: t.cream, border: `1px solid ${t.border}`,
              borderRadius: 12, padding: '14px 16px', marginBottom: 24,
              display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: t.greenMid }}>Verified Seller</span>
              </div>
              {product.seller?.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: t.muted, fontSize: '0.82rem' }}>
                  <Smartphone size={13} />
                  <span>{product.seller.phone}</span>
                </div>
              )}
            </div>

            {/* Price + qty */}
            <div style={{ marginTop: 'auto' }}>
              <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 20, marginBottom: 20 }}>
                <p style={{ fontSize: '0.72rem', color: t.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Price</p>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
                  <span style={{
                    fontFamily: "'Syne', sans-serif", fontWeight: 800,
                    fontSize: '2.2rem', color: t.green, lineHeight: 1,
                  }}>
                    ₦{product.price.toLocaleString()}
                  </span>

                  {/* Qty controls — only for non-owner, non-admin */}
                  {!isOwnProduct && !isAdmin && (
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      border: `1.5px solid ${t.border}`, borderRadius: 10, overflow: 'hidden',
                    }}>
                      <button
                        onClick={decrement}
                        disabled={qty === 1 || qty === ''}
                        style={{
                          width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'none', border: 'none', cursor: 'pointer', color: t.ink, transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = t.greenPale; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                      >
                        <Minus size={13} />
                      </button>
                      <input
                        type="text" inputMode="numeric" value={qty}
                        onChange={e => {
                          const v = e.target.value;
                          if (v === '') { setQty(''); return; }
                          const n = parseInt(v);
                          if (!isNaN(n) && n > 0) setQty(n);
                        }}
                        onBlur={() => { if (!qty || qty === '') setQty(1); }}
                        style={{
                          width: 40, height: 36, textAlign: 'center',
                          border: 'none', borderLeft: `1px solid ${t.border}`, borderRight: `1px solid ${t.border}`,
                          fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.9rem',
                          color: t.ink, background: '#fff', outline: 'none',
                        }}
                      />
                      <button
                        onClick={increment}
                        style={{
                          width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'none', border: 'none', cursor: 'pointer', color: t.ink, transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = t.greenPale; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              {!isOwnProduct && !isAdmin ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      background: cartPopped ? t.greenMid : product.inStock ? t.green : '#E5E7EB',
                      color: product.inStock ? '#fff' : t.muted,
                      border: 'none', borderRadius: 12, padding: '15px',
                      fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.95rem',
                      cursor: product.inStock ? 'pointer' : 'not-allowed',
                      boxShadow: product.inStock ? '0 4px 16px rgba(27,67,50,0.25)' : 'none',
                      transition: 'all 0.2s', transform: cartPopped ? 'scale(1.02)' : 'scale(1)',
                    }}
                  >
                    <ShoppingCart size={17} />
                    {!product.inStock ? 'Out of Stock' : cartPopped ? 'Added to Cart ✓' : 'Add to Cart'}
                  </button>
                  <button
                    onClick={handleChat}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      background: 'none', color: t.green,
                      border: `2px solid ${t.greenLight}`, borderRadius: 12, padding: '13px',
                      fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.9rem',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = t.greenPale; e.currentTarget.style.borderColor = t.greenMid; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = t.greenLight; }}
                  >
                    <MessageSquare size={16} /> Chat with Seller
                  </button>
                </div>
              ) : (
                <div style={{
                  background: t.cream, border: `1px solid ${t.border}`,
                  borderRadius: 12, padding: '14px 16px', textAlign: 'center',
                  fontSize: '0.85rem', color: t.muted, lineHeight: 1.6,
                }}>
                  {isAdmin ? '🔑 Admins cannot purchase items.' : '🏪 You are the seller of this item.'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Reviews ── */}
        <div style={{
          background: '#fff', border: `1.5px solid ${t.border}`,
          borderRadius: 24, padding: '36px 40px', margin: '24px 0 72px',
        }}>
          <Reviews productId={product.id} />
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .product-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;