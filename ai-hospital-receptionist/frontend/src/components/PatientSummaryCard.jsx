import { useRef } from 'react'

const WARD_CFG = {
  'General Ward': {
    gradient: 'linear-gradient(135deg, #0ECECE, #0891B2)',
    glow:     'rgba(14,206,206,0.5)',
    bg:       'rgba(14,206,206,0.08)',
    border:   'rgba(14,206,206,0.25)',
    text:     '#0ECECE',
    prefix:   'GW',
    icon:     '🏥',
  },
  'Emergency Ward': {
    gradient: 'linear-gradient(135deg, #EF4444, #DC2626)',
    glow:     'rgba(239,68,68,0.5)',
    bg:       'rgba(239,68,68,0.08)',
    border:   'rgba(239,68,68,0.25)',
    text:     '#F87171',
    prefix:   'EW',
    icon:     '🚨',
  },
  'Mental Health Ward': {
    gradient: 'linear-gradient(135deg, #A855F7, #7C3AED)',
    glow:     'rgba(168,85,247,0.5)',
    bg:       'rgba(168,85,247,0.08)',
    border:   'rgba(168,85,247,0.25)',
    text:     '#C084FC',
    prefix:   'MH',
    icon:     '🧠',
  },
}

function generateToken(ward) {
  const cfg = WARD_CFG[ward] ?? WARD_CFG['General Ward']
  return `${cfg.prefix}-${Math.floor(100 + Math.random() * 900)}`
}

function getWaitTime(ward) {
  const ahead = Math.floor(1 + Math.random() * 6)
  const mins  = { 'Emergency Ward': 10, 'Mental Health Ward': 20 }[ward] ?? 15
  return { patientsAhead: ahead, totalMins: ahead * mins }
}

// ─── Field row ─────────────────────────────────────────────────────────────────
function FieldRow({ icon, label, value, accent }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-2.5">
        <span className="text-base">{icon}</span>
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: '#64748B' }}>{label}</span>
      </div>
      <span className="text-sm font-semibold text-right max-w-[55%] truncate" style={{ color: accent || '#CBD5E1' }}>{value}</span>
    </div>
  )
}

export default function PatientSummaryCard({ data, ward, onClose, onNewSession }) {
  const cfg      = WARD_CFG[ward] ?? WARD_CFG['General Ward']
  const token    = useRef(generateToken(ward)).current
  const waitInfo = useRef(getWaitTime(ward)).current
  const printRef = useRef(null)

  const registeredAt = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })

  const fields = [
    { icon: '👤', label: 'Patient Name',   value: data?.patient_name  ?? '—' },
    { icon: '🎂', label: 'Age',            value: data?.patient_age   ?? '—' },
    { icon: '💬', label: 'Health Concern', value: data?.patient_query ?? '—' },
    { icon: '🏥', label: 'Assigned Ward',  value: ward ?? '—', accent: cfg.text },
    { icon: '👨‍⚕️', label: 'Doctor',        value: data?.doctor        ?? '—' },
    { icon: '🕐', label: 'Slot',           value: data?.slot          ?? '—' },
    { icon: '💰', label: 'Fee',            value: data?.fee ? `₹${data.fee}` : '—', accent: '#10B981' },
  ]

  function handlePrint() {
    const printContent = `
      <html><head>
        <title>Appointment Token - ${token}</title>
        <style>
          *{margin:0;padding:0;box-sizing:border-box}
          body{font-family:Arial,sans-serif;padding:30px;max-width:400px;margin:auto;background:#fff}
          .header{text-align:center;border-bottom:2px dashed #0ECECE;padding-bottom:16px;margin-bottom:16px}
          .hospital{font-size:20px;font-weight:800;color:#0891B2}
          .subtitle{font-size:12px;color:#6b7280;margin-top:4px}
          .token-box{background:linear-gradient(135deg,#0891B2,#0ECECE);border-radius:16px;padding:20px;text-align:center;margin:16px 0}
          .token-label{font-size:11px;color:rgba(255,255,255,0.8);text-transform:uppercase;letter-spacing:2px}
          .token-num{font-size:42px;font-weight:800;color:#fff;letter-spacing:6px;margin-top:4px}
          .wait-box{background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:10px 16px;margin:12px 0;text-align:center}
          .wait-text{font-size:13px;color:#92400e}
          .wait-bold{font-weight:bold}
          table{width:100%;border-collapse:collapse;margin:16px 0}
          td{padding:8px 4px;font-size:13px;border-bottom:1px solid #f3f4f6}
          td:first-child{color:#6b7280;width:45%}
          td:last-child{font-weight:600;color:#111;text-align:right}
          .note{background:#ecfdf5;border-radius:8px;padding:10px;margin-top:12px;font-size:12px;color:#065f46;text-align:center}
          .footer{text-align:center;margin-top:20px;border-top:2px dashed #e5e7eb;padding-top:16px}
          .footer p{font-size:11px;color:#9ca3af;margin-top:4px}
        </style>
      </head><body>
        <div class="header">
          <div class="hospital">🏥 AI Hospital</div>
          <div class="subtitle">Appointment Token / Receipt</div>
        </div>
        <div class="token-box">
          <div class="token-label">Your Token Number</div>
          <div class="token-num">${token}</div>
        </div>
        <div class="wait-box">
          <div class="wait-text">⏱️ Estimated Wait: <span class="wait-bold">~${waitInfo.totalMins} mins</span> &nbsp;|&nbsp; <span class="wait-bold">${waitInfo.patientsAhead} patients</span> ahead</div>
        </div>
        <table>
          ${fields.map(f => `<tr><td>${f.label}</td><td>${f.value}</td></tr>`).join('')}
          <tr><td>Registered At</td><td>${registeredAt}</td></tr>
        </table>
        <div class="note">⏰ Please arrive 15 minutes early with valid ID proof.</div>
        <div class="footer"><p>Keep this token for reference</p><p>AI Hospital Receptionist System</p></div>
      </body></html>`

    const w = window.open('', '_blank', 'width=500,height=700')
    w.document.write(printContent)
    w.document.close()
    w.focus(); w.print(); w.close()
  }

  // Queue position bar width (visual)
  const queuePct = Math.min(100, (waitInfo.patientsAhead / 6) * 100)

  return (
    <div
      className="absolute inset-0 flex items-end sm:items-center justify-center z-50 p-4 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}
    >
      <div
        ref={printRef}
        className="w-full max-w-sm rounded-3xl overflow-hidden animate-slide-in-scale"
        style={{
          background: '#131F35',
          border: `1px solid ${cfg.border}`,
          boxShadow: `0 0 0 1px rgba(255,255,255,0.04), 0 32px 64px rgba(0,0,0,0.6), 0 0 60px ${cfg.glow}`,
        }}
      >
        {/* ── Top gradient bar ── */}
        <div className="h-1.5" style={{ background: cfg.gradient }} />

        {/* ── Header ── */}
        <div className="px-6 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-3">
            <div
              className="text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5"
              style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.text }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: cfg.text }}/>
              {cfg.icon} {ward}
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors text-sm font-bold"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#64748B' }}>✕</button>
          </div>
          <h2 className="font-display font-bold text-xl" style={{ color: '#F0F9FF' }}>
            Registration Complete ✅
          </h2>
          <p className="text-sm mt-1" style={{ color: '#64748B' }}>
            Show this to the receptionist or proceed to the ward.
          </p>
        </div>

        {/* ── Token hero ── */}
        <div className="mx-6 mt-5 rounded-2xl p-5 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(14,206,206,0.12), rgba(8,145,178,0.08))',
            border: '1px solid rgba(14,206,206,0.2)',
          }}>
          {/* Glow ring behind token */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full animate-pulse-glow"
            style={{ background: 'radial-gradient(circle, rgba(14,206,206,0.15) 0%, transparent 70%)' }}/>
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(14,206,206,0.7)' }}>
            Your Token Number
          </p>
          <p className="text-5xl font-black tracking-widest relative" style={{ color: '#0ECECE', fontFamily: 'monospace', textShadow: '0 0 30px rgba(14,206,206,0.5)' }}>
            {token}
          </p>
        </div>

        {/* ── Wait time ── */}
        <div className="mx-6 mt-3 rounded-2xl p-4"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs font-medium" style={{ color: '#FCD34D' }}>⏱️ Estimated Wait</p>
              <p className="text-2xl font-black mt-0.5" style={{ color: '#F59E0B' }}>~{waitInfo.totalMins} min</p>
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: 'rgba(245,158,11,0.6)' }}>Patients ahead</p>
              <p className="text-4xl font-black" style={{ color: '#F59E0B' }}>{waitInfo.patientsAhead}</p>
            </div>
          </div>
          {/* Queue progress bar */}
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(245,158,11,0.15)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${queuePct}%`, background: 'linear-gradient(90deg, #F59E0B, #FBBF24)' }}/>
          </div>
        </div>

        {/* ── Fields ── */}
        <div className="px-6 py-4">
          {fields.map(f => <FieldRow key={f.label} {...f} />)}
        </div>

        {/* ── Timestamp ── */}
        <div className="px-6 pb-1">
          <p className="text-xs" style={{ color: '#334155' }}>Registered at {registeredAt}</p>
        </div>

        {/* ── Actions ── */}
        <div className="px-6 pb-5 pt-3 grid grid-cols-2 gap-2">
          <button onClick={handlePrint}
            className="py-3 rounded-2xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5"
            style={{ background: 'rgba(14,206,206,0.1)', border: '1px solid rgba(14,206,206,0.25)', color: '#0ECECE' }}>
            🖨️ Print Token
          </button>
          <button onClick={onNewSession}
            className="py-3 rounded-2xl text-white text-sm font-bold transition-all hover:scale-[1.02] active:scale-95"
            style={{ background: cfg.gradient, boxShadow: `0 4px 16px ${cfg.glow}` }}>
            New Patient
          </button>
          <button onClick={onClose}
            className="col-span-2 py-3 rounded-2xl text-sm font-medium transition-all hover:scale-[1.01] active:scale-95"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748B' }}>
            Continue Chat
          </button>
        </div>
      </div>
    </div>
  )
}
