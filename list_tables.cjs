const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val) acc[key.trim()] = val.join('=').trim().replace(/"/g, '');
  return acc;
}, {});

const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const url = env.VITE_SUPABASE_URL + '/rest/v1/';

fetch(url, {
  headers: {
    'apikey': key,
    'Authorization': `Bearer ${key}`
  }
})
.then(res => res.json())
.then(data => {
  console.log("Exposed Paths:");
  console.log(Object.keys(data.paths || {}));
})
.catch(err => console.error(err));
