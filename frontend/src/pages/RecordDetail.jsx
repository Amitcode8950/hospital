import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function RecordDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('medichain_user') || '{}');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareUrl, setShareUrl] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/records/${id}`).then(r => setData(r.data)).catch(() => setError('Record not found or access denied')).finally(() => setLoading(false));
  }, [id]);

  async function generateShare() {
    setShareLoading(true);
    try {
      const r = await api.post(`/records/${id}/share`);
      setShareUrl(r.data.share_url);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate share link');
    } finally {
      setShareLoading(false);
    }
  }

  function copyShare() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <div className="page" style={{ textAlign: 'center', paddingTop: '160px' }}><span className="spin" style={{ width: '36px', height: '36px', borderWidth: '3px' }} /></div>;
  if (error || !data) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: '120px' }}>
      <div style={{ fontSize: '56px', marginBottom: '16px' }}>⚠️</div>
      <p style={{ color: '#94a3b8' }}>{error || 'Record not found'}</p>
      <Link to="/dashboard" className="btn btn-ghost" style={{ marginTop: '16px' }}>← Back</Link>
    </div>
  );

  const date = new Date(data.created_at).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });
  const block = data.blockchain_block;

  const typeColors = { 'Lab Report': '#00d4ff', 'Prescription': '#10b981', 'Consultation': '#8b5cf6', 'Imaging': '#f59e0b', 'Vaccination': '#ec4899', 'Surgery': '#ef4444', 'General': '#94a3b8' };
  const color = typeColors[data.record_type] || '#94a3b8';

  const Section = ({ label, value }) => value ? (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '15px', color: '#e2e8f0', lineHeight: 1.65, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{value}</div>
    </div>
  ) : null;

  return (
    <div className="page" style={{ maxWidth: '880px' }}>
      <div style={{ marginBottom: '24px' }}>
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm">← Back</button>
      </div>

      <div className="glass fadeUp" style={{ padding: '36px', marginBottom: '20px' }}>
        {/* Record Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'inline-block', padding: '4px 12px', borderRadius: '8px',
              background: `${color}15`, border: `1px solid ${color}35`,
              color: color, fontSize: '12px', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.5px', marginBottom: '12px',
            }}>{data.record_type}</div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#e2e8f0', lineHeight: 1.2 }}>{data.title}</h1>
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '14px', color: '#94a3b8' }}>👨‍⚕️ Dr. {data.doctor_name}</span>
              {data.hospital && <span style={{ fontSize: '14px', color: '#94a3b8' }}>🏥 {data.hospital}</span>}
              <span style={{ fontSize: '14px', color: '#94a3b8' }}>📅 {date}</span>
            </div>
          </div>
          <span className="badge badge-green" style={{ height: 'fit-content' }}>⛓️ Blockchain Verified</span>
        </div>

        {/* Record body */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '24px' }}>
          <Section label="Description" value={data.description} />
          <Section label="Diagnosis" value={data.diagnosis} />
          <Section label="Prescription / Treatment" value={data.prescription} />
          <Section label="Notes" value={data.notes} />
        </div>

        {/* Share section (patients only) */}
        {user.role === 'patient' && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '24px', marginTop: '8px' }}>
            <h3 style={{ color: '#e2e8f0', fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>🔗 Share Record</h3>
            {shareUrl ? (
              <div style={{ display: 'flex', gap: '10px' }}>
                <div className="input" style={{ flex: 1, fontSize: '13px', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {shareUrl}
                </div>
                <button onClick={copyShare} className={`btn ${copied ? 'btn-success' : 'btn-ghost'} btn-sm`}>
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
            ) : (
              <button onClick={generateShare} disabled={shareLoading} className="btn btn-ghost">
                {shareLoading ? <><span className="spin" /> Generating...</> : '🔗 Generate Share Link (24h)'}
              </button>
            )}
            <p style={{ fontSize: '12px', color: '#475569', marginTop: '8px' }}>
              Share links expire after 24 hours and provide read-only access.
            </p>
          </div>
        )}
      </div>

      {/* Blockchain Block */}
      {block && (
        <div className="glass" style={{ padding: '28px' }}>
          <h3 style={{ color: '#00d4ff', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>
            ⛓️ Blockchain Block #{block.idx}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              ['Index', `#${block.idx}`],
              ['Timestamp', new Date(block.timestamp).toLocaleString()],
              ['Hash', block.hash],
              ['Previous Hash', block.prev_hash],
            ].map(([label, value]) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '14px' }}>
                <div style={{ fontSize: '11px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{label}</div>
                <div style={{ fontSize: '12px', color: '#00d4ff', fontFamily: 'monospace', wordBreak: 'break-all' }}>{value}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '12px', color: '#475569', marginTop: '16px' }}>
            This record's hash is computed using SHA-256. Any tampering would invalidate the entire chain.
          </p>
        </div>
      )}
    </div>
  );
}
