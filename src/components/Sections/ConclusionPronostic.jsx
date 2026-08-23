import React from 'react';
import { PremiumTextArea } from '../Form/PremiumInput';

function ConclusionPronostic({ data, updateData }) {
  const handleChange = (e) => updateData({ [e.target.id]: e.target.value });

  return (
    <div className="animate-fade-in glass-panel" style={{ padding: '3rem' }}>
      <header className="section-header"><h2>Conclusion et Pronostic</h2></header>

      <div style={{ marginBottom: '2rem' }} className="input-group">
        <label htmlFor="pronostic" className="input-label">Pronostic</label>
        <select 
          id="pronostic" 
          className="input-field"
          style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--surface-border)', background: 'var(--surface-bg)' }}
          value={data?.pronostic || ''} 
          onChange={handleChange}
        >
          <option value="">Sélectionner un pronostic...</option>
          <option value="favorable">Favorable</option>
          <option value="reserve">Réservé</option>
          <option value="defavorable">Défavorable</option>
        </select>
      </div>

      {data?.pronostic && (
        <div style={{ marginBottom: '2rem' }}>
          <PremiumTextArea 
            id="risques_encourus" 
            label="Risques encourus" 
            placeholder="Détaillez les risques encourus par le patient..." 
            value={data?.risques_encourus || ''} 
            onChange={handleChange} 
            rows={4} 
          />
        </div>
      )}

      <div style={{ marginBottom: '2rem' }}>
        <PremiumTextArea 
          id="conclusion" 
          label="Conclusion" 
          placeholder="Conclusion générale de l'observation médicale..." 
          value={data?.conclusion || ''} 
          onChange={handleChange} 
          rows={6} 
        />
      </div>
    </div>
  );
}


export default React.memo(ConclusionPronostic);

