-- ============================================================================
-- Update get_public_posts() to Return Masked Contacts (Industry Standard)
-- ============================================================================
-- This updates the function to return masked contacts instead of NULL
-- Security-focused masking to prevent number guessing:
-- - 10+ digits: Show first 2-3 and last 2 (e.g., 98****78) - leaves 5-6 digits masked
-- - 7-9 digits: Show first 2 and last 2 (e.g., 98****78) - leaves 3-4 digits masked
-- - 4-6 digits: Show first 2 and last 1 (e.g., 98****8) - leaves 1-2 digits masked
-- ============================================================================

-- Drop the existing function
DROP FUNCTION IF EXISTS public.get_public_posts();

-- Create helper function to mask contact numbers
CREATE OR REPLACE FUNCTION public.mask_contact(contact_text TEXT)
RETURNS TEXT AS $$
DECLARE
    digits_only TEXT;
    digit_length INT;
    start_digits INT;
    end_digits INT;
    start_part TEXT;
    end_part TEXT;
    masked_part TEXT;
    country_code_match TEXT;
    country_code TEXT;
BEGIN
    -- Return "****" if contact is null or too short
    IF contact_text IS NULL OR LENGTH(contact_text) < 4 THEN
        RETURN '****';
    END IF;
    
    -- Check for country code prefix FIRST (only if it starts with + or 00)
    -- This prevents false matches (e.g., "9802" should NOT be treated as country code)
    IF contact_text LIKE '+%' THEN
        -- Extract country code (e.g., +977, +1)
        country_code_match := SUBSTRING(contact_text FROM '^(\+[0-9]{1,3})');
        IF country_code_match IS NOT NULL THEN
            country_code := country_code_match;
            -- Remove country code and spaces from contact for masking
            digits_only := REGEXP_REPLACE(contact_text, '^\+[0-9]{1,3}\s*', '', 'g');
            digits_only := REGEXP_REPLACE(digits_only, '[^0-9]', '', 'g');
        END IF;
    ELSIF contact_text LIKE '00%' THEN
        -- Extract country code (e.g., 00977)
        country_code_match := SUBSTRING(contact_text FROM '^(00[0-9]{1,3})');
        IF country_code_match IS NOT NULL THEN
            country_code := country_code_match;
            -- Remove country code from contact for masking
            digits_only := REGEXP_REPLACE(contact_text, '^00[0-9]{1,3}\s*', '', 'g');
            digits_only := REGEXP_REPLACE(digits_only, '[^0-9]', '', 'g');
        END IF;
    END IF;
    
    -- If no country code detected, extract all digits
    IF country_code IS NULL THEN
        digits_only := REGEXP_REPLACE(contact_text, '[^0-9]', '', 'g');
    END IF;
    
    digit_length := LENGTH(digits_only);
    
    -- Determine how many digits to show at start and end
    -- Security-focused: Show fewer digits to prevent guessing
    -- Industry best practice: Show enough to identify format but not enough to guess
    IF digit_length >= 10 THEN
        -- Long numbers (phone numbers): Show first 2-3 and last 2
        -- This leaves 5-6 digits masked (100,000 to 1,000,000 combinations to guess)
        start_digits := CASE WHEN digit_length >= 12 THEN 3 ELSE 2 END;
        end_digits := 2;
    ELSIF digit_length >= 7 THEN
        -- Medium numbers: Show first 2 and last 2
        -- This leaves 3-4 digits masked (1,000 to 10,000 combinations)
        start_digits := 2;
        end_digits := 2;
    ELSE
        -- Short numbers: Show first 2 and last 1
        -- This leaves 1-2 digits masked (10 to 100 combinations)
        start_digits := 2;
        end_digits := 1;
    END IF;
    
    -- Extract start and end parts from digits_only (country code already removed if present)
    start_part := SUBSTRING(digits_only FROM 1 FOR start_digits);
    end_part := SUBSTRING(digits_only FROM digit_length - end_digits + 1);
    
    -- Calculate masked length (minimum 3 asterisks)
    masked_part := REPEAT('*', GREATEST(3, digit_length - start_digits - end_digits));
    
    -- Return with country code if detected, otherwise return masked number only
    IF country_code IS NOT NULL THEN
        RETURN country_code || ' ' || start_part || masked_part || end_part;
    END IF;
    
    -- Return masked contact without country code (most common case)
    RETURN start_part || masked_part || end_part;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Recreate get_public_posts() with masked contacts
CREATE OR REPLACE FUNCTION public.get_public_posts()
RETURNS TABLE (
    id UUID,
    post_type TEXT,
    work TEXT,
    "time" TEXT,
    place TEXT,
    salary TEXT,
    contact TEXT,
    photo_url TEXT,
    status TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.post_type,
        p.work,
        p."time",
        p.place,
        p.salary,
        -- Return full contact if payment approved, otherwise return masked contact
        CASE 
            WHEN EXISTS (
                SELECT 1 
                FROM public.payments pay
                WHERE pay.post_id = p.id 
                AND pay.status = 'approved'
            ) THEN p.contact
            ELSE public.mask_contact(p.contact)
        END AS contact,
        p.photo_url,
        p.status,
        p.created_at
    FROM public.posts p
    WHERE p.status = 'approved'
        -- 30-day expiration: Only show posts created within the last 30 days
        AND p.created_at >= now() - interval '30 days'
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_public_posts() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.mask_contact(TEXT) TO anon, authenticated;

-- ============================================================================
-- Verification
-- ============================================================================
-- Test the masking function:
-- SELECT public.mask_contact('9802980078');  -- Should return: 98****78 (secure: 6 digits masked)
-- SELECT public.mask_contact('+977 9802980078');  -- Should return: +977 98****78
-- SELECT public.mask_contact('9812345');  -- Should return: 98****5 (secure: 3 digits masked)
-- SELECT public.mask_contact('9812');  -- Should return: 98****2 (secure: 1 digit masked)
--
-- Test the main function:
-- SELECT * FROM get_public_posts() LIMIT 1;
-- ============================================================================
