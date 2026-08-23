const fs = require('fs');

let hm = fs.readFileSync('src/components/Sections/HistoireMaladie.jsx', 'utf8');

// The line containing the <button> for Générer un brouillon starts with:
// className="chip-btn" 
// and has Edit3 inside. Let's find it.
const lines = hm.split('\n');

let buttonStartLine = -1;
let buttonEndLine = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('G') && lines[i].includes('n') && lines[i].includes('rer un brouillon') && lines[i].includes('<Edit3')) {
    buttonEndLine = i + 1; // because it ends with </button>
    // trace up to find the button tag
    let j = i;
    while (j > 0 && !lines[j].includes('<button')) {
      j--;
    }
    buttonStartLine = j;
    break;
  }
}

if (buttonStartLine !== -1 && buttonEndLine !== -1) {
  // We want to wrap the button in a div and add undo/redo buttons before it.
  // First, we extract the button block.
  let buttonLines = lines.slice(buttonStartLine, buttonEndLine);
  
  // Replace className="chip-btn" with className="premium-tag"
  for (let i = 0; i < buttonLines.length; i++) {
    if (buttonLines[i].includes('className="chip-btn"')) {
      buttonLines[i] = buttonLines[i].replace('className="chip-btn"', 'className="premium-tag"');
    }
    if (buttonLines[i].includes('style={{ display: \'flex\'')) {
      // enhance styling
      buttonLines[i] = buttonLines[i].replace("style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}", "style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', borderColor: 'var(--primary)' }}");
    }
  }

  const undoRedoInject = `          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button 
              type="button" 
              className="premium-tag"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              title="Annuler (Retour en arrire)"
              style={{ padding: '8px', opacity: historyIndex <= 0 ? 0.5 : 1, cursor: historyIndex <= 0 ? 'default' : 'pointer', background: 'var(--surface-border)', color: 'var(--noir)' }}
            >
              <Undo size={16} />
            </button>
            <button 
              type="button" 
              className="premium-tag"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              title="Rtablir (Retour en avant)"
              style={{ padding: '8px', opacity: historyIndex >= history.length - 1 ? 0.5 : 1, cursor: historyIndex >= history.length - 1 ? 'default' : 'pointer', background: 'var(--surface-border)', color: 'var(--noir)' }}
            >
              <Redo size={16} />
            </button>`;
            
  // insert before buttonStartLine
  lines.splice(buttonStartLine, 0, undoRedoInject);
  // because we inserted 1 element (a multi-line string), the buttonLines indices shift by 1
  buttonEndLine += 1;
  // insert the closing div after buttonEndLine
  lines.splice(buttonEndLine, 0, `          </div>`);

  // also replace the button lines
  for (let i = 0; i < buttonLines.length; i++) {
    lines[buttonStartLine + 1 + i] = buttonLines[i];
  }

  fs.writeFileSync('src/components/Sections/HistoireMaladie.jsx', lines.join('\n'), 'utf8');
  console.log("Success");
} else {
  console.log("Button not found");
}
