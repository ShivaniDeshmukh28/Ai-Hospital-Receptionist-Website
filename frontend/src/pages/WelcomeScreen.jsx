import { useEffect, useState } from 'react'
import LocationPopup from '../components/LocationPopup'
import UserLoginPopup from '../components/UserLoginPopup'

const LANGUAGES = [
  { greet: 'Namaste!',  sub: 'AI Hospital Receptionist' },
  { greet: 'नमस्ते!',   sub: 'AI हॉस्पिटल रिसेप्शनिस्ट' },
  { greet: 'Welcome!', sub: 'AI Hospital Receptionist' },
  { greet: 'ಸ್ವಾಗತ!',  sub: 'AI ಆಸ್ಪತ್ರೆ ಸ್ವಾಗತಕಾರ' },
]

const WARDS = [
  { label: 'General Ward',       from: '#1d9e97', to: '#0ea5e9', shadow: 'rgba(29,158,151,0.35)' },
  { label: 'Emergency Ward',     from: '#f43f5e', to: '#ef4444', shadow: 'rgba(244,63,94,0.35)'  },
  { label: 'Mental Health Ward', from: '#a855f7', to: '#8b5cf6', shadow: 'rgba(168,85,247,0.35)' },
]

const STATS = [
  { value: '24/7',       label: 'Available' },
  { value: 'Multiple',   label: 'Wards'     },
  { value: 'Experienced',label: 'Doctors'   },
]

function OrbitDot({ delay, radius, color }) {
  return (
    <div style={{
      position: 'absolute',
      width: 9, height: 9, borderRadius: '50%',
      background: color,
      top: '50%', left: '50%',
      marginTop: -4.5, marginLeft: -4.5,
      transformOrigin: `${radius}px 0`,
      animation: `orbitDot 4s linear ${delay}s infinite`,
      boxShadow: `0 0 8px ${color}`,
    }}/>
  )
}

export default function WelcomeScreen({ onStart }) {
  const [langIdx, setLangIdx]           = useState(0)
  const [visible, setVisible]           = useState(true)
  const [showLocation, setShowLocation] = useState(false)
  const [showLogin, setShowLogin]       = useState(false)
  const [locationData, setLocationData] = useState(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => { setLangIdx(i => (i + 1) % LANGUAGES.length); setVisible(true) }, 400)
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  const lang = LANGUAGES[langIdx]

  function handleLocationComplete(data) {
    setLocationData(data); setShowLocation(false); setShowLogin(true)
  }
  function handleSkipLocation() {
    setLocationData(null); setShowLocation(false); setShowLogin(true)
  }
  function handleLoginComplete(userData) {
    setShowLogin(false); onStart({ ...locationData, ...userData })
  }

  return (
    <div
      className="h-full flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #F0F9F8 0%, #ffffff 50%, #E0F2F1 100%)' }}
    >

      {/* ── 4 Floating radial gradient blobs ── */}
      {[
        { w:340, h:340, top:'-10%',  left:'-8%',   c:'radial-gradient(circle,rgba(29,158,151,0.18),transparent)', d:'0s',  dur:'9s'  },
        { w:280, h:280, bottom:'-8%',right:'-8%',  c:'radial-gradient(circle,rgba(2,195,154,0.14),transparent)',  d:'2s',  dur:'11s' },
        { w:220, h:220, top:'35%',   left:'60%',   c:'radial-gradient(circle,rgba(14,165,233,0.1),transparent)',  d:'4s',  dur:'13s' },
        { w:180, h:180, top:'15%',   right:'15%',  c:'radial-gradient(circle,rgba(29,158,151,0.1),transparent)',  d:'1s',  dur:'8s'  },
      ].map((b,i) => (
        <div key={i} style={{
          position:'absolute', borderRadius:'50%', pointerEvents:'none',
          width:b.w, height:b.h, top:b.top, left:b.left, bottom:b.bottom, right:b.right,
          background:b.c, filter:'blur(48px)',
          animation:`floatBlob ${b.dur} ${b.d} ease-in-out infinite`,
        }}/>
      ))}

      {/* Grid overlay — very subtle */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none',
        backgroundImage:'linear-gradient(rgba(29,158,151,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(29,158,151,0.03) 1px,transparent 1px)',
        backgroundSize:'44px 44px',
      }}/>

      {/* ── Stats bar — frosted glass top-right ── */}
      <div style={{
        position:'absolute', top:20, right:20,
        display:'flex', gap:8,
        animation:'fadeInDown 0.6s 0.2s both',
      }}>
        {STATS.map(s => (
          <div key={s.label} style={{
            display:'flex', flexDirection:'column', alignItems:'center',
            padding:'7px 14px', borderRadius:16,
            background:'rgba(255,255,255,0.75)',
            border:'1px solid rgba(29,158,151,0.15)',
            backdropFilter:'blur(12px)',
            boxShadow:'0 2px 12px rgba(29,158,151,0.08)',
          }}>
            <span style={{ fontWeight:900, fontSize:13, color:'#0f7a74', lineHeight:1 }}>{s.value}</span>
            <span style={{ fontSize:10, color:'#64748B', marginTop:2 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── White card (matches screenshot exactly) ── */}
      <div style={{
        background:'#ffffff',
        borderRadius:28,
        padding:'40px 48px 32px',
        boxShadow:'0 8px 48px -8px rgba(29,158,151,0.15), 0 2px 8px rgba(0,0,0,0.04)',
        border:'1px solid rgba(29,158,151,0.08)',
        display:'flex', flexDirection:'column', alignItems:'center',
        width:'100%', maxWidth:520,
        position:'relative', zIndex:2,
        animation:'cardIn 0.7s cubic-bezier(0.16,1,0.3,1)',
      }}>

        {/* ── Logo with orbit ── */}
        <div style={{ position:'relative', marginBottom:28 }}>
          {/* Orbit ring */}
          <div style={{
            position:'absolute', top:'50%', left:'50%',
            width:132, height:132,
            transform:'translate(-50%,-50%)',
            borderRadius:'50%',
            border:'1.5px dashed rgba(29,158,151,0.3)',
            animation:'spinRing 14s linear infinite',
            pointerEvents:'none',
          }}/>
          {/* 3 orbiting colored dots */}
          <OrbitDot delay={0}   radius={66} color="#1d9e97" />
          <OrbitDot delay={1.3} radius={66} color="#0ea5e9" />
          <OrbitDot delay={2.6} radius={66} color="#14b8a6" />

          {/* Ping ring */}
          <div style={{
            position:'absolute', top:'50%', left:'50%',
            width:96, height:96,
            transform:'translate(-50%,-50%)',
            borderRadius:'50%',
            border:'2px solid rgba(29,158,151,0.15)',
            animation:'pingRing 3s ease-out infinite',
            pointerEvents:'none',
          }}/>

          {/* Icon box */}
          <div style={{
            width:96, height:96, borderRadius:28,
            background:'linear-gradient(135deg,#1d9e97,#0f7a74)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 8px 32px -4px rgba(29,158,151,0.5)',
            animation:'bounceIn 0.75s cubic-bezier(0.16,1,0.3,1), iconPulse 3s 1s ease-in-out infinite',
            position:'relative',
          }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M24 8v32M8 24h32" stroke="white" strokeWidth="5" strokeLinecap="round"/>
              <circle cx="24" cy="24" r="20" stroke="white" strokeWidth="3" strokeOpacity="0.3" fill="none"/>
            </svg>

            {/* Live badge */}
            <div style={{
              position:'absolute', top:-6, right:-6,
              display:'flex', alignItems:'center', gap:4,
              padding:'3px 7px', borderRadius:20,
              background:'linear-gradient(90deg,#10b981,#059669)',
              boxShadow:'0 0 12px rgba(16,185,129,0.6)',
            }}>
              <div style={{ width:5, height:5, borderRadius:'50%', background:'#fff', animation:'livePing 1.2s infinite' }}/>
              <span style={{ color:'#fff', fontWeight:800, fontSize:8, letterSpacing:1 }}>LIVE</span>
            </div>
          </div>

          {/* Green dot (matches screenshot) */}
          <div style={{
            position:'absolute', bottom:-2, right:-2,
            width:22, height:22, borderRadius:'50%',
            background:'#4ade80', border:'2.5px solid white',
            boxShadow:'0 0 12px rgba(74,222,128,0.7)',
            animation:'liveDot 1.5s ease-in-out infinite',
          }}/>
        </div>

        {/* ── Greeting with rainbow gradient shift ── */}
        <div style={{
          textAlign:'center', marginBottom:6,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.97)',
          transition:'all 0.35s ease',
        }}>
          <h1 style={{
            fontSize:52, fontWeight:900, margin:'0 0 4px',
            background:'linear-gradient(90deg,#0f7a74,#1d9e97,#0ea5e9,#14b8a6,#0f7a74)',
            backgroundSize:'250%',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
            animation:'gradientShift 4s linear infinite',
          }}>
            {lang.greet}
          </h1>
          <p style={{ fontSize:18, fontWeight:600, color:'#1d9e97', margin:0 }}>
            {lang.sub}
          </p>
        </div>

        {/* Description */}
        <p style={{
          textAlign:'center', maxWidth:340,
          margin:'14px 0 28px',
          fontSize:15, lineHeight:1.7, color:'#64748B',
        }}>
          I will help you book a consultation with the right doctor. Just tell me how you're feeling — in your own words.
        </p>

        {/* ── CTA button with shimmer ── */}
        <button
          onClick={() => setShowLocation(true)}
          style={{
            position:'relative', overflow:'hidden',
            padding:'15px 48px', borderRadius:20, border:'none',
            background:'linear-gradient(135deg,#1d9e97,#0f7a74,#1d9e97)',
            backgroundSize:'200% 200%',
            animation:'gradientShift 3s ease infinite',
            boxShadow:'0 8px 32px -4px rgba(29,158,151,0.5)',
            cursor:'pointer', fontSize:16, fontWeight:700, color:'#fff',
            marginBottom:28,
            transition:'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.05)';e.currentTarget.style.boxShadow='0 12px 40px -4px rgba(29,158,151,0.65)'}}
          onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.boxShadow='0 8px 32px -4px rgba(29,158,151,0.5)'}}
          onMouseDown={e=>{e.currentTarget.style.transform='scale(0.97)'}}
          onMouseUp={e=>{e.currentTarget.style.transform='scale(1.04)'}}
        >
          {/* Shimmer sweep */}
          <div style={{
            position:'absolute', inset:0, pointerEvents:'none',
            background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)',
            animation:'shimmer 2.2s infinite',
          }}/>
          <span style={{ display:'flex', alignItems:'center', gap:10, position:'relative', zIndex:1 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Start Registration
          </span>
        </button>

        {/* ── Ward pills with gradients and glow shadows ── */}
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center' }}>
          {WARDS.map((w,i) => (
            <div key={w.label} style={{
              padding:'7px 16px', borderRadius:20,
              background:`linear-gradient(135deg,${w.from},${w.to})`,
              color:'#fff', fontSize:12, fontWeight:600,
              boxShadow:`0 4px 16px ${w.shadow}`,
              animation:`fadeInUp 0.5s ${0.5+i*0.1}s both`,
              cursor:'default',
            }}>
              {w.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Powered by ── */}
      <p style={{
        position:'absolute', bottom:20,
        fontSize:10, fontWeight:600, letterSpacing:3,
        textTransform:'uppercase', color:'#CBD5E1',
      }}>
        Powered by SDD
      </p>

      {/* ── Location Popup ── */}
      {showLocation && (
        <LocationPopup
          onComplete={handleLocationComplete}
          onSkip={handleSkipLocation}
        />
      )}

      {/* ── Login Popup ── */}
      {showLogin && (
        <UserLoginPopup
          onComplete={handleLoginComplete}
          onSkip={() => handleLoginComplete({})}
        />
      )}

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes floatBlob {
          0%,100% { transform:translateY(0) scale(1); }
          50%      { transform:translateY(-22px) scale(1.05); }
        }
        @keyframes orbitDot {
          from { transform:rotate(0deg)   translateX(66px) rotate(0deg); }
          to   { transform:rotate(360deg) translateX(66px) rotate(-360deg); }
        }
        @keyframes spinRing {
          from { transform:translate(-50%,-50%) rotate(0deg); }
          to   { transform:translate(-50%,-50%) rotate(360deg); }
        }
        @keyframes pingRing {
          0%   { transform:translate(-50%,-50%) scale(1);   opacity:0.4; }
          70%  { transform:translate(-50%,-50%) scale(1.6); opacity:0; }
          100% { transform:translate(-50%,-50%) scale(1.6); opacity:0; }
        }
        @keyframes bounceIn {
          0%  { opacity:0; transform:scale(0.5); }
          60% { transform:scale(1.1); }
          100%{ opacity:1; transform:scale(1); }
        }
        @keyframes iconPulse {
          0%,100% { box-shadow:0 8px 32px -4px rgba(29,158,151,0.5); }
          50%      { box-shadow:0 8px 52px -2px rgba(29,158,151,0.75); }
        }
        @keyframes liveDot {
          0%,100% { box-shadow:0 0 10px rgba(74,222,128,0.55); transform:scale(1); }
          50%      { box-shadow:0 0 20px rgba(74,222,128,0.9);  transform:scale(1.2); }
        }
        @keyframes livePing {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.4; transform:scale(1.6); }
        }
        @keyframes gradientShift {
          0%   { background-position:0%   50%; }
          50%  { background-position:100% 50%; }
          100% { background-position:0%   50%; }
        }
        @keyframes shimmer {
          0%   { transform:translateX(-100%); }
          100% { transform:translateX(250%); }
        }
        @keyframes cardIn {
          from { opacity:0; transform:translateY(28px) scale(0.97); }
          to   { opacity:1; transform:translateY(0)    scale(1); }
        }
        @keyframes fadeInDown {
          from { opacity:0; transform:translateY(-14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  )
}