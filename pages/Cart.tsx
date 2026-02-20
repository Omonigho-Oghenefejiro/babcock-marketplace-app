import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2, ShoppingBag, ShoppingCart, CreditCard,
  Loader, Plus, Minus, ShieldAlert, ArrowLeft, Tag
} from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { useToast } from '../contexts/ToastContext';
import API from '../services/api';

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

/* ════════════════════════
   CART
════════════════════════ */
const Cart = () => {
  const { cart, removeFromCart, updateQuantity, user } = useStore();
  const { addToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const subtotal   = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const serviceFee = 500;
  const total      = subtotal + serviceFee;

  const handleCheckout = async () => {
    if (!user) { navigate('/login'); return; }
    setIsProcessing(true);
    try {
      const { data } = await API.post('/payment/initialize', { email: user.email, amount: total });
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        addToast('Failed to initialize payment', 'error');
        setIsProcessing(false);
      }
    } catch {
      addToast('Payment connection failed', 'error');
      setIsProcessing(false);
    }
  };

  /* ── Admin view ── */
  if (user?.role === 'admin') {
    return (
      <EmptyState
        icon={<ShieldAlert size={32} color={t.green} />}
        title="Administrator View"
        desc="Admins cannot place orders. Switch to a student account to shop."
        cta={{ label: 'Go to Admin Dashboard', to: '/admin' }}
      />
    );
  }

  /* ── Empty cart ── */
  if (cart.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag size={32} color={t.green} />}
        title="Your cart is empty"
        desc="You haven't added anything yet. Go find something you need."
        cta={{ label: 'Browse Products', to: '/shop' }}
      />
    );
  }

  return (
    <div style={{ background: t.cream, minHeight: '100vh', fontFamily: "'Instrument Sans', sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ background: t.green, padding: '40px 24px 56px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 80px)`,
        }} />
        <div style={{
          position: 'absolute', right: -40, top: -40, width: 280, height: 280,
          background: `radial-gradient(circle, rgba(244,162,38,0.15) 0%, transparent 70%)`, borderRadius: '50%',
        }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Link to="/shop" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', fontWeight: 500,
            textDecoration: 'none', marginBottom: 16, transition: 'color 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
          >
            <ArrowLeft size={14} /> Continue Shopping
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              background: 'rgba(255,255,255,0.1)', width: 44, height: 44,
              borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ShoppingCart size={20} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.8rem', color: '#fff', lineHeight: 1.1 }}>
                Shopping Cart
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', marginTop: 2 }}>
                {cart.length} item{cart.length !== 1 ? 's' : ''} in your cart
              </p>
            </div>
          </div>
        </div>
        {/* Wave */}
        <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, lineHeight: 0 }}>
          <svg viewBox="0 0 1440 40" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 40 }}>
            <path d="M0,40 C400,10 1040,38 1440,18 L1440,40 Z" fill={t.cream} />
          </svg>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 28, alignItems: 'start' }}
        className="cart-grid"
      >
        {/* ── Cart items ── */}
        <div>
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  background: '#fff', border: `1.5px solid ${t.border}`,
                  borderRadius: 18, padding: '20px 24px',
                  display: 'flex', gap: 18, alignItems: 'center',
                  marginBottom: 14,
                }}
              >
                {/* Image */}
                <Link to={`/product/${item.id}`} style={{ flexShrink: 0 }}>
                  <div style={{
                    width: 88, height: 88, borderRadius: 12,
                    overflow: 'hidden', background: t.cream,
                    border: `1px solid ${t.border}`,
                  }}>
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                    />
                  </div>
                </Link>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ minWidth: 0 }}>
                      <Link to={`/product/${item.id}`} style={{ textDecoration: 'none' }}>
                        <h3 style={{
                          fontFamily: "'Syne', sans-serif", fontWeight: 700,
                          fontSize: '0.97rem', color: t.ink, lineHeight: 1.3,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                          {item.title}
                        </h3>
                      </Link>
                      <span style={{
                        display: 'inline-block', marginTop: 4,
                        background: t.greenLight, color: t.greenMid,
                        fontSize: '0.68rem', fontWeight: 600, borderRadius: 6, padding: '2px 8px',
                      }}>
                        {item.category}
                      </span>
                    </div>
                    <p style={{
                      fontFamily: "'Syne', sans-serif", fontWeight: 800,
                      fontSize: '1.1rem', color: t.green, flexShrink: 0,
                    }}>
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                    {/* Qty controls */}
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      border: `1.5px solid ${t.border}`, borderRadius: 10, overflow: 'hidden',
                    }}>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        style={{
                          width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'none', border: 'none', cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer',
                          color: item.quantity <= 1 ? '#D1D5DB' : t.ink, transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => { if (item.quantity > 1) e.currentTarget.style.background = t.greenPale; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                      >
                        <Minus size={13} />
                      </button>
                      <input
                        type="text" inputMode="numeric"
                        value={item.quantity}
                        onChange={e => {
                          const n = parseInt(e.target.value);
                          if (!isNaN(n) && n > 0) updateQuantity(item.id, Math.min(n, Number(item.stock)));
                        }}
                        style={{
                          width: 36, height: 34, textAlign: 'center',
                          border: 'none', borderLeft: `1px solid ${t.border}`, borderRight: `1px solid ${t.border}`,
                          fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.85rem',
                          color: t.ink, background: '#fff', outline: 'none',
                        }}
                      />
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= Number(item.stock)}
                        style={{
                          width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'none', border: 'none', cursor: item.quantity >= Number(item.stock) ? 'not-allowed' : 'pointer',
                          color: item.quantity >= Number(item.stock) ? '#D1D5DB' : t.ink, transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => { if (item.quantity < Number(item.stock)) e.currentTarget.style.background = t.greenPale; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        background: 'none', border: '1.5px solid #FEE2E2',
                        borderRadius: 9, padding: '6px 12px', cursor: 'pointer',
                        color: '#DC2626', fontSize: '0.75rem', fontWeight: 600,
                        fontFamily: "'Instrument Sans', sans-serif", transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* ── Order Summary ── */}
        <div style={{ position: 'sticky', top: 104 }}>
          <div style={{
            background: '#fff', border: `1.5px solid ${t.border}`,
            borderRadius: 20, overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{ background: t.green, padding: '18px 24px' }}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1rem', color: '#fff' }}>
                Order Summary
              </h2>
            </div>

            <div style={{ padding: '20px 24px' }}>
              {/* Line items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.875rem', color: t.muted }}>Subtotal ({cart.length} items)</span>
                  <span style={{ fontWeight: 600, color: t.ink, fontSize: '0.875rem' }}>₦{subtotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.875rem', color: t.muted, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Tag size={12} /> Service Fee
                  </span>
                  <span style={{ fontWeight: 600, color: t.ink, fontSize: '0.875rem' }}>₦{serviceFee.toLocaleString()}</span>
                </div>
              </div>

              {/* Divider */}
              <div style={{ borderTop: `1px solid ${t.border}`, margin: '16px 0' }} />

              {/* Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 22 }}>
                <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1rem', color: t.ink }}>Total</span>
                <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.3rem', color: t.green }}>
                  ₦{total.toLocaleString()}
                </span>
              </div>

              {/* Checkout button */}
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: isProcessing ? '#059669' : '#059669',
                  color: '#fff', border: 'none', borderRadius: 12, padding: '15px',
                  fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.95rem',
                  cursor: isProcessing ? 'not-allowed' : 'pointer', opacity: isProcessing ? 0.8 : 1,
                  boxShadow: '0 4px 16px rgba(5,150,105,0.3)', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { if (!isProcessing) e.currentTarget.style.background = '#047857'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#059669'; }}
              >
                {isProcessing
                  ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</>
                  : <><CreditCard size={16} /> Pay ₦{total.toLocaleString()}</>
                }
              </button>

              {/* Paystack badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14 }}>
                <span style={{ fontSize: '0.7rem', color: t.muted }}>Secured by</span>
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/1/1f/Paystack.png"
                  alt="Paystack" style={{ height: 16, opacity: 0.5 }}
                />
              </div>
            </div>
          </div>

          {/* Trust note */}
          <div style={{
            marginTop: 14, background: t.greenPale, border: `1px solid ${t.greenLight}`,
            borderRadius: 12, padding: '12px 16px',
            display: 'flex', alignItems: 'flex-start', gap: 10,
          }}>
            <span style={{ fontSize: '1rem', flexShrink: 0 }}>🔒</span>
            <p style={{ fontSize: '0.75rem', color: t.greenMid, lineHeight: 1.6 }}>
              All transactions are processed securely. Your payment info is never stored on our servers.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .cart-grid { grid-template-columns: 1fr !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

/* ── Shared empty state ── */
const EmptyState = ({ icon, title, desc, cta }: {
  icon: React.ReactNode; title: string; desc: string;
  cta: { label: string; to: string };
}) => (
  <div style={{ background: t.cream, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      style={{ textAlign: 'center', maxWidth: 360 }}
    >
      <div style={{
        width: 80, height: 80, borderRadius: 20,
        background: t.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px',
      }}>
        {icon}
      </div>
      <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.4rem', color: t.ink, marginBottom: 8 }}>{title}</h2>
      <p style={{ fontSize: '0.875rem', color: t.muted, marginBottom: 24, lineHeight: 1.7 }}>{desc}</p>
      <Link to={cta.to} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: t.green, color: '#fff', textDecoration: 'none',
        fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.9rem',
        padding: '12px 28px', borderRadius: 12,
        boxShadow: '0 4px 16px rgba(27,67,50,0.2)',
      }}>
        {cta.label} <ArrowLeft size={14} style={{ transform: 'rotate(180deg)' }} />
      </Link>
    </motion.div>
  </div>
);

export default Cart;