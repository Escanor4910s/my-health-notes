import React from 'react';
import { PremiumTextArea } from '../Form/PremiumInput';

function ResumeSyndromique({ data, updateData }) {
  const handleChange = (e) => {
    updateData({ [e.target.id]: e.target.value });
  };

  return (
    <div className="animate-fade-in glass-panel" style={{ padding: '3rem' }}>
      <header className="section-header">
        <h2>Résumé et Problème Posé</h2>
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

