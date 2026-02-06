-- Add resilience_score and liveness_status columns to claimed_profiles
ALTER TABLE claimed_profiles 
ADD COLUMN IF NOT EXISTS resilience_score numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS liveness_status text DEFAULT 'STALE';