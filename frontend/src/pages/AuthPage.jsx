import { useState } from 'react'

const AI_FEATURES = [
  { icon: '🧠', label: 'AI Symptom Analysis',   status: 'active',  dot: '#10b981' },
  { icon: '📋', label: 'Smart Doctor Matching',  status: 'loading', dot: null      },
  { icon: '🏥', label: 'Ward Assignment',        status: 'loading', dot: null      },
  { icon: '💊', label: 'Prescription Reminders', status: 'idle',    dot: null      },
  { icon: '📅', label: 'Appointment Scheduling', status: 'idle',    dot: null      },
]

function FeatureRow({ icon, label, status, dot }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '13px 0',
      borderBottom: '1px solid rgba(29,158,151,0.08)',
      opacity: status === 'idle' ? 0.45 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{
          fontSize: 14, fontWeight: status === 'active' ? 700 : 500,
          color: status === 'active' ? '#0f7a74' : '#334155',
          fontFamily: "'DM Sans', sans-serif",
        }}>{label}</span>
      </div>
      {status === 'active' && (
        <div style={{
          width: 10, height: 10, borderRadius: '50%',
          background: dot, boxShadow: `0 0 8px ${dot}`,
        }}/>
      )}
      {status === 'loading' && (
        <div style={{
          width: 20, height: 20,
          border: '2.5px solid rgba(29,158,151,0.15)',
          borderTop: '2.5px solid #1d9e97',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}/>
      )}
    </div>
  )
}

export default function AuthPage({ onAuth }) {
  const [mode, setMode]         = useState('login')
  const [email, setEmail]       = useState('')
  const [name, setName]         = useState('')
  const [phone, setPhone]       = useState('')
  const [password, setPassword] = useState('')
  const [dob, setDob]           = useState('')
  const [focusField, setFocus]  = useState(null)
  const [loading, setLoading]   = useState(false)

  function handleSubmit() {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onAuth({ email, name, phone })
    }, 1200)
  }

  const inputStyle = (field) => ({
    width: '100%', padding: '13px 16px', borderRadius: 14,
    border: `1.5px solid ${focusField === field ? '#1d9e97' : 'rgba(29,158,151,0.18)'}`,
    background: focusField === field ? 'rgba(29,158,151,0.04)' : '#fafafa',
    fontSize: 14, color: '#1e293b', outline: 'none',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'border 0.2s, background 0.2s',
    boxSizing: 'border-box',
    boxShadow: focusField === field ? '0 0 0 3px rgba(29,158,151,0.1)' : 'none',
  })

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=Syne:wght@700;800&display=swap"
        rel="stylesheet"
      />

      {/* Full page background */}
      <div style={{
        minHeight: '100vh', width: '100%',
        background: 'linear-gradient(135deg, #F0F9F8 0%, #ffffff 50%, #E0F2F1 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px',
        position: 'relative', overflow: 'hidden',
      }}>

        {/* Background blobs */}
        {[
          { w:340, h:340, top:'-10%',  left:'-8%',  c:'radial-gradient(circle,rgba(29,158,151,0.18),transparent)', dur:'9s',  d:'0s'  },
          { w:280, h:280, bottom:'-8%',right:'-8%', c:'radial-gradient(circle,rgba(2,195,154,0.14),transparent)',  dur:'11s', d:'2s'  },
          { w:220, h:220, top:'35%',   left:'60%',  c:'radial-gradient(circle,rgba(14,165,233,0.1),transparent)',  dur:'13s', d:'4s'  },
          { w:180, h:180, top:'15%',   right:'15%', c:'radial-gradient(circle,rgba(29,158,151,0.1),transparent)',  dur:'8s',  d:'1s'  },
        ].map((b, i) => (
          <div key={i} style={{
            position: 'absolute', borderRadius: '50%', pointerEvents: 'none',
            width: b.w, height: b.h, top: b.top, left: b.left, bottom: b.bottom, right: b.right,
            background: b.c, filter: 'blur(48px)',
            animation: `floatBlob ${b.dur} ${b.d} ease-in-out infinite`,
          }}/>
        ))}

        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(29,158,151,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(29,158,151,0.03) 1px,transparent 1px)',
          backgroundSize: '44px 44px',
        }}/>

        {/* Card */}
        <div style={{
          width: '100%', maxWidth: 960,
          background: '#ffffff',
          borderRadius: 28,
          boxShadow: '0 8px 48px -8px rgba(29,158,151,0.18), 0 2px 8px rgba(0,0,0,0.04)',
          border: '1px solid rgba(29,158,151,0.08)',
          overflow: 'hidden',
          display: 'flex', minHeight: 580,
          position: 'relative', zIndex: 2,
          animation: 'cardIn 0.7s cubic-bezier(0.16,1,0.3,1)',
        }}>

          {/* ── LEFT: Auth Form ── */}
          <div style={{
            flex: '1 1 50%', padding: '48px 52px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
          }}>

            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 13,
                background: 'linear-gradient(135deg,#1d9e97,#0f7a74)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(29,158,151,0.4)',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 4v16M4 12h16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" fill="none"/>
                </svg>
              </div>
              <span style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800, fontSize: 19, color: '#0f7a74',
                letterSpacing: '-0.3px',
              }}>AI Receptionist</span>
            </div>

            {/* Heading */}
            <h2 style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 32, fontWeight: 800,
              color: '#0f172a', margin: '0 0 6px',
              letterSpacing: '-0.5px', lineHeight: 1.2,
            }}>
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p style={{
              fontSize: 14, color: '#64748b', margin: '0 0 28px',
              fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6,
            }}>
              {mode === 'login'
                ? 'Sign in to continue your healthcare journey'
                : 'Register to access personalised AI healthcare'}
            </p>

            {/* Google */}
            <button
              onClick={() => onAuth({ provider: 'google' })}
              style={{
                width: '100%', padding: '13px 0', borderRadius: 14,
                border: '1.5px solid rgba(29,158,151,0.2)',
                background: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                fontSize: 14, fontWeight: 600, color: '#334155',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'border 0.2s, background 0.2s',
                marginBottom: 20,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(29,158,151,0.04)'; e.currentTarget.style.borderColor = '#1d9e97' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = 'rgba(29,158,151,0.2)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(29,158,151,0.12)' }}/>
              <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>OR</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(29,158,151,0.12)' }}/>
            </div>

            {/* Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              {mode === 'signup' && (
                <input
                  placeholder="Full Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onFocus={() => setFocus('name')}
                  onBlur={() => setFocus(null)}
                  style={inputStyle('name')}
                />
              )}
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocus('email')}
                onBlur={() => setFocus(null)}
                style={inputStyle('email')}
              />
              {mode === 'signup' && (
                <>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    onFocus={() => setFocus('phone')}
                    onBlur={() => setFocus(null)}
                    style={inputStyle('phone')}
                  />
                  <input
                    type="date"
                    placeholder="Date of Birth"
                    value={dob}
                    onChange={e => setDob(e.target.value)}
                    onFocus={() => setFocus('dob')}
                    onBlur={() => setFocus(null)}
                    style={inputStyle('dob')}
                  />
                </>
              )}
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocus('password')}
                onBlur={() => setFocus(null)}
                style={inputStyle('password')}
              />
            </div>

            {/* Forgot */}
            {mode === 'login' && (
              <div style={{ textAlign: 'right', marginBottom: 18 }}>
                <span style={{
                  fontSize: 13, color: '#1d9e97', fontWeight: 600,
                  cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                }}>Forgot password?</span>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%', padding: '14px 0', borderRadius: 14, border: 'none',
                background: loading ? 'rgba(29,158,151,0.5)' : 'linear-gradient(135deg,#1d9e97,#0f7a74)',
                color: '#fff', fontSize: 15, fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif",
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 6px 24px -4px rgba(29,158,151,0.5)',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                marginBottom: 18,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 10px 32px -4px rgba(29,158,151,0.65)' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.boxShadow = '0 6px 24px -4px rgba(29,158,151,0.5)' }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: 18, height: 18,
                    border: '2.5px solid rgba(255,255,255,0.3)',
                    borderTop: '2.5px solid #fff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}/>
                  {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                </>
              ) : (
                mode === 'login' ? 'Continue with email' : 'Create my account'
              )}
            </button>

            {/* Switch mode */}
            <p style={{
              textAlign: 'center', margin: 0,
              fontSize: 13, color: '#64748b',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {mode === 'login' ? "Don't have an account? " : 'Already registered? '}
              <span
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                style={{ color: '#1d9e97', fontWeight: 700, cursor: 'pointer' }}
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </span>
            </p>

            {/* Skip */}
            <p
              onClick={() => onAuth({ skipped: true })}
              style={{
                textAlign: 'center', marginTop: 10, marginBottom: 0,
                fontSize: 12, color: '#94a3b8',
                fontFamily: "'DM Sans', sans-serif",
                cursor: 'pointer',
              }}
            >
              Skip for now →
            </p>
          </div>

          {/* ── RIGHT: Feature Panel ── */}
          <div style={{
            flex: '1 1 50%',
            background: 'linear-gradient(160deg,#f0faf9 0%,#e6f7f6 50%,#d1f0ed 100%)',
            padding: '48px 44px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            borderLeft: '1px solid rgba(29,158,151,0.1)',
            position: 'relative', overflow: 'hidden',
          }}>

            {/* Decorative blobs */}
            <div style={{
              position: 'absolute', top: -60, right: -60,
              width: 240, height: 240, borderRadius: '50%',
              background: 'radial-gradient(circle,rgba(29,158,151,0.14),transparent)',
              pointerEvents: 'none',
            }}/>
            <div style={{
              position: 'absolute', bottom: -40, left: -40,
              width: 180, height: 180, borderRadius: '50%',
              background: 'radial-gradient(circle,rgba(14,165,233,0.09),transparent)',
              pointerEvents: 'none',
            }}/>

            {/* Live badge + heading */}
            <div style={{ marginBottom: 28, position: 'relative', zIndex: 1 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '5px 14px', borderRadius: 20, marginBottom: 14,
                background: 'linear-gradient(90deg,#1d9e97,#0ea5e9)',
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%', background: '#fff',
                  animation: 'livePing 1.2s infinite',
                }}/>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', letterSpacing: 1 }}>AI ACTIVE</span>
              </div>

              <h3 style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 24, fontWeight: 800,
                color: '#0f172a', margin: '0 0 8px', lineHeight: 1.2,
              }}>Your AI Health Assistant</h3>
              <p style={{
                fontSize: 14, color: '#64748b', margin: 0,
                fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6,
              }}>
                Sign in to unlock personalised AI-powered healthcare features.
              </p>
            </div>

            {/* Features */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              {AI_FEATURES.map(f => <FeatureRow key={f.label} {...f} />)}
            </div>

            {/* Bottom card */}
            <div style={{
              marginTop: 28, padding: '18px 20px', borderRadius: 18,
              background: 'rgba(255,255,255,0.8)',
              border: '1px solid rgba(29,158,151,0.15)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 4px 20px rgba(29,158,151,0.08)',
              position: 'relative', zIndex: 1,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                  background: 'linear-gradient(135deg,#1d9e97,#0ea5e9)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(29,158,151,0.35)',
                }}>
                  <span style={{ fontSize: 20 }}>🤖</span>
                </div>
                <div>
                  <p style={{
                    fontSize: 13, fontWeight: 700, color: '#0f172a',
                    margin: '0 0 3px', fontFamily: "'DM Sans', sans-serif",
                  }}>Tell me how you're feeling</p>
                  <p style={{
                    fontSize: 12, color: '#64748b', margin: 0,
                    fontFamily: "'DM Sans', sans-serif",
                  }}>AI matches you with the right doctor instantly</p>
                </div>
              </div>
            </div>

            {/* Powered by */}
            <p style={{
              position: 'absolute', bottom: 16, right: 0, left: 0,
              textAlign: 'center',
              fontSize: 10, fontWeight: 600, letterSpacing: 3,
              textTransform: 'uppercase', color: '#a8c5c3',
              fontFamily: "'DM Sans', sans-serif",
            }}>Powered by SDD</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes floatBlob {
          0%,100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-22px) scale(1.05); }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes livePing {
          0%,100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.4; transform: scale(1.5); }
        }
      `}</style>
    </>
  )
}
