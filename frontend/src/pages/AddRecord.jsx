import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

const RECORD_TYPES = ['Consultation', 'Lab Report', 'Prescription', 'Imaging', 'Vaccination', 'Surgery', 'General'];

export default function AddRecord() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    patient_email: '', record_type: 'Consultation', title: '',
    description: '', diagnosis: '', prescription: '', notes: '', hospital: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { data } = await api.post('/records', form);
      setSuccess(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add record');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="page" style={{ maxWidth: '680px' }}>
        <div className="glass fadeUp" style={{ padding: '52px', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#e2e8f0', marginBottom: '12px' }}>
            Record Added & Anchored!
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: '28px', lineHeight: 1.6 }}>
            The medical record has been saved and cryptographically sealed in the blockchain.
          </p>
          <div style={{
            background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: '12px', padding: '20px', marginBottom: '28px', textAlign: 'left',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ color: '#94a3b8', fontSize: '13px' }}>Block Index</span>
              <span style={{ color: '#00d4ff', fontWeight: 700 }}>#{success.block_index}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8', fontSize: '13px' }}>Block Hash</span>
              <span style={{ color: '#94a3b8', fontSize: '11px', fontFamily: 'monospace' }}>
                {success.block_hash?.slice(0, 16)}...
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => { setSuccess(null); setForm({ patient_email: '', record_type: 'Consultation', title: '', description: '', diagnosis: '', prescription: '', notes: '', hospital: '' }); }}
              className="btn btn-ghost">+ Add Another</button>
            <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: '780px' }}>
      <div className="ph">
        <h1>📝 Add Medical Record</h1>
        <p>Enter patient details and record information. The record will be blockchain-anchored immediately.</p>
      </div>

      {error && <div className="alert alert-err">⚠️ {error}</div>}

      <div className="glass" style={{ padding: '36px' }}>
        <form onSubmit={handleSubmit}>
          {/* Patient */}
          <h3 style={{ color: '#00d4ff', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>
            👤 Patient Information
          </h3>
          <div className="fg">
            <label className="label">Patient Email Address</label>
            <input id="rec-patient-email" className="input" type="email" placeholder="patient@example.com"
              value={form.patient_email} onChange={e => set('patient_email', e.target.value)} required />
            <span style={{ fontSize: '12px', color: '#475569' }}>The patient must already have a MediChain account</span>
          </div>

          {/* Record Details */}
          <h3 style={{ color: '#00d4ff', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', margin: '28px 0 20px' }}>
            📋 Record Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="fg" style={{ marginBottom: 0 }}>
              <label className="label">Record Type</label>
              <select id="rec-type" className="select" value={form.record_type} onChange={e => set('record_type', e.target.value)}>
                {RECORD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="fg" style={{ marginBottom: 0 }}>
              <label className="label">Hospital / Clinic</label>
              <input id="rec-hospital" className="input" type="text" placeholder="City General Hospital"
                value={form.hospital} onChange={e => set('hospital', e.target.value)} />
            </div>
          </div>
          <div className="fg" style={{ marginTop: '16px' }}>
            <label className="label">Record Title *</label>
            <input id="rec-title" className="input" type="text" placeholder="e.g. Annual Blood Panel Results"
              value={form.title} onChange={e => set('title', e.target.value)} required />
          </div>
          <div className="fg">
            <label className="label">Description</label>
            <textarea id="rec-desc" className="input textarea" placeholder="General description of the visit or test..."
              value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
          <div className="fg">
            <label className="label">Diagnosis</label>
            <textarea id="rec-diagnosis" className="input textarea" placeholder="Clinical findings and diagnosis..."
              value={form.diagnosis} onChange={e => set('diagnosis', e.target.value)} />
          </div>
          <div className="fg">
            <label className="label">Prescription / Treatment</label>
            <textarea id="rec-prescription" className="input textarea" placeholder="Medications, dosage, treatment plan..."
              value={form.prescription} onChange={e => set('prescription', e.target.value)} />
          </div>
          <div className="fg">
            <label className="label">Additional Notes</label>
            <textarea id="rec-notes" className="input textarea" placeholder="Follow-up instructions, referrals..."
              value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>

          <div style={{
            padding: '14px 18px', background: 'rgba(0,212,255,0.07)',
            border: '1px solid rgba(0,212,255,0.18)', borderRadius: '10px',
            fontSize: '13px', color: '#94a3b8', marginBottom: '24px',
          }}>
            ⛓️ This record will be anchored to the blockchain immediately upon submission — it cannot be deleted or altered.
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Link to="/dashboard" className="btn btn-ghost">Cancel</Link>
            <button id="rec-submit" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spin" /> Saving & Anchoring...</> : '⛓️ Save to Blockchain →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
