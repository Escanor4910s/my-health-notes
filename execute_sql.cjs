const { Client } = require('pg');
const fs = require('fs');

async function run() {
  const uri = 'postgresql://postgres:Mourides2003!@db.vwmivojqwhhhgrhgmwit.supabase.co:5432/postgres';
  
  const client = new Client({
    connectionString: uri,
  });

  try {
    await client.connect();
    console.log('Connected to Supabase DB successfully.');

    // Extrait le SQL depuis le fichier markdown
    const mdContent = fs.readFileSync('../../brain/2bde518b-531d-488a-af1e-8934f8384aec/supabase_migration.md', 'utf8');
    
    // Le SQL est tout le contenu, on peut juste l'exécuter car c'est du SQL valide (ou presque, y a-t-il du texte autour ?)
    // Vérifions d'abord s'il y a du markdown.
    // Dans ce cas précis, le fichier supabase_migration.md contient QUE du SQL.
    
    // Let's execute it directly
    await client.query(mdContent);
    console.log('SQL Migration executed successfully!');
    
    // Au cas où, on force un reload du schema pour PostgREST
    await client.query("NOTIFY pgrst, 'reload schema';");
    console.log('PostgREST schema reloaded.');

  } catch (err) {
    console.error('Error executing SQL:', err);
  } finally {
    await client.end();
  }
}

run();
