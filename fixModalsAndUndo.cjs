const fs = require('fs');

// ----------------------------------------------------
// 1. UPDATE HistoireMaladie.jsx
// ----------------------------------------------------
let hm = fs.readFileSync('src/components/Sections/HistoireMaladie.jsx', 'utf8');

// Add createPortal to import
hm = hm.replace("import React, { useState } from 'react';", "import React, { useState, useEffect } from 'react';\nimport { createPortal } from 'react-dom';");
// Add Undo, Redo icons
hm = hm.replace("ChevronDown, ChevronUp, Edit3, Save, X, Settings, Check, Activity, FileText", "ChevronDown, ChevronUp, Edit3, Save, X, Settings, Check, Activity, FileText, Undo, Redo");

// Add history state inside the component
const history_state_inject = `
  const synthese = data?.synthese_narrative || '';
  const [history, setHistory] = useState([synthese]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const handleSyntheseChange = (val) => {
    updateData({ synthese_narrative: val });
  };
  
  // Track external changes or typing with a simple debounce-like or interval logic for history
  // Actually, let's just push to history on blur or after 1 second of inactivity to avoid storing every character
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (history[historyIndex] !== synthese) {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(synthese);
        // keep last 50 edits
        if (newHistory.length > 50) newHistory.shift();
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    }, 1000); // 1s debounce
    return () => clearTimeout(timeout);
  }, [synthese, history, historyIndex]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      updateData({ synthese_narrative: prev });
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      updateData({ synthese_narrative: next });
    }
  };
`;

// Replace `const synthese = data?.synthese_narrative || '';` with the full history block
hm = hm.replace("  const synthese = data?.synthese_narrative || '';", history_state_inject);

// Update textarea onChange
hm = hm.replace("onChange={(e) => updateData({ synthese_narrative: e.target.value })}", "onChange={(e) => handleSyntheseChange(e.target.value)}");

// Update the "Générer un brouillon" button and add Undo/Redo
const old_brouillon_block = `        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h4 style={{ margin: 0, color: 'var(--primary)' }}>Synthse narrative</h4>
          <button 
            type="button" 
            className="btn" 
            onClick={() => {
              const brouillon = \`Patient se prsentant pour \${data?.motif_principal || 'motif non prcis'}. 

[Rsum des signes fonctionnels rcurrents et de l'volution]

[Facteurs aggravants/calmants prdominants]\`;
              updateData({ synthese_narrative: brouillon });
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            <Edit3 size={14} /> Gnrer un brouillon
          </button>
        </div>`;

const new_brouillon_block = `        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h4 style={{ margin: 0, color: 'var(--primary)' }}>Synthse narrative</h4>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
            </button>
            <button 
              type="button" 
              className="premium-tag" 
              onClick={() => {
                const brouillon = \`Patient se prsentant pour \${data?.motif_principal || 'motif non prcis'}. 

[Rsum des signes fonctionnels rcurrents et de l'volution]

[Facteurs aggravants/calmants prdominants]\`;
                updateData({ synthese_narrative: brouillon });
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', borderColor: 'var(--primary)' }}
            >
              <Edit3 size={14} /> Gnrer un brouillon
            </button>
          </div>
        </div>`;

hm = hm.replace(old_brouillon_block, new_brouillon_block);

// Update Tag Manager Modal to use createPortal
// Search for `{isManagerOpen && (` and `)}` block
const tag_manager_start = `{isManagerOpen && (`;
const portal_start = `{isManagerOpen && createPortal(`;

// Just replace the start, and we must replace the ending. We can use a regex or string replacement.
hm = hm.replace("{isManagerOpen && (", "{isManagerOpen && createPortal(");
hm = hm.replace("        </div>\n      )}\n    </div>", "        </div>\n      ), document.body)}\n    </div>");

fs.writeFileSync('src/components/Sections/HistoireMaladie.jsx', hm, 'utf8');

// ----------------------------------------------------
// 2. UPDATE Antecedents.jsx
// ----------------------------------------------------
let ant = fs.readFileSync('src/components/Sections/Antecedents.jsx', 'utf8');
// Add createPortal
ant = ant.replace("import React, { useState } from 'react';", "import React, { useState } from 'react';\nimport { createPortal } from 'react-dom';");

// Convert `{isManagerOpen && (` to portal
ant = ant.replace("{isManagerOpen && (", "{isManagerOpen && createPortal(");
ant = ant.replace("        </div>\n      )}\n    </div>", "        </div>\n      ), document.body)}\n    </div>");

fs.writeFileSync('src/components/Sections/Antecedents.jsx', ant, 'utf8');

// ----------------------------------------------------
// 3. FIX index.css Z-INDEX
// ----------------------------------------------------
let css = fs.readFileSync('src/index.css', 'utf8');
css = css.replace("z-index: 1000;", "z-index: 999999;");
fs.writeFileSync('src/index.css', css, 'utf8');

console.log("Modals portalized and Undo/Redo added.");
