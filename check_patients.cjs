const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val) acc[key.trim()] = val.join('=').trim().replace(/"/g, '');
  return acc;
}, {});
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(env.VITE_SUPABASE_URL, key, {
  global: { fetch: (input, init) => {
    const headers = new Headers(init?.headers);
    headers.delete('Authorization');
    headers.set('apikey', key);
    return fetch(input, { ...init, headers });
  }}
});
supabase.from('patients').select('*').limit(1).then(r => console.log('Patients:', r));
