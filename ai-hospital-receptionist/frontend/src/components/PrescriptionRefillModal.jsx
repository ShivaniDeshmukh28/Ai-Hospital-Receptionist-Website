import { useState, useRef } from 'react'

// ─────────────────────────────────────────────────────────
// Mock data — swap these for real API calls when the backend
// endpoints exist. Every write action below already calls
// fetch() wrapped in try/catch, pointed at localhost:8000,
// so wiring a real API later is mostly deleting the mocks.
// ─────────────────────────────────────────────────────────
const PHARMACIES = [
  { id: 'main',   name: 'Suman Hospital Pharmacy (Main)', address: 'Ground Floor, OPD Block', delivery: true },
  { id: 'branch', name: 'MedCare Pharmacy — City Branch',  address: '2 km away, MG Road',       delivery: true },
]

const MEDICINES = [
  { id: 'm1', name: 'Metformin 500mg',    dosage: '1 tablet twice daily, after meals',  remainingRefills: 2,    expiry: '2026-12-01', lastRefill: '2026-08-20', price: 120, stock: 34,  rxRequired: true  },
  { id: 'm2', name: 'Amlodipine 5mg',     dosage: '1 tablet once daily, morning',       remainingRefills: 1,    expiry: '2026-11-15', lastRefill: '2026-08-05', price: 95,  stock: 50,  rxRequired: true  },
  { id: 'm3', name: 'Atorvastatin 20mg',  dosage: '1 tablet at night',                  remainingRefills: 3,    expiry: '2027-02-10', lastRefill: '2026-09-01', price: 180, stock: 20,  rxRequired: true  },
  { id: 'm4', name: 'Paracetamol 500mg',  dosage: '1–2 tablets as needed, max 6/day',   remainingRefills: null, expiry: null,          lastRefill: null,          price: 25,  stock: 200, rxRequired: false },
  { id: 'm5', name: 'Azithromycin 250mg', dosage: '1 tablet once daily for 3 days',     remainingRefills: 0,    expiry: '2026-10-01', lastRefill: '2026-09-10', price: 140, stock: 15,  rxRequired: true  },
]

const STATUS_STAGES = [
  { key: 'received',  label: 'Request Received',    icon: '🟢' },
  { key: 'review',    label: 'Pharmacist Reviewing', icon: '🔵' },
  { key: 'preparing', label: 'Preparing',            icon: '🟡' },
  { key: 'ready',     label: 'Ready',                icon: '🟢' },
]

const TABS = [
  { id: 'refill',    label: 'Refill',    icon: '💊' },
  { id: 'status',    label: 'Status',    icon: '📦' },
  { id: 'shop',      label: 'Order',     icon: '🛒' },
  { id: 'history',   label: 'History',   icon: '🧾' },
  { id: 'reminders', label: 'Reminders', icon: '🔔' },
  { id: 'upload',    label: 'Upload Rx', icon: '📄' },
  { id: 'chat',      label: 'Ask AI',    icon: '🤖' },
]

const DELIVERY_FEE = 40
const TEAL = '#1d9e97'
const TEAL_DARK = '#0f7a74'

function daysUntil(dateStr) {
  if (!dateStr) return null
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24))
  return diff
}

// ─────────────────────────────────────────────────────────
// Receipt generation — builds a standalone, printable HTML
// invoice and triggers a real file download via Blob + <a download>.
// No external PDF library required; the person can open the
// downloaded .html and use the browser's "Print → Save as PDF"
// if they want an actual PDF.
// ─────────────────────────────────────────────────────────
function buildReceiptHTML(r) {
  const rows = r.items.map(i => `
    <tr>
      <td>${i.name}</td>
      <td style="text-align:center">${i.qty}</td>
      <td style="text-align:right">${i.price ? `₹${i.price}` : '—'}</td>
      <td style="text-align:right">${i.price ? `₹${i.price * i.qty}` : '—'}</td>
    </tr>`).join('')

  const paymentLabel = r.paymentMethod === 'online' ? 'Paid Online'
    : r.paymentMethod === 'cod' ? (r.fulfilment === 'delivery' ? 'Cash on Delivery' : 'Pay at Pickup')
    : 'Pending Pharmacist Review'

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Receipt ${r.id}</title>
<style>
  body{font-family:Arial,Helvetica,sans-serif;padding:36px;color:#0f172a;max-width:640px;margin:0 auto}
  .brand{font-size:20px;font-weight:800;margin:0 0 2px}
  .muted{color:#64748b;font-size:12px;margin:2px 0}
  table{width:100%;border-collapse:collapse;margin-top:24px}
  th,td{padding:9px 6px;border-bottom:1px solid #e2e8f0;font-size:13px}
  th{text-align:left;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:0.4px}
  .total-row td{font-weight:800;font-size:14px;border-top:2px solid #0f172a;border-bottom:none}
  .badge{display:inline-block;margin-top:18px;padding:4px 10px;border-radius:20px;background:#f0fafa;color:#0f7a74;font-size:11px;font-weight:700}
</style></head><body>
  <p class="brand">MediCare AI — Pharmacy Receipt</p>
  <p class="muted">Receipt #${r.id} · ${r.placedAt}</p>
  <p class="muted">${r.pharmacyName || ''}</p>
  <table>
    <thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Total</th></tr></thead>
    <tbody>
      ${rows}
      ${r.deliveryFee ? `<tr><td colspan="3">Delivery Fee</td><td style="text-align:right">₹${r.deliveryFee}</td></tr>` : ''}
      <tr class="total-row"><td colspan="3">Total</td><td style="text-align:right">${r.total ? `₹${r.total}` : '—'}</td></tr>
    </tbody>
  </table>
  <p class="muted" style="margin-top:20px">Payment: <strong style="color:#0f172a">${paymentLabel}</strong></p>
  <p class="muted">Fulfilment: <strong style="color:#0f172a">${r.fulfilment === 'delivery' ? 'Home Delivery' : 'Store Pickup'}</strong></p>
  <span class="badge">${STATUS_STAGES[r.stage]?.label || 'Processing'}</span>
</body></html>`
}

function downloadReceipt(r) {
  const html = buildReceiptHTML(r)
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `receipt-${r.id}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─────────────────────────────────────────────────────────
// Small shared pieces
// ─────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.6, display: 'block', marginBottom: 6 }}>
      {children}
    </label>
  )
}

function TextInput({ value, onChange, placeholder, type = 'text' }) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder={placeholder}
      style={{
        width: '100%', padding: '11px 14px', borderRadius: 12,
        border: `1.5px solid ${focused ? TEAL : '#e2e8f0'}`,
        background: focused ? 'rgba(29,158,151,0.03)' : '#fafafa',
        fontSize: 13.5, color: '#1e293b', outline: 'none',
        boxSizing: 'border-box', transition: 'all 0.15s',
        boxShadow: focused ? '0 0 0 3px rgba(29,158,151,0.1)' : 'none',
      }}
    />
  )
}

function PrimaryButton({ children, onClick, disabled, style }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '12px 0', borderRadius: 12, border: 'none',
        background: disabled ? '#9dd6d1' : `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`,
        color: '#fff', fontWeight: 700, fontSize: 13.5,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : '0 4px 14px -2px rgba(29,158,151,0.4)',
        transition: 'opacity 0.15s', ...style,
      }}
    >
      {children}
    </button>
  )
}

function PaymentMethodPicker({ value, onChange, fulfilment }) {
  const codLabel = fulfilment === 'delivery' ? '💵 Cash on Delivery' : '💵 Pay at Pickup'
  return (
    <div>
      <SectionLabel>💳 Payment Method</SectionLabel>
      <div style={{ display: 'flex', gap: 8 }}>
        {[{ id: 'online', label: '💳 Pay Online' }, { id: 'cod', label: codLabel }].map(opt => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontSize: 12.5, fontWeight: 700,
              background: value === opt.id ? TEAL : '#f0fafa',
              color: value === opt.id ? '#fff' : TEAL,
              outline: value === opt.id ? 'none' : '1px solid #c7e9e6',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function StatusTracker({ stage }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {STATUS_STAGES.map((s, i) => (
        <div key={s.key} style={{ display: 'flex', alignItems: 'center', flex: i < STATUS_STAGES.length - 1 ? 1 : 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 60 }}>
            <div style={{
              width: 27, height: 27, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, background: i <= stage ? TEAL : '#f1f5f9',
              color: i <= stage ? '#fff' : '#cbd5e1', fontWeight: 700,
            }}>
              {i <= stage ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 600, color: i <= stage ? TEAL_DARK : '#94a3b8', textAlign: 'center', lineHeight: 1.2 }}>
              {s.label}
            </span>
          </div>
          {i < STATUS_STAGES.length - 1 && (
            <div style={{ flex: 1, height: 3, borderRadius: 2, background: i < stage ? TEAL : '#f1f5f9', margin: '0 -2px 20px' }} />
          )}
        </div>
      ))}
    </div>
  )
}

function ReceiptSummary({ items, total, deliveryFee }) {
  return (
    <div style={{ borderRadius: 16, padding: 14, background: '#f7fffe', border: '1px solid #e0f5f4' }}>
      {items.map((i, idx) => (
        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '4px 0' }}>
          <span style={{ color: '#0f172a' }}>{i.name} × {i.qty}</span>
          <span style={{ fontWeight: 600, color: '#0f172a' }}>{i.price ? `₹${i.price * i.qty}` : '—'}</span>
        </div>
      ))}
      {deliveryFee > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '4px 0', color: '#64748b' }}>
          <span>Delivery Fee</span><span>₹{deliveryFee}</span>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, fontWeight: 800, paddingTop: 8, marginTop: 6, borderTop: '1px solid #e0f5f4' }}>
        <span>Total</span><span style={{ color: TEAL }}>{total ? `₹${total}` : '—'}</span>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// TAB: Request Refill (medicine, Rx number, qty, pharmacy/fulfilment/payment)
// ═══════════════════════════════════════════════════════════
function RefillTab({ onSubmitted }) {
  const [medicineId, setMedicineId] = useState('')
  const [rxNumber, setRxNumber] = useState('')
  const [qty, setQty] = useState(1)
  const [fulfilment, setFulfilment] = useState('pickup')
  const [pharmacyId, setPharmacyId] = useState(PHARMACIES[0].id)
  const [preferredTime, setPreferredTime] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('online')
  const [submitting, setSubmitting] = useState(false)

  const medicine = MEDICINES.find(m => m.id === medicineId)
  const pharmacy = PHARMACIES.find(p => p.id === pharmacyId)
  const deliveryFee = fulfilment === 'delivery' ? DELIVERY_FEE : 0
  const total = medicine ? medicine.price * qty + deliveryFee : 0
  const isValid = medicineId && rxNumber.trim() && qty > 0

  async function handleSubmit() {
    if (!isValid) return
    setSubmitting(true)
    try {
      await fetch('http://localhost:8000/refill-prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicine: medicine.name, rxNumber, qty, fulfilment, pharmacyId, preferredTime, paymentMethod, total }),
      })
    } catch (e) { console.error('Refill request error:', e) }
    setSubmitting(false)
    onSubmitted({
      items: [{ name: medicine.name, qty, price: medicine.price }],
      total, deliveryFee, fulfilment, paymentMethod, pharmacyName: pharmacy.name,
    })
    setMedicineId(''); setRxNumber(''); setQty(1); setPreferredTime('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Medicine picker */}
      <div>
        <SectionLabel>💊 Medicine</SectionLabel>
        <select
          value={medicineId}
          onChange={e => setMedicineId(e.target.value)}
          style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fafafa', fontSize: 13.5, color: '#1e293b', outline: 'none', boxSizing: 'border-box' }}
        >
          <option value="">Select a medicine…</option>
          {MEDICINES.map(m => <option key={m.id} value={m.id}>{m.name} — ₹{m.price}</option>)}
        </select>
      </div>

      {/* Medicine info card — shows once selected */}
      {medicine && (
        <div style={{ borderRadius: 16, padding: 16, background: '#f0fafa', border: '1px solid #c7e9e6' }}>
          <p style={{ fontWeight: 700, fontSize: 13.5, color: '#0f172a', margin: '0 0 8px' }}>{medicine.name}</p>
          {[
            ['Dosage / Instructions', medicine.dosage],
            ['Remaining Refills', medicine.remainingRefills === null ? 'Not applicable (OTC)' : medicine.remainingRefills],
            ['Prescription Expiry', medicine.expiry || '—'],
            ['Last Refill Date', medicine.lastRefill || '—'],
          ].map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 12 }}>
              <span style={{ color: '#64748b' }}>{label}</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{val}</span>
            </div>
          ))}
        </div>
      )}

      <div>
        <SectionLabel>🔖 Prescription Number</SectionLabel>
        <TextInput value={rxNumber} onChange={setRxNumber} placeholder="e.g. RX-88902" />
      </div>

      <div>
        <SectionLabel>🔢 Quantity Needed</SectionLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 34, height: 34, borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 16, fontWeight: 700, color: TEAL, cursor: 'pointer' }}>−</button>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', minWidth: 24, textAlign: 'center' }}>{qty}</span>
          <button onClick={() => setQty(q => q + 1)} style={{ width: 34, height: 34, borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 16, fontWeight: 700, color: TEAL, cursor: 'pointer' }}>+</button>
        </div>
      </div>

      <div>
        <SectionLabel>🏥 Preferred Pharmacy</SectionLabel>
        <select value={pharmacyId} onChange={e => setPharmacyId(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fafafa', fontSize: 13.5, color: '#1e293b', outline: 'none', boxSizing: 'border-box' }}>
          {PHARMACIES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div>
        <SectionLabel>🚚 Pickup or Delivery</SectionLabel>
        <div style={{ display: 'flex', gap: 8 }}>
          {['pickup', 'delivery'].map(opt => (
            <button key={opt} onClick={() => setFulfilment(opt)} style={{
              flex: 1, padding: '10px 0', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, textTransform: 'capitalize',
              background: fulfilment === opt ? TEAL : '#f0fafa', color: fulfilment === opt ? '#fff' : TEAL,
              outline: fulfilment === opt ? 'none' : '1px solid #c7e9e6',
            }}>
              {opt === 'pickup' ? '🏃 Pickup' : '🚗 Delivery'}
            </button>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>🕐 Preferred {fulfilment === 'pickup' ? 'Pickup' : 'Delivery'} Time</SectionLabel>
        <TextInput value={preferredTime} onChange={setPreferredTime} placeholder="e.g. Today evening, After 5 PM" />
      </div>

      <PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} fulfilment={fulfilment} />

      {medicine && (
        <ReceiptSummary items={[{ name: medicine.name, qty, price: medicine.price }]} total={total} deliveryFee={deliveryFee} />
      )}

      <PrimaryButton onClick={handleSubmit} disabled={!isValid || submitting}>
        {submitting ? 'Submitting…' : `Submit Refill Request${medicine ? ` · ₹${total}` : ''}`}
      </PrimaryButton>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// TAB: Refill / Order Status tracker
// ═══════════════════════════════════════════════════════════
function StatusTab({ requests }) {
  if (requests.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 12px', color: '#94a3b8' }}>
        <p style={{ fontSize: 32, margin: '0 0 8px' }}>📭</p>
        <p style={{ fontSize: 13 }}>No refill requests or orders yet.</p>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {requests.map(r => (
        <div key={r.id} style={{ borderRadius: 16, padding: 18, background: '#f7fffe', border: '1px solid #e0f5f4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <p style={{ fontWeight: 700, fontSize: 13.5, color: '#0f172a', margin: 0 }}>
              {r.type === 'order' ? '🛒' : '💊'} {r.items[0]?.name}{r.items.length > 1 ? ` + ${r.items.length - 1} more` : ''}
            </p>
            <span style={{ fontSize: 11, fontWeight: 700, color: TEAL, fontFamily: 'monospace' }}>{r.id}</span>
          </div>
          <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 16px' }}>
            {r.fulfilment === 'delivery' ? '🚗 Delivery' : '🏃 Pickup'} · {r.total ? `₹${r.total}` : 'Awaiting review'} · {r.placedAt}
          </p>
          <StatusTracker stage={r.stage} />
          <button onClick={() => downloadReceipt(r)} style={{ marginTop: 16, width: '100%', padding: '9px 0', borderRadius: 10, border: '1px solid #c7e9e6', background: '#fff', color: TEAL_DARK, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
            🧾 Download Receipt
          </button>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// TAB: History — full receipt archive
// ═══════════════════════════════════════════════════════════
function HistoryTab({ requests }) {
  if (requests.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 12px', color: '#94a3b8' }}>
        <p style={{ fontSize: 32, margin: '0 0 8px' }}>🧾</p>
        <p style={{ fontSize: 13 }}>Your refill and order history will appear here.</p>
      </div>
    )
  }
  const paymentLabel = r => r.paymentMethod === 'online' ? '💳 Paid Online' : r.paymentMethod === 'cod' ? (r.fulfilment === 'delivery' ? '💵 Cash on Delivery' : '💵 Paid at Pickup') : '⏳ Pending Review'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {requests.map(r => (
        <div key={r.id} style={{ borderRadius: 16, border: '1px solid #e0f5f4', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', background: '#f7fffe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', margin: 0 }}>{r.type === 'order' ? '🛒 Order' : '💊 Refill'} · {r.id}</p>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>{r.placedAt} · {r.pharmacyName}</p>
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: TEAL_DARK, background: '#e6f7f5', padding: '3px 9px', borderRadius: 20 }}>{STATUS_STAGES[r.stage]?.label}</span>
          </div>
          <div style={{ padding: '14px 16px' }}>
            {r.items.map((i, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '3px 0' }}>
                <span style={{ color: '#475569' }}>{i.name} × {i.qty}</span>
                <span style={{ color: '#0f172a', fontWeight: 600 }}>{i.price ? `₹${i.price * i.qty}` : '—'}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTop: '1px dashed #e2e8f0' }}>
              <span style={{ fontSize: 11.5, color: '#64748b' }}>{paymentLabel(r)}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: TEAL }}>{r.total ? `₹${r.total}` : '—'}</span>
            </div>
            <button onClick={() => downloadReceipt(r)} style={{ marginTop: 12, width: '100%', padding: '9px 0', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
              ⬇ Download Receipt
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// TAB: Order / Shop — search, stock & price, cart, checkout
// ═══════════════════════════════════════════════════════════
function ShopTab({ onOrderPlaced }) {
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState({})
  const [step, setStep] = useState('browse') // browse | checkout | success
  const [fulfilment, setFulfilment] = useState('pickup')
  const [pharmacyId, setPharmacyId] = useState(PHARMACIES[0].id)
  const [address, setAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('online')
  const [placing, setPlacing] = useState(false)

  const filtered = MEDICINES.filter(m => m.name.toLowerCase().includes(search.toLowerCase()))
  const cartItems = Object.entries(cart).filter(([, q]) => q > 0).map(([id, q]) => ({ ...MEDICINES.find(m => m.id === id), qty: q }))
  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0)
  const deliveryFee = fulfilment === 'delivery' ? DELIVERY_FEE : 0
  const total = subtotal + deliveryFee
  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0)

  function addToCart(id) { setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 })) }
  function changeQty(id, delta) { setCart(c => ({ ...c, [id]: Math.max(0, (c[id] || 0) + delta) })) }

  async function placeOrder() {
    if (cartItems.length === 0) return
    setPlacing(true)
    try {
      await fetch('http://localhost:8000/pharmacy-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cartItems.map(i => ({ id: i.id, qty: i.qty })), fulfilment, pharmacyId, address, paymentMethod, total }),
      })
    } catch (e) { console.error('Order error:', e) }
    setPlacing(false)
    onOrderPlaced({
      items: cartItems.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
      total, deliveryFee, fulfilment, paymentMethod,
      pharmacyName: PHARMACIES.find(p => p.id === pharmacyId).name,
    })
    setCart({})
    setStep('success')
  }

  if (step === 'success') {
    return (
      <div style={{ textAlign: 'center', padding: '32px 12px' }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
        <p style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', margin: '0 0 6px' }}>Order Placed!</p>
        <p style={{ fontSize: 12.5, color: '#64748b', margin: '0 0 20px' }}>Check the Status or History tab to track it and grab your receipt.</p>
        <PrimaryButton onClick={() => setStep('browse')} style={{ width: '100%' }}>Order Something Else</PrimaryButton>
      </div>
    )
  }

  if (step === 'checkout') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <button onClick={() => setStep('browse')} style={{ alignSelf: 'flex-start', border: 'none', background: 'none', color: '#64748b', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
          ← Back to cart
        </button>
        <ReceiptSummary items={cartItems.map(i => ({ name: i.name, qty: i.qty, price: i.price }))} total={total} deliveryFee={deliveryFee} />
        <div>
          <SectionLabel>🏥 Pharmacy</SectionLabel>
          <select value={pharmacyId} onChange={e => setPharmacyId(e.target.value)} style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1.5px solid #e2e8f0', background: '#fafafa', fontSize: 13.5, outline: 'none', boxSizing: 'border-box' }}>
            {PHARMACIES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <SectionLabel>🚚 Pickup or Delivery</SectionLabel>
          <div style={{ display: 'flex', gap: 8 }}>
            {['pickup', 'delivery'].map(opt => (
              <button key={opt} onClick={() => setFulfilment(opt)} style={{ flex: 1, padding: '10px 0', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, background: fulfilment === opt ? TEAL : '#f0fafa', color: fulfilment === opt ? '#fff' : TEAL, outline: fulfilment === opt ? 'none' : '1px solid #c7e9e6' }}>
                {opt === 'pickup' ? '🏃 Pickup' : `🚗 Delivery (+₹${DELIVERY_FEE})`}
              </button>
            ))}
          </div>
        </div>
        {fulfilment === 'delivery' && (
          <div>
            <SectionLabel>📍 Delivery Address</SectionLabel>
            <TextInput value={address} onChange={setAddress} placeholder="Enter delivery address" />
          </div>
        )}
        <PaymentMethodPicker value={paymentMethod} onChange={setPaymentMethod} fulfilment={fulfilment} />
        <PrimaryButton onClick={placeOrder} disabled={placing || (fulfilment === 'delivery' && !address.trim())}>
          {placing ? 'Placing order…' : `Place Order · ₹${total}`}
        </PrimaryButton>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <TextInput value={search} onChange={setSearch} placeholder="🔍 Search medicines…" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
        {filtered.map(m => {
          const inCart = cart[m.id] || 0
          return (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, border: '1px solid #e0f5f4', background: '#f7fffe' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', margin: '0 0 2px' }}>{m.name}</p>
                <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>
                  {m.rxRequired ? '🔖 Rx required' : '🟢 OTC'} · {m.stock > 0 ? `${m.stock} in stock` : 'Out of stock'}
                </p>
                <p style={{ fontSize: 13, fontWeight: 700, color: TEAL, margin: '4px 0 0' }}>₹{m.price}</p>
              </div>
              {inCart === 0 ? (
                <button onClick={() => addToCart(m.id)} disabled={m.stock === 0} style={{ padding: '8px 14px', borderRadius: 10, border: 'none', background: m.stock === 0 ? '#e2e8f0' : TEAL, color: '#fff', fontWeight: 700, fontSize: 12, cursor: m.stock === 0 ? 'not-allowed' : 'pointer' }}>
                  Add
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button onClick={() => changeQty(m.id, -1)} style={{ width: 26, height: 26, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontWeight: 700, color: TEAL, cursor: 'pointer' }}>−</button>
                  <span style={{ fontSize: 13, fontWeight: 700, minWidth: 16, textAlign: 'center' }}>{inCart}</span>
                  <button onClick={() => changeQty(m.id, 1)} style={{ width: 26, height: 26, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', fontWeight: 700, color: TEAL, cursor: 'pointer' }}>+</button>
                </div>
              )}
            </div>
          )
        })}
        {filtered.length === 0 && <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#94a3b8', fontSize: 12.5, padding: '20px 0' }}>No medicines match "{search}"</p>}
      </div>

      {cartCount > 0 && (
        <div style={{ position: 'sticky', bottom: 0, background: '#fff', paddingTop: 8 }}>
          <PrimaryButton onClick={() => setStep('checkout')} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 18px' }}>
            <span>🛒 {cartCount} item{cartCount > 1 ? 's' : ''}</span>
            <span>₹{subtotal} · Checkout →</span>
          </PrimaryButton>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// TAB: Reminders + Auto-refill
// ═══════════════════════════════════════════════════════════
function RemindersTab() {
  const [autoRefill, setAutoRefill] = useState({ m1: true })

  const due = MEDICINES
    .filter(m => m.expiry)
    .map(m => ({ ...m, daysLeft: daysUntil(m.expiry) }))
    .sort((a, b) => a.daysLeft - b.daysLeft)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ borderRadius: 14, padding: 14, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
        <p style={{ fontSize: 12.5, color: '#1e40af', margin: 0, lineHeight: 1.5 }}>
          🔔 We'll notify you a few days before a prescription is due — e.g. <em>"Your Metformin prescription may be due for refill in 5 days."</em>
        </p>
      </div>

      {due.map(m => (
        <div key={m.id} style={{ borderRadius: 16, padding: 16, border: '1px solid #e0f5f4', background: '#f7fffe' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 13.5, color: '#0f172a', margin: '0 0 3px' }}>{m.name}</p>
              <p style={{ fontSize: 11.5, color: m.daysLeft <= 5 ? '#dc2626' : '#94a3b8', fontWeight: m.daysLeft <= 5 ? 700 : 500, margin: 0 }}>
                {m.daysLeft > 0 ? `Due for refill in ${m.daysLeft} days` : m.daysLeft === 0 ? 'Due today' : `Overdue by ${-m.daysLeft} days`}
              </p>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: TEAL, background: '#f0fafa', padding: '3px 9px', borderRadius: 20 }}>
              {m.remainingRefills} refill{m.remainingRefills === 1 ? '' : 's'} left
            </span>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#475569' }}>🔄 Enable Auto-Refill</span>
            <div
              onClick={() => setAutoRefill(a => ({ ...a, [m.id]: !a[m.id] }))}
              style={{ width: 42, height: 24, borderRadius: 20, background: autoRefill[m.id] ? TEAL : '#e2e8f0', position: 'relative', transition: 'background 0.2s' }}
            >
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: autoRefill[m.id] ? 21 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </div>
          </label>
          {autoRefill[m.id] && (
            <p style={{ fontSize: 11, color: '#64748b', margin: '8px 0 0', lineHeight: 1.5 }}>
              A refill request will be created automatically on schedule, with pharmacist review before it's dispensed.
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// TAB: Upload Prescription
// ═══════════════════════════════════════════════════════════
function UploadTab({ onSubmitted }) {
  const [file, setFile] = useState(null)
  const [extracting, setExtracting] = useState(false)
  const [extracted, setExtracted] = useState(null)
  const inputRef = useRef(null)

  function handleFile(f) {
    if (!f) return
    setFile(f)
    setExtracted(null)
  }

  function runExtraction() {
    setExtracting(true)
    // Mock OCR/extraction — a real integration would call a
    // document-parsing endpoint here.
    setTimeout(() => {
      setExtracted({
        medicine: 'Metformin 500mg',
        rxNumber: 'RX-' + Math.floor(10000 + Math.random() * 89999),
        doctor: 'Dr. Sharma',
        date: new Date().toLocaleDateString('en-IN'),
      })
      setExtracting(false)
    }, 1200)
  }

  async function submitForReview() {
    try {
      await fetch('http://localhost:8000/upload-prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file?.name, extracted }),
      })
    } catch (e) { console.error('Upload error:', e) }
    onSubmitted({
      items: [{ name: extracted?.medicine || 'Uploaded prescription', qty: 1, price: 0 }],
      total: 0, deliveryFee: 0, fulfilment: 'pickup', paymentMethod: 'pending',
      pharmacyName: PHARMACIES[0].name,
    })
    setFile(null); setExtracted(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        onClick={() => inputRef.current?.click()}
        style={{
          border: '2px dashed #c7e9e6', borderRadius: 18, padding: '32px 20px', textAlign: 'center',
          background: '#f7fffe', cursor: 'pointer',
        }}
      >
        <input ref={inputRef} type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0])} />
        <p style={{ fontSize: 30, margin: '0 0 8px' }}>📄</p>
        <p style={{ fontWeight: 700, fontSize: 13.5, color: '#0f172a', margin: '0 0 4px' }}>
          {file ? file.name : 'Upload Prescription'}
        </p>
        <p style={{ fontSize: 11.5, color: '#94a3b8', margin: 0 }}>PDF, photo, or scan — tap to choose a file</p>
      </div>

      {file && !extracted && (
        <PrimaryButton onClick={runExtraction} disabled={extracting}>
          {extracting ? 'Reading prescription…' : '✨ Extract Details'}
        </PrimaryButton>
      )}

      {extracted && (
        <div style={{ borderRadius: 16, padding: 16, background: '#f0fafa', border: '1px solid #c7e9e6' }}>
          <p style={{ fontWeight: 700, fontSize: 13, color: '#0f172a', margin: '0 0 10px' }}>Extracted Details</p>
          {Object.entries(extracted).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '4px 0' }}>
              <span style={{ color: '#64748b', textTransform: 'capitalize' }}>{k}</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{v}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 12, padding: '10px 12px', borderRadius: 10, background: '#fffbeb', border: '1px solid #fde68a' }}>
            <span style={{ fontSize: 14, flexShrink: 0 }}>⚠️</span>
            <p style={{ fontSize: 11, color: '#92400e', margin: 0, lineHeight: 1.5 }}>
              AI-extracted details are a starting point only. A pharmacist will validate the original prescription before dispensing.
            </p>
          </div>
          <PrimaryButton onClick={submitForReview} style={{ width: '100%', marginTop: 12 }}>
            Submit for Pharmacist Review
          </PrimaryButton>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// TAB: AI receptionist chat + Call Pharmacist
// ═══════════════════════════════════════════════════════════
function ChatTab({ onNavigateTab }) {
  const [messages, setMessages] = useState([
    { from: 'bot', text: "Hi! I can help you refill a prescription, place an order, or answer pharmacy questions. What do you need?" },
  ])
  const [input, setInput] = useState('')
  const [calling, setCalling] = useState(false)

  function reply(text) {
    const lower = text.toLowerCase()
    if (lower.includes('blood pressure') || lower.includes('bp')) {
      return { text: "Sure — I found your active prescription for Amlodipine 5mg. Would you like to request a refill?", action: 'refill' }
    }
    if (lower.includes('sugar') || lower.includes('diabetes') || lower.includes('metformin')) {
      return { text: "Got it — your Metformin 500mg prescription has 2 refills remaining. Want me to open a refill request?", action: 'refill' }
    }
    if (lower.includes('order') || lower.includes('buy')) {
      return { text: "You can search and add medicines to your cart in the Order tab. Want me to take you there?", action: 'shop' }
    }
    if (lower.includes('receipt') || lower.includes('bill')) {
      return { text: "All your past receipts are downloadable from the History tab.", action: 'history' }
    }
    if (lower.includes('status') || lower.includes('track')) {
      return { text: "Let me pull that up for you in the Status tab.", action: 'status' }
    }
    return { text: "I can help with refills, orders, and tracking. Try telling me which medicine you need, or tap a tab above.", action: null }
  }

  function send() {
    const text = input.trim()
    if (!text) return
    setMessages(m => [...m, { from: 'user', text }])
    setInput('')
    setTimeout(() => {
      const r = reply(text)
      setMessages(m => [...m, { from: 'bot', text: r.text, action: r.action }])
    }, 500)
  }

  function callPharmacist() {
    setCalling(true)
    setMessages(m => [...m, { from: 'bot', text: '📞 Connecting you to the on-duty pharmacist at Suman Hospital Pharmacy… +91 98765 00000' }])
    setTimeout(() => setCalling(false), 1800)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 12, minHeight: 260 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.from === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '80%', padding: '10px 14px', borderRadius: 16,
              background: m.from === 'user' ? TEAL : '#f1f5f9',
              color: m.from === 'user' ? '#fff' : '#0f172a',
              fontSize: 12.5, lineHeight: 1.5,
              borderBottomRightRadius: m.from === 'user' ? 4 : 16,
              borderBottomLeftRadius: m.from === 'user' ? 16 : 4,
            }}>
              {m.text}
            </div>
            {m.action && (
              <button onClick={() => onNavigateTab(m.action)} style={{ marginTop: 6, fontSize: 11.5, fontWeight: 700, color: TEAL, background: '#f0fafa', border: '1px solid #c7e9e6', borderRadius: 20, padding: '5px 12px', cursor: 'pointer' }}>
                Take me there →
              </button>
            )}
          </div>
        ))}
      </div>

      <button onClick={callPharmacist} disabled={calling} style={{ width: '100%', marginBottom: 10, padding: '10px 0', borderRadius: 12, border: '1px solid #c7e9e6', background: '#f0fafa', color: TEAL_DARK, fontWeight: 700, fontSize: 12.5, cursor: calling ? 'default' : 'pointer' }}>
        {calling ? '📞 Connecting…' : '📞 Call Pharmacist'}
      </button>

      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <TextInput value={input} onChange={setInput} placeholder="e.g. I need to refill my blood pressure medicine" />
        </div>
        <button onClick={send} style={{ padding: '0 18px', borderRadius: 12, border: 'none', background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          Send
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// MAIN MODAL
// ═══════════════════════════════════════════════════════════
export function PrescriptionRefillModal({ onClose }) {
  const [tab, setTab] = useState('refill')
  const [requests, setRequests] = useState([
    {
      id: 'RX-2201', type: 'refill',
      items: [{ name: 'Metformin 500mg', qty: 1, price: 120 }],
      total: 120, deliveryFee: 0, stage: 2, placedAt: '2 hours ago',
      fulfilment: 'pickup', paymentMethod: 'online', pharmacyName: PHARMACIES[0].name,
    },
  ])

  function pushRequest(payload, type) {
    const id = (type === 'order' ? 'OR-' : 'RX-') + Math.floor(1000 + Math.random() * 8999)
    setRequests(r => [{ id, type, stage: 0, placedAt: 'Just now', ...payload }, ...r])
    setTab('status')
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: '#fff', width: '100%', maxWidth: 640, borderRadius: 24,
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column',
        maxHeight: '92vh', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '24px 28px 16px', flexShrink: 0, position: 'relative', borderBottom: '1px solid #f1f5f9' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, border: 'none', background: 'none', fontSize: 19, cursor: 'pointer', color: '#94a3b8' }}>✕</button>
          <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 21, fontWeight: 800, color: '#0f172a', margin: '0 0 3px' }}>💊 Pharmacy</h3>
          <p style={{ fontSize: 12.5, color: '#64748b', margin: 0 }}>Refills, orders, receipts, reminders and pharmacist support in one place.</p>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 4, padding: '10px 16px', overflowX: 'auto', flexShrink: 0, borderBottom: '1px solid #f1f5f9' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
                padding: '8px 13px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontSize: 12.5, fontWeight: 700,
                background: tab === t.id ? TEAL : '#f8fafc',
                color: tab === t.id ? '#fff' : '#64748b',
                transition: 'all 0.15s',
              }}
            >
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '22px 28px 28px', overflowY: 'auto', flex: 1 }}>
          {tab === 'refill'    && <RefillTab onSubmitted={r => pushRequest(r, 'refill')} />}
          {tab === 'status'    && <StatusTab requests={requests} />}
          {tab === 'shop'      && <ShopTab onOrderPlaced={r => pushRequest(r, 'order')} />}
          {tab === 'history'   && <HistoryTab requests={requests} />}
          {tab === 'reminders' && <RemindersTab />}
          {tab === 'upload'    && <UploadTab onSubmitted={r => pushRequest(r, 'refill')} />}
          {tab === 'chat'      && <ChatTab onNavigateTab={setTab} />}
        </div>
      </div>
    </div>
  )
}

export function SidebarRefillButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
        padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(29, 158, 151, 0.4)',
        background: 'rgba(29, 158, 151, 0.1)', color: '#38BDF8', fontWeight: 700, fontSize: 13,
        cursor: 'pointer', transition: 'all 0.2s',
      }}
    >
      💊 Prescription Refill
    </button>
  )
}