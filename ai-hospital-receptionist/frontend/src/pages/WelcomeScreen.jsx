import { useEffect, useState } from 'react'
import TopNavbar from '../components/TopNavbar'

const LANGUAGES = [
  { greet: 'Namaste!',  sub: 'AI Hospital Receptionist' },
  { greet: 'नमस्ते!',   sub: 'AI हॉस्पिटल रिसेप्शनिस्ट' },
  { greet: 'Welcome!', sub: 'AI Hospital Receptionist' },
  { greet: 'ಸ್ವಾಗತ!',  sub: 'AI ಆಸ್ಪತ್ರೆ ಸ್ವಾಗತಕಾರ' },
]

const WARDS = [
  { label: 'General Ward',       bg: 'bg-teal-50',   text: 'text-teal-700',   border: 'border-teal-200',   icon: '🏥' },
  { label: 'Emergency Ward',     bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    icon: '🚨' },
  { label: 'Mental Health Ward', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: '🧠' },
]

const STATS = [
  { value: '24/7',        label: 'Reception' },
  { value: 'Multi-Specialty', label: 'Wards'     },
  { value: 'Instant',     label: 'Token Queue' },
]

export default function WelcomeScreen({ onStart, user, onLogout }) {
  const [langIdx, setLangIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => { setLangIdx(i => (i + 1) % LANGUAGES.length); setVisible(true) }, 350)
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  const lang = LANGUAGES[langIdx]

  return (
    <div className="h-screen flex flex-col relative overflow-hidden bg-slate-50">
      {/* ── Top Navbar ── */}
      <TopNavbar user={user} onLogout={onLogout} />

      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 relative overflow-hidden">
        {/* Soft background accents */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-teal-200/40 blur-3xl pointer-events-none animate-float"/>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-sky-200/40 blur-3xl pointer-events-none animate-float" style={{ animationDelay: '3s' }}/>

        {/* Stats bar */}
        <div className="absolute top-4 right-6 hidden md:flex items-center gap-3 animate-fade-in z-10">
          {STATS.map(s => (
            <div key={s.label} className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl px-3.5 py-1.5 shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500"/>
              <div>
                <p className="text-xs font-bold text-slate-800 leading-none">{s.value}</p>
                <p className="text-[10px] font-medium text-slate-400 leading-none mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-clinical-lg border border-slate-200/80 flex flex-col items-center w-full max-w-lg relative z-10 animate-slide-up">
          
          {/* Medical Emblem */}
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center shadow-lg shadow-teal-700/30 relative">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
                <path d="M12 4v16M4 12h16" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" strokeOpacity="0.3" fill="none"/>
              </svg>
              <div className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full border-2 border-white shadow-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"/>
                AI LIVE
              </div>
            </div>
          </div>

          {/* Greeting Carousel */}
          <div className="text-center transition-all duration-300 min-h-[72px]"
            style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(6px)' }}>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-700 via-teal-600 to-teal-800 tracking-tight">
              {lang.greet}
            </h1>
            <p className="text-sm font-semibold text-teal-600 tracking-wide mt-1">
              {lang.sub}
            </p>
          </div>

          <p className="text-center text-sm text-slate-500 leading-relaxed my-5 max-w-xs">
            Describe your symptoms or health concern naturally. I'll guide you to the appropriate doctor and ward.
          </p>

          {/* CTA button */}
          <button
            onClick={onStart}
            className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-teal-600 via-teal-700 to-teal-800 hover:from-teal-700 hover:to-teal-900 text-white font-bold text-base shadow-lg shadow-teal-700/30 hover:shadow-teal-700/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group mb-6"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="group-hover:translate-x-0.5 transition-transform">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Start Patient Registration
          </button>

          {/* Ward pills */}
          <div className="flex gap-2 flex-wrap justify-center">
            {WARDS.map(w => (
              <span key={w.label} className={`text-xs font-semibold px-3 py-1.5 rounded-xl border ${w.bg} ${w.text} ${w.border} flex items-center gap-1.5`}>
                <span>{w.icon}</span>
                {w.label}
              </span>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <p className="absolute bottom-4 text-[10px] font-semibold tracking-widest text-slate-400 uppercase">
          MediCare Hospital AI Assistant Platform
        </p>
      </div>
    </div>
  )
}