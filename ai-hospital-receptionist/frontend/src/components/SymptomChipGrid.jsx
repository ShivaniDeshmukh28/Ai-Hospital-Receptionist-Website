import React from 'react'

// Icon set — simple inline SVGs so there's no extra icon-library dependency.
// Swap these for lucide-react icons if your project already uses it.
const ICONS = {
  fever: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 4v10.5a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
      <line x1="14" y1="9" x2="17" y2="9" />
      <line x1="14" y1="6" x2="17" y2="6" />
    </svg>
  ),
  fatigue: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="6" r="3" />
      <path d="M5 21v-2a7 7 0 0 1 9.5-6.5" />
      <path d="M15 15l3 3 5-6" opacity="0" />
      <path d="M14 19l3-3" />
      <path d="M17 22l3-3" />
    </svg>
  ),
  breath: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 15a4 4 0 1 0 0-8" />
      <path d="M6 11h9a3 3 0 1 1 0 6" />
      <path d="M3 15h1" />
    </svg>
  ),
  rash: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="9" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="13" r="1" fill="currentColor" stroke="none" />
      <circle cx="10" cy="14" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  nausea: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M8 12c-1 2-1 4 0 8" />
      <path d="M16 12c1 2 1 4 0 8" />
      <path d="M9 8h.01M15 8h.01" />
    </svg>
  ),
}

// Default symptom set — pass your own via the `symptoms` prop to override/extend.
const DEFAULT_SYMPTOMS = [
  { key: 'fever',   label: 'Fever',             icon: 'fever',   text: 'I have a fever' },
  { key: 'fatigue', label: 'Fatigue',            icon: 'fatigue', text: 'I feel fatigued and low on energy' },
  { key: 'breath',  label: 'Shortness of Breath',icon: 'breath',  text: 'I have shortness of breath' },
  { key: 'rash',    label: 'Skin Rash',          icon: 'rash',    text: 'I have a skin rash' },
  { key: 'nausea',  label: 'Nausea',             icon: 'nausea',  text: 'I feel nauseous' },
]

/**
 * SymptomChipGrid
 *
 * Renders a grid of tappable symptom cards (see reference screenshot: Fever /
 * Fatigue / Shortness of Breath / Skin Rash / Nausea). Tapping a card calls
 * onSelect(symptom) — wire this to your existing handleSend / handleSuggestion
 * so it behaves exactly like your current quick-reply chips.
 *
 * Usage inside ChatPage (additive only — do not alter existing code):
 *
 *   import SymptomChipGrid from '../components/SymptomChipGrid'
 *   ...
 *   {msgCount <= 2 && !loading && (
 *     <SymptomChipGrid onSelect={(s) => handleSend(s.text)} />
 *   )}
 */
export default function SymptomChipGrid({ symptoms = DEFAULT_SYMPTOMS, onSelect, title = 'What are you experiencing?' }) {
  return (
    <div style={{ padding: '4px 16px 12px' }}>
      {title && (
        <p style={{ fontSize: 12, fontWeight: 600, color: '#67E8F9', margin: '0 0 10px', letterSpacing: 0.2 }}>
          {title}
        </p>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 10,
          maxWidth: 420,
        }}
      >
        {symptoms.map((s) => (
          <button
            key={s.key}
            onClick={() => onSelect?.(s)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 10,
              padding: '14px 14px',
              borderRadius: 16,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(14,206,206,0.18)',
              color: '#E2E8F0',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(14,206,206,0.1)'
              e.currentTarget.style.borderColor = 'rgba(14,206,206,0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
              e.currentTarget.style.borderColor = 'rgba(14,206,206,0.18)'
            }}
          >
            <span
              style={{
                width: 36, height: 36, borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(14,206,206,0.12)', color: '#0ECECE',
              }}
            >
              {ICONS[s.icon]}
            </span>
            <span style={{ fontSize: 12.5, fontWeight: 600, lineHeight: 1.3 }}>{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
