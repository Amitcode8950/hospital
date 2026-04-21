import { useState, useEffect } from 'react';
import api from '../api/axios';
import BlockCard from '../components/BlockCard';

export default function BlockchainView() {
  const [chain, setChain] = useState([]);
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/blockchain'), api.get('/blockchain/validate')])
      .then(([c, v]) => { setChain(c.data); setValidation(v.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="ph" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>⛓️ Blockchain Explorer</h1>
          <p>Every medical record is cryptographically anchored in this immutable chain.</p>
        </div>
        {validation && (
          <div className={`badge ${validation.valid ? 'badge-green' : 'badge-red'}`} style={{ padding: '10px 18px', fontSize: '14px' }}>
            {validation.valid ? '✓ Chain Valid' : '⚠️ Chain Invalid!'} · {validation.blockCount} blocks
          </div>
        )}
      </div>

      {/* Stats */}
      {validation && (
        <div className="g3" style={{ marginBottom: '36px' }}>
          {[
            { icon: '🔗', label: 'Total Blocks', value: validation.blockCount, color: '#00d4ff' },
            { icon: '🔐', label: 'Integrity', value: validation.valid ? '100%' : 'BROKEN', color: validation.valid ? '#10b981' : '#ef4444' },
            { icon: '📋', label: 'Record Blocks', value: chain.filter(b => b.data?.type === 'MEDICAL_RECORD').length, color: '#8b5cf6' },
          ].map(s => (
            <div key={s.label} className="glass" style={{ padding: '22px 26px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
                background: `${s.color}15`, border: `1px solid ${s.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
              }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '13px', color: '#94a3b8' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* How it works */}
      <div className="glass" style={{ padding: '24px 28px', marginBottom: '32px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '28px' }}>🔐</div>
        <div>
          <h3 style={{ color: '#e2e8f0', marginBottom: '6px', fontSize:'16px', fontWeight: 700 }}>How MediChain Blockchain Works</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
            Each block contains a SHA-256 hash of its data + the previous block's hash. Changing any record would invalidate every block after it —
            making tampering <strong style={{ color: '#00d4ff' }}>mathematically impossible</strong> to hide.
          </p>
        </div>
      </div>

      {/* Chain visualization */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px' }}>
          <span className="spin" style={{ width: '36px', height: '36px', borderWidth: '3px' }} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {[...chain].reverse().map((block, i) => (
            <div key={block.idx}>
              <BlockCard block={block} isGenesis={block.idx === 1} />
              {i < chain.length - 1 && (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '4px 0', gap: '2px',
                }}>
                  <div style={{ width: '2px', height: '12px', background: 'rgba(0,212,255,0.2)' }} />
                  <div style={{ fontSize: '14px', color: 'rgba(0,212,255,0.4)' }}>▼</div>
                  <div style={{ width: '2px', height: '12px', background: 'rgba(0,212,255,0.2)' }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {chain.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>
          Only the genesis block exists. Add medical records to grow the chain.
        </div>
      )}
    </div>
  );
}
