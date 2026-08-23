import React, { useState } from 'react';
import { PremiumTextArea } from '../Form/PremiumInput';
import { Check } from 'lucide-react';

const ChoiceGroup = ({ label, options, value, onChange }) => (
  <div style={{ marginBottom: '1rem' }}>
    {label && <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{label}</label>}
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-sm)',
            border: `1px solid ${value === opt ? 'var(--primary)' : 'var(--surface-border)'}`,
            background: value === opt ? 'var(--primary)' : 'var(--surface)',
            color: value === opt ? 'var(--blanc)' : 'var(--text-main)',
            cursor: 'pointer',
            fontSize: '0.85rem',
            transition: 'all 0.2s'
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);

export const RadioExploExamForm = ({ examId, examLabel, initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState(initialData || {});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(examId, formData, examLabel);
  };

  return (
    <div style={{
      background: 'var(--beige)',
      border: '1px solid var(--primary)',
      borderRadius: 'var(--radius-md)',
      padding: '1.5rem',
      marginTop: '1rem',
      boxShadow: 'var(--shadow-md)',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <h3 style={{ color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Check size={20} /> Renseigner : {examLabel}
      </h3>
      
      <ChoiceGroup 
        label="Résultat de l'examen" 
        options={['Normal', 'Anormal']} 
        value={formData.status} 
        onChange={(v) => handleChange('status', v)} 
      />

      {formData.status === 'Anormal' && (
        <div style={{ marginTop: '1rem', animation: 'fadeIn 0.3s ease-out' }}>
          <PremiumTextArea 
            id="resultat_details" 
            label="Détails des anomalies observées" 
            value={formData.resultat_details || ''} 
            onChange={(e) => handleChange('resultat_details', e.target.value)} 
            rows={4}
          />
        </div>
      )}

      {formData.status === 'Normal' && (
        <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '1rem' }}>
          L'examen est marqué comme normal. Aucune anomalie signalée.
        </p>
      )}
      
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', borderTop: '1px solid var(--surface-border)', paddingTop: '1rem' }}>
        <button 
          onClick={handleSave}
          disabled={!formData.status || (formData.status === 'Anormal' && !formData.resultat_details)}
          style={{
            flex: 1,
            background: (!formData.status || (formData.status === 'Anormal' && !formData.resultat_details)) ? 'var(--surface-border)' : 'var(--primary)',
            color: 'var(--blanc)',
            padding: '0.75rem',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            cursor: (!formData.status || (formData.status === 'Anormal' && !formData.resultat_details)) ? 'not-allowed' : 'pointer',
            fontWeight: '600'
          }}>
          Confirmer et Enregistrer
        </button>
        <button 
          onClick={onCancel}
          style={{
            background: 'transparent',
            color: 'var(--text-muted)',
            padding: '0.75rem 1.5rem',
            border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer'
          }}>
          Annuler
        </button>
      </div>
    </div>
  );
};
