import { useEffect, useState } from 'react'

export default function AdminPanel({ onClose, locationData, user }) {
  const [loaded, setLoaded] = useState(false)

  // Pass receptionist data into admin panel via localStorage
  // so new patient registrations appear in the HMS queue
  useEffect(() => {
    if (locationData?.hospital && user) {
      const pendingPatient = {
        name    : user.name  || 'Walk-in Patient',
        phone   : user.phone || '',
        email   : user.email || '',
        hospital: locationData.hospital?.name || '',
        city    : locationData.city || '',
        time    : new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        addedAt : Date.now(),
      }
      // Admin panel reads this key on load to pre-fill a new patient
      localStorage.setItem('receptionist_pending_patient', JSON.stringify(pendingPatient))
    }
  }, [locationData, user])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex', flexDirection: 'column',
      animation: 'adminSlideIn 0.3s cubic-bezier(0.16,1,0.3,1)',
    }}>
      {/* Header bar */}
      <div style={{
        height: 52, background: '#0D1F17',
        display: 'flex', alignItems: 'center',
        padding: '0 20px', gap: 14, flexShrink: 0,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: '#12906A',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 14, color: '#fff',
        }}>M</div>
        <span style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 600, fontSize: 14, color: '#fff',
        }}>MedCare HMS — Admin Panel</span>

        {locationData?.hospital && (
          <span style={{
            marginLeft: 8, padding: '3px 10px', borderRadius: 20,
            background: 'rgba(18,144,106,0.3)', border: '1px solid rgba(18,144,106,0.5)',
            fontSize: 11, color: '#4ade80', fontWeight: 600,
          }}>
            📍 {locationData.hospital.name}
          </span>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          {!loaded && (
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>Loading panel...</span>
          )}
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 8, padding: '6px 14px',
              color: '#fff', fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* iframe — loads the HTML admin panel */}
      <iframe
        src="/admin/medcare_complete.html"
        style={{
          flex: 1, border: 'none',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s',
        }}
        onLoad={() => setLoaded(true)}
        title="MedCare Hospital Management System"
      />

      {/* Loading skeleton while iframe loads */}
      {!loaded && (
        <div style={{
          position: 'absolute', top: 52, left: 0, right: 0, bottom: 0,
          background: '#0A4A34',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 16,
        }}>
          <div style={{
            width: 40, height: 40,
            border: '3px solid rgba(255,255,255,0.15)',
            borderTop: '3px solid #12906A',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}/>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
            Loading MedCare HMS...
          </span>
        </div>
      )}

      <style>{`
        @keyframes adminSlideIn {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}