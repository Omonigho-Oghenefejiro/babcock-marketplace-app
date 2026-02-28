import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

const t = {
  green: '#1B4332',
  greenLight: '#D8F3DC',
  cream: '#FAF7F2',
  muted: '#6B7280',
  border: '#E8E2D9',
};

const generateHumanCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [humanCode, setHumanCode] = useState(() => generateHumanCode());
  const [humanInput, setHumanInput] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const normalizedEmail = String(email).trim().toLowerCase();
    if (!normalizedEmail) {
      setError('Please enter your email.');
      return;
    }

    setLoading(true);
    try {
      await API.post('/auth/forgot-password', { email: normalizedEmail });
      setStep(2);
      setMessage('Now create your new password and complete human verification.');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to continue reset flow.');
    } finally {
      setLoading(false);
    }
  };

  const onReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (humanInput.trim().toUpperCase() !== humanCode) {
      setError('Please enter the human verification code correctly.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await API.post('/auth/reset-password-direct', {
        email: String(email).trim().toLowerCase(),
        newPassword: password,
      });
      setMessage(data?.message || 'Password reset successful. You can now login.');
      setPassword('');
      setConfirmPassword('');
      setHumanInput('');
      setHumanCode(generateHumanCode());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: t.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 460, background: '#fff', border: `1.5px solid ${t.border}`, borderRadius: 16, padding: 24 }}>
        <h1 style={{ fontSize: '1.35rem', marginBottom: 8 }}>Forgot Password</h1>
        <p style={{ color: t.muted, fontSize: '0.88rem', marginBottom: 16 }}>
          Step {step} of 2: {step === 1 ? 'Enter your account email' : 'Create new password and verify human'}
        </p>

        {message && <p style={{ background: t.greenLight, color: t.green, padding: '10px 12px', borderRadius: 10, marginBottom: 12 }}>{message}</p>}
        {error && <p style={{ background: '#FEF2F2', color: '#B91C1C', padding: '10px 12px', borderRadius: 10, marginBottom: 12 }}>{error}</p>}

        <form onSubmit={step === 1 ? onContinue : onReset}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@babcock.edu.ng"
            disabled={step === 2}
            style={{ width: '100%', border: `1.5px solid ${t.border}`, borderRadius: 10, padding: '10px 12px', marginBottom: 12, outline: 'none', background: step === 2 ? '#F9FAFB' : '#fff' }}
          />

          {step === 2 && (
            <>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="New password"
                style={{ width: '100%', border: `1.5px solid ${t.border}`, borderRadius: 10, padding: '10px 12px', marginBottom: 10, outline: 'none' }}
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Confirm new password"
                style={{ width: '100%', border: `1.5px solid ${t.border}`, borderRadius: 10, padding: '10px 12px', marginBottom: 12, outline: 'none' }}
              />

              <div style={{ background: t.cream, border: `1px solid ${t.border}`, borderRadius: 10, padding: '10px 12px', marginBottom: 12 }}>
                <p style={{ fontSize: '0.8rem', color: t.muted, marginBottom: 8 }}>
                  Human Check: <strong style={{ color: t.green }}>{humanCode}</strong>
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={humanInput}
                    onChange={(e) => setHumanInput(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    style={{ flex: 1, border: `1.5px solid ${t.border}`, borderRadius: 10, padding: '10px 12px', outline: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => { setHumanCode(generateHumanCode()); setHumanInput(''); }}
                    style={{ border: `1.5px solid ${t.border}`, background: '#fff', borderRadius: 10, padding: '0 10px', color: t.muted, cursor: 'pointer' }}
                  >
                    New
                  </button>
                </div>
              </div>
            </>
          )}

          <button type="submit" disabled={loading} style={{ width: '100%', background: t.green, color: '#fff', border: 'none', borderRadius: 10, padding: '11px' }}>
            {loading ? 'Please wait...' : step === 1 ? 'Continue' : 'Reset Password'}
          </button>
        </form>

        <p style={{ marginTop: 14, fontSize: '0.82rem', color: t.muted }}>
          Back to <Link to="/login" style={{ color: t.green }}>login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
