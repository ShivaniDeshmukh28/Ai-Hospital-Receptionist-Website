import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const INDIAN_CITIES = [
  { name: "Mumbai",      state: "Maharashtra",    lat: 19.0760, lng: 72.8777 },
  { name: "Pune",        state: "Maharashtra",    lat: 18.5204, lng: 73.8567 },
  { name: "Aurangabad",  state: "Maharashtra",    lat: 19.8762, lng: 75.3433 },
  { name: "Nagpur",      state: "Maharashtra",    lat: 21.1458, lng: 79.0882 },
  { name: "Nashik",      state: "Maharashtra",    lat: 19.9975, lng: 73.7898 },
  { name: "Solapur",     state: "Maharashtra",    lat: 17.6868, lng: 75.9005 },
  { name: "Osmanabad",   state: "Maharashtra",    lat: 18.1769, lng: 76.0391 },
  { name: "Latur",       state: "Maharashtra",    lat: 18.4088, lng: 76.5604 },
  { name: "Kolhapur",    state: "Maharashtra",    lat: 16.7050, lng: 74.2433 },
  { name: "Satara",      state: "Maharashtra",    lat: 17.6805, lng: 73.9946 },
  { name: "Delhi",       state: "Delhi",          lat: 28.6139, lng: 77.2090 },
  { name: "Bangalore",   state: "Karnataka",      lat: 12.9716, lng: 77.5946 },
  { name: "Chennai",     state: "Tamil Nadu",     lat: 13.0827, lng: 80.2707 },
  { name: "Hyderabad",   state: "Telangana",      lat: 17.3850, lng: 78.4867 },
  { name: "Kolkata",     state: "West Bengal",    lat: 22.5726, lng: 88.3639 },
  { name: "Ahmedabad",   state: "Gujarat",        lat: 23.0225, lng: 72.5714 },
  { name: "Jaipur",      state: "Rajasthan",      lat: 26.9124, lng: 75.7873 },
  { name: "Lucknow",     state: "Uttar Pradesh",  lat: 26.8467, lng: 80.9462 },
  { name: "Bhopal",      state: "Madhya Pradesh", lat: 23.2599, lng: 77.4126 },
  { name: "Chandigarh",  state: "Punjab",         lat: 30.7333, lng: 76.7794 },
  { name: "Indore",      state: "Madhya Pradesh", lat: 22.7196, lng: 75.8577 },
  { name: "Patna",       state: "Bihar",          lat: 25.5941, lng: 85.1376 },
  { name: "Kochi",       state: "Kerala",         lat:  9.9312, lng: 76.2673 },
  { name: "Guwahati",    state: "Assam",          lat: 26.1445, lng: 91.7362 },
  { name: "Surat",       state: "Gujarat",        lat: 21.1702, lng: 72.8311 },
]

const HOSPITALS_DB = {
  "Mumbai": [
    { id: 1,  name: "Lilavati Hospital",                type: "Hospital",     area: "Bandra West",    lat: 19.0544, lng: 72.8322, specialties: ["Cardiology","Orthopedics","Neurology"],    rating: 4.8, beds: 323 },
    { id: 2,  name: "Kokilaben Dhirubhai Ambani Hospital",  type: "Hospital",     area: "Andheri West",   lat: 19.1361, lng: 72.8296, specialties: ["Cancer","Cardiac","Neuroscience"],           rating: 4.9, beds: 750 },
    { id: 3,  name: "Breach Candy Hospital",                type: "Hospital",     area: "Breach Candy",   lat: 18.9718, lng: 72.8077, specialties: ["General","Surgery","Pediatrics"],            rating: 4.7, beds: 98  },
    { id: 4,  name: "Apollo Clinic Andheri",                type: "Clinic",       area: "Andheri East",   lat: 19.1197, lng: 72.8464, specialties: ["General Medicine","Dermatology"],           rating: 4.5, beds: 0   },
    { id: 5,  name: "Shree Nursing Home",                   type: "Nursing Home", area: "Malad West",     lat: 19.1867, lng: 72.8484, specialties: ["Gynecology","Maternity"],                   rating: 4.3, beds: 25  },
  ],
  "Pune": [
    { id: 6,  name: "Ruby Hall Clinic",    type: "Hospital",     area: "Sassoon Road",      lat: 18.5362, lng: 73.8784, specialties: ["Cardiology","Oncology","Neurology"],         rating: 4.7, beds: 400 },
    { id: 7,  name: "Sahyadri Hospital",   type: "Hospital",     area: "Deccan Gymkhana",   lat: 18.5176, lng: 73.8418, specialties: ["Multi-specialty","Trauma","Orthopedics"],    rating: 4.6, beds: 550 },
    { id: 8,  name: "Jehangir Hospital",   type: "Hospital",     area: "Sassoon Road",      lat: 18.5308, lng: 73.8743, specialties: ["General","Surgery","ENT"],                  rating: 4.5, beds: 270 },
    { id: 9,  name: "Medipoint Clinic",    type: "Clinic",       area: "Aundh",             lat: 18.5590, lng: 73.8080, specialties: ["General Medicine","Pediatrics"],            rating: 4.4, beds: 0   },
    { id: 10, name: "Poona Nursing Home",  type: "Nursing Home", area: "Kothrud",           lat: 18.5074, lng: 73.8077, specialties: ["Maternity","Gynecology","Pediatrics"],      rating: 4.2, beds: 40  },
  ],
  "Aurangabad": [
    { id: 11, name: "Government Medical College Hospital", type: "Hospital",     area: "City Chowk",     lat: 19.8762, lng: 75.3433, specialties: ["General","Emergency","Surgery"],         rating: 4.0, beds: 1200 },
    { id: 12, name: "Kamalnayan Bajaj Hospital",           type: "Hospital",     area: "Satara Parisar", lat: 19.8517, lng: 75.3156, specialties: ["Cardiology","Orthopedics","Cancer"],      rating: 4.6, beds: 350  },
    { id: 13, name: "Apollo Clinic",                       type: "Clinic",       area: "Cidco",          lat: 19.8975, lng: 75.3234, specialties: ["General Medicine","Dermatology"],        rating: 4.3, beds: 0    },
    { id: 14, name: "Shifa Nursing Home",                  type: "Nursing Home", area: "Osmanpura",      lat: 19.8830, lng: 75.3567, specialties: ["Maternity","Gynecology"],               rating: 4.1, beds: 30   },
  ],
  "Osmanabad": [
    { id: 15, name: "District Civil Hospital Osmanabad", type: "Hospital",     area: "Station Road",   lat: 18.1769, lng: 76.0391, specialties: ["General","Emergency","Maternity"], rating: 3.9, beds: 200 },
    { id: 16, name: "Shri Clinic",                       type: "Clinic",       area: "Main Market",    lat: 18.1800, lng: 76.0420, specialties: ["General Medicine"],               rating: 4.0, beds: 0   },
    { id: 17, name: "Laxmi Nursing Home",                type: "Nursing Home", area: "Near Bus Stand", lat: 18.1750, lng: 76.0380, specialties: ["Gynecology","Maternity"],         rating: 4.1, beds: 20  },
  ],
  "Solapur": [
    { id: 18, name: "Solapur Civil Hospital",          type: "Hospital", area: "Civil Lines",    lat: 17.6868, lng: 75.9005, specialties: ["General","Emergency","Surgery"],           rating: 3.8, beds: 500 },
    { id: 19, name: "Deenanath Mangeshkar Hospital",   type: "Hospital", area: "Hotgi Road",     lat: 17.7032, lng: 75.9125, specialties: ["Cardiology","Neurology","Oncology"],      rating: 4.5, beds: 250 },
    { id: 20, name: "Sai Clinic",                      type: "Clinic",   area: "Shivaji Nagar",  lat: 17.6900, lng: 75.9080, specialties: ["General Medicine","Pediatrics"],        rating: 4.2, beds: 0   },
  ],
  "Latur": [
    { id: 28, name: "District General Hospital Latur",  type: "Hospital",     area: "Station Road",   lat: 18.4088, lng: 76.5604, specialties: ["General","Emergency","Surgery"],    rating: 3.8, beds: 400 },
    { id: 29, name: "Shri Siddheshwar Hospital",        type: "Hospital",     area: "Main Road",      lat: 18.4100, lng: 76.5620, specialties: ["Cardiology","Orthopedics"],          rating: 4.2, beds: 150 },
    { id: 30, name: "Latur City Clinic",                type: "Clinic",       area: "Bus Stand Area", lat: 18.4070, lng: 76.5590, specialties: ["General Medicine","Pediatrics"],    rating: 4.0, beds: 0   },
    { id: 31, name: "Mata Nursing Home",                type: "Nursing Home", area: "Udgir Road",     lat: 18.4050, lng: 76.5580, specialties: ["Maternity","Gynecology"],          rating: 4.1, beds: 25  },
  ],
  "Delhi": [
    { id: 21, name: "AIIMS Delhi",                   type: "Hospital", area: "Ansari Nagar",     lat: 28.5672, lng: 77.2100, specialties: ["All Specialties","Research","Emergency"], rating: 4.8, beds: 2478 },
    { id: 22, name: "Fortis Hospital",               type: "Hospital", area: "Shalimar Bagh",   lat: 28.7196, lng: 77.1444, specialties: ["Cardiology","Orthopedics","Neuroscience"],rating: 4.7, beds: 262  },
    { id: 23, name: "Max Super Speciality Hospital",  type: "Hospital", area: "Saket",           lat: 28.5274, lng: 77.2159, specialties: ["Cancer","Cardiac","Transplant"],          rating: 4.6, beds: 500  },
    { id: 24, name: "Apollo Clinic CP",               type: "Clinic",   area: "Connaught Place", lat: 28.6315, lng: 77.2167, specialties: ["General Medicine","Dermatology"],        rating: 4.4, beds: 0    },
  ],
  "Bangalore": [
    { id: 25, name: "Manipal Hospital",    type: "Hospital", area: "Old Airport Road",  lat: 12.9800, lng: 77.6488, specialties: ["Cardiology","Neurology","Transplant"],    rating: 4.7, beds: 600 },
    { id: 26, name: "Apollo Hospital",     type: "Hospital", area: "Bannerghatta Road", lat: 12.8943, lng: 77.5973, specialties: ["Multi-specialty","Cancer","Cardiac"],      rating: 4.6, beds: 350 },
    { id: 27, name: "Aster CMI Hospital",  type: "Hospital", area: "Hebbal",            lat: 13.0514, lng: 77.5990, specialties: ["Orthopedics","Neuroscience","Gastro"],     rating: 4.5, beds: 400 },
  ],
}

function calcDistance(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1)
}

const TYPE_STYLES = {
  "Hospital":     { bg: "#E0F2F1", color: "#00695C", icon: "🏥", pinColor: "#1d9e97" },
  "Clinic":       { bg: "#E8F5E9", color: "#2E7D32", icon: "🩺", pinColor: "#2E7D32" },
  "Nursing Home": { bg: "#FFF3E0", color: "#E65100", icon: "🏠", pinColor: "#E65100" },
}

function makePin(color, isSelected = false) {
  return L.divIcon({
    className: '',
    html: `<div style="width:${isSelected?32:26}px;height:${isSelected?32:26}px;border-radius:50% 50% 50% 0;background:${color};border:${isSelected?'3px':'2px'} solid white;transform:rotate(-45deg);box-shadow:0 ${isSelected?4:2}px ${isSelected?12:6}px rgba(0,0,0,${isSelected?0.45:0.28});transition:all 0.2s;"></div>`,
    iconSize:    [isSelected?32:26, isSelected?32:26],
    iconAnchor:  [isSelected?16:13, isSelected?32:26],
    popupAnchor: [0, -30],
  })
}

function makeUserPin() {
  return L.divIcon({
    className: '',
    html: `<div style="width:18px;height:18px;border-radius:50%;background:#3B82F6;border:3px solid white;box-shadow:0 0 0 4px rgba(59,130,246,0.35);"></div>`,
    iconSize: [18,18], iconAnchor: [9,9], popupAnchor: [0,-12],
  })
}

function FitBounds({ hospitals, userCoords }) {
  const map = useMap()
  useEffect(() => {
    const pts = hospitals.map(h => [h.lat, h.lng])
    if (userCoords) pts.push([userCoords.lat, userCoords.lng])
    if (pts.length > 0) map.fitBounds(pts, { padding:[40,40], maxZoom:14 })
  }, [hospitals, userCoords, map])
  return null
}

function FlyToSelected({ hospital }) {
  const map = useMap()
  useEffect(() => {
    if (hospital) map.flyTo([hospital.lat, hospital.lng], 14, { duration:0.8 })
  }, [hospital, map])
  return null
}

function HospitalMap({ hospitals, userCoords, selectedHospital, onSelectHospital }) {
  const center = userCoords ? [userCoords.lat, userCoords.lng] : hospitals[0] ? [hospitals[0].lat, hospitals[0].lng] : [20.5937, 78.9629]
  return (
    <MapContainer center={center} zoom={12} style={{ height:260, width:'100%', borderRadius:14, zIndex:0 }} scrollWheelZoom={true}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap'/>
      <FitBounds hospitals={hospitals} userCoords={userCoords}/>
      <FlyToSelected hospital={selectedHospital}/>
      {userCoords && (
        <Marker position={[userCoords.lat, userCoords.lng]} icon={makeUserPin()}>
          <Popup><div style={{ fontSize:13, fontWeight:600 }}>📍 You are here</div></Popup>
        </Marker>
      )}
      {hospitals.map(h => {
        const ts = TYPE_STYLES[h.type] || TYPE_STYLES["Hospital"]
        const isSelected = selectedHospital?.id === h.id
        return (
          <Marker key={h.id} position={[h.lat, h.lng]} icon={makePin(ts.pinColor, isSelected)} eventHandlers={{ click: () => onSelectHospital(isSelected ? null : h) }}>
            <Popup>
              <div style={{ minWidth:160 }}>
                <div style={{ fontWeight:700, fontSize:13, marginBottom:2 }}>{ts.icon} {h.name}</div>
                <div style={{ fontSize:11, color:'#64748B', marginBottom:4 }}>{h.area}</div>
                <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                  <span style={{ fontSize:11, padding:'2px 7px', borderRadius:6, background:ts.bg, color:ts.color, fontWeight:600 }}>{h.type}</span>
                  {h.distance!=null && <span style={{ fontSize:11, color:'#1d9e97', fontWeight:600 }}>📍 {h.distance} km</span>}
                </div>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}

function MapLegend() {
  return (
    <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap', padding:'6px 0', fontSize:11, color:'#64748B' }}>
      <span style={{ display:'flex', alignItems:'center', gap:4 }}>
        <span style={{ width:10, height:10, borderRadius:'50%', background:'#3B82F6', display:'inline-block', boxShadow:'0 0 0 2px rgba(59,130,246,0.3)' }}/>You
      </span>
      {Object.entries(TYPE_STYLES).map(([type,s]) => (
        <span key={type} style={{ display:'flex', alignItems:'center', gap:4 }}>
          <span style={{ width:10, height:10, borderRadius:'50% 50% 50% 0', background:s.pinColor, display:'inline-block', transform:'rotate(-45deg)' }}/>
          {type}
        </span>
      ))}
    </div>
  )
}

// Fallback endpoints to avoid Overpass 504 timeouts
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter'
]

async function fetchNearbyHospitals(lat, lng, radiusMeters=10000) {
  const query = `[out:json][timeout:10];(node["amenity"="hospital"](around:${radiusMeters},${lat},${lng});way["amenity"="hospital"](around:${radiusMeters},${lat},${lng});node["amenity"="clinic"](around:${radiusMeters},${lat},${lng});way["amenity"="clinic"](around:${radiusMeters},${lat},${lng});node["amenity"="doctors"](around:${radiusMeters},${lat},${lng});node["healthcare"="hospital"](around:${radiusMeters},${lat},${lng});way["healthcare"="hospital"](around:${radiusMeters},${lat},${lng}););out center;`
  
  let json = null
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, { method: 'POST', body: 'data=' + encodeURIComponent(query) })
      if (res.ok) {
        json = await res.json()
        break
      }
    } catch {
      console.warn(`Overpass endpoint ${endpoint} failed, trying fallback...`)
    }
  }

  if (!json || !json.elements) {
    throw new Error('All Overpass API endpoints failed or timed out.')
  }

  let id = 9000
  return json.elements.filter(el => el.tags?.name).map(el => {
    const elLat = el.lat ?? el.center?.lat
    const elLng = el.lon ?? el.center?.lon
    const amenity = el.tags.amenity || el.tags.healthcare || ''
    let type = 'Hospital'
    if (amenity==='clinic'||amenity==='doctors') type='Clinic'
    return { 
      id: id++, 
      name: el.tags.name, 
      type, 
      area: el.tags['addr:suburb']||el.tags['addr:city']||'', 
      lat: elLat, 
      lng: elLng, 
      specialties: [el.tags.specialty||'General Medicine'].filter(Boolean), 
      rating: null, 
      beds: parseInt(el.tags['capacity:beds']||'0')||0, 
      distance: parseFloat(calcDistance(lat,lng,elLat,elLng)), 
      phone: el.tags.phone||null, 
      source: 'live' 
    }
  }).filter(h=>h.lat&&h.lng).sort((a,b)=>a.distance-b.distance)
}

export default function LocationPopup({ onComplete, onSkip }) {
  const [step, setStep]                 = useState('location')
  const [gpsStatus, setGpsStatus]       = useState('idle')
  const [userCoords, setUserCoords]     = useState(null)
  const [detectedCity, setDetectedCity] = useState(null)
  const [selectedCity, setSelectedCity] = useState('')
  const [citySearch, setCitySearch]     = useState('')
  const [selectedHospital, setSelectedHospital] = useState(null)
  const [typeFilter, setTypeFilter]     = useState('All')
  const [hospitals, setHospitals]       = useState([])
  const [showMap, setShowMap]           = useState(true)
  const [overpassLoading, setOverpassLoading] = useState(false)
  const [overpassError, setOverpassError] = useState(null)
  const [usingLiveData, setUsingLiveData] = useState(false)
  const listRef = useRef(null)

  const filteredCities = INDIAN_CITIES.filter(c =>
    c.name.toLowerCase().includes(citySearch.toLowerCase()) ||
    c.state.toLowerCase().includes(citySearch.toLowerCase())
  )

  function detectCityFromCoords(lat, lng) {
    let nearest = INDIAN_CITIES[0], minDist = Infinity
    INDIAN_CITIES.forEach(city => {
      const d = parseFloat(calcDistance(lat, lng, city.lat, city.lng))
      if (d < minDist) { minDist = d; nearest = city }
    })
    return nearest
  }

  function requestGPS() {
    if (!navigator.geolocation) { setGpsStatus('denied'); return }
    setGpsStatus('loading')
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude:lat, longitude:lng } }) => {
        setUserCoords({ lat, lng })
        setDetectedCity(detectCityFromCoords(lat, lng))
        setGpsStatus('success')
      },
      () => setGpsStatus('denied'),
      { timeout:10000, enableHighAccuracy:true, maximumAge:0 }
    )
  }

  function loadHospitals(cityName, coords) {
    const list = (HOSPITALS_DB[cityName]||[]).map(h => ({
      ...h,
      distance: coords ? parseFloat(calcDistance(coords.lat, coords.lng, h.lat, h.lng)) : null,
      source: 'static',
    })).sort((a,b) => {
      if (a.distance!==null && b.distance!==null) return a.distance-b.distance
      return b.rating-a.rating
    })
    setHospitals(list); setUsingLiveData(false); setTypeFilter('All'); setSelectedHospital(null)
  }

  async function loadHospitalsByGPS(coords) {
    setOverpassLoading(true); setOverpassError(null); setUsingLiveData(true); setHospitals([]); setTypeFilter('All'); setSelectedHospital(null)
    try {
      const results = await fetchNearbyHospitals(coords.lat, coords.lng, 15000)
      if (results.length === 0) {
        const wider = await fetchNearbyHospitals(coords.lat, coords.lng, 30000)
        setHospitals(wider)
      } else { setHospitals(results) }
    } catch {
      setOverpassError('Could not load live hospitals. Showing nearest city data instead.')
      setUsingLiveData(false); loadHospitals(detectedCity?.name, coords)
    } finally { setOverpassLoading(false) }
  }

  function goToHospitals(cityObj, coords) {
    loadHospitals(cityObj.name, coords); setSelectedCity(cityObj.name); setStep('hospital')
  }

  async function useGPSCity() {
    if (!userCoords) return
    setSelectedCity('Near You'); setStep('hospital')
    await loadHospitalsByGPS(userCoords)
  }

  function useDropdownCity() {
    const city = INDIAN_CITIES.find(c => c.name === selectedCity)
    if (city) goToHospitals(city, userCoords)
  }

  function confirmHospital() {
    const city = INDIAN_CITIES.find(c => c.name === selectedCity)
    onComplete({ hospital:selectedHospital, city:selectedCity, userCoords, cityCoords: city ? {lat:city.lat,lng:city.lng} : null })
  }

  function handleSelectHospital(h) {
    setSelectedHospital(prev => prev?.id===h?.id ? null : h)
    if (h && listRef.current) {
      setTimeout(() => {
        const card = listRef.current?.querySelector(`[data-id="${h.id}"]`)
        card?.scrollIntoView({ behavior:'smooth', block:'nearest' })
      }, 100)
    }
  }

  const filteredHospitals = typeFilter==='All' ? hospitals : hospitals.filter(h=>h.type===typeFilter)

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className={`w-full ${step === 'hospital' ? 'max-w-xl' : 'max-w-md'} max-h-[88vh] bg-white rounded-3xl shadow-clinical-lg border border-slate-200/80 overflow-hidden flex flex-col animate-slide-up`}>

        {/* ════ STEP 1 — Location ════ */}
        {step==='location' && (
          <>
            <div className="p-6 text-center border-b border-slate-100 bg-slate-50/50">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center mx-auto mb-3 shadow-md shadow-teal-700/20">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <h2 className="font-display text-xl font-bold text-slate-900 mb-1">Find Nearby Hospitals</h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Allow location access or select your city to find hospitals, clinics &amp; diagnostic centers
              </p>
            </div>

            <div className="p-6 flex flex-col gap-4 overflow-y-auto">
              <button onClick={requestGPS} disabled={gpsStatus==='loading'||gpsStatus==='success'}
                className={`w-full p-4 rounded-2xl border-2 flex items-center gap-3.5 transition-all text-left ${gpsStatus==='success' ? 'border-emerald-500 bg-emerald-50/60' : gpsStatus==='denied' ? 'border-red-400 bg-red-50/60' : 'border-teal-600/30 bg-teal-50/30 hover:border-teal-600'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm ${gpsStatus==='success' ? 'bg-emerald-600' : gpsStatus==='denied' ? 'bg-red-600' : 'bg-teal-600'}`}>
                  {gpsStatus==='loading'
                    ? <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    : gpsStatus==='success'
                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  }
                </div>
                <div>
                  <div className={`font-bold text-sm ${gpsStatus==='success'?'text-emerald-800':gpsStatus==='denied'?'text-red-700':'text-slate-900'}`}>
                    {gpsStatus==='idle'&&'📍 Use My Current Location'}
                    {gpsStatus==='loading'&&'Detecting location...'}
                    {gpsStatus==='success'&&'✅ Location Detected'}
                    {gpsStatus==='denied'&&'❌ GPS Access Denied'}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {gpsStatus==='idle'&&'Tap to enable automatic location'}
                    {gpsStatus==='loading'&&'Please wait a moment...'}
                    {gpsStatus==='success'&&`Near ${detectedCity?.name}, ${detectedCity?.state}`}
                    {gpsStatus==='denied'&&'Select a city manually below'}
                  </div>
                </div>
              </button>

              {gpsStatus==='success' && detectedCity && (
                <button onClick={useGPSCity} className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-800 text-white font-bold text-sm shadow-md shadow-teal-700/20 hover:scale-[1.01] active:scale-[0.98] transition-all">
                  🛰 Find Real Hospitals Near My Location
                </button>
              )}

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200"/>
                <span className="text-[11px] font-bold text-slate-400 tracking-wider">OR SELECT CITY</span>
                <div className="flex-1 h-px bg-slate-200"/>
              </div>

              <input type="text" value={citySearch} onChange={e=>setCitySearch(e.target.value)} placeholder="🔍 Search city or state..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:border-teal-600 focus:bg-white transition-all"
              />

              <div className="border border-slate-200 rounded-2xl max-h-44 overflow-y-auto divide-y divide-slate-100">
                {filteredCities.length===0
                  ? <div className="p-4 text-center text-slate-400 text-xs">No matching cities found</div>
                  : filteredCities.map(city => (
                    <button key={city.name} onClick={()=>setSelectedCity(city.name)}
                      className={`w-full px-4 py-2.5 flex justify-between items-center text-left text-sm transition-colors ${selectedCity===city.name?'bg-teal-50 text-teal-800 font-bold':'hover:bg-slate-50 text-slate-700'}`}>
                      <span>📍 {city.name}</span>
                      <span className="text-xs text-slate-400">{city.state}</span>
                    </button>
                  ))
                }
              </div>

              <button onClick={useDropdownCity} disabled={!selectedCity}
                className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all ${selectedCity?'bg-gradient-to-r from-teal-600 to-teal-800 text-white shadow-md shadow-teal-700/20 hover:scale-[1.01]':'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                🏥 {selectedCity ? `Find Hospitals in ${selectedCity}` : 'Select a city first'}
              </button>

              <button onClick={onSkip} className="text-xs text-slate-400 hover:text-slate-600 self-center">
                Skip for now →
              </button>
            </div>
          </>
        )}

        {/* ════ STEP 2 — Hospital Selection ════ */}
        {step==='hospital' && (
          <>
            <div className="p-4 border-b border-slate-100 shrink-0">
              <div className="flex justify-between items-center mb-2">
                <button onClick={()=>setStep('location')} className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
                  Back
                </button>
                <div className="flex gap-2 items-center">
                  <button onClick={()=>setShowMap(m=>!m)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${showMap?'bg-blue-50 border-blue-200 text-blue-700':'bg-white border-slate-200 text-slate-600'}`}>
                    {showMap ? 'Hide Map' : 'Show Map'}
                  </button>
                  <button onClick={onSkip} className="text-xs text-slate-400 hover:text-slate-600">Skip</button>
                </div>
              </div>
              <h2 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                📍 {usingLiveData ? 'Hospitals Near You' : selectedCity}
                {usingLiveData && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold">LIVE</span>}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {overpassLoading ? '🔄 Fetching facilities...' : overpassError ? `⚠️ ${overpassError}` : `${hospitals.length} facilities available`}
              </p>
            </div>

            {overpassLoading && (
              <div className="p-8 text-center flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin"/>
                <p className="text-sm font-medium text-slate-600">Locating hospitals via OpenStreetMap...</p>
              </div>
            )}

            {showMap && !overpassLoading && (
              <div className="p-3 pb-0 shrink-0">
                <HospitalMap hospitals={filteredHospitals} userCoords={userCoords} selectedHospital={selectedHospital} onSelectHospital={handleSelectHospital}/>
                <MapLegend/>
              </div>
            )}

            {!overpassLoading && (
              <div className="p-3 flex gap-2 overflow-x-auto border-b border-slate-100 shrink-0">
                {['All','Hospital','Clinic','Nursing Home'].map(type => (
                  <button key={type} onClick={()=>setTypeFilter(type)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold border whitespace-nowrap transition-all ${typeFilter===type?'bg-teal-600 border-teal-600 text-white':'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                    {type==='Hospital'?'🏥':type==='Clinic'?'🩺':type==='Nursing Home'?'🏠':'🔍'} {type}
                  </button>
                ))}
              </div>
            )}

            {!overpassLoading && (
              <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-2.5">
                {filteredHospitals.length===0
                  ? <div className="text-center py-8 text-slate-400 text-sm">No facilities found</div>
                  : filteredHospitals.map(h => {
                    const isSelected = selectedHospital?.id===h.id
                    return (
                      <button key={h.id} data-id={h.id} onClick={()=>handleSelectHospital(isSelected?null:h)}
                        className={`w-full text-left p-3.5 rounded-2xl border-2 transition-all ${isSelected ? 'border-teal-600 bg-teal-50/50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                        <div className="flex justify-between items-start gap-2 mb-1.5">
                          <div>
                            <p className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                              {h.name}
                              {isSelected && <span className="w-4 h-4 rounded-full bg-teal-600 text-white text-[10px] flex items-center justify-center font-bold">✓</span>}
                            </p>
                            <p className="text-xs text-slate-500">{h.area}</p>
                          </div>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-teal-100 text-teal-800 shrink-0">
                            {h.type} {h.distance!=null && `· ${h.distance}km`}
                          </span>
                        </div>
                        <div className="flex gap-1.5 flex-wrap">
                          {h.specialties?.slice(0,3).map(s=><span key={s} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">{s}</span>)}
                        </div>
                      </button>
                    )
                  })
                }
              </div>
            )}

            {!overpassLoading && (
              <div className="p-3 border-t border-slate-100 shrink-0">
                <button onClick={confirmHospital} disabled={!selectedHospital}
                  className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all ${selectedHospital ? 'bg-gradient-to-r from-teal-600 to-teal-800 text-white shadow-md shadow-teal-700/20 hover:scale-[1.01]' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                  {selectedHospital ? `Select ${selectedHospital.name}` : 'Select a Hospital'}
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}