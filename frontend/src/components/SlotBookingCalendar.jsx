import { useState } from "react";

const WARDS = {
  "General Medicine": ["Dr. Anita Sharma", "Dr. Ravi Kulkarni", "Dr. Priya Nair"],
  Cardiology: ["Dr. Sanjay Mehta", "Dr. Deepa Rao", "Dr. Amol Desai"],
  Orthopedics: ["Dr. Vikram Joshi", "Dr. Sunita Patil"],
  Neurology: ["Dr. Rahul Bhat", "Dr. Kavita Iyer", "Dr. Nitin Chavan"],
  Pediatrics: ["Dr. Meera Deshpande", "Dr. Suresh Gaikwad"],
  Gynecology: ["Dr. Usha Kulkarni", "Dr. Rekha Shinde"],
};

const TIMES = ["9:00 AM","10:00 AM","11:00 AM","12:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["S","M","T","W","T","F","S"];
const CONDITIONS = ["Diabetes","Hypertension","Asthma","Heart Disease","Thyroid","Arthritis","Kidney Disease","Epilepsy","Cancer","None"];
const STEP_NAMES = ["Ward & Doctor","Choose Slot","Patient Info","Payment","Receipt"];

function getDayStatus(y, m, d) {
  const today = new Date(); today.setHours(0,0,0,0);
  const dt = new Date(y, m, d);
  if (dt < today) return "unavailable";
  if (dt.getTime() === today.getTime()) return "available";
  const r = (y * 31 + m * 7 + d) % 10;
  if (r < 4) return "available";
  if (r < 6) return "fast";
  if (r < 7) return "full";
  if (r < 8) return "not-released";
  return "unavailable";
}

const DAY_STYLE = {
  available:      { bg: "#1d9e97", color: "#fff", ok: true },
  fast:           { bg: "#EF9F27", color: "#fff", ok: true },
  full:           { bg: "#E24B4A", color: "#fff", ok: false },
  "not-released": { bg: "#378ADD", color: "#fff", ok: false },
  unavailable:    { bg: "#ececec", color: "#bbb", ok: false },
};

// ── Print Token ───────────────────────────────────────────────────────────────
function printToken(S) {
  const fee = S.payment === "counter" ? 0 : S.payment === "upi" ? 150 : 200;
  const payLabel = { counter: "Pay at Counter", card: "Credit/Debit Card", upi: "UPI", netbanking: "Net Banking" }[S.payment];

  const printContent = `
    <html>
    <head>
      <title>Appointment Token - ${S.token}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 30px; max-width: 420px; margin: auto; }
        .header { text-align: center; padding-bottom: 16px; margin-bottom: 16px; border-bottom: 2px dashed #1d9e97; }
        .hospital { font-size: 22px; font-weight: 800; color: #0b7a74; }
        .subtitle { font-size: 12px; color: #6b7280; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; }
        .token-box { background: linear-gradient(135deg, #0b7a74, #1d9e97); border-radius: 16px; padding: 20px; text-align: center; margin: 16px 0; }
        .token-label { font-size: 11px; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 2px; }
        .token-num { font-size: 40px; font-weight: 800; color: white; letter-spacing: 6px; margin-top: 4px; }
        .section { margin: 12px 0; }
        .section-title { font-size: 10px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; padding: 4px 8px; background: #f0fafa; border-radius: 4px; }
        table { width: 100%; border-collapse: collapse; }
        tr { border-bottom: 1px solid #f3f4f6; }
        td { padding: 7px 4px; font-size: 12px; }
        td:first-child { color: #6b7280; width: 45%; }
        td:last-child { font-weight: 600; color: #111; text-align: right; }
        .note { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 10px; margin-top: 16px; font-size: 12px; color: #166534; text-align: center; }
        .footer { text-align: center; margin-top: 20px; padding-top: 16px; border-top: 2px dashed #e5e7eb; }
        .footer p { font-size: 11px; color: #9ca3af; margin-top: 4px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="hospital">🏥 MediBook Hospital</div>
        <div class="subtitle">Appointment Token & Receipt</div>
      </div>

      <div class="token-box">
        <div class="token-label">Your Token Number</div>
        <div class="token-num">${S.token}</div>
      </div>

      <div class="section">
        <div class="section-title">Patient Information</div>
        <table>
          <tr><td>👤 Name</td><td>${S.name}</td></tr>
          <tr><td>🎂 Age / Gender</td><td>${S.age} yrs / ${S.gender}</td></tr>
          <tr><td>📱 Mobile</td><td>${S.phone}</td></tr>
          <tr><td>📧 Email</td><td>${S.email}</td></tr>
        </table>
      </div>

      <div class="section">
        <div class="section-title">Appointment Details</div>
        <table>
          <tr><td>🏥 Ward</td><td>${S.ward}</td></tr>
          <tr><td>👨‍⚕️ Doctor</td><td>${S.doctor}</td></tr>
          <tr><td>📅 Date</td><td>${S.selDateLabel}</td></tr>
          <tr><td>🕐 Time Slot</td><td>${S.selTime}</td></tr>
        </table>
      </div>

      <div class="section">
        <div class="section-title">Payment</div>
        <table>
          <tr><td>💳 Mode</td><td>${payLabel}</td></tr>
          <tr><td>💰 Advance Fee</td><td>${fee > 0 ? `₹${fee} paid` : '₹0 (pay at counter)'}</td></tr>
        </table>
      </div>

      <div class="note">⏰ Please arrive 15 minutes early with valid ID proof</div>

      <div class="footer">
        <p>Keep this token for reference at the reception desk</p>
        <p>MediBook Hospital Management System</p>
      </div>
    </body>
    </html>
  `;

  const w = window.open('', '_blank', 'width=520,height=720');
  w.document.write(printContent);
  w.document.close();
  w.focus();
  w.print();
  w.close();
}

// ── Send Email via Backend ────────────────────────────────────────────────────
async function sendBookingEmail(S) {
  const fee = S.payment === "counter" ? 0 : S.payment === "upi" ? 150 : 200;
  try {
    await fetch('http://localhost:8000/book-slot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: S.name,
        email: S.email,
        phone: S.phone,
        doctor: S.doctor,
        ward: S.ward,
        date: S.selDateLabel,
        time: S.selTime,
        fee: fee,
        token: S.token,
      }),
    });
    console.log('[Email] Booking confirmation sent');
  } catch (e) {
    console.error('[Email Error]', e);
  }
}

function MonthCalendar({ year, month, selectedDate, onSelectDate }) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <div style={{ flex: 1, border: "0.5px solid #e5e7eb", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
      <div style={{ textAlign: "center", padding: "7px 4px", fontSize: 11, fontWeight: 600, color: "#374151", background: "#f9fafb", borderBottom: "0.5px solid #e5e7eb" }}>
        {MONTHS[month]} {year}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1, padding: "5px 4px 2px" }}>
        {DAYS.map((d, i) => <div key={i} style={{ textAlign: "center", fontSize: 9, color: "#9ca3af", fontWeight: 600, padding: "2px 0" }}>{d}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1, padding: "0 4px 5px" }}>
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} />;
          const status = getDayStatus(year, month, day);
          const s = DAY_STYLE[status];
          const dateStr = `${year}-${month}-${day}`;
          const isSel = selectedDate === dateStr;
          return (
            <button key={idx}
              onClick={() => s.ok && onSelectDate(dateStr, `${MONTHS[month]} ${day}, ${year}`)}
              style={{ width: "100%", aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, borderRadius: 5, border: "none", background: s.bg, color: s.color, cursor: s.ok ? "pointer" : "not-allowed", outline: isSel ? "2px solid #0b7a74" : "none", outlineOffset: 1, transition: "all 0.15s" }}>
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepsBar({ currentStep }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "12px 20px", borderBottom: "0.5px solid #e5e7eb", background: "#f9fafb" }}>
      {STEP_NAMES.map((name, i) => {
        const n = i + 1, isDone = n < currentStep, isActive = n === currentStep;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: i < 4 ? "1" : "0" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, transition: "all 0.2s", flexShrink: 0, border: isDone ? "none" : isActive ? "1.5px solid #1d9e97" : "1.5px solid #e5e7eb", background: isDone ? "#1d9e97" : "#fff", color: isDone ? "#fff" : isActive ? "#1d9e97" : "#9ca3af" }}>
                {isDone ? "✓" : n}
              </div>
              <div style={{ fontSize: 9, color: isActive ? "#1d9e97" : "#9ca3af", whiteSpace: "nowrap", fontWeight: isActive ? 600 : 400 }}>{name}</div>
            </div>
            {i < 4 && <div style={{ flex: 1, height: 1, background: isDone ? "#1d9e97" : "#e5e7eb", margin: "0 4px", marginBottom: 14 }} />}
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 11, color: "#6b7280", fontWeight: 500, display: "block", marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

function Card({ title, icon, children }) {
  return (
    <div style={{ border: "0.5px solid #e5e7eb", borderRadius: 12, overflow: "hidden", marginBottom: 12, background: "#fff" }}>
      <div style={{ padding: "10px 14px", background: "#f9fafb", borderBottom: "0.5px solid #e5e7eb", fontSize: 12, fontWeight: 600, color: "#374151", display: "flex", alignItems: "center", gap: 7 }}>
        <span>{icon}</span>{title}
      </div>
      <div style={{ padding: 14 }}>{children}</div>
    </div>
  );
}

function Btn({ children, onClick, disabled, outline }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ padding: "9px 20px", borderRadius: 9, border: outline ? "0.5px solid #e5e7eb" : "none", background: disabled ? "#e5e7eb" : outline ? "#fff" : "#1d9e97", color: disabled ? "#9ca3af" : outline ? "#374151" : "#fff", fontSize: 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.15s" }}>
      {children}
    </button>
  );
}

function BtnRow({ children }) {
  return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>{children}</div>;
}

function Badge({ children, color }) {
  const colors = { blue: ["#E6F1FB","#0C447C"], teal: ["#e1f5f4","#0b7a74"], amber: ["#FAEEDA","#633806"] };
  const [bg, tc] = colors[color] || colors.blue;
  return <span style={{ padding: "3px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: bg, color: tc }}>{children}</span>;
}

function RRow({ label, val, small, accent }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "7px 0", borderBottom: "0.5px solid #f3f4f6", fontSize: 13, gap: 12 }}>
      <span style={{ color: "#6b7280", whiteSpace: "nowrap" }}>{label}</span>
      <span style={{ fontWeight: 500, textAlign: "right", fontSize: small ? 12 : 13, color: accent ? "#1d9e97" : "#111" }}>{val}</span>
    </div>
  );
}

function SectionLabel({ children }) {
  return <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8, marginTop: 4 }}>{children}</div>;
}

function Divider() { return <div style={{ height: "0.5px", background: "#e5e7eb", margin: "12px 0" }} />; }

function Step1({ S, setS, onNext }) {
  const docs = S.ward ? WARDS[S.ward] : [];
  return (
    <div style={{ maxWidth: 460, margin: "0 auto" }}>
      <Field label="Select Ward / Department">
        <select value={S.ward} onChange={e => setS(p => ({ ...p, ward: e.target.value, doctor: "" }))}>
          <option value="">— Choose ward —</option>
          {Object.keys(WARDS).map(w => <option key={w} value={w}>{w}</option>)}
        </select>
      </Field>
      <Field label="Select Doctor">
        <select value={S.doctor} onChange={e => setS(p => ({ ...p, doctor: e.target.value }))} disabled={!S.ward}>
          <option value="">— Choose doctor —</option>
          {docs.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </Field>
      {S.doctor && (
        <Card title="Doctor Profile" icon="👤">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#e1f5f4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 600, color: "#0b7a74", flexShrink: 0 }}>
              {S.doctor.split(" ").slice(-1)[0][0]}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>{S.doctor}</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{S.ward}</div>
              <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                <Badge color="blue">MBBS, MD</Badge>
                <Badge color="teal">15+ yrs exp</Badge>
                <Badge color="amber">Mon–Sat</Badge>
              </div>
            </div>
          </div>
        </Card>
      )}
      <BtnRow><div /><Btn onClick={onNext} disabled={!S.ward || !S.doctor}>Next →</Btn></BtnRow>
    </div>
  );
}

function Step2({ S, setS, onNext, onBack }) {
  const today = new Date();
  const months = [0,1,2].map(i => { const d = new Date(today.getFullYear(), today.getMonth() + i, 1); return { year: d.getFullYear(), month: d.getMonth() }; });
  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {months.map((m, i) => (
          <MonthCalendar key={i} year={m.year} month={m.month} selectedDate={S.selDate}
            onSelectDate={(ds, lbl) => setS(p => ({ ...p, selDate: ds, selDateLabel: lbl, selTime: null }))} />
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "8px 12px", background: "#f9fafb", borderRadius: 9, marginBottom: 12 }}>
        {[["#1d9e97","Available"],["#EF9F27","Filling fast"],["#E24B4A","Full"],["#378ADD","Not released"],["#ececec","Unavailable"]].map(([c,l]) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#6b7280" }}>
            <div style={{ width: 11, height: 11, borderRadius: 3, background: c, border: "0.5px solid #e5e7eb" }} /> {l}
          </div>
        ))}
      </div>
      <Card title={S.selDate ? `Available slots — ${S.selDateLabel}` : "Select a date"} icon="🕐">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, minHeight: 48 }}>
          {!S.selDate
            ? <span style={{ fontSize: 12, color: "#9ca3af" }}>Select an available date above first</span>
            : TIMES.map(t => (
              <button key={t} onClick={() => setS(p => ({ ...p, selTime: t }))}
                style={{ padding: "7px 14px", borderRadius: 20, border: S.selTime === t ? "none" : "0.5px solid #e5e7eb", background: S.selTime === t ? "#1d9e97" : "#fff", color: S.selTime === t ? "#fff" : "#374151", fontSize: 12, cursor: "pointer", fontWeight: S.selTime === t ? 600 : 400, transition: "all 0.15s" }}>
                {t}
              </button>
            ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0 0", borderTop: "0.5px solid #e5e7eb", marginTop: 10 }}>
          <div style={{ fontSize: 13, color: "#6b7280" }}>
            {S.selDate && S.selTime ? <><b style={{ color: "#111" }}>{S.selTime}</b> · {S.selDateLabel}</> : "No slot selected"}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn outline onClick={onBack}>← Back</Btn>
            <Btn onClick={onNext} disabled={!S.selDate || !S.selTime}>Next →</Btn>
          </div>
        </div>
      </Card>
    </>
  );
}

function Step3({ S, setS, onNext, onBack }) {
  const toggle = (c) => {
    setS(p => {
      let conds = [...p.conditions];
      if (conds.includes(c)) { conds = conds.filter(x => x !== c); }
      else if (c === "None") { conds = ["None"]; }
      else { conds = conds.filter(x => x !== "None"); conds.push(c); }
      return { ...p, conditions: conds };
    });
  };
  const valid = S.name && S.email && S.phone && S.age && S.gender && S.prevConsult;
  return (
    <div style={{ maxWidth: 500, margin: "0 auto" }}>
      <Card title="Personal Details" icon="👤">
        <Field label="Full Name *">
          <input type="text" value={S.name} placeholder="Patient full name" onChange={e => setS(p => ({ ...p, name: e.target.value }))} />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Age *"><input type="number" value={S.age} placeholder="Years" min={1} max={120} onChange={e => setS(p => ({ ...p, age: e.target.value }))} /></Field>
          <Field label="Gender *">
            <select value={S.gender} onChange={e => setS(p => ({ ...p, gender: e.target.value }))}>
              <option value="">Select</option>
              {["Male","Female","Other"].map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </Field>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Email *"><input type="email" value={S.email} placeholder="email@example.com" onChange={e => setS(p => ({ ...p, email: e.target.value }))} /></Field>
          <Field label="Mobile *"><input type="tel" value={S.phone} placeholder="+91 9XXXXXXXX" onChange={e => setS(p => ({ ...p, phone: e.target.value }))} /></Field>
        </div>
      </Card>
      <Card title="Medical History & Consultation" icon="🏥">
        <Field label="Have you previously consulted this doctor?">
          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            {["Yes","No"].map(v => (
              <label key={v} onClick={() => setS(p => ({ ...p, prevConsult: v }))}
                style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer", padding: "8px 16px", borderRadius: 8, border: `1.5px solid ${S.prevConsult === v ? "#1d9e97" : "#e5e7eb"}`, background: S.prevConsult === v ? "#e1f5f4" : "#fff", color: "#374151" }}>
                <input type="radio" name="prev" readOnly checked={S.prevConsult === v} style={{ accentColor: "#1d9e97" }} /> {v}
              </label>
            ))}
          </div>
        </Field>
        {S.prevConsult === "Yes" && (
          <>
            <div style={{ background: "#e1f5f4", border: "1px solid #1d9e97", borderRadius: 10, padding: "10px 14px", marginBottom: 12, display: "flex", gap: 10 }}>
              <span style={{ fontSize: 18, color: "#1d9e97" }}>✓</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0b7a74" }}>Returning patient</div>
                <div style={{ fontSize: 12, color: "#0b7a74" }}>Your history will be retrieved from records</div>
              </div>
            </div>
            <Field label="Date of last visit"><input type="date" value={S.lastVisit} onChange={e => setS(p => ({ ...p, lastVisit: e.target.value }))} /></Field>
          </>
        )}
        {S.prevConsult === "No" && (
          <Field label="Chief complaint / reason for visit *">
            <textarea rows={3} style={{ width: "100%", padding: "9px 12px", border: "0.5px solid #e5e7eb", borderRadius: 8, fontSize: 13, fontFamily: "inherit", resize: "vertical" }}
              placeholder="Describe your main symptoms..." value={S.chiefComplaint} onChange={e => setS(p => ({ ...p, chiefComplaint: e.target.value }))} />
          </Field>
        )}
        {S.prevConsult && (
          <>
            <Field label="Known medical conditions">
              <div style={{ display: "flex", flexWrap: "wrap", marginTop: 6 }}>
                {CONDITIONS.map(c => {
                  const on = S.conditions.includes(c);
                  return (
                    <span key={c} onClick={() => toggle(c)}
                      style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 20, background: on ? "#e1f5f4" : "#f3f4f6", border: `0.5px solid ${on ? "#1d9e97" : "#e5e7eb"}`, fontSize: 11, color: on ? "#0b7a74" : "#6b7280", cursor: "pointer", margin: 3 }}>
                      {on && "✓"} {c}
                    </span>
                  );
                })}
              </div>
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Known allergies"><input type="text" value={S.allergies} placeholder="e.g. Penicillin" onChange={e => setS(p => ({ ...p, allergies: e.target.value }))} /></Field>
              <Field label="Current medications"><input type="text" value={S.medications} placeholder="e.g. Metformin 500mg" onChange={e => setS(p => ({ ...p, medications: e.target.value }))} /></Field>
            </div>
          </>
        )}
      </Card>
      <BtnRow>
        <Btn outline onClick={onBack}>← Back</Btn>
        <Btn onClick={onNext} disabled={!valid}>Next →</Btn>
      </BtnRow>
    </div>
  );
}

function Step4({ S, setS, onNext, onBack }) {
  const payOpts = [
    { val: "counter", label: "Pay at Counter",      sub: "Free — no advance",              fee: "₹0"   },
    { val: "upi",     label: "UPI Payment",          sub: "Google Pay, PhonePe, Paytm",     fee: "₹150" },
    { val: "card",    label: "Credit / Debit Card",  sub: "Visa, Mastercard, RuPay",        fee: "₹200" },
    { val: "netbanking", label: "Net Banking",       sub: "All major banks",                fee: "₹200" },
  ];
  const fee = S.payment === "counter" ? 0 : S.payment === "upi" ? 150 : 200;
  return (
    <div style={{ maxWidth: 460, margin: "0 auto" }}>
      <div style={{ background: "#e1f5f4", border: "0.5px solid #1d9e97", borderRadius: 9, padding: "9px 13px", fontSize: 13, color: "#0b7a74", display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        ✓ <span><b>{S.selTime}</b> · {S.selDateLabel} with <b>{S.doctor}</b></span>
      </div>
      <Card title="Advance Payment Mode" icon="💳">
        {payOpts.map(({ val, label, sub, fee: f }) => (
          <div key={val} onClick={() => setS(p => ({ ...p, payment: val }))}
            style={{ border: `1.5px solid ${S.payment === val ? "#1d9e97" : "#e5e7eb"}`, borderRadius: 10, padding: "11px 14px", cursor: "pointer", marginBottom: 8, display: "flex", alignItems: "center", gap: 10, background: S.payment === val ? "#e1f5f4" : "#fff", transition: "all 0.15s" }}>
            <input type="radio" name="pay" readOnly checked={S.payment === val} style={{ accentColor: "#1d9e97" }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{label}</div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{sub}</div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: val === "counter" ? "#9ca3af" : "#0b7a74" }}>{f}</div>
          </div>
        ))}
        {S.payment === "card" && (
          <div style={{ marginTop: 10, padding: 14, background: "#f9fafb", borderRadius: 10, border: "0.5px solid #e5e7eb" }}>
            <Field label="Card Number"><input type="text" maxLength={19} placeholder="1234 5678 9012 3456" value={S.cardNo} onChange={e => setS(p => ({ ...p, cardNo: e.target.value }))} /></Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Expiry MM/YY"><input type="text" maxLength={5} placeholder="MM/YY" value={S.expiry} onChange={e => setS(p => ({ ...p, expiry: e.target.value }))} /></Field>
              <Field label="CVV"><input type="password" maxLength={3} placeholder="•••" value={S.cvv} onChange={e => setS(p => ({ ...p, cvv: e.target.value }))} /></Field>
            </div>
          </div>
        )}
        {S.payment === "upi" && (
          <div style={{ marginTop: 10, padding: 12, background: "#f9fafb", borderRadius: 10, border: "0.5px solid #e5e7eb" }}>
            <Field label="UPI ID"><input type="text" placeholder="yourname@upi" value={S.upiId || ""} onChange={e => setS(p => ({ ...p, upiId: e.target.value }))} /></Field>
          </div>
        )}
        {fee > 0 && (
          <div style={{ marginTop: 12, padding: "10px 12px", border: "0.5px solid #1d9e97", borderRadius: 9, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "#374151" }}>Advance booking fee</span>
            <span style={{ fontSize: 16, fontWeight: 600, color: "#1d9e97" }}>₹{fee}</span>
          </div>
        )}
      </Card>
      <BtnRow>
        <Btn outline onClick={onBack}>← Back</Btn>
        <Btn onClick={onNext}>✓ Confirm Booking</Btn>
      </BtnRow>
    </div>
  );
}

function Step5({ S, onNew }) {
  const now = new Date();
  const bdate = `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  const fee = S.payment === "counter" ? 0 : S.payment === "upi" ? 150 : 200;
  const conds = S.conditions.length ? S.conditions.join(", ") : "None reported";
  const payLabel = { counter: "Pay at Counter", card: "Credit/Debit Card", upi: "UPI", netbanking: "Net Banking" }[S.payment];

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <div style={{ textAlign: "center", padding: "16px 0 12px" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#e1f5f4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", fontSize: 28 }}>✓</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#111" }}>Appointment Confirmed!</div>
        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Confirmation sent to {S.email}</div>
      </div>

      <div style={{ textAlign: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 5 }}>Your token number</div>
        <div style={{ background: "#1d9e97", color: "#fff", borderRadius: 12, padding: "6px 24px", fontSize: 22, fontWeight: 700, letterSpacing: 3, display: "inline-block" }}>{S.token}</div>
        <div style={{ fontSize: 11, color: "#6b7280", marginTop: 5 }}>Present this at the reception counter</div>
      </div>

      <Card title="Appointment Receipt" icon="🧾">
        <SectionLabel>Patient Information</SectionLabel>
        <RRow label="Name" val={S.name} />
        <RRow label="Age / Gender" val={`${S.age} yrs · ${S.gender}`} />
        <RRow label="Mobile" val={S.phone} />
        <RRow label="Email" val={S.email} small />
        <Divider />
        <SectionLabel>Appointment Details</SectionLabel>
        <RRow label="Ward" val={S.ward} />
        <RRow label="Doctor" val={S.doctor} />
        <RRow label="Date" val={S.selDateLabel} />
        <RRow label="Time Slot" val={S.selTime} />
        <RRow label="Booked On" val={bdate} />
        <Divider />
        <SectionLabel>Medical History</SectionLabel>
        <RRow label="Returning Patient" val={S.prevConsult === "Yes" ? "Yes (returning)" : "First visit"} />
        {S.prevConsult === "Yes" && S.lastVisit && <RRow label="Last Visit" val={S.lastVisit} />}
        <RRow label="Conditions" val={conds} />
        {S.allergies && <RRow label="Allergies" val={S.allergies} />}
        {S.medications && <RRow label="Medications" val={S.medications} />}
        <Divider />
        <RRow label="Payment Mode" val={payLabel} />
        <RRow label="Advance Fee" val={fee ? `₹${fee} paid` : "₹0 (pay at counter)"} accent={fee > 0} />
      </Card>

      <div style={{ background: "#f9fafb", borderRadius: 9, padding: "10px 13px", fontSize: 12, color: "#6b7280", marginBottom: 14 }}>
        ℹ Please arrive 15 minutes early. Bring a valid photo ID and this token number.
      </div>

      {/* ── Action Buttons ── */}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => printToken(S)}
          style={{ flex: 1, padding: "10px 0", borderRadius: 9, border: "1.5px solid #1d9e97", background: "#edf7f6", color: "#0b7a74", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          🖨️ Print Token
        </button>
        <button onClick={onNew}
          style={{ flex: 1, padding: "10px 0", borderRadius: 9, border: "none", background: "#1d9e97", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          + New Booking
        </button>
      </div>
    </div>
  );
}

const INIT = {
  step: 1, ward: "", doctor: "",
  selDate: null, selDateLabel: "", selTime: null,
  name: "", email: "", phone: "", age: "", gender: "",
  prevConsult: null, lastVisit: "", chiefComplaint: "",
  conditions: [], allergies: "", medications: "",
  payment: "counter", cardNo: "", expiry: "", cvv: "", upiId: "",
  token: "",
};

export default function SlotBookingCalendar() {
  const [S, setS] = useState(INIT);
  const go = (n) => setS(p => ({ ...p, step: n }));

  const confirm = async () => {
    const token = "TKN" + Math.floor(100000 + Math.random() * 900000);
    const newS = { ...S, token, step: 5 };
    setS(newS);
    // Send confirmation email
    await sendBookingEmail(newS);
  };

  const reset = () => setS(INIT);

  return (
    <>
      <style>{`
        input,select,textarea{font-family:inherit;transition:border 0.15s}
        input:focus,select:focus,textarea:focus{outline:none;border-color:#1d9e97!important;box-shadow:0 0 0 3px rgba(29,158,151,0.1)}
        input,select{width:100%;padding:9px 12px;border:0.5px solid #e5e7eb;border-radius:8px;background:#fff;color:#111;font-size:13px}
        textarea{border:0.5px solid #e5e7eb;border-radius:8px;background:#fff;color:#111;font-size:13px;padding:9px 12px}
      `}</style>

      <div style={{ border: "0.5px solid #e5e7eb", borderRadius: 16, overflow: "hidden", background: "#fff" }}>
        <div style={{ padding: "14px 20px", background: "#0b7a74", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏥</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>MediBook — Appointment Booking</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>Step {S.step} of 5 — {STEP_NAMES[S.step - 1]}</div>
          </div>
        </div>

        <StepsBar currentStep={S.step} />

        <div style={{ padding: 20 }}>
          {S.step === 1 && <Step1 S={S} setS={setS} onNext={() => go(2)} />}
          {S.step === 2 && <Step2 S={S} setS={setS} onNext={() => go(3)} onBack={() => go(1)} />}
          {S.step === 3 && <Step3 S={S} setS={setS} onNext={() => go(4)} onBack={() => go(2)} />}
          {S.step === 4 && <Step4 S={S} setS={setS} onNext={confirm} onBack={() => go(3)} />}
          {S.step === 5 && <Step5 S={S} onNew={reset} />}
        </div>
      </div>
    </>
  );
}
