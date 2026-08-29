import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials in .env");
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
