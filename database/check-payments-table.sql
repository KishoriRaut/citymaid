-- Check the structure of the payments table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'payments' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if there's a payment_type column or similar
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'payments' 
  AND table_schema = 'public'
  AND (column_name LIKE '%type%' OR column_name LIKE '%kind%');

-- Check sample data to understand the structure
SELECT * FROM payments LIMIT 5;
