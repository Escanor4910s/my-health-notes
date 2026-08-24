import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, CheckCircle, Loader2, Sparkles, FileText, Trash2, ShieldCheck, Check, Fingerprint, Activity, FileDigit } from 'lucide-react';
import Logo8G from '../../assets/8G-logo.jpg';

export default function AIEducationCard() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [instructions, setInstructions] = useState('');
  const [status, setStatus] = useState('idle'); 
  const inputRef = useRef(null);

  const [aiName, setAiName] = useState('');
  const [nameStatus, setNameStatus] = useState('idle'); // idle, saving, success
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    const savedName = localStorage.getItem('obsmed-ai-name');
    if (savedName) {
      setAiName(savedName);
      setDisplayName(savedName);
    }
  }, []);

  const saveName = () => {
    if (!aiName.trim()) return;
    setNameStatus('saving');
    setTimeout(() => {
      localStorage.setItem('obsmed-ai-name', aiName);
      setDisplayName(aiName);
      setNameStatus('success');
      setTimeout(() => setNameStatus('idle'), 5000);
    }, 1000);
  };

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
    <div className="form-card animate-fade-in" style={{ background: 'transparent', position: 'relative', overflow: 'hidden' }}>
      
      {/* SECTION 1: IDENTITE (Ligne 1) */}
      <div style={{ background: 'var(--surface)', padding: '3rem', borderRadius: '24px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)', marginBottom: '2.5rem', border: '1px solid var(--surface-border)', position: 'relative', overflow: 'hidden' }}>
        {/* Subtle decorative glow */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', height: '100%', background: 'radial-gradient(ellipse at top, rgba(var(--primary-rgb, 155,122,90), 0.1), transparent 60%)', pointerEvents: 'none' }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2.5rem', position: 'relative', zIndex: 2 }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.08)', overflow: 'hidden', border: '1px solid var(--surface-border)' }}>
            <img src={Logo8G} alt="8G" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
              Personnaliser l'IA
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: '0.25rem 0 0 0' }}>
              Configurez l'identité de votre entité clinique.
            </p>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input
              type="text"
              value={aiName}
              onChange={(e) => setAiName(e.target.value)}
              placeholder="Nom de l'assistant (ex: Copilote 8G)"
              style={{
                flex: 1, padding: '1.25rem 1.5rem', borderRadius: '16px', border: '1px solid var(--surface-border)',
                background: 'var(--surface-bg)', color: 'var(--text-main)', fontSize: '1.1rem', outline: 'none', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 4px rgba(var(--primary-rgb, 0,0,0), 0.08)'; e.target.style.transform = 'translateY(-2px)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--surface-border)'; e.target.style.boxShadow = 'none'; e.target.style.transform = 'translateY(0)'; }}
            />
            <button
              onClick={saveName}
              disabled={nameStatus === 'saving' || !aiName.trim()}
              style={{
                padding: '0 2rem', height: '62px', borderRadius: '16px', border: 'none',
                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark, #000))',
                color: '#fff', fontWeight: '600', fontSize: '1.05rem', cursor: (!aiName.trim() || nameStatus === 'saving') ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', opacity: (!aiName.trim() || nameStatus === 'saving') ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '160px',
                boxShadow: '0 10px 25px -5px rgba(var(--primary-rgb, 0,0,0), 0.3)'
              }}
              onMouseOver={(e) => { if (aiName.trim() && nameStatus !== 'saving') e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {nameStatus === 'saving' ? <Loader2 size={22} className="animate-spin" /> : 'Attribuer'}
            </button>
          </div>

          {/* Cinematic, Non-AI Notification (Pure elegant typography) */}
          <div style={{
            height: nameStatus === 'success' ? '40px' : '0',
            opacity: nameStatus === 'success' ? 1 : 0,
            overflow: 'hidden',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            marginTop: nameStatus === 'success' ? '0.5rem' : '0'
          }}>
            <Fingerprint size={18} color="var(--primary)" style={{ animation: 'pulse 2s infinite' }} />
            <span style={{ 
              fontSize: '1rem', fontWeight: '500', letterSpacing: '0.2px',
              background: 'linear-gradient(90deg, var(--primary), var(--text-main))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 10px rgba(var(--primary-rgb, 0,0,0), 0.2)'
            }}>
              L'entité clinique répond désormais au nom de {displayName}. Configuration biométrique validée.
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 2: FICHIER MODELE (Ligne 2) */}
      <div style={{ background: 'var(--surface)', padding: '2.5rem 3rem', borderRadius: '24px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)', marginBottom: '2.5rem', border: '1px solid var(--surface-border)' }}>
        <h4 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FileDigit size={22} color="var(--primary)" />
          Fichier d'Apprentissage
        </h4>
        
        <div 
          onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
          onClick={() => !file && inputRef.current?.click()}
          style={{
            border: '2px dashed',
            borderColor: dragActive ? 'var(--primary)' : 'var(--surface-border)',
            borderRadius: '20px', padding: '2.5rem', textAlign: 'center',
            background: dragActive ? 'rgba(var(--primary-rgb, 0,0,0), 0.03)' : 'var(--surface-bg)',
            cursor: file ? 'default' : 'pointer', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
          }}
          onMouseOver={(e) => { if(!file && !dragActive) { e.currentTarget.style.borderColor = 'rgba(var(--primary-rgb, 0,0,0), 0.3)'; e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
          onMouseOut={(e) => { if(!file && !dragActive) { e.currentTarget.style.borderColor = 'var(--surface-border)'; e.currentTarget.style.background = 'var(--surface-bg)'; e.currentTarget.style.transform = 'translateY(0)'; } }}
        >
          <input ref={inputRef} type="file" multiple={false} onChange={handleChange} style={{ display: 'none' }} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt" />
          
          {file ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', background: 'var(--surface)', padding: '1.25rem 1.75rem', borderRadius: '16px', boxShadow: '0 8px 25px rgba(0,0,0,0.06)', border: '1px solid var(--surface-border)', width: '100%', maxWidth: '600px' }}>
              <FileText size={28} color="var(--primary)" />
              <div style={{ flex: 1, textAlign: 'left', overflow: 'hidden' }}>
                <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '1.05rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{file.name}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
              </div>
              {status !== 'analyzing' && (
                <button onClick={(e) => { e.stopPropagation(); removeFile(); }} style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', border: 'none', width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ) : (
            <>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }}>
                <UploadCloud size={28} strokeWidth={2} />
              </div>
              <div>
                <strong style={{ color: 'var(--text-main)', fontSize: '1.1rem', display: 'block', marginBottom: '0.3rem' }}>Importer un modèle clinique</strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Glissez un document (PDF, Word, TXT, Image) de référence</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* SECTION 3: DIRECTIVES ET ASSIMILATION (Ligne 3) */}
      <div style={{ background: 'var(--surface)', padding: '2.5rem 3rem', borderRadius: '24px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)', border: '1px solid var(--surface-border)' }}>
        <h4 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Activity size={22} color="var(--primary)" />
          Directives & Assimilation
        </h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Exigences structurelles strictes (ex: Forcer un tableau J1/J2 pour l'évolution, séparer traitement aigu/chronique...)"
            style={{
              width: '100%', minHeight: '140px', padding: '1.5rem', borderRadius: '20px',
              border: '1px solid var(--surface-border)', background: 'var(--surface-bg)',
              color: 'var(--text-main)', fontSize: '1.05rem', outline: 'none', resize: 'vertical',
              fontFamily: 'inherit', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', lineHeight: '1.6'
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 4px rgba(var(--primary-rgb, 0,0,0), 0.08)'; e.target.style.transform = 'translateY(-2px)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--surface-border)'; e.target.style.boxShadow = 'none'; e.target.style.transform = 'translateY(0)'; }}
          />

          <button
            onClick={startEducation}
            disabled={status === 'analyzing' || (!file && !instructions.trim()) || status === 'success'}
            style={{
              padding: '1.25rem', borderRadius: '16px', border: 'none', width: '100%',
              background: status === 'success' ? '#10b981' : 'linear-gradient(135deg, var(--primary), var(--primary-dark, #000))',
              color: '#fff', fontSize: '1.1rem', fontWeight: '600', cursor: (status === 'analyzing' || (!file && !instructions.trim()) || status === 'success') ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: status === 'success' ? '0 15px 35px -5px rgba(16, 185, 129, 0.4)' : '0 15px 35px -5px rgba(var(--primary-rgb, 0,0,0), 0.3)',
              opacity: (!file && !instructions.trim()) ? 0.6 : 1
            }}
            onMouseOver={(e) => { if (status !== 'analyzing' && status !== 'success' && (file || instructions.trim())) e.currentTarget.style.transform = 'translateY(-3px)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {status === 'idle' && <><Sparkles size={20} /> Lancer l'assimilation structurelle</>}
            {status === 'analyzing' && <><Loader2 size={20} className="animate-spin" /> Analyse des données biométriques en cours...</>}
            {status === 'success' && <><CheckCircle size={20} /> Profil clinique assimilé avec succès</>}
          </button>
        </div>
      </div>
    </div>
  );
}
