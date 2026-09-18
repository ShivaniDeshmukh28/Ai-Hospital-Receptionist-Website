import axios from 'axios'

// In development: Vite proxy forwards /api → http://localhost:8000
// In production:  set VITE_API_URL to your Render.com backend URL
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

/**
 * Send a chat message to the AI backend.
 * @param {string} message     - User's typed message
 * @param {string} sessionId   - UUID for this session
 * @param {object} context     - Optional extra context (hospital info, coords)
 * @param {string|null}  context.hospital_name
 * @param {string|null}  context.hospital_type
 * @param {string|null}  context.hospital_area
 * @param {string[]|null} context.hospital_specialties
 * @param {number|null}  context.user_lat
 * @param {number|null}  context.user_lng
 * @returns {Promise<{reply, ward, data_complete, patient_summary}>}
 */
export async function sendMessage(message, sessionId, context = {}) {
  const {
    hospital_name        = null,
    hospital_type        = null,
    hospital_area        = null,
    hospital_specialties = null,
    user_lat             = null,
    user_lng             = null,
  } = context

  const { data } = await client.post('/chat', {
    message,
    session_id:           sessionId,
    user_lat,
    user_lng,
    hospital_name,
    hospital_type,
    hospital_area,
    hospital_specialties,
  })
  return data
}

/**
 * Send symptom description for AI triage and verified first-aid guidance.
 * @param {string} symptomsDescription - Detailed description of patient symptoms
 * @param {string} patientId           - Patient ID or default "GUEST"
 * @returns {Promise<{status, patient_id, data: {urgency_level, recommended_ward, first_aid_guidance, verified_disclaimer}}>}
 */
export async function analyzeSymptoms(symptomsDescription, patientId = 'GUEST') {
  const { data } = await client.post('/triage/analyze', {
    symptoms_description: symptomsDescription,
    patient_id:           patientId,
  })
  return data
}

/**
 * Confirm and save the patient record to Supabase.
 * @param {object} patientData
 * @returns {Promise<{success, id}>}
 */
export async function savePatient(patientData) {
  const { data } = await client.post('/save-patient', patientData)
  return data
}

/**
 * Health check - verify backend is alive.
 */
export async function checkHealth() {
  const { data } = await client.get('/health')
  return data
}