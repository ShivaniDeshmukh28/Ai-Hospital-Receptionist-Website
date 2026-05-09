import { useState, useEffect } from 'react'

// ── Indian Cities Data ────────────────────────────────────────────────────────
const INDIAN_CITIES = [
  { name: "Mumbai", state: "Maharashtra", lat: 19.0760, lng: 72.8777 },
  { name: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567 },
  { name: "Aurangabad", state: "Maharashtra", lat: 19.8762, lng: 75.3433 },
  { name: "Nagpur", state: "Maharashtra", lat: 21.1458, lng: 79.0882 },
  { name: "Nashik", state: "Maharashtra", lat: 19.9975, lng: 73.7898 },
  { name: "Solapur", state: "Maharashtra", lat: 17.6868, lng: 75.9005 },
  { name: "Osmanabad", state: "Maharashtra", lat: 18.1769, lng: 76.0391 },
  { name: "Latur", state: "Maharashtra", lat: 18.4088, lng: 76.5604 },
  { name: "Kolhapur", state: "Maharashtra", lat: 16.7050, lng: 74.2433 },
  { name: "Satara", state: "Maharashtra", lat: 17.6805, lng: 73.9946 },
  { name: "Delhi", state: "Delhi", lat: 28.6139, lng: 77.2090 },
  { name: "Bangalore", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  { name: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
  { name: "Hyderabad", state: "Telangana", lat: 17.3850, lng: 78.4867 },
  { name: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639 },
  { name: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714 },
  { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lng: 75.7873 },
  { name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462 },
  { name: "Bhopal", state: "Madhya Pradesh", lat: 23.2599, lng: 77.4126 },
  { name: "Chandigarh", state: "Punjab", lat: 30.7333, lng: 76.7794 },
  { name: "Indore", state: "Madhya Pradesh", lat: 22.7196, lng: 75.8577 },
  { name: "Patna", state: "Bihar", lat: 25.5941, lng: 85.1376 },
  { name: "Kochi", state: "Kerala", lat: 9.9312, lng: 76.2673 },
  { name: "Guwahati", state: "Assam", lat: 26.1445, lng: 91.7362 },
  { name: "Surat", state: "Gujarat", lat: 21.1702, lng: 72.8311 },
]

// ── Hospitals Database ────────────────────────────────────────────────────────
const HOSPITALS_DB = {
  "Mumbai": [
    { id: 1, name: "Lilavati Hospital", type: "Hospital", area: "Bandra West", lat: 19.0544, lng: 72.8322, specialties: ["Cardiology", "Orthopedics", "Neurology"], rating: 4.8, beds: 323 },
    { id: 2, name: "Kokilaben Dhirubhai Ambani Hospital", type: "Hospital", area: "Andheri West", lat: 19.1361, lng: 72.8296, specialties: ["Cancer", "Cardiac", "Neuroscience"], rating: 4.9, beds: 750 },
    { id: 3, name: "Breach Candy Hospital", type: "Hospital", area: "Breach Candy", lat: 18.9718, lng: 72.8077, specialties: ["General", "Surgery", "Pediatrics"], rating: 4.7, beds: 98 },
    { id: 4, name: "Apollo Clinic Andheri", type: "Clinic", area: "Andheri East", lat: 19.1197, lng: 72.8464, specialties: ["General Medicine", "Dermatology"], rating: 4.5, beds: 0 },
    { id: 5, name: "Shree Nursing Home", type: "Nursing Home", area: "Malad West", lat: 19.1867, lng: 72.8484, specialties: ["Gynecology", "Maternity"], rating: 4.3, beds: 25 },
  ],
  "Pune": [
    { id: 6, name: "Ruby Hall Clinic", type: "Hospital", area: "Sassoon Road", lat: 18.5362, lng: 73.8784, specialties: ["Cardiology", "Oncology", "Neurology"], rating: 4.7, beds: 400 },
    { id: 7, name: "Sahyadri Hospital", type: "Hospital", area: "Deccan Gymkhana", lat: 18.5176, lng: 73.8418, specialties: ["Multi-specialty", "Trauma", "Orthopedics"], rating: 4.6, beds: 550 },
    { id: 8, name: "Jehangir Hospital", type: "Hospital", area: "Sassoon Road", lat: 18.5308, lng: 73.8743, specialties: ["General", "Surgery", "ENT"], rating: 4.5, beds: 270 },
    { id: 9, name: "Medipoint Clinic", type: "Clinic", area: "Aundh", lat: 18.5590, lng: 73.8080, specialties: ["General Medicine", "Pediatrics"], rating: 4.4, beds: 0 },
    { id: 10, name: "Poona Nursing Home", type: "Nursing Home", area: "Kothrud", lat: 18.5074, lng: 73.8077, specialties: ["Maternity", "Gynecology", "Pediatrics"], rating: 4.2, beds: 40 },
  ],
  "Aurangabad": [
    { id: 11, name: "Government Medical College Hospital", type: "Hospital", area: "City Chowk", lat: 19.8762, lng: 75.3433, specialties: ["General", "Emergency", "Surgery"], rating: 4.0, beds: 1200 },
    { id: 12, name: "Kamalnayan Bajaj Hospital", type: "Hospital", area: "Satara Parisar", lat: 19.8517, lng: 75.3156, specialties: ["Cardiology", "Orthopedics", "Cancer"], rating: 4.6, beds: 350 },
    { id: 13, name: "Apollo Clinic", type: "Clinic", area: "Cidco", lat: 19.8975, lng: 75.3234, specialties: ["General Medicine", "Dermatology"], rating: 4.3, beds: 0 },
    { id: 14, name: "Shifa Nursing Home", type: "Nursing Home", area: "Osmanpura", lat: 19.8830, lng: 75.3567, specialties: ["Maternity", "Gynecology"], rating: 4.1, beds: 30 },
  ],
  "Osmanabad": [
    { id: 15, name: "District Civil Hospital Osmanabad", type: "Hospital", area: "Station Road", lat: 18.1769, lng: 76.0391, specialties: ["General", "Emergency", "Maternity"], rating: 3.9, beds: 200 },
    { id: 16, name: "Shri Clinic", type: "Clinic", area: "Main Market", lat: 18.1800, lng: 76.0420, specialties: ["General Medicine"], rating: 4.0, beds: 0 },
    { id: 17, name: "Laxmi Nursing Home", type: "Nursing Home", area: "Near Bus Stand", lat: 18.1750, lng: 76.0380, specialties: ["Gynecology", "Maternity"], rating: 4.1, beds: 20 },
  ],
  "Solapur": [
    { id: 18, name: "Solapur Civil Hospital", type: "Hospital", area: "Civil Lines", lat: 17.6868, lng: 75.9005, specialties: ["General", "Emergency", "Surgery"], rating: 3.8, beds: 500 },
    { id: 19, name: "Deenanath Mangeshkar Hospital", type: "Hospital", area: "Hotgi Road", lat: 17.7032, lng: 75.9125, specialties: ["Cardiology", "Neurology", "Oncology"], rating: 4.5, beds: 250 },
    { id: 20, name: "Sai Clinic", type: "Clinic", area: "Shivaji Nagar", lat: 17.6900, lng: 75.9080, specialties: ["General Medicine", "Pediatrics"], rating: 4.2, beds: 0 },
  ],
  "Delhi": [
    { id: 21, name: "AIIMS Delhi", type: "Hospital", area: "Ansari Nagar", lat: 28.5672, lng: 77.2100, specialties: ["All Specialties", "Research", "Emergency"], rating: 4.8, beds: 2478 },
    { id: 22, name: "Fortis Hospital", type: "Hospital", area: "Shalimar Bagh", lat: 28.7196, lng: 77.1444, specialties: ["Cardiology", "Orthopedics", "Neuroscience"], rating: 4.7, beds: 262 },
    { id: 23, name: "Max Super Speciality Hospital", type: "Hospital", area: "Saket", lat: 28.5274, lng: 77.2159, specialties: ["Cancer", "Cardiac", "Transplant"], rating: 4.6, beds: 500 },
    { id: 24, name: "Apollo Clinic CP", type: "Clinic", area: "Connaught Place", lat: 28.6315, lng: 77.2167, specialties: ["General Medicine", "Dermatology"], rating: 4.4, beds: 0 },
  ],
  "Bangalore": [
    { id: 25, name: "Manipal Hospital", type: "Hospital", area: "Old Airport Road", lat: 12.9800, lng: 77.6488, specialties: ["Cardiology", "Neurology", "Transplant"], rating: 4.7, beds: 600 },
    { id: 26, name: "Apollo Hospital", type: "Hospital", area: "Bannerghatta Road", lat: 12.8943, lng: 77.5973, specialties: ["Multi-specialty", "Cancer", "Cardiac"], rating: 4.6, beds: 350 },
    { id: 27, name: "Aster CMI Hospital", type: "Hospital", area: "Hebbal", lat: 13.0514, lng: 77.5990, specialties: ["Orthopedics", "Neuroscience", "Gastro"], rating: 4.5, beds: 400 },
  ],
}

// ── Helper: calculate distance ────────────────────────────────────────────────
function calcDistance(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1)
}

// ── Type badge colors ─────────────────────────────────────────────────────────
const TYPE_STYLES = {
  "Hospital":     { bg: "#E0F2F1", color: "#00695C", icon: "🏥" },
  "Clinic":       { bg: "#E8F5E9", color: "#2E7D32", icon: "🩺" },
  "Nursing Home": { bg: "#FFF3E0", color: "#E65100", icon: "🏠" },
}

// ── Stars component ───────────────────────────────────────────────────────────
function Stars({ rating }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="10" height="10" viewBox="0 0 24 24"
          fill={i <= Math.round(rating) ? "#F59E0B" : "#E5E7EB"}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
      <span style={{ fontSize: 10, color: "#6B7280", marginLeft: 2 }}>{rating}</span>
    </span>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function LocationPopup({ onComplete, onSkip }) {
  const [step, setStep] = useState('location') // 'location' | 'city' | 'hospital'
  const [gpsStatus, setGpsStatus] = useState('idle') // 'idle' | 'loading' | 'success' | 'denied'
  const [userCoords, setUserCoords] = useState(null)
  const [detectedCity, setDetectedCity] = useState(null)
  const [selectedCity, setSelectedCity] = useState('')
  const [citySearch, setCitySearch] = useState('')
  const [selectedHospital, setSelectedHospital] = useState(null)
  const [typeFilter, setTypeFilter] = useState('All')
  const [hospitals, setHospitals] = useState([])
  const [animating, setAnimating] = useState(false)

  // Group cities by state
  const states = [...new Set(INDIAN_CITIES.map(c => c.state))].sort()
  const filteredCities = INDIAN_CITIES.filter(c =>
    c.name.toLowerCase().includes(citySearch.toLowerCase()) ||
    c.state.toLowerCase().includes(citySearch.toLowerCase())
  )

  // Detect nearest city from GPS
  function detectCityFromCoords(lat, lng) {
    let nearest = INDIAN_CITIES[0]
    let minDist = Infinity
    INDIAN_CITIES.forEach(city => {
      const d = parseFloat(calcDistance(lat, lng, city.lat, city.lng))
      if (d < minDist) { minDist = d; nearest = city }
    })
    return nearest
  }

  // Request GPS
  function requestGPS() {
    if (!navigator.geolocation) { setGpsStatus('denied'); return }
    setGpsStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        setUserCoords({ lat, lng })
        const city = detectCityFromCoords(lat, lng)
        setDetectedCity(city)
        setGpsStatus('success')
      },
      () => setGpsStatus('denied'),
      { timeout: 8000 }
    )
  }

  // Load hospitals for selected city
  function loadHospitals(cityName, coords) {
    const list = HOSPITALS_DB[cityName] || []
    const withDist = list.map(h => ({
      ...h,
      distance: coords ? parseFloat(calcDistance(coords.lat, coords.lng, h.lat, h.lng)) : null
    })).sort((a, b) => {
      if (a.distance !== null && b.distance !== null) return a.distance - b.distance
      return b.rating - a.rating
    })
    setHospitals(withDist)
    setTypeFilter('All')
    setSelectedHospital(null)
  }

  // Go to city step
  function goToHospitals(cityObj, coords) {
    setAnimating(true)
    setTimeout(() => {
      loadHospitals(cityObj.name, coords)
      setSelectedCity(cityObj.name)
      setStep('hospital')
      setAnimating(false)
    }, 300)
  }

  // Use GPS city
  function useGPSCity() {
    if (detectedCity) goToHospitals(detectedCity, userCoords)
  }

  // Use dropdown city
  function useDropdownCity() {
    const city = INDIAN_CITIES.find(c => c.name === selectedCity)
    if (city) goToHospitals(city, userCoords)
  }

  // Confirm hospital selection
  function confirmHospital() {
    const city = INDIAN_CITIES.find(c => c.name === selectedCity)
    onComplete({
      hospital: selectedHospital,
      city: selectedCity,
      userCoords,
      cityCoords: city ? { lat: city.lat, lng: city.lng } : null,
    })
  }

  const filteredHospitals = typeFilter === 'All'
    ? hospitals
    : hospitals.filter(h => h.type === typeFilter)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>

      <div
        className="w-full bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{
          maxWidth: step === 'hospital' ? 520 : 420,
          maxHeight: '90vh',
          transition: 'max-width 0.4s cubic-bezier(0.16,1,0.3,1)',
          animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)'
        }}
      >

        {/* ── STEP 1: Location Permission ── */}
        {step === 'location' && (
          <div className="flex flex-col">

            {/* Header */}
            <div className="px-6 pt-6 pb-5 text-center border-b border-gray-100">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #1d9e97, #0f7a74)' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 700, color: '#0D2B2E', margin: '0 0 6px' }}>
                Find Nearby Hospitals
              </h2>
              <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>
                Allow location access or choose your city to find the best hospitals near you
              </p>
            </div>

            <div className="px-6 py-5 flex flex-col gap-4">

              {/* GPS Button */}
              <button
                onClick={requestGPS}
                disabled={gpsStatus === 'loading' || gpsStatus === 'success'}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: 16,
                  border: '2px solid',
                  borderColor: gpsStatus === 'success' ? '#059669' : gpsStatus === 'denied' ? '#DC2626' : '#1d9e97',
                  background: gpsStatus === 'success' ? '#ECFDF5' : gpsStatus === 'denied' ? '#FEF2F2' : '#F0F9F8',
                  display: 'flex', alignItems: 'center', gap: 12,
                  cursor: gpsStatus === 'loading' || gpsStatus === 'success' ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: gpsStatus === 'success' ? '#059669' : gpsStatus === 'denied' ? '#DC2626' : '#1d9e97',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  {gpsStatus === 'loading' ? (
                    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                    </svg>
                  ) : gpsStatus === 'success' ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  )}
                </div>
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: gpsStatus === 'success' ? '#059669' : gpsStatus === 'denied' ? '#DC2626' : '#0D2B2E' }}>
                    {gpsStatus === 'idle' && '📍 Use My Current Location'}
                    {gpsStatus === 'loading' && 'Detecting your location...'}
                    {gpsStatus === 'success' && `✅ Location detected!`}
                    {gpsStatus === 'denied' && '❌ Location access denied'}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                    {gpsStatus === 'idle' && 'Tap to allow GPS access'}
                    {gpsStatus === 'loading' && 'Please wait...'}
                    {gpsStatus === 'success' && `Near ${detectedCity?.name}, ${detectedCity?.state}`}
                    {gpsStatus === 'denied' && 'Please choose city manually below'}
                  </div>
                </div>
              </button>

              {/* Use detected city */}
              {gpsStatus === 'success' && detectedCity && (
                <button
                  onClick={useGPSCity}
                  style={{
                    width: '100%', padding: '14px 20px', borderRadius: 16,
                    background: 'linear-gradient(135deg, #1d9e97, #0f7a74)',
                    color: 'white', fontWeight: 700, fontSize: 15,
                    border: 'none', cursor: 'pointer',
                    boxShadow: '0 4px 20px -4px rgba(29,158,151,0.5)',
                  }}
                >
                  🏥 Find Hospitals in {detectedCity.name}
                </button>
              )}

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, height: 1, background: '#E5E7EB' }}/>
                <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 500 }}>OR CHOOSE CITY</span>
                <div style={{ flex: 1, height: 1, background: '#E5E7EB' }}/>
              </div>

              {/* City Search */}
              <div style={{ position: 'relative' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"
                  style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}/>
                <input
                  type="text"
                  value={citySearch}
                  onChange={e => setCitySearch(e.target.value)}
                  placeholder="🔍 Search city or state..."
                  style={{
                    width: '100%', padding: '12px 14px 12px 38px',
                    borderRadius: 14, border: '2px solid #E5E7EB',
                    fontSize: 14, color: '#374151', outline: 'none',
                    background: '#F9FAFB', boxSizing: 'border-box',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#1d9e97'}
                  onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>

              {/* City Dropdown */}
              <div style={{
                border: '2px solid #E5E7EB', borderRadius: 14,
                maxHeight: 200, overflowY: 'auto',
              }}>
                {filteredCities.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
                    No cities found
                  </div>
                ) : filteredCities.map(city => (
                  <button
                    key={city.name}
                    onClick={() => setSelectedCity(city.name)}
                    style={{
                      width: '100%', padding: '10px 14px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: selectedCity === city.name ? '#F0F9F8' : 'white',
                      border: 'none', borderBottom: '1px solid #F3F4F6',
                      cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s',
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: selectedCity === city.name ? 600 : 400, color: selectedCity === city.name ? '#1d9e97' : '#374151' }}>
                      📍 {city.name}
                    </span>
                    <span style={{ fontSize: 11, color: '#9CA3AF' }}>{city.state}</span>
                  </button>
                ))}
              </div>

              {/* Find button for dropdown city */}
              <button
                onClick={useDropdownCity}
                disabled={!selectedCity}
                style={{
                  width: '100%', padding: '14px',
                  borderRadius: 16, border: 'none',
                  background: selectedCity ? 'linear-gradient(135deg, #1d9e97, #0f7a74)' : '#E5E7EB',
                  color: selectedCity ? 'white' : '#9CA3AF',
                  fontWeight: 700, fontSize: 15, cursor: selectedCity ? 'pointer' : 'not-allowed',
                  boxShadow: selectedCity ? '0 4px 20px -4px rgba(29,158,151,0.4)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                🏥 {selectedCity ? `Find Hospitals in ${selectedCity}` : 'Select a city first'}
              </button>

              {/* Skip */}
              <button onClick={onSkip}
                style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: 13, cursor: 'pointer', padding: '4px' }}>
                Skip for now →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Hospital Selection ── */}
        {step === 'hospital' && (
          <div className="flex flex-col" style={{ maxHeight: '90vh' }}>

            {/* Header */}
            <div className="px-5 pt-5 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-1">
                <button
                  onClick={() => setStep('location')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: '#64748B', fontSize: 13, padding: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M15 18l-6-6 6-6"/>
                  </svg>
                  Back
                </button>
                <button onClick={onSkip} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 13 }}>Skip</button>
              </div>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, color: '#0D2B2E', margin: '8px 0 2px' }}>
                📍 {selectedCity}
              </h2>
              <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>
                {hospitals.length} facilities found
                {userCoords ? ' · Sorted by distance' : ' · Sorted by rating'}
              </p>
            </div>

            {/* Type Filter */}
            <div style={{ padding: '12px 16px', display: 'flex', gap: 8, borderBottom: '1px solid #F3F4F6', overflowX: 'auto' }}>
              {['All', 'Hospital', 'Clinic', 'Nursing Home'].map(type => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  style={{
                    padding: '6px 14px', borderRadius: 20, border: '1.5px solid',
                    borderColor: typeFilter === type ? '#1d9e97' : '#E5E7EB',
                    background: typeFilter === type ? '#1d9e97' : 'white',
                    color: typeFilter === type ? 'white' : '#64748B',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                    transition: 'all 0.2s',
                  }}
                >
                  {type === 'Hospital' ? '🏥' : type === 'Clinic' ? '🩺' : type === 'Nursing Home' ? '🏠' : '🔍'} {type}
                </button>
              ))}
            </div>

            {/* Hospital List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredHospitals.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF', fontSize: 14 }}>
                  No {typeFilter.toLowerCase()}s found in {selectedCity}
                </div>
              ) : filteredHospitals.map(h => {
                const ts = TYPE_STYLES[h.type] || TYPE_STYLES["Hospital"]
                const isSelected = selectedHospital?.id === h.id
                return (
                  <button
                    key={h.id}
                    onClick={() => setSelectedHospital(isSelected ? null : h)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '14px 16px',
                      borderRadius: 16, border: '2px solid',
                      borderColor: isSelected ? '#1d9e97' : '#F3F4F6',
                      background: isSelected ? '#F0F9F8' : 'white',
                      cursor: 'pointer', transition: 'all 0.2s',
                      boxShadow: isSelected ? '0 0 0 3px rgba(29,158,151,0.15)' : '0 1px 4px rgba(0,0,0,0.06)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#0D2B2E' }}>{h.name}</span>
                          {isSelected && (
                            <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#1d9e97', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                                <path d="M20 6L9 17l-5-5"/>
                              </svg>
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>{h.area}</div>
                        <Stars rating={h.rating} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 8, background: ts.bg, color: ts.color }}>
                          {ts.icon} {h.type}
                        </span>
                        {h.distance !== null && (
                          <span style={{ fontSize: 11, color: '#1d9e97', fontWeight: 600 }}>
                            📍 {h.distance} km
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Specialties */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                      {h.specialties.slice(0, 3).map(s => (
                        <span key={s} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: '#F0F9F8', color: '#1d9e97', fontWeight: 500 }}>
                          {s}
                        </span>
                      ))}
                      {h.beds > 0 && (
                        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: '#F5F3FF', color: '#7C3AED', fontWeight: 500 }}>
                          🛏 {h.beds} beds
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Confirm Button */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid #F3F4F6' }}>
              <button
                onClick={confirmHospital}
                disabled={!selectedHospital}
                style={{
                  width: '100%', padding: '14px',
                  borderRadius: 16, border: 'none',
                  background: selectedHospital ? 'linear-gradient(135deg, #1d9e97, #0f7a74)' : '#E5E7EB',
                  color: selectedHospital ? 'white' : '#9CA3AF',
                  fontWeight: 700, fontSize: 15,
                  cursor: selectedHospital ? 'pointer' : 'not-allowed',
                  boxShadow: selectedHospital ? '0 4px 20px -4px rgba(29,158,151,0.5)' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {selectedHospital
                  ? `✅ Register at ${selectedHospital.name}`
                  : 'Select a hospital to continue'}
              </button>
            </div>
          </div>
        )}

      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
