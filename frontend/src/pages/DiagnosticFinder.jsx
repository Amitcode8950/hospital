import { useState } from 'react';
import api from '../api/axios';
import BookingModal from '../components/BookingModal';

const CITIES = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Jaipur', 'Lucknow'];

export default function DiagnosticFinder() {
  const [city, setCity]         = useState('');
  const [women, setWomen]       = useState(false);
  const [home, setHome]         = useState(false);
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);
  const [booking, setBooking]   = useState(null);

  async function search(e) {
    e?.preventDefault(); setLoading(true); setSearched(true);
    try {
      const params = new URLSearchParams();
      if (city)  params.set('city', city);
      if (women) params.set('women', 'true');
      if (home)  params.set('home', 'true');
      if (query) params.set('q', query);
      const { data } = await api.get(`/diagnostics?${params}`);
      setResults(data);
    } catch { setResults([]); }
    finally { setLoading(false); }
  }

  return (
    <div className="page">
      <div className="ph">
        <h1>🔬 Diagnostic Lab Finder</h1>
        <p>Find accredited labs near you. Filter for home collection, women's privacy, and rural outreach services.</p>
      </div>

      <form onSubmit={search} className="glass" style={{ padding: '20px 24px', marginBottom: '28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
          <div className="fg" style={{ marginBottom: 0 }}>
            <label className="label">City</label>
            <select className="select" value={city} onChange={e => setCity(e.target.value)}>
              <option value="">All Cities</option>
              {CITIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="fg" style={{ marginBottom: 0 }}>
            <label className="label">Search Test / Lab</label>
            <input className="input" placeholder="e.g. CBC, Pap Smear, Thyroid..." value={query} onChange={e => setQuery(e.target.value)} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
          {[
            [women, setWomen, '🌸 Women-Friendly Only'],
            [home,  setHome,  '🏠 Home Collection Only'],
          ].map(([val, fn, label]) => (
            <label key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#e2e8f0', cursor: 'pointer' }}>
              <input type="checkbox" checked={val} onChange={e => fn(e.target.checked)} style={{ accentColor: '#00d4ff', width: '16px', height: '16px' }} />
              {label}
            </label>
          ))}
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <><span className="spin" /> Searching...</> : '🔍 Find Labs'}
        </button>
      </form>

      {/* Women's health banner */}
      {women && (
        <div style={{ padding: '14px 20px', background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.3)', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', color: '#f9a8d4' }}>
          🌸 <strong>Women's Privacy Mode:</strong> Showing labs with female staff, private consultation rooms, and women-specific test packages. Home collection available wherever marked.
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}><span className="spin" style={{ width: '32px', height: '32px', borderWidth: '3px' }} /></div>
      ) : searched && results.length === 0 ? (
        <div className="glass" style={{ padding: '60px', textAlign: 'center' }}>
          <p style={{ color: '#94a3b8' }}>No labs found. Try a different city or remove filters.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {results.map(lab => (
            <div key={lab._id} className="glass" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                    {lab.accredited      && <span className="badge badge-blue">✓ NABL Accredited</span>}
                    {lab.women_friendly  && <span className="badge" style={{ background: 'rgba(236,72,153,0.15)', color: '#f472b6', border: '1px solid rgba(236,72,153,0.3)' }}>🌸 Women Friendly</span>}
                    {lab.home_collection && <span className="badge badge-green">🏠 Home Collection</span>}
                  </div>
                  <h2 style={{ color: '#e2e8f0', fontSize: '18px', fontWeight: 800 }}>{lab.name}</h2>
                  <p style={{ color: '#94a3b8', fontSize: '13px' }}>📍 {lab.area || lab.city} · 🕐 {lab.timings}</p>
                  {lab.phone && <p style={{ color: '#475569', fontSize: '13px' }}>📞 {lab.phone}</p>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: '#f59e0b', fontSize: '22px' }}>★ {lab.rating}</div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>({lab.reviews} reviews)</div>
                </div>
              </div>

              {/* Tests */}
              <div>
                <h4 style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Available Tests</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px' }}>
                  {lab.tests?.slice(0, 6).map(t => (
                    <div key={t.name} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 600 }}>{t.name}</div>
                        <div style={{ fontSize: '11px', color: '#475569' }}>
                          ⏱ {t.turnaround_hours}h
                          {t.home_collection && ' · 🏠 Home'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ color: '#10b981', fontWeight: 700, fontSize: '14px' }}>₹{t.price}</div>
                        <button className="btn btn-primary btn-sm" style={{ fontSize: 11, padding: '4px 10px' }}
                          onClick={() => setBooking({
                            item_id:  lab._id,
                            item_name: lab.name,
                            sub_item:  t.name,
                            location:  lab.area || lab.name,
                            city:      lab.city,
                            amount:    t.price,
                          })}>
                          📅 Book
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Women specific */}
              {lab.women_specific_tests?.length > 0 && (
                <div style={{ marginTop: '14px', padding: '12px 16px', background: 'rgba(236,72,153,0.07)', borderRadius: '10px', border: '1px solid rgba(236,72,153,0.15)' }}>
                  <div style={{ fontSize: '12px', color: '#f472b6', fontWeight: 700, marginBottom: '6px' }}>🌸 Women-Specific Tests</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {lab.women_specific_tests.map(t => (
                      <span key={t} style={{ padding: '3px 10px', background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.2)', borderRadius: '20px', fontSize: '12px', color: '#fda4af' }}>{t}</span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: '14px', display: 'flex', gap: '10px' }}>
                <button className="btn btn-ghost btn-sm">📞 Call</button>
                {lab.home_collection && (
                  <button className="btn btn-primary btn-sm" onClick={() => setBooking({
                    item_id:  lab._id,
                    item_name: lab.name,
                    sub_item:  'Home Collection',
                    location:  lab.area || lab.name,
                    city:      lab.city,
                    amount:    lab.tests?.[0]?.price || 299,
                  })}>
                    🏠 Book Home Collection
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {booking && (
        <BookingModal item={booking} type="lab"
          onClose={() => setBooking(null)}
          onSuccess={() => setBooking(null)} />
      )}
    </div>
  );
}
