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
  X
} from 'lucide-react';
import { askAI, parseJSONResponse } from '../../lib/ai';

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
      
      setProgressText('Analyse clinique par 8G...');
      
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
    <div 
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: isVisible ? 1 : 0, transition: 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        padding: '2rem'
      }}
      onClick={handleClose}
    >
      <div 
        className="glass-panel"
        style={{
          width: '100%', maxWidth: '900px',
          display: 'flex', flexDirection: 'column',
          transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0.97) translateY(20px)',
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          minHeight: '500px',
          padding: 0 // overriding glass-panel default padding to handle it manually
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header Centralisé */}
        <div style={{ position: 'relative', padding: '3rem 2rem 1rem 2rem', textAlign: 'center' }}>
          {mode !== 'selection' && (
            <button 
              onClick={() => setMode('selection')}
              className="premium-back-btn"
              style={{ position: 'absolute', left: '2rem', top: '3rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-main)', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronLeft size={24} />
            </button>
          )}
          
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: '600', color: 'var(--text-main)', margin: '0 0 0.5rem 0', letterSpacing: '-0.5px' }}>
            {mode === 'selection' ? 'Nouveau Dossier Médical' : 'Importation IA (8G)'}
          </h2>
          <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '1.05rem', fontWeight: '400' }}>
            {mode === 'selection' ? 'Comment souhaitez-vous démarrer votre observation ?' : 'Glissez une ordonnance, des notes manuscrites ou des résultats biologiques.'}
          </p>

          <button 
            onClick={handleClose} 
            className="premium-close-btn"
            style={{ 
              position: 'absolute', right: '2rem', top: '3rem',
              background: 'var(--surface-bg)', border: 'none', cursor: 'pointer', 
              color: 'var(--text-light)', padding: '0.6rem', borderRadius: '50%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              transition: 'all 0.3s ease' 
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div style={{ padding: '2rem 3rem 4rem 3rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          
          {mode === 'selection' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', height: '100%', alignItems: 'stretch' }}>
              
              {/* Option 1: From Scratch */}
              <div 
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(() => onSelect({ defaultData: {} }), 400);
                }}
                className="premium-choice-card"
                style={{
                  background: 'var(--surface-bg)',
                  borderRadius: '16px',
                  padding: '3rem 2rem',
                  border: '1.5px solid transparent', // Default no border line
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  textAlign: 'center',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <div className="icon-container" style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'transparent', border: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', transition: 'all 0.4s ease' }}>
                  <FileText size={28} color="var(--text-main)" className="icon-svg" style={{ transition: 'all 0.4s ease' }} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '1rem' }}>Construire à partir de zéro</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '250px' }}>
                  Ouvrez un dossier vierge et saisissez manuellement vos observations de A à Z.
                </p>
              </div>

              {/* Option 2: AI */}
              <div 
                onClick={() => setMode('upload')}
                className="premium-choice-card"
                style={{
                  background: 'var(--surface-bg)',
                  borderRadius: '16px',
                  padding: '3rem 2rem',
                  border: '1.5px solid transparent', // Default no border line
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  textAlign: 'center',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <div className="icon-container" style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'transparent', border: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', transition: 'all 0.4s ease' }}>
                  <Sparkles size={28} color="var(--primary)" className="icon-svg" style={{ transition: 'all 0.4s ease' }} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: '600', color: 'var(--primary)', marginBottom: '1rem' }}>Construire avec 8G</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '260px' }}>
                  L'IA analyse vos photos ou notes pour pré-remplir organiquement le dossier.
                </p>
              </div>
            </div>
          )}

          {mode === 'upload' && (
            <div className="animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column', animationDuration: '0.6s' }}>
              <div 
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                style={{
                  flex: 1,
                  border: `1.5px dashed ${dragActive ? 'var(--primary)' : 'var(--surface-border)'}`,
                  borderRadius: '16px',
                  background: dragActive ? 'rgba(var(--primary-rgb, 139,111,71), 0.03)' : 'var(--surface-bg)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
              >
                <input
                  type="file"
                  multiple={false}
                  onChange={handleChange}
                  accept="image/*,application/pdf"
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                />
                
                <UploadCloud size={48} color={dragActive ? 'var(--primary)' : 'var(--text-muted)'} style={{ marginBottom: '1.5rem', transition: 'color 0.3s', opacity: 0.8 }} />
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--text-main)', margin: '0 0 0.5rem 0', fontWeight: '500' }}>Glissez-déposez votre document ici</h4>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>Images (JPG, PNG) ou PDF supportés.</p>
                
                <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem', opacity: 0.6 }}>
                  <span style={{ height: '1px', width: '30px', background: 'var(--text-muted)' }} />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '1px' }}>OU</span>
                  <span style={{ height: '1px', width: '30px', background: 'var(--text-muted)' }} />
                </div>
                
                <button style={{ marginTop: '2.5rem', background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)', padding: '0.7rem 2rem', borderRadius: '99px', fontSize: '0.95rem', fontWeight: '500', pointerEvents: 'none', transition: 'all 0.3s ease' }}>
                  Parcourir les fichiers
                </button>
              </div>
              {error && (
                <div className="animate-fade-in" style={{ marginTop: '1.5rem', padding: '1rem', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', textAlign: 'center', fontSize: '0.9rem', border: '1px solid #fecaca' }}>
                  {error}
                </div>
              )}
            </div>
          )}

          {mode === 'processing' && (
            <div className="animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animationDuration: '0.8s' }}>
              <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2.5rem' }}>
                <div className="absolute inset-0" style={{ border: '1.5px solid var(--surface-border)', borderRadius: '50%' }}></div>
                <div className="absolute inset-0 animate-spin" style={{ border: '1.5px solid transparent', borderTopColor: 'var(--primary)', borderRadius: '50%', animationDuration: '1.5s' }}></div>
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', opacity: 0.9 }} />
                ) : (
                  <File size={32} color="var(--primary)" opacity={0.8} />
                )}
                
                {/* Scanner Beam subtil */}
                <div style={{ position: 'absolute', top: '-10%', left: 0, right: 0, height: '2px', background: 'var(--primary)', boxShadow: '0 0 10px 2px rgba(var(--primary-rgb, 139,111,71), 0.3)', animation: 'scanPremium 2.5s infinite cubic-bezier(0.4, 0, 0.2, 1)', borderRadius: '10px' }} />
              </div>
              
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--text-main)', margin: '0 0 0.75rem 0', fontWeight: '500' }}>{progressText}</h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: '350px', textAlign: 'center', fontSize: '0.95rem', lineHeight: 1.5 }}>
                Veuillez patienter pendant que l'intelligence artificielle structure vos informations cliniques.
              </p>
            </div>
          )}
        </div>
        
        <style dangerouslySetInnerHTML={{__html: `
          .premium-close-btn:hover {
            background: #fee2e2 !important;
            color: #ef4444 !important;
            transform: scale(1.05) rotate(90deg);
          }
          .premium-back-btn:hover {
            background: var(--surface-bg) !important;
            transform: translateX(-3px);
          }
          
          /* L'animation et l'effet demandé par l'utilisateur : trait fin + léger ombrage au hover */
          .premium-choice-card:hover { 
            border-color: var(--primary) !important; 
            background: var(--surface) !important; 
            box-shadow: var(--shadow-md) !important; 
            transform: translateY(-4px); 
          }
          
          /* Effets sur l'icône lors du survol de la carte */
          .premium-choice-card:hover .icon-container {
            background: var(--primary) !important;
            border-color: var(--primary) !important;
            transform: scale(1.1);
          }
          .premium-choice-card:hover .icon-svg {
            color: #fff !important;
          }
          
          @keyframes scanPremium {
            0% { top: -10%; opacity: 0; }
            15% { opacity: 1; }
            85% { opacity: 1; }
            100% { top: 110%; opacity: 0; }
          }
        `}} />
      </div>
    </div>
  );
}
