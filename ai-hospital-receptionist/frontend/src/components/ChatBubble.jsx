// ── Markdown-aware content renderer ──────────────────────────────────────────
function renderMarkdown(text) {
  const lines = text.split('\n')
  const elements = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    // ── Markdown table ──
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i])
        i++
      }
      const rows = tableLines.filter(l => !l.match(/^\|[\s\-|]+\|$/))
      if (rows.length > 0) {
        const headers = rows[0].split('|').filter(c => c.trim() !== '').map(c => c.trim())
        const bodyRows = rows.slice(1)
        elements.push(
          <div key={`tbl-${i}`} className="my-3 overflow-x-auto rounded-xl border border-cyan-500/20 shadow-lg">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr style={{ background: 'linear-gradient(90deg, #0891B2, #0ECECE)' }}>
                  {headers.map((h, hi) => (
                    <th key={hi} className="px-4 py-2.5 text-left font-bold text-white tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, ri) => {
                  const cells = row.split('|').filter(c => c.trim() !== '').map(c => c.trim())
                  return (
                    <tr key={ri} style={{ background: ri % 2 === 0 ? 'rgba(14,206,206,0.04)' : 'rgba(255,255,255,0.02)' }}>
                      {cells.map((cell, ci) => (
                        <td key={ci} className="px-4 py-2 border-t border-white/5 text-slate-300 whitespace-nowrap font-medium">{cell}</td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      }
      continue
    }

    // ── Bullets ──
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const bulletItems = []
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
        bulletItems.push(lines[i].trim().slice(2))
        i++
      }
      elements.push(
        <ul key={`ul-${i}`} className="my-2 space-y-1.5 pl-1">
          {bulletItems.map((item, bi) => (
            <li key={bi} className="flex items-start gap-2.5 text-sm text-slate-200">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
              <span>{inlineMarkdown(item)}</span>
            </li>
          ))}
        </ul>
      )
      continue
    }

    // ── Numbered list ──
    if (/^\d+\.\s/.test(trimmed)) {
      const numItems = []
      let n = 1
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        numItems.push({ n: n++, text: lines[i].trim().replace(/^\d+\.\s/, '') })
        i++
      }
      elements.push(
        <ol key={`ol-${i}`} className="my-2 space-y-1.5 pl-1">
          {numItems.map((item, oi) => (
            <li key={oi} className="flex items-start gap-2.5 text-sm text-slate-200">
              <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{ background: 'rgba(14,206,206,0.2)', color: '#0ECECE' }}>{item.n}</span>
              <span className="mt-0.5">{inlineMarkdown(item.text)}</span>
            </li>
          ))}
        </ol>
      )
      continue
    }

    // ── Horizontal rule ──
    if (trimmed === '---' || trimmed === '***') {
      elements.push(<hr key={`hr-${i}`} className="my-3 border-white/10" />)
      i++
      continue
    }

    // ── Empty line ──
    if (trimmed === '') {
      elements.push(<div key={`br-${i}`} className="h-1.5" />)
      i++
      continue
    }

    // ── Normal text ──
    elements.push(
      <p key={`p-${i}`} className="text-sm leading-relaxed text-slate-200">
        {inlineMarkdown(trimmed)}
      </p>
    )
    i++
  }

  return elements
}

// Inline markdown: **bold**, *italic*, `code`
function inlineMarkdown(text) {
  const parts = []
  const re = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g
  let last = 0, m
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    if (m[2]) parts.push(<strong key={m.index} className="font-bold text-cyan-300">{m[2]}</strong>)
    else if (m[3]) parts.push(<em key={m.index} className="italic text-slate-300">{m[3]}</em>)
    else if (m[4]) parts.push(
      <code key={m.index} className="px-1.5 py-0.5 rounded text-xs font-mono"
        style={{ background: 'rgba(14,206,206,0.15)', color: '#0ECECE' }}>{m[4]}</code>
    )
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts
}

// ── ChatBubble ────────────────────────────────────────────────────────────────
export default function ChatBubble({ message }) {
  const isUser  = message.role === 'user'
  const isError = message.isError
  const time    = message.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const hasTable = !isUser && message.text?.includes('|')

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-slide-up my-2`}>

      {/* ── Bot avatar ── */}
      {!isUser && (
        <div className="w-8 h-8 rounded-2xl flex items-center justify-center mr-2.5 mt-0.5 shrink-0 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #0ECECE, #0891B2)', boxShadow: '0 4px 12px rgba(14,206,206,0.3)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </div>
      )}

      {/* ── Bubble ── */}
      <div className={`${hasTable ? 'max-w-[95%]' : 'max-w-[82%]'}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'text-white rounded-tr-sm'
              : isError
                ? 'rounded-tl-sm border border-red-500/30'
                : 'rounded-tl-sm border'
          }`}
          style={
            isUser
              ? {
                  background: 'linear-gradient(135deg, #0ECECE, #0891B2)',
                  boxShadow: '0 4px 20px rgba(14,206,206,0.25)',
                }
              : isError
                ? {
                    background: 'rgba(239,68,68,0.08)',
                    borderColor: 'rgba(239,68,68,0.3)',
                    color: '#FCA5A5',
                  }
                : {
                    background: 'rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(12px)',
                    borderColor: 'rgba(14,206,206,0.15)',
                    boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
                  }
          }
        >
          {isUser
            ? <span className="whitespace-pre-wrap font-medium">{message.text}</span>
            : isError
              ? <span className="whitespace-pre-wrap">{message.text}</span>
              : renderMarkdown(message.text)
          }
        </div>

        {/* Timestamp */}
        <p className={`text-[10px] mt-1 font-medium flex items-center gap-1 ${isUser ? 'justify-end mr-1' : 'justify-start ml-1'}`}
          style={{ color: 'rgba(148,163,184,0.7)' }}>
          {time}
          {isUser && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(14,206,206,0.7)" strokeWidth="2.5" strokeLinecap="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          )}
        </p>
      </div>

      {/* ── User avatar ── */}
      {isUser && (
        <div className="w-8 h-8 rounded-2xl flex items-center justify-center ml-2.5 mt-0.5 shrink-0 text-xs font-bold"
          style={{ background: 'rgba(14,206,206,0.15)', color: '#0ECECE', border: '1px solid rgba(14,206,206,0.25)' }}>
          👤
        </div>
      )}
    </div>
  )
}
