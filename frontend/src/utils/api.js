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
 * @param {string} message  - User's typed message
 * @param {string} sessionId - UUID for this session
 * @returns {Promise<{reply, ward, data_complete, patient_summary}>}
 */
export async function sendMessage(message, sessionId, userLat = null, userLng = null) {
  const { data } = await client.post('/chat', {
    message,
    session_id: sessionId,
    user_lat: userLat,
    user_lng: userLng,
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
