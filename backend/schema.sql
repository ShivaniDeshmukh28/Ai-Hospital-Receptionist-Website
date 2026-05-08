-- ============================================================
-- AI Hospital Receptionist — Supabase Schema
-- Run this in your Supabase SQL Editor to set up the tables
-- ============================================================


-- ── Table: patients ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS patients (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_name  TEXT NOT NULL,
  patient_age   INTEGER NOT NULL CHECK (patient_age > 0 AND patient_age < 150),
  patient_query TEXT NOT NULL,
  ward          TEXT NOT NULL CHECK (ward IN ('General Ward', 'Emergency Ward', 'Mental Health Ward')),
  session_id    TEXT,
  timestamp     TIMESTAMPTZ DEFAULT now(),
  status        TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'in-progress', 'completed'))
);


-- ── Table: hospitals ─────────────────────────────────────────
-- For the Lean Canvas KPI: "Number of hospitals enrolled"

CREATE TABLE IF NOT EXISTS hospitals (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT NOT NULL,
  location     TEXT,
  kiosk_count  INTEGER DEFAULT 1,
  enrolled_at  TIMESTAMPTZ DEFAULT now(),
  is_active    BOOLEAN DEFAULT TRUE
);


-- ── Row Level Security ────────────────────────────────────────
-- Enable RLS (only your backend service role can write)

ALTER TABLE patients   ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals  ENABLE ROW LEVEL SECURITY;

-- Allow anyone to INSERT (kiosk submissions)
CREATE POLICY "Allow kiosk inserts" ON patients
  FOR INSERT WITH CHECK (true);

-- Allow only authenticated service role to SELECT
CREATE POLICY "Allow service role reads" ON patients
  FOR SELECT USING (auth.role() = 'service_role');


-- ── Indexes ───────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_patients_timestamp ON patients (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_patients_ward      ON patients (ward);
CREATE INDEX IF NOT EXISTS idx_patients_session   ON patients (session_id);


-- ── Sample data (optional, for testing) ──────────────────────

-- INSERT INTO patients (patient_name, patient_age, patient_query, ward, session_id)
-- VALUES ('Test Patient', 30, 'Fever and headache', 'General Ward', 'test-session-001');
