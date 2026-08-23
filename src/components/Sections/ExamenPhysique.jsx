import React from 'react';
import { PremiumCheckbox } from '../Form/PremiumCheckbox';
import { PremiumTextArea } from '../Form/PremiumInput';

function ExamenPhysique({ data, updateData }) {
  const handleCheck = (id) => {
    updateData({ [id]: !data?.[id] });
  };

  const handleChange = (e) => {
    updateData({ [e.target.id]: e.target.value });
  };

  return (
    <div className="animate-fade-in glass-panel" style={{ padding: '2rem' }}>
      <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Examen Physique</h3>
      
      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>Examen Général</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <PremiumCheckbox id="dynamique" label="Dynamique" checked={!!data?.dynamique} onChange={() => handleCheck('dynamique')} />
          <PremiumCheckbox id="somnolent" label="Somnolent" checked={!!data?.somnolent} onChange={() => handleCheck('somnolent')} />
          <PremiumCheckbox id="paleur" label="Pâleur conjonctivale" checked={!!data?.paleur} onChange={() => handleCheck('paleur')} />
          <PremiumCheckbox id="ictere" label="Ictère sclérotique" checked={!!data?.ictere} onChange={() => handleCheck('ictere')} />
          <PremiumCheckbox id="omi" label="Œdème des Membres Inférieurs (OMI)" checked={!!data?.omi} onChange={() => handleCheck('omi')} />
          <PremiumCheckbox id="deshydratation" label="Plis cutanés (Déshydratation)" checked={!!data?.deshydratation} onChange={() => handleCheck('deshydratation')} />
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>Appareil Pleuro-Pulmonaire</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <PremiumCheckbox id="tirage" label="Tirage intercostal" checked={!!data?.tirage} onChange={() => handleCheck('tirage')} />
          <PremiumCheckbox id="balancement" label="Balancement thoraco-abdominal" checked={!!data?.balancement} onChange={() => handleCheck('balancement')} />
          <PremiumCheckbox id="rales" label="Râles" checked={!!data?.rales} onChange={() => handleCheck('rales')} />
          <PremiumCheckbox id="sibilants" label="Sibilants" checked={!!data?.sibilants} onChange={() => handleCheck('sibilants')} />
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>Appareil Cardio-Circulatoire</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <PremiumCheckbox id="turgescence" label="Turgescence jugulaire" checked={!!data?.turgescence} onChange={() => handleCheck('turgescence')} />
          <PremiumCheckbox id="cyanose" label="Cyanose" checked={!!data?.cyanose} onChange={() => handleCheck('cyanose')} />
          <PremiumCheckbox id="souffle" label="Souffle cardiaque" checked={!!data?.souffle} onChange={() => handleCheck('souffle')} />
        </div>
      </div>

      <PremiumTextArea 
        id="examen_notes" 
        label="Notes complémentaires de l'examen physique" 
        placeholder="Détails supplémentaires..." 
        value={data?.examen_notes || ''} 
        onChange={handleChange} 
      />
    </div>
  );
}


export default React.memo(ExamenPhysique);

