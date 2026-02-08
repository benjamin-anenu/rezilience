-- Add bytecode verification fields to claimed_profiles
ALTER TABLE claimed_profiles 
ADD COLUMN IF NOT EXISTS bytecode_hash TEXT,
ADD COLUMN IF NOT EXISTS bytecode_verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS bytecode_match_status TEXT DEFAULT 'unknown';

-- Add check constraint for bytecode_match_status
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE constraint_name = 'bytecode_match_status_check'
  ) THEN
    ALTER TABLE claimed_profiles 
    ADD CONSTRAINT bytecode_match_status_check 
    CHECK (bytecode_match_status IN ('original', 'fork', 'unknown', 'not-deployed'));
  END IF;
END $$;