export default function TypingIndicator() {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="w-7 h-7 rounded-xl bg-primary-500 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
      </div>
      <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
    </div>
  )
}
