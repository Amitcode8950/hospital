export default function BlockCard({ block, isGenesis }) {
  const date = new Date(block.timestamp).toLocaleString();
  const shortHash = h => h ? `${h.slice(0, 8)}...${h.slice(-6)}` : '—';

  return (
    <div className="glass" style={{
      padding: '22px',
      borderColor: isGenesis ? 'rgba(0,212,255,0.35)' : 'rgba(255,255,255,0.07)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Glow for genesis */}
      {isGenesis && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at top left, rgba(0,212,255,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
      )}

      {/* Block header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: isGenesis ? 'rgba(0,212,255,0.15)' : 'rgba(139,92,246,0.12)',
            border: `1px solid ${isGenesis ? 'rgba(0,212,255,0.4)' : 'rgba(139,92,246,0.3)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px',
          }}>{isGenesis ? '🌐' : '⛓️'}</div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0' }}>Block #{block.idx}</div>
            {isGenesis && <div style={{ fontSize: '11px', color: '#00d4ff' }}>GENESIS</div>}
          </div>
        </div>
        <span className="badge badge-green" style={{ fontSize: '10px' }}>✓ Valid</span>
      </div>

      {/* Data summary */}
      {block.data?.type === 'MEDICAL_RECORD' && (
        <div style={{
          background: 'rgba(255,255,255,0.03)', borderRadius: '8px',
          padding: '10px 14px', marginBottom: '14px',
          fontSize: '13px', color: '#94a3b8',
        }}>
          <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{block.data.record_type || 'Record'}</span>
          {' · '}{block.data.title || block.data.type}
          {block.data.patient_email && <div style={{ fontSize: '11px', marginTop: '4px' }}>👤 {block.data.patient_email}</div>}
        </div>
      )}
      {block.data?.type === 'GENESIS' && (
        <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '14px', fontStyle: 'italic' }}>
          {block.data.message}
        </div>
      )}

      {/* Hash info */}
      <div style={{ fontSize: '11px', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#475569' }}>HASH</span>
          <span style={{ color: '#00d4ff' }}>{shortHash(block.hash)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#475569' }}>PREV</span>
          <span style={{ color: '#94a3b8' }}>{shortHash(block.prev_hash)}</span>
        </div>
        <div style={{
          paddingTop: '8px', marginTop: '4px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          color: '#475569', textAlign: 'right',
          fontFamily: 'Outfit, sans-serif', fontSize: '11px',
        }}>📅 {date}</div>
      </div>
    </div>
  );
}
