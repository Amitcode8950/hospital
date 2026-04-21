import { useState } from 'react';

export default function DiagnosisCompare() {
  const [diagnoses, setDiagnoses] = useState([
    { doctor: '', hospital: '', diagnosis: '', confidence: '', recommendation: '', tests: '', date: '' },
    { doctor: '', hospital: '', diagnosis: '', confidence: '', recommendation: '', tests: '', date: '' },
  ]);
  const [compared, setCompared] = useState(false);
  const [notes, setNotes] = useState('');

  const set = (i, k, v) => setDiagnoses(prev => prev.map((d, idx) => idx === i ? { ...d, [k]: v } : d));

  const agree = () => {
    const d = diagnoses.filter(d => d.diagnosis.trim());
    if (d.length < 2) return null;
    return d[0].diagnosis.toLowerCase().includes(d[1].diagnosis.toLowerCase()) ||
      d[1].diagnosis.toLowerCase().includes(d[0].diagnosis.toLowerCase());
  };

  const agreement = agree();
  const COLORS = ['#00d4ff', '#8b5cf6', '#10b981'];
  const ICONS  = ['🩺', '👨‍⚕️', '🔬'];

  return (
    <div className="page" style={{ maxWidth: '1000px' }}>
      <div className="ph">
        <h1>🔄 Diagnosis Comparator</h1>
        <p>Got conflicting opinions from different doctors? Compare them side by side to make a confident, informed decision.</p>
      </div>

      {/* Agreement banner */}
      {compared && diagnoses.filter(d => d.diagnosis).length >= 2 && (
        <div style={{
          padding: '20px 24px', marginBottom: '24px', borderRadius: '14px',
          background: agreement === true ? 'rgba(16,185,129,0.12)' : agreement === false ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
          border: `1px solid ${agreement === true ? 'rgba(16,185,129,0.35)' : agreement === false ? 'rgba(239,68,68,0.35)' : 'rgba(245,158,11,0.35)'}`,
          display: 'flex', gap: '16px', alignItems: 'center',
        }}>
          <div style={{ fontSize: '36px' }}>{agreement === true ? '✅' : agreement === false ? '⚠️' : '❓'}</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '17px', color: '#e2e8f0' }}>
              {agreement === true ? 'Diagnoses appear to agree' : agreement === false ? 'Conflicting diagnoses detected' : 'Unable to determine agreement'}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
              {agreement === true
                ? 'Both doctors reached similar conclusions. You can proceed with the shared treatment plan.'
                : agreement === false
                ? 'The diagnoses differ. Consider seeking a third specialist opinion before proceeding with treatment.'
                : 'Fill in more details to analyse agreement between opinions.'}
            </div>
          </div>
        </div>
      )}

      {/* Diagnosis inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${diagnoses.length}, 1fr)`, gap: '16px', marginBottom: '24px' }}>
        {diagnoses.map((d, i) => (
          <div key={i} className="glass" style={{ padding: '22px', borderTop: `3px solid ${COLORS[i]}` }}>
            <h3 style={{ color: COLORS[i], fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
              {ICONS[i]} Opinion {i + 1}
            </h3>
            {[
              ['Doctor / Specialist', 'doctor', 'Dr. Name', 'text'],
              ['Hospital / Clinic', 'hospital', 'Hospital name', 'text'],
              ['Date', 'date', '', 'date'],
            ].map(([label, key, ph, type]) => (
              <div key={key} className="fg">
                <label className="label">{label}</label>
                <input className="input" type={type} placeholder={ph} value={d[key]} onChange={e => set(i, key, e.target.value)} />
              </div>
            ))}
            <div className="fg">
              <label className="label">Diagnosis *</label>
              <textarea className="input textarea" rows={3} placeholder="Enter the diagnosis given..." value={d.diagnosis} onChange={e => set(i, 'diagnosis', e.target.value)} />
            </div>
            <div className="fg">
              <label className="label">Recommended Treatment</label>
              <textarea className="input textarea" rows={2} placeholder="Medications, surgery, therapy..." value={d.recommendation} onChange={e => set(i, 'recommendation', e.target.value)} />
            </div>
            <div className="fg">
              <label className="label">Tests Ordered</label>
              <input className="input" placeholder="MRI, Blood test, CT Scan..." value={d.tests} onChange={e => set(i, 'tests', e.target.value)} />
            </div>
            <div className="fg" style={{ marginBottom: 0 }}>
              <label className="label">Doctor's Confidence</label>
              <select className="select" value={d.confidence} onChange={e => set(i, 'confidence', e.target.value)}>
                <option value="">Not stated</option>
                <option value="High">High</option>
                <option value="Moderate">Moderate</option>
                <option value="Low">Low</option>
                <option value="Needs more tests">Needs more tests</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <button onClick={() => setCompared(true)} className="btn btn-primary">
          🔄 Compare Opinions
        </button>
        {diagnoses.length < 3 && (
          <button onClick={() => setDiagnoses(d => [...d, { doctor: '', hospital: '', diagnosis: '', confidence: '', recommendation: '', tests: '', date: '' }])}
            className="btn btn-ghost">
            + Add 3rd Opinion
          </button>
        )}
        <button onClick={() => { setDiagnoses([{ doctor: '', hospital: '', diagnosis: '', confidence: '', recommendation: '', tests: '', date: '' }, { doctor: '', hospital: '', diagnosis: '', confidence: '', recommendation: '', tests: '', date: '' }]); setCompared(false); setNotes(''); }}
          className="btn btn-ghost">
          🗑️ Clear
        </button>
      </div>

      {/* Side by side comparison */}
      {compared && (
        <div className="glass fadeUp" style={{ padding: '24px', marginBottom: '20px' }}>
          <h3 style={{ color: '#e2e8f0', marginBottom: '16px', fontSize: '16px', fontWeight: 700 }}>📊 Side-by-Side Comparison</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Aspect</th>
                  {diagnoses.map((_, i) => (
                    <th key={i} style={{ padding: '12px 16px', textAlign: 'left', color: COLORS[i], fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {ICONS[i]} Opinion {i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Doctor', 'doctor'],
                  ['Hospital', 'hospital'],
                  ['Diagnosis', 'diagnosis'],
                  ['Treatment', 'recommendation'],
                  ['Tests', 'tests'],
                  ['Confidence', 'confidence'],
                  ['Date', 'date'],
                ].map(([label, key]) => (
                  <tr key={key} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>{label}</td>
                    {diagnoses.map((d, i) => (
                      <td key={i} style={{ padding: '12px 16px', color: '#e2e8f0', fontSize: '14px' }}>
                        {d[key] || <span style={{ color: '#475569' }}>—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Personal notes */}
      <div className="glass" style={{ padding: '22px' }}>
        <label className="label">📝 Your Personal Notes / Questions for Next Visit</label>
        <textarea className="input textarea" rows={4}
          placeholder="Write down questions to ask your doctor, things that concern you, lifestyle changes suggested..."
          value={notes} onChange={e => setNotes(e.target.value)} />
        <p style={{ fontSize: '12px', color: '#475569', marginTop: '8px' }}>
          💡 Tip: Print or screenshot this page before your next consultation.
        </p>
      </div>

      <div className="alert alert-info" style={{ marginTop: '20px' }}>
        ⚠️ This tool helps you <strong>organise and compare</strong> medical opinions. It is <strong>not medical advice</strong>. Always follow a qualified doctor's guidance. Consider a third specialist opinion for critical conditions.
      </div>
    </div>
  );
}
