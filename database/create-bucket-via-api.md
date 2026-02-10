# Create Payment-Proofs Bucket via API

If SQL Editor permissions are restricted, use this approach:

## Option 1: Supabase Dashboard (Recommended)

1. Go to Supabase Dashboard → Storage
2. Click "New bucket"
3. Name: `payment-proofs`
4. Check "Public bucket"
5. File size limit: 5242880 (5MB)
6. Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp, application/pdf
7. Create bucket
8. Go to bucket Settings → Create policies for public read and authenticated upload

## Option 2: Via REST API

Use your service role key to create bucket:

```bash
curl -X POST 'https://xwermvzetnztsxkfqjwe.supabase.co/storage/v1/bucket' \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "payment-proofs",
    "public": true,
    "file_size_limit": 5242880,
    "allowed_mime_types": ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"]
  }'
```

## Option 3: Contact Supabase Support

If neither approach works:
- Explain you need storage bucket creation permissions
- Mention you're trying to create "payment-proofs" bucket
- Request they enable storage features for your project

## After Bucket Creation

Once bucket exists, test payment proof upload:
1. Go to admin interface
2. Try uploading a payment receipt
3. Check if "View Proof" button works

The key issue is SQL Editor permissions - use Dashboard or API instead.
