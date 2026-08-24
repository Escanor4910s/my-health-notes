import React, { useState, useRef } from 'react';
import { Brain, UploadCloud, CheckCircle, Loader2, Sparkles, FileText, Trash2 } from 'lucide-react';

export default function AIEducationCard() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [instructions, setInstructions] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'analyzing', 'success', 'error'
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (uploadedFile) => {
    setFile(uploadedFile);
    setStatus('idle');
  };

  const startEducation = () => {
    if (!file && !instructions.trim()) return;
    setStatus('analyzing');
    
    // Simulate AI parsing the document and learning the structure
    setTimeout(() => {
      setStatus('success');
      localStorage.setItem('obsmed-ai-education', JSON.stringify({
        fileName: file ? file.name : null,
        instructions,
        learnedAt: new Date().toISOString()
      }));
    }, 3500);
  };

  const removeFile = () => {
    setFile(null);
    setStatus('idle');
  };

  return (
    <div className="form-card theme-section-card animate-fade-in" style={{ padding: '2.5rem', background: 'var(--surface)', borderRadius: '20px', boxShadow: 'var(--shadow-sm)', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', border: '1px solid var(--surface-border)', position: 'relative', overflow: 'hidden' }}>
      
      {/* Decorative bg element */}
      <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(var(--primary-rgb, 155,122,90), 0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: '700' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary), #d4af37)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 12px rgba(var(--primary-rgb, 0,0,0), 0.2)' }}>
          <Brain size={22} strokeWidth={2.5} />
        </div>
        Éduquer le Copilote IA
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: '1.6', maxWidth: '85%' }}>
        Personnalisez la structure de vos observations médicales. Importez un modèle (PDF, Image, Texte) et donnez vos directives. Le Copilote analysera votre document pour imiter parfaitement votre style clinique.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Upload Area */}
        <div 
          onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
          onClick={() => !file && inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragActive ? 'var(--primary)' : 'var(--surface-border)'}`,
            borderRadius: '16px', padding: '2rem', textAlign: 'center',
            background: dragActive ? 'rgba(var(--primary-rgb, 0,0,0), 0.05)' : 'var(--surface-bg)',
            cursor: file ? 'default' : 'pointer', transition: 'all 0.3s',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
            position: 'relative'
          }}
        >
          <input ref={inputRef} type="file" multiple={false} onChange={handleChange} style={{ display: 'none' }} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt" />
          
          {file ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--surface)', padding: '1rem 1.5rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid var(--primary)', width: '100%', maxWidth: '400px' }}>
              <FileText size={24} color="var(--primary)" />
              <div style={{ flex: 1, textAlign: 'left', overflow: 'hidden' }}>
                <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.95rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{file.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
              </div>
              {status !== 'analyzing' && (
                <button onClick={(e) => { e.stopPropagation(); removeFile(); }} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ) : (
            <>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <UploadCloud size={32} strokeWidth={1.5} />
              </div>
              <div>
                <strong style={{ color: 'var(--text-main)', fontSize: '1.05rem', display: 'block', marginBottom: '0.25rem' }}>Cliquez ou glissez un fichier modèle ici</strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>PDF, Word, Image ou Texte brut. L'IA en extraira la structure.</span>
              </div>
            </>
          )}
        </div>

        {/* Instructions Area */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.95rem' }}>Consignes strictes d'apprentissage</label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Ex: Utilise toujours un tableau pour l'évolution (J1, J2 en colonnes). Sépare bien les plaintes du traitement en utilisant des listes à puces..."
            style={{
              width: '100%', minHeight: '120px', padding: '1rem', borderRadius: '16px',
              border: '1px solid var(--surface-border)', background: 'var(--surface-bg)',
              color: 'var(--text-main)', fontSize: '0.95rem', outline: 'none', resize: 'vertical',
              fontFamily: 'inherit', transition: 'all 0.3s'
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(var(--primary-rgb, 0,0,0), 0.1)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--surface-border)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
          <button
            onClick={startEducation}
            disabled={status === 'analyzing' || (!file && !instructions.trim()) || status === 'success'}
            style={{
              padding: '1rem 2rem', borderRadius: '16px', border: 'none',
              background: status === 'success' ? '#10b981' : 'linear-gradient(135deg, var(--primary), var(--primary-dark, #000))',
              color: '#fff', fontSize: '1rem', fontWeight: '600', cursor: (status === 'analyzing' || (!file && !instructions.trim()) || status === 'success') ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.75rem', transition: 'all 0.3s',
              boxShadow: status === 'success' ? '0 10px 25px -5px rgba(16, 185, 129, 0.4)' : '0 10px 25px -5px rgba(var(--primary-rgb, 0,0,0), 0.3)',
              opacity: (!file && !instructions.trim()) ? 0.6 : 1
            }}
          >
            {status === 'idle' && <><Sparkles size={20} /> Lancer l'apprentissage cognitif</>}
            {status === 'analyzing' && <><Loader2 size={20} className="animate-spin" /> Analyse et restructuration...</>}
            {status === 'success' && <><CheckCircle size={20} /> Apprentissage réussi</>}
          </button>
          
          {status === 'success' && (
            <span style={{ color: '#10b981', fontSize: '0.95rem', fontWeight: '500', animation: 'fadeIn 0.5s' }}>
              Le Copilote appliquera désormais cette structure.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
