const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val) acc[key.trim()] = val.join('=').trim().replace(/"/g, '');
  return acc;
}, {});

const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;

function isNewSupabaseApiKey(value) {
  return value.startsWith('sb_publishable_') || value.startsWith('sb_secret_');
}

function createSupabaseFetch(key) {
  return (input, init) => {
    const headers = new Headers(init?.headers);
    if (isNewSupabaseApiKey(key) && headers.get('Authorization') === `Bearer ${key}`) {
      headers.delete('Authorization');
    }
    headers.set('apikey', key);
    return fetch(input, { ...init, headers });
  };
}

const supabase = createClient(env.VITE_SUPABASE_URL, supabaseKey, {
  global: { fetch: createSupabaseFetch(supabaseKey) }
});

async function testSupabaseTable() {
  const { data, error } = await supabase.from('profiles').select('id').limit(1);
  if (error) {
    console.log("RESULT: ERROR", error);
  } else {
    console.log("RESULT: SUCCESS, Rows:", data.length);
  }
}

testSupabaseTable();
