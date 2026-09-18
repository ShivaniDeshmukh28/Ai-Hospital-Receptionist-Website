export default function TypingIndicator() {
  return (
    <div className="flex justify-start animate-fade-in my-2">
      {/* Bot avatar */}
      <div
        className="w-8 h-8 rounded-2xl flex items-center justify-center mr-2.5 mt-0.5 shrink-0 shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #0ECECE, #0891B2)',
          boxShadow: '0 4px 12px rgba(14,206,206,0.3)',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </div>

      {/* Bubble */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl rounded-tl-sm border"
        style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
          borderColor: 'rgba(14,206,206,0.15)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
        }}
      >
        <div className="flex items-center gap-1.5">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
        <span className="text-xs font-medium" style={{ color: 'rgba(148,163,184,0.7)' }}>
          AI is thinking…
        </span>
      </div>
    </div>
  )
}
