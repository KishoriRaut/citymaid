-- ============================================================================
-- Phone OTP Authentication Setup for CityMaid
-- ============================================================================
-- Run this in Supabase SQL Editor to configure phone authentication
-- ============================================================================

-- 1. Create user_profiles table for additional user data
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    phone TEXT UNIQUE NOT NULL,
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.email = auth.email()
        )
    );

-- 4. Create trigger to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, phone)
    VALUES (new.id, new.phone);
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Update contact_unlocks to work with phone auth users
-- Note: This assumes the emergency schema is already in place
-- The viewer_user_id field should work with auth.users.id from phone auth

-- 7. Create function to get user profile by phone
CREATE OR REPLACE FUNCTION public.get_user_profile_by_phone(phone_param TEXT)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    phone TEXT,
    full_name TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.id,
        up.user_id,
        up.phone,
        up.full_name,
        up.created_at
    FROM public.user_profiles up
    WHERE up.phone = phone_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Grant permissions
GRANT EXECUTE ON FUNCTION public.get_user_profile_by_phone TO anon, authenticated;

-- 9. Success message
DO $$
BEGIN
    RAISE NOTICE 'Phone OTP authentication setup completed!';
    RAISE NOTICE 'user_profiles table created with RLS policies';
    RAISE NOTICE 'Trigger created to auto-create profiles on signup';
    RAISE NOTICE 'Functions created for user profile management';
END $$;
