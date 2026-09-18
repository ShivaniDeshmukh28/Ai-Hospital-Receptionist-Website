import { useState, useEffect } from 'react'
import ChatPage from './ChatPage'
import SlotBookingCalendar from '../components/SlotBookingCalendar'
import { PrescriptionRefillModal } from '../components/PrescriptionRefillModal'
import { AmbulanceRequestModal } from '../components/AmbulanceRequestModal'
import EmergencyTriageTab from '../components/EmergencyTriageTab'

// ── Supported languages ────────────────────────────────────────────────────────
const LANGUAGES = [
  { code:'en',  label:'English',    native:'English',       flag:'🇬🇧' },
  { code:'hi',  label:'Hindi',      native:'हिन्दी',         flag:'🇮🇳' },
  { code:'mr',  label:'Marathi',    native:'मराठी',          flag:'🇮🇳' },
  { code:'kn',  label:'Kannada',    native:'ಕನ್ನಡ',          flag:'🇮🇳' },
  { code:'ta',  label:'Tamil',      native:'தமிழ்',          flag:'🇮🇳' },
  { code:'te',  label:'Telugu',     native:'తెలుగు',         flag:'🇮🇳' },
  { code:'gu',  label:'Gujarati',   native:'ગુજરાતી',        flag:'🇮🇳' },
  { code:'bn',  label:'Bengali',    native:'বাংলা',          flag:'🇮🇳' },
  { code:'pa',  label:'Punjabi',    native:'ਪੰਜਾਬੀ',         flag:'🇮🇳' },
  { code:'ur',  label:'Urdu',       native:'اردو',           flag:'🇵🇰' },
  { code:'ar',  label:'Arabic',     native:'العربية',        flag:'🇸🇦' },
  { code:'fr',  label:'French',     native:'Français',       flag:'🇫🇷' },
]

// ── Sample notification data ───────────────────────────────────────────────────
const INITIAL_NOTIFICATIONS = [
  {
    id: 1, type: 'booked', read: false,
    title: 'Appointment Confirmed',
    desc: 'Dr. Sharma · General Ward · Tomorrow 10:30 AM',
    token: 'GW-247', time: '2 hours ago',
    detail: { doctor:'Dr. Sharma', ward:'General Ward', date:'Tomorrow', time:'10:30 AM', token:'GW-247', phone:'+91 98765 43210' },
  },
  {
    id: 2, type: 'reminder', read: false,
    title: 'Appointment Reminder',
    desc: 'Dr. Mehta · Emergency Ward · Today 3:00 PM',
    token: 'EW-109', time: '30 minutes ago',
    detail: { doctor:'Dr. Mehta', ward:'Emergency Ward', date:'Today', time:'3:00 PM', token:'EW-109', phone:'+91 91234 56789' },
  },
  {
    id: 3, type: 'cancelled', read: true,
    title: 'Appointment Cancelled',
    desc: 'Dr. Rao · Mental Health Ward · Yesterday',
    token: 'MH-055', time: 'Yesterday',
    detail: { doctor:'Dr. Rao', ward:'Mental Health Ward', date:'Yesterday', time:'11:00 AM', token:'MH-055', phone:'+91 87654 32109' },
  },
  {
    id: 4, type: 'booked', read: true,
    title: 'Slot Booked Successfully',
    desc: 'Dr. Gupta · Pediatric Ward · 15 Jun, 9:00 AM',
    token: 'PW-312', time: '2 days ago',
    detail: { doctor:'Dr. Gupta', ward:'Pediatric Ward', date:'15 Jun 2026', time:'9:00 AM', token:'PW-312', phone:'+91 76543 21098' },
  },
  {
    id: 5, type: 'reminder', read: true,
    title: 'Upcoming Appointment',
    desc: 'Dr. Singh · Orthopedic Ward · 16 Jun, 2:00 PM',
    token: 'OW-088', time: '3 days ago',
    detail: { doctor:'Dr. Singh', ward:'Orthopedic Ward', date:'16 Jun 2026', time:'2:00 PM', token:'OW-088', phone:'+91 65432 10987' },
  },
]

// ── Nav items ──────────────────────────────────────────────────────────────────
const NAV = [
  {
    id: 'chat', label: 'Chat',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  },
  {
    id: 'facility', label: 'Facility',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  },
  {
    id: 'diagnostics', label: 'Diagnostic Facilities',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>,
  },
  {
    id: 'bookslot', label: 'Book Slot',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  },
  {
    id: 'notifications', label: 'Notifications',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    badge: true,
  },
  {
    id: 'cancel', label: 'Cancel Booking',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
    danger: true,
  },
  {
    id: 'triage', label: 'Emergency Triage',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
    danger: true,
  },
  {
    id: 'language', label: 'Language',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  },
  {
    id: 'profile', label: 'Edit Profile',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  },
]

const TAB_SUBTITLE = {
  chat:          'Describe your symptoms and get matched to the right doctor',
  facility:      'All wards, departments and amenities',
  diagnostics:   'Book CT, MRI, X-Ray, Sonography and Blood Tests',
  bookslot:      'Choose a date and doctor for your appointment',
  notifications: 'Your bookings, cancellations and reminders',
  cancel:        'Cancel an existing appointment by token',
  triage:        'Describe your symptoms to get an urgency-level assessment',
  language:      'Choose your preferred language for the interface',
  profile:       'Update your personal information',
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── ADMIN PANEL OVERLAY ───────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function AdminPanelOverlay({ onClose, locationData, user }) {
  const [loaded, setLoaded] = useState(false)

  // Write registered patient info to localStorage so the HMS panel can read it
  useEffect(() => {
    if (locationData?.hospital && user) {
      const pending = {
        name    : user.name  || 'Walk-in Patient',
        phone   : user.phone || '',
        email   : user.email || '',
        hospital: locationData.hospital?.name || '',
        city    : locationData.city || '',
        time    : new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        addedAt : Date.now(),
      }
      localStorage.setItem('receptionist_pending_patient', JSON.stringify(pending))
    }
  }, [locationData, user])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', flexDirection: 'column',
      animation: 'adminIn 0.28s cubic-bezier(0.16,1,0.3,1)',
    }}>
      {/* Header */}
      <div style={{
        height: 50, background: '#0D1F17', flexShrink: 0,
        display: 'flex', alignItems: 'center', padding: '0 18px', gap: 12,
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        {/* Logo */}
        <div style={{
          width: 28, height: 28, borderRadius: 7, background: '#12906A',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 14, color: '#fff', fontFamily: 'Syne, sans-serif',
          flexShrink: 0,
        }}>M</div>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 14, color: '#fff' }}>
          MedCare HMS — Admin Panel
        </span>

        {/* Hospital badge */}
        {locationData?.hospital?.name && (
          <span style={{
            padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
            background: 'rgba(18,144,106,0.25)', border: '1px solid rgba(18,144,106,0.4)',
            color: '#4ade80',
          }}>
            📍 {locationData.hospital.name}
          </span>
        )}

        {/* Patient badge */}
        {user?.name && (
          <span style={{
            padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.6)',
          }}>
            👤 {user.name}
          </span>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          {!loaded && (
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Loading…</span>
          )}
          <button
            onClick={onClose}
            style={{
              padding: '7px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.07)', color: '#fff', fontSize: 13,
              fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
          >
            ✕ Close Admin
          </button>
        </div>
      </div>

      {/* iframe */}
      <iframe
        src="/admin/medcare_complete.html"
        style={{
          flex: 1, border: 'none', display: 'block',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s',
        }}
        onLoad={() => setLoaded(true)}
        title="MedCare HMS"
      />

      {/* Loading screen while iframe fetches */}
      {!loaded && (
        <div style={{
          position: 'absolute', top: 50, inset: '50px 0 0 0',
          background: '#0A4A34',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 18,
        }}>
          <div style={{
            width: 44, height: 44,
            border: '3px solid rgba(255,255,255,0.12)',
            borderTop: '3px solid #12906A',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}/>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>
              Loading MedCare HMS
            </p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, margin: 0 }}>
              Make sure medcare_complete.html is in /public/admin/
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes adminIn {
          from { opacity: 0; transform: scale(0.98); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── FLOATING ADMIN BUTTON ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function AdminFab({ onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Open Admin Panel"
      style={{
        position: 'fixed', bottom: 28, right: 28, zIndex: 500,
        display: 'flex', alignItems: 'center', gap: hovered ? 8 : 0,
        padding: '13px 16px',
        borderRadius: 50, border: 'none',
        background: 'linear-gradient(135deg, #0A6E4F, #12906A)',
        color: '#fff', cursor: 'pointer',
        boxShadow: hovered
          ? '0 8px 28px rgba(10,110,79,0.55)'
          : '0 4px 16px rgba(10,110,79,0.4)',
        transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
        fontSize: 13, fontWeight: 700,
        overflow: 'hidden', whiteSpace: 'nowrap',
        maxWidth: hovered ? 180 : 48,
      }}
    >
      {/* Grid icon */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" style={{ flexShrink: 0 }}>
        <rect x="3" y="3" width="7" height="7" rx="1.5"/>
        <rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/>
        <rect x="14" y="14" width="7" height="7" rx="1.5"/>
      </svg>
      {hovered && <span style={{ fontSize: 13 }}>Admin Panel</span>}
    </button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── DIAGNOSTIC FACILITIES TAB ─────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const DIAG_FACILITIES = [
  {
    id: 'ct',
    name: 'CT Scan',
    icon: '🧠',
    desc: 'City/CT Scan for brain, chest, abdomen',
    fee: 2500,
    slots: ['8:00 AM', '10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM'],
    duration: '30 mins',
    prep: 'Fasting 4 hours before scan',
  },
  {
    id: 'mri',
    name: 'MRI',
    icon: '🔬',
    desc: 'Magnetic Resonance Imaging',
    fee: 4000,
    slots: ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM'],
    duration: '45-60 mins',
    prep: 'Remove all metal objects',
  },
  {
    id: 'sono',
    name: 'Sonography',
    icon: '📡',
    desc: 'Ultrasound for abdomen, pelvis, thyroid',
    fee: 800,
    slots: ['8:00 AM', '9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM'],
    duration: '20 mins',
    prep: 'Full bladder required for some scans',
  },
  {
    id: 'xray',
    name: 'X-Ray',
    icon: '💀',
    desc: 'Chest, bone and joint X-Ray',
    fee: 300,
    slots: ['8:00 AM', '10:00 AM', '12:00 PM', '3:00 PM', '5:00 PM'],
    duration: '10 mins',
    prep: 'No special preparation needed',
  },
  {
    id: 'blood',
    name: 'Blood Test',
    icon: '🩸',
    desc: 'CBC, sugar, cholesterol, thyroid and more',
    fee: 500,
    slots: ['7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM'],
    duration: '5 mins',
    prep: 'Fasting 8-12 hours for most tests',
  },
]

function DiagnosticsTab() {
  const [selected, setSelected] = useState(null)
  const [step, setStep]         = useState('list')
  const [name, setName]         = useState('')
  const [phone, setPhone]       = useState('')
  const [email, setEmail]       = useState('')
  const [slot, setSlot]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [focusField, setFocus]  = useState(null)

  function selectFacility(f) { setSelected(f); setStep('detail') }
  function goToForm()         { setSlot(''); setStep('form') }
  function reset()            { setSelected(null); setStep('list'); setName(''); setPhone(''); setEmail(''); setSlot('') }

  async function handleBook() {
    if (!name || !phone || !email || !slot) return
    setLoading(true)
    try {
      await fetch('http://localhost:8000/book-facility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, slot, facility: selected.name, fee: selected.fee }),
      })
    } catch (e) { console.error('Booking error:', e) }
    setLoading(false)
    setStep('success')
  }

  const inputStyle = (f) => ({
    width: '100%', padding: '13px 16px', borderRadius: 12,
    border: `1.5px solid ${focusField === f ? '#1d9e97' : '#e2e8f0'}`,
    background: focusField === f ? 'rgba(29,158,151,0.03)' : '#fafafa',
    fontSize: 14, color: '#1e293b', outline: 'none',
    transition: 'all 0.2s', boxSizing: 'border-box',
    boxShadow: focusField === f ? '0 0 0 3px rgba(29,158,151,0.1)' : 'none',
  })

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', background: '#f8fafb' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        {step !== 'list' && (
          <button
            onClick={() => step === 'form' ? setStep('detail') : reset()}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20,
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, color: '#64748b',
              padding: '6px 10px', borderRadius: 8, transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
            {step === 'form' ? `Back to ${selected?.name}` : 'Back to Diagnostic Facilities'}
          </button>
        )}

        {step === 'list' && (
          <>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
              Diagnostic Facilities
            </h2>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 24px' }}>
              Select a diagnostic test to view details and book an appointment.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {DIAG_FACILITIES.map(f => (
                <button
                  key={f.id}
                  onClick={() => selectFacility(f)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '18px 20px', borderRadius: 18,
                    border: '1px solid #e0f5f4', background: '#f7fffe',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow='0 4px 20px rgba(29,158,151,0.12)'; e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.borderColor='#a8ddd9' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.borderColor='#e0f5f4' }}
                >
                  <div style={{ width: 52, height: 52, borderRadius: 16, flexShrink: 0, background: 'linear-gradient(135deg, #edf7f6, #c7e9e6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                    {f.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, color: '#0f172a', margin: '0 0 2px' }}>{f.name}</p>
                    <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.desc}</p>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1d9e97' }}>₹{f.fee}</span>
                    <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 8 }}>· {f.duration}</span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 'detail' && selected && (
          <div style={{ maxWidth: 500 }}>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 20px' }}>{selected.name}</h2>
            <div style={{ borderRadius: 20, padding: '28px 24px', textAlign: 'center', background: 'linear-gradient(135deg, #edf7f6, #f0fafa)', border: '1px solid #c7e9e6', marginBottom: 20 }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>{selected.icon}</div>
              <p style={{ fontSize: 14, color: '#64748b', margin: 0, lineHeight: 1.6 }}>{selected.desc}</p>
            </div>
            <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #e0f5f4', marginBottom: 24 }}>
              {[
                { label: '💰 Fee', value: `₹${selected.fee}` },
                { label: '⏱️ Duration', value: selected.duration },
                { label: '📋 Preparation', value: selected.prep },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: i % 2 === 0 ? '#f7fffe' : '#fff', borderBottom: i < 2 ? '1px solid #e0f5f4' : 'none' }}>
                  <span style={{ fontSize: 13, color: '#64748b' }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', textAlign: 'right', maxWidth: '60%' }}>{row.value}</span>
                </div>
              ))}
            </div>
            <button onClick={goToForm} style={{ width: '100%', padding: '14px 0', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #1d9e97, #0f7a74)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(29,158,151,0.35)', transition: 'opacity 0.15s' }} onMouseEnter={e=>e.currentTarget.style.opacity='0.92'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
              Book Appointment →
            </button>
          </div>
        )}

        {step === 'form' && selected && (
          <div style={{ maxWidth: 500 }}>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>Book {selected.name}</h2>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 24px' }}>Fill in your details to confirm the appointment.</p>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>🕐 Select Time Slot</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {selected.slots.map(s => (
                  <button key={s} onClick={() => setSlot(s)} style={{ padding: '9px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.15s', background: slot===s?'#1d9e97':'#f0fafa', color: slot===s?'#fff':'#1d9e97', outline: slot===s?'none':'1px solid #c7e9e6', boxShadow: slot===s?'0 2px 8px rgba(29,158,151,0.3)':'none' }}>{s}</button>
                ))}
              </div>
            </div>
            {[
              { label:'👤 Full Name',    key:'name',  val:name,  set:setName,  type:'text',  placeholder:'Enter your full name' },
              { label:'📱 Phone Number', key:'phone', val:phone, set:setPhone, type:'tel',   placeholder:'Enter phone number' },
              { label:'📧 Email',        key:'email', val:email, set:setEmail, type:'email', placeholder:'Enter email for confirmation' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} value={f.val} onChange={e=>f.set(e.target.value)} onFocus={()=>setFocus(f.key)} onBlur={()=>setFocus(null)} style={inputStyle(f.key)}/>
              </div>
            ))}
            <button onClick={handleBook} disabled={!name||!phone||!email||!slot||loading} style={{ width:'100%', padding:'14px 0', borderRadius:12, border:'none', fontSize:14, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:10, cursor:name&&phone&&email&&slot&&!loading?'pointer':'not-allowed', background:name&&phone&&email&&slot&&!loading?'linear-gradient(135deg,#1d9e97,#0f7a74)':'#9dd6d1', color:'#fff', transition:'all 0.2s', boxShadow:name&&phone&&email&&slot&&!loading?'0 4px 16px rgba(29,158,151,0.35)':'none' }}>
              {loading ? <><div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid #fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>Booking…</> : 'Confirm Booking'}
            </button>
          </div>
        )}

        {step === 'success' && selected && (
          <div style={{ maxWidth:500, display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', paddingTop:40 }}>
            <div style={{ width:72, height:72, borderRadius:'50%', background:'#dcfce7', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20 }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:800, color:'#0f172a', margin:'0 0 8px' }}>Booking Confirmed! 🎉</h3>
            <p style={{ fontSize:14, color:'#64748b', marginBottom:24, lineHeight:1.6 }}>
              <strong>{selected.name}</strong> appointment for <strong>{name}</strong> at <strong style={{ color:'#1d9e97' }}>{slot}</strong>
            </p>
            <div style={{ width:'100%', borderRadius:16, padding:'16px 20px', background:'#f0fafa', border:'1px solid #c7e9e6', textAlign:'left', marginBottom:28 }}>
              <p style={{ fontSize:12, color:'#94a3b8', margin:'0 0 4px' }}>Confirmation will be sent to:</p>
              <p style={{ fontSize:14, fontWeight:700, color:'#1d9e97', margin:0 }}>{email}</p>
            </div>
            <div style={{ display:'flex', gap:12, width:'100%' }}>
              <button onClick={reset} style={{ flex:1, padding:'13px 0', borderRadius:12, border:'1.5px solid #e5e7eb', background:'#fff', fontSize:14, fontWeight:600, color:'#475569', cursor:'pointer' }}>Book Another</button>
              <button onClick={reset} style={{ flex:1, padding:'13px 0', borderRadius:12, border:'none', background:'linear-gradient(135deg,#1d9e97,#0f7a74)', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer' }}>Done</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── NOTIFICATIONS TAB ─────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function NotificationsTab() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
  const [filter, setFilter]               = useState('all')
  const [selected, setSelected]           = useState(null)

  const unreadCount = notifications.filter(n => !n.read).length
  const filtered    = filter==='all' ? notifications : notifications.filter(n=>n.type===filter)

  function markRead(id)   { setNotifications(ns=>ns.map(n=>n.id===id?{...n,read:true}:n)) }
  function markAllRead()  { setNotifications(ns=>ns.map(n=>({...n,read:true}))) }
  function deleteNotif(id){ setNotifications(ns=>ns.filter(n=>n.id!==id)); if(selected?.id===id) setSelected(null) }
  function openDetail(notif){ markRead(notif.id); setSelected(notif) }

  const TYPE_META = {
    booked:    { color:'#1d9e97', bg:'#f0faf9', icon:'✅', label:'Booked'    },
    cancelled: { color:'#ef4444', bg:'#fef2f2', icon:'❌', label:'Cancelled' },
    reminder:  { color:'#f59e0b', bg:'#fffbeb', icon:'🔔', label:'Reminder'  },
  }
  const FILTERS = [
    { id:'all',       label:'All',       count: notifications.length },
    { id:'booked',    label:'Booked',    count: notifications.filter(n=>n.type==='booked').length    },
    { id:'cancelled', label:'Cancelled', count: notifications.filter(n=>n.type==='cancelled').length },
    { id:'reminder',  label:'Reminders', count: notifications.filter(n=>n.type==='reminder').length  },
  ]

  return (
    <div style={{ flex:1, display:'flex', overflow:'hidden', background:'#f8fafb' }}>
      <div style={{ width:selected?380:'100%', flexShrink:0, display:'flex', flexDirection:'column', borderRight:selected?'1px solid #f1f5f9':'none', transition:'width 0.25s', overflow:'hidden' }}>
        <div style={{ padding:'20px 24px 14px', background:'#fff', borderBottom:'1px solid #f1f5f9' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:800, color:'#0f172a', margin:0 }}>Notifications</h2>
              {unreadCount>0 && <span style={{ padding:'2px 9px', borderRadius:20, background:'#1d9e97', color:'#fff', fontSize:11, fontWeight:700 }}>{unreadCount} new</span>}
            </div>
            {unreadCount>0 && <button onClick={markAllRead} style={{ fontSize:12, fontWeight:600, color:'#1d9e97', background:'none', border:'none', cursor:'pointer', padding:'4px 8px', borderRadius:8 }} onMouseEnter={e=>e.currentTarget.style.background='rgba(29,158,151,0.08)'} onMouseLeave={e=>e.currentTarget.style.background='none'}>Mark all read</button>}
          </div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {FILTERS.map(f=>(
              <button key={f.id} onClick={()=>setFilter(f.id)} style={{ padding:'5px 13px', borderRadius:20, border:'none', cursor:'pointer', fontSize:12, fontWeight:600, background:filter===f.id?'#1d9e97':'#f1f5f9', color:filter===f.id?'#fff':'#64748b', transition:'all 0.15s' }}>
                {f.label} <span style={{ opacity:0.75 }}>({f.count})</span>
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'8px' }}>
          {filtered.length===0 ? (
            <div style={{ padding:'48px 24px', textAlign:'center' }}>
              <div style={{ fontSize:40, marginBottom:12 }}>🔕</div>
              <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:'#0f172a', margin:'0 0 6px' }}>No notifications</p>
              <p style={{ fontSize:13, color:'#94a3b8', margin:0 }}>Nothing to show in this category</p>
            </div>
          ) : filtered.map(notif=>{
            const meta=TYPE_META[notif.type]; const isSelected=selected?.id===notif.id
            return (
              <div key={notif.id} onClick={()=>openDetail(notif)} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'14px 12px', borderRadius:12, cursor:'pointer', marginBottom:2, background:isSelected?'rgba(29,158,151,0.07)':notif.read?'transparent':'rgba(29,158,151,0.04)', border:isSelected?'1.5px solid rgba(29,158,151,0.2)':'1.5px solid transparent', transition:'all 0.15s', position:'relative' }}
                onMouseEnter={e=>{if(!isSelected)e.currentTarget.style.background='rgba(29,158,151,0.05)'}}
                onMouseLeave={e=>{if(!isSelected)e.currentTarget.style.background=notif.read?'transparent':'rgba(29,158,151,0.04)'}}
              >
                {!notif.read && <div style={{ position:'absolute', top:14, right:12, width:7, height:7, borderRadius:'50%', background:'#1d9e97' }}/>}
                <div style={{ width:38, height:38, borderRadius:11, background:meta.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0 }}>{meta.icon}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontWeight:notif.read?600:700, fontSize:13, color:'#0f172a', margin:'0 0 3px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{notif.title}</p>
                  <p style={{ fontSize:12, color:'#64748b', margin:'0 0 4px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{notif.desc}</p>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:10, fontWeight:700, color:meta.color, background:meta.bg, padding:'2px 7px', borderRadius:20 }}>{meta.label}</span>
                    <span style={{ fontSize:11, color:'#94a3b8' }}>{notif.time}</span>
                  </div>
                </div>
                <button onClick={e=>{e.stopPropagation();deleteNotif(notif.id)}} style={{ width:26, height:26, borderRadius:7, border:'none', background:'transparent', cursor:'pointer', color:'#cbd5e1', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.15s' }} onMouseEnter={e=>{e.currentTarget.style.background='#fef2f2';e.currentTarget.style.color='#ef4444'}} onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#cbd5e1'}}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            )
          })}
        </div>
      </div>
      {selected && (
        <div style={{ flex:1, overflowY:'auto', padding:'28px', background:'#fff', display:'flex', flexDirection:'column', animation:'slideInRight 0.22s ease' }}>
          <button onClick={()=>setSelected(null)} style={{ alignSelf:'flex-start', display:'flex', alignItems:'center', gap:6, fontSize:13, fontWeight:600, color:'#64748b', background:'none', border:'none', cursor:'pointer', padding:'6px 10px', borderRadius:8, marginBottom:20 }} onMouseEnter={e=>e.currentTarget.style.background='#f1f5f9'} onMouseLeave={e=>e.currentTarget.style.background='none'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>Back
          </button>
          {(() => { const meta=TYPE_META[selected.type]; return (
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'8px 14px', borderRadius:14, background:meta.bg, border:`1px solid ${meta.color}22`, alignSelf:'flex-start', marginBottom:20 }}>
              <span style={{ fontSize:18 }}>{meta.icon}</span>
              <span style={{ fontWeight:700, fontSize:13, color:meta.color }}>{meta.label}</span>
              <span style={{ fontSize:12, color:'#94a3b8' }}>· {selected.time}</span>
            </div>
          )})()}
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:'#0f172a', margin:'0 0 6px' }}>{selected.title}</h2>
          <p style={{ fontSize:14, color:'#64748b', margin:'0 0 28px', lineHeight:1.6 }}>{selected.desc}</p>
          <div style={{ background:'#f8fafb', borderRadius:20, padding:'24px', border:'1px solid #f1f5f9', marginBottom:20 }}>
            <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, color:'#0f172a', margin:'0 0 18px', textTransform:'uppercase', letterSpacing:0.5 }}>Appointment Details</h3>
            {[
              { icon:'🎫', label:'Token',  val:selected.detail.token,  mono:true },
              { icon:'👨‍⚕️', label:'Doctor', val:selected.detail.doctor },
              { icon:'🏥', label:'Ward',   val:selected.detail.ward   },
              { icon:'📅', label:'Date',   val:selected.detail.date   },
              { icon:'🕐', label:'Time',   val:selected.detail.time   },
              { icon:'📱', label:'Phone',  val:selected.detail.phone  },
            ].map(row=>(
              <div key={row.label} style={{ display:'flex', alignItems:'center', paddingBottom:14, marginBottom:14, borderBottom:'1px solid #f1f5f9' }}>
                <span style={{ fontSize:16, width:28, flexShrink:0 }}>{row.icon}</span>
                <span style={{ fontSize:12, fontWeight:700, color:'#94a3b8', width:70, textTransform:'uppercase', letterSpacing:0.5, flexShrink:0 }}>{row.label}</span>
                <span style={{ fontSize:14, fontWeight:row.mono?700:500, color:row.mono?'#1d9e97':'#0f172a', fontFamily:row.mono?'monospace':'inherit', letterSpacing:row.mono?1:0 }}>{row.val}</span>
              </div>
            ))}
          </div>
          {selected.type!=='cancelled' && (
            <div style={{ display:'flex', gap:10 }}>
              <button style={{ flex:1, padding:'12px 0', borderRadius:12, border:'none', background:'linear-gradient(135deg,#1d9e97,#0f7a74)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 16px rgba(29,158,151,0.3)' }}>📋 View Appointment</button>
              <button onClick={()=>deleteNotif(selected.id)} style={{ flex:1, padding:'12px 0', borderRadius:12, border:'1px solid #fecaca', background:'#fef2f2', color:'#dc2626', fontSize:13, fontWeight:700, cursor:'pointer' }}>🗑️ Dismiss</button>
            </div>
          )}
        </div>
      )}
      <style>{`@keyframes slideInRight{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}`}</style>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── LANGUAGE TAB ──────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function LanguageTab({ selectedLang, onSelectLang }) {
  const [search, setSearch]   = useState('')
  const [saved, setSaved]     = useState(false)
  const [pending, setPending] = useState(selectedLang)

  const filtered = LANGUAGES.filter(l=>l.label.toLowerCase().includes(search.toLowerCase())||l.native.toLowerCase().includes(search.toLowerCase()))

  function handleSave() { onSelectLang(pending); setSaved(true); setTimeout(()=>setSaved(false),2500) }

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'28px 32px', background:'#f8fafb' }}>
      <div style={{ maxWidth:640, margin:'0 auto' }}>
        <div style={{ marginBottom:24 }}>
          <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:'#0f172a', margin:'0 0 4px' }}>Language Settings</h2>
          <p style={{ fontSize:13, color:'#94a3b8', margin:0 }}>Choose your preferred language for the interface</p>
        </div>
        <div style={{ background:'#fff', borderRadius:20, padding:'20px 22px', border:'1px solid rgba(29,158,151,0.15)', boxShadow:'0 1px 8px rgba(29,158,151,0.06)', marginBottom:20, display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:46, height:46, borderRadius:14, background:'rgba(29,158,151,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
            {LANGUAGES.find(l=>l.code===pending)?.flag}
          </div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:1, margin:'0 0 3px' }}>Currently Selected</p>
            <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, color:'#0f172a', margin:0 }}>{LANGUAGES.find(l=>l.code===pending)?.label}</p>
            <p style={{ fontSize:12, color:'#64748b', margin:'2px 0 0' }}>{LANGUAGES.find(l=>l.code===pending)?.native}</p>
          </div>
          {pending!==selectedLang && <span style={{ fontSize:11, fontWeight:700, color:'#f59e0b', background:'#fffbeb', padding:'3px 10px', borderRadius:20, border:'1px solid #fde68a' }}>Unsaved</span>}
        </div>
        <div style={{ position:'relative', marginBottom:16 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input placeholder="Search language…" value={search} onChange={e=>setSearch(e.target.value)} style={{ width:'100%', padding:'11px 14px 11px 38px', borderRadius:12, border:'1.5px solid #e2e8f0', background:'#fff', fontSize:14, color:'#0f172a', outline:'none', boxSizing:'border-box', transition:'border 0.15s' }} onFocus={e=>e.target.style.borderColor='#1d9e97'} onBlur={e=>e.target.style.borderColor='#e2e8f0'}/>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))', gap:10, marginBottom:24 }}>
          {filtered.map(lang=>{
            const isSelected=pending===lang.code
            return (
              <button key={lang.code} onClick={()=>setPending(lang.code)} style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', borderRadius:14, border:'none', cursor:'pointer', textAlign:'left', background:isSelected?'rgba(29,158,151,0.08)':'#fff', outline:isSelected?'2px solid #1d9e97':'1.5px solid #f1f5f9', transition:'all 0.15s', boxShadow:isSelected?'0 2px 12px rgba(29,158,151,0.15)':'0 1px 4px rgba(0,0,0,0.03)' }} onMouseEnter={e=>{if(!isSelected){e.currentTarget.style.background='rgba(29,158,151,0.04)';e.currentTarget.style.outline='1.5px solid rgba(29,158,151,0.2)'}}} onMouseLeave={e=>{if(!isSelected){e.currentTarget.style.background='#fff';e.currentTarget.style.outline='1.5px solid #f1f5f9'}}}>
                <span style={{ fontSize:22, flexShrink:0 }}>{lang.flag}</span>
                <div style={{ minWidth:0 }}>
                  <p style={{ fontWeight:isSelected?700:600, fontSize:13, color:isSelected?'#0f7a74':'#0f172a', margin:0 }}>{lang.label}</p>
                  <p style={{ fontSize:12, color:'#94a3b8', margin:'2px 0 0', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{lang.native}</p>
                </div>
                {isSelected && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1d9e97" strokeWidth="2.5" strokeLinecap="round" style={{ marginLeft:'auto', flexShrink:0 }}><path d="M20 6L9 17l-5-5"/></svg>}
              </button>
            )
          })}
          {filtered.length===0 && <div style={{ gridColumn:'1/-1', padding:'32px', textAlign:'center', color:'#94a3b8', fontSize:14 }}>No languages match "{search}"</div>}
        </div>
        <button onClick={handleSave} disabled={pending===selectedLang} style={{ width:'100%', padding:'14px 0', borderRadius:12, border:'none', background:saved?'linear-gradient(135deg,#10b981,#059669)':pending===selectedLang?'#e2e8f0':'linear-gradient(135deg,#1d9e97,#0f7a74)', color:pending===selectedLang?'#94a3b8':'#fff', fontSize:14, fontWeight:700, cursor:pending===selectedLang?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10, transition:'all 0.3s', boxShadow:pending===selectedLang?'none':'0 4px 16px rgba(29,158,151,0.35)' }}>
          {saved?'✅ Language Saved!':pending===selectedLang?'✓ Already Selected':`🌐 Apply ${LANGUAGES.find(l=>l.code===pending)?.label}`}
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── CANCEL TAB ────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function CancelTab() {
  const [cancelName, setCancelName]   = useState('')
  const [cancelPhone, setCancelPhone] = useState('')
  const [cancelToken, setCancelToken] = useState('')
  const [cancelStatus, setStatus]     = useState(null)
  const [loading, setLoading]         = useState(false)
  const [focusField, setFocus]        = useState(null)
  const isValid = cancelName.trim() && cancelPhone.trim() && cancelToken.trim()

  async function handleSubmit() { if(!isValid)return; setLoading(true); await new Promise(r=>setTimeout(r,1400)); setLoading(false); setStatus('success') }
  function handleReset() { setCancelName(''); setCancelPhone(''); setCancelToken(''); setStatus(null) }

  const fieldStyle = (f) => ({ width:'100%', padding:'13px 16px', borderRadius:12, border:`1.5px solid ${focusField===f?'#1d9e97':'#e2e8f0'}`, background:focusField===f?'rgba(29,158,151,0.03)':'#fafafa', fontSize:14, color:'#1e293b', outline:'none', transition:'all 0.2s', boxSizing:'border-box', boxShadow:focusField===f?'0 0 0 3px rgba(29,158,151,0.1)':'none' })

  if (cancelStatus==='success') return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:32 }}>
      <div style={{ background:'#fff', borderRadius:24, padding:'48px 40px', boxShadow:'0 4px 24px rgba(0,0,0,0.06)', border:'1px solid #e2e8f0', maxWidth:420, width:'100%', textAlign:'center' }}>
        <div style={{ width:72, height:72, borderRadius:'50%', margin:'0 auto 20px', background:'#dcfce7', display:'flex', alignItems:'center', justifyContent:'center' }}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg></div>
        <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:'#0f172a', margin:'0 0 8px' }}>Appointment Cancelled</h3>
        <p style={{ fontSize:14, color:'#64748b', lineHeight:1.6, marginBottom:28 }}>Token <strong style={{ color:'#1d9e97', fontFamily:'monospace' }}>{cancelToken}</strong> for <strong>{cancelName}</strong> successfully cancelled.</p>
        <button onClick={handleReset} style={{ padding:'12px 36px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#1d9e97,#0f7a74)', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:'0 4px 16px rgba(29,158,151,0.35)' }}>Done</button>
      </div>
    </div>
  )

  return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:32 }}>
      <div style={{ background:'#fff', borderRadius:24, padding:'36px', boxShadow:'0 4px 24px rgba(0,0,0,0.06)', border:'1px solid #e2e8f0', maxWidth:480, width:'100%' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:28 }}>
          <div style={{ width:48, height:48, borderRadius:14, background:'#fef2f2', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg></div>
          <div>
            <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:'#0f172a', margin:0 }}>Cancel Appointment</h2>
            <p style={{ fontSize:13, color:'#94a3b8', margin:'3px 0 0' }}>Enter your booking details to cancel</p>
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:18 }}>
          {[
            { label:'🎫 Token Number', key:'token', placeholder:'e.g. GW-247', val:cancelToken, set:setCancelToken, mono:true },
            { label:'👤 Full Name',    key:'name',  placeholder:'Enter patient full name', val:cancelName, set:setCancelName },
            { label:'📱 Phone Number', key:'phone', placeholder:'Registered phone number', val:cancelPhone, set:setCancelPhone, type:'tel' },
          ].map(f=>(
            <div key={f.key}>
              <label style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>{f.label}</label>
              <input type={f.type||'text'} placeholder={f.placeholder} value={f.val} onChange={e=>f.set(f.key==='token'?e.target.value.toUpperCase():e.target.value)} onFocus={()=>setFocus(f.key)} onBlur={()=>setFocus(null)} style={{ ...fieldStyle(f.key), ...(f.mono?{fontFamily:'monospace',fontWeight:700,letterSpacing:2}:{}) }}/>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'12px 14px', borderRadius:12, background:'#fff7ed', border:'1px solid #fed7aa', marginBottom:22 }}>
          <span style={{ fontSize:16, flexShrink:0 }}>⚠️</span>
          <p style={{ fontSize:13, color:'#92400e', margin:0, lineHeight:1.5 }}>This action cannot be undone. Your slot will be released immediately.</p>
        </div>
        <button onClick={handleSubmit} disabled={!isValid||loading} style={{ width:'100%', padding:'14px 0', borderRadius:12, border:'none', background:isValid&&!loading?'linear-gradient(135deg,#ef4444,#dc2626)':'#fca5a5', color:'#fff', fontSize:14, fontWeight:700, cursor:isValid&&!loading?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', gap:10, transition:'all 0.2s', boxShadow:isValid&&!loading?'0 4px 16px rgba(220,38,38,0.35)':'none' }}>
          {loading?<><div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid #fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>Cancelling…</>:'Confirm Cancellation'}
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── FACILITY TAB ──────────────────────────────────────────────────────────────
// Now accepts `onOpenRefill` and `onOpenAmbulance` — both passed down from
// DashboardLayout — so the Pharmacy amenity card can open the same
// PrescriptionRefillModal that the sidebar "Prescription Refill" button opens,
// and the Ambulance amenity card can open the same AmbulanceRequestModal that
// Emergency Triage's "Request Ambulance" button opens. Shared flows, multiple
// entry points.
// ═══════════════════════════════════════════════════════════════════════════════
function FacilityTab({ onOpenRefill, onOpenAmbulance }) {
  const WARDS = [
    { name:'General Ward',       icon:'🏥', color:'#1d9e97', bg:'#f0faf9', beds:40, available:12, doctors:['Dr. Sharma','Dr. Patel'],  timing:'8am – 8pm' },
    { name:'Emergency Ward',     icon:'🚨', color:'#ef4444', bg:'#fef2f2', beds:20, available:5,  doctors:['Dr. Mehta','Dr. Khan'],    timing:'24/7'      },
    { name:'Mental Health Ward', icon:'🧠', color:'#a855f7', bg:'#faf5ff', beds:15, available:8,  doctors:['Dr. Rao','Dr. Joshi'],     timing:'9am – 6pm' },
    { name:'Pediatric Ward',     icon:'👶', color:'#f59e0b', bg:'#fffbeb', beds:25, available:10, doctors:['Dr. Gupta','Dr. Nair'],    timing:'8am – 9pm' },
    { name:'Orthopedic Ward',    icon:'🦴', color:'#0ea5e9', bg:'#f0f9ff', beds:18, available:7,  doctors:['Dr. Singh','Dr. Verma'],   timing:'9am – 5pm' },
  ]

  // Pharmacy carries an `action: 'refill'` flag and Ambulance an
  // `action: 'ambulance'` flag — the render below checks for these flags to
  // decide whether the card is clickable and which modal it opens, versus the
  // other amenities which stay static info cards.
  const AMENITIES = [
    { icon:'🅿️', label:'Parking',   desc:'200+ slots'      },
    { icon:'🍽️', label:'Cafeteria', desc:'6am – 10pm'      },
    { icon:'💊', label:'Pharmacy',  desc:'24/7 in-house',  action:'refill' },
    { icon:'🩺', label:'Lab',       desc:'Reports in 2hrs' },
    { icon:'🚑', label:'Ambulance', desc:'Call 108 · 24/7', action:'ambulance' },
    { icon:'📶', label:'Wi-Fi',     desc:'All wards'       },
  ]

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'28px 32px', background:'#f8fafb' }}>
      <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:'#0f172a', margin:'0 0 4px' }}>Hospital Facilities</h2>
      <p style={{ fontSize:13, color:'#94a3b8', margin:'0 0 24px' }}>Overview of all wards, doctors, and amenities.</p>
      <h3 style={{ fontSize:12, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:1, margin:'0 0 14px' }}>Wards & Departments</h3>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:14, marginBottom:32 }}>
        {WARDS.map(w=>(
          <div key={w.name} style={{ background:'#fff', borderRadius:18, padding:'18px 20px', border:'1px solid #f1f5f9', boxShadow:'0 1px 6px rgba(0,0,0,0.04)', transition:'all 0.2s' }} onMouseEnter={e=>{e.currentTarget.style.boxShadow=`0 4px 20px ${w.color}22`;e.currentTarget.style.transform='translateY(-1px)'}} onMouseLeave={e=>{e.currentTarget.style.boxShadow='0 1px 6px rgba(0,0,0,0.04)';e.currentTarget.style.transform='translateY(0)'}}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:38, height:38, borderRadius:11, background:w.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{w.icon}</div>
                <div>
                  <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, color:'#0f172a', margin:0 }}>{w.name}</p>
                  <p style={{ fontSize:11, color:'#94a3b8', margin:'2px 0 0' }}>⏰ {w.timing}</p>
                </div>
              </div>
              <span style={{ padding:'3px 9px', borderRadius:20, background:w.bg, fontSize:11, fontWeight:700, color:w.color }}>{w.available} free</span>
            </div>
            <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:10 }}>
              {w.doctors.map(d=><span key={d} style={{ padding:'3px 9px', borderRadius:20, background:'#f8fafc', border:'1px solid #e2e8f0', fontSize:11, color:'#475569' }}>👨‍⚕️ {d}</span>)}
            </div>
            <div style={{ height:5, borderRadius:10, background:'#f1f5f9', overflow:'hidden' }}>
              <div style={{ height:'100%', borderRadius:10, width:`${(w.available/w.beds)*100}%`, background:w.color }}/>
            </div>
            <p style={{ fontSize:11, color:'#94a3b8', margin:'5px 0 0' }}>{w.available}/{w.beds} beds available</p>
          </div>
        ))}
      </div>
      <h3 style={{ fontSize:12, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:1, margin:'0 0 14px' }}>Amenities</h3>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:10 }}>
        {AMENITIES.map(a=>{
          const isAmbulance = a.action === 'ambulance'
          const isClickable = a.action === 'refill' || isAmbulance
          // Ambulance uses the red accent to match its modal; Pharmacy keeps teal.
          const accent      = isAmbulance ? '#ef4444' : '#1d9e97'
          const accentSoft  = isAmbulance ? 'rgba(239,68,68,0.25)' : 'rgba(29,158,151,0.25)'
          const accentGlow  = isAmbulance ? '0 4px 16px rgba(239,68,68,0.15)' : '0 4px 16px rgba(29,158,151,0.15)'
          const cardStyle = {
            background:'#fff', borderRadius:14, padding:'14px 16px',
            border: isClickable ? `1px solid ${accentSoft}` : '1px solid #f1f5f9',
            display:'flex', alignItems:'center', gap:10, width:'100%', textAlign:'left',
            cursor: isClickable ? 'pointer' : 'default',
            transition:'all 0.15s',
          }
          const content = (
            <>
              <span style={{ fontSize: 22 }}>{a.icon}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontWeight:700, fontSize:13, color:'#0f172a', margin:0 }}>{a.label}</p>
                <p style={{ fontSize:11, color:'#94a3b8', margin:'2px 0 0' }}>{a.desc}</p>
              </div>
              {isClickable && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink:0 }}>
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              )}
            </>
          )
          return isClickable ? (
            <button
              key={a.label}
              onClick={isAmbulance ? onOpenAmbulance : onOpenRefill}
              style={cardStyle}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = accentGlow; e.currentTarget.style.borderColor = accent }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = accentSoft }}
            >
              {content}
            </button>
          ) : (
            <div key={a.label} style={cardStyle}>{content}</div>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── BOOK SLOT TAB ─────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function BookSlotTab() {
  return (
    <div style={{ flex:1, overflowY:'auto', padding:'28px 32px', background:'#f8fafb' }}>
      <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:'#0f172a', margin:'0 0 4px' }}>Book a Slot</h2>
      <p style={{ fontSize:13, color:'#94a3b8', margin:'0 0 24px' }}>Select your preferred date and doctor for a consultation.</p>
      <SlotBookingCalendar />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── EDIT PROFILE TAB ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function EditProfileTab({ user, onUpdateUser }) {
  const [name, setName]   = useState(user?.name  || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [dob, setDob]     = useState(user?.dob   || '')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading]  = useState(false)
  const [focusField, setFocus] = useState(null)

  const isGoogle = user?.provider === 'google'
  const initials = name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || '?'

  function handleSave() {
    setLoading(true)
    setTimeout(()=>{ setLoading(false); onUpdateUser?.({...user,name,email,phone,dob}); setSaved(true); setTimeout(()=>setSaved(false),3000) },1000)
  }

  const inputStyle = (f) => ({ width:'100%', padding:'13px 16px', borderRadius:12, border:`1.5px solid ${focusField===f?'#1d9e97':'#e2e8f0'}`, background:focusField===f?'rgba(29,158,151,0.03)':'#fafafa', fontSize:14, color:'#1e293b', outline:'none', transition:'all 0.2s', boxSizing:'border-box', boxShadow:focusField===f?'0 0 0 3px rgba(29,158,151,0.1)':'none' })

  return (
    <div style={{ flex:1, overflowY:'auto', padding:'28px 32px', background:'#f8fafb', display:'flex', justifyContent:'center' }}>
      <div style={{ width:'100%', maxWidth:520 }}>
        <h2 style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:'#0f172a', margin:'0 0 4px' }}>Edit Profile</h2>
        <p style={{ fontSize:13, color:'#94a3b8', margin:'0 0 24px' }}>Update your personal information</p>
        <div style={{ background:'#fff', borderRadius:20, padding:'24px', boxShadow:'0 1px 8px rgba(0,0,0,0.05)', border:'1px solid #f1f5f9', marginBottom:16, display:'flex', alignItems:'center', gap:18 }}>
          <div style={{ width:64, height:64, borderRadius:'50%', flexShrink:0, background:isGoogle?'linear-gradient(135deg,#4285F4,#34A853)':'linear-gradient(135deg,#1d9e97,#0f7a74)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:22 }}>
            {isGoogle?'G':initials}
          </div>
          <div>
            <p style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:17, color:'#0f172a', margin:'0 0 3px' }}>{name||'Your Name'}</p>
            <p style={{ fontSize:13, color:'#94a3b8', margin:'0 0 8px' }}>{email||'your@email.com'}</p>
            <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:20, background:isGoogle?'rgba(66,133,244,0.1)':'rgba(29,158,151,0.1)', color:isGoogle?'#4285F4':'#0f7a74' }}>
              {isGoogle?'🔵 Google Account':'✉️ Email Account'}
            </span>
          </div>
        </div>
        <div style={{ background:'#fff', borderRadius:20, padding:'24px', boxShadow:'0 1px 8px rgba(0,0,0,0.05)', border:'1px solid #f1f5f9', marginBottom:14 }}>
          <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, color:'#0f172a', margin:'0 0 18px' }}>Personal Information</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {[
              { label:'👤 Full Name',     key:'name',  val:name,  set:setName,  type:'text',  placeholder:'Enter your full name'    },
              { label:'✉️ Email',         key:'email', val:email, set:setEmail, type:'email', placeholder:'Enter your email', disabled:isGoogle },
              { label:'📱 Phone Number',  key:'phone', val:phone, set:setPhone, type:'tel',   placeholder:'Enter your phone number'  },
              { label:'🎂 Date of Birth', key:'dob',   val:dob,   set:setDob,   type:'date',  placeholder:''                        },
            ].map(f=>(
              <div key={f.key}>
                <label style={{ fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} value={f.val} onChange={e=>f.set(e.target.value)} onFocus={()=>setFocus(f.key)} onBlur={()=>setFocus(null)} disabled={f.disabled} style={{ ...inputStyle(f.key), opacity:f.disabled?0.5:1, cursor:f.disabled?'not-allowed':'text' }}/>
                {f.disabled && <span style={{ fontSize:11, color:'#94a3b8', marginTop:4, display:'block' }}>Email managed by Google.</span>}
              </div>
            ))}
          </div>
        </div>
        <button onClick={handleSave} disabled={loading} style={{ width:'100%', padding:'14px 0', borderRadius:12, border:'none', background:saved?'linear-gradient(135deg,#10b981,#059669)':loading?'rgba(29,158,151,0.4)':'linear-gradient(135deg,#1d9e97,#0f7a74)', color:loading?'rgba(255,255,255,0.7)':'#fff', fontSize:14, fontWeight:700, cursor:loading?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10, transition:'all 0.3s', boxShadow:loading?'none':'0 4px 16px rgba(29,158,151,0.35)' }}>
          {loading?<><div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid #fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>Saving…</>:saved?<>✅ Profile Saved!</>:<>💾 Save Changes</>}
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── MAIN DASHBOARD LAYOUT ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function DashboardLayout({ onReset, locationData, hospital, user, onUpdateUser }) {
  const [activeTab, setActiveTab]     = useState('chat')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [language, setLanguage]       = useState('en')
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
  const [showAdmin, setShowAdmin]     = useState(false)
  const [showRefill, setShowRefill]   = useState(false)

  // null = closed. An object = open; it carries the triage context (urgency /
  // symptoms) when the flow was started from Emergency Triage, and is empty
  // when started from the Facility tab's Ambulance amenity card.
  const [ambulanceRequest, setAmbulanceRequest] = useState(null)

  const unreadCount  = notifications.filter(n => !n.read).length
  const displayName  = user?.name || user?.email?.split('@')[0] || 'Guest'
  const displayEmail = user?.email || ''
  const initials     = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'G'
  const isGoogle     = user?.provider === 'google'
  const currentLang  = LANGUAGES.find(l => l.code === language)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-800">
      {/* ════ SIDEBAR ════ */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} shrink-0 bg-white border-r border-slate-200/80 flex flex-col transition-all duration-300 relative z-20 shadow-sm`}>
        {/* Logo Header */}
        <div className={`h-16 px-4 flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'} border-b border-slate-100`}>
          {sidebarOpen && (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center shadow-md shadow-teal-700/20 shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 4v16M4 12h16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="font-display font-extrabold text-base text-slate-900 tracking-tight whitespace-nowrap">MediCare AI</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(o => !o)} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>

        {/* Hospital Badge */}
        {sidebarOpen && hospital?.name && (
          <div className="mx-3 mt-3 p-3 rounded-2xl bg-teal-50/70 border border-teal-100 flex items-start gap-2.5">
            <span className="text-base">🏥</span>
            <div className="overflow-hidden">
              <p className="text-[10px] font-extrabold text-teal-700 uppercase tracking-wider">Hospital Desk</p>
              <p className="text-xs font-bold text-slate-900 truncate">{hospital.name}</p>
              {hospital.area && <p className="text-[11px] text-slate-500 truncate">{hospital.area}</p>}
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarOpen && <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Main Menu</p>}
          {NAV.map(item => {
            const active    = activeTab === item.id
            const showBadge = item.badge && unreadCount > 0
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-3 py-2.5' : 'justify-center py-2.5'} rounded-2xl font-medium text-xs sm:text-sm transition-all text-left ${active ? (item.danger ? 'bg-red-50 text-red-700 font-bold' : 'bg-teal-600 text-white font-bold shadow-md shadow-teal-700/20') : (item.danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')}`}
              >
                <span className={`shrink-0 ${active ? 'text-white' : ''}`}>
                  {item.icon}
                </span>
                {sidebarOpen && <span className="flex-1 truncate">{item.label}</span>}
                {sidebarOpen && showBadge && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-500 text-white">{unreadCount}</span>
                )}
              </button>
            )
          })}

          {/* Admin Panel Button */}
          <div className="pt-3 border-t border-slate-100 mt-2">
            <button
              onClick={() => setShowAdmin(true)}
              className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-3 py-2.5' : 'justify-center py-2.5'} rounded-2xl font-bold text-xs sm:text-sm text-teal-800 bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200/60 transition-all`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
                <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
              </svg>
              {sidebarOpen && <span className="flex-1">Admin Panel</span>}
              {sidebarOpen && <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-teal-700 text-white">HMS</span>}
            </button>
          </div>

          {/* Prescription Refill Button — opens the same modal/flow as the
              Pharmacy amenity card in the Facility tab */}
          <div className="mt-2">
            <button
              onClick={() => setShowRefill(true)}
              className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-3 py-2.5' : 'justify-center py-2.5'} rounded-2xl font-bold text-xs sm:text-sm text-teal-800 bg-teal-50/80 hover:bg-teal-100/80 border border-teal-200/60 transition-all`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.5 20.5 3 13a4.95 4.95 0 1 1 7-7l7.5 7.5a4.95 4.95 0 1 1-7 7Z"/>
                <path d="m8.5 8.5 7 7"/>
              </svg>
              {sidebarOpen && <span className="flex-1">Prescription Refill</span>}
              {sidebarOpen && <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-teal-700 text-white">RX</span>}
            </button>
          </div>
        </nav>

        {/* Profile / Logout Footer */}
        <div className="p-3 border-t border-slate-100 space-y-2">
          {sidebarOpen && (
            <button onClick={() => setActiveTab('language')} className="w-full flex items-center justify-between p-2.5 rounded-2xl border border-slate-200/80 hover:bg-slate-50 transition-colors text-left">
              <div className="flex items-center gap-2.5">
                <span className="text-base">{currentLang?.flag}</span>
                <div>
                  <p className="text-xs font-bold text-slate-800">{currentLang?.label}</p>
                  <p className="text-[10px] text-slate-400">{currentLang?.native}</p>
                </div>
              </div>
              <span className="text-xs text-slate-400">›</span>
            </button>
          )}

          <div className={`flex items-center ${sidebarOpen ? 'gap-3 px-2 py-1.5' : 'justify-center py-1.5'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0 ${isGoogle ? 'bg-gradient-to-tr from-blue-600 to-emerald-500' : 'bg-gradient-to-tr from-teal-600 to-teal-800'}`}>
              {isGoogle ? 'G' : initials}
            </div>
            {sidebarOpen && (
              <div className="flex-1 truncate">
                <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                <p className="text-[11px] text-slate-400 truncate">{displayEmail}</p>
              </div>
            )}
          </div>

          <button onClick={onReset} className={`w-full py-2 px-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all flex items-center ${sidebarOpen ? 'justify-start gap-2' : 'justify-center'}`}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            {sidebarOpen && 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* ════ MAIN CONTENT ════ */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0 bg-slate-50">
        {/* Top Navbar */}
        <header className="h-16 px-6 bg-white border-b border-slate-200/80 flex items-center justify-between shrink-0">
          <div>
            <h1 className="font-display font-bold text-lg text-slate-900">{NAV.find(n => n.id === activeTab)?.label}</h1>
            <p className="text-xs text-slate-500 hidden sm:block">{TAB_SUBTITLE[activeTab]}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveTab('notifications')} className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500"/>}
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
              <span className="text-xs font-bold text-teal-800">System Online</span>
            </div>
          </div>
        </header>

        {/* Tab Content Display */}
        <div className="flex-1 flex overflow-hidden">
          {activeTab==='chat'          && <div className="flex-1 flex flex-col overflow-hidden"><ChatPage onReset={onReset} hospital={hospital} locationData={locationData}/></div>}
          {activeTab==='facility'      && <div className="flex-1 flex flex-col overflow-hidden"><FacilityTab onOpenRefill={() => setShowRefill(true)} onOpenAmbulance={() => setAmbulanceRequest({ source: 'facility' })}/></div>}
          {activeTab==='diagnostics'   && <div className="flex-1 flex flex-col overflow-hidden"><DiagnosticsTab/></div>}
          {activeTab==='bookslot'      && <div className="flex-1 flex flex-col overflow-hidden"><BookSlotTab/></div>}
          {activeTab==='notifications' && <div className="flex-1 flex flex-col overflow-hidden"><NotificationsTab/></div>}
          {activeTab==='cancel'        && <div className="flex-1 flex flex-col overflow-hidden"><CancelTab/></div>}
          {activeTab==='triage'        && <div className="flex-1 flex flex-col overflow-hidden"><EmergencyTriageTab onNavigate={setActiveTab} onRequestAmbulance={(ctx) => setAmbulanceRequest({ source: 'triage', context: ctx })}/></div>}
          {activeTab==='language'      && <div className="flex-1 flex flex-col overflow-hidden"><LanguageTab selectedLang={language} onSelectLang={setLanguage}/></div>}
          {activeTab==='profile'       && <div className="flex-1 flex flex-col overflow-hidden"><EditProfileTab user={user} onUpdateUser={onUpdateUser}/></div>}
        </div>
      </main>

      {/* Admin Overlay */}
      {showAdmin && (
        <AdminPanelOverlay
          onClose={() => setShowAdmin(false)}
          locationData={locationData}
          user={user}
        />
      )}

      {/* Prescription Refill Modal — opened either from the sidebar button
          or from the Pharmacy card inside the Facility tab's Amenities section */}
      {showRefill && (
        <PrescriptionRefillModal onClose={() => setShowRefill(false)} />
      )}

      {/* Ambulance Request Modal — opened either from the Ambulance card inside
          the Facility tab's Amenities section, or from Emergency Triage (in
          which case `context` carries the urgency/symptoms) */}
      {ambulanceRequest && (
        <AmbulanceRequestModal
          onClose={() => setAmbulanceRequest(null)}
          locationData={locationData}
          hospital={hospital}
          user={user}
          context={ambulanceRequest.context}
        />
      )}
    </div>
  )
}