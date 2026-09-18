import React from 'react';

export default function SymptomGuidanceCard({ guidanceData, onProceed }) {
  if (!guidanceData) return null;

  const { urgency_level, recommended_ward, first_aid_guidance, verified_disclaimer } = guidanceData;

  const getUrgencyStyle = (level) => {
    switch (level?.toUpperCase()) {
      case 'EMERGENCY':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'MODERATE':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-5">
      {/* Header & Urgency Tag */}
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-xl font-bold text-gray-800">Symptom Assessment</h2>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getUrgencyStyle(urgency_level)}`}>
          {urgency_level} PRIORITY
        </span>
      </div>

      {/* Recommended Ward */}
      <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
        <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Recommended Ward</p>
        <p className="text-lg font-bold text-indigo-950 mt-1">{recommended_ward}</p>
      </div>

      {/* Verified Immediate Guidance */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700">Verified Immediate Care Steps:</h3>
        <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl leading-relaxed whitespace-pre-line border border-gray-100">
          {first_aid_guidance}
        </p>
      </div>

      {/* Mandatory Safety Disclaimer */}
      <div className="text-xs text-gray-500 bg-amber-50/60 p-3 rounded-lg border border-amber-100 flex items-start space-x-2">
        <span className="text-amber-600 font-bold">⚠️</span>
        <p>{verified_disclaimer}</p>
      </div>

      {/* Action Button */}
      <button
        onClick={onProceed}
        className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition duration-200 shadow-md hover:shadow-lg"
      >
        Proceed to Doctor Selection
      </button>
    </div>
  );
}