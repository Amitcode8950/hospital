import { useState, useEffect } from 'react';
import api from '../api/axios';

const TYPE_COLOR = {
  record:    { color: '#00d4ff', bg: 'rgba(0,212,255,0.1)',  border: 'rgba(0,212,255,0.25)', icon: '🩺' },
  booking:   { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', icon: '📅' },
  cancelled: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.25)',  icon: '❌' },
  vitals:    { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.25)', icon: '🫀' },
};

export default function HealthTimeline() {
  const [records,  setRecords]  = useState([]);
  const [bookings, setBookings] = useState([]);
  const [vitals,   setVitals]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all'); // all | records | bookings | vitals

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [r, b, v] = await Promise.all([
        api.get('/records').then(d => d.data).catch(() => []),
        api.get('/bookings').then(d => d.data).catch(() => []),
        api.get('/vitals').then(d => d.data).catch(() => []),
      ]);
      setRecords(r);
      setBookings(b);
      setVitals(v);
    } finally { setLoading(false); }
  }

  // Merge and sort by date descending
  const events = [
    ...records.map(r => ({
      id:       r._id,
      type:     'record',
      date:     r.created_at || r.createdAt,
      title:    r.diagnosis,
      subtitle: `Dr. prescribed: ${r.prescription || 'See notes'}`,
      extra:    r.notes?.slice(0, 80),
      link:     `/record/${r._id}`,
    })),
    ...bookings.map(b => ({
      id:       b._id,
      type:     b.status === 'cancelled' ? 'cancelled' : 'booking',
      date:     b.date + 'T00:00:00',
      title:    b.item_name,
      subtitle: `${b.type === 'lab' ? '🔬 Lab Test' : b.type === 'procedure' ? '🏥 Procedure' : '🩺 Appointment'} · ${b.time_slot}`,
      extra:    `₹${b.amount} · ${b.payment_status === 'paid' ? '💳 Paid' : b.payment_status === 'cod' ? '💵 Cash' : '⏳ Pending'}`,
      link:     '/my-bookings',
    })),
    ...vitals.map(v => {
      const readingParts = [];
      if (v.blood_pressure_sys) readingParts.push(`BP ${v.blood_pressure_sys}/${v.blood_pressure_dia}`);
      if (v.blood_sugar)        readingParts.push(`Sugar ${v.blood_sugar} mg/dL`);
      if (v.heart_rate)         readingParts.push(`HR ${v.heart_rate} bpm`);
      if (v.weight)             readingParts.push(`Weight ${v.weight} kg`);
      if (v.spo2)               readingParts.push(`SpO₂ ${v.spo2}%`);
      return {
        id:       v._id,
        type:     'vitals',
        date:     v.date + 'T' + (v.time || '00:00'),
        title:    'Vitals Reading',
        subtitle: readingParts.slice(0, 3).join(' · ') || 'No values recorded',
        extra:    v.notes,
        link:     '/vitals',
      };
    }),
  ]
    .filter(e => filter === 'all' || e.type === filter || (filter === 'bookings' && e.type === 'cancelled'))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Group by month
  const grouped = events.reduce((acc, ev) => {
    const d    = new Date(ev.date);
    const key  = `${d.toLocaleString('en-IN', { month: 'long' })} ${d.getFullYear()}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(ev);
    return acc;
  }, {});

  const counts = {
    all:      events.length,
    records:  records.length,
    bookings: bookings.length,
    vitals:   vitals.length,
  };

  return (
    <div className="page">
      <div className="ph">
        <h1>📜 Health Timeline</h1>
        <p>Your complete medical history — records, appointments, and vitals in one view.</p>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        {[
          { key: 'all',      label: `All (${counts.all})`,                 icon: '🗂️' },
          { key: 'record',   label: `Records (${counts.records})`,         icon: '🩺' },
          { key: 'bookings', label: `Appointments (${counts.bookings})`,   icon: '📅' },
          { key: 'vitals',   label: `Vitals (${counts.vitals})`,           icon: '🫀' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={filter === f.key ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}>
            {f.icon} {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><span className="spin" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>
      ) : events.length === 0 ? (
        <div className="glass" style={{ padding: '56px', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📜</div>
          <h2 style={{ color: '#e2e8f0', marginBottom: 8 }}>No events yet</h2>
          <p style={{ color: '#94a3b8' }}>Your health history will appear here once you book appointments or add records.</p>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          {/* Vertical timeline line */}
          <div style={{ position: 'absolute', left: 18, top: 0, bottom: 0, width: 2, background: 'rgba(0,212,255,0.15)', borderRadius: 2 }} />

          {Object.entries(grouped).map(([month, evts]) => (
            <div key={month} style={{ marginBottom: 32 }}>
              {/* Month label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(0,212,255,0.1)', border: '2px solid rgba(0,212,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0, zIndex: 1 }}>🗓️</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#00d4ff', textTransform: 'uppercase', letterSpacing: 1 }}>{month}</div>
              </div>

              {evts.map(ev => {
                const c  = TYPE_COLOR[ev.type] || TYPE_COLOR.record;
                const dt = new Date(ev.date);
                const dayStr = dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
                const timeStr = ev.date.includes('T') ? dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';

                return (
                  <div key={ev.id} style={{ display: 'flex', gap: 16, marginBottom: 14, marginLeft: 0, paddingLeft: 0 }}>
                    {/* Dot */}
                    <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: c.bg, border: `2px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, zIndex: 1 }}>
                        {c.icon}
                      </div>
                    </div>

                    {/* Card */}
                    <a href={ev.link} style={{ textDecoration: 'none', flex: 1 }}
                      onClick={e => { if (ev.link.startsWith('/')) { e.preventDefault(); window.location = ev.link; } }}>
                      <div className="glass card-hover" style={{ padding: '14px 18px', borderLeft: `3px solid ${c.border}`, transition: 'all 0.2s' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 2 }}>{ev.title}</div>
                            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: ev.extra ? 4 : 0 }}>{ev.subtitle}</div>
                            {ev.extra && <div style={{ fontSize: 11, color: '#64748b', fontStyle: 'italic' }}>{ev.extra}</div>}
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: 12, color: '#64748b' }}>{dayStr}</div>
                            {timeStr && <div style={{ fontSize: 11, color: '#475569' }}>{timeStr}</div>}
                            <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 700, background: c.bg, border: `1px solid ${c.border}`, color: c.color, marginTop: 4, display: 'inline-block' }}>
                              {ev.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </a>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
