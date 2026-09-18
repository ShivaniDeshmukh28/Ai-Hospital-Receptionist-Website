import React, { useState } from 'react';

export default function SymptomTriage({ onBookAppointment, onFindHospital }) {
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:8000/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms,
          age: age ? parseInt(age, 10) : null
        })
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate symptoms.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 font-sans">
      <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6 md:p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
          🩺 AI Emergency Triage &amp; Symptom Guidance
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Describe your symptoms to evaluate urgency level and view verified care steps.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Describe Your Symptoms
            </label>
            <textarea
              rows={3}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g., Severe chest pain and numbness in my arm..."
              className="w-full p-3.5 text-sm border border-slate-200 rounded-2xl focus:outline-none focus:border-teal-600 bg-slate-50"
              required
            />
          </div>

          <div className="w-1/3">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Age (Optional)
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g., 28"
              className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 bg-slate-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !symptoms.trim()}
            className="w-full py-3.5 rounded-2xl font-bold text-sm text-white bg-teal-700 hover:bg-teal-800 transition-all shadow-md"
          >
            {loading ? 'Evaluating Urgency...' : 'Analyze Symptoms & Urgency'}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 rounded-2xl bg-red-50 text-red-700 text-sm border border-red-200">
            ⚠️ {error}
          </div>
        )}

        {/* Dynamic Color-Coded Triage Output Banner */}
        {result && (
          <div className="mt-8 space-y-6 animate-fadeIn">
            
            {/* 🔴 RED — EMERGENCY */}
            {result.urgency_level === 'Emergency' && (
              <div className="p-6 rounded-3xl bg-red-500 text-white shadow-xl border-2 border-red-600">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-black tracking-wide uppercase mb-1">
                      Urgency Level
                    </span>
                    <h3 className="text-2xl font-black">🔴 RED — Emergency</h3>
                  </div>
                  <span className="text-4xl animate-pulse">🚨</span>
                </div>
                <p className="text-sm font-medium text-red-100 mb-6">
                  Urgent medical intervention required (e.g., chest pain, stroke symptoms, severe bleeding). Seek immediate emergency services.
                </p>

                {/* Emergency Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <a
                    href="tel:108"
                    className="w-full py-3.5 bg-white text-red-600 font-extrabold rounded-2xl text-center shadow hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                  >
                    📞 Call 108 / 911 Immediately
                  </a>
                  <button
                    onClick={onFindHospital}
                    className="w-full py-3.5 bg-red-900/40 border border-white/40 text-white font-extrabold rounded-2xl hover:bg-red-900/60 transition-all flex items-center justify-center gap-2"
                  >
                    📍 Locate Emergency Room
                  </button>
                </div>
              </div>
            )}

            {/* 🟡 YELLOW — MODERATE / URGENT */}
            {result.urgency_level === 'Moderate' && (
              <div className="p-6 rounded-3xl bg-amber-500 text-white shadow-xl border-2 border-amber-600">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-black tracking-wide uppercase mb-1">
                      Urgency Level
                    </span>
                    <h3 className="text-2xl font-black">🟡 YELLOW — Moderate / Urgent</h3>
                  </div>
                  <span className="text-4xl">⚠️</span>
                </div>
                <p className="text-sm font-medium text-amber-100 mb-6">
                  Requires medical evaluation within 12–24 hours (e.g., high persistent fever, deep cut requiring sutures, mild fracture suspicion).
                </p>

                {/* Moderate Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={onBookAppointment}
                    className="w-full py-3.5 bg-white text-amber-900 font-extrabold rounded-2xl shadow hover:bg-amber-50 transition-all"
                  >
                    📅 Book Urgent Appointment
                  </button>
                  <button
                    onClick={onFindHospital}
                    className="w-full py-3.5 bg-amber-800/40 border border-white/40 text-white font-extrabold rounded-2xl hover:bg-amber-800/60 transition-all"
                  >
                    🏥 Find Nearby Clinics
                  </button>
                </div>
              </div>
            )}

            {/* 🟢 GREEN — LOW / NON-URGENT */}
            {result.urgency_level === 'Low' && (
              <div className="p-6 rounded-3xl bg-emerald-600 text-white shadow-xl border-2 border-emerald-700">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-black tracking-wide uppercase mb-1">
                      Urgency Level
                    </span>
                    <h3 className="text-2xl font-black">🟢 GREEN — Low / Non-Urgent</h3>
                  </div>
                  <span className="text-4xl">✅</span>
                </div>
                <p className="text-sm font-medium text-emerald-100 mb-6">
                  Self-care or primary care routine visit (e.g., common cold, mild headache, minor skin rash).
                </p>

                {/* Low Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={onBookAppointment}
                    className="w-full py-3.5 bg-white text-emerald-900 font-extrabold rounded-2xl shadow hover:bg-emerald-50 transition-all"
                  >
                    📅 Schedule Routine Visit
                  </button>
                </div>
              </div>
            )}

            {/* First Aid Steps */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 mb-3">Verified First-Aid Steps</h4>
              <ul className="space-y-2">
                {result.first_aid_guidance.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}