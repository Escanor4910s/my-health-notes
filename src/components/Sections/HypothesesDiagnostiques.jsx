import React, { useState, useEffect } from 'react';
import { PremiumInput, PremiumTextArea } from '../Form/PremiumInput';
import { Trash2 } from 'lucide-react';
import AIInlineButton from '../UI/AIInlineButton';
import { compactDossier } from '../../lib/ai';
import { getAIName } from '../../lib/aiName';

function HypothesesDiagnostiques({ data, updateData, fullFormData }) {
  const [hypotheses, setHypotheses] = useState(data?.hypotheses || [{ id: Date.now() }]);

  const updateHypothesis = (index, field, value) => {
    setHypotheses((prev) => {
      const newArr = prev.map((h, i) => (i === index ? { ...h, [field]: value } : h));
      if (updateData) updateData({ hypotheses: newArr });
      return newArr;
    });
  };

  const addHypothesis = () => {
    setHypotheses((prev) => {
      const newArr = [...prev, { id: Date.now() }];
      if (updateData) updateData({ hypotheses: newArr });
      return newArr;
    });
  };

  const removeHypothesis = (index) => {
    setHypotheses((prev) => {
      const newArr = prev.filter((_, i) => i !== index);
      if (updateData) updateData({ hypotheses: newArr });
      return newArr;
    });
  };

  const handleAIResult = (result) => {
    if (result && result.hypotheses && Array.isArray(result.hypotheses)) {
      setHypotheses(prev => {
        // Keep existing ones that have a name, add new ones
        const existing = prev.filter(h => h.nom && h.nom.trim() !== '');
        const newH = result.hypotheses.map(h => ({ ...h, id: Date.now() + Math.random() }));
        const combined = [...existing, ...newH];
        const finalArr = combined.length > 0 ? combined : [{ id: Date.now() }];
        if (updateData) updateData({ hypotheses: finalArr });
        return finalArr;
      });
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' }}>
        <div>
          <h2 className="section-header" style={{ marginBottom: '0.5rem' }}>Hypothèses Diagnostiques</h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '2rem', fontSize: '0.95rem' }}>
            Listez vos hypothèses diagnostiques du moins probable au plus probable, avec les arguments pour et contre.
          </p>
        </div>
        <AIInlineButton 
          label={`Suggérer des hypothèses avec ${getAIName()}`}
          action="hypotheses"
          payloadBuilder={() => ({ dossier: compactDossier(fullFormData) })}
          onResult={handleAIResult}
        />
      </div>

      {hypotheses.map((hypothesis, index) => (
        <div
          key={hypothesis.id}
          style={{
            background: 'var(--beige-light)',
            borderRadius: '14px',
            padding: '2rem',
            marginBottom: '2rem',
            border: '1px solid var(--surface-border)',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem' }}>Hypothèse {index + 1}</h3>
            {index > 0 && (
              <button
                onClick={() => removeHypothesis(index)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--danger)',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px'
                }}
                title="Supprimer l'hypothèse"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <PremiumInput
              label="Nom de l'hypothèse"
              value={hypothesis.nom || ''}
              onChange={(e) => updateHypothesis(index, 'nom', e.target.value)}
              placeholder="ex: Aplasie médullaire"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <h4 style={{ color: '#5A8A5E', marginBottom: '1rem', borderBottom: '1px solid #5A8A5E20', paddingBottom: '0.5rem' }}>
                Arguments Pour
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <PremiumTextArea
                  label="Sur le plan épidémiologique"
                  value={hypothesis.pour_epidemio || ''}
                  onChange={(e) => updateHypothesis(index, 'pour_epidemio', e.target.value)}
                  placeholder="Arguments épidémiologiques..."
                  rows={2}
                />
                <PremiumTextArea
                  label="Sur le plan clinique"
                  value={hypothesis.pour_clinique || ''}
                  onChange={(e) => updateHypothesis(index, 'pour_clinique', e.target.value)}
                  placeholder="Arguments cliniques..."
                  rows={2}
                />
                <PremiumTextArea
                  label="Sur le plan paraclinique"
                  value={hypothesis.pour_paraclinique || ''}
                  onChange={(e) => updateHypothesis(index, 'pour_paraclinique', e.target.value)}
                  placeholder="Arguments paracliniques..."
                  rows={2}
                />
              </div>
            </div>

            <div>
              <h4 style={{ color: '#B85C5C', marginBottom: '1rem', borderBottom: '1px solid #B85C5C20', paddingBottom: '0.5rem' }}>
                Arguments Contre
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <PremiumTextArea
                  label="Sur le plan épidémiologique"
                  value={hypothesis.contre_epidemio || ''}
                  onChange={(e) => updateHypothesis(index, 'contre_epidemio', e.target.value)}
                  placeholder="Arguments épidémiologiques..."
                  rows={2}
                />
                <PremiumTextArea
                  label="Sur le plan clinique"
                  value={hypothesis.contre_clinique || ''}
                  onChange={(e) => updateHypothesis(index, 'contre_clinique', e.target.value)}
                  placeholder="Arguments cliniques..."
                  rows={2}
                />
                <PremiumTextArea
                  label="Sur le plan paraclinique"
                  value={hypothesis.contre_paraclinique || ''}
                  onChange={(e) => updateHypothesis(index, 'contre_paraclinique', e.target.value)}
                  placeholder="Arguments paracliniques..."
                  rows={2}
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={addHypothesis}
        style={{
          width: '100%',
          padding: '0.8rem',
          borderRadius: '12px',
          background: 'transparent',
          color: 'var(--text-light)',
          border: '1.5px dashed var(--surface-border)',
          cursor: 'pointer',
          fontSize: '0.9rem',
          fontWeight: '500',
          fontFamily: 'var(--font-body)',
          transition: 'all 0.2s'
        }}
      >
        + Ajouter une hypothèse
      </button>
    </div>
  );
}


export default React.memo(HypothesesDiagnostiques);

