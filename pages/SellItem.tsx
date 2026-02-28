import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  Upload, Tag, Loader, X,
  Smartphone, ArrowLeft, CheckCircle, DollarSign
} from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { Product } from '../types';
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

/* ── Styled input ── */
const FormField = ({
  label, children, hint, required = false,
}: {
  label: string; children: React.ReactNode; hint?: string; required?: boolean;
}) => (
  <div>
    <label style={{
      display: 'flex', alignItems: 'center', gap: 4,
      fontFamily: "'Instrument Sans', sans-serif", fontWeight: 600,
      fontSize: '0.82rem', color: t.ink, marginBottom: 6,
    }}>
      {label}
      {required && <span style={{ color: '#DC2626' }}>*</span>}
    </label>
    {children}
    {hint && <p style={{ fontSize: '0.72rem', color: t.muted, marginTop: 4 }}>{hint}</p>}
  </div>
);

const inputStyle = (focused: boolean): React.CSSProperties => ({
  width: '100%',
  padding: '11px 14px',
  border: `1.5px solid ${focused ? t.greenMid : t.border}`,
  borderRadius: 10,
  background: focused ? '#fff' : t.cream,
  fontFamily: "'Instrument Sans', sans-serif",
  fontSize: '0.875rem', color: t.ink,
  outline: 'none',
  transition: 'all 0.2s',
  boxShadow: focused ? `0 0 0 3px ${t.greenLight}` : 'none',
});

/* ── Single input wrapper with focus state ── */
const FInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      onFocus={e => { setFocused(true); props.onFocus?.(e); }}
      onBlur={e => { setFocused(false); props.onBlur?.(e); }}
      style={{ ...inputStyle(focused), ...(props.style ?? {}) }}
    />
  );
};

const FSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => {
  const [focused, setFocused] = useState(false);
  return (
    <select
      {...props}
      onFocus={e => { setFocused(true); props.onFocus?.(e); }}
      onBlur={e => { setFocused(false); props.onBlur?.(e); }}
      style={{ ...inputStyle(focused), appearance: 'none', cursor: 'pointer', ...(props.style ?? {}) }}
    />
  );
};

const FTextarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      {...props}
      onFocus={e => { setFocused(true); props.onFocus?.(e); }}
      onBlur={e => { setFocused(false); props.onBlur?.(e); }}
      style={{ ...inputStyle(focused), resize: 'vertical', minHeight: 120, ...(props.style ?? {}) }}
    />
  );
};

/* ════════════════════════
   SELL ITEM
════════════════════════ */
const SellItem = () => {
  const { user, addProduct } = useStore();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title,       setTitle]       = useState('');
  const [price,       setPrice]       = useState('');
  const [quantity,    setQuantity]    = useState('1');
  const [category,    setCategory]    = useState('Textbooks');
  const [condition,   setCondition]   = useState<Product['condition']>('Good');
  const [phone,       setPhone]       = useState('');
  const [description, setDescription] = useState('');
  const [image,       setImage]       = useState<string | null>(null);
  const [myListings,  setMyListings]  = useState<Product[]>([]);
  const [loadingMine, setLoadingMine] = useState(false);

  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [submitted,     setSubmitted]     = useState(false);

  useEffect(() => {
    if (!user) navigate('/login', { state: { from: '/sell', message: 'Sign in to sell items' } });
    if (user?.role === 'admin') {
      addToast('Admins cannot sell items. Redirecting to admin dashboard.', 'info');
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  if (user?.role === 'admin') return null;

  const fetchMyListings = async () => {
    if (!user) return;
    try {
      setLoadingMine(true);
      const { data } = await API.get('/products/mine');
      const incoming = Array.isArray(data) ? data : [];
      setMyListings(incoming);
    } catch {
      addToast('Failed to load your posted listings.', 'error');
    } finally {
      setLoadingMine(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, [user]);

  if (!user) return null;

  /* ── Handlers ── */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { addToast('Max file size is 5MB', 'error'); return; }
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !quantity || !description || !phone) { addToast('Please fill all required fields', 'error'); return; }
    if (parseFloat(price) <= 0) { addToast('Price must be greater than 0', 'error'); return; }
    if (parseInt(quantity, 10) <= 0) { addToast('Quantity must be at least 1', 'error'); return; }
    if (!image) { addToast('Please upload a product image', 'error'); return; }

    setIsSubmitting(true);
    try {
      await addProduct({
        id: `p-${Date.now()}`,
        title,
        description,
        price: parseFloat(price),
        category,
        images: image ? [image] : [],
        seller: user,
        condition,
        quantity: parseInt(quantity, 10),
        inStock: parseInt(quantity, 10) > 0,
        ratings: 0,
        reviews: [],
        createdAt: new Date().toISOString(),
      });

      setIsSubmitting(false);
      setSubmitted(true);
      await fetchMyListings();
      setTimeout(() => navigate('/shop'), 2000);
    } catch {
      setIsSubmitting(false);
    }
  };

  /* ── Success state ── */
  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: t.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center', maxWidth: 380 }}
        >
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
            style={{
              width: 80, height: 80, borderRadius: '50%',
              background: t.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <CheckCircle size={38} color={t.green} />
          </motion.div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.5rem', color: t.ink, marginBottom: 8 }}>
            Listing Submitted! 🎉
          </h2>
          <p style={{ color: t.muted, fontSize: '0.875rem', lineHeight: 1.7 }}>
            Your listing is pending admin approval. Redirecting to shop…
          </p>
        </motion.div>
      </div>
    );
  }

  const tips = [
    { emoji: '📸', text: 'Clear photos sell 3× faster than blurry ones' },
    { emoji: '💰', text: 'Price 20–30% below retail to move quickly' },
    { emoji: '✍️', text: 'Honest condition descriptions build trust' },
  ];

  return (
    <div style={{ background: t.cream, minHeight: '100vh', fontFamily: "'Instrument Sans', sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ background: t.green, padding: '36px 24px 52px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 80px)` }} />
        <div style={{ position: 'absolute', right: -40, top: -40, width: 300, height: 300, background: `radial-gradient(circle, rgba(244,162,38,0.15) 0%, transparent 70%)`, borderRadius: '50%' }} />
        <div style={{ maxWidth: 960, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem', fontWeight: 500, textDecoration: 'none', marginBottom: 16 }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
          >
            <ArrowLeft size={14} /> Back to Shop
          </Link>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(244,162,38,0.15)', color: t.amber, border: '1px solid rgba(244,162,38,0.3)', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: 999, padding: '4px 12px', marginBottom: 12 }}>
            🏪 Free to List
          </span>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#fff', lineHeight: 1.1, marginBottom: 6 }}>
            List an Item
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
            Reach 2,500+ verified Babcock students instantly
          </p>
        </div>
        <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, lineHeight: 0 }}>
          <svg viewBox="0 0 1440 40" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 40 }}>
            <path d="M0,40 C400,10 1040,38 1440,18 L1440,40 Z" fill={t.cream} />
          </svg>
        </div>
      </div>

      {/* ── Form ── */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 24px 80px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24, alignItems: 'start' }} className="sell-grid">

            {/* ── Left: Image upload ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div
                onClick={() => !image && fileInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
                style={{
                  background: '#fff', border: `2px dashed ${image ? t.greenMid : t.border}`,
                  borderRadius: 18, overflow: 'hidden',
                  aspectRatio: '1', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  cursor: image ? 'default' : 'pointer',
                  position: 'relative', transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => { if (!image) e.currentTarget.style.borderColor = t.greenMid; }}
                onMouseLeave={e => { if (!image) e.currentTarget.style.borderColor = t.border; }}
              >
                {image ? (
                  <>
                    <img src={image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }} />
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setImage(null); }}
                      style={{
                        position: 'absolute', top: 10, right: 10,
                        width: 28, height: 28, borderRadius: '50%',
                        background: '#DC2626', color: '#fff', border: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      }}
                    >
                      <X size={13} />
                    </button>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: 24 }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 14,
                      background: t.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 12px',
                    }}>
                      <Upload size={22} color={t.green} />
                    </div>
                    <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.9rem', color: t.ink, marginBottom: 4 }}>
                      Upload Photo
                    </p>
                    <p style={{ fontSize: '0.72rem', color: t.muted, lineHeight: 1.6 }}>
                      Drag & drop or click<br />Max 5MB · JPG, PNG, WEBP
                    </p>
                  </div>
                )}
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />

              {/* Tips card */}
              <div style={{
                background: t.greenPale, border: `1px solid ${t.greenLight}`,
                borderRadius: 14, padding: '14px 16px',
              }}>
                <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.75rem', color: t.green, marginBottom: 10, letterSpacing: '0.05em' }}>
                  💡 Tips for a fast sale
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {tips.map(tip => (
                    <div key={tip.text} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.85rem', flexShrink: 0, marginTop: 1 }}>{tip.emoji}</span>
                      <p style={{ fontSize: '0.75rem', color: t.greenMid, lineHeight: 1.5 }}>{tip.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right: Form fields ── */}
            <div style={{
              background: '#fff', border: `1.5px solid ${t.border}`,
              borderRadius: 20, padding: '28px 28px',
              display: 'flex', flexDirection: 'column', gap: 20,
            }}>

              <FormField label="Product Title" required>
                <FInput
                  type="text" value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Calculus Textbook 4th Edition, Electric Kettle"
                  required
                />
              </FormField>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <FormField label="Price (₦)" required>
                  <div style={{ position: 'relative' }}>
                    <DollarSign size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: t.muted }} />
                    <FInput
                      type="number" value={price} onChange={e => setPrice(e.target.value)}
                      placeholder="0" min="0" required
                      style={{ paddingLeft: 32 } as any}
                    />
                  </div>
                </FormField>

                <FormField label="Category" required>
                  <div style={{ position: 'relative' }}>
                    <Tag size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: t.muted, zIndex: 1 }} />
                    <FSelect value={category} onChange={e => setCategory(e.target.value)} style={{ paddingLeft: 32 } as any}>
                      {['Textbooks','Electronics','Clothing','Hostel Essentials','Food','Others'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </FSelect>
                  </div>
                </FormField>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <FormField label="Condition" required>
                  <FSelect value={condition as string} onChange={e => setCondition(e.target.value as any)}>
                    <option value="New">New (Unopened)</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Used – Good</option>
                    <option value="Fair">Used – Fair</option>
                  </FSelect>
                </FormField>

                <FormField label="WhatsApp / Phone" required hint="Buyers will contact you here">
                  <div style={{ position: 'relative' }}>
                    <Smartphone size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: t.muted }} />
                    <FInput
                      type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                      placeholder="0801 234 5678" required
                      style={{ paddingLeft: 32 } as any}
                    />
                  </div>
                </FormField>

                <FormField label="Quantity Available" required hint="How many units can buyers order?">
                  <FInput
                    type="number" value={quantity} onChange={e => setQuantity(e.target.value)}
                    placeholder="1" min="1" required
                  />
                </FormField>
              </div>

              <FormField label="Description" required hint="Mention size, defects, reason for selling — honesty closes deals faster">
                <div>
                  <FTextarea
                    value={description} onChange={e => setDescription(e.target.value)}
                    placeholder="Describe what you're selling. Be specific — good descriptions get faster responses."
                    rows={5} required
                  />
                </div>
              </FormField>

              {/* Divider */}
              <div style={{ borderTop: `1px solid ${t.border}` }} />

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button
                  type="button" onClick={() => navigate(-1)} disabled={isSubmitting}
                  style={{
                    padding: '12px 24px', borderRadius: 12,
                    border: `1.5px solid ${t.border}`, background: 'none',
                    fontFamily: "'Instrument Sans', sans-serif", fontWeight: 600,
                    fontSize: '0.875rem', color: t.muted, cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#DC2626'; e.currentTarget.style.color = '#DC2626'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.muted; }}
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={isSubmitting}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: isSubmitting ? t.greenMid : t.green,
                    color: '#fff', border: 'none', borderRadius: 12,
                    padding: '12px 28px', fontFamily: "'Syne', sans-serif",
                    fontWeight: 700, fontSize: '0.9rem',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 16px rgba(27,67,50,0.25)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { if (!isSubmitting) e.currentTarget.style.background = t.greenMid; }}
                  onMouseLeave={e => { if (!isSubmitting) e.currentTarget.style.background = t.green; }}
                >
                  {isSubmitting && <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} />}
                  {isSubmitting ? 'Posting…' : 'Post Listing 🚀'}
                </button>
              </div>
            </div>
          </div>
        </form>

        <div style={{ marginTop: 24, background: '#fff', border: `1.5px solid ${t.border}`, borderRadius: 20, padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.05rem', color: t.ink }}>
              Posted Listings
            </h2>
            <span style={{ fontSize: '0.78rem', color: t.muted }}>
              {myListings.length} total
            </span>
          </div>

          {loadingMine ? (
            <p style={{ fontSize: '0.82rem', color: t.muted }}>Loading your listings…</p>
          ) : myListings.length === 0 ? (
            <p style={{ fontSize: '0.82rem', color: t.muted }}>No listings posted yet.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 12 }}>
              {myListings.map((item: any) => {
                const qty = Number(item.quantity ?? (item.inStock ? 1 : 0));
                const isApproved = Boolean(item.isApproved);

                return (
                  <Link key={item._id || item.id} to={`/product/${item._id || item.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{ border: `1.5px solid ${t.border}`, borderRadius: 14, overflow: 'hidden', background: '#fff' }}>
                      <div style={{ aspectRatio: '1', background: t.cream, overflow: 'hidden' }}>
                        <img
                          src={item.images?.[0] || 'https://placehold.co/300x300/E8E2D9/1A1A1A?text=Item'}
                          alt={item.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div style={{ padding: '10px 12px' }}>
                        <p style={{ fontWeight: 600, fontSize: '0.8rem', color: t.ink, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', marginBottom: 4 }}>
                          {item.title}
                        </p>
                        <p style={{ fontSize: '0.72rem', color: t.muted, marginBottom: 8 }}>
                          {qty} available
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '0.85rem', color: t.green }}>
                            ₦{Number(item.price || 0).toLocaleString()}
                          </span>
                          <span style={{
                            fontSize: '0.62rem', fontWeight: 700,
                            background: isApproved ? t.greenLight : '#FEF3C7',
                            color: isApproved ? t.greenMid : '#92400E',
                            borderRadius: 5, padding: '2px 6px',
                          }}>
                            {isApproved ? 'Live' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .sell-grid { grid-template-columns: 1fr !important; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default SellItem;