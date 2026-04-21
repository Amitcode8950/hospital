import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const TYPE_ICONS  = { doctor: '🩺', lab: '🔬', procedure: '🏥' };
const TYPE_LABELS = { doctor: 'Doctor Consultation', lab: 'Lab / Diagnostic Test', procedure: 'Hospital Procedure' };
const STATUS_COLORS = {
  confirmed: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', color: '#10b981', label: '✅ Confirmed' },
  cancelled:  { bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.3)',  color: '#ef4444', label: '❌ Cancelled' },
  completed:  { bg: 'rgba(0,212,255,0.1)',  border: 'rgba(0,212,255,0.25)', color: '#00d4ff', label: '✔ Completed' },
};
const PAY_COLORS = {
  paid:    { color: '#10b981', label: '💳 Paid Online' },
  cod:     { color: '#f59e0b', label: '💵 Pay at Visit' },
  pending: { color: '#f59e0b', label: '⏳ Pending Payment' },
  failed:  { color: '#ef4444', label: '❌ Payment Failed' },
};

/* ─── Razorpay loader ───────────────────────────────────────────────────────── */
function loadRazorpay() {
  return new Promise(resolve => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

/* ─── Booking Detail + Payment Modal ───────────────────────────────────────── */
function BookingDetailModal({ booking: b, user, onClose, onCancelled, onPaid }) {
  const [cancelling,  setCancelling]  = useState(false);
  const [paying,      setPaying]      = useState(false);
  const [payError,    setPayError]    = useState('');
  const [paySuccess,  setPaySuccess]  = useState(false);
  const [currentB,    setCurrentB]    = useState(b); // local copy to reflect updates

  if (!currentB) return null;

  const sc       = STATUS_COLORS[currentB.status] || STATUS_COLORS.confirmed;
  const pc       = PAY_COLORS[currentB.payment_status] || PAY_COLORS.pending;
  const isPaid   = currentB.payment_status === 'paid';
  const isUpcoming = currentB.status === 'confirmed';
  const canPayOnline = !isPaid && currentB.payment_method === 'online' && isUpcoming;
  const bookingDate  = new Date(currentB.date + 'T00:00:00');

  /* Cancel booking */
  async function handleCancel() {
    if (!confirm('Cancel this booking?')) return;
    setCancelling(true);
    try {
      await api.delete(`/bookings/${currentB._id}`);
      const updated = { ...currentB, status: 'cancelled' };
      setCurrentB(updated);
      onCancelled?.(currentB._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not cancel booking');
    } finally { setCancelling(false); }
  }

  /* Pay online — Razorpay flow */
  async function handlePayOnline() {
    setPaying(true); setPayError('');
    try {
      const loaded = await loadRazorpay();
      if (!loaded) { setPayError('Payment gateway failed to load. Try again.'); setPaying(false); return; }

      const { data: order } = await api.post('/payments/create-order', { booking_id: currentB._id });

      // Mock mode
      if (order.mock) {
        await api.post('/payments/verify', {
          booking_id:          currentB._id,
          razorpay_order_id:   order.order_id,
          razorpay_payment_id: 'pay_mock_' + Date.now(),
          razorpay_signature:  'mock_signature',
        });
        const updated = { ...currentB, payment_status: 'paid' };
        setCurrentB(updated);
        setPaySuccess(true);
        onPaid?.(currentB._id, updated);
        setPaying(false);
        return;
      }

      // Real Razorpay
      const options = {
        key:      order.key_id,
        amount:   order.amount,
        currency: order.currency,
        name:     'MediChain',
        description: `${currentB.item_name} — ${currentB.date} ${currentB.time_slot}`,
        order_id: order.order_id,
        handler: async (response) => {
          try {
            await api.post('/payments/verify', {
              booking_id:          currentB._id,
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            });
            const updated = { ...currentB, payment_status: 'paid' };
            setCurrentB(updated);
            setPaySuccess(true);
            onPaid?.(currentB._id, updated);
          } catch {
            setPayError('Payment succeeded but verification failed. Contact support.');
          }
          setPaying(false);
        },
        prefill: { name: user?.name, email: user?.email },
        theme:   { color: '#00d4ff' },
        modal:   { ondismiss: () => setPaying(false) },
      };
      new window.Razorpay(options).open();
    } catch (err) {
      setPayError(err.response?.data?.message || 'Payment initiation failed. Try again.');
      setPaying(false);
    }
  }

  const InfoRow = ({ icon, label, value }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ fontSize: 17, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 14, color: '#e2e8f0', fontWeight: 600 }}>{value}</div>
      </div>
    </div>
  );

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, animation: 'medibot-slide-up 0.25s ease',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 520,
        background: 'linear-gradient(160deg,#0d1929 0%,#050a14 100%)',
        border: '1px solid rgba(0,212,255,0.15)',
        borderRadius: 20, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        maxHeight: '92vh',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
      }}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg,rgba(0,212,255,0.14),rgba(139,92,246,0.10))',
          padding: '20px 24px', borderBottom: '1px solid rgba(0,212,255,0.1)',
          display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'linear-gradient(135deg,#00d4ff,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, flexShrink: 0,
          }}>
            {TYPE_ICONS[currentB.type] || '📋'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#e2e8f0', lineHeight: 1.3, marginBottom: 2 }}>
              {currentB.item_name}
            </div>
            <div style={{ fontSize: 12, color: '#00d4ff' }}>
              {currentB.sub_item || TYPE_LABELS[currentB.type] || currentB.type}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.08)', border: 'none', color: '#94a3b8',
            cursor: 'pointer', fontSize: 18, width: 34, height: 34, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>✕</button>
        </div>

        {/* ── Status bar ──────────────────────────────────────────────────── */}
        <div style={{
          background: sc.bg, borderBottom: `1px solid ${sc.border}`,
          padding: '9px 24px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexShrink: 0,
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: sc.color }}>{sc.label}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: pc.color }}>{pc.label}</span>
        </div>

        {/* ── Scrollable body ──────────────────────────────────────────────── */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '4px 24px 8px' }}>

          {/* Payment success banner */}
          {paySuccess && (
            <div style={{
              margin: '14px 0 4px', padding: '14px 18px', borderRadius: 14,
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 36, marginBottom: 6 }}>🎉</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#10b981' }}>Payment Successful!</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                ₹{currentB.amount} paid · Receipt available below
              </div>
            </div>
          )}

          {/* Amount card */}
          <div style={{
            margin: '16px 0 4px',
            background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 14, padding: '14px 20px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: 11, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Amount</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#10b981', lineHeight: 1.2 }}>
                ₹{currentB.amount?.toLocaleString()}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Booking ID</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#8b5cf6', fontFamily: 'monospace' }}>
                #{currentB._id?.slice(-8).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Info rows */}
          <div style={{ marginTop: 8 }}>
            <InfoRow icon="🗓️" label="Appointment Date"
              value={bookingDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} />
            <InfoRow icon="⏰" label="Time Slot"     value={currentB.time_slot} />
            {currentB.location && <InfoRow icon="🏥" label="Facility"     value={currentB.location} />}
            {currentB.city     && <InfoRow icon="📍" label="City"         value={currentB.city} />}
            <InfoRow icon={TYPE_ICONS[currentB.type] || '📋'} label="Type" value={TYPE_LABELS[currentB.type] || currentB.type} />
            <InfoRow icon="💳" label="Payment Method"
              value={currentB.payment_status === 'paid' ? 'Paid Online (Card / UPI / Wallet)' : currentB.payment_method === 'online' ? 'Online (Not yet paid)' : 'Pay at Visit / COD'} />
            {currentB.notes && <InfoRow icon="📝" label="Your Notes" value={currentB.notes} />}
          </div>

          {/* Online Payment Section — Pay Now */}
          {canPayOnline && !paySuccess && (
            <div style={{
              margin: '18px 0 4px', padding: '18px 20px', borderRadius: 14,
              background: 'linear-gradient(135deg,rgba(0,212,255,0.08),rgba(139,92,246,0.06))',
              border: '1px solid rgba(0,212,255,0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 22 }}>💳</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#e2e8f0' }}>Online Payment</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Pay securely via Card, UPI, or Wallet</div>
                </div>
              </div>

              {/* Payment method icons */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                {['💳 Card', '📱 UPI', '🏦 Net Banking', '👛 Wallet'].map(m => (
                  <span key={m} style={{
                    padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)',
                    color: '#00d4ff',
                  }}>{m}</span>
                ))}
              </div>

              {/* Amount breakdown */}
              <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: '#64748b' }}>Consultation Fee</span>
                  <span style={{ color: '#e2e8f0', fontWeight: 600 }}>₹{currentB.amount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: '#64748b' }}>Platform Fee</span>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>FREE</span>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#e2e8f0' }}>Total Payable</span>
                  <span style={{ fontSize: 18, fontWeight: 900, color: '#10b981' }}>₹{currentB.amount}</span>
                </div>
              </div>

              {payError && (
                <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: 13, marginBottom: 12 }}>
                  ⚠️ {payError}
                </div>
              )}

              <button
                onClick={handlePayOnline}
                disabled={paying}
                style={{
                  width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                  background: paying ? 'rgba(0,212,255,0.3)' : 'linear-gradient(135deg,#00d4ff,#0ea5e9)',
                  color: '#050a14', fontSize: 15, fontWeight: 800,
                  cursor: paying ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {paying
                  ? <><span className="spin" style={{ width: 16, height: 16, borderWidth: 2, borderTopColor: '#050a14' }} /> Processing...</>
                  : <>💳 Pay ₹{currentB.amount} Now</>
                }
              </button>

              <div style={{ textAlign: 'center', fontSize: 11, color: '#334155', marginTop: 10 }}>
                🔒 256-bit SSL encrypted · Powered by Razorpay
              </div>
            </div>
          )}

          {/* Booking meta */}
          <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, fontSize: 12, color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
            <span>Booked: {currentB.createdAt ? new Date(currentB.createdAt).toLocaleDateString('en-IN') : 'N/A'}</span>
            <span>Status: <span style={{ color: sc.color }}>{currentB.status}</span></span>
          </div>
        </div>

        {/* ── Bottom Action Buttons ────────────────────────────────────────── */}
        <div style={{
          padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(5,10,20,0.95)', display: 'flex', flexDirection: 'column', gap: 10,
          flexShrink: 0,
        }}>

          {/* Primary row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>

            {/* View all bookings */}
            <Link
              to="/my-bookings"
              onClick={onClose}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '11px 14px', borderRadius: 12,
                background: 'linear-gradient(135deg,#00d4ff,#0ea5e9)',
                color: '#050a14', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', textDecoration: 'none',
              }}
            >
              📋 All Bookings
            </Link>

            {/* Receipt (if paid) or Copy details */}
            {isPaid || paySuccess ? (
              <a
                href={`/api/payments/receipt/${currentB._id}`}
                target="_blank" rel="noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '11px 14px', borderRadius: 12,
                  background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
                  color: '#10b981', fontSize: 13, fontWeight: 700, textDecoration: 'none',
                }}
              >
                🧾 Receipt
              </a>
            ) : (
              <button
                onClick={() => {
                  const text = `📅 ${currentB.item_name}\n🗓️ ${bookingDate.toDateString()} ⏰ ${currentB.time_slot}\n🏥 ${currentB.location || ''}\nBooking #${currentB._id?.slice(-8).toUpperCase()}`;
                  navigator.clipboard?.writeText(text).then(() => alert('Booking details copied!'));
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '11px 14px', borderRadius: 12,
                  background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)',
                  color: '#a78bfa', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}
              >
                📋 Copy Details
              </button>
            )}
          </div>

          {/* Secondary row */}
          <div style={{ display: 'grid', gridTemplateColumns: isUpcoming ? '1fr 1fr' : '1fr', gap: 10 }}>

            {/* Book Again */}
            <Link
              to={currentB.type === 'doctor' ? '/specialists' : currentB.type === 'lab' ? '/diagnostics' : '/hospital-pricing'}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '10px 14px', borderRadius: 12,
                background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.2)',
                color: '#00d4ff', fontSize: 13, fontWeight: 600, textDecoration: 'none',
              }}
            >
              🔄 Book Again
            </Link>

            {/* Cancel — upcoming only */}
            {isUpcoming && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '10px 14px', borderRadius: 12,
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                  color: '#ef4444', fontSize: 13, fontWeight: 600,
                  cursor: cancelling ? 'not-allowed' : 'pointer', opacity: cancelling ? 0.6 : 1,
                }}
              >
                {cancelling
                  ? <><span className="spin" style={{ width: 14, height: 14, borderWidth: 2 }} /> Cancelling...</>
                  : '✕ Cancel Booking'
                }
              </button>
            )}
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            style={{
              padding: '9px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.04)', color: '#475569', fontSize: 13, cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Profile Page ─────────────────────────────────────────────────────── */
export default function Profile() {
  const navigate  = useNavigate();
  const [user]    = useState(() => { try { return JSON.parse(localStorage.getItem('medichain_user')); } catch { return null; } });
  const [bookings,  setBookings]  = useState([]);
  const [records,   setRecords]   = useState([]);
  const [incoming,  setIncoming]  = useState([]);
  const [loadB,     setLoadB]     = useState(true);
  const [loadR,     setLoadR]     = useState(true);
  const [loadI,     setLoadI]     = useState(true);
  const [actionId,  setActionId]  = useState(null);
  const [actionNote,setActionNote]= useState('');
  const [actioning, setActioning] = useState(false);
  const [tab,       setTab]       = useState(user?.role === 'doctor' ? 'incoming' : 'bookings');
  const [selected,  setSelected]  = useState(null); // selected booking for detail modal

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchBookings();
    fetchRecords();
    if (user.role === 'doctor') fetchIncoming();
  }, []);

  async function fetchIncoming() {
    setLoadI(true);
    try { const { data } = await api.get('/bookings/incoming'); setIncoming(data); }
    catch { setIncoming([]); }
    finally { setLoadI(false); }
  }

  async function handleAction(bookingId, action) {
    setActioning(true);
    try {
      await api.put(`/bookings/${bookingId}/action`, { action, doctor_notes: actionNote });
      setActionId(null); setActionNote('');
      fetchIncoming();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally { setActioning(false); }
  }

  async function fetchBookings() {
    setLoadB(true);
    try { const { data } = await api.get('/bookings'); setBookings(data); }
    catch { setBookings([]); }
    finally { setLoadB(false); }
  }

  async function fetchRecords() {
    setLoadR(true);
    try { const { data } = await api.get('/records'); setRecords(data); }
    catch { setRecords([]); }
    finally { setLoadR(false); }
  }

  function logout() {
    localStorage.removeItem('medichain_token');
    localStorage.removeItem('medichain_user');
    navigate('/');
    window.location.reload();
  }

  if (!user) return null;

  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const totalSpent = bookings.filter(b => b.payment_status === 'paid').reduce((s, b) => s + b.amount, 0);
  const pendingRequests = incoming.filter(b => b.doctor_action === 'pending').length;

  return (
    <div className="page">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="glass stack-sm" style={{ padding: '32px', marginBottom: 28, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', background: 'linear-gradient(135deg,rgba(0,212,255,0.07),rgba(139,92,246,0.05))' }}>
        {user.avatar ? (
          <img src={user.avatar} alt={user.name}
            style={{ width: 88, height: 88, borderRadius: '50%', border: '3px solid rgba(0,212,255,0.4)', objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(135deg,#00d4ff,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, fontWeight: 800, color: '#050a14', flexShrink: 0, border: '3px solid rgba(0,212,255,0.3)' }}>
            {user.name?.[0]?.toUpperCase()}
          </div>
        )}

        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 style={{ color: '#e2e8f0', fontSize: 26, fontWeight: 800, marginBottom: 4 }}>{user.name}</h1>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
            <span style={{ padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: user.role === 'doctor' ? 'rgba(0,212,255,0.15)' : 'rgba(16,185,129,0.15)', border: `1px solid ${user.role === 'doctor' ? 'rgba(0,212,255,0.3)' : 'rgba(16,185,129,0.3)'}`, color: user.role === 'doctor' ? '#00d4ff' : '#10b981', textTransform: 'capitalize' }}>
              {user.role === 'doctor' ? '👨‍⚕️' : '🧑'} {user.role}
            </span>
            <span style={{ fontSize: 13, color: '#64748b' }}>📧 {user.email}</span>
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {[
              { label: 'Bookings', value: bookings.length,    icon: '📅' },
              { label: 'Upcoming', value: confirmedBookings,  icon: '🗓️' },
              { label: 'Records',  value: records.length,     icon: '📋' },
              { label: 'Spent',    value: `₹${totalSpent.toLocaleString()}`, icon: '💳' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, marginBottom: 2 }}>{s.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#e2e8f0' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#475569' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
          <button onClick={logout} className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* ── Tab bar ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 0, overflowX: 'auto', whiteSpace: 'nowrap', scrollbarWidth: 'none' }}>
        {[
          ...(user.role === 'doctor' ? [{ key: 'incoming', label: `🔔 Patient Requests (${incoming.length})`, badge: pendingRequests }] : []),
          { key: 'bookings', label: `📅 My Bookings (${bookings.length})` },
          { key: 'records',  label: `📋 My Records (${records.length})` },
          { key: 'account',  label: '⚙️ Account' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{
              padding: '10px 18px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
              background: 'none', borderBottom: tab === t.key ? '2px solid #00d4ff' : '2px solid transparent',
              color: tab === t.key ? '#00d4ff' : '#64748b', transition: 'all 0.2s', marginBottom: -1,
              position: 'relative',
            }}>
            {t.label}
            {t.badge > 0 && (
              <span style={{ position: 'absolute', top: 6, right: 6, width: 16, height: 16, borderRadius: '50%', background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── INCOMING REQUESTS TAB (doctors) ──────────────────────── */}
      {tab === 'incoming' && user.role === 'doctor' && (
        <div>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
            Patient appointment requests booked with you. Confirm or Reject — the patient gets an email instantly.
          </p>
          {loadI ? (
            <div style={{ textAlign: 'center', padding: 60 }}><span className="spin" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>
          ) : incoming.length === 0 ? (
            <div className="glass" style={{ padding: '48px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
              <p style={{ color: '#94a3b8' }}>No patient appointment requests yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {incoming.map(b => {
                const isPending   = b.doctor_action === 'pending';
                const isActing    = actionId === b._id;
                const actionColor = b.doctor_action === 'confirmed' ? '#10b981' : b.doctor_action === 'rejected' ? '#ef4444' : '#f59e0b';
                const actionLabel = b.doctor_action === 'confirmed' ? '✅ Confirmed' : b.doctor_action === 'rejected' ? '❌ Rejected' : '⏳ Pending';
                return (
                  <div key={b._id} className="glass" style={{ padding: '20px 24px', borderLeft: `3px solid ${actionColor}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: isActing ? 16 : 0 }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontSize: 22 }}>🧑</span>
                          <div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>{b.user_name}</div>
                            <div style={{ fontSize: 12, color: '#64748b' }}>{b.user_email}</div>
                          </div>
                        </div>
                        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>
                          🗓️ {new Date(b.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })} · ⏰ {b.time_slot}
                        </div>
                        {b.notes && <div style={{ fontSize: 12, color: '#475569', fontStyle: 'italic' }}>📝 {b.notes}</div>}
                        <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 16, fontWeight: 800, color: '#10b981' }}>₹{b.amount}</span>
                          <span style={{ fontSize: 12, color: '#64748b' }}>{b.payment_method === 'online' ? '💳 Online' : '💵 Cash'}</span>
                          <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${actionColor}18`, border: `1px solid ${actionColor}44`, color: actionColor }}>{actionLabel}</span>
                        </div>
                        {b.doctor_notes && (
                          <div style={{ marginTop: 8, fontSize: 12, color: '#94a3b8', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: 8 }}>
                            💬 Your note: {b.doctor_notes}
                          </div>
                        )}
                      </div>
                      {isPending && !isActing && (
                        <button onClick={() => { setActionId(b._id); setActionNote(''); }}
                          className="btn btn-sm"
                          style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff', flexShrink: 0 }}>
                          ✏️ Respond
                        </button>
                      )}
                    </div>
                    {isActing && (
                      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: 10 }}>Your message to patient (optional)</div>
                        <textarea className="input" rows={2}
                          placeholder="e.g. Please bring your previous lab reports..."
                          value={actionNote} onChange={e => setActionNote(e.target.value)}
                          style={{ resize: 'none', fontSize: 13, marginBottom: 12 }} />
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button onClick={() => handleAction(b._id, 'confirmed')} disabled={actioning}
                            className="btn btn-sm"
                            style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#10b981', fontWeight: 700, flex: 1 }}>
                            {actioning ? '...' : '✅ Confirm Appointment'}
                          </button>
                          <button onClick={() => handleAction(b._id, 'rejected')} disabled={actioning}
                            className="btn btn-sm"
                            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontWeight: 700, flex: 1 }}>
                            {actioning ? '...' : '❌ Reject'}
                          </button>
                          <button onClick={() => setActionId(null)} className="btn btn-ghost btn-sm">Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── BOOKINGS TAB ─────────────────────────────────────────── */}
      {tab === 'bookings' && (
        <div>
          {/* Hint */}
          <p style={{ fontSize: 13, color: '#475569', marginBottom: 14 }}>
            💡 Tap any booking card to view full details, pay online, or cancel.
          </p>

          {loadB ? (
            <div style={{ textAlign: 'center', padding: 60 }}><span className="spin" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>
          ) : bookings.length === 0 ? (
            <div className="glass" style={{ padding: '48px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
              <p style={{ color: '#94a3b8', marginBottom: 20 }}>No bookings yet.</p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/specialists" className="btn btn-primary btn-sm">🩺 Find Doctor</Link>
                <Link to="/diagnostics" className="btn btn-ghost btn-sm">🔬 Book Lab Test</Link>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {bookings.map(b => {
                const sc = STATUS_COLORS[b.status] || STATUS_COLORS.confirmed;
                const pc = PAY_COLORS[b.payment_status] || PAY_COLORS.pending;
                const canPay = b.payment_status !== 'paid' && b.payment_method === 'online' && b.status === 'confirmed';

                return (
                  <div
                    key={b._id}
                    className="glass"
                    onClick={() => setSelected(b)}
                    style={{
                      padding: '18px 22px', borderLeft: `3px solid ${sc.border}`,
                      display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
                      cursor: 'pointer', transition: 'transform 0.18s, box-shadow 0.18s, border-color 0.18s',
                      position: 'relative',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,212,255,0.08)';
                      e.currentTarget.style.borderLeftColor = '#00d4ff';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '';
                      e.currentTarget.style.borderLeftColor = sc.border;
                    }}
                  >
                    {/* TAP hint */}
                    <div style={{ position: 'absolute', top: 8, right: 12, fontSize: 10, color: '#334155', fontWeight: 600, letterSpacing: '0.4px' }}>
                      TAP TO VIEW ›
                    </div>

                    <div style={{ fontSize: 26, flexShrink: 0 }}>{TYPE_ICONS[b.type] || '📋'}</div>

                    <div style={{ flex: 1, minWidth: 180 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0', marginBottom: 2 }}>{b.item_name}</div>
                      {b.sub_item && <div style={{ fontSize: 12, color: '#00d4ff', marginBottom: 2 }}>{b.sub_item}</div>}
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        📍 {b.location || b.city} · 🗓️ {new Date(b.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · ⏰ {b.time_slot}
                      </div>
                    </div>

                    <div className="stack-sm" style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#10b981' }}>₹{b.amount}</div>
                        <div style={{ fontSize: 11, color: pc.color }}>{pc.label}</div>
                      </div>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color, whiteSpace: 'nowrap' }}>
                        {sc.label}
                      </span>
                      {/* Pay Now badge */}
                      {canPay && (
                        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff', whiteSpace: 'nowrap' }}>
                          💳 Pay Now
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── RECORDS TAB ──────────────────────────────────────────── */}
      {tab === 'records' && (
        <div>
          {loadR ? (
            <div style={{ textAlign: 'center', padding: 60 }}><span className="spin" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>
          ) : records.length === 0 ? (
            <div className="glass" style={{ padding: '48px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
              <p style={{ color: '#94a3b8', marginBottom: 20 }}>
                {user.role === 'doctor' ? "You haven't added any records yet." : "No medical records available."}
              </p>
              {user.role === 'doctor' && (
                <Link to="/add-record" className="btn btn-primary btn-sm">➕ Add First Record</Link>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {records.map(r => (
                <Link key={r._id} to={`/record/${r._id}`} style={{ textDecoration: 'none' }}>
                  <div className="glass card-hover" style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 26, flexShrink: 0 }}>🩺</div>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0', marginBottom: 2 }}>{r.diagnosis}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>
                        👤 {r.patient_name || r.patient_id?.name || 'Patient'} · 📅 {new Date(r.created_at || r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      {r.prescription && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 400 }}>💊 {r.prescription}</div>}
                    </div>
                    <span style={{ fontSize: 13, color: '#00d4ff' }}>View →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ACCOUNT TAB ──────────────────────────────────────────── */}
      {tab === 'account' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 560 }}>
          <div className="glass" style={{ padding: '24px' }}>
            <h3 style={{ color: '#e2e8f0', fontSize: 15, fontWeight: 700, marginBottom: 18 }}>👤 Profile Information</h3>
            {[
              { label: 'Full Name', value: user.name },
              { label: 'Email',     value: user.email },
              { label: 'Role',      value: user.role.charAt(0).toUpperCase() + user.role.slice(1) },
              { label: 'User ID',   value: user.id?.slice(-8).toUpperCase() },
            ].map(f => (
              <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>{f.label}</span>
                <span style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600 }}>{f.value}</span>
              </div>
            ))}
          </div>

          <div className="glass" style={{ padding: '24px' }}>
            <h3 style={{ color: '#e2e8f0', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>⚡ Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { to: '/my-bookings',     icon: '📅', label: 'View All Bookings',        sub: 'Manage appointments & payments' },
                { to: '/vitals',          icon: '🫀', label: 'Health Vitals Tracker',     sub: 'Log BP, sugar, weight & more' },
                { to: '/timeline',        icon: '📜', label: 'Health Timeline',           sub: 'Complete medical history view' },
                { to: '/health-calc',     icon: '🧮', label: 'Health Calculator',         sub: 'BMI, water, calories, heart zones' },
                { to: '/specialists',     icon: '🩺', label: 'Find a Specialist',         sub: 'Book doctor appointments' },
                { to: '/diagnostics',     icon: '🔬', label: 'Book Lab Test',             sub: 'Home collection available' },
                { to: '/medicine-prices', icon: '💊', label: 'Compare Medicine Prices',   sub: 'Apollo, 1mg, MedPlus & more' },
                { to: '/generic-drugs',   icon: '🏷️', label: 'Find Generic Alternatives', sub: 'Save up to 80% on medicines' },
                { to: '/dashboard',       icon: '📋', label: 'Medical Records',           sub: 'View your health history' },
                { to: '/blockchain',      icon: '⛓️', label: 'Blockchain Explorer',       sub: 'Verify record integrity' },
                ...(user.role === 'doctor' ? [
                  { to: '/add-record', icon: '➕', label: 'Add Medical Record', sub: 'Create patient records' },
                  { to: '/er-triage',  icon: '🚑', label: 'ER Triage Queue',    sub: 'Emergency room management' },
                ] : []),
              ].map(a => (
                <Link key={a.to} to={a.to} style={{ textDecoration: 'none' }}>
                  <div className="card-hover" style={{ padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.2s' }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{a.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{a.label}</div>
                      <div style={{ fontSize: 11, color: '#475569' }}>{a.sub}</div>
                    </div>
                    <span style={{ color: '#475569', fontSize: 14 }}>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="glass" style={{ padding: '24px', border: '1px solid rgba(239,68,68,0.2)' }}>
            <h3 style={{ color: '#ef4444', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>⚠️ Danger Zone</h3>
            <button onClick={logout}
              style={{ width: '100%', padding: '12px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
              🚪 Logout from MediChain
            </button>
          </div>
        </div>
      )}

      {/* ── Booking Detail Modal ─────────────────────────────────── */}
      {selected && (
        <BookingDetailModal
          booking={selected}
          user={user}
          onClose={() => setSelected(null)}
          onCancelled={(id) => {
            setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
          }}
          onPaid={(id, updated) => {
            setBookings(prev => prev.map(b => b._id === id ? updated : b));
          }}
        />
      )}
    </div>
  );
}
