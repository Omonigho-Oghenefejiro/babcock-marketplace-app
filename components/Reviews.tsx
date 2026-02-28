import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Send, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';

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

const ratingLabel: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Great',
  5: 'Excellent!',
};

interface ReviewsProps {
  productId: string;
  sellerId?: string;
  canWriteReview?: boolean;
}

const Reviews: React.FC<ReviewsProps> = ({ productId, sellerId, canWriteReview = false }) => {
  const { user, reviews, addReview } = useStore();
  const [rating,      setRating]      = useState(5);
  const [comment,     setComment]     = useState('');
  const [hovered,     setHovered]     = useState<number | null>(null);
  const [focused,     setFocused]     = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [submitted,   setSubmitted]   = useState(false);

  const productReviews = reviews.filter(r => r.productId === productId);
  const isListingOwner = Boolean(user?.id && sellerId && String(user.id) === String(sellerId));

  /* ── Rating distribution ── */
  const dist = [5, 4, 3, 2, 1].map(n => ({
    star: n,
    count: productReviews.filter(r => r.rating === n).length,
    pct: productReviews.length
      ? Math.round((productReviews.filter(r => r.rating === n).length / productReviews.length) * 100)
      : 0,
  }));

  const avgRating = productReviews.length
    ? productReviews.reduce((acc, r) => acc + r.rating, 0) / productReviews.length
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 600)); // small delay for UX
    try {
      await addReview(productId, rating, comment);
      setComment('');
      setRating(5);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const displayStar = hovered ?? rating;

  return (
    <div style={{ fontFamily: "'Instrument Sans', sans-serif" }}>

      {/* ── Section heading ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.25rem', color: t.ink }}>
          Customer Reviews
        </div>
        {productReviews.length > 0 && (
          <span style={{
            background: t.greenLight, color: t.greenMid,
            fontSize: '0.72rem', fontWeight: 700,
            borderRadius: 99, padding: '3px 10px',
          }}>
            {productReviews.length} review{productReviews.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }} className="reviews-grid">

        {/* ── LEFT: Review list + summary ── */}
        <div>
          {/* Rating summary */}
          {productReviews.length > 0 && (
            <div style={{
              background: t.cream, border: `1.5px solid ${t.border}`,
              borderRadius: 16, padding: '20px 20px', marginBottom: 24,
              display: 'flex', gap: 24, alignItems: 'center',
            }}>
              {/* Big number */}
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '3rem', color: t.ink, lineHeight: 1 }}>
                  {avgRating.toFixed(1)}
                </div>
                <div style={{ display: 'flex', gap: 2, justifyContent: 'center', marginTop: 6 }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={13} fill={s <= Math.round(avgRating) ? t.amber : 'none'} color={s <= Math.round(avgRating) ? t.amber : '#D1D5DB'} />
                  ))}
                </div>
                <div style={{ fontSize: '0.68rem', color: t.muted, marginTop: 4 }}>{productReviews.length} ratings</div>
              </div>

              {/* Bar chart */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
                {dist.map(d => (
                  <div key={d.star} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0, width: 28 }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: t.muted }}>{d.star}</span>
                      <Star size={10} fill={t.amber} color={t.amber} />
                    </div>
                    <div style={{ flex: 1, height: 6, background: '#E5E7EB', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', background: t.amber, borderRadius: 99,
                        width: `${d.pct}%`, transition: 'width 0.6s ease',
                      }} />
                    </div>
                    <span style={{ fontSize: '0.68rem', color: t.muted, flexShrink: 0, width: 28, textAlign: 'right' }}>{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews list */}
          {productReviews.length === 0 ? (
            <div style={{
              background: t.cream, border: `1.5px dashed ${t.border}`,
              borderRadius: 16, padding: '40px 24px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: 10 }}>💬</div>
              <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.95rem', color: t.ink, marginBottom: 6 }}>
                No reviews yet
              </p>
              <p style={{ fontSize: '0.8rem', color: t.muted }}>
                Be the first to share your thoughts on this item
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <AnimatePresence>
                {productReviews.map((review, i) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.3 }}
                    style={{
                      padding: '18px 0',
                      borderBottom: i < productReviews.length - 1 ? `1px solid ${t.border}` : 'none',
                    }}
                  >
                    {/* Reviewer header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: t.green, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: "'Syne', sans-serif", fontWeight: 800,
                        fontSize: '0.85rem', color: '#fff', flexShrink: 0,
                      }}>
                        {review.userName?.[0]?.toUpperCase() ?? 'S'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: t.ink }}>
                            {review.userName}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: t.muted }}>{review.date}</span>
                        </div>
                        {/* Stars */}
                        <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} size={12} fill={s <= review.rating ? t.amber : 'none'} color={s <= review.rating ? t.amber : '#E5E7EB'} />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Comment */}
                    <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.7, marginLeft: 46 }}>
                      {review.comment}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ── RIGHT: Write a review ── */}
        <div>
          <div style={{
            background: '#fff', border: `1.5px solid ${t.border}`,
            borderRadius: 20, overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{ background: t.green, padding: '16px 20px' }}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>
                Write a Review
              </h3>
            </div>

            <div style={{ padding: '20px 20px' }}>
              {user ? (
                isListingOwner ? (
                  <div style={{ textAlign: 'center', padding: '24px 16px' }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 14,
                      background: t.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 14px',
                    }}>
                      <Lock size={22} color={t.green} />
                    </div>
                    <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.95rem', color: t.ink, marginBottom: 6 }}>
                      You can’t review your own listing
                    </p>
                    <p style={{ fontSize: '0.8rem', color: t.muted, lineHeight: 1.6 }}>
                      Buyers can still leave ratings and reviews on this product.
                    </p>
                  </div>
                ) : !canWriteReview ? (
                  <div style={{ textAlign: 'center', padding: '24px 16px' }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 14,
                      background: t.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 14px',
                    }}>
                      <Lock size={22} color={t.green} />
                    </div>
                    <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.95rem', color: t.ink, marginBottom: 6 }}>
                      Purchase required to review
                    </p>
                    <p style={{ fontSize: '0.8rem', color: t.muted, lineHeight: 1.6 }}>
                      Only users who purchased this product can write a review.
                    </p>
                  </div>
                ) : (
                <>
                  <AnimatePresence>
                    {submitted && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        style={{
                          background: t.greenLight, border: `1px solid ${t.greenMid}20`,
                          borderRadius: 10, padding: '10px 14px',
                          display: 'flex', alignItems: 'center', gap: 8,
                          fontSize: '0.82rem', color: t.greenMid, fontWeight: 600,
                          marginBottom: 16,
                        }}
                      >
                        ✓ Review submitted — thank you!
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                    {/* Star picker */}
                    <div>
                      <label style={{ fontWeight: 600, fontSize: '0.82rem', color: t.ink, display: 'block', marginBottom: 8 }}>
                        Your Rating
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHovered(star)}
                            onMouseLeave={() => setHovered(null)}
                            onClick={() => setRating(star)}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                              transition: 'transform 0.15s',
                              transform: star <= displayStar ? 'scale(1.15)' : 'scale(1)',
                            }}
                          >
                            <Star
                              size={28}
                              fill={star <= displayStar ? t.amber : 'none'}
                              color={star <= displayStar ? t.amber : '#D1D5DB'}
                              style={{ transition: 'all 0.15s' }}
                            />
                          </button>
                        ))}
                        {/* Label */}
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={displayStar}
                            initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                            style={{ fontSize: '0.82rem', fontWeight: 600, color: t.amber, marginLeft: 6 }}
                          >
                            {ratingLabel[displayStar]}
                          </motion.span>
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Comment */}
                    <div>
                      <label style={{ fontWeight: 600, fontSize: '0.82rem', color: t.ink, display: 'block', marginBottom: 6 }}>
                        Your Review
                      </label>
                      <div style={{
                        border: `1.5px solid ${focused ? t.greenMid : t.border}`,
                        borderRadius: 12,
                        background: focused ? '#fff' : t.cream,
                        transition: 'all 0.2s',
                        boxShadow: focused ? `0 0 0 3px ${t.greenLight}` : 'none',
                        overflow: 'hidden',
                      }}>
                        <textarea
                          value={comment}
                          onChange={e => setComment(e.target.value)}
                          onFocus={() => setFocused(true)}
                          onBlur={() => setFocused(false)}
                          rows={4}
                          placeholder="What did you think? Was it as described? Would you recommend it?"
                          required
                          style={{
                            width: '100%', padding: '12px 14px',
                            background: 'transparent', border: 'none',
                            fontFamily: "'Instrument Sans', sans-serif",
                            fontSize: '0.875rem', color: t.ink,
                            resize: 'vertical', outline: 'none',
                            minHeight: 100,
                          }}
                        />
                        <div style={{
                          padding: '6px 12px',
                          borderTop: `1px solid ${focused ? t.greenLight : t.border}`,
                          display: 'flex', justifyContent: 'flex-end',
                        }}>
                          <span style={{ fontSize: '0.68rem', color: comment.length > 20 ? t.greenMid : t.muted }}>
                            {comment.length} chars
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={submitting || !comment.trim()}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        background: submitting || !comment.trim() ? '#E5E7EB' : t.green,
                        color: submitting || !comment.trim() ? t.muted : '#fff',
                        border: 'none', borderRadius: 12, padding: '13px',
                        fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.9rem',
                        cursor: submitting || !comment.trim() ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: !submitting && comment.trim() ? '0 4px 14px rgba(27,67,50,0.2)' : 'none',
                      }}
                      onMouseEnter={e => { if (!submitting && comment.trim()) e.currentTarget.style.background = t.greenMid; }}
                      onMouseLeave={e => { if (!submitting && comment.trim()) e.currentTarget.style.background = t.green; }}
                    >
                      {submitting ? (
                        <motion.div
                          animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                          style={{ width: 16, height: 16, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }}
                        />
                      ) : (
                        <><Send size={15} /> Submit Review</>
                      )}
                    </button>
                  </form>
                </>
                )
              ) : (
                /* Not signed in */
                <div style={{ textAlign: 'center', padding: '24px 16px' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: t.greenLight, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 14px',
                  }}>
                    <Lock size={22} color={t.green} />
                  </div>
                  <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.95rem', color: t.ink, marginBottom: 6 }}>
                    Sign in to leave a review
                  </p>
                  <p style={{ fontSize: '0.8rem', color: t.muted, marginBottom: 18, lineHeight: 1.6 }}>
                    Only verified Babcock students can review products
                  </p>
                  <Link to="/login" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: t.green, color: '#fff', textDecoration: 'none',
                    fontFamily: "'Syne', sans-serif", fontWeight: 700,
                    fontSize: '0.875rem', padding: '11px 24px', borderRadius: 10,
                  }}>
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .reviews-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Reviews;