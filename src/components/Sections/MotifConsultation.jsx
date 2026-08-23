import React from 'react';
import { PremiumInput, PremiumTextArea } from '../Form/PremiumInput';

function MotifConsultation({ data, updateData }) {
  const handleChange = (e) => { updateData({ [e.target.id]: e.target.value }); };

  const handleTypeArrivee = (val) => {
    updateData({ type_arrivee: val });
  };

  return (
    <div className="animate-fade-in glass-panel" style={{ padding: '3rem' }}>
      <header className="section-header">
        <h2>Motif de Consultation</h2>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginBottom: '3rem' }}>
        <PremiumTextArea id="motif_principal" label="Motif(s) principal(aux)" placeholder="Symptôme principal ayant motivé la consultation" rows={3} value={data?.motif_principal || ''} onChange={handleChange} required />
      </div>
      
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ marginBottom: '1rem', color: 'var(--primary)', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>Mode d'arrivée</h4>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <div onClick={() => handleTypeArrivee('amene')} className={`btn ${data?.type_arrivee === 'amene' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Amené(e) par des tiers</div>
          <div onClick={() => handleTypeArrivee('refere')} className={`btn ${data?.type_arrivee === 'refere' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Référé(e)</div>
          <div onClick={() => handleTypeArrivee('evacue')} className={`btn ${data?.type_arrivee === 'evacue' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Évacué(e)</div>
          <div onClick={() => handleTypeArrivee('venu_seul')} className={`btn ${data?.type_arrivee === 'venu_seul' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Venu(e) de lui-même / elle-même</div>
        </div>
      </div>

      {(data?.type_arrivee === 'refere' || data?.type_arrivee === 'evacue') && (
        <div style={{ marginBottom: '2rem' }}>
          <PremiumTextArea id="motif_transfert" label="Motif du transfert (si référé/évacué)" rows={2} value={data?.motif_transfert || ''} onChange={handleChange} />
        </div>
      )}
    </div>
  );
}


export default React.memo(MotifConsultation);


