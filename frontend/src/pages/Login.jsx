import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('medichain_token', data.token);
      localStorage.setItem('medichain_user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('storage'));
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      if (err.response?.data?.userId) {
        navigate('/verify-email', { state: { userId: err.response.data.userId, email: form.email } });
        return;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-box fadeUp">
        <div className="auth-logo">
          <span className="auth-logo-icon">🏥</span>
          <span className="auth-logo-text">MediChain</span>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to access your medical records securely.</p>

        {error && <div className="alert alert-err">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="fg">
            <label className="label">Email Address</label>
            <input
              id="login-email"
              className="input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div className="fg" style={{ marginBottom: '28px' }}>
            <label className="label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                className="input"
                type={showPwd ? 'text' : 'password'}
                placeholder="Your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                style={{ paddingRight: '48px' }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                style={{
                  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#94a3b8', fontSize: '18px',
                }}
              >{showPwd ? '🙈' : '👁️'}</button>
            </div>
          </div>

          <button id="login-submit" type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <><span className="spin" /> Signing in...</> : 'Sign In →'}
          </button>
        </form>

        <div className="divider">or</div>

        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '15px' }}>
          New to MediChain? <Link to="/register">Create account</Link>
        </p>
      </div>
    </div>
  );
}
