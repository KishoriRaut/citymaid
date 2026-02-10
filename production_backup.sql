-- Table Structures
CREATE TABLE contact_unlock_requests (id bigint, created_at timestamp with time zone DEFAULT now(), post_id uuid, user_id uuid, visitor_id text, user_name text, user_phone text, user_email text, contact_preference text DEFAULT 'phone'::text, status text DEFAULT 'pending'::text, payment_proof text, transaction_id text, amount integer DEFAULT 3000, payment_method text, delivery_status text DEFAULT 'pending'::text, delivery_notes text, updated_at timestamp with time zone DEFAULT now());

CREATE TABLE payments (id uuid DEFAULT gen_random_uuid(), post_id uuid, visitor_id text, amount integer DEFAULT 399, method text, reference_id text, customer_name text, receipt_url text, status text DEFAULT 'pending'::text, created_at timestamp with time zone DEFAULT now());

CREATE TABLE posts (id uuid DEFAULT gen_random_uuid(), post_type text, work text, time text, place text, salary text, contact text, photo_url text, status text DEFAULT 'pending'::text, created_at timestamp with time zone DEFAULT now(), details text, employee_photo text, homepage_payment_status text DEFAULT 'unpaid'::text);

CREATE TABLE profiles (id uuid, email text, role text DEFAULT 'user'::text, created_at timestamp with time zone DEFAULT now(), updated_at timestamp with time zone DEFAULT now());

CREATE TABLE users (id uuid DEFAULT uuid_generate_v4(), email character varying(255), password character varying(255), created_at timestamp with time zone DEFAULT now(), updated_at timestamp with time zone DEFAULT now());

-- Data will be added here from COPY commands