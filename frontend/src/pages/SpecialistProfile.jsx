import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios';
import BookingModal from '../components/BookingModal';

export default function SpecialistProfile() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/specialists/${id}`);
        if (mounted) setDoctor(data);
      } catch {
        if (mounted) setError('Specialist profile not found.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="page">
        <div style={{ textAlign: 'center', padding: 60 }}>
          <span className="spin" style={{ width: 32, height: 32, borderWidth: 3 }} />
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="page">
        <div className="glass" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 42, marginBottom: 10 }}>⚠️</div>
          <p style={{ color: '#94a3b8', marginBottom: 16 }}>{error || 'Unable to load profile.'}</p>
          <Link to="/specialists" className="btn btn-primary btn-sm">Back to Specialists</Link>
        </div>
      </div>
    );
  }

  const bookingItem = {
    item_id: doctor._id,
    item_name: doctor.name,
    sub_item: doctor.specialty + (doctor.sub_specialty ? ` · ${doctor.sub_specialty}` : ''),
    location: doctor.hospital,
    city: doctor.city,
    amount: doctor.consultation_fee,
    avatar: doctor.avatar,
  };

  return (
    <div className="page">
      <div className="glass" style={{ padding: 28, marginBottom: 16 }}>
        <Link to="/specialists" className="btn btn-ghost btn-sm" style={{ marginBottom: 14 }}>← Back</Link>
        <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {doctor.avatar ? (
            <img src={doctor.avatar} alt={doctor.name} style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(0,212,255,0.3)' }} />
          ) : (
            <div style={{ width: 84, height: 84, borderRadius: '50%', background: 'linear-gradient(135deg,#00d4ff22,#8b5cf622)', border: '2px solid rgba(0,212,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34 }}>
              👨‍⚕️
            </div>
          )}

          <div style={{ flex: 1, minWidth: 220 }}>
            <h1 style={{ color: '#e2e8f0', marginBottom: 4 }}>{doctor.name}</h1>
            <div style={{ color: '#00d4ff', fontWeight: 700, marginBottom: 8 }}>
              {doctor.specialty}{doctor.sub_specialty ? ` · ${doctor.sub_specialty}` : ''}
            </div>
            <div style={{ color: '#94a3b8', fontSize: 14, marginBottom: 6 }}>🏥 {doctor.hospital} · 📍 {doctor.city}</div>
            <div style={{ color: '#94a3b8', fontSize: 14, marginBottom: 6 }}>⭐ {doctor.rating} ({doctor.reviews} reviews) · 🩺 {doctor.experience_years} years experience</div>
            {doctor.available_online && <span className="badge badge-green">📹 Available Online</span>}
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981' }}>₹{doctor.consultation_fee}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>consultation fee</div>
            <button className="btn btn-primary" onClick={() => setBooking(bookingItem)}>
              Book with Online Payment
            </button>
          </div>
        </div>
      </div>

      <div className="glass" style={{ padding: 24 }}>
        <h3 style={{ color: '#e2e8f0', marginBottom: 10 }}>Profile Details</h3>
        <div style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6 }}>
          <div>Next available: <strong style={{ color: '#00d4ff' }}>{doctor.next_available || 'As per schedule'}</strong></div>
          {doctor.languages?.length ? <div>Languages: {doctor.languages.join(', ')}</div> : null}
          {doctor.education?.length ? <div>Education: {doctor.education.join(' | ')}</div> : null}
        </div>
      </div>

      {booking && (
        <BookingModal
          item={booking}
          type="doctor"
          onClose={() => setBooking(null)}
          onSuccess={() => setBooking(null)}
        />
      )}
    </div>
  );
}
