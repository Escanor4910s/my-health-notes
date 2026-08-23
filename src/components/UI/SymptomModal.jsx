import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useSymptomCatalog } from '../../utils/useSymptomCatalog';

export default function SymptomModal({ symptom, onClose }) {
  const { getFields } = useSymptomCatalog();
  
  // Prevent body scroll only when modal is truly open
  useEffect(() => {
    if (symptom) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = ''; // restore
      };
    }
  }, [symptom]);

  if (!symptom) return null;

  const fields = getFields(symptom.type);

  return createPortal(
    <div 
      className="modal-backdrop animate-fade-in" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div 
        className="modal-content glass-panel"
        onClick={e => e.stopPropagation()} // Prevent click from closing modal
        style={{
          width: '100%',
          maxWidth: '500px',
          maxHeight: '80vh',
          overflowY: 'auto',
          position: 'relative',
          padding: '2rem'
        }}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)'
          }}
        >
          <X size={24} />
        </button>

        <h3 style={{ 
          fontFamily: 'var(--font-display)', 
          color: 'var(--primary)', 
          fontSize: '1.5rem', 
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--surface-border)',
          paddingBottom: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          Caractéristiques : {symptom.type}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem' }}>
          {fields.map(field => {
            const val = symptom.caracteristiques[field.id];
            if (!val) return null; // Don't show empty fields

            return (
              <div key={field.id} style={{ 
                background: 'var(--beige-light)', 
                padding: '1rem', 
                borderRadius: '8px', 
                border: '1px solid var(--surface-border)',
                gridColumn: field.type === 'textarea' ? '1 / -1' : 'auto'
              }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '700', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  {field.label}
                </div>
                <div style={{ color: 'var(--text-main)', fontSize: '1.05rem', lineHeight: '1.5', fontWeight: '500' }}>
                  {val}
                </div>
              </div>
            );
          })}

          {Object.keys(symptom.caracteristiques).length === 0 && (
            <p style={{ color: 'var(--text-light)', fontStyle: 'italic', gridColumn: '1 / -1' }}>
              Aucune caractéristique n'a été renseignée pour ce symptôme.
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
