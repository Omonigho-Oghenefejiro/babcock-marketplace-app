import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User, Phone } from 'lucide-react';
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

/* ── Field component ── */
const Field = ({
  label, type = 'text', value, onChange, placeholder, icon: Icon,
  rightEl, hint, required = false,
}: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder: string;
  icon: React.ElementType; rightEl?: React.ReactNode;
  hint?: string; required?: boolean;
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{
        display: 'flex', alignItems: 'center', gap: 4,
        fontSize: '0.82rem', fontWeight: 600, color: t.ink, marginBottom: 6,
        fontFamily: "'Instrument Sans', sans-serif",
      }}>
        {label}
        {!required && <span style={{ fontSize: '0.7rem', color: t.muted, fontWeight: 400 }}>(optional)</span>}
      </label>
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

/* ── Password strength indicator ── */
const PasswordStrength = ({ password }: { password: string }) => {
  const checks = [
    { label: '8+ characters', pass: password.length >= 8 },
    { label: 'Uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'Number', pass: /\d/.test(password) },
  ];
  if (!password) return null;
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
      {checks.map(c => (
        <span key={c.label} style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: '0.68rem', fontWeight: 600,
          color: c.pass ? t.greenMid : t.muted,
        }}>
          <span style={{ fontSize: '0.75rem' }}>{c.pass ? '✓' : '○'}</span>
          {c.label}
        </span>
      ))}
    </div>
  );
};

/* ════════════════════════
   REGISTER
════════════════════════ */
const Register = () => {
  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [phone, setPhone]           = useState('');
  const [password, setPassword]     = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  const [showPw, setShowPw]         = useState(false);
  const [agreed, setAgreed]         = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const { register } = useStore();
  const navigate  = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim())                           return setError('Please enter your full name.');
    if (!email.includes('@babcock.edu.ng'))     return setError('Please use your @babcock.edu.ng email address.');
    if (password.length < 6)                   return setError('Password must be at least 6 characters.');
    if (password !== confirmPw)                return setError('Passwords do not match.');
    if (!agreed)                               return setError('Please accept the terms to continue.');

    setLoading(true);
    try {
      await register(name, email, password, phone);
      navigate('/', { replace: true });
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { emoji: '📚', text: 'Buy textbooks at half the bookshop price' },
    { emoji: '💰', text: 'Sell items to 2,500+ active students' },
    { emoji: '🔒', text: 'Verified campus-only community' },
    { emoji: '⚡', text: 'Fast product discovery and secure checkout' },
  ];

  const steps = [
    { num: '01', title: 'Create account', desc: 'Takes under 2 minutes' },
    { num: '02', title: 'Verify email',   desc: 'Babcock address required' },
    { num: '03', title: 'Start trading',  desc: 'Buy or list immediately' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 4rem)', fontFamily: "'Instrument Sans', sans-serif" }}>

      {/* ════ LEFT — Illustration panel ════ */}
      <motion.div
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width: '48%', background: t.green,
          position: 'relative', overflow: 'hidden',
          display: 'none', flexDirection: 'column',
          justifyContent: 'center', padding: '64px 48px',
        }}
        className="lg:flex"
      >
        {/* Texture + glows */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 80px)`,
        }} />
        <div style={{
          position: 'absolute', top: '-5%', left: '-5%', width: 400, height: 400,
          background: `radial-gradient(circle, rgba(244,162,38,0.15) 0%, transparent 70%)`,
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', right: '-5%', width: 320, height: 320,
          background: `radial-gradient(circle, rgba(45,106,79,0.6) 0%, transparent 70%)`,
          borderRadius: '50%',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(244,162,38,0.15)', color: t.amber,
              border: '1px solid rgba(244,162,38,0.3)',
              fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', borderRadius: 999, padding: '5px 14px', marginBottom: 28,
            }}
          >
            ✦ Join 2,500+ Students
          </motion.div>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 800,
              fontSize: 'clamp(1.8rem, 2.8vw, 2.5rem)', color: '#fff',
              lineHeight: 1.12, marginBottom: 12,
            }}
          >
            Start trading<br />
            <span style={{ color: t.amber }}>on campus today.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: 36, maxWidth: '36ch' }}
          >
            The only marketplace built for Babcock students — safe, fast, and free to use.
          </motion.p>

          {/* Benefits list */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 44 }}
          >
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.07 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12, padding: '12px 16px', backdropFilter: 'blur(8px)',
                }}
              >
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{b.emoji}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>{b.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* How it works */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
          >
            <p style={{
              fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 16,
            }}>How it works</p>
            <div style={{ display: 'flex', gap: 0 }}>
              {steps.map((step, i) => (
                <div key={i} style={{ flex: 1, position: 'relative' }}>
                  {i < steps.length - 1 && (
                    <div style={{
                      position: 'absolute', top: 14, left: '60%', right: 0,
                      height: 1, background: 'rgba(255,255,255,0.12)',
                    }} />
                  )}
                  <div style={{ marginBottom: 8 }}>
                    <span style={{
                      fontFamily: "'Syne', sans-serif", fontWeight: 800,
                      fontSize: '0.75rem', color: t.amber,
                    }}>{step.num}</span>
                  </div>
                  <p style={{ fontWeight: 600, fontSize: '0.8rem', color: '#fff', marginBottom: 3 }}>{step.title}</p>
                  <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ════ RIGHT — Form panel ════ */}
      <motion.div
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '40px 32px', background: '#fff', overflowY: 'auto',
        }}
      >
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 28 }}>
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
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.9rem', color: t.ink, marginBottom: 6, lineHeight: 1.15 }}>
              Create your account 🎉
            </h1>
            <p style={{ fontSize: '0.88rem', color: t.muted }}>
              Babcock email required — takes 2 minutes
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              style={{
                background: t.errorBg, border: `1px solid #FECACA`,
                borderRadius: 10, padding: '10px 14px',
                fontSize: '0.82rem', color: t.error, marginBottom: 18,
              }}
            >
              ✕ {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <Field
              label="Full Name" value={name} onChange={setName}
              placeholder="Chukwuemeka Obi" icon={User} required
            />

            <Field
              label="Babcock Email" type="email" value={email} onChange={setEmail}
              placeholder="you@babcock.edu.ng" icon={Mail}
              hint="Must end with @babcock.edu.ng" required
            />

            <Field
              label="Phone Number" type="tel" value={phone} onChange={setPhone}
              placeholder="0801 234 5678" icon={Phone}
            />

            <div>
              <Field
                label="Password" type={showPw ? 'text' : 'password'}
                value={password} onChange={setPassword}
                placeholder="Min. 6 characters" icon={Lock}
                rightEl={
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.muted, padding: 0, display: 'flex' }}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                required
              />
              <PasswordStrength password={password} />
            </div>

            <Field
              label="Confirm Password" type={showPw ? 'text' : 'password'}
              value={confirmPw} onChange={setConfirmPw}
              placeholder="Repeat password" icon={Lock}
              rightEl={
                confirmPw.length > 0 ? (
                  <span style={{ fontSize: '0.75rem', color: confirmPw === password ? t.greenMid : t.error }}>
                    {confirmPw === password ? '✓ Match' : '✗ No match'}
                  </span>
                ) : undefined
              }
              required
            />

            {/* Terms */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox" checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                style={{ accentColor: t.green, width: 15, height: 15, marginTop: 2, flexShrink: 0, cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.8rem', color: t.muted, lineHeight: 1.6 }}>
                I agree to the{' '}
                <Link to="/terms" style={{ color: t.green, fontWeight: 600, textDecoration: 'none' }}>Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" style={{ color: t.green, fontWeight: 600, textDecoration: 'none' }}>Privacy Policy</Link>
              </span>
            </label>

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
                marginTop: 4,
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
                <> Create Account <ArrowRight size={16} /> </>
              )}
            </button>
          </form>

          {/* Features row */}
          <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['🔒 Secure', '🎓 Verified only', '⚡ Free forever'].map(f => (
              <span key={f} style={{
                fontSize: '0.72rem', color: t.muted, fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 3,
              }}>{f}</span>
            ))}
          </div>

          {/* Sign in link */}
          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: t.muted, marginTop: 20 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: t.green, fontWeight: 700, textDecoration: 'none' }}>
              Sign in →
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;