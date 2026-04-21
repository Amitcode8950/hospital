import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MODULES = [
  { to: '/medicine-prices',   icon: '💊', label: 'Medicine Prices' },
  { to: '/generic-drugs',     icon: '🏷️', label: 'Generic Drugs' },
  { to: '/diagnosis-compare', icon: '🔄', label: 'Compare Diagnoses' },
  { to: '/er-triage',         icon: '🚑', label: 'ER Triage' },
  { to: '/specialists',       icon: '🩺', label: 'Find Specialist' },
  { to: '/diagnostics',       icon: '🔬', label: 'Diagnostic Labs' },
  { to: '/hospital-pricing',  icon: '🏥', label: 'Hospital Pricing' },
  { to: '/my-bookings',       icon: '📅', label: 'My Bookings' },
  { to: '/dashboard',         icon: '📋', label: 'My Records' },
  { to: '/blockchain',        icon: '⛓️', label: 'Blockchain' },
  { to: '/vitals',            icon: '🫀', label: 'Vitals Tracker' },
  { to: '/timeline',          icon: '📜', label: 'Health Timeline' },
  { to: '/health-calc',       icon: '🧮', label: 'Health Calc' },
];

export default function Navbar() {
  const navigate    = useNavigate();
  const location    = useLocation();
  const [user, setUser]           = useState(null);
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [mobileOpen, setMobile]   = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const raw = localStorage.getItem('medichain_user');
    if (raw) setUser(JSON.parse(raw));
    const onStorage = () => {
      const r = localStorage.getItem('medichain_user');
      setUser(r ? JSON.parse(r) : null);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile on route change
  useEffect(() => { setMobile(false); setMenuOpen(false); }, [location]);

  function logout() {
    localStorage.removeItem('medichain_token');
    localStorage.removeItem('medichain_user');
    setUser(null);
    navigate('/');
  }

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? 'rgba(5,10,20,0.95)' : 'rgba(5,10,20,0.7)',
        backdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid rgba(0,212,255,0.15)' : '1px solid transparent',
        transition: 'all 0.3s ease',
        padding: '0 24px',
        height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <span style={{ fontSize: '22px' }}>🏥</span>
            <span style={{ fontSize: '20px', fontWeight: 800, background: 'linear-gradient(135deg,#00d4ff,#0099cc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MediChain</span>
          </Link>
        </motion.div>

        {/* Desktop Nav Links - Hidden on mobile via CSS but also logic for safety */}
        {!mobileOpen && (
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Modules dropdown */}
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button onClick={() => setMenuOpen(v => !v)}
                style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(0,212,255,0.25)', background: menuOpen ? 'rgba(0,212,255,0.1)' : 'transparent', color: menuOpen ? '#00d4ff' : '#94a3b8', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}>
                🧩 Modules {menuOpen ? '▲' : '▼'}
              </button>
              {menuOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 12px)', left: '50%', transform: 'translateX(-50%)', background: 'rgba(5,10,20,0.98)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: '14px', padding: '12px', width: '340px', backdropFilter: 'blur(20px)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)', zIndex: 2000 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                    {MODULES.map(m => {
                      const active = location.pathname === m.to;
                      return (
                        <Link key={m.to} to={m.to}
                          style={{ padding: '10px 8px', borderRadius: '10px', textDecoration: 'none', textAlign: 'center', background: active ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.03)', border: `1px solid ${active ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.06)'}`, transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,212,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = active ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = active ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.06)'; }}>
                          <span style={{ fontSize: '18px' }}>{m.icon}</span>
                          <span style={{ fontSize: '11px', color: active ? '#00d4ff' : '#94a3b8', fontWeight: 600, lineHeight: 1.2 }}>{m.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {user ? (
              <>
                <NavLink to="/dashboard">Dashboard</NavLink>
                {user.role === 'doctor' && <NavLink to="/add-record">Add Record</NavLink>}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '8px', paddingLeft: '12px', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                  <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', padding: '4px 8px', borderRadius: '10px', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#00d4ff,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#050a14', flexShrink: 0, overflow: 'hidden' }}>
                      {user.avatar
                        ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        : user.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="hide-mobile" style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', lineHeight: 1.2 }}>{user.name}</span>
                      <span style={{ fontSize: '11px', color: '#00d4ff', textTransform: 'capitalize' }}>{user.role}</span>
                    </div>
                  </Link>
                  <button onClick={logout} className="btn btn-ghost btn-sm">Logout</button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login"    className="btn btn-ghost btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm" style={{ marginLeft: '4px' }}>Register</Link>
              </>
            )}
          </div>
        )}

        {/* Mobile hamburger */}
        <button onClick={() => setMobile(v => !v)}
          style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '22px', cursor: 'pointer', padding: '4px', marginLeft: '8px' }}
          className="show-mobile">
          {mobileOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
            style={{ position: 'fixed', top: '64px', left: 0, right: 0, bottom: 0, background: 'rgba(5,10,20,0.98)', zIndex: 999, padding: '20px', overflowY: 'auto' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {user && (
                <div style={{ padding: '0 10px 10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg,#00d4ff,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700, color: '#050a14' }}>
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0' }}>{user.name}</div>
                      <div style={{ fontSize: '12px', color: '#00d4ff' }}>{user.role}</div>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {MODULES.map(m => (
                  <motion.div key={m.to} whileTap={{ scale: 0.96 }}>
                    <Link to={m.to}
                      style={{ padding: '14px', borderRadius: '10px', textDecoration: 'none', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '20px' }}>{m.icon}</span>
                      <span style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: 600, textAlign: 'center' }}>{m.label}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {user ? (
                  <>
                    <Link to="/dashboard" className="btn btn-ghost" style={{ width: '100%' }}>Dashboard</Link>
                    <Link to="/profile" className="btn btn-ghost" style={{ width: '100%' }}>Profile</Link>
                    <button onClick={logout} className="btn btn-danger" style={{ width: '100%' }}>Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="btn btn-ghost" style={{ width: '100%' }}>Login</Link>
                    <Link to="/register" className="btn btn-primary" style={{ width: '100%' }}>Register</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NavLink({ to, children }) {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link to={to}
      style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, color: active ? '#00d4ff' : '#94a3b8', background: active ? 'rgba(0,212,255,0.1)' : 'transparent', textDecoration: 'none', transition: 'all 0.2s ease' }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; } }}>
      {children}
    </Link>
  );
}
