import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

export default function ShareView() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/records/share/${token}`)
      .then(r => setData(r.data))
      .catch(err => setError(err.response?.data?.message || 'Invalid or expired share link'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span className="spin" style={{ width: '36px', height: '36px', borderWidth: '3px' }} />
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px' }}>
      <div style={{ fontSize: '56px', marginBottom: '16px' }}>🔒</div>
      <h1 style={{ color: '#e2e8f0', marginBottom: '10px' }}>Access Denied</h1>
      <p style={{ color: '#94a3b8', marginBottom: '24px' }}>{error}</p>
      <Link to="/" className="btn btn-primary">Go to MediChain →</Link>
    </div>
  );

  const date = new Date(data.created_at).toLocaleDateString('en-US', { dateStyle: 'long' });
  const Section = ({ label, value }) => value ? (
    <div style={{ marginBottom: '18px' }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '15px', color: '#e2e8f0', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{value}</div>
    </div>
  ) : null;

  return (
    <div style={{ minHeight: '100vh', padding: '40px 24px', maxWidth: '720px', margin: '0 auto' }}>
      {/* Header */}
      <div className="glass" style={{ padding: '20px 28px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '20px' }}>🏥</span>
          <span style={{ fontWeight: 800, fontSize: '18px', color: '#00d4ff' }}>MediChain</span>
        </div>
        <span className="badge badge-yellow">🔗 Shared Record — Read Only</span>
      </div>

      <div className="glass fadeUp" style={{ padding: '36px' }}>
        <div style={{ marginBottom: '24px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {data.record_type}
          </span>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#e2e8f0', marginTop: '8px', marginBottom: '10px' }}>{data.title}</h1>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14px', color: '#94a3b8' }}>👨‍⚕️ Dr. {data.doctor_name}</span>
            {data.hospital && <span style={{ fontSize: '14px', color: '#94a3b8' }}>🏥 {data.hospital}</span>}
            <span style={{ fontSize: '14px', color: '#94a3b8' }}>📅 {date}</span>
          </div>
        </div>

        {data.block_index && (
          <div className="badge badge-green" style={{ marginBottom: '20px' }}>⛓️ Blockchain Verified — Block #{data.block_index}</div>
        )}

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '20px' }}>
          <Section label="Description" value={data.description} />
          <Section label="Diagnosis" value={data.diagnosis} />
          <Section label="Prescription / Treatment" value={data.prescription} />
          <Section label="Notes" value={data.notes} />
        </div>

        <div style={{
          marginTop: '24px', padding: '14px 18px',
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.22)',
          borderRadius: '10px', fontSize: '13px', color: '#fcd34d',
        }}>
          ⚠️ This link was shared by the patient and expires 24 hours from creation. Do not redistribute.
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <p style={{ color: '#475569', fontSize: '14px' }}>
          Powered by <a href="/" style={{ color: '#00d4ff' }}>MediChain</a> — Blockchain-Secured Medical Records
        </p>
      </div>
    </div>
  );
}
