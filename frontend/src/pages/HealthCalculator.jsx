import { useState } from 'react';

// ── Shared slider component ────────────────────────────────────────────────────
function Slider({ label, min, max, step, value, onChange, unit }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <label style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{label}</label>
        <span style={{ fontSize: 14, fontWeight: 800, color: '#00d4ff' }}>{value} {unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#00d4ff', height: 4 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, color: '#475569' }}>{min}</span>
        <span style={{ fontSize: 10, color: '#475569' }}>{max}</span>
      </div>
    </div>
  );
}

// ── BMI Calculator ─────────────────────────────────────────────────────────────
function BMICalc() {
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);
  const bmi = +(weight / ((height / 100) ** 2)).toFixed(1);

  const { label, color, emoji, advice } =
    bmi < 18.5 ? { label: 'Underweight', color: '#60a5fa', emoji: '⬇️', advice: 'Consider increasing calorie intake and consulting a nutritionist.' }
    : bmi < 25  ? { label: 'Normal',       color: '#10b981', emoji: '✅', advice: 'Great! Maintain your current diet and exercise routine.' }
    : bmi < 30  ? { label: 'Overweight',   color: '#f59e0b', emoji: '⚠️', advice: 'Consider moderate exercise and a balanced diet.' }
    :             { label: 'Obese',         color: '#ef4444', emoji: '🔴', advice: 'Consult a doctor for a weight management plan.' };

  const idealMin = +(18.5 * (height / 100) ** 2).toFixed(1);
  const idealMax = +(24.9 * (height / 100) ** 2).toFixed(1);

  return (
    <div>
      <Slider label="Height" min={140} max={220} step={1} value={height} onChange={setHeight} unit="cm" />
      <Slider label="Weight" min={30}  max={200} step={0.5} value={weight} onChange={setWeight} unit="kg" />

      <div style={{ background: `${color}18`, border: `2px solid ${color}44`, borderRadius: 14, padding: '20px', textAlign: 'center', marginTop: 8 }}>
        <div style={{ fontSize: 48, fontWeight: 900, color, lineHeight: 1 }}>{bmi}</div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>BMI (kg/m²)</div>
        <div style={{ fontSize: 18, fontWeight: 700, color }}>{emoji} {label}</div>
        <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>{advice}</div>
        <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
          Ideal weight for your height: <strong style={{ color: '#94a3b8' }}>{idealMin}–{idealMax} kg</strong>
        </div>
      </div>

      {/* BMI scale */}
      <div style={{ marginTop: 14, display: 'flex', gap: 2 }}>
        {[
          { label: '<18.5', text: 'Underweight', color: '#60a5fa', flex: 2 },
          { label: '18.5–25', text: 'Normal',       color: '#10b981', flex: 3 },
          { label: '25–30',   text: 'Overweight',   color: '#f59e0b', flex: 2 },
          { label: '30+',     text: 'Obese',         color: '#ef4444', flex: 2 },
        ].map(s => (
          <div key={s.text} style={{ flex: s.flex, background: `${s.color}22`, borderRadius: 4, padding: '4px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: s.color }}>{s.label}</div>
            <div style={{ fontSize: 9, color: '#475569' }}>{s.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Water Intake Calculator ────────────────────────────────────────────────────
function WaterCalc() {
  const [weight,   setWeight]   = useState(70);
  const [activity, setActivity] = useState('moderate');
  const [climate,  setClimate]  = useState('normal');

  const base = weight * 0.033;
  const activityBonus = { low: 0, moderate: 0.35, high: 0.7, athlete: 1.0 }[activity];
  const climateBonus  = { cold: -0.2, normal: 0, hot: 0.4, tropical: 0.6 }[climate];
  const total  = Math.max(1.5, +(base + activityBonus + climateBonus).toFixed(1));
  const glasses = Math.round(total / 0.25);

  return (
    <div>
      <Slider label="Body Weight" min={30} max={150} step={1} value={weight} onChange={setWeight} unit="kg" />

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 8 }}>Activity Level</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { key: 'low',      label: '🛋️ Sedentary',    sub: 'Desk job, no exercise' },
            { key: 'moderate', label: '🚶 Moderate',      sub: 'Light exercise 3×/week' },
            { key: 'high',     label: '🏃 Active',        sub: 'Exercise 5-6×/week' },
            { key: 'athlete',  label: '⚡ Athlete',       sub: 'Intense daily training' },
          ].map(a => (
            <button key={a.key} onClick={() => setActivity(a.key)}
              style={{ padding: '10px 8px', borderRadius: 10, border: '2px solid', borderColor: activity === a.key ? '#00d4ff' : 'rgba(255,255,255,0.08)', background: activity === a.key ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.03)', cursor: 'pointer', textAlign: 'left' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: activity === a.key ? '#00d4ff' : '#e2e8f0' }}>{a.label}</div>
              <div style={{ fontSize: 10, color: '#475569' }}>{a.sub}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 8 }}>Climate</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['cold', '🥶 Cold'], ['normal', '🌤 Normal'], ['hot', '☀️ Hot'], ['tropical', '🌴 Tropical']].map(([k, l]) => (
            <button key={k} onClick={() => setClimate(k)}
              style={{ flex: 1, padding: '8px 4px', borderRadius: 10, border: '2px solid', borderColor: climate === k ? '#00d4ff' : 'rgba(255,255,255,0.08)', background: climate === k ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.03)', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: climate === k ? '#00d4ff' : '#94a3b8' }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: 'rgba(0,212,255,0.08)', border: '2px solid rgba(0,212,255,0.25)', borderRadius: 14, padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: 52, fontWeight: 900, color: '#00d4ff', lineHeight: 1 }}>{total}L</div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>Daily water intake</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0' }}>💧 {glasses} glasses (250ml each)</div>
        <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>
          Spread across the day — drink a glass every {Math.floor(16 / glasses * 60)} mins while awake.
        </div>
      </div>
    </div>
  );
}

// ── Heart Rate Zones Calculator ────────────────────────────────────────────────
function HeartRateCalc() {
  const [age, setAge] = useState(30);
  const [restHR, setRestHR] = useState(70);
  const maxHR = 220 - age;
  const hrr   = maxHR - restHR; // Heart Rate Reserve

  const zones = [
    { name: 'Zone 1 — Recovery',     pct: [50, 60], color: '#60a5fa', desc: 'Very light, warm-up/cool-down' },
    { name: 'Zone 2 — Fat Burn',     pct: [60, 70], color: '#34d399', desc: 'Light cardio, fat burning, endurance base' },
    { name: 'Zone 3 — Aerobic',      pct: [70, 80], color: '#fbbf24', desc: 'Improves cardiovascular fitness' },
    { name: 'Zone 4 — Threshold',    pct: [80, 90], color: '#f97316', desc: 'Increases speed and performance' },
    { name: 'Zone 5 — Max Effort',   pct: [90, 100], color: '#ef4444', desc: 'Sprint intervals, anaerobic' },
  ].map(z => ({
    ...z,
    min: Math.round(restHR + hrr * z.pct[0] / 100),
    max: Math.round(restHR + hrr * z.pct[1] / 100),
  }));

  return (
    <div>
      <Slider label="Age" min={15} max={85} step={1} value={age} onChange={setAge} unit="years" />
      <Slider label="Resting Heart Rate" min={40} max={100} step={1} value={restHR} onChange={setRestHR} unit="bpm" />

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#94a3b8', marginBottom: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 10 }}>
        <div>Max HR: <strong style={{ color: '#e2e8f0' }}>{maxHR} bpm</strong></div>
        <div>HRR: <strong style={{ color: '#e2e8f0' }}>{hrr} bpm</strong></div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {zones.map(z => (
          <div key={z.name} style={{ padding: '12px 16px', borderRadius: 10, background: `${z.color}10`, border: `1px solid ${z.color}30`, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 8, height: 40, borderRadius: 4, background: z.color, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{z.name} ({z.pct[0]}–{z.pct[1]}%)</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{z.desc}</div>
            </div>
            <div style={{ textAlign: 'right', fontWeight: 800, color: z.color, fontSize: 14, flexShrink: 0 }}>
              {z.min}–{z.max}<br /><span style={{ fontSize: 10, fontWeight: 400, color: '#475569' }}>bpm</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Calorie Needs Calculator ───────────────────────────────────────────────────
function CalorieCalc() {
  const [age,      setAge]      = useState(30);
  const [height,   setHeight]   = useState(170);
  const [weight,   setWeight]   = useState(70);
  const [gender,   setGender]   = useState('male');
  const [activity, setActivity] = useState(1.55);
  const [goal,     setGoal]     = useState('maintain');

  // Mifflin-St Jeor BMR
  const bmr = gender === 'male'
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;

  const tdee = Math.round(bmr * activity);
  const calories = goal === 'lose' ? tdee - 500 : goal === 'gain' ? tdee + 300 : tdee;

  const macros = {
    protein: Math.round(calories * 0.30 / 4),
    carbs:   Math.round(calories * 0.45 / 4),
    fat:     Math.round(calories * 0.25 / 9),
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[['male', '♂️ Male'], ['female', '♀️ Female']].map(([k, l]) => (
          <button key={k} onClick={() => setGender(k)}
            style={{ flex: 1, padding: '10px', borderRadius: 10, border: '2px solid', borderColor: gender === k ? '#00d4ff' : 'rgba(255,255,255,0.08)', background: gender === k ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.03)', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: gender === k ? '#00d4ff' : '#94a3b8' }}>
            {l}
          </button>
        ))}
      </div>

      <Slider label="Age"    min={15}  max={80}  step={1}   value={age}    onChange={setAge}    unit="yrs" />
      <Slider label="Height" min={140} max={220}  step={1}   value={height} onChange={setHeight} unit="cm" />
      <Slider label="Weight" min={30}  max={200}  step={0.5} value={weight} onChange={setWeight} unit="kg" />

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 8 }}>Activity Level</label>
        <select value={activity} onChange={e => setActivity(Number(e.target.value))} className="input">
          <option value={1.2}>🛋️ Sedentary — little/no exercise</option>
          <option value={1.375}>🚶 Lightly active — 1-3 days/week</option>
          <option value={1.55}>🏃 Moderately active — 3-5 days/week</option>
          <option value={1.725}>⚡ Very active — 6-7 days/week</option>
          <option value={1.9}>🏋️ Extra active — physical job + exercise</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[['lose','🎯 Lose Weight'], ['maintain','⚖️ Maintain'], ['gain','💪 Build Muscle']].map(([k, l]) => (
          <button key={k} onClick={() => setGoal(k)}
            style={{ flex: 1, padding: '8px 4px', borderRadius: 10, border: '2px solid', borderColor: goal === k ? '#10b981' : 'rgba(255,255,255,0.08)', background: goal === k ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: goal === k ? '#10b981' : '#94a3b8' }}>
            {l}
          </button>
        ))}
      </div>

      <div style={{ background: 'rgba(16,185,129,0.08)', border: '2px solid rgba(16,185,129,0.25)', borderRadius: 14, padding: '20px', textAlign: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 52, fontWeight: 900, color: '#10b981', lineHeight: 1 }}>{calories}</div>
        <div style={{ fontSize: 13, color: '#94a3b8' }}>calories/day · BMR: {Math.round(bmr)} kcal</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {[
          { label: '🥩 Protein', value: macros.protein, color: '#ef4444', desc: '30% · 4 kcal/g' },
          { label: '🌾 Carbs',   value: macros.carbs,   color: '#f59e0b', desc: '45% · 4 kcal/g' },
          { label: '🥑 Fat',     value: macros.fat,     color: '#8b5cf6', desc: '25% · 9 kcal/g' },
        ].map(m => (
          <div key={m.label} style={{ background: `${m.color}12`, border: `1px solid ${m.color}30`, borderRadius: 10, padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: m.color }}>{m.value}g</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0' }}>{m.label}</div>
            <div style={{ fontSize: 10, color: '#475569' }}>{m.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
const CALCS = [
  { key: 'bmi',     label: '📏 BMI',         sub: 'Body Mass Index',       component: BMICalc },
  { key: 'water',   label: '💧 Water',        sub: 'Daily intake goal',     component: WaterCalc },
  { key: 'heart',   label: '💗 Heart Zones',  sub: 'Training zones',        component: HeartRateCalc },
  { key: 'calorie', label: '🔥 Calories',     sub: 'Daily needs & macros',  component: CalorieCalc },
];

export default function HealthCalculator() {
  const [active, setActive] = useState('bmi');
  const Comp = CALCS.find(c => c.key === active)?.component;

  return (
    <div className="page">
      <div className="ph">
        <h1>🧮 Health Calculator</h1>
        <p>Calculate BMI, hydration needs, heart rate training zones, and daily calorie requirements.</p>
      </div>

      {/* Calculator tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 28 }}>
        {CALCS.map(c => (
          <button key={c.key} onClick={() => setActive(c.key)}
            style={{ padding: '14px 8px', borderRadius: 12, border: '2px solid', borderColor: active === c.key ? '#00d4ff' : 'rgba(255,255,255,0.08)', background: active === c.key ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.03)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: active === c.key ? '#00d4ff' : '#e2e8f0' }}>{c.label}</div>
            <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>{c.sub}</div>
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 540, margin: '0 auto' }}>
        <div className="glass" style={{ padding: '28px 32px' }}>
          {Comp && <Comp />}
        </div>
        <div style={{ marginTop: 14, fontSize: 12, color: '#334155', textAlign: 'center' }}>
          ⚠️ These calculators are for general health awareness only. Consult a doctor for medical advice.
        </div>
      </div>
    </div>
  );
}
