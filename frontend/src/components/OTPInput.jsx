import { useRef } from 'react';

export default function OTPInput({ value = '', onChange, disabled }) {
  const inputs = useRef([]);
  const digits = (value + '      ').slice(0, 6).split('');

  function handleChange(e, idx) {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[idx] = char;
    onChange(next.join('').trim());
    if (char && idx < 5) setTimeout(() => inputs.current[idx + 1]?.focus(), 0);
  }

  function handleKeyDown(e, idx) {
    if (e.key === 'Backspace' && !digits[idx].trim() && idx > 0) {
      const next = [...digits];
      next[idx - 1] = '';
      onChange(next.join('').trim());
      inputs.current[idx - 1]?.focus();
    }
  }

  function handlePaste(e) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      onChange(pasted);
      inputs.current[Math.min(pasted.length, 5)]?.focus();
    }
    e.preventDefault();
  }

  return (
    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '8px 0' }}>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <input
          key={i}
          ref={el => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i].trim()}
          onChange={e => handleChange(e, i)}
          onKeyDown={e => handleKeyDown(e, i)}
          onPaste={handlePaste}
          disabled={disabled}
          style={{
            width: '52px', height: '62px',
            textAlign: 'center',
            fontSize: '26px', fontWeight: 700,
            fontFamily: 'Outfit, sans-serif',
            background: digits[i].trim() ? 'rgba(0,212,255,0.08)' : 'rgba(255,255,255,0.04)',
            border: `2px solid ${digits[i].trim() ? 'rgba(0,212,255,0.6)' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '12px',
            color: '#00d4ff',
            outline: 'none',
            transition: 'all 0.2s ease',
            cursor: disabled ? 'not-allowed' : 'text',
          }}
          onFocus={e => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,212,255,0.15)'; }}
          onBlur={e => { e.currentTarget.style.boxShadow = 'none'; }}
        />
      ))}
    </div>
  );
}
