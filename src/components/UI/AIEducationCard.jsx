import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, CheckCircle, Loader2, Sparkles, FileText, Trash2, ShieldCheck, Check } from 'lucide-react';
import Logo8G from '../../assets/8G-logo.jpg';

export default function AIEducationCard() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [instructions, setInstructions] = useState('');
  const [status, setStatus] = useState('idle'); 
  const inputRef = useRef(null);

  const [aiName, setAiName] = useState('');
  const [nameStatus, setNameStatus] = useState('idle'); // idle, saving, success

  useEffect(() => {
    const savedName = localStorage.getItem('obsmed-ai-name');
    if (savedName) setAiName(savedName);
  }, []);

  const saveName = () => {
    if (!aiName.trim()) return;
    setNameStatus('saving');
    setTimeout(() => {
      localStorage.setItem('obsmed-ai-name', aiName);
      setNameStatus('success');
      setTimeout(() => setNameStatus('idle'), 6000);
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
    <div className="form-card theme-section-card animate-fade-in" style={{ padding: '3rem', background: 'var(--surface)', borderRadius: '24px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)', transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)', border: '1px solid var(--surface-border)', position: 'relative', overflow: 'hidden' }}>
      
      {/* Decorative bg element */}
      <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(var(--primary-rgb, 155,122,90), 0.08) 0%, transparent 60%)', borderRadius: '50%', pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.08)', overflow: 'hidden', border: '1px solid var(--surface-border)' }}>
          <img src={Logo8G} alt="8G" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div>
          <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
            Personnaliser l'IA
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', margin: '0.25rem 0 0 0' }}>
            Configurez l'identité et le style clinique de votre assistant personnel.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
        
        {/* SECTION 1: IDENTITE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.75rem', marginBottom: '0.5rem' }}>
            <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} color="var(--primary)" />
              Identité de l'assistant
            </h4>
          </div>

          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.9rem' }}>Nom de votre assistant</label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="text"
                value={aiName}
                onChange={(e) => setAiName(e.target.value)}
                placeholder="Ex: Dr. Watson, Copilote 8G..."
                style={{
                  flex: 1, padding: '1rem 1.25rem', borderRadius: '14px', border: '1px solid var(--surface-border)',
                  background: 'var(--surface-bg)', color: 'var(--text-main)', fontSize: '1rem', outline: 'none', transition: 'all 0.3s'
                }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 4px rgba(var(--primary-rgb, 0,0,0), 0.08)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--surface-border)'; e.target.style.boxShadow = 'none'; }}
              />
              <button
                onClick={saveName}
                disabled={nameStatus === 'saving' || !aiName.trim()}
                style={{
                  padding: '0 1.5rem', borderRadius: '14px', border: 'none',
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-dark, #000))',
                  color: '#fff', fontWeight: '600', cursor: (!aiName.trim() || nameStatus === 'saving') ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s', opacity: (!aiName.trim() || nameStatus === 'saving') ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '120px'
                }}
              >
                {nameStatus === 'saving' ? <Loader2 size={20} className="animate-spin" /> : 'Nommer l\'IA'}
              </button>
            </div>
            
            {/* Grandiose Notification Inline */}
            <div style={{
              marginTop: nameStatus === 'success' ? '1rem' : '0',
              height: nameStatus === 'success' ? 'auto' : '0',
              opacity: nameStatus === 'success' ? 1 : 0,
              overflow: 'hidden',
              transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '14px', padding: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: '1rem',
                boxShadow: '0 10px 30px -10px rgba(16, 185, 129, 0.15)'
              }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <h5 style={{ margin: '0 0 0.25rem 0', color: '#065f46', fontSize: '1rem', fontWeight: '700' }}>Félicitations !</h5>
                  <p style={{ margin: 0, color: '#047857', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    Vous venez de nommer votre premier assistant. Désormais, <strong>{aiName}</strong> vous accompagnera avec expertise dans toutes vos observations cliniques.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: APPRENTISSAGE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.75rem', marginBottom: '0.5rem' }}>
            <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', overflow: 'hidden' }}>
                <img src={Logo8G} alt="8G" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              Apprentissage cognitif
            </h4>
          </div>
          
          {/* Upload Area */}
          <div 
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            onClick={() => !file && inputRef.current?.click()}
            style={{
              border: '1.5px dashed',
              borderColor: dragActive ? 'var(--primary)' : 'var(--surface-border)',
              borderRadius: '16px', padding: '1.75rem', textAlign: 'center',
              background: dragActive ? 'rgba(var(--primary-rgb, 0,0,0), 0.03)' : 'var(--surface-bg)',
              cursor: file ? 'default' : 'pointer', transition: 'all 0.3s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
              position: 'relative'
            }}
            onMouseOver={(e) => { if(!file && !dragActive) { e.currentTarget.style.borderColor = 'rgba(var(--primary-rgb, 0,0,0), 0.3)'; e.currentTarget.style.background = 'var(--surface)'; } }}
            onMouseOut={(e) => { if(!file && !dragActive) { e.currentTarget.style.borderColor = 'var(--surface-border)'; e.currentTarget.style.background = 'var(--surface-bg)'; } }}
          >
            <input ref={inputRef} type="file" multiple={false} onChange={handleChange} style={{ display: 'none' }} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt" />
            
            {file ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--surface)', padding: '1rem 1.25rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid var(--surface-border)', width: '100%' }}>
                <FileText size={24} color="var(--primary)" />
                <div style={{ flex: 1, textAlign: 'left', overflow: 'hidden' }}>
                  <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.9rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{file.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
                {status !== 'analyzing' && (
                  <button onClick={(e) => { e.stopPropagation(); removeFile(); }} style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ) : (
              <>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', boxShadow: '0 4px 10px rgba(0,0,0,0.04)' }}>
                  <UploadCloud size={24} strokeWidth={2} />
                </div>
                <div>
                  <strong style={{ color: 'var(--text-main)', fontSize: '0.95rem', display: 'block', marginBottom: '0.2rem' }}>Fichier modèle clinique</strong>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Glissez un fichier (PDF, Word, TXT)</span>
                </div>
              </>
            )}
          </div>

          {/* Instructions Area */}
          <div>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Consignes d'assimilation (ex: Séparer les plaintes du traitement...)"
              style={{
                width: '100%', minHeight: '100px', padding: '1rem 1.25rem', borderRadius: '14px',
                border: '1px solid var(--surface-border)', background: 'var(--surface-bg)',
                color: 'var(--text-main)', fontSize: '0.9rem', outline: 'none', resize: 'vertical',
                fontFamily: 'inherit', transition: 'all 0.3s'
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 4px rgba(var(--primary-rgb, 0,0,0), 0.08)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--surface-border)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Action Button */}
          <button
            onClick={startEducation}
            disabled={status === 'analyzing' || (!file && !instructions.trim()) || status === 'success'}
            style={{
              padding: '1rem', borderRadius: '14px', border: 'none', width: '100%',
              background: status === 'success' ? '#10b981' : 'linear-gradient(135deg, var(--primary), var(--primary-dark, #000))',
              color: '#fff', fontSize: '0.95rem', fontWeight: '600', cursor: (status === 'analyzing' || (!file && !instructions.trim()) || status === 'success') ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', transition: 'all 0.4s',
              boxShadow: status === 'success' ? '0 10px 25px -5px rgba(16, 185, 129, 0.4)' : '0 10px 25px -5px rgba(var(--primary-rgb, 0,0,0), 0.3)',
              opacity: (!file && !instructions.trim()) ? 0.6 : 1
            }}
          >
            {status === 'idle' && <><Sparkles size={18} /> Lancer l'assimilation structurelle</>}
            {status === 'analyzing' && <><Loader2 size={18} className="animate-spin" /> Analyse des directives...</>}
            {status === 'success' && <><CheckCircle size={18} /> Profil clinique assimilé</>}
          </button>
        </div>
      </div>
    </div>
  );
}
