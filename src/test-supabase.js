// Test script to diagnose Supabase issues
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cokzjkjppfrnnrswxllk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNva3pqa2pwcGZybm5yc3d4bGxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MTQ5NTgsImV4cCI6MjA1Nzk5MDk1OH0._HZjNK8ng93WsH222HWuiGD63NjdOUk4zYy-t-wZ3iI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabase() {
  try {
    // Test 1: Check if we can connect to Supabase
    console.log('Test 1: Checking Supabase connection...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    console.log('Auth session:', authData);
    console.log('Auth error:', authError);
    
    // Test 2: Try to create a test user
    console.log('\nTest 2: Creating a test user...');
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'password123';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    console.log('Sign up data:', signUpData);
    console.log('Sign up error:', signUpError);
    
    if (signUpData?.user) {
      // Test 3: Try to create a profile for the test user
      console.log('\nTest 3: Creating a profile for the test user...');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: signUpData.user.id,
          full_name: 'Test User',
          company: 'Test Company',
          role: 'user',
          email: testEmail,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select();
      
      console.log('Profile data:', profileData);
      console.log('Profile error:', profileError);
      
      // Test 4: Try to read the profile
      console.log('\nTest 4: Reading the profile...');
      const { data: readProfileData, error: readProfileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', signUpData.user.id)
        .single();
      
      console.log('Read profile data:', readProfileData);
      console.log('Read profile error:', readProfileError);
    }
    
    // Test 5: Check the profiles table structure
    console.log('\nTest 5: Checking profiles table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    console.log('Table info:', tableInfo);
    console.log('Table error:', tableError);
    
  } catch (error) {
    console.error('Error in test script:', error);
  }
}

testSupabase(); 