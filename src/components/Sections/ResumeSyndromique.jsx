import React from 'react';
import { PremiumTextArea } from '../Form/PremiumInput';
import AIInlineButton from '../UI/AIInlineButton';
import { compactDossier } from '../../lib/ai';

import { getAIName } from '../../lib/aiName';

function ResumeSyndromique({ data, updateData, fullFormData }) {
  const handleChange = (e) => {
    updateData({ [e.target.id]: e.target.value });
  };

  const handleAIResult = (result) => {
    if (result && typeof result === 'object') {
      updateData({ 
        resume: result.resume || data?.resume || '', 
        probleme: result.probleme || data?.probleme || '' 
      });
    }
  };

  return (
    <div className="animate-fade-in glass-panel" style={{ padding: '3rem' }}>
      <header className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h2>Résumé et Problème Posé</h2>
        <AIInlineButton 
          label={`Rédiger avec ${getAIName()}`}
          action="synthese"
          payloadBuilder={() => ({ dossier: compactDossier(fullFormData) })}
          onResult={handleAIResult}
        />
      </header>
      
      <div style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
        <p>Identité du patient, antécédents, motif de consultation, résumé syndromique de l'HDM et de l'examen physique.</p>
      </div>

      <PremiumTextArea 
        id="resume" 
        label="Résumé de l'observation" 
        placeholder="Ex: Patient de 45 ans, sans ATCD particulier, consulte pour..." 
        value={data?.resume || ''} 
        onChange={handleChange}
        rows={6}
      />

      <div style={{ marginTop: '3rem' }}>
        <PremiumTextArea 
          id="probleme" 
          label="Le problème que le patient nous pose" 
          placeholder="Ex: Le patient pose un problème de diagnostic étiologique d'une hématémèse..." 
          value={data?.probleme || ''} 
          onChange={handleChange}
          rows={3}
        />
      </div>
    </div>
  );
}


export default React.memo(ResumeSyndromique);
