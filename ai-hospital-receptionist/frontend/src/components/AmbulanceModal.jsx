import { useState, useEffect } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════
// ── AMBULANCE MODAL ───────────────────────────────────────────────────────────
// Opened from the Ambulance amenity card in the Facility tab (and anywhere else
// that passes an onClose). Two jobs:
//   1. Get the caller onto a phone line fast — that is always the fastest route.
//   2. Collect the details a dispatcher will ask for anyway, so the call is short.
// It does NOT triage, diagnose, or promise an ETA the backend can't deliver.
// ═══════════════════════════════════════════════════════════════════════════════

const AMBULANCE_LINES = [
  { number: '108', label: 'Ambulance', note: 'Emergency response · free', primary: true },
  { number: '112', label: 'All emergencies', note: 'Police · fire · medical' },
  { number: '102', label: 'Mother & child', note: 'Pregnancy and infant transport' },
]

const REQUEST_TYPES = [
  { id: 'emergency', label: 'Emergency pickup', desc: 'Patient is unwell right now' },
  { id: 'transfer', label: 'Hospital transfer', desc: 'Move between facilities' },
  { id: 'discharge', label: 'Discharge drop', desc: 'Take patient home' },
  { id: 'scheduled', label: 'Scheduled visit', desc: 'Planned appointment transport' },
]

export function AmbulanceModal({ onClose, user, hospital }) {
  const [step, setStep] = useState('main')     // 'main' | 'form' | 'success'
  const [type, setType] = useState('emergency')
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [address, setAddress] = useState('')
  const [landmark, setLandmark] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [reference, setReference] = useState('')
  const [focusField, setFocus] = useState(null)

  const [geo, setGeo] = useState(null)
  const [geoStatus, setGeoStatus] = useState('')
  const [copied, setCopied] = useState(false)

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const mapsLink = geo ? `https://maps.google.com/?q=${geo.lat},${geo.lng}` : ''

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('This device can\'t share location. Type the address instead.')
      return
    }
    setGeoStatus('locating')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
        })
        setGeoStatus('')
      },
      (err) => {
        setGeoStatus(
          err.code === err.PERMISSION_DENIED
            ? 'Location was blocked. Allow it in browser settings, or type the address.'
            : 'Couldn\'t get a fix. Type the address instead.'
        )
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const copyLocation = async () => {
    try { await navigator.clipboard.writeText(mapsLink) } catch { /* clipboard unavailable */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isValid = name.trim() && phone.trim() && (address.trim() || geo)

  async function submitRequest() {
    if (!isValid) return
    setLoading(true)
    const payload = {
      type,
      name,
      phone,
      address,
      landmark,
      notes,
      hospital: hospital?.name || '',
      coords: geo ? { lat: geo.lat, lng: geo.lng, accuracy: geo.accuracy } : null,
      requestedAt: new Date().toISOString(),
    }
    let ref = `AMB-${Math.floor(1000 + Math.random() * 9000)}`
    try {
      const res = await fetch('http://localhost:8000/request-ambulance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data?.reference) ref = data.reference
    } catch (e) {
      // Backend unreachable — the request is still logged locally so the desk
      // can pick it up, and the caller is told to phone the line directly.
      console.error('Ambulance request error:', e)
      try {
        const queue = JSON.parse(localStorage.getItem('ambulance_requests') || '[]')
        queue.push({ ...payload, reference: ref, synced: false })
        localStorage.setItem('ambulance_requests', JSON.stringify(queue))
      } catch { /* storage unavailable */ }
    }
    setReference(ref)
    setLoading(false)
    setStep('success')
  }

  const inputStyle = (f) => ({
    width: '100%', padding: '12px 14px', borderRadius: 12,
    border: `1.5px solid ${focusField === f ? '#1d9e97' : '#e2e8f0'}`,
    background: focusField === f ? 'rgba(29,158,151,0.03)' : '#fafafa',
    fontSize: 14, color: '#1e293b', outline: 'none',
    transition: 'all 0.2s', boxSizing: 'border-box',
  })

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 900,
        background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 24, width: '100%', maxWidth: 520,
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: '22px 24px',
          borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, background: '#fff', borderRadius: '24px 24px 0 0',
        }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🚑</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 19, fontWeight: 800, color: '#0f172a', margin: 0 }}>Ambulance</h2>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '3px 0 0' }}>
              {hospital?.name ? `${hospital.name} · available 24/7` : 'Available 24/7'}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ width: 32, height: 32, borderRadius: 10, border: 'none', background: '#f1f5f9', color: '#64748b', fontSize: 16, cursor: 'pointer' }}>✕</button>
        </div>

        {/* ── MAIN ── */}
        {step === 'main' && (
          <div style={{ padding: 24 }}>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px', lineHeight: 1.6 }}>
              If someone is struggling to breathe, unresponsive, or bleeding heavily, call now. Filling in the form takes longer than a phone call.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {AMBULANCE_LINES.map((line) => (
                <a
                  key={line.number}
                  href={`tel:${line.number}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none',
                    padding: '14px 16px', borderRadius: 14,
                    background: line.primary ? 'linear-gradient(135deg,#ef4444,#dc2626)' : '#fff',
                    color: line.primary ? '#fff' : '#0f172a',
                    border: line.primary ? 'none' : '1.5px solid #e2e8f0',
                    boxShadow: line.primary ? '0 4px 16px rgba(220,38,38,0.28)' : 'none',
                  }}
                >
                  <span style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 800, letterSpacing: 1 }}>{line.number}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{line.label}</p>
                    <p style={{ fontSize: 11, margin: '2px 0 0', opacity: 0.8 }}>{line.note}</p>
                  </div>
                  <span style={{ fontSize: 17 }}>📞</span>
                </a>
              ))}
            </div>

            {/* Location */}
            <div style={{ padding: 16, borderRadius: 16, background: '#f8fafb', border: '1px solid #f1f5f9', marginBottom: 16 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>Pickup location</h3>
              {geo ? (
                <>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#334155', margin: '0 0 4px', fontFamily: 'monospace' }}>
                    {geo.lat.toFixed(5)}, {geo.lng.toFixed(5)}
                  </p>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 10px' }}>
                    Accurate to about {geo.accuracy} m. Add the building name and floor when you speak to the dispatcher — a pin alone won't get them to the door.
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <a href={mapsLink} target="_blank" rel="noreferrer" style={{ padding: '8px 14px', borderRadius: 10, background: '#fff', border: '1.5px solid #e2e8f0', fontSize: 12, fontWeight: 700, color: '#0f7a74', textDecoration: 'none' }}>Open in Maps</a>
                    <button onClick={copyLocation} style={{ padding: '8px 14px', borderRadius: 10, background: '#fff', border: '1.5px solid #e2e8f0', fontSize: 12, fontWeight: 700, color: copied ? '#0f7a74' : '#64748b', cursor: 'pointer' }}>
                      {copied ? 'Link copied' : 'Copy map link'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={requestLocation}
                    disabled={geoStatus === 'locating'}
                    style={{ padding: '10px 16px', borderRadius: 11, border: '1.5px solid #0f7a74', background: '#fff', color: '#0f7a74', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                  >
                    {geoStatus === 'locating' ? 'Finding location…' : '📍 Share my location'}
                  </button>
                  {geoStatus && geoStatus !== 'locating' && (
                    <p style={{ fontSize: 12, color: '#b91c1c', margin: '10px 0 0' }}>{geoStatus}</p>
                  )}
                </>
              )}
            </div>

            <button
              onClick={() => setStep('form')}
              style={{ width: '100%', padding: '13px 0', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#1d9e97,#0f7a74)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(29,158,151,0.3)' }}
            >
              Request a pickup from the hospital desk →
            </button>
            <p style={{ fontSize: 11, color: '#94a3b8', margin: '10px 0 0', textAlign: 'center', lineHeight: 1.5 }}>
              A desk request reaches the ward team, not the 108 dispatcher. For an emergency, call first and submit this afterwards.
            </p>
          </div>
        )}

        {/* ── FORM ── */}
        {step === 'form' && (
          <div style={{ padding: 24 }}>
            <button onClick={() => setStep('main')} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#64748b', padding: 0 }}>
              ‹ Back to call options
            </button>

            <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>Type of request</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
              {REQUEST_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  style={{
                    padding: '11px 13px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                    border: type === t.id ? '1.5px solid #1d9e97' : '1.5px solid #e2e8f0',
                    background: type === t.id ? 'rgba(29,158,151,0.06)' : '#fff',
                  }}
                >
                  <p style={{ fontSize: 13, fontWeight: 700, color: type === t.id ? '#0f7a74' : '#0f172a', margin: 0 }}>{t.label}</p>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>{t.desc}</p>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: '👤 Patient name', key: 'name', val: name, set: setName, ph: 'Who is being picked up' },
                { label: '📱 Contact number', key: 'phone', val: phone, set: setPhone, ph: 'Number the crew can call back', type: 'tel' },
                { label: '📍 Pickup address', key: 'address', val: address, set: setAddress, ph: 'House / building, street, area' },
                { label: '🧭 Nearest landmark', key: 'landmark', val: landmark, set: setLandmark, ph: 'What the driver should look for' },
              ].map((f) => (
                <div key={f.key}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>{f.label}</label>
                  <input
                    type={f.type || 'text'}
                    placeholder={f.ph}
                    value={f.val}
                    onChange={(e) => f.set(e.target.value)}
                    onFocus={() => setFocus(f.key)}
                    onBlur={() => setFocus(null)}
                    style={inputStyle(f.key)}
                  />
                </div>
              ))}

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>📝 What should the crew know</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Second floor, no lift. Patient can't walk. Oxygen needed."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onFocus={() => setFocus('notes')}
                  onBlur={() => setFocus(null)}
                  style={{ ...inputStyle('notes'), resize: 'vertical' }}
                />
              </div>
            </div>

            {geo && (
              <p style={{ fontSize: 12, color: '#0f7a74', fontWeight: 600, margin: '14px 0 0' }}>
                ✓ Location attached ({geo.lat.toFixed(4)}, {geo.lng.toFixed(4)})
              </p>
            )}

            <button
              onClick={submitRequest}
              disabled={!isValid || loading}
              style={{
                width: '100%', marginTop: 20, padding: '14px 0', borderRadius: 12, border: 'none',
                background: isValid && !loading ? 'linear-gradient(135deg,#1d9e97,#0f7a74)' : '#9dd6d1',
                color: '#fff', fontSize: 14, fontWeight: 700,
                cursor: isValid && !loading ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              }}
            >
              {loading
                ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>Sending…</>
                : 'Send request to the desk'}
            </button>
            {!isValid && (
              <p style={{ fontSize: 11, color: '#94a3b8', margin: '10px 0 0', textAlign: 'center' }}>
                Name, contact number, and either an address or a shared location are needed.
              </p>
            )}
          </div>
        )}

        {/* ── SUCCESS ── */}
        {step === 'success' && (
          <div style={{ padding: '32px 24px', textAlign: 'center' }}>
            <div style={{ width: 66, height: 66, borderRadius: '50%', margin: '0 auto 18px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🚑</div>
            <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 21, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>Request sent</h3>
            <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 20px', lineHeight: 1.6 }}>
              The desk has your details for <strong>{name}</strong>. Keep this phone free — the crew will call the number you gave.
            </p>
            <div style={{ borderRadius: 14, padding: '14px 18px', background: '#f0fafa', border: '1px solid #c7e9e6', marginBottom: 22 }}>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Reference</p>
              <p style={{ fontSize: 18, fontWeight: 800, color: '#0f7a74', margin: 0, fontFamily: 'monospace', letterSpacing: 2 }}>{reference}</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <a href="tel:108" style={{ flex: 1, padding: '12px 0', borderRadius: 12, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                📞 Call 108 as well
              </a>
              <button onClick={onClose} style={{ flex: 1, padding: '12px 0', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#1d9e97,#0f7a74)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AmbulanceModal
