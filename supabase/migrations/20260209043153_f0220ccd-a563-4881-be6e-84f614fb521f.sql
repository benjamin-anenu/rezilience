-- Add discovery_source column to track where profiles were discovered
ALTER TABLE claimed_profiles
ADD COLUMN IF NOT EXISTS discovery_source VARCHAR(100) DEFAULT NULL;