-- Add security_settings column to user_profiles for advanced account options
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS security_settings JSONB;

COMMENT ON COLUMN user_profiles.security_settings IS 'Advanced security settings for each user';
