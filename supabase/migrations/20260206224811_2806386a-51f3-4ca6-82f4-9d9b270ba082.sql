-- Add new column for claimed_profiles reference
ALTER TABLE score_history 
  ADD COLUMN claimed_profile_id UUID REFERENCES claimed_profiles(id) ON DELETE CASCADE;

-- Make project_id nullable (since we now have two possible foreign keys)
ALTER TABLE score_history 
  ALTER COLUMN project_id DROP NOT NULL;

-- Add check constraint to ensure at least one foreign key is set
ALTER TABLE score_history 
  ADD CONSTRAINT score_history_one_fk_required 
  CHECK (project_id IS NOT NULL OR claimed_profile_id IS NOT NULL);