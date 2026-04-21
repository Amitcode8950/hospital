import { Link } from 'react-router-dom';

const typeColors = {
  'Lab Report': '#00d4ff',
  'Prescription': '#10b981',
  'Consultation': '#8b5cf6',
  'Imaging': '#f59e0b',
  'Vaccination': '#ec4899',
  'Surgery': '#ef4444',
  'General': '#94a3b8',
};

const typeIcons = {
  'Lab Report': '🧪',
  'Prescription': '💊',
  'Consultation': '🩺',
  'Imaging': '🔬',
  'Vaccination': '💉',
  'Surgery': '🏥',
  'General': '📋',
};

export default function RecordCard({ record, showPatient }) {
  const color = typeColors[record.record_type] || '#94a3b8';
  const icon = typeIcons[record.record_type] || '📋';
  const date = new Date(record.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  return (
    <Link to={`/record/${record.id}`} style={{ textDecoration: 'none' }}>
      <div className="glass" style={{ padding: '24px', cursor: 'pointer' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{
            width: '46px', height: '46px', borderRadius: '12px',
            background: `${color}18`, border: `1px solid ${color}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', flexShrink: 0,
          }}>{icon}</div>
          <span className="badge badge-green" style={{ fontSize: '11px' }}>
            ⛓️ Verified
          </span>
        </div>

        {/* Type badge */}
        <div style={{
          display: 'inline-block',
          padding: '3px 10px', borderRadius: '6px',
          background: `${color}15`, border: `1px solid ${color}35`,
          color: color, fontSize: '11px', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.5px',
          marginBottom: '10px',
        }}>{record.record_type}</div>

        {/* Title */}
        <div style={{ fontSize: '17px', fontWeight: 700, color: '#e2e8f0', marginBottom: '8px', lineHeight: 1.3 }}>
          {record.title}
        </div>

        {/* Doctor */}
        <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
          👨‍⚕️ Dr. {record.doctor_name}
          {record.hospital && <> · {record.hospital}</>}
        </div>

        {/* Patient (for doctor view) */}
        {showPatient && record.patient_name && (
          <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
            👤 {record.patient_name}
          </div>
        )}

        {/* Date */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: '16px', paddingTop: '14px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <span style={{ fontSize: '12px', color: '#475569' }}>📅 {date}</span>
          {record.block_index && (
            <span style={{ fontSize: '11px', color: '#00d4ff', fontFamily: 'monospace' }}>
              Block #{record.block_index}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
