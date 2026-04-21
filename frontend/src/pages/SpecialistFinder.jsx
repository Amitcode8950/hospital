import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import BookingModal from '../components/BookingModal';

const SPECIALTIES = ['Cardiology','Neurology','Gynaecology','Orthopaedics','Dermatology','Gastroenterology','Ophthalmology','Nephrology','Oncology','Endocrinology','Pulmonology'];
const CITIES = ['Mumbai','Delhi','Bangalore','Chennai','Hyderabad','Jaipur','Indore','Lucknow'];

export default function SpecialistFinder() {
  const [city, setCity]           = useState('');
  const [specialty, setSpecialty] = useState('');
  const [online, setOnline]       = useState(false);
  const [results, setResults]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [searched, setSearched]   = useState(false);
  const [booking, setBooking]     = useState(null);

  async function search(e) {
    e?.preventDefault();
    setLoading(true); setSearched(true);
    try {
      const params = new URLSearchParams();
      if (city)      params.set('city', city);
      if (specialty) params.set('specialty', specialty);
      if (online)    params.set('online', 'true');
      const { data } = await api.get(`/specialists?${params}`);
      setResults(data);
    } catch { setResults([]); }
    finally { setLoading(false); }
  }

  useEffect(() => { search(); }, []);

  const StarRating = ({ r }) => (
    <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '13px' }}>
      {'★'.repeat(Math.floor(r))}{'☆'.repeat(5 - Math.floor(r))} {r}
    </span>
  );

  return (
    <div className="page">
      <div className="ph">
        <h1>🩺 Find a Specialist</h1>
        <p>Discover top doctors in your city — even in smaller towns. Book online consultations instantly.</p>
      </div>

      <form onSubmit={search} className="glass" style={{ padding: '20px 24px', marginBottom: '28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: '12px', alignItems: 'end' }}>
          <div className="fg" style={{ marginBottom: 0 }}>
            <label className="label">City</label>
            <select className="select" value={city} onChange={e => setCity(e.target.value)}>
              <option value="">All Cities</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="fg" style={{ marginBottom: 0 }}>
            <label className="label">Specialty</label>
            <select className="select" value={specialty} onChange={e => setSpecialty(e.target.value)}>
              <option value="">All Specialties</option>
              {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#94a3b8', cursor: 'pointer', paddingBottom: '2px' }}>
            <input type="checkbox" checked={online} onChange={e => setOnline(e.target.checked)} style={{ accentColor: '#00d4ff', width: '16px', height: '16px' }} />
            Online only
          </label>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <><span className="spin" /> Finding...</> : '🔍 Find'}
          </button>
        </div>
      </form>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}><span className="spin" style={{ width: '32px', height: '32px', borderWidth: '3px' }} /></div>
      ) : searched && results.length === 0 ? (
        <div className="glass" style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px' }}>🔍</div>
          <p style={{ color: '#94a3b8', marginTop: '12px' }}>No specialists found. Try a different city or specialty.</p>
        </div>
      ) : (
        <div className="g2">
          {results.map(s => (
            <div key={s._id} className="glass card-hover" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                {s.avatar ? (
                  <img src={s.avatar} alt={s.name}
                    style={{ width: 56, height: 56, borderRadius: '50%', flexShrink: 0, border: '2px solid rgba(0,212,255,0.3)', objectFit: 'cover', background: 'rgba(0,212,255,0.08)' }} />
                ) : (
                  <div style={{ width: 56, height: 56, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#00d4ff22,#8b5cf622)', border: '2px solid rgba(0,212,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                    👨‍⚕️
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
                    <div>
                      <h3 style={{ color: '#e2e8f0', fontWeight: 700, marginBottom: 4, fontSize: 16 }}>{s.name}</h3>
                      <div style={{ fontSize: 13, color: '#00d4ff', fontWeight: 600 }}>{s.specialty}</div>
                      {s.sub_specialty && <div style={{ fontSize: 12, color: '#475569' }}>{s.sub_specialty}</div>}
                    </div>
                    {s.available_online && <span className="badge badge-green" style={{ fontSize: 11 }}>📹 Online</span>}
                  </div>
                  <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 8 }}>🏥 {s.hospital} · 📍 {s.city}</div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <StarRating r={s.rating} />
                    <span style={{ fontSize: 12, color: '#475569' }}>({s.reviews} reviews)</span>
                    <span style={{ fontSize: 13, color: '#94a3b8' }}>🩺 {s.experience_years} yrs exp</span>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: 16, paddingTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#10b981' }}>₹{s.consultation_fee}</div>
                  <div style={{ fontSize: 12, color: '#475569' }}>per consultation</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>
                    🗓️ Next: <strong style={{ color: '#00d4ff' }}>{s.next_available}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link to={`/specialists/${s._id}`} className="btn btn-ghost btn-sm">View Profile</Link>
                    <button className="btn btn-primary btn-sm"
                      onClick={() => setBooking({
                        item_id:  s._id,
                        item_name: s.name,
                        sub_item:  s.specialty + (s.sub_specialty ? ' · ' + s.sub_specialty : ''),
                        location:  s.hospital,
                        city:      s.city,
                        amount:    s.consultation_fee,
                        avatar:    s.avatar,
                      })}>
                      📅 Book Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {booking && (
        <BookingModal item={booking} type="doctor"
          onClose={() => setBooking(null)}
          onSuccess={() => setBooking(null)} />
      )}
    </div>
  );
}
