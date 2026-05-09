import { useEffect, useState } from 'react'
import LocationPopup from '../components/LocationPopup'

const LANGUAGES = [
  { greet: 'Namaste!',  sub: 'AI Hospital Receptionist' },
  { greet: 'नमस्ते!',    sub: 'AI हॉस्पिटल रिसेप्शनिस्ट' },
  { greet: 'Welcome!', sub: 'AI Hospital Receptionist' },
]

const DOCTORS = [
  { doc: 'Dr. Rajesh Sharma', spec: 'General Physician',    ward: 'General Ward',       fee: 500,  slots: ['10:00 AM', '11:00 AM', '3:00 PM'] },
  { doc: 'Dr. Priya Patel',   spec: 'General Physician',    ward: 'General Ward',       fee: 400,  slots: ['9:00 AM', '12:00 PM', '4:00 PM'] },
  { doc: 'Dr. Arjun Mehta',   spec: 'Emergency Specialist', ward: 'Emergency Ward',     fee: 1000, slots: ['Available 24/7'] },
  { doc: 'Dr. Sunita Rao',    spec: 'Emergency Specialist', ward: 'Emergency Ward',     fee: 1000, slots: ['Available 24/7'] },
  { doc: 'Dr. Anil Desai',    spec: 'Psychiatrist',         ward: 'Mental Health Ward', fee: 800,  slots: ['11:00 AM', '2:00 PM', '5:00 PM'] },
  { doc: 'Dr. Meera Joshi',   spec: 'Psychologist',         ward: 'Mental Health Ward', fee: 700,  slots: ['10:00 AM', '1:00 PM', '4:00 PM'] },
]

const WARD_COLORS = {
  'General Ward':       { bg: 'bg-teal-50',   text: 'text-teal-700',   border: 'border-teal-100',   dot: 'bg-teal-400' },
  'Emergency Ward':     { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-100',    dot: 'bg-red-400'  },
  'Mental Health Ward': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100', dot: 'bg-purple-400' },
}

export default function WelcomeScreen({ onStart }) {
  const [langIdx, setLangIdx]           = useState(0)
  const [visible, setVisible]           = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // ── ONLY NEW ADDITIONS ────────────────────────────────────────────────────
  const [showLocation, setShowLocation] = useState(false)

  function handleLocationComplete(data) {
    setShowLocation(false)
    onStart(data)
  }

  function handleSkipLocation() {
    setShowLocation(false)
    onStart(null)
  }
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setLangIdx(i => (i + 1) % LANGUAGES.length)
        setVisible(true)
      }, 400)
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  const lang = LANGUAGES[langIdx]

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 px-6 relative overflow-hidden">

      {/* ── Hamburger Button ── */}
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="absolute top-6 left-6 z-40 p-2.5 text-primary-700 bg-white/70 backdrop-blur-md rounded-xl shadow-sm border border-white/50 hover:shadow-md hover:bg-white transition-all animate-fade-in"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* ── Drawer Overlay ── */}
      <div className={`absolute inset-0 z-50 flex transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-primary-900/20 backdrop-blur-sm"
          onClick={() => setIsDrawerOpen(false)}
        />

        {/* Drawer Panel */}
        <div className={`relative w-80 max-w-[85vw] h-full bg-white shadow-2xl transition-transform duration-300 transform ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
          
          {/* Drawer Header */}
          <div className="p-6 border-b border-primary-50 flex items-center justify-between bg-primary-50/30">
            <h2 className="font-display font-bold text-lg text-primary-700 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Doctor Slots
            </h2>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Drawer Subheader */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
            <p className="text-xs text-gray-400">Scroll to see all available doctors and their slots</p>
          </div>

          {/* Doctor List */}
          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
            {DOCTORS.map(d => {
              const wc = WARD_COLORS[d.ward] ?? WARD_COLORS['General Ward']
              return (
                <div key={d.doc} className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md hover:border-primary-100 transition-all">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-gray-800 text-sm">{d.doc}</h3>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${wc.bg} ${wc.text} ${wc.border}`}>
                      {d.ward.replace(' Ward', '')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">{d.spec}</p>
                  <p className="text-xs font-semibold text-primary-600 mb-3">₹{d.fee} consultation</p>
                  {d.slots.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {d.slots.map(s => (
                        <span key={s} className="px-2.5 py-1 bg-primary-50 border border-primary-100 text-xs font-semibold text-primary-600 rounded-lg">
                          🕐 {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs font-medium px-2.5 py-1 bg-red-50 border border-red-100 text-red-600 rounded-lg inline-block">
                      Fully Booked
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-gray-100 text-center bg-gray-50/50">
            <p className="text-xs text-gray-300">Slots are subject to availability</p>
          </div>
        </div>
      </div>

      {/* ── Background Decorative Circles ── */}
      <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full bg-primary-100 opacity-40 blur-3xl" />
      <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full bg-primary-200 opacity-30 blur-2xl" />

      {/* ── Main Content Card ── */}
      <div className="relative bg-white/70 backdrop-blur-xl border border-white shadow-2xl shadow-primary-200/40 rounded-[2.5rem] p-8 md:p-12 max-w-lg w-full mx-4 flex flex-col items-center transition-all duration-500 hover:shadow-primary-300/50">

        {/* Logo */}
        <div className="relative mb-8 animate-fade-in">
          <div className="w-24 h-24 rounded-3xl bg-primary-500 flex items-center justify-center shadow-xl shadow-primary-200">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M24 8v32M8 24h32" stroke="white" strokeWidth="5" strokeLinecap="round"/>
              <circle cx="24" cy="24" r="20" stroke="white" strokeWidth="3" strokeOpacity="0.3" fill="none"/>
            </svg>
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-400 border-2 border-white animate-pulse-slow" />
        </div>

        {/* Greeting */}
        <div
          className="text-center mb-2 transition-all duration-300"
          style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(8px)' }}
        >
          <h1 className="font-display text-5xl font-bold text-primary-700 mb-1">{lang.greet}</h1>
          <p className="text-primary-500 text-xl font-medium">{lang.sub}</p>
        </div>

        {/* Description */}
        <p className="text-gray-500 text-center max-w-sm mt-4 mb-10 text-base leading-relaxed animate-fade-in">
          I will help you book a consultation with the right doctor.
          Just tell me how you're feeling — in your own words.
        </p>

        {/* ── CTA — ONLY CHANGE: onClick now opens location popup ── */}
        <button
          onClick={() => setShowLocation(true)}
          className="group relative px-10 py-4 bg-primary-500 hover:bg-primary-600 text-white font-display font-semibold text-lg rounded-2xl shadow-lg shadow-primary-200 transition-all duration-200 hover:scale-105 active:scale-95 animate-slide-up"
        >
          <span className="flex items-center gap-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Start Registration
          </span>
        </button>

        {/* Ward pills */}
        <div className="flex gap-3 mt-8 animate-fade-in flex-wrap justify-center">
          {[
            { label: 'General Ward',       color: 'bg-teal-50 text-teal-700 border-teal-200' },
            { label: 'Emergency Ward',     color: 'bg-red-50 text-red-700 border-red-200' },
            { label: 'Mental Health Ward', color: 'bg-purple-50 text-purple-700 border-purple-200' },
          ].map(w => (
            <span key={w.label} className={`text-xs px-3 py-1.5 rounded-full border font-medium ${w.color}`}>
              {w.label}
            </span>
          ))}
        </div>
      </div>

      {/* Stats - Top Right */}
      <div className="absolute top-6 right-6 flex gap-2 animate-fade-in z-30">
        {[
          { value: '24/7', label: 'Available' },
          { value: '3',    label: 'Wards' },
          { value: '6',    label: 'Doctors' },
        ].map(s => (
          <div key={s.label} className="bg-white/70 backdrop-blur-md border border-white/50 rounded-xl px-3 py-2 text-center shadow-sm">
            <p className="font-display font-bold text-sm text-primary-700">{s.value}</p>
            <p className="text-[10px] text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Powered by */}
      <p className="absolute bottom-6 text-xs text-black-300 font-medium tracking-widest uppercase">
        Powered by SDD
      </p>

      {/* ── ONLY NEW ADDITION: Location Popup ── */}
      {showLocation && (
        <LocationPopup
          onComplete={handleLocationComplete}
          onSkip={handleSkipLocation}
        />
      )}
    </div>
  )
}