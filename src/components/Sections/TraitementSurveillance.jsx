import React, { useState, useEffect } from 'react';
import { PremiumCheckbox } from '../Form/PremiumCheckbox';
import { PremiumInput, PremiumTextArea } from '../Form/PremiumInput';
import { Trash2, Plus, AlertTriangle } from 'lucide-react';
import { checkInteractions } from '../../lib/drugInteractions';

const DynamicMedList = ({ title, meds, setMeds, detailsId, detailsValue, detailsLabel, detailsPlaceholder, handleChange }) => {
  const addMedicament = () => {
    setMeds([...meds, { id: Date.now(), molecule: '', dose: '', posologie: '' }]);
  };

  const removeMedicament = (id) => {
    setMeds(meds.filter(m => m.id !== id));
  };

  const updateMedicament = (id, field, value) => {
    setMeds(meds.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  return (
    <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: 'var(--surface-bg)', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
      <h6 style={{ marginBottom: '1rem', color: 'var(--primary)', fontSize: '1rem' }}>{title}</h6>
      
      {meds.map((med, index) => (
        <div key={med.id} style={{ display: 'grid', gridTemplateColumns: '1fr 0.6fr 1fr auto', gap: '0.75rem', alignItems: 'end', marginBottom: '0.75rem' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" style={{ fontSize: '0.8rem' }}>Molécule</label>
            <input type="text" className="input-field" placeholder="Ex: Amoxicilline" value={med.molecule || ''} onChange={(e) => updateMedicament(med.id, 'molecule', e.target.value)} />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" style={{ fontSize: '0.8rem' }}>Dose</label>
            <input type="text" className="input-field" placeholder="Ex: 1g" value={med.dose || ''} onChange={(e) => updateMedicament(med.id, 'dose', e.target.value)} />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" style={{ fontSize: '0.85rem' }}>Posologie</label>
            <input type="text" className="input-field" placeholder="Ex: 3x/jour" value={med.posologie || ''} onChange={(e) => updateMedicament(med.id, 'posologie', e.target.value)} />
          </div>
          {index > 0 ? (
            <button type="button" onClick={() => removeMedicament(med.id)} style={{ padding: '0.6rem', backgroundColor: 'transparent', color: 'var(--text-light)', border: '1px solid var(--surface-border)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40px', transition: 'all 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.background = '#fff0f0'; }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-light)'; e.currentTarget.style.borderColor = 'var(--surface-border)'; e.currentTarget.style.background = 'transparent'; }} title="Supprimer">
              <Trash2 size={18} />
            </button>
          ) : (
            <div style={{ width: '40px' }} />
          )}
        </div>
      ))}
      <button type="button" onClick={addMedicament} style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', marginBottom: '1.5rem', backgroundColor: 'transparent', border: '1.5px dashed var(--surface-border)', color: 'var(--primary)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: '500', transition: 'all 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'rgba(139,111,71,0.05)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--surface-border)'; e.currentTarget.style.background = 'transparent'; }}>
        <Plus size={18} />
        Ajouter un médicament
      </button>

      <PremiumTextArea 
        id={detailsId} 
        name={detailsId} 
        label={detailsLabel} 
        value={detailsValue || ''} 
        onChange={handleChange} 
        rows={3} 
        placeholder={detailsPlaceholder}
      />
    </div>
  );
};

const TraitementSurveillance = ({ data, updateData }) => {
  const [medsEtiologique, setMedsEtiologique] = useState(data?.medsEtiologique || [{ id: 1, molecule: '', dose: '', posologie: '' }]);
  const [medsSymptomatique, setMedsSymptomatique] = useState(data?.medsSymptomatique || [{ id: 1, molecule: '', dose: '', posologie: '' }]);
  const [medsAdjuvant, setMedsAdjuvant] = useState(data?.medsAdjuvant || [{ id: 1, molecule: '', dose: '', posologie: '' }]);
  const [interactions, setInteractions] = useState([]);

  const handleChange = (e) => {
    const { name, id, value, type, checked } = e.target;
    const key = name || id;
    updateData({
      [key]: type === 'checkbox' ? checked : value
    });
  };

  useEffect(() => {
    updateData({ 
      medsEtiologique, 
      medsSymptomatique, 
      medsAdjuvant 
    });

    const allMolecules = [
      ...medsEtiologique.map(m => m.molecule),
      ...medsSymptomatique.map(m => m.molecule),
      ...medsAdjuvant.map(m => m.molecule)
    ].filter(Boolean);
    
    setInteractions(checkInteractions(allMolecules));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medsEtiologique, medsSymptomatique, medsAdjuvant]);

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
      <div className="section-header">
        <h2>Traitement et Surveillance</h2>
      </div>

      {interactions.length > 0 && (
        <div style={{ marginBottom: '2rem', padding: '1rem 1.25rem', backgroundColor: '#fef2f2', border: '1px solid #f87171', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#dc2626', fontWeight: 'bold' }}>
            <AlertTriangle size={20} />
            <span>Attention : Interactions médicamenteuses détectées</span>
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {interactions.map((int, idx) => (
              <li key={idx} style={{ fontSize: '0.9rem', color: '#991b1b', background: '#fee2e2', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                <strong>{int.drug1} + {int.drug2} :</strong> {int.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginBottom: '2.5rem' }}>
        <h4 style={{ marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>1. BUT DU TRAITEMENT</h4>
        <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Chaque pathologie a un traitement qui vise un but précis. Décrivez les objectifs thérapeutiques.
        </p>
        <PremiumTextArea
          id="but_traitement"
          name="but_traitement"
          label="But(s) du traitement"
          value={data?.but_traitement || ''}
          onChange={handleChange}
          rows={4}
          placeholder="— Guérir l'infection&#10;— Prévenir les complications&#10;— Améliorer la qualité de vie"
        />
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.5rem' }}>
          Utilisez des tirets longs (—) pour organiser vos objectifs
        </div>
      </div>

      <div style={{ marginBottom: '2.5rem' }}>
        <h4 style={{ marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>2. MOYENS</h4>
        
        <h5 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>2a. Mesures Hygiéno-Diététiques</h5>
        <div className="checkbox-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <PremiumCheckbox id="repos_lit" name="repos_lit" label="Repos au lit" checked={data?.repos_lit || false} onChange={handleChange} />
          <PremiumCheckbox id="regime_sans_sel" name="regime_sans_sel" label="Régime sans sel" checked={data?.regime_sans_sel || false} onChange={handleChange} />
          <PremiumCheckbox id="regime_hyposode" name="regime_hyposode" label="Régime hyposodé" checked={data?.regime_hyposode || false} onChange={handleChange} />
          <PremiumCheckbox id="regime_diabetique" name="regime_diabetique" label="Régime diabétique" checked={data?.regime_diabetique || false} onChange={handleChange} />
          <PremiumCheckbox id="regime_hypoprotidique" name="regime_hypoprotidique" label="Régime hypoprotidique" checked={data?.regime_hypoprotidique || false} onChange={handleChange} />
          <PremiumCheckbox id="regime_hyperprotidique" name="regime_hyperprotidique" label="Régime hyperprotidique" checked={data?.regime_hyperprotidique || false} onChange={handleChange} />
          <PremiumCheckbox id="regime_hypocalorique" name="regime_hypocalorique" label="Régime hypocalorique" checked={data?.regime_hypocalorique || false} onChange={handleChange} />
          <PremiumCheckbox id="regime_pauvre_residus" name="regime_pauvre_residus" label="Régime pauvre en résidus" checked={data?.regime_pauvre_residus || false} onChange={handleChange} />
          <PremiumCheckbox id="arret_tabac" name="arret_tabac" label="Arrêt tabac / alcool" checked={data?.arret_tabac || false} onChange={handleChange} />
          <PremiumCheckbox id="hydratation" name="hydratation" label="Hydratation abondante" checked={data?.hydratation || false} onChange={handleChange} />
          <PremiumCheckbox id="regime_riche_fer" name="regime_riche_fer" label="Régime riche en fer" checked={data?.regime_riche_fer || false} onChange={handleChange} />
          <PremiumCheckbox id="regime_sans_gluten" name="regime_sans_gluten" label="Régime sans gluten" checked={data?.regime_sans_gluten || false} onChange={handleChange} />
        </div>
        <PremiumTextArea id="mesures_details" name="mesures_details" label="Détails mesures hygiéno-diététiques" value={data?.mesures_details || ''} onChange={handleChange} rows={3} />

        <h5 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>2b. Traitement Médical</h5>
        
        <DynamicMedList 
          title="Traitement Étiologique"
          meds={medsEtiologique} 
          setMeds={setMedsEtiologique} 
          detailsId="ttt_etiologique" 
          detailsValue={data?.ttt_etiologique}
          detailsLabel="Détails complémentaires (Traitement étiologique)"
          detailsPlaceholder="Ex: L'Amoxicilline est un antibiotique bactéricide de la famille des bêta-lactamines, utilisé ici pour éradiquer le germe responsable..."
          handleChange={handleChange}
        />

        <DynamicMedList 
          title="Traitement Symptomatique"
          meds={medsSymptomatique} 
          setMeds={setMedsSymptomatique} 
          detailsId="ttt_symptomatique" 
          detailsValue={data?.ttt_symptomatique}
          detailsLabel="Détails complémentaires (Traitement symptomatique)"
          detailsPlaceholder="Ex: Le Paracétamol est un antalgique de palier 1 et un antipyrétique, utilisé pour lutter contre la fièvre et les douleurs..."
          handleChange={handleChange}
        />

        <DynamicMedList 
          title="Traitement Adjuvant"
          meds={medsAdjuvant} 
          setMeds={setMedsAdjuvant} 
          detailsId="ttt_adjuvant" 
          detailsValue={data?.ttt_adjuvant}
          detailsLabel="Détails complémentaires (Traitement adjuvant)"
          detailsPlaceholder="Ex: La Vitamine C est utilisée pour stimuler les défenses immunitaires et lutter contre l'asthénie..."
          handleChange={handleChange}
        />

        <h5 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>2c. Traitement Chirurgical</h5>
        <PremiumTextArea id="ttt_chirurgical" name="ttt_chirurgical" label="Traitement chirurgical" value={data?.ttt_chirurgical || ''} onChange={handleChange} rows={4} placeholder="Type d'intervention, indication, technique..." />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>3. SURVEILLANCE</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <PremiumTextArea id="surveillance_clinique" name="surveillance_clinique" label="Surveillance clinique" value={data?.surveillance_clinique || ''} onChange={handleChange} rows={3} />
          <PremiumTextArea id="surveillance_paraclinique" name="surveillance_paraclinique" label="Surveillance paraclinique" value={data?.surveillance_paraclinique || ''} onChange={handleChange} rows={3} />
        </div>
      </div>
    </div>
  );
};

export default TraitementSurveillance;
