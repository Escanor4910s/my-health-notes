import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Loader2, Stethoscope, FileText, FlaskConical, Copy, Check } from 'lucide-react';
import { askAI, compactDossier } from '../../lib/ai';
import Markdown from './Markdown';

const QUICK_ACTIONS = [
  { action: 'synthese', label: 'Résumé syndromique', icon: FileText },
  { action: 'hypotheses', label: 'Hypothèses diagnostiques', icon: Stethoscope },
  { action: 'interpretation', label: 'Interpréter le bilan', icon: FlaskConical },
];

export default function AIAssistant({ formData }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(-1);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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
      <button
        onClick={() => setOpen((v) => !v)}
        title="Assistant IA"
        style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 60,
          width: '56px', height: '56px', borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: 'var(--primary, #9b7a5a)', color: '#fff',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {open ? <X size={22} /> : <Sparkles size={22} />}
      </button>

      {open && (
        <div
          className="ai-assistant-panel"
          style={{
            position: 'fixed', bottom: '5.5rem', right: '1.5rem', zIndex: 60,
            width: 'min(420px, calc(100vw - 2rem))', maxHeight: 'min(70vh, 640px)',
            display: 'flex', flexDirection: 'column',
            background: 'var(--surface, #fff)', border: '1px solid var(--surface-border, #e6e0d8)',
            borderRadius: '18px', boxShadow: '0 20px 45px -10px rgba(0,0,0,0.25)', overflow: 'hidden',
          }}
        >
          <div style={{ padding: '0.9rem 1.1rem', borderBottom: '1px solid var(--surface-border, #e6e0d8)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles size={18} color="var(--primary, #9b7a5a)" />
            <strong style={{ fontSize: '0.95rem' }}>Assistant IA clinique</strong>
          </div>

          <div style={{ padding: '0.75rem 1.1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid var(--surface-border, #e6e0d8)' }}>
            {QUICK_ACTIONS.map(({ action, label, icon: Icon }) => (
              <button
                key={action}
                disabled={loading}
                onClick={() => run(action, label)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                  padding: '0.35rem 0.7rem', fontSize: '0.78rem', borderRadius: '999px',
                  border: '1px solid var(--surface-border, #e6e0d8)', background: 'transparent',
                  cursor: loading ? 'not-allowed' : 'pointer', color: 'var(--text-main)',
                }}
              >
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.1rem' }}>
            {messages.length === 0 && !loading && (
              <p style={{ color: 'var(--text-muted, #8a8177)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
                Posez une question sur le dossier en cours, ou utilisez une action rapide.
                L'IA lit les données déjà saisies et n'invente aucune information.
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: '1rem' }}>
                {m.role === 'user' ? (
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'inline-block', background: 'var(--primary, #9b7a5a)', color: '#fff', padding: '0.5rem 0.8rem', borderRadius: '14px 14px 4px 14px', fontSize: '0.85rem', maxWidth: '85%' }}>
                      {m.content}
                    </span>
                  </div>
                ) : (
                  <div style={{ background: 'var(--beige-light, #f7f4ef)', borderRadius: '14px 14px 14px 4px', padding: '0.8rem 1rem' }}>
                    <Markdown content={m.content} />
                    <button
                      onClick={() => copy(m.content, i)}
                      style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted, #8a8177)', fontSize: '0.75rem', padding: 0 }}
                    >
                      {copied === i ? <Check size={13} /> : <Copy size={13} />} {copied === i ? 'Copié' : 'Copier'}
                    </button>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted, #8a8177)', fontSize: '0.85rem' }}>
                <Loader2 size={16} className="animate-spin" /> L'IA analyse le dossier...
              </div>
            )}
            {error && <p style={{ color: 'var(--danger, #b85c5c)', fontSize: '0.82rem' }}>{error}</p>}
            <div ref={endRef} />
          </div>

          <form onSubmit={send} style={{ display: 'flex', gap: '0.5rem', padding: '0.8rem 1rem', borderTop: '1px solid var(--surface-border, #e6e0d8)' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Poser une question clinique..."
              style={{ flex: 1, border: '1px solid var(--surface-border, #e6e0d8)', borderRadius: '999px', padding: '0.55rem 0.9rem', fontSize: '0.85rem', outline: 'none', background: 'transparent', color: 'var(--text-main)' }}
            />
            <button type="submit" disabled={loading || !input.trim()} style={{ border: 'none', background: 'var(--primary, #9b7a5a)', color: '#fff', width: 38, height: 38, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
