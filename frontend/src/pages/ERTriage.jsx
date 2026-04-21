import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const SEVERITY = {
  1: { label: 'Critical',   color: '#ef4444', bg: 'rgba(239,68,68,0.15)',   icon: '🚨' },
  2: { label: 'Severe',     color: '#f97316', bg: 'rgba(249,115,22,0.15)',  icon: '🔴' },
  3: { label: 'Moderate',   color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', icon: '🟡' },
  4: { label: 'Minor',      color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', icon: '🔵' },
  5: { label: 'Non-Urgent', color: '#10b981', bg: 'rgba(16,185,129,0.15)', icon: '🟢' },
};

const STATUSES = ['Waiting', 'In Treatment', 'Stable', 'Discharged', 'Transferred'];

export default function ERTriage() {
  const user = JSON.parse(localStorage.getItem('medichain_user') || '{}');
  const [patients, setPatients] = useState([]);
  const [stats, setStats]       = useState({});
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', age: '', gender: 'Male', condition: '', chief_complaint: '', severity: 3, bp: '', pulse: '', spo2: '', temperature: '', assigned_doctor: '', room: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError]  = useState('');

  const load = useCallback(async () => {
    try {
      const [pRes, sRes] = await Promise.all([api.get('/er/patients'), api.get('/er/stats')]);
      setPatients(pRes.data); setStats(sRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, [load]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleAdmit(e) {
    e.preventDefault(); setSaving(true); setError('');
    try {
      await api.post('/er/patients', {
        ...form, age: Number(form.age), severity: Number(form.severity),
        vitals: { bp: form.bp, pulse: Number(form.pulse), spo2: Number(form.spo2), temperature: Number(form.temperature) },
      });
      setShowForm(false);
      setForm({ name: '', age: '', gender: 'Male', condition: '', chief_complaint: '', severity: 3, bp: '', pulse: '', spo2: '', temperature: '', assigned_doctor: '', room: '' });
      load();
    } catch (err) { setError(err.response?.data?.message || 'Failed to admit'); }
    finally { setSaving(false); }
  }

  async function updateStatus(id, status) {
    try { await api.put(`/er/patients/${id}`, { status }); load(); }
    catch (e) { console.error(e); }
  }

  return (
    <div className="page">
      <div className="ph" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-start' }}>
        <div>
          <h1>🚑 ER Triage System</h1>
          <p>Real-time emergency patient prioritization — critical cases always first.</p>
        </div>
        {user.role === 'doctor' && (
          <button onClick={() => setShowForm(v => !v)} className="btn btn-primary">
            {showForm ? '✕ Cancel' : '+ Admit Patient'}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="g4" style={{ marginBottom: '28px' }}>
        {[
          { icon: '⏳', label: 'Waiting', value: stats.waiting ?? '—', color: '#f59e0b' },
          { icon: '💉', label: 'In Treatment', value: stats.inTreatment ?? '—', color: '#00d4ff' },
          { icon: '🚨', label: 'Critical', value: stats.criticals ?? '—', color: '#ef4444' },
          { icon: '✅', label: 'Discharged Today', value: stats.discharged_today ?? '—', color: '#10b981' },
        ].map(s => (
          <div key={s.label} className="glass" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ fontSize: '24px' }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Admit form */}
      {showForm && (
        <div className="glass fadeUp" style={{ padding: '28px', marginBottom: '28px' }}>
          <h3 style={{ color: '#e2e8f0', marginBottom: '20px', fontSize: '16px', fontWeight: 700 }}>🏥 Admit New Patient</h3>
          {error && <div className="alert alert-err" style={{ marginBottom: '16px' }}>⚠️ {error}</div>}
          <form onSubmit={handleAdmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div className="fg" style={{ marginBottom: 0 }}>
                <label className="label">Name *</label>
                <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Patient name" />
              </div>
              <div className="fg" style={{ marginBottom: 0 }}>
                <label className="label">Age</label>
                <input className="input" type="number" value={form.age} onChange={e => set('age', e.target.value)} placeholder="Years" />
              </div>
              <div className="fg" style={{ marginBottom: 0 }}>
                <label className="label">Gender</label>
                <select className="select" value={form.gender} onChange={e => set('gender', e.target.value)}>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
            </div>
            <div className="fg" style={{ marginBottom: '12px' }}>
              <label className="label">Chief Complaint / Condition *</label>
              <input className="input" value={form.condition} onChange={e => set('condition', e.target.value)} required placeholder="e.g. Chest pain, Head trauma, Difficulty breathing" />
            </div>
            <div className="fg" style={{ marginBottom: '16px' }}>
              <label className="label">🚨 Severity Level</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[1,2,3,4,5].map(n => (
                  <button type="button" key={n}
                    onClick={() => set('severity', n)}
                    style={{ padding: '8px 16px', borderRadius: '8px', border: `2px solid ${form.severity === n ? SEVERITY[n].color : 'rgba(255,255,255,0.1)'}`, background: form.severity === n ? SEVERITY[n].bg : 'transparent', color: SEVERITY[n].color, cursor: 'pointer', fontWeight: 700, fontSize: '13px', transition: 'all 0.2s' }}>
                    {SEVERITY[n].icon} {SEVERITY[n].label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              {[['BP', 'bp', '120/80'], ['Pulse', 'pulse', '72'], ['SpO2 %', 'spo2', '98'], ['Temp °C', 'temperature', '37']].map(([label, key, ph]) => (
                <div key={key} className="fg" style={{ marginBottom: 0 }}>
                  <label className="label">{label}</label>
                  <input className="input" value={form[key]} onChange={e => set(key, e.target.value)} placeholder={ph} />
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              {[['Assigned Doctor', 'assigned_doctor', 'Dr. Name'], ['Room / Bay', 'room', 'Bay 3']].map(([label, key, ph]) => (
                <div key={key} className="fg" style={{ marginBottom: 0 }}>
                  <label className="label">{label}</label>
                  <input className="input" value={form[key]} onChange={e => set(key, e.target.value)} placeholder={ph} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost">Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <><span className="spin" /> Admitting...</> : '🚑 Admit Patient'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Patient Queue */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px' }}><span className="spin" style={{ width: '32px', height: '32px', borderWidth: '3px' }} /></div>
      ) : patients.length === 0 ? (
        <div className="glass" style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '56px', marginBottom: '12px' }}>✅</div>
          <h3 style={{ color: '#e2e8f0' }}>ER is clear</h3>
          <p style={{ color: '#94a3b8' }}>No active patients in queue. Log in as a doctor to admit patients.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ color: '#475569', fontSize: '13px' }}>Sorted by severity (critical first), then arrival time</p>
          {patients.map((p, i) => {
            const sev = SEVERITY[p.severity];
            const wait = p.wait_minutes;
            return (
              <div key={p._id} className="glass" style={{ padding: '20px 24px', borderLeft: `4px solid ${sev.color}`, display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ background: sev.bg, border: `1px solid ${sev.color}50`, borderRadius: '10px', padding: '8px 14px', textAlign: 'center', minWidth: '90px' }}>
                  <div style={{ fontSize: '20px' }}>{sev.icon}</div>
                  <div style={{ color: sev.color, fontSize: '11px', fontWeight: 700 }}>{sev.label}</div>
                  <div style={{ color: '#475569', fontSize: '10px' }}>Priority {p.severity}</div>
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <h3 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '16px' }}>{p.name}</h3>
                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>{p.age}{p.age ? 'y' : ''} {p.gender}</span>
                    <span className={`badge ${p.status === 'In Treatment' ? 'badge-blue' : p.status === 'Stable' ? 'badge-green' : 'badge-yellow'}`}>{p.status}</span>
                  </div>
                  <div style={{ color: '#e2e8f0', fontSize: '14px', marginBottom: '6px' }}>{p.condition}</div>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px', color: '#475569' }}>
                    {p.vitals?.bp    && <span>BP: {p.vitals.bp}</span>}
                    {p.vitals?.pulse && <span>Pulse: {p.vitals.pulse}</span>}
                    {p.vitals?.spo2  && <span>SpO₂: {p.vitals.spo2}%</span>}
                    {p.assigned_doctor && <span>👨‍⚕️ {p.assigned_doctor}</span>}
                    {p.room          && <span>🚪 {p.room}</span>}
                    <span style={{ color: wait > 30 ? '#ef4444' : '#f59e0b' }}>⏱ {wait}m waiting</span>
                  </div>
                </div>
                {user.role === 'doctor' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {STATUSES.filter(s => s !== p.status).slice(0, 3).map(s => (
                      <button key={s} onClick={() => updateStatus(p._id, s)}
                        className="btn btn-ghost btn-sm" style={{ fontSize: '12px', padding: '4px 10px' }}>
                        → {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
