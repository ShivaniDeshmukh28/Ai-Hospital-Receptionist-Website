function renderContent(text) {
  const lines = text.split('\n')
  const result = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Detect markdown table (line with | characters)
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const tableLines = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i])
        i++
      }

      // Parse table
      const rows = tableLines.filter(l => !l.match(/^\|[\s\-|]+\|$/)) // remove separator rows
      if (rows.length > 0) {
        const headers = rows[0].split('|').filter(c => c.trim() !== '').map(c => c.trim())
        const bodyRows = rows.slice(1)

        result.push(
          <div key={`table-${i}`} className="my-2 overflow-x-auto rounded-xl border border-teal-100 shadow-sm">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #1d9e97, #0f7a74)' }}>
                  {headers.map((h, hi) => (
                    <th key={hi} className="px-3 py-2 text-left text-white font-semibold whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, ri) => {
                  const cells = row.split('|').filter(c => c.trim() !== '').map(c => c.trim())
                  return (
                    <tr key={ri} style={{ background: ri % 2 === 0 ? '#f0fafa' : 'white' }}>
                      {cells.map((cell, ci) => (
                        <td key={ci} className="px-3 py-2 text-gray-700 border-t border-teal-50 whitespace-nowrap">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      }
    } else {
      // Regular text line
      const prevResult = result[result.length - 1]
      if (typeof prevResult === 'string') {
        result[result.length - 1] = prevResult + '\n' + line
      } else {
        result.push(line)
      }
      i++
    }
  }

  // Render mixed content
  return result.map((item, idx) => {
    if (typeof item === 'string') {
      return (
        <span key={idx} className="whitespace-pre-wrap">
          {item}
        </span>
      )
    }
    return item
  })
}

export default function ChatBubble({ message }) {
  const isUser = message.role === 'user'
  const time = message.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const hasTable = !isUser && message.text?.includes('|')

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

      <div className={`${hasTable ? 'max-w-[90%]' : 'max-w-[78%]'}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed
            ${isUser
              ? 'bg-primary-500 text-white rounded-tr-sm whitespace-pre-wrap'
              : message.isError
                ? 'bg-red-50 text-red-700 border border-red-200 rounded-tl-sm whitespace-pre-wrap'
                : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-sm'
            }`}
        >
          {isUser || message.isError
            ? message.text
            : renderContent(message.text)
          }
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
