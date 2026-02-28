import React, { useState } from 'react';
import { Heart, ShoppingCart, Star, ArrowUpRight, CreditCard } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../contexts/StoreContext';
import { Link, useNavigate } from 'react-router-dom';

/* ── Design tokens ── */
const t = {
  green:      '#1B4332',
  greenMid:   '#2D6A4F',
  greenLight: '#D8F3DC',
  greenPale:  '#F0FAF2',
  amber:      '#F4A226',
  amberLight: '#FEF9EE',
  cream:      '#FAF7F2',
  ink:        '#1A1A1A',
  muted:      '#9CA3AF',
  border:     '#E8E2D9',
};

const conditionConfig: Record<string, { label: string; bg: string; color: string }> = {
  'New':      { label: 'New',      bg: '#D1FAE5', color: '#065F46' },
  'Like New': { label: 'Like New', bg: '#DBEAFE', color: '#1E40AF' },
  'Good':     { label: 'Good',     bg: '#FEF3C7', color: '#92400E' },
  'Fair':     { label: 'Fair',     bg: '#FFE4E6', color: '#9F1239' },
};

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, compact = false }) => {
  const { user, addToCart, toggleWishlist, wishlist } = useStore();
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [cartPop, setCartPop] = useState(false);

  const isWishlisted = wishlist.some(item => item.id === product.id);
  const mainImage = product.images?.[0] || 'https://placehold.co/400x400/E8E2D9/1A1A1A?text=No+Image';
  const condition = conditionConfig[product.condition] || { label: product.condition, bg: '#F3F4F6', color: '#6B7280' };
  const ratingValue = typeof product.ratings === 'number' ? product.ratings : Number(product.ratings) || 0;
  const availableQty = Number(product.quantity ?? (product.inStock ? 1 : 0));

  const goToLogin = (msg: string) =>
    navigate('/login', { state: { from: `/product/${product.id}`, message: msg, pendingAction: { type: 'cart', productId: product.id } } });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return goToLogin('Sign in to add items to your cart');
    if (!product.inStock) return;
    addToCart(product);
    setCartPop(true);
    setTimeout(() => setCartPop(false), 1400);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return goToLogin('Sign in to save items to your wishlist');
    toggleWishlist(product);
  };

  /* ── Compact variant ── */
  if (compact) {
    return (
      <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{
          background: '#fff', border: `1.5px solid ${t.border}`,
          borderRadius: 14, overflow: 'hidden',
          transition: 'box-shadow 0.2s, transform 0.2s',
          fontFamily: "'Instrument Sans', sans-serif",
        }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(27,67,50,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <div style={{ aspectRatio: '1', overflow: 'hidden', background: t.cream }}>
            <img
              src={imageError ? 'https://placehold.co/400x400/E8E2D9/1A1A1A?text=No+Image' : mainImage}
              alt={product.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
              onError={() => setImageError(true)}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            />
          </div>
          <div style={{ padding: '10px 12px' }}>
            <p style={{ fontWeight: 600, fontSize: '0.8rem', color: t.ink, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', marginBottom: 2 }}>{product.title}</p>
            <p style={{ fontSize: '0.7rem', color: t.muted, marginBottom: 2 }}>{product.category}</p>
            <p style={{ fontSize: '0.68rem', color: t.muted, marginBottom: 6 }}>{availableQty} available</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '0.9rem', color: t.green }}>₦{product.price.toLocaleString()}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  onClick={handleAddToCart}
                  style={{
                    background: t.green, color: '#fff',
                    border: 'none', borderRadius: 8, padding: '5px 10px',
                    fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                    fontFamily: "'Instrument Sans', sans-serif",
                  }}
                >
                  Add
                </button>
                <Link
                  to="/pay"
                  state={{ product }}
                  style={{
                    background: t.greenPale,
                    color: t.greenMid,
                    border: `1px solid ${t.greenLight}`,
                    borderRadius: 8,
                    padding: '4px 6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                  }}
                  aria-label="Pay now"
                  title="Pay now"
                >
                  <CreditCard size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  /* ── Full card ── */
  return (
    <div
      style={{
        background: '#fff',
        border: `1.5px solid ${hovered ? t.greenMid : t.border}`,
        borderRadius: 20,
        overflow: 'hidden',
        transition: 'all 0.25s cubic-bezier(0.22,1,0.36,1)',
        boxShadow: hovered ? '0 12px 36px rgba(27,67,50,0.12)' : '0 1px 4px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        fontFamily: "'Instrument Sans', sans-serif",
        position: 'relative',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Image ── */}
      <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', display: 'block', position: 'relative' }}>
        <div style={{ aspectRatio: '1', overflow: 'hidden', background: t.cream, position: 'relative' }}>
          <img
            src={imageError ? 'https://placehold.co/400x400/E8E2D9/1A1A1A?text=No+Image' : mainImage}
            alt={product.title}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 0.45s cubic-bezier(0.22,1,0.36,1)',
              transform: hovered ? 'scale(1.07)' : 'scale(1)',
            }}
            onError={() => setImageError(true)}
          />

          {/* Quick view pill — slides up on hover */}
          <div style={{
            position: 'absolute', bottom: 12, left: '50%',
            transform: `translateX(-50%) translateY(${hovered ? 0 : 12}px)`,
            opacity: hovered ? 1 : 0,
            transition: 'all 0.25s ease',
            background: 'rgba(26,26,26,0.82)',
            backdropFilter: 'blur(8px)',
            color: '#fff', borderRadius: 999,
            padding: '6px 14px', fontSize: '0.72rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
          }}>
            <ArrowUpRight size={12} /> View details
          </div>

          {/* Out of stock overlay */}
          {!product.inStock && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(255,255,255,0.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{
                background: t.ink, color: '#fff',
                borderRadius: 999, padding: '5px 14px',
                fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em',
              }}>OUT OF STOCK</span>
            </div>
          )}
        </div>

        {/* ── Badges row ── */}
        <div style={{
          position: 'absolute', top: 10, left: 10,
          display: 'flex', gap: 5,
        }}>
          {product.condition && (
            <span style={{
              background: condition.bg, color: condition.color,
              fontSize: '0.65rem', fontWeight: 700,
              borderRadius: 6, padding: '3px 8px',
              letterSpacing: '0.03em',
            }}>
              {condition.label}
            </span>
          )}
        </div>
      </Link>

      {/* ── Wishlist button ── */}
      <button
        onClick={handleToggleWishlist}
        style={{
          position: 'absolute', top: 10, right: 10,
          width: 34, height: 34, borderRadius: '50%',
          background: isWishlisted ? '#EF4444' : 'rgba(255,255,255,0.9)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          transition: 'all 0.2s',
          transform: hovered || isWishlisted ? 'scale(1)' : 'scale(0.85)',
          opacity: hovered || isWishlisted ? 1 : 0,
        }}
        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart
          size={15}
          color={isWishlisted ? '#fff' : '#6B7280'}
          fill={isWishlisted ? '#fff' : 'none'}
        />
      </button>

      {/* ── Content ── */}
      <div style={{ padding: '16px 16px 18px' }}>

        {/* Category + rating row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{
            fontSize: '0.7rem', fontWeight: 600,
            color: t.greenMid, textTransform: 'uppercase', letterSpacing: '0.07em',
          }}>
            {product.category}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Star size={11} fill={t.amber} color={t.amber} />
            <span style={{ fontSize: '0.72rem', color: t.muted, fontWeight: 500 }}>
              {ratingValue.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Title */}
        <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
          <h3 style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 700,
            fontSize: '0.95rem', color: t.ink,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            lineHeight: 1.35, marginBottom: 8,
            transition: 'color 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = t.greenMid; }}
            onMouseLeave={e => { e.currentTarget.style.color = t.ink; }}
          >
            {product.title}
          </h3>
        </Link>

        {/* Description */}
        <p style={{
          fontSize: '0.78rem', color: t.muted, lineHeight: 1.6,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          marginBottom: 8,
        }}>
          {product.description}
        </p>
        <p style={{ fontSize: '0.72rem', color: t.muted, marginBottom: 12 }}>
          {availableQty} available
        </p>

        {/* Price + Cart row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            {product.originalPrice && (
              <span style={{ fontSize: '0.7rem', color: t.muted, textDecoration: 'line-through', marginRight: 5 }}>
                ₦{product.originalPrice.toLocaleString()}
              </span>
            )}
            <div style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 800,
              fontSize: '1.1rem', color: t.green, lineHeight: 1,
            }}>
              ₦{product.price.toLocaleString()}
            </div>
          </div>

          {/* Add to cart button — with pop animation */}
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: cartPop ? t.greenMid : product.inStock ? t.green : '#E5E7EB',
              color: product.inStock ? '#fff' : t.muted,
              border: 'none', borderRadius: 10,
              padding: '9px 14px', cursor: product.inStock ? 'pointer' : 'not-allowed',
              fontFamily: "'Instrument Sans', sans-serif", fontWeight: 600,
              fontSize: '0.8rem', transition: 'all 0.2s',
              transform: cartPop ? 'scale(1.08)' : 'scale(1)',
            }}
            onMouseEnter={e => { if (product.inStock && !cartPop) e.currentTarget.style.background = t.greenMid; }}
            onMouseLeave={e => { if (!cartPop) e.currentTarget.style.background = product.inStock ? t.green : '#E5E7EB'; }}
          >
            <ShoppingCart size={14} />
            {cartPop ? 'Added ✓' : 'Add'}
          </button>
        </div>

        <Link to="/pay" state={{ product }} style={{ textDecoration: 'none', display: 'block', marginTop: 10 }}>
          <button
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              background: t.greenPale,
              color: t.greenMid,
              border: `1.5px solid ${t.greenLight}`,
              borderRadius: 10,
              padding: '9px 12px',
              cursor: 'pointer',
              fontFamily: "'Instrument Sans', sans-serif",
              fontWeight: 700,
              fontSize: '0.8rem',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = t.greenLight;
              e.currentTarget.style.color = t.green;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = t.greenPale;
              e.currentTarget.style.color = t.greenMid;
            }}
          >
            <CreditCard size={14} />
            Pay Now
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
