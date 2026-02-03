-- AUTH PASSWORD PROTECTION FIX
-- Enable leaked password protection in Supabase Auth

-- ==========================================
-- NOTE: This setting must be configured via Supabase Dashboard
-- ==========================================

-- The leaked password protection setting cannot be changed via SQL
-- It must be configured in the Supabase Dashboard:

-- STEPS TO ENABLE LEAKED PASSWORD PROTECTION:

-- 1. Go to your Supabase Project Dashboard
-- 2. Navigate to Authentication → Settings
-- 3. Scroll down to "Password Security" section
-- 4. Enable "Leaked Password Protection"
-- 5. Save the configuration

-- ==========================================
-- ALTERNATIVE: Via Supabase CLI (if configured)
-- ==========================================

-- If you have Supabase CLI configured, you can use:
-- supabase auth config set password.protection.leaked_passwords=true

-- ==========================================
-- WHAT THIS PROTECTS AGAINST:
-- ==========================================

-- Leaked password protection:
-- ✅ Checks passwords against HaveIBeenPwned.org database
-- ✅ Prevents users from using compromised passwords
-- ✅ Enhances overall account security
-- ✅ Blocks common breached passwords
-- ✅ Automatically validates new passwords
-- ✅ Validates password changes

-- ==========================================
-- RECOMMENDED SETTINGS:
-- ==========================================

-- Enable these additional password security settings:
-- ✅ Minimum password length: 8 characters
-- ✅ Require uppercase and lowercase letters
-- ✅ Require numbers
-- ✅ Require special characters
-- ✅ Enable leaked password protection

-- ==========================================
-- VERIFICATION
-- ==========================================

-- After enabling, test with a known breached password:
-- Try creating an account with password "123456" or "password"
-- The system should reject it with a security warning
