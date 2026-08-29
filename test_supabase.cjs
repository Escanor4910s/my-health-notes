const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val) acc[key.trim()] = val.join('=').trim().replace(/"/g, '');
  return acc;
}, {});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseTable() {
  console.log("Checking if 'profiles' table exists...");
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .limit(1);

  if (error) {
    if (error.code === '42P01') {
      console.log("RESULT: TABLE_MISSING");
      console.error(error.message);
    } else {
      console.log("RESULT: ERROR");
      console.error(error);
    }
  } else {
    console.log("RESULT: SUCCESS");
    console.log("Table exists! Rows found (if any):", data.length);
  }
}

testSupabaseTable();
