import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Star } from 'lucide-react';
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
  error:      '#DC2626',
  errorBg:    '#FEF2F2',
};

/* ── Small input component ── */
const Field = ({
  label, type = 'text', value, onChange, placeholder, icon: Icon,
  rightEl, hint,
}: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder: string;
  icon: React.ElementType; rightEl?: React.ReactNode; hint?: string;
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{
        display: 'block', fontSize: '0.82rem', fontWeight: 600,
        color: t.ink, marginBottom: 6,
        fontFamily: "'Instrument Sans', sans-serif",
      }}>{label}</label>
      <div style={{
        position: 'relative',
        border: `1.5px solid ${focused ? t.greenMid : t.border}`,
        borderRadius: 12, background: focused ? '#fff' : t.cream,
        transition: 'all 0.2s', boxShadow: focused ? `0 0 0 3px ${t.greenLight}` : 'none',
      }}>
        <Icon size={16} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: focused ? t.greenMid : t.muted }} />
        <input
          type={type} value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%', padding: '12px 40px 12px 38px',
            background: 'transparent', border: 'none', outline: 'none',
            fontFamily: "'Instrument Sans', sans-serif", fontSize: '0.9rem', color: t.ink,
          }}
        />
        {rightEl && (
          <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
            {rightEl}
          </div>
        )}
      </div>
      {hint && <p style={{ fontSize: '0.72rem', color: t.muted, marginTop: 4 }}>{hint}</p>}
    </div>
  );
};

/* ════════════════════════
   LOGIN
════════════════════════ */
const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const { login } = useStore();
  const navigate  = useNavigate();
  const location  = useLocation();

  const from    = (location.state as any)?.from    || '/';
  const message = (location.state as any)?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch {
      setError('Incorrect email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { role: 'Student', email: 'student@babcock.edu.ng', emoji: '🎓' },
    { role: 'Seller',  email: 'seller@babcock.edu.ng',  emoji: '🏪' },
    { role: 'Admin',   email: 'admin@babcock.edu.ng',   emoji: '🔑' },
  ];

  const panelStats = [
    { value: '2,500+', label: 'Verified students',   emoji: '👥' },
    { value: '1,800+', label: 'Active listings',      emoji: '📦' },
    { value: '4,200+', label: 'Successful trades',    emoji: '🤝' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 4rem)', fontFamily: "'Instrument Sans', sans-serif" }}>

      {/* ════ LEFT — Form panel ════ */}
      <motion.div
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '48px 32px', background: '#fff', overflowY: 'auto',
        }}
      >
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 36 }}>
            <div style={{ background: t.green, width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: '#fff' }}>
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm-7 10.18V16l7 3.82 7-3.82v-2.82L12 17l-7-3.82z"/>
              </svg>
            </div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.1rem' }}>
              <span style={{ color: t.green }}>Babcock</span>
              <span style={{ color: t.ink }}> Market</span>
            </span>
          </Link>

          {/* Heading */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.9rem', color: t.ink, marginBottom: 6, lineHeight: 1.15 }}>
              Welcome back 👋
            </h1>
            <p style={{ fontSize: '0.9rem', color: t.muted }}>
              Sign in to your Babcock Market account
            </p>
          </div>

          {/* Message from redirect */}
          {message && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              style={{
                background: '#FEF3C7', border: '1px solid #FDE68A',
                borderRadius: 10, padding: '10px 14px',
                fontSize: '0.82rem', color: '#92400E', marginBottom: 20,
              }}
            >
              ⚠️ {message}
            </motion.div>
          )}

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              style={{
                background: t.errorBg, border: `1px solid #FECACA`,
                borderRadius: 10, padding: '10px 14px',
                fontSize: '0.82rem', color: t.error, marginBottom: 20,
              }}
            >
              ✕ {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Field
              label="Email address" type="email"
              value={email} onChange={setEmail}
              placeholder="you@babcock.edu.ng" icon={Mail}
            />

            <Field
              label="Password" type={showPw ? 'text' : 'password'}
              value={password} onChange={setPassword}
              placeholder="••••••••" icon={Lock}
              rightEl={
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.muted, padding: 0, display: 'flex' }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            {/* Remember + Forgot */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.82rem', color: t.muted }}>
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                  style={{ accentColor: t.green, width: 15, height: 15, cursor: 'pointer' }}
                />
                Remember me
              </label>
              <Link to="/forgot-password" style={{ fontSize: '0.82rem', color: t.greenMid, fontWeight: 600, textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: loading ? t.greenMid : t.green, color: '#fff',
                border: 'none', borderRadius: 12, padding: '14px',
                fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                boxShadow: '0 4px 16px rgba(27,67,50,0.25)',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = t.greenMid; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = t.green; }}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }}
                />
              ) : (
                <> Sign In <ArrowRight size={16} /> </>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div style={{ marginTop: 28 }}>
            <p style={{ fontSize: '0.75rem', color: t.muted, textAlign: 'center', marginBottom: 10 }}>
              — Demo accounts (click to fill) —
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              {demoAccounts.map(acc => (
                <button
                  key={acc.role}
                  onClick={() => setEmail(acc.email)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: t.cream, border: `1.5px solid ${t.border}`,
                    borderRadius: 99, padding: '6px 12px', cursor: 'pointer',
                    fontFamily: "'Instrument Sans', sans-serif", fontWeight: 600,
                    fontSize: '0.75rem', color: t.ink, transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = t.greenMid; e.currentTarget.style.background = t.greenPale; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.background = t.cream; }}
                >
                  {acc.emoji} {acc.role}
                </button>
              ))}
            </div>
          </div>

          {/* Sign up link */}
          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: t.muted, marginTop: 24 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: t.green, fontWeight: 700, textDecoration: 'none' }}>
              Join for free →
            </Link>
          </p>
        </div>
      </motion.div>

      {/* ════ RIGHT — Illustration panel ════ */}
      <motion.div
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '48%', background: t.green, position: 'relative',
          overflow: 'hidden', display: 'none',
        }}
        className="lg:block"
      >
        {/* Texture */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 80px)`,
        }} />
        {/* Glow */}
        <div style={{
          position: 'absolute', top: '-10%', right: '-10%', width: 480, height: 480,
          background: `radial-gradient(circle, rgba(244,162,38,0.2) 0%, transparent 65%)`,
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: '-15%', left: '-10%', width: 360, height: 360,
          background: `radial-gradient(circle, rgba(45,106,79,0.6) 0%, transparent 70%)`,
          borderRadius: '50%',
        }} />

        <div style={{
          position: 'relative', zIndex: 1, height: '100%',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: '48px 40px',
        }}>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(244,162,38,0.15)', color: t.amber,
              border: '1px solid rgba(244,162,38,0.3)',
              fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', borderRadius: 999, padding: '5px 14px', marginBottom: 28,
            }}
          >
            🎓 Babcock University • Est. 1959
          </motion.div>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 800,
              fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', color: '#fff',
              textAlign: 'center', lineHeight: 1.12, marginBottom: 12,
            }}
          >
            The campus market<br />
            <span style={{ color: t.amber }}>is waiting for you.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', textAlign: 'center', marginBottom: 40, maxWidth: '32ch' }}
          >
            Thousands of Babcock students buy and sell every day. Jump in.
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
            style={{ display: 'flex', gap: 16, marginBottom: 40, flexWrap: 'wrap', justifyContent: 'center' }}
          >
            {panelStats.map((s, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 14, padding: '16px 20px', textAlign: 'center',
                minWidth: 100, backdropFilter: 'blur(8px)',
              }}>
                <div style={{ fontSize: '1.1rem', marginBottom: 4 }}>{s.emoji}</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>{s.value}</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
            style={{
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 18, padding: '20px 24px', maxWidth: 360, backdropFilter: 'blur(8px)',
            }}
          >
            <div style={{ display: 'flex', gap: 3, marginBottom: 10 }}>
              {[...Array(5)].map((_, i) => <Star key={i} size={13} fill={t.amber} color={t.amber} />)}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.88rem', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 14 }}>
              "I cleared out my old textbooks in one afternoon and made ₦28,000. This is properly useful."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%', background: t.amber,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Syne', sans-serif", fontWeight: 800, color: t.ink, fontSize: '0.85rem',
              }}>A</div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.82rem', color: '#fff' }}>Adaeze N.</p>
                <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)' }}>400L, Business Admin</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;