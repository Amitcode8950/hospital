import { useState } from 'react';
import api from '../api/axios';

export default function GenericDrugs() {
  const [query, setQuery]   = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [searched, setSearched] = useState(false);

  async function search(e) {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true); setError(''); setSearched(true); setResult(null);
    try {
      const { data } = await api.get(`/medicines/generic?branded=${encodeURIComponent(query)}`);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Medicine not found');
    } finally { setLoading(false); }
  }

  const branded = result?.branded;
  const generics = result?.generics || [];
  const brandedMin = branded ? Math.min(...branded.prices.map(p => p.price)) : 0;
  const genericMin = generics.length > 0 ? Math.min(...generics.flatMap(g => g.prices.map(p => p.price))) : 0;
  const savePct = brandedMin > 0 && genericMin > 0 ? Math.round((1 - genericMin / brandedMin) * 100) : 0;

  return (
    <div className="page">
      <div className="ph">
        <h1>💊 Generic Drug Finder</h1>
        <p>Branded drugs can cost 10x more than equivalent generics. Find what's really in your prescription.</p>
      </div>

      <div className="glass" style={{ padding: '18px 24px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div style={{ fontSize: '28px' }}>ℹ️</div>
        <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6 }}>
          Generic drugs contain the <strong style={{ color: '#e2e8f0' }}>same active ingredient, dosage, and form</strong> as branded drugs — they are equally safe and effective. They're just manufactured without the brand marketing cost.
          <strong style={{ color: '#00d4ff' }}> Jan Aushadhi Kendras</strong> offer government-approved generics at a fraction of branded prices.
        </p>
      </div>

      <form onSubmit={search} style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        <input className="input" style={{ flex: 1 }}
          placeholder="Enter branded drug name: Dolo 650, Augmentin 625, Amlokind-AT..."
          value={query} onChange={e => setQuery(e.target.value)} />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <><span className="spin" /> Finding...</> : '🔍 Find Generic'}
        </button>
      </form>

      {/* Quick searches */}
      {!searched && (
        <div style={{ marginBottom: '28px' }}>
          <p style={{ color: '#475569', fontSize: '14px', marginBottom: '12px' }}>Search branded drugs:</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['Dolo 650', 'Augmentin 625', 'Combiflam', 'Glycomet 500', 'Amlokind-AT'].map(m => (
              <button key={m} onClick={() => { setQuery(m); setTimeout(search, 0); }} className="btn btn-ghost btn-sm">{m}</button>
            ))}
          </div>
        </div>
      )}

      {error && <div className="alert alert-err">⚠️ {error}</div>}

      {result && (
        <div className="fadeUp">
          {/* Savings banner */}
          {savePct > 0 && (
            <div style={{ padding: '20px 28px', background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(0,212,255,0.1))', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '14px', marginBottom: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', fontWeight: 900, color: '#10b981' }}>Save {savePct}%</div>
              <div style={{ color: '#94a3b8', fontSize: '15px' }}>by switching from <strong style={{ color: '#e2e8f0' }}>{branded?.name}</strong> to its generic equivalent</div>
              <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '8px' }}>Branded: ₹{brandedMin} → Generic: ₹{genericMin}</div>
            </div>
          )}

          {/* Branded card */}
          <h3 style={{ color: '#f59e0b', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>💊 Branded Drug</h3>
          <div className="glass" style={{ padding: '22px', marginBottom: '20px', borderLeft: '4px solid #f59e0b' }}>
            <h2 style={{ color: '#e2e8f0', marginBottom: '4px' }}>{branded?.name}</h2>
            <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px' }}>{branded?.composition} · by {branded?.manufacturer}</div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {branded?.prices.map(p => (
                <div key={p.pharmacy} style={{ padding: '8px 14px', background: 'rgba(245,158,11,0.08)', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.2)', textAlign: 'center', minWidth: '100px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{p.logo} {p.pharmacy}</div>
                  <div style={{ fontWeight: 800, color: '#f59e0b', fontSize: '18px' }}>₹{p.price}</div>
                  <div style={{ fontSize: '11px', color: '#475569' }}>{p.discount}% off MRP</div>
                </div>
              ))}
            </div>
          </div>

          {/* Generic alternatives */}
          <h3 style={{ color: '#10b981', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>✅ Generic Alternatives (Same Composition)</h3>
          {generics.length === 0 ? (
            <div className="glass" style={{ padding: '24px', textAlign: 'center' }}>
              <p style={{ color: '#94a3b8' }}>No standalone generic alternatives found in database for this drug.</p>
            </div>
          ) : (
            generics.map(g => (
              <div key={g._id} className="glass fadeUp" style={{ padding: '22px', marginBottom: '12px', borderLeft: '4px solid #10b981' }}>
                <h3 style={{ color: '#e2e8f0', marginBottom: '4px' }}>{g.name}</h3>
                <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '10px' }}>{g.composition} · by {g.manufacturer}</div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {g.prices.map(p => (
                    <div key={p.pharmacy} style={{ padding: '8px 14px', background: 'rgba(16,185,129,0.08)', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)', textAlign: 'center', minWidth: '100px' }}>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{p.logo} {p.pharmacy}</div>
                      <div style={{ fontWeight: 800, color: '#10b981', fontSize: '18px' }}>₹{p.price}</div>
                      <div style={{ fontSize: '11px', color: '#475569' }}>{p.discount}% off MRP</div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}

          <div className="alert alert-info" style={{ marginTop: '16px' }}>
            💡 Always consult your doctor before switching from a branded drug to its generic. Generics are bioequivalent and equally effective, but your doctor should confirm for your specific medical condition.
          </div>
        </div>
      )}
    </div>
  );
}
