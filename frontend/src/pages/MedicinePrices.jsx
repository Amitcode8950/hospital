import { useState } from 'react';
import api from '../api/axios';

const PHARMACIES_ORDER = ['1mg', 'Apollo Pharmacy', 'MedPlus', 'Netmeds', 'Wellness Forever', 'Jan Aushadhi Kendra'];

export default function MedicinePrices() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function search(e) {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true); setSearched(true);
    try {
      const { data } = await api.get(`/medicines/search?q=${encodeURIComponent(query)}`);
      setResults(data); setSelected(null);
    } catch { setResults([]); }
    finally { setLoading(false); }
  }

  const cheapest = selected ? Math.min(...selected.prices.filter(p => p.in_stock).map(p => p.price)) : 0;
  const savings = selected ? Math.max(...selected.prices.map(p => p.mrp)) - cheapest : 0;

  return (
    <div className="page">
      <div className="ph">
        <h1>💊 Medicine Price Comparator</h1>
        <p>Compare drug prices across Apollo, MedPlus, 1mg, Netmeds & more — instantly.</p>
      </div>

      <form onSubmit={search} style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        <input id="med-search" className="input" style={{ flex: 1 }}
          placeholder="Search medicine, e.g. Dolo 650, Paracetamol, Metformin..."
          value={query} onChange={e => setQuery(e.target.value)} />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <><span className="spin" /> Searching...</> : '🔍 Compare'}
        </button>
      </form>

      {/* Search results list */}
      {results.length > 0 && !selected && (
        <div className="glass" style={{ padding: '8px', marginBottom: '24px' }}>
          {results.map(m => (
            <div key={m._id} onClick={() => setSelected(m)}
              style={{ padding: '14px 18px', borderRadius: '10px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.07)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div>
                <div style={{ fontWeight: 700, color: '#e2e8f0' }}>{m.name}</div>
                <div style={{ fontSize: '13px', color: '#94a3b8' }}>{m.generic_name} · {m.category}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#10b981', fontWeight: 700 }}>
                  ₹{Math.min(...m.prices.map(p => p.price))}
                </div>
                <div style={{ fontSize: '12px', color: '#475569' }}>{m.prices.length} pharmacies</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {searched && results.length === 0 && !loading && (
        <div className="glass" style={{ padding: '48px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px' }}>🔍</div>
          <p style={{ color: '#94a3b8', marginTop: '12px' }}>No medicines found. Try "Dolo", "Augmentin", or "Metformin".</p>
        </div>
      )}

      {/* Price comparison card */}
      {selected && (
        <div className="fadeUp">
          <button onClick={() => setSelected(null)} className="btn btn-ghost btn-sm" style={{ marginBottom: '16px' }}>← Back to results</button>

          <div className="glass" style={{ padding: '28px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ color: '#e2e8f0', marginBottom: '6px' }}>{selected.name}</h2>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <span className="badge badge-blue">{selected.generic_name}</span>
                  <span className="badge badge-purple">{selected.category}</span>
                  <span style={{ fontSize: '13px', color: '#94a3b8' }}>{selected.dosage_form}</span>
                </div>
                {selected.uses?.length > 0 && (
                  <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '10px' }}>
                    <strong style={{ color: '#e2e8f0' }}>Uses:</strong> {selected.uses.join(', ')}
                  </p>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', color: '#94a3b8' }}>Best price</div>
                <div style={{ fontSize: '32px', fontWeight: 800, color: '#10b981' }}>₹{cheapest}</div>
                {savings > 0 && <div style={{ fontSize: '13px', color: '#f59e0b' }}>Save up to ₹{savings}</div>}
              </div>
            </div>
          </div>

          <h3 style={{ color: '#e2e8f0', marginBottom: '16px', fontSize: '15px' }}>📊 Price Comparison Across Pharmacies</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {[...selected.prices].sort((a, b) => a.price - b.price).map((p, i) => (
              <div key={p.pharmacy} className="glass" style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', border: i === 0 ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '24px', width: '32px', textAlign: 'center' }}>{p.logo}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#e2e8f0' }}>{p.pharmacy}</div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>
                    {p.in_stock ? <span style={{ color: '#10b981' }}>✓ In Stock</span> : <span style={{ color: '#ef4444' }}>✗ Out of Stock</span>}
                    {p.delivery_days === 0 ? ' · Available now' : ` · ${p.delivery_days}-day delivery`}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: i === 0 ? '#10b981' : '#e2e8f0' }}>₹{p.price}</div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>MRP ₹{p.mrp} · {p.discount}% off</div>
                </div>
                {/* Price bar */}
                <div style={{ width: '100%', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', height: '6px', marginTop: '4px' }}>
                  <div style={{ width: `${(p.price / Math.max(...selected.prices.map(x => x.mrp))) * 100}%`, height: '100%', borderRadius: '4px', background: i === 0 ? '#10b981' : '#00d4ff' }} />
                </div>
              </div>
            ))}
          </div>

          {selected.side_effects?.length > 0 && (
            <div className="alert alert-info">
              ⚠️ <strong>Side effects:</strong> {selected.side_effects.join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Quick searches */}
      {!searched && (
        <div>
          <p style={{ color: '#475569', fontSize: '14px', marginBottom: '12px' }}>Try searching:</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['Dolo 650', 'Augmentin 625', 'Combiflam', 'Glycomet 500', 'Amlokind'].map(m => (
              <button key={m} onClick={() => { setQuery(m); setTimeout(search, 0); }}
                className="btn btn-ghost btn-sm">{m}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
