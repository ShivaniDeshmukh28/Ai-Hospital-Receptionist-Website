export default function ChatBubble({ message }) {
  const isUser = message.role === 'user'
  const time = message.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-slide-up`}>
      {/* Bot avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-xl bg-primary-500 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </div>
      )}

      <div className={`max-w-[78%] ${isUser ? '' : ''}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
            ${isUser
              ? 'bg-primary-500 text-white rounded-tr-sm'
              : message.isError
                ? 'bg-red-50 text-red-700 border border-red-200 rounded-tl-sm'
                : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-sm'
            }`}
        >
          {message.text}
        </div>
        <p className={`text-[10px] text-gray-300 mt-1 ${isUser ? 'text-right' : 'text-left ml-1'}`}>
          {time}
        </p>
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="w-7 h-7 rounded-xl bg-gray-200 flex items-center justify-center ml-2 mt-1 flex-shrink-0">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2.2" strokeLinecap="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
      )}
    </div>
  )
}
