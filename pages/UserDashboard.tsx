import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Package, Heart, ShoppingBag, MessageSquare,
  Tag, ArrowRight, Clock, CheckCircle, TrendingUp
} from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import API from '../services/api';

/* ── Tokens ── */
const t = {
  green:      '#1B4332',
  greenMid:   '#2D6A4F',
  greenLight: '#D8F3DC',
  greenPale:  '#F0FAF2',
  amber:      '#F4A226',
  amberLight: '#FEF9EE',
  cream:      '#FAF7F2',
  ink:        '#1A1A1A',
  muted:      '#6B7280',
  border:     '#E8E2D9',
};

/* ── Animated section ── */
const Fade = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

const UserDashboard = () => {
  const { user, orders = [], products, wishlist, updateUser } = useStore();
  const [myListings, setMyListings] = useState<any[]>([]);

  useEffect(() => {
    const fetchMyListings = async () => {
      if (!user || user.role === 'admin') {
        setMyListings([]);
        return;
      }

      try {
        const { data } = await API.get('/products/mine');
        const incoming = Array.isArray(data) ? data : [];
        setMyListings(incoming);
      } catch {
        setMyListings(products?.filter(p => p.seller?.id === user?.id) || []);
      }
    };

    fetchMyListings();
  }, [user, products]);

  const recentOrders   = orders?.slice(0, 5) || [];
  const totalSpent     = orders?.reduce((acc: number, o: any) => acc + Number(o.totalAmount ?? o.totalPrice ?? o.total ?? 0), 0) || 0;

  const stats = [
    {
      label: 'Total Orders',  value: orders.length,
      icon: '📦', accent: t.greenLight,  accentDark: t.green,
      link: '#orders',
    },
    {
      label: 'My Listings',   value: myListings.length,
      icon: '🏪', accent: '#FEF3C7',     accentDark: '#92400E',
      link: '/sell',
    },
    {
      label: 'Wishlist',      value: wishlist.length,
      icon: '❤️', accent: '#FFE4E6',     accentDark: '#9F1239',
      link: '/wishlist',
    },
    {
      label: 'Total Spent',   value: `₦${totalSpent.toLocaleString()}`,
      icon: '💰', accent: '#EDE9FE',     accentDark: '#7C3AED',
      link: '#orders',
    },
  ];

  const quickActions = [
    { label: 'Browse Shop',     icon: ShoppingBag,    to: '/shop',     desc: 'Find what you need'        },
    { label: 'Purchased Items', icon: Package,        to: '/purchased-items', desc: 'Rate bought products' },
    { label: 'Sell an Item',    icon: Tag,            to: '/sell',     desc: 'List in 2 minutes'         },
    { label: 'My Wishlist',     icon: Heart,          to: '/wishlist', desc: `${wishlist.length} saved`  },
    { label: 'Messages',        icon: MessageSquare,  to: '/messages', desc: 'Chat with sellers'         },
  ];

  const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    pending:   { label: 'Pending',    color: '#92400E', bg: '#FEF3C7', icon: Clock        },
    processing:{ label: 'Processing', color: '#1E40AF', bg: '#DBEAFE', icon: Package      },
    shipped:   { label: 'Shipped',    color: '#1D4ED8', bg: '#DBEAFE', icon: Package      },
    paid:      { label: 'Paid',       color: '#065F46', bg: '#D1FAE5', icon: CheckCircle  },
    delivered: { label: 'Delivered',  color: '#1E40AF', bg: '#DBEAFE', icon: Package      },
    completed: { label: 'Completed',  color: '#065F46', bg: '#D1FAE5', icon: CheckCircle  },
  };

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div style={{ background: t.cream, minHeight: '100vh', fontFamily: "'Instrument Sans', sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ background: t.green, padding: '44px 24px 60px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 80px)`,
        }} />
        <div style={{
          position: 'absolute', right: '-5%', top: '-20%', width: 420, height: 420,
          background: `radial-gradient(circle, rgba(244,162,38,0.18) 0%, transparent 70%)`,
          borderRadius: '50%', pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Fade>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
              {/* Avatar */}
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: t.amber, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Syne', sans-serif", fontWeight: 800,
                fontSize: '1.4rem', color: t.ink, flexShrink: 0,
                boxShadow: '0 0 0 3px rgba(244,162,38,0.3)',
                overflow: 'hidden',
              }}>
                {user?.profileImage
                  ? <img src={user.profileImage} alt={user.name || 'Profile'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : (user?.name?.[0]?.toUpperCase() ?? 'U')
                }
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: 3 }}>
                  Welcome back 👋
                </p>
                <h1 style={{
                  fontFamily: "'Syne', sans-serif", fontWeight: 800,
                  fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', color: '#fff', lineHeight: 1.1,
                }}>
                  {firstName}
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', marginTop: 4 }}>
                  {user?.email}
                </p>
              </div>

              {/* Verified badge */}
              <div style={{
                marginLeft: 'auto',
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 12, padding: '10px 16px',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80' }} />
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem', fontWeight: 500 }}>
                  Babcock Verified
                </span>
              </div>

              <Link
                to="/purchased-items"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 12,
                  padding: '10px 16px',
                  color: '#fff',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                Purchased Items
              </Link>

              <label style={{
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 12, padding: '10px 16px', color: 'rgba(255,255,255,0.8)',
                fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
              }}>
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                      const image = String(reader.result || '');
                      if (!image) return;
                      try {
                        await updateUser({ profileImage: image });
                      } catch {
                        // toast handled in context
                      }
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
            </div>
          </Fade>
        </div>

        {/* Wave */}
        <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, lineHeight: 0 }}>
          <svg viewBox="0 0 1440 40" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 40 }}>
            <path d="M0,40 C400,10 1040,38 1440,18 L1440,40 Z" fill={t.cream} />
          </svg>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* ── Stat cards ── */}
        <Fade delay={0.05}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
            {stats.map((s, i) => (
              <Link key={i} to={s.link} style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    background: '#fff', border: `1.5px solid ${t.border}`,
                    borderRadius: 18, padding: '20px 20px',
                    transition: 'all 0.2s ease', cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = s.accentDark;
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.07)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = t.border;
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: s.accent, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                    }}>
                      {s.icon}
                    </div>
                    <TrendingUp size={14} color={s.accentDark} style={{ opacity: 0.5 }} />
                  </div>
                  <div style={{
                    fontFamily: "'Syne', sans-serif", fontWeight: 800,
                    fontSize: '1.7rem', color: t.ink, lineHeight: 1, marginBottom: 4,
                  }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: t.muted }}>{s.label}</div>
                </div>
              </Link>
            ))}
          </div>
        </Fade>

        {/* ── Two column layout ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}
          className="dashboard-grid"
        >

          {/* LEFT — Orders */}
          <div>
            <Fade delay={0.1}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.15rem', color: t.ink }}>
                  Recent Orders
                </h2>
                {orders.length > 5 && (
                  <button style={{
                    fontSize: '0.78rem', color: t.greenMid, fontWeight: 600,
                    background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    View all <ArrowRight size={12} />
                  </button>
                )}
              </div>
            </Fade>

            <Fade delay={0.15}>
              {recentOrders.length === 0 ? (
                <div style={{
                  background: '#fff', border: `1.5px dashed ${t.border}`,
                  borderRadius: 18, padding: '48px 24px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🛍️</div>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1rem', color: t.ink, marginBottom: 6 }}>
                    No orders yet
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: t.muted, marginBottom: 20 }}>
                    Your completed purchases will appear here
                  </p>
                  <Link to="/shop" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: t.green, color: '#fff', textDecoration: 'none',
                    fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.85rem',
                    padding: '10px 22px', borderRadius: 10,
                  }}>
                    Start Shopping <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {recentOrders.map((order: any, i: number) => {
                    const status = statusConfig[order.status] ?? statusConfig.pending;
                    const StatusIcon = status.icon;
                    return (
                      <div key={i} style={{
                        background: '#fff', border: `1.5px solid ${t.border}`,
                        borderRadius: 16, padding: '16px 20px',
                        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                      }}>
                        {/* Order image */}
                        <div style={{
                          width: 52, height: 52, borderRadius: 10,
                          background: t.cream, border: `1px solid ${t.border}`,
                          overflow: 'hidden', flexShrink: 0,
                        }}>
                          {order.items?.[0]?.images?.[0] ? (
                            <img src={order.items[0].images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📦</div>
                          )}
                        </div>

                        {/* Order info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 600, fontSize: '0.875rem', color: t.ink, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            {order.items?.[0]?.title ?? 'Order'}
                            {order.items?.length > 1 && (
                              <span style={{ color: t.muted, fontWeight: 400 }}> +{order.items.length - 1} more</span>
                            )}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: t.muted, marginTop: 3 }}>
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                          </p>
                        </div>

                        {/* Status chip */}
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 5,
                          background: status.bg, color: status.color,
                          fontSize: '0.7rem', fontWeight: 700,
                          borderRadius: 8, padding: '5px 10px', flexShrink: 0,
                        }}>
                          <StatusIcon size={11} /> {status.label}
                        </div>

                        {/* Amount */}
                        <p style={{
                          fontFamily: "'Syne', sans-serif", fontWeight: 800,
                          fontSize: '0.97rem', color: t.green, flexShrink: 0,
                        }}>
                          ₦{Number(order.totalAmount ?? order.totalPrice ?? order.total ?? 0).toLocaleString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </Fade>

            {/* My Listings */}
            {myListings.length > 0 && (
              <Fade delay={0.2}>
                <div style={{ marginTop: 32 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.15rem', color: t.ink }}>
                      My Listings
                    </h2>
                    <Link to="/sell" style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      fontSize: '0.78rem', color: t.greenMid, fontWeight: 600, textDecoration: 'none',
                    }}>
                      + Add new
                    </Link>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                    {myListings.slice(0, 4).map((p) => (
                      <Link key={p.id} to={`/product/${p.id}`} style={{ textDecoration: 'none' }}>
                        <div style={{
                          background: '#fff', border: `1.5px solid ${t.border}`,
                          borderRadius: 14, overflow: 'hidden', transition: 'all 0.2s',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = t.greenMid; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                          <div style={{ aspectRatio: '1', background: t.cream, overflow: 'hidden' }}>
                            <img
                              src={p.images?.[0] || 'https://placehold.co/300x300/E8E2D9/1A1A1A?text=Item'}
                              alt={p.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                          <div style={{ padding: '10px 12px' }}>
                            <p style={{ fontWeight: 600, fontSize: '0.8rem', color: t.ink, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', marginBottom: 3 }}>
                              {p.title}
                            </p>
                            <p style={{ fontSize: '0.68rem', color: t.muted, marginBottom: 5 }}>
                              {Number(p.quantity ?? (p.inStock ? 1 : 0))} available
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '0.85rem', color: t.green }}>
                                ₦{p.price.toLocaleString()}
                              </span>
                              <span style={{
                                fontSize: '0.62rem', fontWeight: 700,
                                background: p.inStock ? t.greenLight : '#FEE2E2',
                                color: p.inStock ? t.greenMid : '#DC2626',
                                borderRadius: 5, padding: '2px 6px',
                              }}>
                                {p.inStock ? 'Active' : 'Sold'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </Fade>
            )}
          </div>

          {/* RIGHT — Quick actions */}
          <div style={{ position: 'sticky', top: 104 }}>
            <Fade delay={0.2}>
              <div style={{
                background: '#fff', border: `1.5px solid ${t.border}`,
                borderRadius: 20, overflow: 'hidden', marginBottom: 16,
              }}>
                <div style={{ background: t.green, padding: '16px 20px' }}>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>
                    Quick Actions
                  </h3>
                </div>
                <div style={{ padding: '8px' }}>
                  {quickActions.map((a) => {
                    const Icon = a.icon;
                    return (
                      <Link key={a.to} to={a.to} style={{ textDecoration: 'none', display: 'block' }}>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px 14px', borderRadius: 12, transition: 'background 0.15s',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.background = t.greenPale; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                        >
                          <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: t.greenLight, display: 'flex',
                            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
                            <Icon size={16} color={t.green} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 600, fontSize: '0.85rem', color: t.ink }}>{a.label}</p>
                            <p style={{ fontSize: '0.72rem', color: t.muted }}>{a.desc}</p>
                          </div>
                          <ArrowRight size={14} color={t.muted} />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Account info card */}
              <div style={{
                background: t.green, borderRadius: 18, padding: '20px',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', right: -20, bottom: -20, width: 120, height: 120,
                  background: 'rgba(244,162,38,0.15)', borderRadius: '50%',
                }} />
                <p style={{
                  fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: t.amber, marginBottom: 12,
                }}>
                  Account
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { label: 'Name',  value: user?.name ?? '—'  },
                    { label: 'Email', value: user?.email ?? '—' },
                    { label: 'Role',  value: user?.role ?? 'student' },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>{row.label}</span>
                      <span style={{
                        fontSize: '0.75rem', fontWeight: 600, color: '#fff',
                        textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%',
                      }}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Fade>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .dashboard-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default UserDashboard;