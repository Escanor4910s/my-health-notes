import React, { useState } from 'react';
import { BioExamForm } from './BioExamForm';
import OCRScanner from '../Screens/OCRScanner';
import { RadioExploExamForm } from './RadioExploExamForm';
import { FilePlus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';

function BilanParaclinique({ data, updateData }) {
  const [activeBioExam, setActiveBioExam] = useState(null);
  const [activeRadioExam, setActiveRadioExam] = useState(null);
  const [activeExploExam, setActiveExploExam] = useState(null);
  
  const [customBioName, setCustomBioName] = useState('');
  const [customRadioName, setCustomRadioName] = useState('');
  const [customExploName, setCustomExploName] = useState('');

  // Save Handlers
  const saveBioForm = (examId, formData, label) => {
    updateData({
      bilansBiologiques: { ...(data?.bilansBiologiques || {}), [examId]: { label, data: formData } }
    });
    setActiveBioExam(null);
    setCustomBioName('');
  };

  const saveRadioForm = (examId, formData, label) => {
    updateData({
      bilansRadiologiques: { ...(data?.bilansRadiologiques || {}), [examId]: { label, data: formData } }
    });
    setActiveRadioExam(null);
    setCustomRadioName('');
  };

  const saveExploForm = (examId, formData, label) => {
    updateData({
      autresExplorations: { ...(data?.autresExplorations || {}), [examId]: { label, data: formData } }
    });
    setActiveExploExam(null);
    setCustomExploName('');
  };

  // Delete Handlers
  const deleteExam = (type, examId) => {
    const newData = { ...(data?.[type] || {}) };
    delete newData[examId];
    updateData({ [type]: newData });
  };

  // Lists
  const bioExams = [
    { id: 'bio_nfs', label: 'NFS (Hémogramme)' },
    { id: 'bio_crp', label: 'CRP (Protéine C Réactive)' },
    { id: 'bio_vs', label: 'VS (Vitesse de sédimentation)' },
    { id: 'bio_ionogramme', label: 'Ionogramme sanguin' },
    { id: 'bio_glycemie', label: 'Glycémie à jeun / HbA1c' },
    { id: 'bio_creatininemie', label: 'Bilan Rénal (Créat/Urée)' },
    { id: 'bio_transaminases', label: 'Transaminases (ASAT/ALAT)' },
    { id: 'bio_bilirubine', label: 'Bilirubine (totale/directe)' },
    { id: 'bio_tp_inr', label: 'TP / INR' },
    { id: 'bio_groupe_sanguin', label: 'Groupe sanguin / Rhésus' },
    { id: 'bio_serologies', label: 'Sérologies (VIH, Hépatite B, C)' },
    { id: 'bio_ecbu', label: 'ECBU' },
    { id: 'bio_hemocultures', label: 'Hémocultures' },
    { id: 'bio_goutte_epaisse', label: 'Goutte épaisse / Frottis' },
    { id: 'bio_autre_custom', label: 'Autre (Préciser...)' }
  ];

  const radioExams = [
    { id: 'radio_thorax', label: 'Radiographie thoracique (Rx Thorax)' },
    { id: 'radio_standard', label: 'Radiographie standard (os, ASP...)' },
    { id: 'radio_echo_abdo', label: 'Échographie abdominale' },
    { id: 'radio_echo_pelvienne', label: 'Échographie pelvienne' },
    { id: 'radio_scanner', label: 'Scanner (TDM)' },
    { id: 'radio_irm', label: 'IRM' },
    { id: 'radio_echo_cardiaque', label: 'Échographie cardiaque (ETT)' },
    { id: 'radio_autre_custom', label: 'Autre (Préciser...)' }
  ];

  const exploExams = [
    { id: 'explo_ecg', label: 'ECG (Électrocardiogramme)' },
    { id: 'explo_efr', label: 'EFR' },
    { id: 'explo_fogd', label: 'Fibroscopie (FOGD)' },
    { id: 'explo_coloscopie', label: 'Coloscopie' },
    { id: 'explo_pl', label: 'Ponction lombaire' },
    { id: 'explo_biopsie', label: 'Biopsie' },
    { id: 'explo_fond_oeil', label: 'Fond d\'œil' },
    { id: 'explo_autre_custom', label: 'Autre (Préciser...)' }
  ];

  const renderSection = (title, keyData, activeState, setActiveState, saveHandler, typeKey, examList, customName, setCustomName) => {
    const completedData = data?.[typeKey] || {};
    const completedKeys = Object.keys(completedData);
    const availableExams = examList.filter(exam => !completedKeys.includes(exam.id));

    const startCustom = () => {
      if (customName.trim()) {
        setActiveState({ id: `${typeKey}_custom_${Date.now()}`, label: customName });
      }
    };

    return (
      <div style={{ marginBottom: '3rem' }}>
        <h4 style={{ marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
          {title}
        </h4>

        {activeState ? (
          typeKey === 'bilansBiologiques' ? (
            <BioExamForm 
              examId={activeState.id} examLabel={activeState.label}
              initialData={completedData[activeState.id]?.data}
              onSave={saveHandler} onCancel={() => setActiveState(null)}
            />
          ) : (
            <RadioExploExamForm 
              examId={activeState.id} examLabel={activeState.label}
              initialData={completedData[activeState.id]?.data}
              onSave={saveHandler} onCancel={() => setActiveState(null)}
            />
          )
        ) : (
          <>
            {completedKeys.length > 0 && (
              <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--beige)', borderRadius: 'var(--radius-md)' }}>
                <h5 style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={18} /> Examens prescrits / validés
                </h5>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                  {completedKeys.map(key => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--surface-border)' }}>
                      <div>
                        <strong>{completedData[key].label}</strong>
                        {completedData[key].data?.status && <span style={{ marginLeft: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>({completedData[key].data.status})</span>}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => setActiveState({ id: key, label: completedData[key].label })} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}><Edit2 size={16} /></button>
                        <button onClick={() => deleteExam(typeKey, key)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              {availableExams.map((exam) => (
                exam.id.endsWith('_autre_custom') ? (
                  <div key={exam.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      placeholder="Autre examen..." 
                      value={customName} 
                      onChange={e => setCustomName(e.target.value)}
                      style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--surface-border)', background: 'var(--surface)', color: 'var(--text-main)' }}
                    />
                    <button 
                      onClick={startCustom}
                      disabled={!customName.trim()}
                      style={{ padding: '0.75rem', background: customName.trim() ? 'var(--primary)' : 'var(--surface-border)', color: 'var(--blanc)', border: 'none', borderRadius: 'var(--radius-sm)', cursor: customName.trim() ? 'pointer' : 'not-allowed' }}
                    >
                      <FilePlus size={18} />
                    </button>
                  </div>
                ) : (
                  <button
                    key={exam.id}
                    onClick={() => setActiveState({ id: exam.id, label: exam.label })}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.75rem 1rem', background: 'var(--surface)', border: '1px solid var(--surface-border)',
                      borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--text-main)',
                      textAlign: 'left', transition: 'all 0.2s'
                    }}
                  >
                    <FilePlus size={16} /> {exam.label}
                  </button>
                )
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="animate-fade-in glass-panel" style={{ padding: '3rem' }}>
      <header className="section-header">
        <h2>Bilan Paraclinique</h2>
      </header>

      {renderSection("A) Bilan Biologique", data?.bilansBiologiques, activeBioExam, setActiveBioExam, saveBioForm, 'bilansBiologiques', bioExams, customBioName, setCustomBioName)}
      {renderSection("B) Bilan Radiologique / Imagerie", data?.bilansRadiologiques, activeRadioExam, setActiveRadioExam, saveRadioForm, 'bilansRadiologiques', radioExams, customRadioName, setCustomRadioName)}
      {renderSection("C) Autres Explorations", data?.autresExplorations, activeExploExam, setActiveExploExam, saveExploForm, 'autresExplorations', exploExams, customExploName, setCustomExploName)}
    </div>
  );
}


export default React.memo(BilanParaclinique);


