import { useState } from 'react';
import api from '../api/axios';

// ─── Time slots ───────────────────────────────────────────────────────────────
const SLOTS = {
  Morning:   ['9:00 AM–10:00 AM', '10:00 AM–11:00 AM', '11:00 AM–12:00 PM'],
  Afternoon: ['12:00 PM–1:00 PM', '2:00 PM–3:00 PM',   '3:00 PM–4:00 PM'],
  Evening:   ['4:00 PM–5:00 PM',  '5:00 PM–6:00 PM',   '6:00 PM–7:00 PM'],
};

// ─── Get next 7 available dates ───────────────────────────────────────────────
function getNext7Days() {
  const days = [];
  for (let i = 1; i <= 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      value: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
    });
  }
  return days;
}

// ─── Load Razorpay script ─────────────────────────────────────────────────────
function loadRazorpay() {
  return new Promise(resolve => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function BookingModal({ item, type, onClose, onSuccess }) {
  const DAYS = getNext7Days();
  const [step, setStep]         = useState(1); // 1=date/time, 2=review, 3=payment, 4=done
  const [date, setDate]         = useState(DAYS[0].value);
  const [slot, setSlot]         = useState('');
  const [payMode, setPayMode]   = useState(''); // 'online' | 'cash'
  const [notes, setNotes]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [error, setError]       = useState('');

  const user = (() => { try { return JSON.parse(localStorage.getItem('medichain_user')); } catch { return null; } })();

  if (!user) {
    return (
      <Overlay onClose={onClose}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
          <h2 style={{ color: '#e2e8f0', marginBottom: 8 }}>Login Required</h2>
          <p style={{ color: '#94a3b8', marginBottom: 24 }}>Please log in to book an appointment.</p>
          <a href="/login" className="btn btn-primary">Login to Continue</a>
        </div>
      </Overlay>
    );
  }

  // ── Step 1: Pick date + time ──────────────────────────────────────────────
  function Step1() {
    return (
      <>
        <ModalHeader title="📅 Choose Date & Time" step={1} total={3} onClose={onClose} />

        {/* Date picker */}
        <Section label="Select Date">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {DAYS.map(d => (
              <button key={d.value} onClick={() => setDate(d.value)}
                style={{
                  padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
                  background: date === d.value ? '#00d4ff' : 'rgba(255,255,255,0.06)',
                  color: date === d.value ? '#050a14' : '#94a3b8',
                }}>{d.label}</button>
            ))}
          </div>
        </Section>

        {/* Time slots */}
        <Section label="Select Time Slot">
          {Object.entries(SLOTS).map(([period, times]) => (
            <div key={period} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: '#475569', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>{period}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {times.map(t => (
                  <button key={t} onClick={() => setSlot(t)}
                    style={{
                      padding: '7px 12px', borderRadius: 8, border: '1px solid',
                      borderColor: slot === t ? '#00d4ff' : 'rgba(255,255,255,0.1)',
                      background:  slot === t ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)',
                      color:       slot === t ? '#00d4ff' : '#94a3b8',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                    }}>{t}</button>
                ))}
              </div>
            </div>
          ))}
        </Section>

        <button className="btn btn-primary btn-full" disabled={!slot}
          onClick={() => setStep(2)} style={{ marginTop: 8 }}>
          Review Booking →
        </button>
      </>
    );
  }

  // ── Step 2: Review + payment choice ──────────────────────────────────────
  function Step2() {
    return (
      <>
        <ModalHeader title="💳 Review & Pay" step={2} total={3} onClose={onClose} />

        {/* Summary card */}
        <div style={{ background: 'rgba(0,212,255,0.06)', borderRadius: 12, border: '1px solid rgba(0,212,255,0.15)', padding: '16px 20px', marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#e2e8f0', marginBottom: 4 }}>{item.item_name}</div>
          {item.sub_item && <div style={{ fontSize: 13, color: '#00d4ff', marginBottom: 4 }}>{item.sub_item}</div>}
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 2 }}>📍 {item.location}</div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>
            🗓️ {new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} · ⏰ {slot}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#64748b' }}>Consultation Fee</span>
            <span style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>₹{item.amount}</span>
          </div>
        </div>

        {/* Notes */}
        <Section label="Notes (optional)">
          <textarea className="input" rows={2} placeholder="Any symptoms / test requirements..."
            value={notes} onChange={e => setNotes(e.target.value)}
            style={{ resize: 'none', fontSize: 13 }} />
        </Section>

        {/* Payment method */}
        <Section label="Choose Payment Method">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { key: 'online', icon: '💳', title: 'Pay Online', sub: 'Card / UPI / Wallet' },
              { key: 'cash',   icon: '💵', title: 'Cash / At Visit', sub: 'Pay when you arrive' },
            ].map(p => (
              <button key={p.key} onClick={() => setPayMode(p.key)}
                style={{
                  padding: '14px 12px', borderRadius: 12, border: '2px solid',
                  borderColor: payMode === p.key ? '#00d4ff' : 'rgba(255,255,255,0.1)',
                  background:  payMode === p.key ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.04)',
                  cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center',
                }}>
                <div style={{ fontSize: 26, marginBottom: 4 }}>{p.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: payMode === p.key ? '#00d4ff' : '#e2e8f0' }}>{p.title}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{p.sub}</div>
              </button>
            ))}
          </div>
        </Section>

        {error && <div className="alert alert-err">⚠️ {error}</div>}

        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <button className="btn btn-ghost" onClick={() => setStep(1)} style={{ flex: '0 0 auto' }}>← Back</button>
          <button className="btn btn-primary btn-full"
            disabled={!payMode || loading}
            onClick={() => handleConfirm()}>
            {loading ? <><span className="spin" /> Confirming...</> : payMode === 'cash' ? '✅ Confirm Booking' : '💳 Pay ₹' + item.amount}
          </button>
        </div>
      </>
    );
  }

  function Step3({ paid }) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0 8px' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>{paid ? '🎉' : '✅'}</div>
        <h2 style={{ color: '#10b981', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Booking Confirmed!</h2>
        <p style={{ color: '#94a3b8', marginBottom: 6 }}>
          {item.item_name} · {new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        {paid && (
          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 13 }}>
            <div style={{ color: '#10b981', fontWeight: 700 }}>💳 Payment Successful</div>
            <div style={{ color: '#64748b', marginTop: 2 }}>Transaction ID: <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>TXN-{Date.now().toString(36).toUpperCase()}</span></div>
          </div>
        )}
        {!paid && (
          <p style={{ color: '#f59e0b', fontSize: 13, fontWeight: 700, marginBottom: 16 }}>💵 Pay at Visit / Home Collection</p>
        )}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a href="/my-bookings" className="btn btn-primary btn-full">📋 View My Bookings</a>
          {bookingId && paid && (
            <a href={`http://localhost:8000/api/payments/receipt/${bookingId}`} target="_blank" rel="noreferrer"
              className="btn btn-ghost btn-full" style={{ fontSize: 12 }}>🧾 Download Receipt</a>
          )}
          <button className="btn btn-ghost btn-full" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  // ── Logic: confirm booking ────────────────────────────────────────────────
  async function handleConfirm() {
    setLoading(true); setError('');
    try {
      const payload = {
        type:       type,
        item_id:    item.item_id || '',
        item_name:  item.item_name,
        sub_item:   item.sub_item || '',
        location:   item.location || '',
        city:       item.city || '',
        date,
        time_slot:  slot,
        amount:     item.amount,
        payment_method: payMode,
        notes,
      };

      const { data } = await api.post('/bookings', payload);
      setBookingId(data.booking._id);

      if (payMode === 'cash') {
        setStep(4);
        onSuccess?.({ ...data.booking, paid: false });
        return;
      }

      // Online payment — Razorpay
      await handleRazorpay(data.booking._id, data.booking.amount);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRazorpay(bId, amount) {
    const loaded = await loadRazorpay();
    if (!loaded) { setError('Failed to load payment gateway. Try Cash on Delivery.'); return; }

    const { data: order } = await api.post('/payments/create-order', { booking_id: bId });

    // Mock mode — simulate payment success
    if (order.mock) {
      await api.post('/payments/verify', {
        booking_id:          bId,
        razorpay_order_id:   order.order_id,
        razorpay_payment_id: 'pay_mock_' + Date.now(),
        razorpay_signature:  'mock_signature',
      });
      setStep(4);
      onSuccess?.({ paid: true });
      return;
    }

    const options = {
      key:      order.key_id,
      amount:   order.amount,
      currency: order.currency,
      name:     'MediChain',
      description: `${item.item_name} — ${date} ${slot}`,
      order_id: order.order_id,
      handler:  async (response) => {
        try {
          await api.post('/payments/verify', {
            booking_id:          bId,
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
          });
          setStep(4);
          onSuccess?.({ paid: true });
        } catch {
          setError('Payment succeeded but verification failed. Contact support.');
        }
      },
      prefill: { name: user.name, email: user.email },
      theme:   { color: '#00d4ff' },
      modal:   { ondismiss: () => setLoading(false) },
    };

    new window.Razorpay(options).open();
  }

  return (
    <Overlay onClose={onClose}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* Doctor/item info banner */}
        <div style={{ background: 'linear-gradient(135deg,rgba(0,212,255,0.12),rgba(139,92,246,0.08))', borderRadius: '16px 16px 0 0', padding: '16px 20px', borderBottom: '1px solid rgba(0,212,255,0.1)', display: 'flex', alignItems: 'center', gap: 12 }}>
          {item.avatar && <img src={item.avatar} alt="" style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid rgba(0,212,255,0.3)' }} />}
          {!item.avatar && <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#00d4ff,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏥</div>}
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>{item.item_name}</div>
            <div style={{ fontSize: 12, color: '#00d4ff' }}>{item.sub_item || item.location || ''}</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#10b981' }}>₹{item.amount}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>consultation fee</div>
          </div>
        </div>

        {/* Step content */}
        <div style={{ background: 'rgba(5,10,20,0.98)', borderRadius: '0 0 16px 16px', padding: '24px 24px 20px' }}>
          {step === 1 && <Step1 />}
          {step === 2 && <Step2 />}
          {step === 4 && <Step3 paid={payMode === 'online'} />}
        </div>
      </div>
    </Overlay>
  );
}

// ─── Reusable helpers ─────────────────────────────────────────────────────────
function Overlay({ children, onClose }) {
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px', animation: 'medibot-slide-up 0.2s ease',
      }}>
      {children}
    </div>
  );
}

function ModalHeader({ title, step, total, onClose }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
      <div>
        <div style={{ fontSize: 17, fontWeight: 800, color: '#e2e8f0' }}>{title}</div>
        <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>Step {step} of {total}</div>
      </div>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 4 }}>✕</button>
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>{label}</div>
      {children}
    </div>
  );
}
