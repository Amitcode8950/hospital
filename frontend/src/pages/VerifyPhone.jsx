import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import OTPInput from '../components/OTPInput';
import api from '../api/axios';

export default function VerifyPhone() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const userId = state?.userId;
  const phone = state?.phone;

  useEffect(() => {
    if (!userId) navigate('/register');
  }, [userId, navigate]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  async function handleVerify(e) {
    e.preventDefault();
    if (otp.length !== 6) { setError('Please enter the complete 6-digit code'); return; }
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-phone', { userId, otp });
      setSuccess(data.message);
      setTimeout(() => navigate('/login', { state: { verified: true } }), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
      setOtp('');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResendLoading(true); setError('');
    try {
      await api.post('/auth/resend-phone-otp', { userId });
      setSuccess('New OTP sent to your phone!');
      setCountdown(60); setOtp('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-box fadeUp">
        <div className="auth-logo">
          <span className="auth-logo-icon">🏥</span>
          <span className="auth-logo-text">MediChain</span>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
          {[{ n: 1, label: 'Register', done: true }, { n: 2, label: 'Email', done: true }, { n: 3, label: 'Phone', active: true }, { n: 4, label: 'Done' }].map(s => (
            <div key={s.n} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: s.done ? 'rgba(16,185,129,0.2)' : s.active ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.05)',
                border: `2px solid ${s.done ? '#10b981' : s.active ? '#00d4ff' : 'rgba(255,255,255,0.1)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: 700,
                color: s.done ? '#10b981' : s.active ? '#00d4ff' : '#475569',
              }}>{s.done ? '✓' : s.n}</div>
              <span style={{ fontSize: '10px', color: s.active ? '#00d4ff' : '#475569', fontWeight: s.active ? 700 : 400 }}>{s.label}</span>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📱</div>
          <h1 className="auth-title">Verify your phone</h1>
          <p className="auth-sub">
            We sent a 6-digit SMS code to{' '}
            <strong style={{ color: '#00d4ff' }}>{phone || 'your phone'}</strong>.
          </p>
        </div>

        {error && <div className="alert alert-err">⚠️ {error}</div>}
        {success && <div className="alert alert-ok">✓ {success}</div>}

        <form onSubmit={handleVerify}>
          <div style={{ marginBottom: '28px' }}>
            <OTPInput value={otp} onChange={setOtp} disabled={loading} />
          </div>

          <button id="verify-phone-submit" type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading || otp.length !== 6}>
            {loading ? <><span className="spin" /> Verifying...</> : 'Verify Phone & Activate →'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          {countdown > 0 ? (
            <p style={{ color: '#475569', fontSize: '14px' }}>
              Resend code in <span style={{ color: '#00d4ff', fontWeight: 700 }}>{countdown}s</span>
            </p>
          ) : (
            <button onClick={handleResend} disabled={resendLoading}
              style={{ background: 'none', border: 'none', color: '#00d4ff', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>
              {resendLoading ? 'Sending...' : '📨 Resend SMS Code'}
            </button>
          )}
        </div>

        <div className="alert alert-info" style={{ marginTop: '20px' }}>
          💡 <span><strong>Twilio not configured?</strong> Check the backend console — OTP is printed there in a box.</span>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#475569' }}>
          Step 3 of 4 — almost done! 🎉
        </p>
      </div>
    </div>
  );
}
