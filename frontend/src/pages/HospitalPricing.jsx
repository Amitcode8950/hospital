import { useState } from 'react';
import api from '../api/axios';

const CITIES = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Jaipur', 'Lucknow', 'Chandigarh'];

export default function HospitalPricing() {
  const [query, setQuery]   = useState('');
  const [city, setCity]     = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function search(e) {
    e?.preventDefault();
    setLoading(true); setSearched(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (city)  params.set('city', city);
      const { data } = await api.get(`/procedures/search?${params}`);
      setResults(data);
    } catch { setResults([]); }
    finally { setLoading(false); }
  }

  const TIER_COLOR = { Government: '#10b981', Trust: '#8b5cf6', Corporate: '#f59e0b', Private: '#00d4ff' };

  return (
    <div className="page">
      <div className="ph">
        <h1>🏥 Hospital Procedure Pricing</h1>
        <p>See the true cost of medical procedures across government & private hospitals. No hidden fees.</p>
      </div>

      <form onSubmit={search} style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <input id="proc-search" className="input" style={{ flex: 1, minWidth: '220px' }}
          placeholder="Search procedure: MRI, Knee Replacement, Cataract..."
          value={query} onChange={e => setQuery(e.target.value)} />
        <select className="select" style={{ width: '160px' }} value={city} onChange={e => setCity(e.target.value)}>
          <option value="">All Cities</option>
          {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <><span className="spin" /> Searching...</> : '🔍 Compare Prices'}
        </button>
      </form>

      {/* Quick browse */}
      {!searched && (
        <div style={{ marginBottom: '28px' }}>
          <p style={{ color: '#475569', fontSize: '14px', marginBottom: '12px' }}>Popular procedures:</p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['MRI Brain', 'CT Scan', 'Knee Replacement', 'Angioplasty', 'Cataract Surgery', 'Dialysis'].map(p => (
              <button key={p} onClick={() => { setQuery(p); setTimeout(search, 0); }} className="btn btn-ghost btn-sm">{p}</button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}><span className="spin" style={{ width: '32px', height: '32px', borderWidth: '3px' }} /></div>
      ) : results.length === 0 && searched ? (
        <div className="glass" style={{ padding: '60px', textAlign: 'center' }}>
          <p style={{ color: '#94a3b8' }}>No results found. Try "MRI", "CT Scan", or "Knee Replacement".</p>
        </div>
      ) : (
        results.map(proc => {
          const sorted = [...proc.hospitals].sort((a, b) => a.price - b.price);
          const min = sorted[0]?.price;
          const max = sorted[sorted.length - 1]?.price;
          return (
            <div key={proc._id} className="glass" style={{ padding: '24px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <span className="badge badge-purple" style={{ marginBottom: '8px', display: 'inline-block' }}>{proc.category}</span>
                  <h2 style={{ color: '#e2e8f0', fontSize: '20px', fontWeight: 800 }}>{proc.name}</h2>
                  <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>{proc.description}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: '#475569' }}>Price range</div>
                  <div style={{ fontWeight: 800, color: '#e2e8f0', fontSize: '18px' }}>₹{min.toLocaleString()} — ₹{max.toLocaleString()}</div>
                  <div style={{ fontSize: '12px', color: '#10b981' }}>Save up to ₹{(max - min).toLocaleString()}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {sorted.map((h, i) => (
                  <div key={h.name} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', borderRadius: '10px', background: i === 0 ? 'rgba(16,185,129,0.07)' : 'rgba(255,255,255,0.03)', border: i === 0 ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap' }}>
                    <div style={{ minWidth: '28px', fontWeight: 800, color: '#475569' }}>#{i + 1}</div>
                    <div style={{ flex: 1, minWidth: '180px' }}>
                      <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '14px' }}>{h.name}</div>
                      <div style={{ fontSize: '12px', color: '#475569', display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '3px' }}>
                        <span>📍 {h.city}</span>
                        <span style={{ color: TIER_COLOR[h.tier] }}>● {h.tier}</span>
                        <span>⭐ {h.rating}</span>
                        {h.wait_days > 0 && <span>⏳ {h.wait_days}d wait</span>}
                        {h.insurance && <span style={{ color: '#10b981' }}>✓ Insurance</span>}
                        {h.accredited && <span style={{ color: '#8b5cf6' }}>✓ Accredited</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: i === 0 ? '#10b981' : '#e2e8f0' }}>₹{h.price.toLocaleString()}</div>
                      {i === 0 && <div style={{ fontSize: '11px', color: '#10b981' }}>Lowest</div>}
                    </div>
                    {/* Price bar */}
                    <div style={{ width: '100%', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', height: '5px' }}>
                      <div style={{ width: `${(h.price / max) * 100}%`, height: '100%', borderRadius: '4px', background: i === 0 ? '#10b981' : '#00d4ff60' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
