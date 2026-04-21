import { Link } from 'react-router-dom';

const PROBLEMS = [
  {
    rank: 91, icon: '💊', color: '#f59e0b',
    problem: 'Why do medicine prices vary wildly across pharmacy chains?',
    solution: 'Compare prices across Apollo, MedPlus, 1mg, Netmeds instantly. Find the cheapest in-stock option.',
    to: '/medicine-prices', cta: 'Compare Prices',
  },
  {
    rank: 82.5, icon: '🔄', color: '#8b5cf6',
    problem: 'Why do patients lack tools to compare conflicting diagnoses confidently?',
    solution: 'Side-by-side diagnosis comparator. Detect agreement or conflict between multiple doctor opinions.',
    to: '/diagnosis-compare', cta: 'Compare Diagnoses',
  },
  {
    rank: 81.5, icon: '🚑', color: '#ef4444',
    problem: 'Why do emergency rooms lack systems to prioritize critical patients instantly?',
    solution: 'Real-time ER triage dashboard. Critical patients (severity 1) always jump to the top of the queue.',
    to: '/er-triage', cta: 'Open ER Triage',
  },
  {
    rank: 80, icon: '📋', color: '#00d4ff',
    problem: "Why can't doctors access patient medical histories across hospitals?",
    solution: 'Blockchain-anchored records accessible by any authorized doctor. Tamper-proof, SHA-256 secured.',
    to: '/dashboard', cta: 'View Records',
  },
  {
    rank: 79.5, icon: '🔬', color: '#10b981',
    problem: 'Why do rural patients waste time traveling for diagnostic tests?',
    solution: 'Find home-collection labs and rural diagnostic vans near you. Book tests from your doorstep.',
    to: '/diagnostics', cta: 'Find Labs',
  },
  {
    rank: 78.5, icon: '🌸', color: '#ec4899',
    problem: "Why are diagnostic services not designed for women's privacy and mobility needs?",
    solution: 'Filter for women-friendly labs with female staff, private rooms, home collection, and women-specific test packages.',
    to: '/diagnostics', cta: 'Women\'s Health',
  },
  {
    rank: 77, icon: '🩺', color: '#3b82f6',
    problem: 'Why is finding specialist doctors in smaller cities hard?',
    solution: 'Search specialists in tier-2 and tier-3 cities. Filter by specialty, online availability, and consultation fee.',
    to: '/specialists', cta: 'Find Specialists',
  },
  {
    rank: 76, icon: '🏷️', color: '#a78bfa',
    problem: 'Why do branded drugs dominate prescriptions despite cheaper, equivalent generics?',
    solution: 'Enter any branded drug and instantly find its generic equivalent. See savings up to 90% at Jan Aushadhi stores.',
    to: '/generic-drugs', cta: 'Find Generics',
  },
  {
    rank: 74.5, icon: '🏥', color: '#f97316',
    problem: 'Why do hospitals hide procedure pricing from patients?',
    solution: 'Transparent pricing for MRI, surgeries, dialysis & more — across government and private hospitals.',
    to: '/hospital-pricing', cta: 'Compare Hospitals',
  },
  {
    rank: 91, icon: '⛓️', color: '#06b6d4',
    problem: "Why can't patients access digital copies of medical records?",
    solution: 'MediChain gives patients full ownership of their medical records — blockchain-anchored, shareable, and always accessible.',
    to: '/register', cta: 'Get Started',
  },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '100px 24px 60px', position: 'relative', overflow: 'hidden' }}>
        {/* Animated blobs */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '10%', left: '10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)', borderRadius: '50%', animation: 'float 8s ease-in-out infinite' }} />
          <div style={{ position: 'absolute', bottom: '5%', right: '5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)', borderRadius: '50%', animation: 'float 10s ease-in-out infinite reverse' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(236,72,153,0.05) 0%, transparent 70%)', borderRadius: '50%', transform: 'translate(-50%,-50%)', animation: 'float 6s ease-in-out infinite' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '860px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)', borderRadius: '20px', fontSize: '13px', color: '#00d4ff', fontWeight: 600, marginBottom: '28px' }}>
            🏆 10 Healthcare Problems. One Platform.
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 900, lineHeight: 1.1, marginBottom: '24px' }}>
            Healthcare is{' '}
            <span style={{ background: 'linear-gradient(135deg,#ef4444,#f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>broken</span>
            {' '}for patients.<br />
            <span style={{ background: 'linear-gradient(135deg,#00d4ff,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MediChain</span>
            {' '}fixes it.
          </h1>
          <p style={{ fontSize: '18px', color: '#94a3b8', lineHeight: 1.7, marginBottom: '40px', maxWidth: '660px', margin: '0 auto 40px' }}>
            From medicine price comparisons to blockchain medical records — 10 powerful tools designed to put patients in control of their own healthcare.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary" style={{ fontSize: '16px', padding: '14px 32px' }}>
              🚀 Get Started Free
            </Link>
            <Link to="/medicine-prices" className="btn btn-ghost" style={{ fontSize: '16px', padding: '14px 32px' }}>
              💊 Compare Medicine Prices
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ padding: '28px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', textAlign: 'center' }}>
          {[
            ['10', 'Healthcare Problems Solved'],
            ['⛓️', 'Blockchain-secured Records'],
            ['100%', 'Patient Data Ownership'],
            ['₹0', 'Forever Free'],
          ].map(([num, label]) => (
            <div key={label}>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#00d4ff', marginBottom: '4px' }}>{num}</div>
              <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.3 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Problems & Solutions */}
      <section style={{ padding: '80px 24px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, marginBottom: '16px' }}>
            Solving India's Biggest{' '}
            <span style={{ background: 'linear-gradient(135deg,#00d4ff,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Healthcare Gaps
            </span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '560px', margin: '0 auto' }}>
            Each module is purpose-built for a real, high-impact problem identified in the Indian healthcare system.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {PROBLEMS.map((p, i) => (
            <div key={i} className="glass card-hover fadeUp" style={{ padding: '28px', borderTop: `3px solid ${p.color}`, position: 'relative', overflow: 'hidden' }}>
              {/* Rank glow */}
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: `radial-gradient(circle, ${p.color}15, transparent)`, borderRadius: '50%', pointerEvents: 'none' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div style={{ fontSize: '36px' }}>{p.icon}</div>
                <div style={{ background: `${p.color}20`, border: `1px solid ${p.color}40`, borderRadius: '8px', padding: '4px 10px', fontSize: '12px', color: p.color, fontWeight: 700 }}>
                  Score {p.rank}
                </div>
              </div>

              <h3 style={{ color: '#e2e8f0', fontSize: '15px', fontWeight: 700, lineHeight: 1.4, marginBottom: '10px' }}>
                {p.problem}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.6, marginBottom: '20px' }}>
                {p.solution}
              </p>

              <Link to={p.to}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '8px', background: `${p.color}15`, border: `1px solid ${p.color}30`, color: p.color, fontSize: '13px', fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = `${p.color}25`; }}
                onMouseLeave={e => { e.currentTarget.style.background = `${p.color}15`; }}>
                {p.cta} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div className="glass" style={{ maxWidth: '600px', margin: '0 auto', padding: '56px 40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏥</div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '14px', color: '#e2e8f0' }}>Ready to take control of your health?</h2>
          <p style={{ color: '#94a3b8', marginBottom: '28px', lineHeight: 1.6 }}>Create a free account to access your medical records, share them securely, and use every tool on this platform.</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '15px' }}>Register as Patient</Link>
            <Link to="/register" className="btn btn-ghost" style={{ padding: '12px 28px', fontSize: '15px' }}>Register as Doctor</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
