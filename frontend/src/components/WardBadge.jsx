const WARD_STYLES = {
  'General Ward':      { bg: 'bg-teal-50',   text: 'text-teal-700',   border: 'border-teal-200',   dot: 'bg-teal-500',   icon: '🏥' },
  'Emergency Ward':    { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    dot: 'bg-red-500',    icon: '🚨' },
  'Mental Health Ward':{ bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500', icon: '🧠' },
}

export default function WardBadge({ ward }) {
  const s = WARD_STYLES[ward] ?? WARD_STYLES['General Ward']
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium animate-fade-in ${s.bg} ${s.text} ${s.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} animate-pulse`} />
      {s.icon} {ward}
    </div>
  )
}
