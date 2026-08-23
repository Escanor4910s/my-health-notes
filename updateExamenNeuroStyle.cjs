const fs = require('fs');

let content = fs.readFileSync('src/components/Sections/ExamenNeuro.jsx', 'utf8');

// Fix the main container
content = content.replace('<div className="section-container">', '<div className="animate-fade-in glass-panel" style={{ padding: \'3rem\' }}>\n      <header className="section-header">');
content = content.replace('Examen Neurologique Complet\n      </h2>', 'Examen Neurologique Complet\n        </h2>\n      </header>');

// We need to inject the GlasgowPill component
const pillComponent = `
const GlasgowPill = ({ options, value, onChange, label }) => (
  <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {options.map(opt => (
        <button
          key={opt.val}
          onClick={() => onChange(opt.val)}
          style={{
            padding: '0.6rem 1.2rem',
            background: value == opt.val ? 'var(--primary)' : 'transparent',
            color: value == opt.val ? 'white' : 'var(--text-main)',
            border: \`1.5px solid \${value == opt.val ? 'var(--primary)' : 'var(--surface-border)'}\`,
            borderRadius: '24px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: value == opt.val ? 'bold' : '500',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: value == opt.val ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
          }}
          onMouseEnter={(e) => {
            if (value != opt.val) {
              e.target.style.borderColor = 'var(--primary)';
              e.target.style.color = 'var(--primary)';
            }
          }}
          onMouseLeave={(e) => {
            if (value != opt.val) {
              e.target.style.borderColor = 'var(--surface-border)';
              e.target.style.color = 'var(--text-main)';
            }
          }}
        >
          <span style={{ fontSize: '1.1rem', marginRight: '0.3rem' }}>{opt.val}</span> {opt.label}
        </button>
      ))}
    </div>
  </div>
);

export default function ExamenNeuro`;

content = content.replace('export default function ExamenNeuro', pillComponent);

// Now replace the <select> blocks
const selectBlockPattern = /<div style={{ display: 'grid', gridTemplateColumns: 'repeat\(auto-fit, minmax\(300px, 1fr\)\)', gap: '1rem', marginBottom: '2rem' }}>([\s\S]*?)<\/div>\s*<PremiumInput id="pupilles"/;

const replacementBlock = `<div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
            <GlasgowPill 
              label="Ouverture des yeux (Y)"
              value={getNestedData('glasgow', 'yeux')}
              onChange={(val) => setNestedData('glasgow', 'yeux', val)}
              options={[
                { val: 4, label: "Spontanée" },
                { val: 3, label: "À l'appel" },
                { val: 2, label: "À la douleur" },
                { val: 1, label: "Nulle" }
              ]}
            />
            <GlasgowPill 
              label="Réponse verbale (V)"
              value={getNestedData('glasgow', 'verbal')}
              onChange={(val) => setNestedData('glasgow', 'verbal', val)}
              options={[
                { val: 5, label: "Orientée" },
                { val: 4, label: "Confuse" },
                { val: 3, label: "Inappropriée" },
                { val: 2, label: "Incompréhensible" },
                { val: 1, label: "Nulle" }
              ]}
            />
            <GlasgowPill 
              label="Réponse motrice (M)"
              value={getNestedData('glasgow', 'moteur')}
              onChange={(val) => setNestedData('glasgow', 'moteur', val)}
              options={[
                { val: 6, label: "Obéit aux ordres" },
                { val: 5, label: "Localise la douleur" },
                { val: 4, label: "Évitement/retrait" },
                { val: 3, label: "Flexion (Décortication)" },
                { val: 2, label: "Extension (Décérébration)" },
                { val: 1, label: "Nulle" }
              ]}
            />
          </div>
          <PremiumInput id="pupilles"`;

content = content.replace(selectBlockPattern, replacementBlock);

fs.writeFileSync('src/components/Sections/ExamenNeuro.jsx', content, 'utf8');
console.log("Success");
