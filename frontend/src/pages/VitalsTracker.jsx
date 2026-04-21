import { useState, useEffect } from 'react';
import api from '../api/axios';

// ── Mini SVG line chart ────────────────────────────────────────────────────────
function MiniChart({ data, color = '#00d4ff', label, unit, normalMin, normalMax }) {
  if (!data || data.length < 2) {
    return (
      <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 11, color: '#475569' }}>Not enough data</span>
      </div>
    );
  }
  const W = 200, H = 56, PAD = 6;
  const vals = data.map(d => d.value).filter(v => v != null);
  const min  = Math.min(...vals) - 5;
  const max  = Math.max(...vals) + 5;
  const scaleX = i => PAD + (i / (data.length - 1)) * (W - PAD * 2);
  const scaleY = v => H - PAD - ((v - min) / (max - min || 1)) * (H - PAD * 2);
  const points = data.map((d, i) => `${scaleX(i)},${scaleY(d.value)}`).join(' ');
  const latest = vals[vals.length - 1];
  const status = normalMin && normalMax
    ? latest < normalMin ? 'low' : latest > normalMax ? 'high' : 'normal'
    : null;
  const statusColor = status === 'normal' ? '#10b981' : status ? '#ef4444' : color;

  return (
    <div style={{ position: 'relative' }}>
      <svg width={W} height={H} style={{ overflow: 'visible' }}>
        {/* Normal range band */}
        {normalMin && normalMax && (
          <rect x={PAD} y={scaleY(normalMax)} width={W - PAD * 2}
            height={scaleY(normalMin) - scaleY(normalMax)}
            fill="rgba(16,185,129,0.08)" rx={2} />
        )}
        {/* Line */}
        <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {/* Dots */}
        {data.map((d, i) => (
          <circle key={i} cx={scaleX(i)} cy={scaleY(d.value)} r={3} fill={color} />
        ))}
        {/* Latest value dot */}
        <circle cx={scaleX(data.length - 1)} cy={scaleY(vals[vals.length - 1])} r={5}
          fill={statusColor} stroke="#050a14" strokeWidth={2} />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontSize: 10, color: '#475569' }}>{data[0]?.date}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: statusColor }}>
          {latest} {unit}
          {status && <span style={{ fontSize: 10, marginLeft: 4 }}>({status})</span>}
        </span>
      </div>
    </div>
  );
}

// ── Vital field config ─────────────────────────────────────────────────────────
const VITALS_META = [
  { key: 'blood_pressure_sys', label: 'Systolic BP',   unit: 'mmHg', color: '#ef4444', icon: '🩸', normalMin: 90,  normalMax: 120, desc: 'Top number of blood pressure' },
  { key: 'blood_pressure_dia', label: 'Diastolic BP',  unit: 'mmHg', color: '#f97316', icon: '🩸', normalMin: 60,  normalMax: 80,  desc: 'Bottom number of blood pressure' },
  { key: 'blood_sugar',        label: 'Blood Sugar',   unit: 'mg/dL', color: '#f59e0b', icon: '🍬', normalMin: 70,  normalMax: 100, desc: 'Fasting blood glucose' },
  { key: 'heart_rate',         label: 'Heart Rate',    unit: 'bpm',  color: '#ec4899', icon: '💗', normalMin: 60,  normalMax: 100, desc: 'Resting heart rate' },
  { key: 'weight',             label: 'Weight',        unit: 'kg',   color: '#8b5cf6', icon: '⚖️', normalMin: null, normalMax: null, desc: 'Body weight' },
  { key: 'temperature',        label: 'Temperature',   unit: '°C',   color: '#06b6d4', icon: '🌡️', normalMin: 36.1, normalMax: 37.2, desc: 'Body temperature' },
  { key: 'spo2',               label: 'SpO₂',          unit: '%',    color: '#10b981', icon: '🫁', normalMin: 95,  normalMax: 100, desc: 'Blood oxygen saturation' },
];

const TODAY = new Date().toISOString().split('T')[0];
const TIME  = new Date().toTimeString().slice(0, 5);

export default function VitalsTracker() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving,   setSaving]  = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState({ date: TODAY, time: TIME, notes: '' });
  const [view, setView] = useState('charts'); // 'charts' | 'log'

  useEffect(() => { fetchEntries(); }, []);

  async function fetchEntries() {
    setLoading(true);
    try { const { data } = await api.get('/vitals'); setEntries(data); }
    catch { setEntries([]); }
    finally { setLoading(false); }
  }

  async function saveEntry(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/vitals', form);
      setShowForm(false);
      setForm({ date: TODAY, time: TIME, notes: '' });
      fetchEntries();
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  }

  async function deleteEntry(id) {
    if (!confirm('Delete this entry?')) return;
    setDeleting(id);
    try { await api.delete(`/vitals/${id}`); setEntries(p => p.filter(e => e._id !== id)); }
    finally { setDeleting(null); }
  }

  // Build chart data per vital (oldest first)
  function chartData(key) {
    return [...entries].reverse()
      .filter(e => e[key] != null)
      .map(e => ({ value: e[key], date: e.date }));
  }

  // Latest values
  const latest = entries[0] || {};

  return (
    <div className="page">
      <div className="ph">
        <h1>🫀 Health Vitals Tracker</h1>
        <p>Track your blood pressure, sugar, heart rate and more. Monitor trends over time.</p>
      </div>

      {/* Header bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['charts', 'log'].map(v => (
            <button key={v} onClick={() => setView(v)}
              className={view === v ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}>
              {v === 'charts' ? '📊 Charts' : '📋 Log'}
            </button>
          ))}
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}>
          ➕ Add Reading
        </button>
      </div>

      {/* Latest reading summary row */}
      {entries.length > 0 && (
        <div className="glass" style={{ padding: '16px 24px', marginBottom: 24, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 12, color: '#475569', fontWeight: 700, textTransform: 'uppercase', alignSelf: 'center', minWidth: 80 }}>
            Latest<br />{latest.date}
          </div>
          {VITALS_META.map(m => latest[m.key] != null && (
            <div key={m.key} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18 }}>{m.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: m.color }}>{latest[m.key]}</div>
              <div style={{ fontSize: 10, color: '#475569' }}>{m.unit}</div>
              <div style={{ fontSize: 10, color: '#64748b' }}>{m.label}</div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><span className="spin" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>
      ) : entries.length === 0 && !showForm ? (
        <div className="glass" style={{ padding: '56px', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🫀</div>
          <h2 style={{ color: '#e2e8f0', marginBottom: 8 }}>No vitals recorded yet</h2>
          <p style={{ color: '#94a3b8', marginBottom: 24 }}>Start tracking your health — blood pressure, sugar, weight, and more.</p>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">➕ Record First Reading</button>
        </div>
      ) : (
        <>
          {/* CHARTS VIEW */}
          {view === 'charts' && (
            <div className="g2">
              {VITALS_META.map(m => {
                const cd = chartData(m.key);
                return (
                  <div key={m.key} className="glass" style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>{m.icon} {m.label}</div>
                        <div style={{ fontSize: 11, color: '#475569' }}>{m.desc}</div>
                      </div>
                      {m.normalMin && <div style={{ fontSize: 11, color: '#64748b', textAlign: 'right' }}>
                        Normal<br /><span style={{ color: '#10b981', fontWeight: 600 }}>{m.normalMin}–{m.normalMax} {m.unit}</span>
                      </div>}
                    </div>
                    <MiniChart data={cd} color={m.color} unit={m.unit} normalMin={m.normalMin} normalMax={m.normalMax} />
                  </div>
                );
              })}
            </div>
          )}

          {/* LOG VIEW */}
          {view === 'log' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {entries.map(e => (
                <div key={e._id} className="glass" style={{ padding: '16px 22px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ flexShrink: 0, textAlign: 'center', minWidth: 60 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{e.date}</div>
                    {e.time && <div style={{ fontSize: 11, color: '#475569' }}>{e.time}</div>}
                  </div>
                  <div style={{ flex: 1, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                    {VITALS_META.map(m => e[m.key] != null && (
                      <div key={m.key} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: m.color }}>{e[m.key]}</div>
                        <div style={{ fontSize: 10, color: '#475569' }}>{m.unit}</div>
                        <div style={{ fontSize: 10, color: '#64748b' }}>{m.icon}</div>
                      </div>
                    ))}
                    {e.notes && <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic', flex: 1 }}>📝 {e.notes}</div>}
                  </div>
                  <button onClick={() => deleteEntry(e._id)} disabled={deleting === e._id}
                    style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 16, padding: 4 }}>
                    {deleting === e._id ? '...' : '🗑️'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Add Reading Modal ────────────────────────────────────────────── */}
      {showForm && (
        <div onClick={e => e.target === e.currentTarget && setShowForm(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ width: '100%', maxWidth: 520, background: 'rgba(5,10,20,0.98)', borderRadius: 20, border: '1px solid rgba(0,212,255,0.2)', padding: '28px 28px 24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#e2e8f0' }}>🫀 Add Vitals Reading</div>
                <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>Fill any fields you have measured today</div>
              </div>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 20 }}>✕</button>
            </div>

            <form onSubmit={saveEntry}>
              {/* Date + time row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div className="fg" style={{ marginBottom: 0 }}>
                  <label className="label">Date *</label>
                  <input className="input" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} required />
                </div>
                <div className="fg" style={{ marginBottom: 0 }}>
                  <label className="label">Time</label>
                  <input className="input" type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} />
                </div>
              </div>

              {/* Vitals grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                {VITALS_META.map(m => (
                  <div key={m.key} className="fg" style={{ marginBottom: 0 }}>
                    <label className="label">{m.icon} {m.label} ({m.unit})</label>
                    <input className="input" type="number" step="0.1" placeholder={m.normalMin ? `Normal: ${m.normalMin}–${m.normalMax}` : 'Enter value'}
                      value={form[m.key] || ''} onChange={e => setForm(p => ({ ...p, [m.key]: e.target.value }))} />
                  </div>
                ))}
              </div>

              <div className="fg" style={{ marginBottom: 20 }}>
                <label className="label">Notes (optional)</label>
                <textarea className="input" rows={2} placeholder="Any symptoms, medications taken, or context..."
                  value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} style={{ resize: 'none' }} />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn btn-primary btn-full" disabled={saving}>
                  {saving ? <><span className="spin" /> Saving...</> : '💾 Save Reading'}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
