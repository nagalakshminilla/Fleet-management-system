const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testConnection() {
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );
    
    console.log('Testing Supabase connection...');
    console.log('URL:', process.env.SUPABASE_URL);
    
    // Test query
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Connection failed:', error.message);
    } else {
      console.log('✅ Connection successful!');
      console.log('Tables are ready.');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testConnection();