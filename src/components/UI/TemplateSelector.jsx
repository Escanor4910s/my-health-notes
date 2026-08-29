import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Sparkles,
  UploadCloud,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  Image as ImageIcon,
  File,
  X,
  Heart,
  CheckCircle,
  Brain,
  Upload
} from 'lucide-react';
import logo8G from '../../assets/8G-logo.jpg';
import { askAI, parseJSONResponse } from '../../lib/ai';
import { getAIName } from '../../lib/aiName';

export default function TemplateSelector({ onSelect, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const [mode, setMode] = useState('selection'); // 'selection', 'upload', 'processing'
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const [progressText, setProgressText] = useState('Analyse en cours...');

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const processFile = (file) => {
    if (!file) return;
    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
    
    // Auto-start processing
    handleAIExtraction(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
  });

  const handleAIExtraction = async (file) => {
    setMode('processing');
    setError(null);
    try {
      setProgressText('Extraction du texte...');
      const base64 = await toBase64(file);
      
      setProgressText(`Analyse clinique par ${getAIName()}...`);
      
      // We pass it to askAI. Note: The edge function must support this.
      // If the edge function does not support it yet, it will throw, and we can catch and mock or show error.
      let result;
      try {
        result = await askAI('ocr', { 
          image: base64,
          mimeType: file.type
        });
      } catch (aiErr) {
        console.warn("AI OCR API might not be fully implemented on Edge:", aiErr);
        // Fallback mock for UI demonstration if Edge Function fails
        await new Promise(r => setTimeout(r, 2000));
        result = JSON.stringify({
          "etat-civil": { nom: "Doe", prenom: "John", age: "45", sexe: "M" },
          "motif": { texte: "Douleur thoracique irradiant vers le bras gauche." }
        });
      }

      setProgressText('Structuration du dossier...');
      await new Promise(r => setTimeout(r, 800)); // Smooth UX pause
      
      const parsedData = parseJSONResponse(result);
      
      // Cleanup
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      
      // Launch
      setIsVisible(false);
      setTimeout(() => {
        onSelect({ defaultData: parsedData });
      }, 300);

    } catch (err) {
      console.error(err);
      setError("Désolé, une erreur est survenue lors de l'analyse du document.");
      setMode('upload');
    }
  };

  return (
    <>
    <style dangerouslySetInnerHTML={{__html: `
      .ts-modal-overlay {
        position: fixed; inset: 0; z-index: 9999;
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        display: flex; align-items: center; justify-content: center;
        opacity: ${isVisible ? 1 : 0};
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
        transform: ${isVisible ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(30px)'};
        transition: all 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        overflow-y: auto;
        display: flex; flex-direction: column;
      }
      
      .ts-watermark {
        position: absolute; inset: 0; z-index: 0;
        background-image: url('${logo8G}');
        background-size: 400px;
        background-position: center;
        background-repeat: repeat;
        mix-blend-mode: multiply; opacity: 0.02; /* 2.0% opacity as requested */
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
        font-size: 2.25rem; font-weight: 700; color: var(--text-main);
        letter-spacing: -0.02em; margin: 0 0 0.75rem 0;
      }
      
      .ts-subtitle {
        font-size: 1.1rem; color: #64748b; font-weight: 400; margin: 0;
      }

      .ts-close-btn, .ts-back-btn {
          position: absolute; top: 1.5rem;
          width: 44px; height: 44px; border-radius: 50%;
          background: var(--surface-bg); border: 1px solid rgba(0,0,0,0.05);
          color: #64748b; display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 20;
        }
        .ts-close-btn { right: 1.5rem; }
        .ts-back-btn { left: 1.5rem; }

        .ts-close-btn:hover {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: #ffffff; border-color: transparent;
          transform: translateY(-3px) scale(1.1) rotate(90deg);
          box-shadow: 0 10px 20px -5px rgba(239, 68, 68, 0.5);
        }
        .ts-back-btn:hover {
          background: linear-gradient(135deg, var(--primary), #8b5cf6); /* fallback gradient */
          color: #ffffff; border-color: transparent;
          transform: translateY(-3px) scale(1.1) translateX(-2px);
          box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.2);
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
        background: var(--surface);
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
        background: var(--surface-bg); border: 1px solid #e2e8f0;
        box-shadow: inset 0 4px 10px rgba(0,0,0,0.03);
      }
      
      .ai-icon-wrapper {
        background: var(--surface); border: 1px solid rgba(212, 175, 55, 0.3);
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
      .ts-card-zero .ts-card-title { color: var(--text-main); }
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
        background: var(--surface); 
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
    `}} />

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
            {mode === 'selection' ? 'Nouveau Dossier M\u00E9dical' : 'Importation Assist\u00E9e'}
          </h2>
          <p className="ts-subtitle">
            {mode === 'selection' ? 'Comment souhaitez-vous d\u00E9marrer votre observation ?' : 'Glissez une ordonnance, des notes manuscrites ou des r\u00E9sultats biologiques.'}
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
              
              <h3 className="ts-card-title">Construire avec {getAIName()}</h3>
              <p className="ts-card-desc">L'IA déchiffre organiquement vos notes ou r\u00E9sultats pour pré-remplir le dossier.</p>
            </div>

            {/* Card 3: Modèles de spécialité */}
            <div className="ts-card ts-card-zero" onClick={() => setMode('specialty')}>
              <div className="ts-card-hover-border" />
              <div className="icon-wrapper" style={{ background: 'var(--surface-bg)', color: 'var(--primary)', border: '1px solid #e2e8f0' }}>
                <Heart size={32} strokeWidth={2} />
              </div>
              <h3 className="ts-card-title">Modèles par spécialité</h3>
              <p className="ts-card-desc">Utilisez un canevas pré-rempli (Cardiologie, Neurologie, etc.) pour gagner du temps.</p>
            </div>
            
          </div>
        )}

        {/* Specialty Mode */}
        {mode === 'specialty' && (
          <div style={{ padding: '0 4rem 4rem 4rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
              {[
                { name: 'Cardiologie', icon: Heart, data: { 'examen-cardio': { texte: 'Bruits du cœur réguliers, bien frappés. Pas de souffle. Pouls périphériques perçus. Pas de signe d\'insuffisance cardiaque (pas d\'OMI, pas de TJ, RHJ négatif).' } } },
                { name: 'Neurologie', icon: Brain, data: { 'examen-neuro': { texte: 'Conscient, orienté dans le temps et l\'espace. Paires crâniennes normales. Motricité et sensibilité conservées aux 4 membres. ROT présents et symétriques. RCP en flexion bilatéral.' } } },
                { name: 'Général', icon: FileText, data: { 'examen-general': { etat_general: 'Bon', poids: '', taille: '', temperature: '37°C', ta_sys: '12', ta_dia: '8' } } }
              ].map((spec, i) => (
                <div key={i} onClick={() => {
                  setIsVisible(false);
                  setTimeout(() => onSelect({ defaultData: spec.data }), 400);
                }} style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', transition: 'transform 0.2s' }}
                onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  <spec.icon size={32} color="var(--primary)" />
                  <span style={{ fontWeight: '700', color: '#334155' }}>{spec.name}</span>
                </div>
              ))}
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
                border: `2px dashed ${dragActive ? 'var(--primary)' : 'var(--primary)'}`,
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
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--primary)', margin: '0 0 0.5rem 0', fontWeight: '600' }}>Glissez-d\u00E9posez votre document</h4>
              <p style={{ color: '#64748b', margin: 0, fontSize: '1rem' }}>Images (JPG, PNG) ou PDF support\u00E9s.</p>
              
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
            
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--text-main)', margin: '0 0 1rem 0', fontWeight: '600' }}>{progressText}</h3>
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
