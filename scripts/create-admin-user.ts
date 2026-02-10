import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  try {
    console.log('Creating admin user...');

    // Create the admin user
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'kishoriraut369@gmail.com',
      password: 'admin123k',
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        name: 'Admin User'
      }
    });

    if (error) {
      if (error.message.includes('already registered')) {
        console.log('✅ Admin user already exists');
        console.log('ℹ️  Please reset password manually in Supabase Dashboard or use the forgot password flow');
      } else {
        console.error('❌ Failed to create admin user:', error.message);
        return;
      }
    } else {
      console.log('✅ Admin user created successfully');
      console.log('📧 Email: kishoriraut369@gmail.com');
      console.log('🔑 Password: admin123k');
    }

    // Create profile record if needed
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: data.user.email!,
          role: 'admin',
          created_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('❌ Failed to create profile:', profileError.message);
      } else {
        console.log('✅ Admin profile created/updated');
      }
    }

    console.log('\n🎉 Admin setup complete!');
    console.log('You can now login with:');
    console.log('📧 Email: kishoriraut369@gmail.com');
    console.log('🔑 Password: admin123k');
    console.log('🌐 Access: /admin or /login');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

createAdminUser();
