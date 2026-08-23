import React, { useState } from 'react';
import { PremiumInput } from '../Form/PremiumInput';
import { Check } from 'lucide-react';

// Composant Helper pour les choix rapides (boutons radio stylisés)
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

export const BioExamForm = ({ examId, examLabel, initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState(initialData || {});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(examId, formData, examLabel);
  };

  const renderFormContent = () => {
    switch (examId) {
      case 'bio_nfs':
        return (
          <>
            <h5 style={{ color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>1. Lignée Érythrocytaire (Globules Rouges)</h5>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <PremiumInput id="nfs_gr" label="Hématies (T/L)" value={formData.nfs_gr || ''} onChange={(e) => handleChange('nfs_gr', e.target.value)} />
              <PremiumInput id="nfs_hb" label="Hémoglobine (g/dL)" value={formData.nfs_hb || ''} onChange={(e) => handleChange('nfs_hb', e.target.value)} />
              <PremiumInput id="nfs_ht" label="Hématocrite (%)" value={formData.nfs_ht || ''} onChange={(e) => handleChange('nfs_ht', e.target.value)} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <ChoiceGroup options={['Normale', 'Anémie', 'Polyglobulie']} value={formData.nfs_hb_status} onChange={(v) => handleChange('nfs_hb_status', v)} />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <PremiumInput id="nfs_vgm" label="VGM (fL)" value={formData.nfs_vgm || ''} onChange={(e) => handleChange('nfs_vgm', e.target.value)} />
              <PremiumInput id="nfs_tcmh" label="TCMH (pg)" value={formData.nfs_tcmh || ''} onChange={(e) => handleChange('nfs_tcmh', e.target.value)} />
              <PremiumInput id="nfs_ccmh" label="CCMH (g/dL)" value={formData.nfs_ccmh || ''} onChange={(e) => handleChange('nfs_ccmh', e.target.value)} />
              <PremiumInput id="nfs_retic" label="Réticulocytes (G/L)" value={formData.nfs_retic || ''} onChange={(e) => handleChange('nfs_retic', e.target.value)} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <ChoiceGroup label="Volume" options={['Normocytaire', 'Microcytaire', 'Macrocytaire']} value={formData.nfs_vgm_status} onChange={(v) => handleChange('nfs_vgm_status', v)} />
              <ChoiceGroup label="Couleur (CCMH)" options={['Normochrome', 'Hypochrome']} value={formData.nfs_ccmh_status} onChange={(v) => handleChange('nfs_ccmh_status', v)} />
              <ChoiceGroup label="Régénération" options={['Arégénérative', 'Régénérative']} value={formData.nfs_retic_status} onChange={(v) => handleChange('nfs_retic_status', v)} />
            </div>

            <h5 style={{ color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem', marginTop: '2rem' }}>2. Lignée Leucocytaire (Globules Blancs)</h5>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <PremiumInput id="nfs_leuco" label="Leucocytes totaux (G/L)" value={formData.nfs_leuco || ''} onChange={(e) => handleChange('nfs_leuco', e.target.value)} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <ChoiceGroup options={['Normale', 'Leucopénie', 'Hyperleucocytose']} value={formData.nfs_leuco_status} onChange={(v) => handleChange('nfs_leuco_status', v)} />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <PremiumInput id="nfs_pnn" label="PNN (G/L)" value={formData.nfs_pnn || ''} onChange={(e) => handleChange('nfs_pnn', e.target.value)} />
              <PremiumInput id="nfs_pne" label="PNE (G/L)" value={formData.nfs_pne || ''} onChange={(e) => handleChange('nfs_pne', e.target.value)} />
              <PremiumInput id="nfs_pnb" label="PNB (G/L)" value={formData.nfs_pnb || ''} onChange={(e) => handleChange('nfs_pnb', e.target.value)} />
              <PremiumInput id="nfs_lympho" label="Lymphocytes (G/L)" value={formData.nfs_lympho || ''} onChange={(e) => handleChange('nfs_lympho', e.target.value)} />
              <PremiumInput id="nfs_mono" label="Monocytes (G/L)" value={formData.nfs_mono || ''} onChange={(e) => handleChange('nfs_mono', e.target.value)} />
            </div>

            <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <ChoiceGroup label="PNN" options={['Normal', 'Neutropénie', 'Polynucléose neutrophile']} value={formData.nfs_pnn_status} onChange={(v) => handleChange('nfs_pnn_status', v)} />
              <ChoiceGroup label="Lymphocytes" options={['Normal', 'Lymphopénie', 'Hyperlymphocytose']} value={formData.nfs_lympho_status} onChange={(v) => handleChange('nfs_lympho_status', v)} />
              <ChoiceGroup label="PNE" options={['Normal', 'Hyperéosinophilie']} value={formData.nfs_pne_status} onChange={(v) => handleChange('nfs_pne_status', v)} />
            </div>

            <h5 style={{ color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem', marginTop: '2rem' }}>3. Lignée Thrombocytaire (Plaquettes)</h5>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <PremiumInput id="nfs_plaq" label="Plaquettes (G/L)" value={formData.nfs_plaq || ''} onChange={(e) => handleChange('nfs_plaq', e.target.value)} />
              <PremiumInput id="nfs_vpm" label="VPM (fL)" value={formData.nfs_vpm || ''} onChange={(e) => handleChange('nfs_vpm', e.target.value)} />
            </div>
            <div style={{ marginBottom: '2rem' }}>
              <ChoiceGroup options={['Normale', 'Thrombopénie', 'Thrombocytose']} value={formData.nfs_plaq_status} onChange={(v) => handleChange('nfs_plaq_status', v)} />
            </div>

            <h5 style={{ color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>4. Anomalies Morphologiques & Frottis</h5>
            <div style={{ marginBottom: '1rem' }}>
               <ChoiceGroup label="Anisocytose (IDR)" options={['Absente', 'Présente']} value={formData.nfs_anisocytose} onChange={(v) => handleChange('nfs_anisocytose', v)} />
               <ChoiceGroup label="Poïkilocytose" options={['Absente', 'Présente']} value={formData.nfs_poikilocytose} onChange={(v) => handleChange('nfs_poikilocytose', v)} />
               <ChoiceGroup label="Schizocytes" options={['Absents', 'Présents']} value={formData.nfs_schizocytes} onChange={(v) => handleChange('nfs_schizocytes', v)} />
               <ChoiceGroup label="Cellules anormales / Blastes" options={['Absentes', 'Présentes']} value={formData.nfs_blastes} onChange={(v) => handleChange('nfs_blastes', v)} />
            </div>
            <PremiumInput id="nfs_commentaires" label="Commentaires Frottis (Détails anomalies)" value={formData.nfs_commentaires || ''} onChange={(e) => handleChange('nfs_commentaires', e.target.value)} />
          </>
        );
      
      case 'bio_crp':
        return (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <PremiumInput id="crp_val" label="Valeur CRP (mg/L)" value={formData.crp_val || ''} onChange={(e) => handleChange('crp_val', e.target.value)} />
              <ChoiceGroup options={['Normale (<5)', 'Syndrome inflammatoire', 'Très augmentée']} value={formData.crp_status} onChange={(v) => handleChange('crp_status', v)} />
            </div>
          </>
        );

      case 'bio_vs':
        return (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <PremiumInput id="vs_val1" label="VS 1ère heure (mm)" value={formData.vs_val1 || ''} onChange={(e) => handleChange('vs_val1', e.target.value)} />
              <PremiumInput id="vs_val2" label="VS 2ème heure (mm)" value={formData.vs_val2 || ''} onChange={(e) => handleChange('vs_val2', e.target.value)} />
            </div>
            <ChoiceGroup options={['Normale', 'Accélérée']} value={formData.vs_status} onChange={(v) => handleChange('vs_status', v)} />
          </>
        );

      case 'bio_ionogramme':
        return (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <PremiumInput id="iono_na" label="Natrémie (135-145 mmol/L)" value={formData.iono_na || ''} onChange={(e) => handleChange('iono_na', e.target.value)} />
              <ChoiceGroup options={['Normale', 'Hyponatrémie', 'Hypernatrémie']} value={formData.iono_na_status} onChange={(v) => handleChange('iono_na_status', v)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <PremiumInput id="iono_k" label="Kaliémie (3.5-5.0 mmol/L)" value={formData.iono_k || ''} onChange={(e) => handleChange('iono_k', e.target.value)} />
              <ChoiceGroup options={['Normale', 'Hypokaliémie', 'Hyperkaliémie']} value={formData.iono_k_status} onChange={(v) => handleChange('iono_k_status', v)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <PremiumInput id="iono_cl" label="Chlorémie (98-107 mmol/L)" value={formData.iono_cl || ''} onChange={(e) => handleChange('iono_cl', e.target.value)} />
              <ChoiceGroup options={['Normale', 'Hypochlorémie', 'Hyperchlorémie']} value={formData.iono_cl_status} onChange={(v) => handleChange('iono_cl_status', v)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <PremiumInput id="iono_ca" label="Calcémie (2.20-2.60 mmol/L)" value={formData.iono_ca || ''} onChange={(e) => handleChange('iono_ca', e.target.value)} />
              <ChoiceGroup options={['Normale', 'Hypocalcémie', 'Hypercalcémie']} value={formData.iono_ca_status} onChange={(v) => handleChange('iono_ca_status', v)} />
            </div>
          </>
        );

      case 'bio_glycemie':
        return (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <PremiumInput id="glycemie_val" label="Glycémie (g/L ou mmol/L)" value={formData.glycemie_val || ''} onChange={(e) => handleChange('glycemie_val', e.target.value)} />
              <ChoiceGroup options={['Normoglycémie', 'Hypoglycémie', 'Hyperglycémie', 'Diabète']} value={formData.glycemie_status} onChange={(v) => handleChange('glycemie_status', v)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <PremiumInput id="hba1c" label="HbA1c (%)" value={formData.hba1c || ''} onChange={(e) => handleChange('hba1c', e.target.value)} />
            </div>
          </>
        );

      case 'bio_creatininemie':
        return (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <PremiumInput id="creatinine_val" label="Créatininémie (mg/L ou µmol/L)" value={formData.creatinine_val || ''} onChange={(e) => handleChange('creatinine_val', e.target.value)} />
              <PremiumInput id="dfg_val" label="DFG (mL/min/1.73m²)" value={formData.dfg_val || ''} onChange={(e) => handleChange('dfg_val', e.target.value)} />
              <ChoiceGroup options={['Normale', 'Insuffisance Rénale']} value={formData.creatinine_status} onChange={(v) => handleChange('creatinine_status', v)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <PremiumInput id="uree_val" label="Urée (g/L ou mmol/L)" value={formData.uree_val || ''} onChange={(e) => handleChange('uree_val', e.target.value)} />
              <ChoiceGroup options={['Normale', 'Augmentée', 'Diminuée']} value={formData.uree_status} onChange={(v) => handleChange('uree_status', v)} />
            </div>
          </>
        );

      case 'bio_transaminases':
        return (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <PremiumInput id="asat_val" label="ASAT / TGO (UI/L)" value={formData.asat_val || ''} onChange={(e) => handleChange('asat_val', e.target.value)} />
              <PremiumInput id="alat_val" label="ALAT / TGP (UI/L)" value={formData.alat_val || ''} onChange={(e) => handleChange('alat_val', e.target.value)} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <ChoiceGroup options={['Normales', 'Cytolyse légère (<5N)', 'Cytolyse modérée (5-10N)', 'Cytolyse sévère (>10N)']} value={formData.transa_status} onChange={(v) => handleChange('transa_status', v)} />
              <ChoiceGroup label="Ratio" options={['ASAT < ALAT (Normal)', 'ASAT > ALAT']} value={formData.transa_ratio} onChange={(v) => handleChange('transa_ratio', v)} />
            </div>
          </>
        );

      case 'bio_bilirubine':
        return (
          <>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <PremiumInput id="bili_totale" label="Bilirubine Totale (µmol/L ou mg/L)" value={formData.bili_totale || ''} onChange={(e) => handleChange('bili_totale', e.target.value)} />
              <PremiumInput id="bili_conj" label="Bilirubine Conjuguée (Directe)" value={formData.bili_conj || ''} onChange={(e) => handleChange('bili_conj', e.target.value)} />
              <PremiumInput id="bili_libre" label="Bilirubine Libre (Indirecte)" value={formData.bili_libre || ''} onChange={(e) => handleChange('bili_libre', e.target.value)} />
            </div>
            <ChoiceGroup options={['Normale', 'Ictère à prédominance conjuguée', 'Ictère à prédominance libre']} value={formData.bili_status} onChange={(v) => handleChange('bili_status', v)} />
          </>
        );

      default:
        return (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <PremiumInput id="resultat" label="Résultats / Conclusion" value={formData.resultat || ''} onChange={(e) => handleChange('resultat', e.target.value)} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <ChoiceGroup options={['Normal', 'Anormal']} value={formData.status} onChange={(v) => handleChange('status', v)} />
            </div>
          </>
        );
    }
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
      
      {renderFormContent()}
      
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', borderTop: '1px solid var(--surface-border)', paddingTop: '1rem' }}>
        <button 
          onClick={handleSave}
          style={{
            flex: 1,
            background: 'var(--primary)',
            color: 'var(--blanc)',
            padding: '0.75rem',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
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
