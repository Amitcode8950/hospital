import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import RecordCard from '../components/RecordCard';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeOut' }
};

const staggerContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.1 } }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('medichain_user') || '{}');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/records').then(r => setRecords(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const types = [...new Set(records.map(r => r.record_type))];

  const filtered = records.filter(r => {
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.doctor_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.hospital?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || r.record_type === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="page">
      {/* Header */}
      <motion.div
        {...fadeInUp}
        className="ph stack-sm"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}
      >
        <div>
          <h1>
            {user.role === 'doctor' ? '👨‍⚕️' : '🩺'} {user.role === 'doctor' ? "Doctor's" : 'My'} Dashboard
          </h1>
          <p>Welcome back, <strong style={{ color: '#00d4ff' }}>{user.name}</strong>
            {' '}<span className={`badge ${user.role === 'doctor' ? 'badge-purple' : 'badge-blue'}`}>{user.role}</span>
          </p>
        </div>
        {user.role === 'doctor' && (
          <Link to="/add-record" className="btn btn-primary">+ Add Medical Record</Link>
        )}
      </motion.div>

      {/* Stats Row */}
      <motion.div
        className="g3"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        style={{ marginBottom: '32px' }}
      >
        {[
          { icon: '📋', label: 'Total Records', value: records.length, color: '#00d4ff' },
          { icon: '⛓️', label: 'Blockchain Verified', value: records.filter(r => r.block_index).length, color: '#10b981' },
          { icon: '📅', label: 'This Month', value: records.filter(r => new Date(r.created_at) > new Date(Date.now() - 30 * 86400000)).length, color: '#8b5cf6' },
        ].map(s => (
          <motion.div
            key={s.label}
            variants={fadeInUp}
            className="glass"
            style={{ padding: '22px 26px', display: 'flex', alignItems: 'center', gap: '16px' }}
          >
            <div style={{
              width: '50px', height: '50px', borderRadius: '14px', flexShrink: 0,
              background: `${s.color}15`, border: `1px solid ${s.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
            }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '13px', color: '#94a3b8' }}>{s.label}</div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input
          className="input"
          style={{ flex: 1, minWidth: 'min(100%, 220px)' }}
          placeholder="🔍 Search records..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="select stack-sm" style={{ width: 'min(100%, 180px)' }} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Records */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#475569' }}>
          <span className="spin" style={{ width: '32px', height: '32px', borderWidth: '3px' }} />
          <p style={{ marginTop: '16px' }}>Loading records...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>
            {records.length === 0 ? '📭' : '🔍'}
          </div>
          <h3 style={{ color: '#e2e8f0', marginBottom: '8px' }}>
            {records.length === 0 ? 'No records yet' : 'No results found'}
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '15px', marginBottom: '24px' }}>
            {records.length === 0
              ? user.role === 'patient'
                ? 'Your doctor will add medical records that will appear here.'
                : 'Add your first patient record using the button above.'
              : 'Try adjusting your search or filter.'}
          </p>
          {user.role === 'doctor' && records.length === 0 && (
            <Link to="/add-record" className="btn btn-primary">+ Add First Record</Link>
          )}
        </div>
      ) : (
        <motion.div
          className="g2"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {filtered.map(r => (
            <motion.div key={r.id} variants={fadeInUp}>
              <RecordCard record={r} showPatient={user.role === 'doctor'} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Quick links */}
      <div style={{ marginTop: '48px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <Link to="/blockchain" className="btn btn-ghost">⛓️ View Blockchain</Link>
      </div>
    </div>
  );
}
