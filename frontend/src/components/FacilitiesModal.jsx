import { useState } from 'react'

const FACILITIES = [
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

export default function FacilitiesModal({ onClose }) {
  const [selected, setSelected]     = useState(null)
  const [step, setStep]             = useState('list') // list | detail | form | success
  const [name, setName]             = useState('')
  const [phone, setPhone]           = useState('')
  const [email, setEmail]           = useState('')
  const [slot, setSlot]             = useState('')
  const [loading, setLoading]       = useState(false)

  function selectFacility(f) {
    setSelected(f)
    setStep('detail')
  }

  function goToForm() {
    setSlot('')
    setStep('form')
  }

  async function handleBook() {
    if (!name || !phone || !email || !slot) return
    setLoading(true)
    try {
      await fetch('http://localhost:8000/book-facility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email,
          slot,
          facility: selected.name,
          fee: selected.fee,
        }),
      })
    } catch (e) {
      console.error('Booking error:', e)
    }
    setLoading(false)
    setStep('success')
  }

  function reset() {
    setSelected(null)
    setStep('list')
    setName('')
    setPhone('')
    setEmail('')
    setSlot('')
  }

  return (
    <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)' }}>
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-slide-up"
        style={{ maxHeight: '90vh' }}>

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-50 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #f0fafa, #ffffff)' }}>
          <div className="flex items-center gap-2">
            {step !== 'list' && (
              <button onClick={() => step === 'form' ? setStep('detail') : step === 'detail' ? reset() : null}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors mr-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
            )}
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #1d9e97, #0f7a74)' }}>
              <span className="text-sm">🏥</span>
            </div>
            <div>
              <p className="font-display font-bold text-gray-800 text-sm leading-tight">
                {step === 'list' ? 'Diagnostic Facilities' :
                 step === 'detail' ? selected?.name :
                 step === 'form' ? 'Book Appointment' :
                 'Booking Confirmed!'}
              </p>
              <p className="text-xs text-gray-400">
                {step === 'list' ? 'Select a facility to book' :
                 step === 'detail' ? selected?.desc :
                 step === 'form' ? 'Fill your details' : ''}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 text-sm transition-colors">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: '70vh' }}>

          {/* ── List View ── */}
          {step === 'list' && (
            <div className="p-4 flex flex-col gap-3">
              {FACILITIES.map(f => (
                <button key={f.id} onClick={() => selectFacility(f)}
                  className="flex items-center gap-4 p-4 rounded-2xl border text-left transition-all hover:shadow-md hover:border-teal-200 active:scale-[0.98]"
                  style={{ background: '#f7fffe', borderColor: '#e0f5f4' }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #edf7f6, #c7e9e6)' }}>
                    {f.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{f.name}</p>
                    <p className="text-xs text-gray-400 truncate">{f.desc}</p>
                    <p className="text-xs font-semibold mt-1" style={{ color: '#1d9e97' }}>₹{f.fee}</p>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              ))}
            </div>
          )}

          {/* ── Detail View ── */}
          {step === 'detail' && selected && (
            <div className="p-5">
              {/* Facility card */}
              <div className="rounded-2xl p-4 mb-4 text-center"
                style={{ background: 'linear-gradient(135deg, #edf7f6, #f0fafa)', border: '1px solid #c7e9e6' }}>
                <div className="text-4xl mb-2">{selected.icon}</div>
                <h3 className="font-display font-bold text-gray-800 text-lg">{selected.name}</h3>
                <p className="text-xs text-gray-400 mt-1">{selected.desc}</p>
              </div>

              {/* Info table */}
              <div className="rounded-2xl overflow-hidden border mb-4" style={{ borderColor: '#e0f5f4' }}>
                {[
                  { label: '💰 Fee', value: `₹${selected.fee}` },
                  { label: '⏱️ Duration', value: selected.duration },
                  { label: '📋 Preparation', value: selected.prep },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center px-4 py-3 border-b last:border-0"
                    style={{ background: i % 2 === 0 ? '#f7fffe' : 'white', borderColor: '#e0f5f4' }}>
                    <span className="text-xs text-gray-500">{row.label}</span>
                    <span className="text-xs font-semibold text-gray-700">{row.value}</span>
                  </div>
                ))}
              </div>

              <button onClick={goToForm}
                className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #1d9e97, #0f7a74)', boxShadow: '0 4px 14px -2px rgba(29,158,151,0.4)' }}>
                Book Appointment →
              </button>
            </div>
          )}

          {/* ── Form View ── */}
          {step === 'form' && selected && (
            <div className="p-5 flex flex-col gap-4">

              {/* Slot picker */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">
                  🕐 Select Time Slot
                </label>
                <div className="flex flex-wrap gap-2">
                  {selected.slots.map(s => (
                    <button key={s} onClick={() => setSlot(s)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold border transition-all"
                      style={{
                        background: slot === s ? '#1d9e97' : '#f0fafa',
                        color: slot === s ? 'white' : '#1d9e97',
                        borderColor: slot === s ? '#1d9e97' : '#c7e9e6',
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 block">👤 Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 rounded-2xl border text-sm text-gray-800 placeholder-gray-300 focus:outline-none transition-all"
                  style={{ background: '#f7fffe', borderColor: name ? '#1d9e97' : '#e0f5f4', boxShadow: name ? '0 0 0 3px rgba(29,158,151,0.1)' : 'none' }}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 block">📱 Phone Number</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full px-4 py-3 rounded-2xl border text-sm text-gray-800 placeholder-gray-300 focus:outline-none transition-all"
                  style={{ background: '#f7fffe', borderColor: phone ? '#1d9e97' : '#e0f5f4', boxShadow: phone ? '0 0 0 3px rgba(29,158,151,0.1)' : 'none' }}
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5 block">📧 Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Enter email for confirmation"
                  className="w-full px-4 py-3 rounded-2xl border text-sm text-gray-800 placeholder-gray-300 focus:outline-none transition-all"
                  style={{ background: '#f7fffe', borderColor: email ? '#1d9e97' : '#e0f5f4', boxShadow: email ? '0 0 0 3px rgba(29,158,151,0.1)' : 'none' }}
                />
              </div>

              <button onClick={handleBook}
                disabled={!name || !phone || !email || !slot || loading}
                className="w-full py-3.5 rounded-2xl text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
                style={{
                  background: name && phone && email && slot && !loading
                    ? 'linear-gradient(135deg, #1d9e97, #0f7a74)'
                    : '#9dd6d1',
                  boxShadow: name && phone && email && slot && !loading
                    ? '0 4px 14px -2px rgba(29,158,151,0.4)'
                    : 'none',
                }}>
                {loading ? (
                  <>
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                    Booking...
                  </>
                ) : 'Confirm Booking'}
              </button>
            </div>
          )}

          {/* ── Success View ── */}
          {step === 'success' && selected && (
            <div className="px-6 py-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)' }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <h3 className="font-display font-bold text-gray-800 text-lg mb-1">Booking Confirmed! 🎉</h3>
              <p className="text-sm text-gray-500 mb-4">
                <strong>{selected.name}</strong> appointment for <strong>{name}</strong> at <strong style={{ color: '#1d9e97' }}>{slot}</strong>
              </p>
              <div className="w-full rounded-2xl p-3 mb-5 text-left"
                style={{ background: '#f0fafa', border: '1px solid #c7e9e6' }}>
                <p className="text-xs text-gray-500">Confirmation will be sent to:</p>
                <p className="text-sm font-semibold" style={{ color: '#1d9e97' }}>{email}</p>
              </div>
              <div className="flex gap-3 w-full">
                <button onClick={reset}
                  className="flex-1 py-3 rounded-2xl border text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  style={{ borderColor: '#e5e7eb' }}>
                  Book Another
                </button>
                <button onClick={onClose}
                  className="flex-1 py-3 rounded-2xl text-white text-sm font-semibold transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #1d9e97, #0f7a74)' }}>
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
