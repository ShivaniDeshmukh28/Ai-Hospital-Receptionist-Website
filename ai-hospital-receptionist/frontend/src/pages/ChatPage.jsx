import { useState, useRef, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import ChatBubble from '../components/ChatBubble'
import TypingIndicator from '../components/TypingIndicator'
import WardBadge from '../components/WardBadge'
import PatientSummaryCard from '../components/PatientSummaryCard'
import FacilitiesModal from '../components/FacilitiesModal'
import SlotBookingCalendar from '../components/SlotBookingCalendar'
import { sendMessage } from '../utils/api'
import SymptomChipGrid from '../components/SymptomChipGrid'
import BodyLocationPicker from '../components/BodyLocationPicker'
import { getSymptomTip, formatSymptomTip } from '../utils/symptomTips'

// Quick-reply suggestion chips
const SUGGESTIONS = [
  { label: '📅 Book a slot', text: 'I want to book a doctor appointment' },
  { label: '🏥 View facilities', action: 'facilities' },
  { label: '🚨 Emergency help', text: 'I need emergency medical help' },
  { label: '💊 Prescription refill', text: 'I need a prescription refill' },
  { label: '🩹 Show pain location', action: 'bodypicker' },
]

const LANGUAGES = [
  { code: 'en', label: '🇬🇧 English' },
  { code: 'hi', label: '🇮🇳 Hindi' },
  { code: 'mr', label: '🇮🇳 Marathi' },
]

function buildInitialMessage(hospital) {
  const hospitalName = hospital?.name || 'our hospital'
  return {
    id: 'init',
    role: 'assistant',
    text: `Welcome to **${hospitalName}**! 🏥\n\nI'm your **AI Hospital Receptionist**. Please describe your health concern and I'll help you get to the right doctor.\n\nYou can speak naturally — just tell me how you're feeling.`,
    timestamp: new Date(),
  }
}

export default function ChatPage({ onReset, hospital }) {
  const [sessionId, setSessionId]           = useState(() => uuidv4())
  const [messages, setMessages]             = useState(() => [buildInitialMessage(hospital)])
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
  const [showBodyPicker, setShowBodyPicker] = useState(false)

  // Cancel modal
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
    setMessages([buildInitialMessage(hospital)])
    setSessionId(uuidv4())
    setWard(null); setPatientData(null); setShowSummary(false); setInput('')
  }, [hospital?.name])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])
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
    setMessages([buildInitialMessage(hospital)])
    setWard(null); setPatientData(null); setShowSummary(false); setInput('')
  }

  function openCancelModal()  { setCancelName(''); setCancelPhone(''); setCancelToken(''); setCancelStatus(null); setShowCancel(true) }
  function closeCancelModal() { setShowCancel(false); setCancelStatus(null) }

  async function handleCancelSubmit() {
    if (!cancelName.trim() || !cancelPhone.trim() || !cancelToken.trim()) return
    setCancelLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setCancelLoading(false)
    setCancelStatus('success')
  }

  async function handleSend(textOverride) {
    const text = (textOverride ?? input).trim()
    if (!text || loading) return
    const userMsg = { id: uuidv4(), role: 'user', text, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInput('')

    // Instant, client-side self-care tip for common mild symptoms (e.g. "I'm
    // feeling dizzy" → sit down, drink water...). This is separate from and
    // does not interrupt the normal AI reply below — it just appears first.
    const tip = getSymptomTip(text)
    if (tip) {
      const tipMsg = {
        id: uuidv4(),
        role: 'assistant',
        text: formatSymptomTip(tip),
        timestamp: new Date(),
        isTip: true,
      }
      setMessages(prev => [...prev, tipMsg])
    }

    setLoading(true)
    try {
      const data = await sendMessage(text, sessionId, {
        hospital_name:        hospital?.name        || null,
        hospital_type:        hospital?.type        || null,
        hospital_area:        hospital?.area        || null,
        hospital_specialties: hospital?.specialties || [],
      })
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
    } catch {
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

  function handleSuggestion(s) {
    if (s.action === 'facilities') { setShowFacilities(true); return }
    if (s.action === 'bodypicker') { setShowBodyPicker(true); return }
    handleSend(s.text)
  }

  const isFormValid = cancelName.trim() && cancelPhone.trim() && cancelToken.trim()
  const msgCount = messages.length

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col relative" style={{ background: 'linear-gradient(160deg, #0B1220 0%, #0D1829 60%, #0B1E2B 100%)' }}>

      {/* ── Header ── */}
      <header
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{
          background: 'rgba(11,18,32,0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(14,206,206,0.12)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        }}
      >
        {/* Left: bot identity */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #0ECECE, #0891B2)', boxShadow: '0 4px 16px rgba(14,206,206,0.35)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </div>
          <div>
            <p className="font-display font-bold text-sm leading-tight" style={{ color: '#F0F9FF' }}>
              {hospital?.name || 'AI Receptionist'}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#10B981', boxShadow: '0 0 6px #10B981' }}/>
              <p className="text-xs font-medium" style={{ color: '#0ECECE' }}>
                {hospital?.area ? `${hospital.area} · ` : ''}Online · Ready to help
              </p>
            </div>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {ward && <WardBadge ward={ward} />}

          {/* Refresh / New Session */}
          <button
            onClick={handleNewSession}
            title="Start a new conversation"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: '#94A3B8',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Refresh
          </button>

          {/* Book Slot */}
          <button
            onClick={() => setShowBookSlot(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'rgba(14,206,206,0.1)',
              color: '#0ECECE',
              border: '1px solid rgba(14,206,206,0.25)',
            }}
          >
            📅 Book Slot
          </button>

          {/* Language */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setShowLangMenu(p => !p)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              🌐 {LANGUAGES.find(l => l.code === currentLang)?.label.split(' ')[1] || 'Lang'}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            {showLangMenu && (
              <div
                className="absolute right-0 top-9 rounded-2xl shadow-2xl z-50 overflow-hidden min-w-[150px] animate-slide-up"
                style={{ background: '#1A2438', border: '1px solid rgba(14,206,206,0.2)', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}
              >
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className="w-full text-left px-4 py-2.5 text-sm transition-all"
                    style={{
                      color: currentLang === lang.code ? '#0ECECE' : '#CBD5E1',
                      fontWeight: currentLang === lang.code ? 700 : 400,
                      background: currentLang === lang.code ? 'rgba(14,206,206,0.1)' : 'transparent',
                    }}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cancel Appointment */}
          <button
            onClick={openCancelModal}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all hover:scale-105 active:scale-95"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.25)' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            Cancel
          </button>
        </div>
      </header>

      {/* ── Messages ── */}
      <main className="flex-1 overflow-y-auto px-4 py-5 space-y-1 scrollbar-hide">
        {messages.map(msg => <ChatBubble key={msg.id} message={msg} />)}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </main>

      {/* ── Quick-reply chips (only show when fresh / few messages) ── */}
      {msgCount <= 2 && !loading && (
        <div className="px-4 pb-2 flex flex-wrap gap-2 justify-center">
          {SUGGESTIONS.map(s => (
            <button
              key={s.label}
              onClick={() => handleSuggestion(s)}
              className="text-xs font-medium px-3 py-1.5 rounded-full transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'rgba(14,206,206,0.08)',
                color: '#67E8F9',
                border: '1px solid rgba(14,206,206,0.2)',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Symptom quick-select grid (new) ── */}
      {msgCount <= 2 && !loading && (
        <SymptomChipGrid onSelect={(s) => handleSend(s.text)} />
      )}

      {/* ── Floating Facilities FAB ── */}
      <button
        onClick={() => setShowFacilities(true)}
        className="absolute right-5 z-40 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-white text-xs font-semibold transition-all hover:scale-105 active:scale-95 animate-pulse-ring"
        style={{
          bottom: '90px',
          background: 'linear-gradient(135deg, #0ECECE, #0891B2)',
          boxShadow: '0 8px 28px rgba(14,206,206,0.4)',
        }}
      >
        <span className="text-base">🏥</span>
        Facilities
        <span
          className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
          style={{ background: 'rgba(255,255,255,0.25)', color: '#fff' }}
        >5</span>
      </button>

      {/* ── Patient Summary Overlay ── */}
      {showSummary && patientData && (
        <PatientSummaryCard data={patientData} ward={ward} onClose={() => setShowSummary(false)} onNewSession={handleNewSession} />
      )}

      {/* ── Facilities Modal ── */}
      {showFacilities && <FacilitiesModal onClose={() => setShowFacilities(false)} />}

      {/* ── Body Location Picker (new) ── */}
      {showBodyPicker && (
        <div
          className="absolute inset-0 z-50 flex items-start justify-center overflow-y-auto"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', padding: '20px 16px' }}
        >
          <div className="w-full max-w-md relative">
            <button
              onClick={() => setShowBodyPicker(false)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              ✕
            </button>
            <div
              className="rounded-3xl overflow-hidden"
              style={{ background: '#131F35', border: '1px solid rgba(14,206,206,0.2)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)', padding: '20px 4px' }}
            >
              <BodyLocationPicker
                onConfirm={({ region, subOption }) => {
                  setShowBodyPicker(false)
                  handleSend(`The pain is in my ${subOption || region.label}`)
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Book Slot Modal ── */}
      {showBookSlot && (
        <div
          className="absolute inset-0 z-50 flex items-start justify-center overflow-y-auto"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', padding: '20px 16px' }}
        >
          <div className="w-full max-w-3xl relative">
            <button
              onClick={() => setShowBookSlot(false)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#CBD5E1', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              ✕
            </button>
            <SlotBookingCalendar />
          </div>
        </div>
      )}

      {/* ── Cancel Modal ── */}
      {showCancel && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)' }}
        >
          <div
            className="w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-slide-in-scale"
            style={{ background: '#131F35', border: '1px solid rgba(14,206,206,0.2)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.15)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2.2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-base" style={{ color: '#F0F9FF' }}>Cancel Appointment</h2>
                    <p className="text-xs" style={{ color: '#64748B' }}>Enter your booking details</p>
                  </div>
                </div>
                <button onClick={closeCancelModal} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors text-sm font-bold"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#64748B' }}>✕</button>
              </div>
            </div>

            {cancelStatus === 'success' ? (
              <div className="px-6 py-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 animate-check-pop"
                  style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.2))', border: '2px solid rgba(16,185,129,0.4)' }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                <h3 className="font-display font-bold text-lg mb-2" style={{ color: '#F0F9FF' }}>Appointment Cancelled</h3>
                <p className="text-sm mb-1" style={{ color: '#94A3B8' }}>
                  Token <strong className="font-mono" style={{ color: '#0ECECE' }}>{cancelToken}</strong> for <strong style={{ color: '#CBD5E1' }}>{cancelName}</strong> has been cancelled.
                </p>
                <p className="text-xs mb-6" style={{ color: '#475569' }}>Your slot has been released.</p>
                <button onClick={closeCancelModal} className="w-full py-3 rounded-2xl text-white text-sm font-semibold medical-gradient">Done</button>
              </div>
            ) : (
              <div className="px-6 py-5 flex flex-col gap-4">
                {[
                  { label: '🎫 Token Number', value: cancelToken, onChange: e => setCancelToken(e.target.value.toUpperCase()), placeholder: 'e.g. GW-247', type: 'text', mono: true },
                  { label: '👤 Full Name', value: cancelName, onChange: e => setCancelName(e.target.value), placeholder: 'Patient full name', type: 'text' },
                  { label: '📱 Phone Number', value: cancelPhone, onChange: e => setCancelPhone(e.target.value), placeholder: 'Registered phone number', type: 'tel' },
                ].map(field => (
                  <div key={field.label}>
                    <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: '#64748B' }}>{field.label}</label>
                    <input
                      type={field.type} value={field.value} onChange={field.onChange} placeholder={field.placeholder}
                      className={`w-full px-4 py-3 rounded-2xl text-sm focus:outline-none transition-all ${field.mono ? 'font-mono font-bold tracking-widest' : ''}`}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: `1.5px solid ${field.value ? 'rgba(14,206,206,0.4)' : 'rgba(255,255,255,0.1)'}`,
                        color: field.mono && field.value ? '#0ECECE' : '#CBD5E1',
                        boxShadow: field.value ? '0 0 0 3px rgba(14,206,206,0.08)' : 'none',
                      }}
                    />
                  </div>
                ))}
                <div className="flex gap-2 items-start px-4 py-3 rounded-2xl" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <span className="flex-shrink-0 mt-0.5">⚠️</span>
                  <p className="text-xs" style={{ color: '#FCD34D' }}>This action cannot be undone. Your appointment slot will be released immediately.</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={closeCancelModal} className="flex-1 py-3 rounded-2xl text-sm font-medium transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.1)' }}>
                    Go Back
                  </button>
                  <button onClick={handleCancelSubmit} disabled={!isFormValid || cancelLoading}
                    className="flex-1 py-3 rounded-2xl text-white text-sm font-semibold transition-all flex items-center justify-center gap-2"
                    style={{
                      background: isFormValid && !cancelLoading ? 'linear-gradient(135deg, #EF4444, #DC2626)' : 'rgba(239,68,68,0.3)',
                      boxShadow: isFormValid && !cancelLoading ? '0 4px 16px rgba(239,68,68,0.4)' : 'none',
                    }}>
                    {cancelLoading
                      ? <><svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Cancelling…</>
                      : 'Confirm Cancel'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Input Bar ── */}
      <footer
        className="px-4 py-3 flex-shrink-0"
        style={{
          background: 'rgba(11,18,32,0.9)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(14,206,206,0.1)',
        }}
      >
        <div className="flex items-end gap-3 max-w-2xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="Describe your health concern…"
              rows={1}
              disabled={loading || showSummary}
              className="w-full resize-none px-5 py-3.5 text-sm focus:outline-none transition-all disabled:opacity-40 leading-relaxed rounded-2xl"
              style={{
                maxHeight: '120px', overflowY: 'auto',
                background: inputFocused ? 'rgba(14,206,206,0.06)' : 'rgba(255,255,255,0.05)',
                border: `1.5px solid ${inputFocused ? 'rgba(14,206,206,0.5)' : 'rgba(255,255,255,0.1)'}`,
                color: '#F0F9FF',
                boxShadow: inputFocused ? '0 0 0 4px rgba(14,206,206,0.1), 0 4px 20px rgba(14,206,206,0.1)' : 'none',
              }}
              style-placeholder={{ color: '#475569' }}
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading || showSummary}
            className="w-12 h-12 rounded-2xl text-white flex items-center justify-center transition-all active:scale-95 disabled:cursor-not-allowed flex-shrink-0"
            style={{
              background: !input.trim() || loading || showSummary
                ? 'rgba(255,255,255,0.06)'
                : 'linear-gradient(135deg, #0ECECE, #0891B2)',
              boxShadow: !input.trim() || loading || showSummary
                ? 'none'
                : '0 4px 20px rgba(14,206,206,0.45)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <p className="text-center text-xs mt-2" style={{ color: 'rgba(71,85,105,0.8)' }}>
          Press Enter to send · Shift+Enter for new line
        </p>
      </footer>
    </div>
  )
}