import React, { useState } from 'react';
import { X, Maximize, FileText, Activity, AlertCircle, Eye, Stethoscope } from 'lucide-react';
import { escapeHtml } from '../../lib/html';

const val = (obj, key) => escapeHtml(obj?.[key] || 'Non renseigné');

export default function PresentationMode({ data, onClose }) {
  const [fullscreen, setFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setFullscreen(true)).catch(err => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setFullscreen(false));
      }
    }
  };

  const ec = data['etat-civil'] || {};
  const motif = data['motif'] || {};
  const hdm = data['histoire'] || {};
  const atcd = data['antecedents'] || {};
  const eg = data['examen-general'] || {};
  const diagnostic = data['diagnostic'] || {};
  const traitement = data['traitement'] || {};

  return (
    <div className="presentation-mode animate-fade-in" style={{
      position: 'fixed', inset: 0, zIndex: 99999, background: '#0f172a', color: '#f8fafc',
      overflowY: 'auto', padding: '0', display: 'flex', flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)',
        padding: '1.5rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.1)', zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'var(--primary)', padding: '0.75rem', borderRadius: '12px' }}>
            <Eye size={28} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Staff Médical</h1>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '1rem' }}>Vue de présentation optimisée</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={toggleFullscreen} style={{
            background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '0.75rem 1.25rem',
            borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
            fontWeight: '600', transition: 'background 0.2s'
          }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}>
            <Maximize size={18} /> {fullscreen ? 'Quitter' : 'Plein écran'}
          </button>
          <button onClick={onClose} style={{
            background: '#ef4444', color: '#fff', border: 'none', padding: '0.75rem 1.25rem',
            borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
            fontWeight: '600', transition: 'background 0.2s'
          }} onMouseOver={e => e.currentTarget.style.background = '#dc2626'} onMouseOut={e => e.currentTarget.style.background = '#ef4444'}>
            <X size={18} /> Fermer
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', gap: '4rem' }}>
        
        {/* En-tête Patient */}
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '3.5rem', fontWeight: '900', margin: '0 0 1rem 0', letterSpacing: '-1px' }}>
            {val(ec, 'nom_prenoms')}
          </h2>
          <div style={{ display: 'inline-flex', gap: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '1rem 2.5rem', borderRadius: '99px', fontSize: '1.25rem', fontWeight: '600', color: '#cbd5e1' }}>
            <span>{val(ec, 'age')}</span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
            <span>{val(ec, 'sexe')}</span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
            <span>{val(ec, 'profession')}</span>
          </div>
        </div>

        {/* Motif & Histoire */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '2.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', color: '#38bdf8', marginTop: 0, marginBottom: '1.5rem', fontWeight: '700' }}>
              <AlertCircle size={24} /> Motif de Consultation
            </h3>
            <p style={{ fontSize: '1.35rem', lineHeight: '1.6', margin: 0 }}>{val(motif, 'motif')}</p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '2.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', color: '#a78bfa', marginTop: 0, marginBottom: '1.5rem', fontWeight: '700' }}>
              <FileText size={24} /> Histoire de la Maladie
            </h3>
            <p style={{ fontSize: '1.25rem', lineHeight: '1.7', margin: 0, whiteSpace: 'pre-wrap' }}>{val(hdm, 'texte')}</p>
          </div>
        </div>

        {/* Antécédents & Examen */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '2.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', color: '#f472b6', marginTop: 0, marginBottom: '1.5rem', fontWeight: '700' }}>
              <Activity size={24} /> Antécédents
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '1.25rem', lineHeight: '1.6' }}>
              <div><strong style={{ color: '#fff' }}>Médicaux :</strong> <span style={{ color: '#cbd5e1' }}>{val(atcd, 'medicaux')}</span></div>
              <div><strong style={{ color: '#fff' }}>Chirurgicaux :</strong> <span style={{ color: '#cbd5e1' }}>{val(atcd, 'chirurgicaux')}</span></div>
              <div><strong style={{ color: '#fff' }}>Familiaux :</strong> <span style={{ color: '#cbd5e1' }}>{val(atcd, 'familiaux')}</span></div>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '2.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', color: '#fbbf24', marginTop: 0, marginBottom: '1.5rem', fontWeight: '700' }}>
              <Stethoscope size={24} /> Constantes & Ex. Général
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '1.25rem', lineHeight: '1.6' }}>
              <div><strong style={{ color: '#fff' }}>État Général :</strong> <span style={{ color: '#cbd5e1' }}>{val(eg, 'etat_general')}</span></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '1rem', color: '#94a3b8', marginBottom: '0.25rem' }}>TA</span>
                  <strong style={{ fontSize: '1.5rem', color: '#fff' }}>{val(eg, 'ta')}</strong> <span style={{ fontSize: '1rem', color: '#64748b' }}>mmHg</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '1rem', color: '#94a3b8', marginBottom: '0.25rem' }}>FC</span>
                  <strong style={{ fontSize: '1.5rem', color: '#fff' }}>{val(eg, 'fc')}</strong> <span style={{ fontSize: '1rem', color: '#64748b' }}>bpm</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '1rem', color: '#94a3b8', marginBottom: '0.25rem' }}>FR</span>
                  <strong style={{ fontSize: '1.5rem', color: '#fff' }}>{val(eg, 'fr')}</strong> <span style={{ fontSize: '1rem', color: '#64748b' }}>/min</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '1rem', color: '#94a3b8', marginBottom: '0.25rem' }}>T°</span>
                  <strong style={{ fontSize: '1.5rem', color: '#fff' }}>{val(eg, 'temperature')}</strong> <span style={{ fontSize: '1rem', color: '#64748b' }}>°C</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Diagnostic & Traitement */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          <div style={{ background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.2)', borderRadius: '24px', padding: '2.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', color: '#34d399', marginTop: 0, marginBottom: '1.5rem', fontWeight: '700' }}>
              Diagnostic Retenu
            </h3>
            <p style={{ fontSize: '1.35rem', lineHeight: '1.6', margin: 0, color: '#f8fafc' }}>{val(diagnostic, 'diagnostic_retenu')}</p>
          </div>
          <div style={{ background: 'rgba(96, 165, 250, 0.1)', border: '1px solid rgba(96, 165, 250, 0.2)', borderRadius: '24px', padding: '2.5rem' }}>
            <h3 style={{ fontSize: '1.5rem', color: '#60a5fa', marginTop: 0, marginBottom: '1.5rem', fontWeight: '700' }}>
              Traitement
            </h3>
            <p style={{ fontSize: '1.35rem', lineHeight: '1.6', margin: 0, color: '#f8fafc', whiteSpace: 'pre-wrap' }}>{val(traitement, 'traitement_recu')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
