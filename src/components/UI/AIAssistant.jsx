import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Stethoscope, FileText, FlaskConical, Copy, Check } from 'lucide-react';
import { askAI, compactDossier } from '../../lib/ai';
import Markdown from './Markdown';
import Logo8G from '../../assets/8G-logo.jpg';

const QUICK_ACTIONS = [
  { action: 'synthese', label: 'Résumé syndromique', icon: FileText },
  { action: 'hypotheses', label: 'Hypothèses diagnostiques', icon: Stethoscope },
  { action: 'interpretation', label: 'Interpréter le bilan', icon: FlaskConical },
];

export default function AIAssistant({ formData, shouldPulse }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(-1);
  const [assistantName, setAssistantName] = useState('Copilote Clinique');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      const name = localStorage.getItem('obsmed-ai-name');
      if (name) setAssistantName(name);
    }
  }, [open]);

  const run = async (action, userLabel, texte) => {
    if (loading) return;
    setError('');
    setLoading(true);
    const history = [...messages, { role: 'user', content: userLabel }];
    setMessages(history);
    try {
      const content = await askAI(action, {
        dossier: compactDossier(formData),
        ...(texte ? { texte } : {}),
        ...(action === 'chat' ? { messages: history } : {}),
      });
      setMessages((prev) => [...prev, { role: 'assistant', content }]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const send = (e) => {
    e.preventDefault();
    const q = input.trim();
    if (!q) return;
    setInput('');
    run('chat', q, q);
  };

  const copy = async (text, i) => {
    await navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(-1), 2000);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .widget-8g-btn {
          position: fixed; bottom: 2rem; right: 2rem; z-index: 60;
          width: 64px; height: 64px; border-radius: 50%; border: none; cursor: pointer;
          box-shadow: 0 10px 25px -5px rgba(var(--primary-rgb, 0,0,0), 0.4), 0 8px 10px -6px rgba(var(--primary-rgb, 0,0,0), 0.2);
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          padding: 0;
          background: var(--surface);
          display: flex; align-items: center; justify-content: center;
        }
        .widget-8g-btn:hover {
          transform: scale(1.05) translateY(-4px);
          box-shadow: 0 15px 35px -5px rgba(var(--primary-rgb, 0,0,0), 0.5), 0 10px 15px -5px rgba(var(--primary-rgb, 0,0,0), 0.3);
        }
        .widget-8g-btn.is-open {
          opacity: 0;
          pointer-events: none;
          transform: scale(0.5) translateY(20px);
        }
        .widget-layer {
          position: absolute; inset: 0; border-radius: 50%;
          transition: opacity 0.5s ease;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
        }

        /* --- LIGHT MODE / DEFAULT --- */
        .widget-layer-base {
          background: var(--surface);
          opacity: 1;
        }
        .widget-layer-base img {
          mix-blend-mode: multiply;
        }
        .widget-layer-hover {
          background: var(--primary);
          opacity: 0;
        }
        .widget-layer-hover img {
          filter: invert(1); /* Motif becomes white, Bg becomes black */
          mix-blend-mode: screen; /* Black disappears */
        }

        /* Hover Transitions */
        .widget-8g-btn:not(.is-open):hover .widget-layer-base { opacity: 0; }
        .widget-8g-btn:not(.is-open):hover .widget-layer-hover { opacity: 1; }

        /* Modal header logo */
        .ai-modal-logo {
           mix-blend-mode: multiply;
        }

        /* --- DARK MODE OVERRIDES --- */
        html[data-theme='dark'] .widget-layer-base img {
          filter: invert(1);
          mix-blend-mode: screen;
        }
        html[data-theme='dark'] .ai-modal-logo {
           filter: invert(1);
           mix-blend-mode: screen;
        }

        /* Crossfade animations for trending dual-logo effect */
        .logo-switcher {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .logo-1 { animation: crossfade1 6s ease-in-out infinite; }
        .logo-2 { animation: crossfade2 6s ease-in-out infinite; }
        
        @keyframes crossfade1 {
          0%, 42% { opacity: 1; transform: scale(1); }
          50%, 92% { opacity: 0; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes crossfade2 {
          0%, 42% { opacity: 0; transform: scale(0.85); }
          50%, 92% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.85); }
        }
        
        .ai-proactive-pulse {
          animation: aiProactivePulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
          box-shadow: 0 0 0 0 rgba(var(--primary-rgb, 139,111,71), 0.7);
        }
        @keyframes aiProactivePulse {
          0% { box-shadow: 0 0 0 0 rgba(var(--primary-rgb, 139,111,71), 0.7); }
          70% { box-shadow: 0 0 0 20px rgba(var(--primary-rgb, 139,111,71), 0); }
          100% { box-shadow: 0 0 0 0 rgba(var(--primary-rgb, 139,111,71), 0); }
        }
        /* Slight scale animation adds to the 'ultra smooth' and 'trending' feeling */
      `}} />
      
      {/* Backdrop for click-outside to close */}
      {open && (
        <div 
          className="animate-fade-in"
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            background: 'rgba(0, 0, 0, 0.05)',
            backdropFilter: 'blur(2px)'
          }}
        />
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        title={assistantName}
        className={`widget-8g-btn ${open ? 'is-open' : ''} ${shouldPulse && !open ? 'ai-proactive-pulse' : ''}`}
      >
        {/* We no longer show the X since the button vanishes */}
        <>
          {/* Logo 1: 8G Mandala */}
          <div className="logo-switcher logo-1">
            <div className="widget-layer widget-layer-base">
              <img src={Logo8G} alt="Logo de l'assistant" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '6px' }} />
            </div>
            <div className="widget-layer widget-layer-hover">
              <img src={Logo8G} alt="Logo de l'assistant" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '6px' }} />
            </div>
          </div>

          {/* Logo 2: ObsMed App Logo */}
          <div className="logo-switcher logo-2">
            <div className="widget-layer widget-layer-base">
              <img src="/logo.png" alt="ObsMed Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }} />
            </div>
            <div className="widget-layer widget-layer-hover">
              <img src="/logo.png" alt="ObsMed Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }} />
            </div>
          </div>
        </>
      </button>

      {open && (
        <div
          className="animate-fade-in"
          style={{
            position: 'fixed', bottom: '6.5rem', right: '2rem', zIndex: 60,
            width: 'min(450px, calc(100vw - 4rem))', height: 'min(75vh, 700px)',
            display: 'flex', flexDirection: 'column',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(24px) saturate(1.5)',
            WebkitBackdropFilter: 'blur(24px) saturate(1.5)',
            border: '1px solid var(--glass-border)',
            borderRadius: '24px', 
            boxShadow: '0 30px 60px -15px rgba(0,0,0,0.1), 0 15px 25px -10px rgba(0,0,0,0.05)',
            overflow: 'hidden',
          }}
        >
          <div style={{ 
            padding: '1.2rem 1.5rem', 
            background: 'var(--glass-header)',
            borderBottom: '1px solid var(--surface-border)', 
            display: 'flex', alignItems: 'center', gap: '0.75rem' 
          }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.08)', overflow: 'hidden', border: '1px solid var(--surface-border)' }}>
              <img src={Logo8G} alt="AI" className="ai-modal-logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)', letterSpacing: '-0.3px' }}>{assistantName}</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>Analyse contextuelle active</div>
            </div>
            <button 
              onClick={() => setOpen(false)}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', padding: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = 'var(--text-main)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <X size={20} />
            </button>
          </div>

          <div style={{ 
            padding: '1rem 1.5rem', 
            display: 'flex', flexWrap: 'wrap', gap: '0.5rem', 
            background: 'var(--glass-actions)',
            borderBottom: '1px solid var(--surface-border)' 
          }}>
            {QUICK_ACTIONS.map(({ action, label, icon: Icon }) => (
              <button
                key={action}
                disabled={loading}
                onClick={() => run(action, label)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.4rem 0.85rem', fontSize: '0.8rem', fontWeight: '600', borderRadius: '12px',
                  border: '1px solid var(--primary)', background: 'transparent',
                  cursor: loading ? 'not-allowed' : 'pointer', color: 'var(--primary)',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 5px rgba(var(--primary-rgb, 0,0,0), 0.05)'
                }}
                onMouseOver={(e) => { if(!loading) { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = '#fff'; } }}
                onMouseOut={(e) => { if(!loading) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--primary)'; } }}
              >
                <Icon size={14} strokeWidth={2.5} /> {label}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
            {messages.length === 0 && !loading && (
              <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--surface-bg)', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  <Stethoscope size={32} opacity={0.5} />
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0, fontWeight: '500' }}>
                  Je suis synchronisé avec le dossier en cours.<br/>
                  Demandez-moi une synthèse ou une interprétation clinique.
                </p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {m.role === 'user' ? (
                  <div style={{ 
                    background: 'var(--primary)', color: '#fff', 
                    padding: '0.75rem 1.2rem', borderRadius: '20px 20px 4px 20px', 
                    fontSize: '0.9rem', maxWidth: '85%', fontWeight: '500',
                    boxShadow: '0 4px 15px rgba(var(--primary-rgb, 0,0,0), 0.15)'
                  }}>
                    {m.content}
                  </div>
                ) : (
                  <div style={{ 
                    background: 'var(--surface)', color: 'var(--text-main)',
                    borderRadius: '20px 20px 20px 4px', padding: '1.2rem', 
                    maxWidth: '95%', fontSize: '0.9rem', lineHeight: '1.6',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid var(--surface-border)'
                  }}>
                    <Markdown content={m.content} />
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--surface-border)', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => copy(m.content, i)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--surface-bg)', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600', padding: '0.4rem 0.8rem', borderRadius: '8px', transition: 'all 0.2s' }}
                        onMouseOver={(e) => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.background = 'rgba(var(--primary-rgb, 0,0,0), 0.05)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'var(--surface-bg)'; }}
                      >
                        {copied === i ? <Check size={14} color="var(--primary)" /> : <Copy size={14} />} {copied === i ? 'Copié' : 'Copier'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)', fontSize: '0.9rem', fontWeight: '600', background: 'var(--surface)', padding: '1rem 1.5rem', borderRadius: '20px', width: 'fit-content', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                <Loader2 size={18} className="animate-spin" /> Analyse des données cliniques...
              </div>
            )}
            {error && <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '1rem', borderRadius: '12px', fontSize: '0.85rem', border: '1px solid #fca5a5' }}>{error}</div>}
            <div ref={endRef} />
          </div>

          <form onSubmit={send} style={{ display: 'flex', gap: '0.75rem', padding: '1.25rem 1.5rem', background: 'var(--surface)', borderTop: '1px solid var(--surface-border)' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ex: Formule un résumé syndromique..."
              style={{ flex: 1, border: '1px solid var(--surface-border)', borderRadius: '16px', padding: '0.85rem 1.25rem', fontSize: '0.9rem', outline: 'none', background: 'var(--surface-bg)', color: 'var(--text-main)', transition: 'all 0.3s' }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(var(--primary-rgb, 0,0,0), 0.1)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--surface-border)'; e.target.style.boxShadow = 'none'; }}
            />
            <button type="submit" disabled={loading || !input.trim()} style={{ border: 'none', background: 'var(--primary)', color: '#fff', width: 48, height: 48, borderRadius: '16px', cursor: (loading || !input.trim()) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: (loading || !input.trim()) ? 0.6 : 1, transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(var(--primary-rgb, 0,0,0), 0.2)' }}>
              <Send size={20} strokeWidth={2.5} style={{ marginLeft: '2px' }} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
