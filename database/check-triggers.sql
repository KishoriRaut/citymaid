-- Check for any triggers that might reference the deleted tables
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND (
    action_statement ILIKE '%payment_audit_log%' OR
    action_statement ILIKE '%audit_logs%' OR
    action_statement ILIKE '%security_logs%' OR
    action_statement ILIKE '%user_profiles%'
);

-- Check for any functions that reference the deleted tables
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND (
    routine_definition ILIKE '%payment_audit_log%' OR
    routine_definition ILIKE '%audit_logs%' OR
    routine_definition ILIKE '%security_logs%' OR
    routine_definition ILIKE '%user_profiles%'
);

-- Check for any remaining triggers on payments table
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND event_object_table = 'payments';
