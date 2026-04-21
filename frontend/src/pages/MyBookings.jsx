import { useState, useEffect } from 'react';
import api from '../api/axios';

const STATUS_COLORS = {
  confirmed: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)',  color: '#10b981', label: '✅ Confirmed' },
  cancelled:  { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)',   color: '#ef4444', label: '❌ Cancelled' },
  completed:  { bg: 'rgba(0,212,255,0.1)',   border: 'rgba(0,212,255,0.25)',  color: '#00d4ff', label: '✔ Completed' },
};

const PAY_COLORS = {
  paid:    { color: '#10b981', label: '💳 Paid Online' },
  cod:     { color: '#f59e0b', label: '💵 Pay at Visit' },
  pending: { color: '#f59e0b', label: '⏳ Payment Pending' },
  failed:  { color: '#ef4444', label: '❌ Payment Failed' },
};

const TYPE_ICONS = { doctor: '🩺', lab: '🔬', procedure: '🏥' };
const TYPE_LABELS = { doctor: 'Doctor Consultation', lab: 'Lab / Diagnostic Test', procedure: 'Hospital Procedure' };

/* ─── Booking Detail Modal ──────────────────────────────────────────────────── */
function BookingDetailModal({ booking: b, onClose, onCancel, cancelling }) {
  if (!b) return null;

  const sc = STATUS_COLORS[b.status] || STATUS_COLORS.confirmed;
  const pc = PAY_COLORS[b.payment_status] || PAY_COLORS.pending;
  const bookingDate = new Date(b.date + 'T00:00:00');
  const isUpcoming  = b.status === 'confirmed';
  const isPaid      = b.payment_status === 'paid';

  const InfoRow = ({ icon, label, value }) => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 14, color: '#e2e8f0', fontWeight: 600 }}>{value}</div>
      </div>
    </div>
  );

  return (
    /* Backdrop */
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, animation: 'medibot-slide-up 0.25s ease',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 500,
        background: 'linear-gradient(160deg,#0d1929 0%,#050a14 100%)',
        border: '1px solid rgba(0,212,255,0.15)',
        borderRadius: 20, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        maxHeight: '92vh',
      }}>

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg,rgba(0,212,255,0.14),rgba(139,92,246,0.10))',
          padding: '20px 24px', borderBottom: '1px solid rgba(0,212,255,0.1)',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'linear-gradient(135deg,#00d4ff,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, flexShrink: 0,
          }}>
            {TYPE_ICONS[b.type] || '📋'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#e2e8f0', lineHeight: 1.3 }}>{b.item_name}</div>
            <div style={{ fontSize: 12, color: '#00d4ff', marginTop: 2 }}>{b.sub_item || TYPE_LABELS[b.type] || b.type}</div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 18, width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >✕</button>
        </div>

        {/* ── Status banner ─────────────────────────────────────────────────── */}
        <div style={{
          background: sc.bg, borderBottom: `1px solid ${sc.border}`,
          padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: sc.color }}>{sc.label}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: pc.color }}>{pc.label}</span>
        </div>

        {/* ── Scrollable detail body ─────────────────────────────────────────── */}
        <div style={{ overflowY: 'auto', padding: '4px 24px 8px', flex: 1 }}>

          {/* Amount highlight */}
          <div style={{
            margin: '16px 0 4px', background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 14, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: 11, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Amount</div>
              <div style={{ fontSize: 32, fontWeight: 900, color: '#10b981', lineHeight: 1.2 }}>₹{b.amount?.toLocaleString()}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Booking ID</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#8b5cf6', fontFamily: 'monospace' }}>
                #{b._id?.slice(-8).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Info rows */}
          <div style={{ marginTop: 8 }}>
            <InfoRow icon="🗓️" label="Appointment Date"
              value={bookingDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} />
            <InfoRow icon="⏰" label="Time Slot" value={b.time_slot} />
            {b.location && <InfoRow icon="🏥" label="Location" value={b.location} />}
            {b.city     && <InfoRow icon="📍" label="City"     value={b.city} />}
            <InfoRow icon={TYPE_ICONS[b.type] || '📋'} label="Type" value={TYPE_LABELS[b.type] || b.type} />
            <InfoRow icon="💳" label="Payment Method" value={b.payment_status === 'paid' ? 'Paid Online (Card / UPI / Wallet)' : 'Pay at Visit / COD'} />
            {b.notes && <InfoRow icon="📝" label="Notes" value={b.notes} />}
          </div>

          {/* Booking meta */}
          <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, fontSize: 12, color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
            <span>Booked on: {b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN') : 'N/A'}</span>
            <span style={{ textTransform: 'capitalize' }}>Status: <span style={{ color: sc.color }}>{b.status}</span></span>
          </div>
        </div>

        {/* ── Bottom action buttons ──────────────────────────────────────────── */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(5,10,20,0.95)',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>

          {/* Primary CTA row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>

            {/* View My Bookings */}
            <a
              href="/my-bookings"
              onClick={onClose}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '11px 14px', borderRadius: 12,
                background: 'linear-gradient(135deg,#00d4ff,#0ea5e9)',
                border: 'none', color: '#050a14', fontSize: 13, fontWeight: 700,
                cursor: 'pointer', textDecoration: 'none', transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              📋 My Bookings
            </a>

            {/* Download Receipt — only if paid */}
            {isPaid ? (
              <a
                href={`http://localhost:8000/api/payments/receipt/${b._id}`}
                target="_blank" rel="noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '11px 14px', borderRadius: 12,
                  background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
                  color: '#10b981', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', textDecoration: 'none', transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.22)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.12)'}
              >
                🧾 Receipt
              </a>
            ) : (
              /* Share/Add to Calendar placeholder */
              <button
                onClick={() => {
                  const text = `📅 Appointment: ${b.item_name}\n🗓️ ${bookingDate.toDateString()} ⏰ ${b.time_slot}\n🏥 ${b.location || ''}`;
                  navigator.clipboard?.writeText(text).then(() => alert('Booking details copied!'));
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '11px 14px', borderRadius: 12,
                  background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)',
                  color: '#a78bfa', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.22)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(139,92,246,0.12)'}
              >
                📋 Copy Details
              </button>
            )}
          </div>

          {/* Secondary row */}
          <div style={{ display: 'grid', gridTemplateColumns: isUpcoming ? '1fr 1fr' : '1fr', gap: 10 }}>

            {/* Book Again / New Appointment */}
            <a
              href={b.type === 'doctor' ? '/specialists' : b.type === 'lab' ? '/diagnostics' : '/hospital-pricing'}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '10px 14px', borderRadius: 12,
                background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.2)',
                color: '#00d4ff', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', textDecoration: 'none', transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.14)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,212,255,0.07)'}
            >
              🔄 Book Again
            </a>

            {/* Cancel — only for upcoming */}
            {isUpcoming && (
              <button
                onClick={() => onCancel(b._id)}
                disabled={cancelling === b._id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '10px 14px', borderRadius: 12,
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                  color: '#ef4444', fontSize: 13, fontWeight: 600,
                  cursor: cancelling === b._id ? 'not-allowed' : 'pointer',
                  opacity: cancelling === b._id ? 0.6 : 1,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => { if (cancelling !== b._id) e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; }}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
              >
                {cancelling === b._id ? <><span className="spin" style={{ width: 14, height: 14, borderWidth: 2 }} /> Cancelling...</> : '✕ Cancel Booking'}
              </button>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              padding: '9px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.04)', color: '#475569', fontSize: 13,
              cursor: 'pointer', transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.09)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────────────────── */
export default function MyBookings() {
  const [bookings,    setBookings]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState('all');
  const [cancelling,  setCancelling]  = useState(null);
  const [selected,    setSelected]    = useState(null); // booking detail modal

  useEffect(() => { fetchBookings(); }, []);

  async function fetchBookings() {
    setLoading(true);
    try {
      const { data } = await api.get('/bookings');
      setBookings(data);
    } catch { setBookings([]); }
    finally { setLoading(false); }
  }

  async function cancelBooking(id) {
    if (!confirm('Cancel this booking?')) return;
    setCancelling(id);
    try {
      await api.delete(`/bookings/${id}`);
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
      // Also update selected if it's the same booking
      setSelected(prev => prev?._id === id ? { ...prev, status: 'cancelled' } : prev);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not cancel booking');
    } finally { setCancelling(null); }
  }

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);
  const counts = {
    all:       bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  return (
    <div className="page">
      <div className="ph">
        <h1>📅 My Bookings</h1>
        <p>All your doctor appointments, lab tests, and procedure bookings in one place. <br />
          <span style={{ fontSize: 13, color: '#00d4ff' }}>Tap any booking to see full details and options.</span>
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
        {[
          { key: 'all',       label: `All (${counts.all})` },
          { key: 'confirmed', label: `Upcoming (${counts.confirmed})` },
          { key: 'completed', label: `Completed (${counts.completed})` },
          { key: 'cancelled', label: `Cancelled (${counts.cancelled})` },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={filter === f.key ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}>
            {f.label}
          </button>
        ))}
        <button className="btn btn-ghost btn-sm" onClick={fetchBookings} style={{ marginLeft: 'auto' }}>
          🔄 Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <span className="spin" style={{ width: 36, height: 36, borderWidth: 3 }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass" style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📅</div>
          <h2 style={{ color: '#e2e8f0', marginBottom: 8 }}>No bookings found</h2>
          <p style={{ color: '#94a3b8', marginBottom: 24 }}>
            {filter === 'all' ? "You haven't made any bookings yet." : `No ${filter} bookings.`}
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/specialists"      className="btn btn-primary btn-sm">🩺 Find a Doctor</a>
            <a href="/diagnostics"      className="btn btn-ghost btn-sm">🔬 Book Lab Test</a>
            <a href="/hospital-pricing" className="btn btn-ghost btn-sm">🏥 Hospital Procedure</a>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(b => {
            const sc = STATUS_COLORS[b.status] || STATUS_COLORS.confirmed;
            const pc = PAY_COLORS[b.payment_status] || PAY_COLORS.pending;
            const bookingDate = new Date(b.date + 'T00:00:00');

            return (
              /* ── Clickable booking card ── */
              <div
                key={b._id}
                className="glass"
                onClick={() => setSelected(b)}
                style={{
                  padding: '20px 24px',
                  borderLeft: `3px solid ${sc.border}`,
                  cursor: 'pointer',
                  transition: 'transform 0.18s, box-shadow 0.18s, border-color 0.18s',
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 8px 30px rgba(0,212,255,0.08)`;
                  e.currentTarget.style.borderLeftColor = '#00d4ff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '';
                  e.currentTarget.style.borderLeftColor = sc.border;
                }}
              >
                {/* "Click to view" hint */}
                <div style={{
                  position: 'absolute', top: 10, right: 14, fontSize: 10,
                  color: '#334155', fontWeight: 600, letterSpacing: '0.4px',
                }}>
                  TAP TO VIEW ›
                </div>

                <div className="stack-sm" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  {/* Left — details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 20 }}>{TYPE_ICONS[b.type] || '📋'}</span>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#e2e8f0' }}>{b.item_name}</div>
                        {b.sub_item && <div style={{ fontSize: 12, color: '#00d4ff' }}>{b.sub_item}</div>}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: '#94a3b8', marginBottom: 10 }}>
                      {b.location && <span>🏥 {b.location}</span>}
                      {b.city     && <span>📍 {b.city}</span>}
                    </div>

                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 13, marginBottom: 10 }}>
                      <span style={{ color: '#e2e8f0' }}>
                        🗓️ {bookingDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                      <span style={{ color: '#e2e8f0' }}>⏰ {b.time_slot}</span>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color }}>
                        {sc.label}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: pc.color }}>{pc.label}</span>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa', textTransform: 'capitalize' }}>
                        {b.type}
                      </span>
                    </div>

                    {b.notes && (
                      <div style={{ marginTop: 8, fontSize: 12, color: '#475569', fontStyle: 'italic' }}>
                        📝 {b.notes}
                      </div>
                    )}
                  </div>

                  {/* Right — amount */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981', marginBottom: 4 }}>₹{b.amount}</div>
                    <div style={{ fontSize: 11, color: '#475569' }}>
                      #{b._id.slice(-6).toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats bar */}
      {bookings.length > 0 && (
        <div className="glass g2" style={{ marginTop: 28, padding: '16px 24px', textAlign: 'center' }}>
          {[
            { label: 'Total Spent',    value: `₹${bookings.filter(b => b.payment_status === 'paid').reduce((s, b) => s + b.amount, 0).toLocaleString()}`, icon: '💳' },
            { label: 'COD / At Visit', value: `₹${bookings.filter(b => b.payment_status === 'cod').reduce((s, b) => s + b.amount, 0).toLocaleString()}`, icon: '💵' },
            { label: 'Total Bookings', value: bookings.length, icon: '📋' },
            { label: 'Upcoming',       value: counts.confirmed, icon: '🗓️' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#e2e8f0' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#475569' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Detail Modal */}
      {selected && (
        <BookingDetailModal
          booking={selected}
          onClose={() => setSelected(null)}
          onCancel={async (id) => {
            await cancelBooking(id);
            // If cancelled now, close modal after short delay so user sees the status update
            setTimeout(() => setSelected(null), 800);
          }}
          cancelling={cancelling}
        />
      )}
    </div>
  );
}
