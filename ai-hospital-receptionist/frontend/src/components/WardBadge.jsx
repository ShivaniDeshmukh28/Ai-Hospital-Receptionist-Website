const WARD_STYLES = {
  'General Ward':       {
    gradient: 'linear-gradient(135deg, rgba(14,206,206,0.2), rgba(8,145,178,0.15))',
    border:   'rgba(14,206,206,0.35)',
    text:     '#0ECECE',
    dot:      '#0ECECE',
    glow:     'rgba(14,206,206,0.3)',
    icon:     '🏥',
  },
  'Emergency Ward':     {
    gradient: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(220,38,38,0.15))',
    border:   'rgba(239,68,68,0.35)',
    text:     '#F87171',
    dot:      '#EF4444',
    glow:     'rgba(239,68,68,0.3)',
    icon:     '🚨',
  },
  'Mental Health Ward': {
    gradient: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(139,92,246,0.15))',
    border:   'rgba(168,85,247,0.35)',
    text:     '#C084FC',
    dot:      '#A855F7',
    glow:     'rgba(168,85,247,0.3)',
    icon:     '🧠',
  },
}

export default function WardBadge({ ward }) {
  const s = WARD_STYLES[ward] ?? WARD_STYLES['General Ward']

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold animate-slide-up"
      style={{
        background: s.gradient,
        border: `1px solid ${s.border}`,
        color: s.text,
        boxShadow: `0 0 12px ${s.glow}`,
        backdropFilter: 'blur(8px)',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full animate-pulse"
        style={{ background: s.dot, boxShadow: `0 0 6px ${s.dot}` }}
      />
      {s.icon} {ward}
    </div>
  )
}
