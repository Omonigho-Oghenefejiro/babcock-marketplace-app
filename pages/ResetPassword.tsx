import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';

const t = {
  green: '#1B4332',
  greenLight: '#D8F3DC',
  cream: '#FAF7F2',
  muted: '#6B7280',
  border: '#E8E2D9',
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await API.post('/auth/reset-password', { token, newPassword: password });
      setMessage('Password reset successful. Redirecting to login...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: t.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 460, background: '#fff', border: `1.5px solid ${t.border}`, borderRadius: 16, padding: 24 }}>
        <h1 style={{ fontSize: '1.35rem', marginBottom: 8 }}>Reset Password</h1>
        <p style={{ color: t.muted, fontSize: '0.88rem', marginBottom: 16 }}>Enter your reset token and new password.</p>

        {message && <p style={{ background: t.greenLight, color: t.green, padding: '10px 12px', borderRadius: 10, marginBottom: 12 }}>{message}</p>}
        {error && <p style={{ background: '#FEF2F2', color: '#B91C1C', padding: '10px 12px', borderRadius: 10, marginBottom: 12 }}>{error}</p>}

        <form onSubmit={onSubmit}>
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
            placeholder="Reset token"
            style={{ width: '100%', border: `1.5px solid ${t.border}`, borderRadius: 10, padding: '10px 12px', marginBottom: 10, outline: 'none' }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="New password"
            style={{ width: '100%', border: `1.5px solid ${t.border}`, borderRadius: 10, padding: '10px 12px', marginBottom: 12, outline: 'none' }}
          />
          <button type="submit" disabled={loading} style={{ width: '100%', background: t.green, color: '#fff', border: 'none', borderRadius: 10, padding: '11px' }}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <p style={{ marginTop: 14, fontSize: '0.82rem', color: t.muted }}>
          Back to <Link to="/login" style={{ color: t.green }}>login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
