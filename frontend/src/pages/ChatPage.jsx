import { useState, useRef, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import ChatBubble from '../components/ChatBubble'
import TypingIndicator from '../components/TypingIndicator'
import WardBadge from '../components/WardBadge'
import PatientSummaryCard from '../components/PatientSummaryCard'
import { sendMessage } from '../utils/api'

const INITIAL_MESSAGE = {
  id: 'init',
  role: 'assistant',
  text: "Hello! I'm your AI Hospital Receptionist. 🏥\n\nPlease describe your health concern and I'll help you get to the right doctor. You can speak naturally — just tell me how you're feeling.",
  timestamp: new Date(),
}

const LANGUAGES = [
  { code: 'en', label: '🇬🇧 English' },
  { code: 'hi', label: '🇮🇳 Hindi' },
  { code: 'mr', label: '🇮🇳 Marathi' },
]

const DOCTORS = [
  {
    doc: 'Dr. Rajesh Sharma',
    spec: 'General Physician',
    ward: 'General Ward',
    fee: 500,
    slots: ['10:00 AM', '11:00 AM', '3:00 PM'],
  },
  {
    doc: 'Dr. Priya Patel',
    spec: 'General Physician',
    ward: 'General Ward',
    fee: 400,
    slots: ['9:00 AM', '12:00 PM', '4:00 PM'],
  },
  {
    doc: 'Dr. Arjun Mehta',
    spec: 'Emergency Specialist',
    ward: 'Emergency Ward',
    fee: 1000,
    slots: ['Available 24/7'],
  },
  {
    doc: 'Dr. Sunita Rao',
    spec: 'Emergency Specialist',
    ward: 'Emergency Ward',
    fee: 1000,
    slots: ['Available 24/7'],
  },
  {
    doc: 'Dr. Anil Desai',
    spec: 'Psychiatrist',
    ward: 'Mental Health Ward',
    fee: 800,
    slots: ['11:00 AM', '2:00 PM', '5:00 PM'],
  },
  {
    doc: 'Dr. Meera Joshi',
    spec: 'Psychologist',
    ward: 'Mental Health Ward',
    fee: 700,
    slots: ['10:00 AM', '1:00 PM', '4:00 PM'],
  },
]

const WARD_COLORS = {
  'General Ward':       { bg: 'bg-teal-50',   text: 'text-teal-700',   border: 'border-teal-100' },
  'Emergency Ward':     { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-100'  },
  'Mental Health Ward': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' },
}

export default function ChatPage({ onReset }) {
  const [sessionId, setSessionId]         = useState(() => uuidv4())
  const [messages, setMessages]           = useState([INITIAL_MESSAGE])
  const [input, setInput]                 = useState('')
  const [loading, setLoading]             = useState(false)
  const [ward, setWard]                   = useState(null)
  const [patientData, setPatientData]     = useState(null)
  const [showSummary, setShowSummary]     = useState(false)
  const [showLangMenu, setShowLangMenu]   = useState(false)
  const [currentLang, setCurrentLang]     = useState('en')
  const [inputFocused, setInputFocused]   = useState(false)

  // Doctor Slots drawer
  const [showDoctorSlots, setShowDoctorSlots] = useState(false)

  // Cancel modal states
  const [showCancel, setShowCancel]       = useState(false)
  const [cancelName, setCancelName]       = useState('')
  const [cancelPhone, setCancelPhone]     = useState('')
  const [cancelToken, setCancelToken]     = useState('')
  const [cancelStatus, setCancelStatus]   = useState(null)
  const [cancelLoading, setCancelLoading] = useState(false)

  const bottomRef = useRef(null)
  const inputRef  = useRef(null)
  const langRef   = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (langRef.current && !langRef.current.contains(e.target)) setShowLangMenu(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleLanguageChange(langCode) {
    setCurrentLang(langCode)
    setShowLangMenu(false)
    if (window.changeLanguage) window.changeLanguage(langCode)
  }

  function handleNewSession() {
    setSessionId(uuidv4())
    setMessages([INITIAL_MESSAGE])
    setWard(null)
    setPatientData(null)
    setShowSummary(false)
    setInput('')
  }

  function openCancelModal() {
    setCancelName('')
    setCancelPhone('')
    setCancelToken('')
    setCancelStatus(null)
    setShowCancel(true)
  }

  function closeCancelModal() {
    setShowCancel(false)
    setCancelStatus(null)
  }

  async function handleCancelSubmit() {
    if (!cancelName.trim() || !cancelPhone.trim() || !cancelToken.trim()) return
    setCancelLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setCancelLoading(false)
    setCancelStatus('success')
  }

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return
    const userMsg = { id: uuidv4(), role: 'user', text, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const data = await sendMessage(text, sessionId)
      const botMsg = { id: uuidv4(), role: 'assistant', text: data.reply, timestamp: new Date() }
      setMessages(prev => [...prev, botMsg])
      if (data.ward) setWard(data.ward)
      if (data.data_complete && data.patient_summary) {
        setPatientData({
          patient_name:  data.patient_summary.patient_name,
          patient_age:   data.patient_summary.patient_age,
          patient_query: data.patient_summary.patient_query,
          ward:          data.patient_summary.ward,
          doctor:        data.patient_summary.doctor,
          slot:          data.patient_summary.slot,
          fee:           data.patient_summary.fee,
          email:         data.patient_summary.email,
        })
        setShowSummary(true)
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: uuidv4(), role: 'assistant',
        text: '⚠️ Sorry, I could not connect to the server. Please check your connection or try again.',
        timestamp: new Date(), isError: true,
      }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const isFormValid = cancelName.trim() && cancelPhone.trim() && cancelToken.trim()

  return (
    <div className="h-full flex flex-col relative" style={{ background: '#f0fafa' }}>

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-5 py-3 bg-white border-b border-teal-50"
        style={{ boxShadow: '0 2px 16px -4px rgba(29,158,151,0.1)' }}>

        {/* Left: Logo + Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md"
            style={{ background: 'linear-gradient(135deg, #1d9e97, #0f7a74)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </div>
          <div>
            <p className="font-display font-bold text-gray-800 text-sm leading-tight">AI Receptionist</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ animation: 'pulse 2s infinite' }}/>
              <p className="text-xs font-medium" style={{ color: '#1d9e97' }}>Online · Ready to help</p>
            </div>
          </div>
        </div>

        {/* Right: Ward + Language + Doctor Slots + Cancel */}
        <div className="flex items-center gap-2">
          {ward && <WardBadge ward={ward} />}

          {/* Language Selector */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setShowLangMenu(prev => !prev)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl border transition-all"
              style={{ background: '#f0fafa', color: '#1d9e97', borderColor: '#99d6d3' }}
            >
              🌐 {LANGUAGES.find(l => l.code === currentLang)?.label.split(' ')[1] || 'Lang'}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>
            {showLangMenu && (
              <div className="absolute right-0 top-9 bg-white border rounded-2xl shadow-xl z-50 overflow-hidden min-w-[140px]"
                style={{ borderColor: '#c7e9e6', boxShadow: '0 8px 32px -4px rgba(29,158,151,0.15)' }}>
                {LANGUAGES.map(lang => (
                  <button key={lang.code} onClick={() => handleLanguageChange(lang.code)}
                    className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-teal-50"
                    style={{
                      color: currentLang === lang.code ? '#1d9e97' : '#374151',
                      fontWeight: currentLang === lang.code ? 600 : 400,
                      background: currentLang === lang.code ? '#edf7f6' : 'white',
                    }}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Doctor Slots Button ── */}
          <button
            onClick={() => setShowDoctorSlots(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all hover:shadow-sm"
            style={{ background: '#f0fafa', color: '#1d9e97', borderColor: '#99d6d3' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Doctor Slots
          </button>

          {/* Cancel Appointment */}
          <button onClick={openCancelModal}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all hover:shadow-sm"
            style={{ background: '#fff5f5', color: '#dc2626', borderColor: '#fecaca' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            Cancel Appointment
          </button>
        </div>
      </header>

      {/* ── Messages ── */}
      <main className="flex-1 overflow-y-auto px-4 py-5 space-y-3" style={{ scrollbarWidth: 'none' }}>
        {messages.map(msg => <ChatBubble key={msg.id} message={msg} />)}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </main>

      {/* ── Patient Summary ── */}
      {showSummary && patientData && (
        <PatientSummaryCard
          data={patientData}
          ward={ward}
          onClose={() => setShowSummary(false)}
          onNewSession={handleNewSession}
        />
      )}

      {/* ── Doctor Slots Drawer (slides in from right) ── */}
      <div
        className={`absolute inset-0 z-50 flex justify-end transition-opacity duration-300 ${showDoctorSlots ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowDoctorSlots(false)}
        />

        {/* Panel */}
        <div
          className={`relative w-80 max-w-[85vw] h-full bg-white shadow-2xl flex flex-col transition-transform duration-300 ${showDoctorSlots ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {/* Panel Header */}
          <div className="p-5 border-b flex items-center justify-between"
            style={{ borderColor: '#e5f7f6', background: '#f0fafa' }}>
            <h2 className="font-bold text-base flex items-center gap-2" style={{ color: '#0f7a74' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Doctor Slots
            </h2>
            <button
              onClick={() => setShowDoctorSlots(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Subheader */}
          <div className="px-5 py-2.5 border-b border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-400">Scroll to see all available doctors and their slots</p>
          </div>

          {/* Doctor List */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
            {DOCTORS.map(d => {
              const wc = WARD_COLORS[d.ward] ?? WARD_COLORS['General Ward']
              return (
                <div key={d.doc}
                  className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md hover:border-teal-100 transition-all">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-gray-800 text-sm">{d.doc}</h3>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${wc.bg} ${wc.text} ${wc.border}`}>
                      {d.ward.replace(' Ward', '')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">{d.spec}</p>
                  <p className="text-xs font-semibold mb-3" style={{ color: '#1d9e97' }}>₹{d.fee} consultation</p>
                  <div className="flex flex-wrap gap-1.5">
                    {d.slots.map(s => (
                      <span key={s}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg"
                        style={{ background: '#f0fafa', border: '1px solid #c7e9e6', color: '#1d9e97' }}>
                        🕐 {s}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Panel Footer */}
          <div className="p-4 border-t border-gray-100 text-center" style={{ background: 'rgba(249,250,251,0.5)' }}>
            <p className="text-xs text-gray-300">Slots are subject to availability</p>
          </div>
        </div>
      </div>

      {/* ── Cancel Modal ── */}
      {showCancel && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)' }}>
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-slide-up"
            style={{ boxShadow: '0 32px 80px -12px rgba(0,0,0,0.25)' }}>

            {/* Modal Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-50">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl flex items-center justify-center"
                    style={{ background: '#fef2f2' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-gray-800 text-base leading-tight">Cancel Appointment</h2>
                    <p className="text-xs text-gray-400">Enter your booking details</p>
                  </div>
                </div>
                <button onClick={closeCancelModal}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors text-sm font-bold">
                  ✕
                </button>
              </div>
            </div>

            {cancelStatus === 'success' ? (
              /* Success */
              <div className="px-6 py-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)' }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </div>
                <h3 className="font-display font-bold text-gray-800 text-lg mb-1">Appointment Cancelled</h3>
                <p className="text-sm text-gray-500 mb-1">
                  Token <strong className="font-mono" style={{ color: '#1d9e97' }}>{cancelToken}</strong> for <strong>{cancelName}</strong> has been cancelled.
                </p>
                <p className="text-xs text-gray-300 mb-6">Your slot has been released.</p>
                <button onClick={closeCancelModal}
                  className="w-full py-3 rounded-2xl text-white text-sm font-semibold transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #1d9e97, #0f7a74)' }}>
                  Done
                </button>
              </div>
            ) : (
              /* Form */
              <div className="px-6 py-5 flex flex-col gap-4">

                {/* Token */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: '#6b7280' }}>
                    🎫 Token Number
                  </label>
                  <input type="text" value={cancelToken}
                    onChange={e => setCancelToken(e.target.value.toUpperCase())}
                    placeholder="e.g. GW-247"
                    className="w-full px-4 py-3 rounded-2xl border text-sm placeholder-gray-300 focus:outline-none transition-all font-mono font-semibold tracking-widest"
                    style={{
                      background: '#f0fafa',
                      borderColor: cancelToken ? '#1d9e97' : '#e5e7eb',
                      color: '#1d9e97',
                      boxShadow: cancelToken ? '0 0 0 3px rgba(29,158,151,0.1)' : 'none',
                    }}
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: '#6b7280' }}>
                    👤 Full Name
                  </label>
                  <input type="text" value={cancelName}
                    onChange={e => setCancelName(e.target.value)}
                    placeholder="Enter patient full name"
                    className="w-full px-4 py-3 rounded-2xl border text-sm text-gray-800 placeholder-gray-300 focus:outline-none transition-all"
                    style={{
                      background: '#f9fafb',
                      borderColor: cancelName ? '#1d9e97' : '#e5e7eb',
                      boxShadow: cancelName ? '0 0 0 3px rgba(29,158,151,0.1)' : 'none',
                    }}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: '#6b7280' }}>
                    📱 Phone Number
                  </label>
                  <input type="tel" value={cancelPhone}
                    onChange={e => setCancelPhone(e.target.value)}
                    placeholder="Enter registered phone number"
                    className="w-full px-4 py-3 rounded-2xl border text-sm text-gray-800 placeholder-gray-300 focus:outline-none transition-all"
                    style={{
                      background: '#f9fafb',
                      borderColor: cancelPhone ? '#1d9e97' : '#e5e7eb',
                      boxShadow: cancelPhone ? '0 0 0 3px rgba(29,158,151,0.1)' : 'none',
                    }}
                  />
                </div>

                {/* Warning */}
                <div className="flex gap-2 items-start px-4 py-3 rounded-2xl border"
                  style={{ background: '#fff7ed', borderColor: '#fed7aa' }}>
                  <span className="flex-shrink-0 mt-0.5">⚠️</span>
                  <p className="text-xs" style={{ color: '#92400e' }}>
                    This action cannot be undone. Your appointment slot will be released immediately.
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pb-1">
                  <button onClick={closeCancelModal}
                    className="flex-1 py-3 rounded-2xl border text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                    style={{ borderColor: '#e5e7eb' }}>
                    Go Back
                  </button>
                  <button onClick={handleCancelSubmit}
                    disabled={!isFormValid || cancelLoading}
                    className="flex-1 py-3 rounded-2xl text-white text-sm font-semibold transition-all flex items-center justify-center gap-2"
                    style={{
                      background: isFormValid && !cancelLoading
                        ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                        : '#fca5a5',
                      boxShadow: isFormValid && !cancelLoading
                        ? '0 4px 14px -2px rgba(220,38,38,0.4)'
                        : 'none',
                    }}
                  >
                    {cancelLoading ? (
                      <>
                        <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                        </svg>
                        Cancelling...
                      </>
                    ) : 'Confirm Cancel'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Input Bar ── */}
      <footer className="px-4 py-4 bg-white border-t border-teal-50"
        style={{ boxShadow: '0 -2px 16px -4px rgba(29,158,151,0.08)' }}>
        <div className="flex items-center gap-3 max-w-2xl mx-auto">

          {/* Input Box */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="Type your health concern here…"
              rows={1}
              disabled={loading || showSummary}
              className="w-full resize-none px-5 py-3.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none transition-all disabled:opacity-50 leading-relaxed rounded-2xl border-2"
              style={{
                maxHeight: '120px',
                overflowY: 'auto',
                background: inputFocused ? '#f0fafa' : '#f7fffe',
                borderColor: inputFocused ? '#1d9e97' : '#c7e9e6',
                boxShadow: inputFocused
                  ? '0 0 0 4px rgba(29,158,151,0.12), 0 2px 8px -2px rgba(29,158,151,0.15)'
                  : '0 1px 4px rgba(29,158,151,0.06)',
              }}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading || showSummary}
            className="w-12 h-12 rounded-2xl text-white flex items-center justify-center transition-all active:scale-95 disabled:cursor-not-allowed flex-shrink-0"
            style={{
              background: !input.trim() || loading || showSummary
                ? '#d1d5db'
                : 'linear-gradient(135deg, #1d9e97, #0f7a74)',
              boxShadow: !input.trim() || loading || showSummary
                ? 'none'
                : '0 4px 14px -2px rgba(29,158,151,0.5)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <p className="text-center text-xs text-gray-300 mt-2">Press Enter to send · Shift+Enter for new line</p>
      </footer>
    </div>
  )
}
