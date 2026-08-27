const fs = require('fs');
const path = 'C:\\Users\\7MAKSACOD PC\\.gemini\\antigravity\\scratch\\medical-observation\\src\\components\\UI\\TemplateSelector.jsx';
let content = fs.readFileSync(path, 'utf8');

// Ensure the logo is imported
if (!content.includes("import logo8G")) {
    content = content.replace("import { askAI", "import logo8G from '../../assets/8G-logo.jpg';\nimport { askAI");
}

const newReturn = `  return (
    <>
    <style dangerouslySetInnerHTML={{__html: \`
      .ts-modal-overlay {
        position: fixed; inset: 0; z-index: 9999;
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        display: flex; align-items: center; justify-content: center;
        opacity: \${isVisible ? 1 : 0};
        transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        padding: 1rem; /* Less padding on mobile */
      }
      
      .ts-glass-panel {
        width: 100%; max-width: 1000px; height: 90vh; /* Match AccountModal exactly */
        position: relative;
        background: rgba(255, 255, 255, 0.90);
        border-radius: 24px;
        box-shadow: 
          inset 0 0 0 1px rgba(255, 255, 255, 1),
          0 25px 50px -12px rgba(0, 0, 0, 0.25),
          0 0 0 1px rgba(0,0,0,0.05);
        transform: \${isVisible ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(30px)'};
        transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        overflow-y: auto;
        display: flex; flex-direction: column;
      }
      
      .ts-watermark {
        position: absolute; inset: 0; z-index: 0;
        background-image: url('\${logo8G}');
        background-size: 400px;
        background-position: center;
        background-repeat: repeat;
        mix-blend-mode: multiply; opacity: 0.015; /* 1.5% opacity as requested */
        pointer-events: none;
      }

      .ts-header {
        position: relative; z-index: 10;
        padding: 2.5rem 3rem 1rem 3rem;
        text-align: center;
        flex-shrink: 0;
      }
      
      .ts-title {
        font-family: var(--font-display);
        font-size: 2.25rem; font-weight: 700; color: #1e293b;
        letter-spacing: -0.02em; margin: 0 0 0.75rem 0;
      }
      
      .ts-subtitle {
        font-size: 1.1rem; color: #64748b; font-weight: 400; margin: 0;
      }

      .ts-close-btn {
        position: absolute; right: 1.5rem; top: 1.5rem;
        width: 44px; height: 44px; border-radius: 50%;
        background: #f1f5f9; border: 1px solid rgba(0,0,0,0.05);
        color: #64748b; display: flex; align-items: center; justify-content: center;
        cursor: pointer; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        z-index: 20;
      }
      .ts-close-btn:hover {
        background: var(--primary); color: #ffffff; border-color: var(--primary);
        transform: translateY(-3px) scale(1.1) rotate(90deg);
        box-shadow: 0 10px 20px -5px rgba(var(--primary-rgb, 200,0,0), 0.4);
      }

      /* Premium Choice Cards Container */
      .ts-cards-grid {
        display: flex; gap: 2rem;
        padding: 1rem 4rem 4rem 4rem; position: relative; z-index: 10;
        flex: 1; min-height: 0;
      }

      /* The Card Base - Now more horizontal/elegant */
      .ts-card {
        flex: 1;
        position: relative; border-radius: 24px;
        background: #ffffff;
        border: 1px solid rgba(0,0,0,0.04);
        box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
        cursor: pointer; overflow: hidden;
        transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        padding: 2.5rem 2rem; text-align: center;
      }
      .ts-card::after {
        content: ''; position: absolute; inset: 0; border-radius: 24px;
        box-shadow: inset 0 0 0 1px rgba(255,255,255,1); pointer-events: none;
      }
      
      .ts-card-hover-border {
        position: absolute; inset: 0; border-radius: 24px;
        border: 2px solid transparent; transition: all 0.5s ease;
        pointer-events: none; z-index: 5;
      }
      
      .ts-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 30px 60px -15px rgba(0,0,0,0.12);
      }

      /* Card: Manual (Zero) */
      .ts-card-zero:hover .ts-card-hover-border { border-color: #cbd5e1; }
      .ts-card-zero:hover .zero-icon-wrapper { transform: scale(1.08); }
      
      /* Card: 8G AI */
      .ts-card-ai { background: linear-gradient(160deg, #ffffff 0%, #fdfbf7 100%); }
      .ts-card-ai:hover .ts-card-hover-border { border-color: var(--primary); }
      .ts-card-ai:hover .ai-icon-wrapper { transform: scale(1.08); }
      .ts-card-ai:hover .mandala-mesh { opacity: 1; transform: scale(1); }

      /* Icons wrappers */
      .icon-wrapper {
        width: 90px; height: 90px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        margin-bottom: 2rem; position: relative;
        transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      }
      
      .zero-icon-wrapper {
        background: #f8fafc; border: 1px solid #e2e8f0;
        box-shadow: inset 0 4px 10px rgba(0,0,0,0.03);
      }
      
      .ai-icon-wrapper {
        background: #ffffff; border: 1px solid rgba(212, 175, 55, 0.3);
        box-shadow: 0 0 30px rgba(212, 175, 55, 0.15), inset 0 4px 10px rgba(212, 175, 55, 0.05);
      }

      /* Animated Mandala Mesh Background */
      .mandala-mesh {
        position: absolute; inset: -50%; z-index: 0;
        background: radial-gradient(circle at center, rgba(var(--primary-rgb, 139,111,71), 0.08) 0%, transparent 60%);
        opacity: 0; transform: scale(0.8);
        transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        pointer-events: none;
      }

      /* Mandala SVG Animations */
      .mandala-slow { animation: ts-spin 24s linear infinite; transform-origin: center; }
      .mandala-fast { animation: ts-spinReverse 16s linear infinite; transform-origin: center; }
      
      @keyframes ts-spin { 100% { transform: rotate(360deg); } }
      @keyframes ts-spinReverse { 100% { transform: rotate(-360deg); } }

      .ts-card-title {
        font-family: var(--font-display);
        font-size: 1.5rem; font-weight: 700; margin: 0 0 0.75rem 0; letter-spacing: -0.02em;
        position: relative; z-index: 2;
      }
      .ts-card-zero .ts-card-title { color: #1e293b; }
      .ts-card-ai .ts-card-title {
        background: linear-gradient(135deg, var(--primary) 0%, #b45309 100%);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      }

      .ts-card-desc {
        font-size: 1rem; color: #64748b; line-height: 1.5;
        margin: 0; max-width: 280px; position: relative; z-index: 2;
      }

      /* Responsive rules */
      @media (max-width: 768px) {
        .ts-cards-grid {
          flex-direction: column;
          padding: 1rem 1.5rem 2rem 1.5rem;
          gap: 1.5rem;
        }
        .ts-header {
          padding: 2rem 1.5rem 1rem 1.5rem;
        }
        .ts-title {
          font-size: 1.75rem;
        }
        .ts-card {
          padding: 2rem 1.5rem;
        }
        .icon-wrapper {
          width: 70px; height: 70px;
          margin-bottom: 1.5rem;
        }
      }

      /* Upload Button */
      .ts-upload-btn {
        margin-top: 2.5rem; 
        background: #ffffff; 
        color: var(--primary); 
        border: 2px solid var(--primary); 
        padding: 0.85rem 2.5rem; 
        border-radius: 99px; 
        font-size: 1.05rem; 
        font-weight: 600; 
        pointer-events: none; 
        box-shadow: 0 4px 10px rgba(0,0,0,0.02);
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
      
      .upload-zone:hover .ts-upload-btn {
        background: var(--primary);
        color: #ffffff;
        box-shadow: 0 8px 20px -5px rgba(var(--primary-rgb, 200,0,0), 0.4);
        transform: translateY(-2px);
      }
    \`} />

    <div className="ts-modal-overlay" onClick={handleClose}>
      <div className="ts-glass-panel" onClick={e => e.stopPropagation()}>
        <div className="ts-watermark" />
        
        <div className="ts-header">
          {mode !== 'selection' && (
            <button 
              onClick={() => setMode('selection')}
              style={{ position: 'absolute', left: '1.5rem', top: '1.5rem', width: '44px', height: '44px', borderRadius: '50%', background: 'transparent', border: '1px solid #e2e8f0', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', zIndex: 20 }}
            >
              <ChevronLeft size={24} />
            </button>
          )}
          
          <h2 className="ts-title">
            {mode === 'selection' ? 'Nouveau Dossier Médical' : 'Importation IA (8G)'}
          </h2>
          <p className="ts-subtitle">
            {mode === 'selection' ? 'Comment souhaitez-vous démarrer votre observation ?' : 'Glissez une ordonnance, des notes manuscrites ou des résultats biologiques.'}
          </p>

          <button onClick={handleClose} className="ts-close-btn" title="Fermer">
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>

        {mode === 'selection' && (
          <div className="ts-cards-grid">
            
            {/* Card 1: Zero */}
            <div className="ts-card ts-card-zero" onClick={() => {
              setIsVisible(false);
              setTimeout(() => onSelect({ defaultData: {} }), 400);
            }}>
              <div className="ts-card-hover-border" />
              
              <div className="icon-wrapper zero-icon-wrapper">
                <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M25 15 H65 L85 35 V85 C85 87.7614 82.7614 90 80 90 H25 C22.2386 90 20 87.7614 20 85 V20 C20 17.2386 22.2386 15 25 15 Z" stroke="#475569" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M65 15 V35 H85" stroke="#475569" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M35 50 H70" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M35 65 H55" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              
              <h3 className="ts-card-title">Construire à partir de zéro</h3>
              <p className="ts-card-desc">Ouvrez un dossier vierge et saisissez manuellement vos observations de A à Z.</p>
            </div>

            {/* Card 2: 8G */}
            <div className="ts-card ts-card-ai" onClick={() => setMode('upload')}>
              <div className="mandala-mesh" />
              <div className="ts-card-hover-border" />
              
              <div className="icon-wrapper ai-icon-wrapper">
                <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* Slow outer mandala */}
                  <svg className="mandala-slow" width="60" height="60" viewBox="0 0 100 100" fill="none" stroke="var(--primary)" style={{ position: 'absolute' }}>
                    <path d="M50 5 C 75 25, 95 50, 95 50 C 75 75, 50 95, 50 95 C 25 75, 5 50, 5 50 C 25 25, 50 5, 50 5 Z" strokeWidth="1.5" strokeDasharray="3 5" opacity="0.6"/>
                    <path d="M50 15 C 65 35, 85 50, 85 50 C 65 65, 50 85, 50 85 C 35 65, 15 50, 15 50 C 35 35, 50 15, 50 15 Z" strokeWidth="1" transform="rotate(45 50 50)" opacity="0.4"/>
                    <circle cx="50" cy="50" r="42" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.3" />
                  </svg>
                  {/* Fast inner core */}
                  <svg className="mandala-fast" width="28" height="28" viewBox="0 0 100 100" fill="none" stroke="var(--primary)" style={{ position: 'absolute' }}>
                    <polygon points="50,5 95,50 50,95 5,50" strokeWidth="3" />
                    <circle cx="50" cy="50" r="16" fill="var(--primary)" opacity="0.1" />
                    <circle cx="50" cy="50" r="8" fill="var(--primary)" />
                  </svg>
                </div>
              </div>
              
              <h3 className="ts-card-title">Construire avec 8G</h3>
              <p className="ts-card-desc">L'IA déchiffre organiquement vos notes ou résultats pour pré-remplir le dossier.</p>
            </div>
            
          </div>
        )}

        {/* Upload Mode */}
        {mode === 'upload' && (
          <div style={{ padding: '0 4rem 4rem 4rem', height: '100%', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <div 
              className="upload-zone"
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              style={{
                flex: 1,
                border: \`2px dashed \${dragActive ? 'var(--primary)' : 'var(--primary)'}\`,
                borderRadius: '24px',
                background: dragActive ? 'rgba(var(--primary-rgb, 139,111,71), 0.04)' : 'rgba(var(--primary-rgb, 139,111,71), 0.01)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.3s ease', position: 'relative', cursor: 'pointer'
              }}
            >
              <input
                type="file"
                onChange={handleChange}
                accept="image/*,application/pdf"
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 10 }}
              />
              
              <UploadCloud size={64} color="var(--primary)" style={{ marginBottom: '1.5rem', transition: 'transform 0.3s', transform: dragActive ? 'scale(1.1)' : 'scale(1)' }} />
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--primary)', margin: '0 0 0.5rem 0', fontWeight: '600' }}>Glissez-déposez votre document</h4>
              <p style={{ color: '#64748b', margin: 0, fontSize: '1rem' }}>Images (JPG, PNG) ou PDF supportés.</p>
              
              <button className="ts-upload-btn">
                Parcourir les fichiers
              </button>
            </div>
            {error && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fee2e2', color: '#ef4444', borderRadius: '12px', textAlign: 'center', fontSize: '1rem', border: '1px solid #fecaca' }}>
                {error}
              </div>
            )}
          </div>
        )}

        {/* Processing Mode */}
        {mode === 'processing' && (
          <div style={{ padding: '0 4rem 4rem 4rem', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '3rem' }}>
              <div style={{ position: 'absolute', inset: 0, border: '2px solid rgba(var(--primary-rgb, 200,0,0), 0.2)', borderRadius: '50%' }}></div>
              <div style={{ position: 'absolute', inset: '-2px', border: '2px solid transparent', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'ts-spin 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite' }}></div>
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <File size={40} color="var(--primary)" opacity={0.8} />
              )}
            </div>
            
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: '#1e293b', margin: '0 0 1rem 0', fontWeight: '600' }}>{progressText}</h3>
            <p style={{ color: '#64748b', maxWidth: '400px', textAlign: 'center', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Veuillez patienter pendant que l'intelligence artificielle structure vos informations cliniques.
            </p>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
`;

const match = content.indexOf('  return (');
if (match !== -1) {
  const updatedContent = content.substring(0, match) + newReturn;
  fs.writeFileSync(path, updatedContent);
  console.log("Success");
} else {
  console.log("Error finding return");
}
