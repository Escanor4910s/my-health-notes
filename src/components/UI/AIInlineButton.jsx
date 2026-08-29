import React, { useState } from 'react';
import { Sparkles, Loader2, Check, X } from 'lucide-react';
import { askAI, parseJSONResponse } from '../../lib/ai';
import Markdown from './Markdown';
import { useNotification } from './NotificationSystem';

import { getAIName } from '../../lib/aiName';

export default function AIInlineButton({
  label,
  action,
  payloadBuilder,
  onResult,
  confirmBeforeApply = true,
  buttonClassName = "premium-tag",
  parseAsJSON = true,
  icon: Icon = Sparkles
}) {
  const finalLabel = label || `Générer avec ${getAIName()}`;
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [rawPreviewText, setRawPreviewText] = useState("");
  const { notify } = useNotification();

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    try {
      const payload = payloadBuilder ? payloadBuilder() : {};
      const responseText = await askAI(action, payload);
      
      let parsed = responseText;
      if (parseAsJSON) {
        try {
          parsed = parseJSONResponse(responseText);
        } catch (e) {
          console.warn("Failed to parse JSON, falling back to raw text", e);
        }
      }

      if (confirmBeforeApply) {
        setPreviewData(parsed);
        setRawPreviewText(typeof parsed === 'object' ? JSON.stringify(parsed, null, 2) : responseText);
      } else {
        onResult(parsed);
        notify({ type: 'success', message: 'Génération réussie' });
      }
    } catch (err) {
      console.error(err);
      notify({ type: 'error', message: err.message || "Erreur de génération IA" });
    } finally {
      setIsLoading(false);
    }
  };

  const applyPreview = () => {
    onResult(previewData);
    setPreviewData(null);
    notify({ type: 'success', message: 'Contenu appliqué' });
  };

  return (
    <>
      <button 
        type="button" 
        onClick={handleGenerate} 
        disabled={isLoading}
        className={buttonClassName}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', opacity: isLoading ? 0.7 : 1 }}
      >
        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Icon size={16} />}
        <span>{isLoading ? "Analyse en cours..." : finalLabel}</span>
      </button>

      {/* Modal de prévisualisation */}
      {previewData && (
        <div className="tag-manager-modal-overlay">
          <div className="tag-manager-modal" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                <Sparkles size={20} />
                Aperçu de la génération
              </h3>
              <button 
                onClick={() => setPreviewData(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={24} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: '1.5rem', background: 'var(--beige-light)', color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              {typeof previewData === 'object' ? (
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, fontFamily: 'monospace' }}>
                  {rawPreviewText}
                </pre>
              ) : (
                <Markdown content={rawPreviewText} />
              )}
            </div>
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: 'var(--surface)' }}>
              <button 
                onClick={() => setPreviewData(null)} 
                className="btn" 
                style={{ background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--surface-border)' }}
              >
                Annuler
              </button>
              <button 
                onClick={applyPreview} 
                className="btn-primary" 
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Check size={18} />
                Appliquer au dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
