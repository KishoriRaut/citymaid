// Debug script to test Supabase authentication
const { createClient } = require('@supabase/supabase-js');

// Load environment variables manually
const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...values] = trimmed.split('=');
        if (key && values.length > 0) {
          process.env[key.trim()] = values.join('=').trim();
        }
      }
    });
  } catch (error) {
    console.error('Could not load .env.local:', error.message);
  }
}

loadEnvFile();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Debugging Supabase Authentication...');
console.log('URL:', supabaseUrl);
console.log('Anon Key:', supabaseAnonKey ? 'Present' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testEmailAuth() {
  try {
    console.log('\n📧 Testing email OTP...');
    
    const { data, error } = await supabase.auth.signInWithOtp({
      email: 'test@example.com',
      options: {
        emailRedirectTo: 'http://localhost:3001/auth/callback'
      }
    });

    if (error) {
      console.error('❌ Error:', error);
      console.error('Status:', error.status);
      console.error('Message:', error.message);
      
      // Check for specific error patterns
      if (error.message?.includes('Email provider is not enabled')) {
        console.log('\n💡 SOLUTION: Enable email provider in Supabase dashboard');
        console.log('1. Go to Authentication → Settings → Email');
        console.log('2. Toggle "Enable Email provider" to ON');
        console.log('3. Leave SMTP fields blank for development');
        console.log('4. Add redirect URLs: http://localhost:3001/auth/callback');
      }
    } else {
      console.log('✅ Success! Email should be sent.');
      console.log('Data:', data);
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testEmailAuth();
