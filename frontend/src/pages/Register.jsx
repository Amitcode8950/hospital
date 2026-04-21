import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '+910000000000', password: '', role: 'patient' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      navigate('/verify-email', { state: { userId: data.userId, email: data.email, name: form.name } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-box fadeUp" style={{ maxWidth: '520px' }}>
        <div className="auth-logo">
          <span className="auth-logo-icon">🏥</span>
          <span className="auth-logo-text">MediChain</span>
        </div>

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-sub">Join MediChain — verify your email to access your secure medical records.</p>

        {error && <div className="alert alert-err">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="fg">
            <label className="label">Full Name</label>
            <input id="reg-name" className="input" type="text" placeholder="John Doe"
              value={form.name} onChange={e => set('name', e.target.value)} required autoFocus />
          </div>

          <div className="fg">
            <label className="label">Email Address</label>
            <input id="reg-email" className="input" type="email" placeholder="you@example.com"
              value={form.email} onChange={e => set('email', e.target.value)} required />
          </div>



          <div className="fg">
            <label className="label">Password</label>
            <div style={{ position: 'relative' }}>
              <input id="reg-password" className="input" type={showPwd ? 'text' : 'password'}
                placeholder="Min. 8 characters" value={form.password}
                onChange={e => set('password', e.target.value)} required style={{ paddingRight: '48px' }} />
              <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
                position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '18px',
              }}>{showPwd ? '🙈' : '👁️'}</button>
            </div>
          </div>

          <div className="fg" style={{ marginBottom: '28px' }}>
            <label className="label">I am a...</label>
            <select id="reg-role" className="select" value={form.role} onChange={e => set('role', e.target.value)}>
              <option value="patient">🧑‍⚕️ Patient — View & manage my records</option>
              <option value="doctor">👨‍⚕️ Doctor — Add records for patients</option>
            </select>
          </div>

          <button id="reg-submit" type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <><span className="spin" /> Creating account...</> : 'Create Account & Verify →'}
          </button>
        </form>

        {/* Steps preview */}
        <div style={{
          marginTop: '28px', padding: '18px 20px',
          background: 'rgba(0,212,255,0.05)', borderRadius: '12px',
          border: '1px solid rgba(0,212,255,0.15)',
        }}>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Verification Steps
          </p>
          {[
          { step: '1', label: 'Fill form above', done: true },
            { step: '2', label: 'Verify email (OTP sent to your inbox)' },
            { step: '3', label: 'Access your dashboard 🎉' },
          ].map(s => (
            <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{
                width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 700, color: '#00d4ff',
              }}>{s.step}</div>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>{s.label}</span>
            </div>
          ))}
        </div>

        <div className="divider">or</div>
        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '15px' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
