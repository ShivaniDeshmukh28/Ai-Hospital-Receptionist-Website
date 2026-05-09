import { useState, useRef, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import ChatBubble from '../components/ChatBubble'
import TypingIndicator from '../components/TypingIndicator'
import WardBadge from '../components/WardBadge'
import PatientSummaryCard from '../components/PatientSummaryCard'
import FacilitiesModal from '../components/FacilitiesModal'
import SlotBookingCalendar from '../components/SlotBookingCalendar'
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

export default function ChatPage({ onReset }) {
  const [sessionId, setSessionId]           = useState(() => uuidv4())
  const [messages, setMessages]             = useState([INITIAL_MESSAGE])
  const [input, setInput]                   = useState('')
  const [loading, setLoading]               = useState(false)
  const [ward, setWard]                     = useState(null)
  const [patientData, setPatientData]       = useState(null)
  const [showSummary, setShowSummary]       = useState(false)
  const [showLangMenu, setShowLangMenu]     = useState(false)
  const [currentLang, setCurrentLang]       = useState('en')
  const [inputFocused, setInputFocused]     = useState(false)
  const [showFacilities, setShowFacilities] = useState(false)
  const [showBookSlot, setShowBookSlot]     = useState(false)

  // Cancel modal states
  const [showCancel, setShowCancel]         = useState(false)
  const [cancelName, setCancelName]         = useState('')
  const [cancelPhone, setCancelPhone]       = useState('')
  const [cancelToken, setCancelToken]       = useState('')
  const [cancelStatus, setCancelStatus]     = useState(null)
  const [cancelLoading, setCancelLoading]   = useState(false)

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
    setCancelName(''); setCancelPhone(''); setCancelToken(''); setCancelStatus(null); setShowCancel(true)
  }

  function closeCancelModal() { setShowCancel(false); setCancelStatus(null) }

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

        <div className="flex items-center gap-2">
          {ward && <WardBadge ward={ward} />}

          {/* Book Slot Button */}
          <button onClick={() => setShowBookSlot(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all hover:shadow-sm"
            style={{ background: '#edf7f6', color: '#0f7a74', borderColor: '#99d6d3' }}>
            📅 Book Slot
          </button>

          {/* Language */}
          <div className="relative" ref={langRef}>
            <button onClick={() => setShowLangMenu(prev => !prev)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl border transition-all"
              style={{ background: '#f0fafa', color: '#1d9e97', borderColor: '#99d6d3' }}>
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
                    style={{ color: currentLang === lang.code ? '#1d9e97' : '#374151', fontWeight: currentLang === lang.code ? 600 : 400, background: currentLang === lang.code ? '#edf7f6' : 'white' }}>
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cancel */}
          <button onClick={openCancelModal}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all hover:shadow-sm"
            style={{ background: '#fff5f5', color: '#dc2626', borderColor: '#fecaca' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
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

      {/* ── Floating Facilities Button ── */}
      <button onClick={() => setShowFacilities(true)}
        className="absolute right-5 z-40 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-white text-xs font-semibold shadow-lg transition-all hover:shadow-xl hover:scale-105 active:scale-95"
        style={{ bottom: '90px', background: 'linear-gradient(135deg, #1d9e97, #0f7a74)', boxShadow: '0 8px 24px -4px rgba(29,158,151,0.5)' }}>
        <span className="text-base">🏥</span>
        Facilities
        <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">5</span>
      </button>

      {/* ── Patient Summary ── */}
      {showSummary && patientData && (
        <PatientSummaryCard data={patientData} ward={ward} onClose={() => setShowSummary(false)} onNewSession={handleNewSession} />
      )}

      {/* ── Facilities Modal ── */}
      {showFacilities && <FacilitiesModal onClose={() => setShowFacilities(false)} />}

      {/* ── Book Slot Full Screen Modal ── */}
      {showBookSlot && (
        <div className="absolute inset-0 z-50 flex items-start justify-center"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', overflowY: 'auto', padding: '20px 16px' }}>
          <div className="w-full max-w-3xl relative">
            {/* Close button */}
            <button onClick={() => setShowBookSlot(false)}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-gray-600 shadow-md transition-all"
              style={{ fontSize: 16, fontWeight: 'bold' }}>
              ✕
            </button>
            <SlotBookingCalendar />
          </div>
        </div>
      )}

      {/* ── Cancel Modal ── */}
      {showCancel && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)' }}>
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
            <div className="px-6 pt-6 pb-4 border-b border-gray-50">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl flex items-center justify-center" style={{ background: '#fef2f2' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-gray-800 text-base leading-tight">Cancel Appointment</h2>
                    <p className="text-xs text-gray-400">Enter your booking details</p>
                  </div>
                </div>
                <button onClick={closeCancelModal} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors text-sm font-bold">✕</button>
              </div>
            </div>
            {cancelStatus === 'success' ? (
              <div className="px-6 py-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)' }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                <h3 className="font-display font-bold text-gray-800 text-lg mb-1">Appointment Cancelled</h3>
                <p className="text-sm text-gray-500 mb-1">Token <strong className="font-mono" style={{ color: '#1d9e97' }}>{cancelToken}</strong> for <strong>{cancelName}</strong> has been cancelled.</p>
                <p className="text-xs text-gray-300 mb-6">Your slot has been released.</p>
                <button onClick={closeCancelModal} className="w-full py-3 rounded-2xl text-white text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #1d9e97, #0f7a74)' }}>Done</button>
              </div>
            ) : (
              <div className="px-6 py-5 flex flex-col gap-4">
                {[
                  { label: '🎫 Token Number', value: cancelToken, onChange: e => setCancelToken(e.target.value.toUpperCase()), placeholder: 'e.g. GW-247', type: 'text', mono: true },
                  { label: '👤 Full Name', value: cancelName, onChange: e => setCancelName(e.target.value), placeholder: 'Enter patient full name', type: 'text', mono: false },
                  { label: '📱 Phone Number', value: cancelPhone, onChange: e => setCancelPhone(e.target.value), placeholder: 'Enter registered phone number', type: 'tel', mono: false },
                ].map(field => (
                  <div key={field.label}>
                    <label className="text-xs font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: '#6b7280' }}>{field.label}</label>
                    <input type={field.type} value={field.value} onChange={field.onChange} placeholder={field.placeholder}
                      className={`w-full px-4 py-3 rounded-2xl border text-sm text-gray-800 placeholder-gray-300 focus:outline-none transition-all ${field.mono ? 'font-mono font-semibold tracking-widest' : ''}`}
                      style={{ background: '#f7fffe', borderColor: field.value ? '#1d9e97' : '#e0f5f4', boxShadow: field.value ? '0 0 0 3px rgba(29,158,151,0.1)' : 'none', color: field.mono && field.value ? '#1d9e97' : undefined }}
                    />
                  </div>
                ))}
                <div className="flex gap-2 items-start px-4 py-3 rounded-2xl border" style={{ background: '#fff7ed', borderColor: '#fed7aa' }}>
                  <span className="flex-shrink-0 mt-0.5">⚠️</span>
                  <p className="text-xs" style={{ color: '#92400e' }}>This action cannot be undone. Your appointment slot will be released immediately.</p>
                </div>
                <div className="flex gap-3 pb-1">
                  <button onClick={closeCancelModal} className="flex-1 py-3 rounded-2xl border text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors" style={{ borderColor: '#e5e7eb' }}>Go Back</button>
                  <button onClick={handleCancelSubmit} disabled={!isFormValid || cancelLoading}
                    className="flex-1 py-3 rounded-2xl text-white text-sm font-semibold transition-all flex items-center justify-center gap-2"
                    style={{ background: isFormValid && !cancelLoading ? 'linear-gradient(135deg, #ef4444, #dc2626)' : '#fca5a5', boxShadow: isFormValid && !cancelLoading ? '0 4px 14px -2px rgba(220,38,38,0.4)' : 'none' }}>
                    {cancelLoading ? (<><svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Cancelling...</>) : 'Confirm Cancel'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Input Bar ── */}
      <footer className="px-4 py-4 bg-white border-t border-teal-50" style={{ boxShadow: '0 -2px 16px -4px rgba(29,158,151,0.08)' }}>
        <div className="flex items-end gap-3 max-w-2xl mx-auto">
          <div className="flex-1 relative">
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
              onFocus={() => setInputFocused(true)} onBlur={() => setInputFocused(false)}
              placeholder="Type your health concern here…" rows={1} disabled={loading || showSummary}
              className="w-full resize-none px-5 py-3.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none transition-all disabled:opacity-50 leading-relaxed rounded-2xl border-2"
              style={{ maxHeight: '120px', overflowY: 'auto', background: inputFocused ? '#f0fafa' : '#f7fffe', borderColor: inputFocused ? '#1d9e97' : '#c7e9e6', boxShadow: inputFocused ? '0 0 0 4px rgba(29,158,151,0.12)' : '0 1px 4px rgba(29,158,151,0.06)' }}
            />
          </div>
          <button onClick={handleSend} disabled={!input.trim() || loading || showSummary}
            className="w-12 h-12 rounded-2xl text-white flex items-center justify-center transition-all active:scale-95 disabled:cursor-not-allowed flex-shrink-0"
            style={{ background: !input.trim() || loading || showSummary ? '#d1d5db' : 'linear-gradient(135deg, #1d9e97, #0f7a74)', boxShadow: !input.trim() || loading || showSummary ? 'none' : '0 4px 14px -2px rgba(29,158,151,0.5)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <p className="text-center text-xs text-gray-300 mt-2">Press Enter to send · Shift+Enter for new line</p>
      </footer>
    </div>
  )
}
