const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testSignup() {
  const { data, error } = await supabase.auth.signUp({
    email: 'test' + Date.now() + '@example.com',
    password: 'password123',
    options: { data: { name: 'Test User' } }
  });
  console.log('Error:', error);
  console.log('Data user:', data?.user?.id);
  console.log('Data session:', data?.session);
}

testSignup();
