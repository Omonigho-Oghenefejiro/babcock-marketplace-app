import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, Shield, Users, Package,
  TrendingUp, Eye, CheckCircle,
  XCircle, Clock, Search, ArrowUpRight, LayoutDashboard
} from 'lucide-react';
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

const Fade = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

type Tab = 'overview' | 'products' | 'users';

const AdminDashboard = () => {
  const { user, products, allUsers, updateProductStatus } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [search,    setSearch]    = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);

  /* ── Access guard ── */
  if (user?.role !== 'admin') {
    return (
      <div style={{
        minHeight: '100vh', background: t.green,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          style={{
            textAlign: 'center',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 24, padding: '56px 48px',
            backdropFilter: 'blur(12px)',
          }}
        >
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', bounce: 0.4 }}
            style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <AlertTriangle size={36} color="#F87171" />
          </motion.div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.8rem', color: '#fff', marginBottom: 8 }}>
            Access Denied
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
            Administrator privileges required to view this page.
          </p>
        </motion.div>
      </div>
    );
  }

  /* ── Derived stats ── */
  const totalUsers    = allUsers?.length ?? 0;
  const totalProducts = products?.length ?? 0;
  const getProductStatus = (product: any) => {
    if (product?.isApproved === false) return 'pending';
    if (product?.isActive === false) return 'removed';
    return 'active';
  };
  const activeListings = products?.filter((p: any) => getProductStatus(p) === 'active' && p.inStock)?.length ?? 0;
  const pendingProducts = products?.filter((p: any) => getProductStatus(p) === 'pending')?.length ?? 0;
  const totalRevenue  = '₦2.4M'; // placeholder

  const statCards = [
    { label: 'Total Users',      value: totalUsers,      change: '+12%', icon: '👥', accent: '#DBEAFE', accentDark: '#1E40AF' },
    { label: 'Total Products',   value: totalProducts,   change: '+8%',  icon: '📦', accent: t.greenLight, accentDark: t.green },
    { label: 'Active Listings',  value: activeListings,  change: '+5%',  icon: '🏪', accent: '#FEF3C7', accentDark: '#92400E' },
    { label: 'Total Revenue',    value: totalRevenue,    change: '+23%', icon: '💰', accent: '#EDE9FE', accentDark: '#7C3AED' },
  ];

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview',  label: 'Overview',  icon: LayoutDashboard },
    { id: 'products',  label: 'Products',  icon: Package          },
    { id: 'users',     label: 'Users',     icon: Users            },
  ];

  /* ── Product status chip ── */
  const StatusChip = ({ status }: { status: string }) => {
    const map: Record<string, { label: string; bg: string; color: string; icon: React.ElementType }> = {
      active:  { label: 'Active',   bg: t.greenLight, color: t.greenMid, icon: CheckCircle },
      pending: { label: 'Pending',  bg: '#FEF3C7',    color: '#92400E',  icon: Clock       },
      removed: { label: 'Removed',  bg: '#FFE4E6',    color: '#9F1239',  icon: XCircle     },
    };
    const cfg = map[status] ?? map.pending;
    const Icon = cfg.icon;
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        background: cfg.bg, color: cfg.color,
        fontSize: '0.68rem', fontWeight: 700, borderRadius: 6, padding: '3px 8px',
      }}>
        <Icon size={10} /> {cfg.label}
      </span>
    );
  };

  /* ── Filtered data ── */
  const filteredProducts = (products ?? []).filter((p: any) =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredUsers = (allUsers ?? []).filter((u: any) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (value?: string) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
  };

  const handleProductAction = async (status: 'approved' | 'rejected') => {
    if (!selectedProduct?.id || isUpdatingProduct) return;
    setIsUpdatingProduct(true);
    try {
      await updateProductStatus(selectedProduct.id, status);
      if (status === 'approved') {
        setSelectedProduct((prev: any) => prev ? { ...prev, isApproved: true, isActive: true } : prev);
      } else {
        setSelectedProduct(null);
      }
    } finally {
      setIsUpdatingProduct(false);
    }
  };

  return (
    <div style={{ background: t.cream, minHeight: '100vh', fontFamily: "'Instrument Sans', sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ background: t.green, padding: '44px 24px 60px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 80px)` }} />
        <div style={{ position: 'absolute', right: '-5%', top: '-20%', width: 420, height: 420, background: `radial-gradient(circle, rgba(244,162,38,0.15) 0%, transparent 70%)`, borderRadius: '50%' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <Fade>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(244,162,38,0.15)', color: t.amber,
              border: '1px solid rgba(244,162,38,0.3)',
              fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', borderRadius: 999, padding: '5px 14px', marginBottom: 14,
            }}>
              <Shield size={11} /> Administrator
            </span>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', color: '#fff', lineHeight: 1.1, marginBottom: 6 }}>
              Admin Dashboard
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
              Manage Babcock Marketplace — users, listings, and revenue
            </p>
          </Fade>
        </div>

        <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0, lineHeight: 0 }}>
          <svg viewBox="0 0 1440 40" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 40 }}>
            <path d="M0,40 C400,10 1040,38 1440,18 L1440,40 Z" fill={t.cream} />
          </svg>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 24px 80px' }}>

        {/* ── Stat cards ── */}
        <Fade delay={0.05}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
            {statCards.map((s, i) => (
              <div key={i} style={{
                background: '#fff', border: `1.5px solid ${t.border}`,
                borderRadius: 18, padding: '20px 20px',
                transition: 'all 0.2s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = s.accentDark; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.07)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: s.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                    {s.icon}
                  </div>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                    background: '#D1FAE5', color: '#065F46',
                    fontSize: '0.68rem', fontWeight: 700, borderRadius: 99, padding: '2px 8px',
                  }}>
                    <TrendingUp size={9} /> {s.change}
                  </span>
                </div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.7rem', color: t.ink, lineHeight: 1, marginBottom: 4 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '0.8rem', color: t.muted }}>{s.label}</div>
              </div>
            ))}
          </div>
        </Fade>

        {/* ── Tab bar ── */}
        <Fade delay={0.1}>
          <div style={{
            display: 'flex', gap: 4, background: '#fff',
            border: `1.5px solid ${t.border}`, borderRadius: 14,
            padding: 5, marginBottom: 24, width: 'fit-content',
          }}>
            {tabs.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSearch(''); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '9px 18px', borderRadius: 10, border: 'none',
                    background: active ? t.green : 'transparent',
                    color: active ? '#fff' : t.muted,
                    fontFamily: "'Instrument Sans', sans-serif",
                    fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                    transition: 'all 0.18s',
                    boxShadow: active ? '0 2px 8px rgba(27,67,50,0.25)' : 'none',
                  }}
                >
                  <Icon size={15} /> {tab.label}
                </button>
              );
            })}
          </div>
        </Fade>

        {/* ── Overview tab ── */}
        {activeTab === 'overview' && (
          <Fade delay={0.12}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="admin-grid">

              {/* Recent products */}
              <div style={{ background: '#fff', border: `1.5px solid ${t.border}`, borderRadius: 20, overflow: 'hidden' }}>
                <div style={{ padding: '18px 20px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '0.95rem', color: t.ink }}>Recent Listings</h3>
                  <button onClick={() => setActiveTab('products')} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: t.greenMid, fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}>
                    View all <ArrowUpRight size={12} />
                  </button>
                </div>
                <div>
                  {(products ?? []).slice(0, 5).map((p: any, i: number) => (
                    <div key={p.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px',
                      borderBottom: i < 4 ? `1px solid ${t.border}` : 'none',
                    }}>
                      <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', background: t.cream, flexShrink: 0, border: `1px solid ${t.border}` }}>
                        {p.images?.[0]
                          ? <img src={p.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>📦</div>
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: '0.82rem', color: t.ink, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{p.title}</p>
                        <p style={{ fontSize: '0.7rem', color: t.muted }}>{p.category}</p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '0.85rem', color: t.green }}>₦{p.price?.toLocaleString()}</p>
                        <StatusChip status={getProductStatus(p)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent users */}
              <div style={{ background: '#fff', border: `1.5px solid ${t.border}`, borderRadius: 20, overflow: 'hidden' }}>
                <div style={{ padding: '18px 20px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '0.95rem', color: t.ink }}>Recent Users</h3>
                  <button onClick={() => setActiveTab('users')} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: t.greenMid, fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}>
                    View all <ArrowUpRight size={12} />
                  </button>
                </div>
                <div>
                  {(allUsers ?? []).slice(0, 5).map((u: any, i: number) => (
                    <div key={u.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px',
                      borderBottom: i < 4 ? `1px solid ${t.border}` : 'none',
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%', background: t.green,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: "'Syne', sans-serif", fontWeight: 800,
                        fontSize: '0.85rem', color: '#fff', flexShrink: 0,
                      }}>
                        {u.name?.[0]?.toUpperCase() ?? 'U'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, fontSize: '0.82rem', color: t.ink, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{u.name}</p>
                        <p style={{ fontSize: '0.7rem', color: t.muted, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{u.email}</p>
                      </div>
                      <span style={{
                        background: u.role === 'admin' ? '#FEF3C7' : t.greenLight,
                        color: u.role === 'admin' ? '#92400E' : t.greenMid,
                        fontSize: '0.65rem', fontWeight: 700, borderRadius: 6, padding: '2px 8px', flexShrink: 0,
                      }}>
                        {u.role ?? 'student'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick actions */}
              <div style={{ background: '#fff', border: `1.5px solid ${t.border}`, borderRadius: 20, padding: '20px', gridColumn: '1 / -1' }}>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '0.95rem', color: t.ink, marginBottom: 16 }}>Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                  {[
                    { emoji: '👥', label: 'Manage Users',     desc: 'View & moderate accounts',    action: () => setActiveTab('users')    },
                    { emoji: '📦', label: 'Review Products',  desc: 'Approve or remove listings',  action: () => setActiveTab('products') },
                    { emoji: '📊', label: 'View Reports',     desc: 'Sales & traffic analytics',   action: () => navigate('/admin/reports') },
                    { emoji: '📥', label: 'Inventory',        desc: 'Import stock and monitor low', action: () => navigate('/admin/inventory') },
                  ].map(a => (
                    <button
                      key={a.label}
                      onClick={a.action}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 12,
                        padding: '14px 16px', borderRadius: 14,
                        border: `1.5px solid ${t.border}`, background: 'none',
                        textAlign: 'left', cursor: 'pointer', transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = t.greenMid; e.currentTarget.style.background = t.greenPale; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.background = 'none'; }}
                    >
                      <span style={{ fontSize: '1.2rem', flexShrink: 0, marginTop: 1 }}>{a.emoji}</span>
                      <div>
                        <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.85rem', color: t.ink, marginBottom: 3 }}>{a.label}</p>
                        <p style={{ fontSize: '0.72rem', color: t.muted }}>{a.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Fade>
        )}

        {/* ── Products tab ── */}
        {activeTab === 'products' && (
          <Fade delay={0.05}>
            <div style={{ background: '#fff', border: `1.5px solid ${t.border}`, borderRadius: 20, overflow: 'hidden' }}>
              {/* Toolbar */}
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: t.muted }} />
                  <input
                    type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
                    style={{
                      width: '100%', paddingLeft: 30, paddingRight: 12, paddingTop: 9, paddingBottom: 9,
                      border: `1.5px solid ${t.border}`, borderRadius: 10, background: t.cream,
                      fontFamily: "'Instrument Sans', sans-serif", fontSize: '0.82rem', color: t.ink, outline: 'none',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = t.greenMid; e.currentTarget.style.background = '#fff'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.background = t.cream; }}
                  />
                </div>
                <span style={{ fontSize: '0.78rem', color: t.muted, whiteSpace: 'nowrap' }}>
                  <strong style={{ color: t.ink }}>{filteredProducts.length}</strong> products
                </span>
                {pendingProducts > 0 && (
                  <span style={{ background: '#FEF3C7', color: '#92400E', fontSize: '0.72rem', fontWeight: 700, borderRadius: 99, padding: '4px 10px' }}>
                    ⏳ {pendingProducts} pending
                  </span>
                )}
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: t.cream, borderBottom: `1px solid ${t.border}` }}>
                      {['Product', 'Category', 'Price', 'Status', 'Action'].map(h => (
                        <th key={h} style={{
                          padding: '10px 16px', textAlign: 'left',
                          fontFamily: "'Syne', sans-serif", fontWeight: 700,
                          fontSize: '0.7rem', letterSpacing: '0.06em',
                          textTransform: 'uppercase', color: t.muted,
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.slice(0, 20).map((p: any) => (
                      <tr key={p.id} style={{ borderBottom: `1px solid ${t.border}`, transition: 'background 0.15s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = t.greenPale; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', background: t.cream, flexShrink: 0, border: `1px solid ${t.border}` }}>
                              {p.images?.[0]
                                ? <img src={p.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📦</div>
                              }
                            </div>
                            <span style={{ fontWeight: 600, fontSize: '0.82rem', color: t.ink, maxWidth: 180, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{p.title}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ background: t.greenLight, color: t.greenMid, fontSize: '0.68rem', fontWeight: 600, borderRadius: 6, padding: '2px 8px' }}>{p.category}</span>
                        </td>
                        <td style={{ padding: '12px 16px', fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: t.green }}>
                          ₦{p.price?.toLocaleString()}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <StatusChip status={getProductStatus(p)} />
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <button style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            background: 'none', border: `1px solid ${t.border}`,
                            borderRadius: 7, padding: '5px 10px',
                            fontFamily: "'Instrument Sans', sans-serif", fontWeight: 600,
                            fontSize: '0.72rem', color: t.muted, cursor: 'pointer', transition: 'all 0.15s',
                          }}
                            onClick={() => setSelectedProduct(p)}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = t.greenMid; e.currentTarget.style.color = t.greenMid; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.muted; }}
                          >
                            <Eye size={11} /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredProducts.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '48px 24px', color: t.muted }}>
                    No products match your search
                  </div>
                )}
              </div>
            </div>
          </Fade>
        )}

        {/* ── Users tab ── */}
        {activeTab === 'users' && (
          <Fade delay={0.05}>
            <div style={{ background: '#fff', border: `1.5px solid ${t.border}`, borderRadius: 20, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: t.muted }} />
                  <input
                    type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}
                    style={{
                      width: '100%', paddingLeft: 30, paddingRight: 12, paddingTop: 9, paddingBottom: 9,
                      border: `1.5px solid ${t.border}`, borderRadius: 10, background: t.cream,
                      fontFamily: "'Instrument Sans', sans-serif", fontSize: '0.82rem', color: t.ink, outline: 'none',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = t.greenMid; e.currentTarget.style.background = '#fff'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.background = t.cream; }}
                  />
                </div>
                <span style={{ fontSize: '0.78rem', color: t.muted, whiteSpace: 'nowrap' }}>
                  <strong style={{ color: t.ink }}>{filteredUsers.length}</strong> users
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: t.cream, borderBottom: `1px solid ${t.border}` }}>
                      {['User', 'Email', 'Role', 'Action'].map(h => (
                        <th key={h} style={{
                          padding: '10px 16px', textAlign: 'left',
                          fontFamily: "'Syne', sans-serif", fontWeight: 700,
                          fontSize: '0.7rem', letterSpacing: '0.06em',
                          textTransform: 'uppercase', color: t.muted,
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u: any) => (
                      <tr key={u.id} style={{ borderBottom: `1px solid ${t.border}`, transition: 'background 0.15s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = t.greenPale; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 34, height: 34, borderRadius: '50%', background: t.green, flexShrink: 0,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '0.8rem', color: '#fff',
                            }}>
                              {u.name?.[0]?.toUpperCase() ?? 'U'}
                            </div>
                            <span style={{ fontWeight: 600, fontSize: '0.82rem', color: t.ink }}>{u.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: t.muted }}>{u.email}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            background: u.role === 'admin' ? '#FEF3C7' : t.greenLight,
                            color: u.role === 'admin' ? '#92400E' : t.greenMid,
                            fontSize: '0.65rem', fontWeight: 700, borderRadius: 6, padding: '2px 8px',
                          }}>
                            {u.role ?? 'student'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <button style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            background: 'none', border: `1px solid ${t.border}`,
                            borderRadius: 7, padding: '5px 10px',
                            fontFamily: "'Instrument Sans', sans-serif", fontWeight: 600,
                            fontSize: '0.72rem', color: t.muted, cursor: 'pointer', transition: 'all 0.15s',
                          }}
                            onClick={() => setSelectedUser(u)}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = t.greenMid; e.currentTarget.style.color = t.greenMid; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.muted; }}
                          >
                            <Eye size={11} /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '48px 24px', color: t.muted }}>
                    No users match your search
                  </div>
                )}
              </div>
            </div>
          </Fade>
        )}
      </div>

      {selectedProduct && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 70,
          background: 'rgba(17,24,39,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
        }} onClick={() => !isUpdatingProduct && setSelectedProduct(null)}>
          <div style={{
            width: 'min(760px, 100%)', maxHeight: '90vh', overflowY: 'auto',
            background: '#fff', borderRadius: 16, border: `1px solid ${t.border}`, padding: 20,
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
              <div>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.1rem', color: t.ink, marginBottom: 4 }}>
                  {selectedProduct.title}
                </h3>
                <p style={{ color: t.muted, fontSize: '0.82rem' }}>{selectedProduct.category} • {selectedProduct.condition || 'Condition not set'}</p>
              </div>
              <button onClick={() => !isUpdatingProduct && setSelectedProduct(null)} style={{ background: 'none', border: `1px solid ${t.border}`, borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: t.muted }}>
                Close
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 16 }} className="admin-grid">
              <div style={{ width: '100%', height: 180, borderRadius: 12, overflow: 'hidden', border: `1px solid ${t.border}`, background: t.cream }}>
                {selectedProduct.images?.[0]
                  ? <img src={selectedProduct.images[0]} alt={selectedProduct.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📦</div>
                }
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                <p style={{ fontSize: '0.88rem', color: t.ink, lineHeight: 1.5 }}>{selectedProduct.description || 'No description provided.'}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ fontSize: '0.8rem', color: t.muted }}>Price: <strong style={{ color: t.green }}>₦{selectedProduct.price?.toLocaleString?.() || selectedProduct.price}</strong></div>
                  <div style={{ fontSize: '0.8rem', color: t.muted }}>Quantity: <strong style={{ color: t.ink }}>{Number(selectedProduct.quantity ?? 0)}</strong></div>
                  <div style={{ fontSize: '0.8rem', color: t.muted }}>In stock: <strong style={{ color: t.ink }}>{selectedProduct.inStock ? 'Yes' : 'No'}</strong></div>
                  <div style={{ fontSize: '0.8rem', color: t.muted }}>Created: <strong style={{ color: t.ink }}>{formatDate(selectedProduct.createdAt)}</strong></div>
                </div>
                <div style={{ fontSize: '0.8rem', color: t.muted }}>
                  Seller: <strong style={{ color: t.ink }}>{selectedProduct.seller?.name || selectedProduct.seller?.fullName || 'Unknown'}</strong>
                  {selectedProduct.seller?.email ? ` • ${selectedProduct.seller.email}` : ''}
                  {selectedProduct.seller?.phone ? ` • ${selectedProduct.seller.phone}` : ''}
                </div>
                <div><StatusChip status={getProductStatus(selectedProduct)} /></div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
              {getProductStatus(selectedProduct) === 'pending' && (
                <>
                  <button
                    disabled={isUpdatingProduct}
                    onClick={() => handleProductAction('rejected')}
                    style={{ border: '1px solid #FCA5A5', background: '#FEE2E2', color: '#991B1B', borderRadius: 10, padding: '8px 14px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Reject
                  </button>
                  <button
                    disabled={isUpdatingProduct}
                    onClick={() => handleProductAction('approved')}
                    style={{ border: '1px solid #86EFAC', background: t.green, color: '#fff', borderRadius: 10, padding: '8px 14px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Approve Listing
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedUser && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 70,
          background: 'rgba(17,24,39,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
        }} onClick={() => setSelectedUser(null)}>
          <div style={{
            width: 'min(620px, 100%)', maxHeight: '88vh', overflowY: 'auto',
            background: '#fff', borderRadius: 16, border: `1px solid ${t.border}`, padding: 20,
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.1rem', color: t.ink }}>User Profile</h3>
              <button onClick={() => setSelectedUser(null)} style={{ background: 'none', border: `1px solid ${t.border}`, borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: t.muted }}>Close</button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', overflow: 'hidden', border: `1px solid ${t.border}`, background: t.cream }}>
                {selectedUser.profileImage
                  ? <img src={selectedUser.profileImage} alt={selectedUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.green, color: '#fff', fontWeight: 800 }}>{selectedUser.name?.[0]?.toUpperCase() || 'U'}</div>
                }
              </div>
              <div>
                <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: t.ink }}>{selectedUser.name || selectedUser.fullName || 'User'}</p>
                <p style={{ fontSize: '0.78rem', color: t.muted }}>{selectedUser.email}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ fontSize: '0.82rem', color: t.muted }}>Username: <strong style={{ color: t.ink }}>{selectedUser.username || '—'}</strong></div>
              <div style={{ fontSize: '0.82rem', color: t.muted }}>Role: <strong style={{ color: t.ink }}>{selectedUser.role || 'user'}</strong></div>
              <div style={{ fontSize: '0.82rem', color: t.muted }}>Verified email: <strong style={{ color: t.ink }}>{selectedUser.isVerified ? 'Yes' : 'No'}</strong></div>
              <div style={{ fontSize: '0.82rem', color: t.muted }}>Campus role: <strong style={{ color: t.ink }}>{selectedUser.campusRole || 'student'}</strong></div>
              <div style={{ fontSize: '0.82rem', color: t.muted }}>Phone: <strong style={{ color: t.ink }}>{selectedUser.phone || '—'}</strong></div>
              <div style={{ fontSize: '0.82rem', color: t.muted }}>Joined: <strong style={{ color: t.ink }}>{formatDate(selectedUser.createdAt)}</strong></div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) { .admin-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
};

export default AdminDashboard;