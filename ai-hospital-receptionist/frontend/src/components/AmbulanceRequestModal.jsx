import { useState, useEffect, useRef } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════
// Shared ambulance-dispatch flow. Opened either from the Facility tab's
// Ambulance amenity card, or from Emergency Triage's "Request Ambulance"
// button (in which case `context` carries the symptoms/urgency so the
// dispatcher sees why the ambulance was called).
//
// After dispatch, a live map (Leaflet + OpenStreetMap — no API key needed)
// shows the ambulance moving toward the pickup address with a countdown ETA.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Leaflet from CDN, loaded once, on demand ──────────────────────────────────
// If you'd rather bundle it: `npm i leaflet`, then
//   import L from 'leaflet'; import 'leaflet/dist/leaflet.css'
// and delete useLeaflet() + replace `window.L` with `L`.
const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
const LEAFLET_JS  = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'

function useLeaflet() {
  const [ready, setReady] = useState(() => typeof window !== 'undefined' && !!window.L)

  useEffect(() => {
    if (window.L) { setReady(true); return }

    if (!document.querySelector(`link[data-leaflet]`)) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = LEAFLET_CSS
      link.setAttribute('data-leaflet', '1')
      document.head.appendChild(link)
    }

    let script = document.querySelector(`script[data-leaflet]`)
    const onLoad = () => setReady(true)

    if (!script) {
      script = document.createElement('script')
      script.src = LEAFLET_JS
      script.async = true
      script.setAttribute('data-leaflet', '1')
      document.body.appendChild(script)
    }
    script.addEventListener('load', onLoad)
    return () => script.removeEventListener('load', onLoad)
  }, [])

  return ready
}

// ── Geo helpers ───────────────────────────────────────────────────────────────
const FALLBACK = { lat: 18.5204, lng: 73.8567 } // Pune city centre

function haversineKm(a, b) {
  const R = 6371, toRad = d => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

// Free geocoding via Nominatim (OpenStreetMap). No key; be gentle with it.
async function geocode(query) {
  if (!query?.trim()) return null
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
    const json = await res.json()
    if (json?.[0]) return { lat: parseFloat(json[0].lat), lng: parseFloat(json[0].lon) }
  } catch (e) { console.warn('Geocode failed:', e) }
  return null
}

// A gently curved "road-like" path so the marker doesn't crawl in a dead
// straight line. Swap this for a real routing polyline (OSRM / Google
// Directions) when you have one.
function buildPath(from, to, n = 8) {
  const pts = [from]
  for (let i = 1; i < n; i++) {
    const t = i / n
    const wobble = Math.sin(t * Math.PI) * 0.004
    pts.push({
      lat: from.lat + (to.lat - from.lat) * t + wobble * Math.sin(i * 1.9),
      lng: from.lng + (to.lng - from.lng) * t + wobble * Math.cos(i * 1.4),
    })
  }
  pts.push(to)
  return pts
}

function pointAt(path, t) {
  const clamped = Math.max(0, Math.min(1, t))
  const seg = (path.length - 1) * clamped
  const i   = Math.min(Math.floor(seg), path.length - 2)
  const f   = seg - i
  return {
    lat: path[i].lat + (path[i + 1].lat - path[i].lat) * f,
    lng: path[i].lng + (path[i + 1].lng - path[i].lng) * f,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── LIVE MAP ──────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function AmbulanceMap({ path, ambulance, destination, arrived }) {
  const ready     = useLeaflet()
  const holderRef = useRef(null)
  const mapRef    = useRef(null)
  const ambRef    = useRef(null)
  const lineRef   = useRef(null)
  const doneRef   = useRef(null)

  // Create the map once Leaflet is available and we know where things are
  useEffect(() => {
    if (!ready || !holderRef.current || mapRef.current || !destination) return
    const L = window.L

    const map = L.map(holderRef.current, {
      zoomControl: false,
      attributionControl: true,
      dragging: true,
      scrollWheelZoom: false,
    })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map)
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    // Route line
    lineRef.current = L.polyline(path.map(p => [p.lat, p.lng]), {
      color: '#ef4444', weight: 4, opacity: 0.55, dashArray: '8 8', lineCap: 'round',
    }).addTo(map)

    // Pickup pin
    L.marker([destination.lat, destination.lng], {
      icon: L.divIcon({
        className: '',
        html: `<div style="position:relative;width:34px;height:34px">
                 <span style="position:absolute;inset:0;border-radius:50%;background:rgba(29,158,151,0.25);animation:ambPulse 1.8s ease-out infinite"></span>
                 <span style="position:absolute;inset:7px;border-radius:50%;background:#0f7a74;border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></span>
               </div>`,
        iconSize: [34, 34], iconAnchor: [17, 17],
      }),
    }).addTo(map).bindTooltip('Pickup point', { direction: 'top', offset: [0, -12] })

    // Ambulance marker
    ambRef.current = L.marker([ambulance.lat, ambulance.lng], {
      icon: L.divIcon({
        className: '',
        html: `<div style="width:38px;height:38px;border-radius:50%;background:#fff;border:2.5px solid #ef4444;
                 display:flex;align-items:center;justify-content:center;font-size:19px;
                 box-shadow:0 3px 10px rgba(220,38,38,0.4)">🚑</div>`,
        iconSize: [38, 38], iconAnchor: [19, 19],
      }),
      zIndexOffset: 500,
    }).addTo(map).bindTooltip('Your ambulance', { direction: 'top', offset: [0, -16] })

    map.fitBounds(lineRef.current.getBounds(), { padding: [38, 38] })
    setTimeout(() => map.invalidateSize(), 120) // modal was animating in
    mapRef.current = map

    return () => { map.remove(); mapRef.current = null }
  }, [ready, destination, path, ambulance])

  // Move the marker + shrink the remaining route as it drives
  useEffect(() => {
    if (!mapRef.current || !ambRef.current || !ambulance) return
    ambRef.current.setLatLng([ambulance.lat, ambulance.lng])
    if (lineRef.current) {
      const remaining = [[ambulance.lat, ambulance.lng], ...path.slice(1).map(p => [p.lat, p.lng])]
      lineRef.current.setLatLngs(remaining)
    }
  }, [ambulance, path])

  // Drop a "delivered" flourish when it lands
  useEffect(() => {
    if (!arrived || !mapRef.current || doneRef.current) return
    const L = window.L
    doneRef.current = L.circle([destination.lat, destination.lng], {
      radius: 90, color: '#16a34a', fillColor: '#16a34a', fillOpacity: 0.18, weight: 2,
    }).addTo(mapRef.current)
    mapRef.current.setView([destination.lat, destination.lng], 15, { animate: true })
  }, [arrived, destination])

  return (
    <div style={{ position: 'relative', width: '100%', height: 220, borderRadius: 16, overflow: 'hidden', border: '1px solid #fecaca', marginBottom: 16, background: '#f1f5f9' }}>
      <div ref={holderRef} style={{ width: '100%', height: '100%' }} />
      {!ready && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10, background: '#f8fafb' }}>
          <div style={{ width: 28, height: 28, border: '3px solid #fecaca', borderTop: '3px solid #ef4444', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ fontSize: 12, color: '#94a3b8' }}>Loading map…</span>
        </div>
      )}
      <style>{`
        @keyframes ambPulse { 0%{transform:scale(0.6);opacity:0.9} 100%{transform:scale(1.9);opacity:0} }
        .leaflet-container { font-family: inherit; }
        .leaflet-control-attribution { font-size: 9px; }
      `}</style>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── MODAL ─────────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export function AmbulanceRequestModal({ onClose, locationData, hospital, user, context }) {
  const [step, setStep]       = useState('form') // form -> dispatching -> confirmed
  const [name, setName]       = useState(user?.name  || '')
  const [phone, setPhone]     = useState(user?.phone || '')
  const [address, setAddress] = useState('')
  const [focusField, setFocus] = useState(null)

  const nearestHospital = locationData?.hospital?.name || hospital?.name || 'your registered hospital'
  const city             = locationData?.city || hospital?.area || ''
  const isValid           = name.trim() && phone.trim() && address.trim()

  // Simple, stable-per-open ETA so it doesn't jump around on re-render
  const [eta]   = useState(() => 6 + Math.floor(Math.random() * 8)) // 6–13 mins
  const [token] = useState(() => 'AMB-' + Math.floor(1000 + Math.random() * 9000))

  // ── Tracking state ──────────────────────────────────────────────────────────
  const [destination, setDestination] = useState(null)
  const [path, setPath]               = useState(null)
  const [progress, setProgress]       = useState(0)      // 0 → 1
  const [secondsLeft, setSecondsLeft] = useState(eta * 60)
  const arrived = progress >= 1

  const ambulance = path ? pointAt(path, progress) : null
  const kmLeft    = ambulance && destination ? haversineKm(ambulance, destination) : null

  // Simulation speed: 1 real second = SPEED simulated seconds, so a 10-min ETA
  // plays out in ~100s. Set SPEED = 1 for real time, or replace the interval
  // below with a poll against your backend (see the note at the bottom).
  const SPEED = 6

  // Work out where the pickup actually is, then plot the route
  useEffect(() => {
    if (step !== 'confirmed') return
    let cancelled = false

    ;(async () => {
      const query = city ? `${address}, ${city}` : address
      const dest =
        (await geocode(query)) ||
        (locationData?.lat && locationData?.lng ? { lat: locationData.lat, lng: locationData.lng } : null) ||
        FALLBACK

      if (cancelled) return

      // Ambulance starts at the hospital if we know where it is, else ~3km away
      const start =
        (locationData?.hospital?.lat && locationData?.hospital?.lng)
          ? { lat: locationData.hospital.lat, lng: locationData.hospital.lng }
          : { lat: dest.lat + 0.026, lng: dest.lng - 0.021 }

      setDestination(dest)
      setPath(buildPath(start, dest))
    })()

    return () => { cancelled = true }
  }, [step, address, city, locationData])

  // Drive it
  useEffect(() => {
    if (step !== 'confirmed' || !path) return
    const total = eta * 60
    const id = setInterval(() => {
      setSecondsLeft(s => {
        const next = Math.max(0, s - SPEED)
        setProgress(1 - next / total)
        if (next === 0) clearInterval(id)
        return next
      })
    }, 1000)
    return () => clearInterval(id)
  }, [step, path, eta])

  async function handleDispatch() {
    if (!isValid) return
    setStep('dispatching')
    try {
      await fetch('http://localhost:8000/dispatch-ambulance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, phone, address, hospital: nearestHospital,
          token,
          urgency: context?.urgency || null,
          symptoms: context?.symptoms || null,
        }),
      })
    } catch (e) { console.error('Dispatch error:', e) }
    setTimeout(() => setStep('confirmed'), 1200)
  }

  const fieldStyle = (f) => ({
    width: '100%', padding: '13px 16px', borderRadius: 12,
    border: `1.5px solid ${focusField === f ? '#ef4444' : '#e2e8f0'}`,
    background: focusField === f ? 'rgba(239,68,68,0.03)' : '#fafafa',
    fontSize: 14, color: '#1e293b', outline: 'none',
    transition: 'all 0.2s', boxSizing: 'border-box',
    boxShadow: focusField === f ? '0 0 0 3px rgba(239,68,68,0.1)' : 'none',
  })

  const mins = Math.floor(secondsLeft / 60)
  const secs = String(secondsLeft % 60).padStart(2, '0')

  const gmapsUrl = destination
    ? `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}&travelmode=driving`
    : null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 900,
      background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(2px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 24, padding: '32px', maxWidth: 460, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🚑</div>
            <div>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {step === 'confirmed' ? 'Tracking Ambulance' : 'Request Ambulance'}
              </h2>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>Dispatched from {nearestHospital}{city ? ` · ${city}` : ''}</p>
            </div>
          </div>
          {step !== 'dispatching' && (
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: '#f1f5f9', color: '#64748b', cursor: 'pointer', flexShrink: 0 }}>✕</button>
          )}
        </div>

        {/* Context banner, if opened from Emergency Triage */}
        {context?.urgency && step === 'form' && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 12, background: context.urgency === 'Emergency' ? '#fef2f2' : '#fffbeb', border: `1px solid ${context.urgency === 'Emergency' ? '#fecaca' : '#fde68a'}`, marginBottom: 20 }}>
            <span style={{ fontSize: 16 }}>{context.urgency === 'Emergency' ? '🔴' : '🟡'}</span>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: context.urgency === 'Emergency' ? '#b91c1c' : '#92400e', margin: '0 0 2px' }}>
                Flagged as {context.urgency} from Emergency Triage
              </p>
              {context.symptoms && (
                <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.5 }}>"{context.symptoms}"</p>
              )}
            </div>
          </div>
        )}

        {step === 'form' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              {[
                { label: '👤 Patient Name',   key: 'name',    val: name,    set: setName,    placeholder: 'Enter patient name' },
                { label: '📱 Contact Number', key: 'phone',   val: phone,   set: setPhone,   placeholder: 'Enter phone number', type: 'tel' },
                { label: '📍 Pickup Address', key: 'address', val: address, set: setAddress, placeholder: 'Where should the ambulance come?' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>{f.label}</label>
                  <input type={f.type || 'text'} placeholder={f.placeholder} value={f.val} onChange={e => f.set(e.target.value)} onFocus={() => setFocus(f.key)} onBlur={() => setFocus(null)} style={fieldStyle(f.key)} />
                </div>
              ))}
            </div>
            <button
              onClick={handleDispatch}
              disabled={!isValid}
              style={{ width: '100%', padding: '14px 0', borderRadius: 12, border: 'none', background: isValid ? 'linear-gradient(135deg,#ef4444,#dc2626)' : '#fca5a5', color: '#fff', fontSize: 14, fontWeight: 700, cursor: isValid ? 'pointer' : 'not-allowed', boxShadow: isValid ? '0 4px 16px rgba(220,38,38,0.35)' : 'none' }}
            >
              🚑 Dispatch Ambulance Now
            </button>
          </>
        )}

        {step === 'dispatching' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0' }}>
            <div style={{ width: 48, height: 48, border: '3px solid #fecaca', borderTop: '3px solid #ef4444', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 18 }} />
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>Contacting {nearestHospital}…</p>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Finding the nearest available ambulance</p>
          </div>
        )}

        {step === 'confirmed' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Status strip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, background: arrived ? '#dcfce7' : '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {arrived
                  ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
                  : <span style={{ fontSize: 20, animation: 'ambBob 1.4s ease-in-out infinite' }}>🚑</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 17, fontWeight: 800, color: '#0f172a', margin: '0 0 2px' }}>
                  {arrived ? 'Ambulance Has Arrived' : 'Ambulance On The Way'}
                </h3>
                <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {nearestHospital} → {address}
                </p>
              </div>
              {!arrived && (
                <span style={{ flexShrink: 0, padding: '4px 11px', borderRadius: 20, background: '#fef2f2', border: '1px solid #fecaca', fontSize: 12, fontWeight: 800, color: '#dc2626', fontFamily: 'monospace' }}>
                  {mins}:{secs}
                </span>
              )}
            </div>

            {/* Live map */}
            {path && destination ? (
              <AmbulanceMap path={path} ambulance={ambulance} destination={destination} arrived={arrived} />
            ) : (
              <div style={{ height: 220, borderRadius: 16, border: '1px solid #fecaca', background: '#f8fafb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 28, height: 28, border: '3px solid #fecaca', borderTop: '3px solid #ef4444', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <span style={{ fontSize: 12, color: '#94a3b8' }}>Locating pickup address…</span>
              </div>
            )}

            {/* Progress */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ height: 6, borderRadius: 10, background: '#f1f5f9', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 10, width: `${Math.round(progress * 100)}%`, background: arrived ? 'linear-gradient(90deg,#22c55e,#16a34a)' : 'linear-gradient(90deg,#f87171,#dc2626)', transition: 'width 1s linear' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>Dispatched</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: arrived ? '#16a34a' : '#dc2626' }}>
                  {arrived ? 'At your location' : kmLeft != null ? `${kmLeft.toFixed(1)} km away` : 'En route'}
                </span>
              </div>
            </div>

            {/* Trip details */}
            <div style={{ width: '100%', borderRadius: 16, padding: '14px 18px', background: '#fef2f2', border: '1px solid #fecaca', textAlign: 'left', marginBottom: 16 }}>
              {[
                { label: 'Tracking Token',   value: token, mono: true },
                { label: 'Estimated Arrival', value: arrived ? 'Arrived' : `~${mins} min ${secs}s` },
                { label: 'Crew',              value: 'Paramedic + Driver · BLS unit' },
              ].map((row, i, arr) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: i < arr.length - 1 ? 9 : 0 }}>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>{row.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: row.mono ? '#dc2626' : '#0f172a', fontFamily: row.mono ? 'monospace' : 'inherit', letterSpacing: row.mono ? 1 : 0 }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, width: '100%', marginBottom: gmapsUrl ? 10 : 0 }}>
              <a href="tel:108" style={{ flex: 1, textDecoration: 'none', padding: '13px 0', borderRadius: 12, border: '1.5px solid #e5e7eb', background: '#fff', fontSize: 13, fontWeight: 700, color: '#475569', textAlign: 'center' }}>📞 Call Desk</a>
              <button onClick={onClose} style={{ flex: 1, padding: '13px 0', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                {arrived ? 'Done' : 'Minimise'}
              </button>
            </div>
            {gmapsUrl && (
              <a href={gmapsUrl} target="_blank" rel="noreferrer" style={{ display: 'block', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#0f7a74', textDecoration: 'none', padding: '8px 0' }}>
                🗺️ Open pickup point in Google Maps
              </a>
            )}
          </div>
        )}

        <style>{`
          @keyframes ambBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
        `}</style>
      </div>
    </div>
  )
}