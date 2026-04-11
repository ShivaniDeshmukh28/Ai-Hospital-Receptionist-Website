import { useRef } from 'react'

const WARD_COLORS = {
  'General Ward':       { accent: 'border-teal-400',   badge: 'bg-teal-50 text-teal-700',     icon: '🏥' },
  'Emergency Ward':     { accent: 'border-red-400',    badge: 'bg-red-50 text-red-700',       icon: '🚨' },
  'Mental Health Ward': { accent: 'border-purple-400', badge: 'bg-purple-50 text-purple-700', icon: '🧠' },
}

// ── Token Generator ───────────────────────────────────────────
function generateToken(ward) {
  const prefix = ward === 'Emergency Ward' ? 'EW' : ward === 'Mental Health Ward' ? 'MH' : 'GW'
  const num = Math.floor(100 + Math.random() * 900)
  return `${prefix}-${num}`
}

// ── Wait Time Calculator ──────────────────────────────────────
function getWaitTime(ward) {
  // Simulate queue: random 1-6 patients ahead
  const patientsAhead = Math.floor(1 + Math.random() * 6)
  const minsPerPatient = ward === 'Emergency Ward' ? 10 : ward === 'Mental Health Ward' ? 20 : 15
  const totalMins = patientsAhead * minsPerPatient
  return { patientsAhead, totalMins }
}

export default function PatientSummaryCard({ data, ward, onClose, onNewSession }) {
  const wc       = WARD_COLORS[ward] ?? WARD_COLORS['General Ward']
  const token    = useRef(generateToken(ward)).current
  const waitInfo = useRef(getWaitTime(ward)).current
  const printRef = useRef(null)

  const registeredAt = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })

  const fields = [
    { label: 'Patient Name',   value: data?.patient_name  ?? '—' },
    { label: 'Age',            value: data?.patient_age   ?? '—' },
    { label: 'Health Concern', value: data?.patient_query ?? '—' },
    { label: 'Assigned Ward',  value: ward ?? '—' },
    { label: 'Doctor',         value: data?.doctor        ?? '—' },
    { label: 'Slot',           value: data?.slot          ?? '—' },
    { label: 'Fee',            value: data?.fee ? `₹${data.fee}` : '—' },
  ]

  function handlePrint() {
    const printContent = `
      <html>
      <head>
        <title>Appointment Token - ${token}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 30px; max-width: 400px; margin: auto; }
          .header { text-align: center; border-bottom: 2px dashed #0d9488; padding-bottom: 16px; margin-bottom: 16px; }
          .hospital { font-size: 20px; font-weight: bold; color: #0d9488; }
          .subtitle { font-size: 12px; color: #6b7280; margin-top: 4px; }
          .token-box { background: #f0fdf4; border: 2px solid #0d9488; border-radius: 12px; padding: 16px; text-align: center; margin: 16px 0; }
          .token-label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; }
          .token-num { font-size: 36px; font-weight: bold; color: #0d9488; letter-spacing: 4px; }
          .wait-box { background: #fff7ed; border: 1px solid #fdba74; border-radius: 8px; padding: 10px 16px; margin: 12px 0; text-align: center; }
          .wait-text { font-size: 13px; color: #92400e; }
          .wait-bold { font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          td { padding: 8px 4px; font-size: 13px; border-bottom: 1px solid #f3f4f6; }
          td:first-child { color: #6b7280; width: 45%; }
          td:last-child { font-weight: 600; color: #111827; text-align: right; }
          .footer { text-align: center; margin-top: 20px; border-top: 2px dashed #e5e7eb; padding-top: 16px; }
          .footer p { font-size: 11px; color: #9ca3af; margin-top: 4px; }
          .note { background: #ecfdf5; border-radius: 8px; padding: 10px; margin-top: 12px; font-size: 12px; color: #065f46; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="hospital">🏥 AI Hospital</div>
          <div class="subtitle">Appointment Token / Receipt</div>
        </div>

        <div class="token-box">
          <div class="token-label">Your Token Number</div>
          <div class="token-num">${token}</div>
        </div>

        <div class="wait-box">
          <div class="wait-text">
            ⏱️ Estimated Wait: <span class="wait-bold">~${waitInfo.totalMins} mins</span>
            &nbsp;|&nbsp; <span class="wait-bold">${waitInfo.patientsAhead} patients</span> ahead
          </div>
        </div>

        <table>
          ${fields.map(f => `
            <tr>
              <td>${f.label}</td>
              <td>${f.value}</td>
            </tr>
          `).join('')}
          <tr>
            <td>Registered At</td>
            <td>${registeredAt}</td>
          </tr>
        </table>

        <div class="note">
          ⏰ Please arrive 15 minutes early with valid ID proof.
        </div>

        <div class="footer">
          <p>Keep this token for reference</p>
          <p>AI Hospital Receptionist System</p>
        </div>
      </body>
      </html>
    `

    const printWindow = window.open('', '_blank', 'width=500,height=700')
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }

  return (
    <div className="absolute inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4 animate-fade-in">
      <div
        ref={printRef}
        className={`bg-white w-full max-w-sm rounded-3xl shadow-2xl border-t-4 ${wc.accent} animate-slide-up overflow-hidden`}
      >
        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <div className={`text-xs font-semibold px-2.5 py-1 rounded-full ${wc.badge}`}>
              {wc.icon} {ward}
            </div>
            <button onClick={onClose} className="text-gray-300 hover:text-gray-500 transition-colors text-lg leading-none">✕</button>
          </div>
          <h2 className="font-display font-bold text-gray-800 text-lg mt-2">Registration Complete ✅</h2>
          <p className="text-sm text-gray-400">Please show this to the receptionist or proceed to the ward.</p>
        </div>

        {/* ── Token Number ── */}
        <div className="mx-6 mt-4 bg-teal-50 border border-teal-200 rounded-2xl p-3 text-center">
          <p className="text-xs text-teal-600 font-medium uppercase tracking-widest">Your Token Number</p>
          <p className="text-3xl font-bold text-teal-600 tracking-widest mt-1">{token}</p>
        </div>

        {/* ── Wait Time ── */}
        <div className="mx-6 mt-3 bg-orange-50 border border-orange-200 rounded-2xl p-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-orange-600 font-medium">⏱️ Estimated Wait Time</p>
            <p className="text-lg font-bold text-orange-600">~{waitInfo.totalMins} mins</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-orange-400">Patients ahead</p>
            <p className="text-2xl font-bold text-orange-500">{waitInfo.patientsAhead}</p>
          </div>
        </div>

        {/* ── Fields ── */}
        <div className="px-6 py-4 space-y-3">
          {fields.map(f => (
            <div key={f.label} className="flex justify-between items-start gap-4">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wide flex-shrink-0">{f.label}</span>
              <span className="text-sm text-gray-800 font-medium text-right">{f.value}</span>
            </div>
          ))}
        </div>

        {/* ── Timestamp ── */}
        <div className="px-6 pb-2">
          <p className="text-xs text-gray-300">Registered at {registeredAt}</p>
        </div>

        {/* ── Actions ── */}
        <div className="px-6 pb-4 pt-2 grid grid-cols-2 gap-2">
          <button
            onClick={handlePrint}
            className="py-3 rounded-2xl border border-teal-300 text-sm font-medium text-teal-600 hover:bg-teal-50 transition-colors flex items-center justify-center gap-1"
          >
            🖨️ Print Token
          </button>
          <button
            onClick={onNewSession}
            className="py-3 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition-colors"
          >
            New Patient
          </button>
          <button
            onClick={onClose}
            className="col-span-2 py-3 rounded-2xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Continue Chat
          </button>
        </div>
      </div>
    </div>
  )
}
