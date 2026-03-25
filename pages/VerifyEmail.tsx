import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

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

type Status = 'success' | 'expired' | 'invalid' | 'failed' | 'already' | null;

const VerifyEmail = () => {
  const location = useLocation();
  const [status, setStatus] = useState<Status>(null);

  useEffect(() => {
    // Works with both HashRouter (params after #) and regular router
    const hash = window.location.hash;
    const queryIndex = hash.indexOf('?');
    const search = queryIndex !== -1 ? hash.substring(queryIndex) : location.search;
    const params = new URLSearchParams(search);
    const verify = params.get('verify') as Status;
    setStatus(verify || 'invalid');
  }, [location]);

  const config: Record<NonNullable<Status>, {
    emoji: string;
    title: string;
    message: string;
    cta: string;
    ctaTo: string;
    isError?: boolean;
  }> = {
    success: {
      emoji: '✅',
      title: 'Email verified!',
      message: 'Your Babcock Marketplace account is now fully verified. You can sign in and start buying or selling.',
      cta: 'Sign in now',
      ctaTo: '/login',
    },
    already: {
      emoji: '✅',
      title: 'Already verified',
      message: 'Your account has already been verified. Sign in to access the marketplace.',
      cta: 'Sign in',
      ctaTo: '/login',
    },
    expired: {
      emoji: '⏰',
      title: 'Link expired',
      message: 'This verification link has expired (links are valid for 10 minutes). Please request a new one.',
      cta: 'Request new link',
      ctaTo: '/register',
      isError: true,
    },
    invalid: {
      emoji: '❌',
      title: 'Invalid link',
      message: 'This verification link is invalid or has already been used. Please register or request a new verification link.',
      cta: 'Go to register',
      ctaTo: '/register',
      isError: true,
    },
    failed: {
      emoji: '❌',
      title: 'Verification failed',
      message: 'Something went wrong while verifying your email. Please try again or contact support.',
      cta: 'Try again',
      ctaTo: '/register',
      isError: true,
    },
  };

  const current = status ? config[status] : null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: 'calc(100vh - 4rem)',
      background: t.cream, fontFamily: "'Instrument Sans', sans-serif",
      padding: '24px',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: '#fff', borderRadius: 24,
          padding: 'clamp(32px, 6vw, 52px)',
          maxWidth: 440, width: '100%',
          border: `1.5px solid ${current?.isError ? '#FECACA' : t.greenLight}`,
          boxShadow: '0 8px 40px rgba(27,67,50,0.08)',
          textAlign: 'center',
        }}
      >
        {!current ? (
          <div style={{ color: t.muted, fontSize: '0.9rem' }}>Checking verification status...</div>
        ) : (
          <>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: current.isError ? t.errorBg : t.greenPale,
              border: `2px solid ${current.isError ? '#FECACA' : t.greenLight}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', margin: '0 auto 24px',
            }}>
              {current.emoji}
            </div>

            <h1 style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 800,
              fontSize: '1.6rem', color: t.ink, marginBottom: 12,
            }}>
              {current.title}
            </h1>

            <p style={{
              fontSize: '0.9rem', color: t.muted,
              lineHeight: 1.75, marginBottom: 32,
            }}>
              {current.message}
            </p>

            <Link
              to={current.ctaTo}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '100%', background: current.isError ? t.error : t.green,
                color: '#fff', border: 'none', borderRadius: 12, padding: '13px',
                fontFamily: "'Syne', sans-serif", fontWeight: 700,
                fontSize: '0.95rem', textDecoration: 'none',
                boxShadow: `0 4px 16px ${current.isError ? 'rgba(220,38,38,0.2)' : 'rgba(27,67,50,0.2)'}`,
                transition: 'opacity 0.2s',
              }}
            >
              {current.cta} →
            </Link>

            {status === 'success' && (
              <p style={{ fontSize: '0.8rem', color: t.muted, marginTop: 20 }}>
                Welcome to the Babcock Campus Marketplace 🎉
              </p>
            )}

            {current.isError && (
              <p style={{ fontSize: '0.78rem', color: t.muted, marginTop: 20, lineHeight: 1.6 }}>
                Need help?{' '}
                <Link to="/register" style={{ color: t.green, fontWeight: 600, textDecoration: 'none' }}>
                  Register again
                </Link>
                {' '}or check your spam folder for the original email.
              </p>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
