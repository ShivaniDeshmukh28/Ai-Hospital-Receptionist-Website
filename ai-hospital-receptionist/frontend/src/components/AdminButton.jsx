import { useState } from 'react'

export default function AdminButton({ onClick }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Open Admin Panel"
      style={{
        position: 'fixed', bottom: 28, right: 28, zIndex: 500,
        display: 'flex', alignItems: 'center', gap: 8,
        padding: hovered ? '12px 20px' : '12px 14px',
        borderRadius: 50, border: 'none',
        background: 'linear-gradient(135deg, #0A6E4F, #12906A)',
        color: '#fff', cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(10,110,79,0.5)',
        transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
        fontSize: 13, fontWeight: 600,
        overflow: 'hidden', whiteSpace: 'nowrap',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
      {hovered && <span>Admin Panel</span>}
    </button>
  )
}