import React, { useState } from 'react'

// Body regions with a clickable SVG hotspot (cx/cy/r on a 200x420 viewBox
// front-view silhouette) and the sub-location tabs shown once a region is tapped.
const REGIONS = [
  { key: 'head',       label: 'Head',       cx: 100, cy: 38,  r: 22, subOptions: ['Front', 'Back', 'Side'] },
  { key: 'chest',      label: 'Chest',      cx: 100, cy: 110, r: 30, subOptions: ['Left Side', 'Right Side', 'Center'] },
  { key: 'abdomen',    label: 'Abdomen',    cx: 100, cy: 170, r: 26, subOptions: ['Upper', 'Lower', 'Side'] },
  { key: 'upper_arm',  label: 'Upper Arm',  cx: 55,  cy: 120, r: 16, subOptions: ['Left', 'Right'] },
  { key: 'lower_arm',  label: 'Lower Arm',  cx: 45,  cy: 190, r: 14, subOptions: ['Left', 'Right'] },
  { key: 'upper_leg',  label: 'Upper Leg',  cx: 85,  cy: 270, r: 20, subOptions: ['Upper Leg', 'Lower Leg', 'Bone'] },
  { key: 'lower_leg',  label: 'Lower Leg',  cx: 85,  cy: 350, r: 16, subOptions: ['Upper Leg', 'Lower Leg', 'Bone'] },
]

/**
 * BodyLocationPicker
 *
 * Front-view body silhouette with tappable regions (see reference screenshot:
 * "Where exactly is the pain or issue located?"). Tapping a region highlights
 * it in red and reveals sub-location tabs + a Continue button. Calling
 * onConfirm({ region, subOption }) hands the selection back to your chat flow.
 *
 * Usage inside ChatPage (additive only — do not alter existing code):
 *
 *   import BodyLocationPicker from '../components/BodyLocationPicker'
 *   ...
 *   <BodyLocationPicker
 *     onConfirm={({ region, subOption }) =>
 *       handleSend(`The pain is in my ${subOption || region.label}`)
 *     }
 *   />
 */
export default function BodyLocationPicker({ onConfirm, title = 'Where exactly is the pain or issue located?' }) {
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [selectedSub, setSelectedSub] = useState(null)

  function handleRegionClick(region) {
    setSelectedRegion(region)
    setSelectedSub(region.subOptions[0])
  }

  function handleContinue() {
    if (!selectedRegion) return
    onConfirm?.({ region: selectedRegion, subOption: selectedSub })
  }

  return (
    <div style={{ padding: '4px 16px 16px', maxWidth: 420 }}>
      {title && (
        <p style={{ fontSize: 13, fontWeight: 600, color: '#F0F9FF', margin: '0 0 14px', lineHeight: 1.4 }}>
          {title}
        </p>
      )}

      <div
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(14,206,206,0.15)',
          borderRadius: 20,
          padding: '18px 0 8px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <svg width="180" height="378" viewBox="0 0 200 420" style={{ overflow: 'visible' }}>
          {/* Simple front-view silhouette */}
          <g fill="none" stroke="#475569" strokeWidth="2">
            <circle cx="100" cy="38" r="22" />
            <path d="M78 60 Q100 68 122 60 L128 96 Q100 106 72 96 Z" />
            <path d="M72 96 L44 108 L40 200 M128 96 L156 108 L160 200" />
            <path d="M72 96 Q60 150 68 210 Q100 220 132 210 Q140 150 128 96 Z" />
            <path d="M68 210 L58 300 L52 400 M132 210 L142 300 L148 400" />
            <line x1="58" y1="300" x2="46" y2="300" />
            <line x1="142" y1="300" x2="154" y2="300" />
          </g>

          {/* Tappable region hotspots */}
          {REGIONS.map((region) => {
            const active = selectedRegion?.key === region.key
            return (
              <circle
                key={region.key}
                cx={region.cx}
                cy={region.cy}
                r={region.r}
                fill={active ? 'rgba(239,68,68,0.35)' : 'rgba(14,206,206,0.12)'}
                stroke={active ? '#EF4444' : 'rgba(14,206,206,0.4)'}
                strokeWidth="2"
                style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                onClick={() => handleRegionClick(region)}
              />
            )
          })}
        </svg>
      </div>

      {selectedRegion && (
        <>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
            {selectedRegion.subOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setSelectedSub(opt)}
                style={{
                  padding: '9px 16px',
                  borderRadius: 12,
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: selectedSub === opt ? 'rgba(14,206,206,0.15)' : 'rgba(255,255,255,0.05)',
                  color: selectedSub === opt ? '#0ECECE' : '#94A3B8',
                  border: `1.5px solid ${selectedSub === opt ? 'rgba(14,206,206,0.5)' : 'rgba(255,255,255,0.1)'}`,
                }}
              >
                {opt}
              </button>
            ))}
          </div>

          <button
            onClick={handleContinue}
            style={{
              width: '100%',
              marginTop: 16,
              padding: '13px 0',
              borderRadius: 14,
              border: 'none',
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #0ECECE, #0891B2)',
              boxShadow: '0 4px 16px rgba(14,206,206,0.35)',
            }}
          >
            Continue
          </button>
        </>
      )}
    </div>
  )
}
