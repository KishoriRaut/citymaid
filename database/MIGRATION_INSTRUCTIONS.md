# Database Migration Instructions

## Add Payment Verification Fields

To add the `customer_name` and `receipt_url` columns to the `payments` table:

### Option 1: Run Migration SQL (Recommended)

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Open `database/migrations/add-payment-verification-fields.sql`
5. Copy and paste the entire contents into the SQL Editor
6. Click **Run** (or press `Ctrl+Enter`)

The migration is idempotent - it's safe to run multiple times. It will only add the columns if they don't already exist.

### Option 2: Manual SQL

If you prefer to run the commands manually:

```sql
-- Add customer_name column
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS customer_name TEXT;

-- Add receipt_url column
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS receipt_url TEXT;
```

### Verify Migration

After running the migration, verify the columns were added:

```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'payments'
  AND column_name IN ('customer_name', 'receipt_url')
ORDER BY column_name;
```

You should see both `customer_name` and `receipt_url` columns listed.

### Troubleshooting

If you get an error about permissions:
- Make sure you're using the SQL Editor in Supabase Dashboard (not a client connection)
- The SQL Editor uses your project's service role key automatically

If columns already exist:
- The migration is idempotent, so running it again won't cause errors
- You can check existing columns with the verification query above
