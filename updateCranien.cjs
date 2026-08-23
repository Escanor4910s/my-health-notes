const fs = require('fs');

let content = fs.readFileSync('src/components/Sections/ExamenNeuro.jsx', 'utf8');

const targetPattern = /\{activeTab === 'cranien' && \([\s\S]*?<\/div>\s*\)\}/;

const replacementBlock = `{activeTab === 'cranien' && (
        <div className="animate-fade-in">
          <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>Paires Crâniennes (I à XII)</h3>
          
          <div style={{ marginBottom: '2rem' }}>
            <label className="radio-card-label" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid var(--surface-border)', borderRadius: '12px', background: 'var(--surface)', cursor: 'pointer', transition: 'all 0.2s ease' }}>
              <input 
                type="checkbox" 
                style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
                checked={!!data?.cranien_toutes_normales}
                onChange={(e) => updateData({ cranien_toutes_normales: e.target.checked })}
              />
              <span style={{ fontSize: '1rem', fontWeight: 600, color: data?.cranien_toutes_normales ? 'var(--primary)' : 'var(--text-main)' }}>Toutes les paires crâniennes sont normales</span>
            </label>
          </div>

          {!data?.cranien_toutes_normales && (
            <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <PremiumInput id="cranien_I" label="I - Nerf Olfactif" value={data?.cranien_I || ''} onChange={handleChange} />
              <PremiumInput id="cranien_II" label="II - Nerf Optique" value={data?.cranien_II || ''} onChange={handleChange} />
              <PremiumInput id="cranien_III" label="III - Moteur Oculaire Commun" value={data?.cranien_III || ''} onChange={handleChange} />
              <PremiumInput id="cranien_IV" label="IV - Nerf Pathétique" value={data?.cranien_IV || ''} onChange={handleChange} />
              <PremiumInput id="cranien_V" label="V - Nerf Trijumeau" value={data?.cranien_V || ''} onChange={handleChange} />
              <PremiumInput id="cranien_VI" label="VI - Moteur Oculaire Externe" value={data?.cranien_VI || ''} onChange={handleChange} />
              <PremiumInput id="cranien_VII" label="VII - Nerf Facial" value={data?.cranien_VII || ''} onChange={handleChange} />
              <PremiumInput id="cranien_VIII" label="VIII - Cochléo-vestibulaire" value={data?.cranien_VIII || ''} onChange={handleChange} />
              <PremiumInput id="cranien_IX" label="IX - Nerf Glosso-pharyngien" value={data?.cranien_IX || ''} onChange={handleChange} />
              <PremiumInput id="cranien_X" label="X - Nerf Pneumogastrique" value={data?.cranien_X || ''} onChange={handleChange} />
              <PremiumInput id="cranien_XI" label="XI - Nerf Spinal" value={data?.cranien_XI || ''} onChange={handleChange} />
              <PremiumInput id="cranien_XII" label="XII - Grand Hypoglosse" value={data?.cranien_XII || ''} onChange={handleChange} />
            </div>
          )}
        </div>
      )}`;

content = content.replace(targetPattern, replacementBlock);

// Update synthesize function to catch the 12 nerves
const generateSynthesisOld = `if (data?.cranien_notes) parts.push(\`Paires crâniennes: \${data.cranien_notes}\`);`;

const generateSynthesisNew = `if (data?.cranien_toutes_normales) {
      parts.push("Paires crâniennes normales.");
    } else {
      let craniens = [];
      const roms = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
      roms.forEach(rom => {
        if (data[\`cranien_\${rom}\`]) craniens.push(\`\${rom}: \${data[\`cranien_\${rom}\`]}\`);
      });
      if (craniens.length > 0) parts.push(\`Anomalies crâniennes: \${craniens.join(', ')}.\`);
    }
    
    if (data?.cranien_notes) parts.push(\`Paires crâniennes (Notes): \${data.cranien_notes}\`);`;

content = content.replace(generateSynthesisOld, generateSynthesisNew);

fs.writeFileSync('src/components/Sections/ExamenNeuro.jsx', content, 'utf8');
console.log("Success");
