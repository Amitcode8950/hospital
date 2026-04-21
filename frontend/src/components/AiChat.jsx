import { useState, useRef, useEffect } from 'react';
import api from '../api/axios';

const QUICK_CHIPS = [
  { label: '📅 How to book a doctor',      msg: 'How do I book a doctor appointment on MediChain?' },
  { label: '💳 Online payment help',        msg: 'How does online payment work on MediChain? What is Razorpay?' },
  { label: '✅ Doctor approve booking',      msg: 'How does a doctor confirm or reject a patient booking?' },
  { label: '💰 Cash on delivery option',    msg: 'Can I pay cash at the clinic instead of paying online?' },
  { label: '💵 Refund policy',               msg: 'How do I get a refund if I cancel my appointment?' },
  { label: '💊 Generic medicine finder',      msg: 'How can I find cheap generic alternatives to branded medicines?' },
  { label: '🥺 Find specialist doctors',       msg: 'Show me the list of specialist doctors available and their fees.' },
  { label: '🔬 Book a lab test',              msg: 'How do I book a diagnostic lab test or home blood collection?' },
  { label: '📋 My bookings & profile',        msg: 'How do I view my bookings and cancel an appointment?' },
  { label: '🚑 ER Triage system',             msg: 'What is ER Triage and how does it work on MediChain?' },
];

function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: '5px', alignItems: 'center', padding: '12px 16px' }}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: '50%',
          background: '#00d4ff',
          animation: 'medibot-bounce 1.2s ease-in-out infinite',
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}
    </div>
  );
}

function MsgBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{
      display: 'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems: 'flex-end',
      gap: 8,
      marginBottom: 12,
    }}>
      {/* Avatar */}
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        background: isUser
          ? 'linear-gradient(135deg,#8b5cf6,#6d28d9)'
          : 'linear-gradient(135deg,#00d4ff,#0099cc)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700, color: '#050a14',
      }}>
        {isUser ? '👤' : '🤖'}
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth: '78%',
        background: isUser
          ? 'linear-gradient(135deg,rgba(139,92,246,0.25),rgba(109,40,217,0.2))'
          : 'rgba(255,255,255,0.06)',
        border: isUser
          ? '1px solid rgba(139,92,246,0.3)'
          : '1px solid rgba(255,255,255,0.1)',
        borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
        padding: '10px 14px',
        fontSize: 13.5,
        color: '#e2e8f0',
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {msg.content}
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4, textAlign: isUser ? 'right' : 'left' }}>
          {new Date(msg.ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

export default function AiChat() {
  const [open, setOpen]       = useState(false);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread]   = useState(1);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hi! I'm **MediBot**, your MediChain AI health assistant.\n\nI know everything about this platform:\n• 📅 Book doctor appointments & lab tests\n• 💳 Online payments (Razorpay) & Cash on Delivery\n• ✅ Doctor confirms/rejects bookings → email sent to patient\n• 💊 Medicine prices & generic alternatives\n• 🧾 Payment receipts & refunds\n• 📋 Medical records, share links & blockchain verification\n\nWhat can I help you with today?",
      ts: Date.now(),
    },
  ]);
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const user = (() => { try { return JSON.parse(localStorage.getItem('medichain_user')); } catch { return null; } })();

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text) {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: msg, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const { data } = await api.post('/chat', { message: msg, history });
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply, ts: Date.now() }]);
      if (!open) setUnread(u => u + 1);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '😔 Sorry, I had trouble connecting. Please check your internet and try again.',
        ts: Date.now(),
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <>
      {/* CSS keyframe for typing dots */}
      <style>{`
        @keyframes medibot-bounce {
          0%,80%,100% { transform: translateY(0); opacity:0.4; }
          40%          { transform: translateY(-6px); opacity:1; }
        }
        @keyframes medibot-pulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(0,212,255,0.5); }
          50%      { box-shadow: 0 0 0 12px rgba(0,212,255,0); }
        }
        @keyframes medibot-slide-up {
          from { opacity:0; transform:translateY(20px) scale(0.95); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        .medibot-chip:hover {
          background: rgba(0,212,255,0.15) !important;
          border-color: rgba(0,212,255,0.4) !important;
          color: #00d4ff !important;
        }
        .medibot-send:hover { background: #0099cc !important; }
        .medibot-close:hover { background: rgba(255,255,255,0.1) !important; }
      `}</style>

      {/* ── Floating Button ─────────────────────────────── */}
      <button
        id="medibot-toggle"
        onClick={() => setOpen(v => !v)}
        title="MediBot — AI Health Assistant"
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
          width: 60, height: 60, borderRadius: '50%',
          background: open
            ? 'rgba(5,10,20,0.9)'
            : 'linear-gradient(135deg,#00d4ff,#0099cc)',
          border: open ? '2px solid rgba(0,212,255,0.4)' : 'none',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          transition: 'all 0.3s ease',
          animation: !open ? 'medibot-pulse 2.5s ease-in-out infinite' : 'none',
        }}
      >
        {open ? '✕' : '🤖'}
        {!open && unread > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            background: '#ef4444', color: '#fff', fontSize: 11,
            fontWeight: 700, borderRadius: '50%',
            width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid #050a14',
          }}>{unread}</span>
        )}
      </button>

      {/* ── Chat Panel ──────────────────────────────────── */}
      {open && (
        <div
          id="medibot-panel"
          style={{
            position: 'fixed', bottom: 100, right: 28, zIndex: 9998,
            width: 380, height: 560,
            background: 'rgba(5,10,20,0.97)',
            border: '1px solid rgba(0,212,255,0.2)',
            borderRadius: 20,
            backdropFilter: 'blur(24px)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
            display: 'flex', flexDirection: 'column',
            animation: 'medibot-slide-up 0.25s ease',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            padding: '14px 18px',
            borderBottom: '1px solid rgba(0,212,255,0.1)',
            background: 'linear-gradient(135deg,rgba(0,212,255,0.08),rgba(0,153,204,0.04))',
            display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
          }}>
            {/* Bot icon */}
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'linear-gradient(135deg,#00d4ff,#0099cc)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              flexShrink: 0,
            }}>🤖</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#e2e8f0' }}>MediBot</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} />
                <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>
                  {loading ? 'Thinking…' : 'Online — AI Health Assistant'}
                </span>
              </div>
            </div>
            <button
              className="medibot-close"
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 18, borderRadius: 8, padding: '4px 8px', transition: 'all 0.2s' }}
            >✕</button>
          </div>

          {/* Context ribbon — shows user info if logged in */}
          {user && (
            <div style={{
              padding: '6px 16px', fontSize: 11,
              background: 'rgba(0,212,255,0.06)',
              borderBottom: '1px solid rgba(0,212,255,0.08)',
              color: '#64748b',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span>👤</span>
              <span>Chatting as <strong style={{ color: '#94a3b8' }}>{user.name}</strong> ({user.role})</span>
            </div>
          )}

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '16px',
            scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,212,255,0.2) transparent',
          }}>
            {messages.map((m, i) => <MsgBubble key={i} msg={m} />)}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#00d4ff,#0099cc)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>🤖</div>
                <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px 16px 16px 16px' }}>
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick chips (show only for first message) */}
          {messages.length === 1 && !loading && (
            <div style={{
              padding: '0 12px 10px',
              display: 'flex', flexWrap: 'wrap', gap: 6,
            }}>
              {QUICK_CHIPS.map(c => (
                <button
                  key={c.label}
                  className="medibot-chip"
                  onClick={() => send(c.msg)}
                  style={{
                    padding: '5px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: 'rgba(0,212,255,0.08)',
                    border: '1px solid rgba(0,212,255,0.2)',
                    color: '#94a3b8', cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >{c.label}</button>
              ))}
            </div>
          )}

          {/* Input bar */}
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', gap: 8, flexShrink: 0,
            background: 'rgba(0,0,0,0.2)',
          }}>
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask MediBot anything…"
              disabled={loading}
              style={{
                flex: 1, background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(0,212,255,0.15)',
                borderRadius: 12, padding: '10px 14px',
                color: '#e2e8f0', fontSize: 13, resize: 'none',
                outline: 'none', lineHeight: 1.5,
                fontFamily: 'inherit',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(0,212,255,0.15)'}
            />
            <button
              className="medibot-send"
              onClick={() => send()}
              disabled={!input.trim() || loading}
              style={{
                width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                background: input.trim() && !loading ? '#00d4ff' : 'rgba(0,212,255,0.15)',
                border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                color: input.trim() && !loading ? '#050a14' : '#334155',
                fontSize: 18, transition: 'all 0.2s', alignSelf: 'flex-end',
              }}
            >➤</button>
          </div>

          {/* Footer */}
          <div style={{ padding: '6px', textAlign: 'center', fontSize: 10, color: '#334155' }}>
            Powered by Google Gemini · Not a substitute for medical advice
          </div>
        </div>
      )}
    </>
  );
}
