import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { PremiumCheckbox } from '../Form/PremiumCheckbox';
import { PremiumInput, PremiumTextArea } from '../Form/PremiumInput';
import { useAntecedentsCatalog } from '../../utils/useAntecedentsCatalog';
import { Plus, Trash2, Edit3, Check, X, Settings } from 'lucide-react';

export default React.memo(function Antecedents({ data, updateData, patientSexe }) {
  const handleCheck = (id) => { updateData({ [id]: !data?.[id] }); };
  const handleChange = (e) => { updateData({ [e.target.id]: e.target.value }); };

  const { catalog, addCustomAntecedent, deleteCustomAntecedent } = useAntecedentsCatalog();
  const [activeAnt, setActiveAnt] = useState(null);
  const [antFormData, setAntFormData] = useState({});
  const [newAntInput, setNewAntInput] = useState('');
  
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const confirmedChir = data?.antecedents_chirurgicaux_list || [];
  const confirmedAnts = data?.antecedents_medicaux_list || [];
  
  const handleEditAnt = (item, existingData = null) => {
    setActiveAnt(item.id);
    setAntFormData(existingData || { id: item.id, label: item.label, type: item.type || 'med' });
  };
  
  const handleSaveAnt = () => {
    if (!activeAnt) return;
    const type = antFormData.type || catalog.find(c => c.id === activeAnt)?.type || 'med';
    
    if (type === 'chir') {
      const existingIndex = confirmedChir.findIndex(a => a.id === activeAnt);
      let newList = [...confirmedChir];
      if (existingIndex >= 0) newList[existingIndex] = antFormData;
      else newList.push(antFormData);
      updateData({ antecedents_chirurgicaux_list: newList });
    } else {
      const existingIndex = confirmedAnts.findIndex(a => a.id === activeAnt);
      let newList = [...confirmedAnts];
      if (existingIndex >= 0) newList[existingIndex] = antFormData;
      else newList.push(antFormData);
      updateData({ antecedents_medicaux_list: newList });
    }
    setActiveAnt(null);
    setAntFormData({});
  };
  
  const handleDeleteConfirmedAnt = (idToRemove, type = 'med') => {
    if (type === 'chir') {
      updateData({ antecedents_chirurgicaux_list: confirmedChir.filter(a => a.id !== idToRemove) });
    } else {
      updateData({ antecedents_medicaux_list: confirmedAnts.filter(a => a.id !== idToRemove) });
    }
  };

  const chirKeys = ['appendicectomie', 'cesarienne', 'hernie', 'fracture_osteosynthese', 'cholecystectomie', 'autre_chirurgie'];
  const hasChir = chirKeys.some(key => data?.[key]);

  const allerKeys = ['allergie_medicamenteuse', 'allergie_alimentaire', 'rhinite_allergique'];
  const hasAller = allerKeys.some(key => data?.[key]);

  const modeVieKeys = ['consommation_tabac', 'consommation_alcool', 'consommation_drogues', 'sedentaire', 'sportif', 'vaccination_jour'];
  const hasModeVie = modeVieKeys.some(key => data?.[key]);

  return (
    <div className="animate-fade-in glass-panel" style={{ padding: '3rem' }}>
      <header className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Antécédents</h2>
        <button 
          className="tag-manager-btn"
          onClick={() => setIsManagerOpen(true)}
        >
          <Settings size={18} /> Gérer la banque
        </button>
      </header>

      {/* A) Antécédents Médicaux */}
      <div style={{ marginBottom: '3rem' }}>
        <h4 style={{ marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
          Antécédents Médicaux personnels
        </h4>

        {/* LIST OF CONFIRMED ANTECEDENTS */}
        {confirmedAnts.length > 0 && !activeAnt && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {confirmedAnts.map(ant => (
              <div key={ant.id} className="animate-fade-in" style={{ background: 'var(--beige)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--surface-border)', position: 'relative' }}>
                <h5 style={{ margin: '0 0 0.5rem 0', color: 'var(--noir)', paddingRight: '3rem' }}>{ant.label}</h5>
                {ant.id === 'hta' || ant.id === 'diabete' ? (
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    <p style={{ margin: '0 0 0.25rem 0' }}><strong>Suivi depuis :</strong> {ant.suivi || 'Non précisé'}</p>
                    <p style={{ margin: '0 0 0.25rem 0' }}><strong>Molécule :</strong> {ant.molecule || 'Non précisée'}</p>
                    <p style={{ margin: '0' }}><strong>Posologie :</strong> {ant.posologie || 'Non précisée'}</p>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    <p style={{ margin: 0 }}>{ant.details || 'Aucun détail'}</p>
                  </div>
                )}
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEditAnt({ id: ant.id, label: ant.label }, ant)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '0.2rem' }}><Edit3 size={18} /></button>
                  <button onClick={() => handleDeleteConfirmedAnt(ant.id, 'med')} style={{ background: 'transparent', border: 'none', color: 'var(--text-light)', cursor: 'pointer', padding: '0.2rem' }}><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ACTIVE FORM FOR AN ANTECEDENT */}
        {activeAnt && antFormData.type !== 'chir' ? (
          <div className="animate-fade-in" style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '16px', border: '1.5px solid var(--primary)', boxShadow: 'var(--shadow-sm)', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h5 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--primary)' }}>Détails : {antFormData.label}</h5>
              <button onClick={() => setActiveAnt(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-light)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            {activeAnt === 'hta' || activeAnt === 'diabete' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                <PremiumInput 
                  id="suivi" 
                  label="Traité et suivi depuis quand ?" 
                  value={antFormData.suivi || ''} 
                  onChange={(e) => setAntFormData({ ...antFormData, suivi: e.target.value })} 
                  placeholder="Ex: 5 ans, depuis 2018..." 
                />
                <PremiumInput 
                  id="molecule" 
                  label="Molécule utilisée" 
                  value={antFormData.molecule || ''} 
                  onChange={(e) => setAntFormData({ ...antFormData, molecule: e.target.value })} 
                  placeholder="Ex: Amlodipine, Metformine..." 
                />
                <PremiumInput 
                  id="posologie" 
                  label="Posologie" 
                  value={antFormData.posologie || ''} 
                  onChange={(e) => setAntFormData({ ...antFormData, posologie: e.target.value })} 
                  placeholder="Ex: 10mg / jour" 
                />
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', lineHeight: '1.5' }}>
                  Veuillez préciser l'année de diagnostic, le suivi médical, les traitements passés ou en cours, ainsi que toute information pertinente concernant <strong>{antFormData.label}</strong>. 
                  <br /><em>(La saisie vocale est disponible sur votre clavier mobile)</em>
                </p>
                <PremiumTextArea 
                  id="details" 
                  label="Informations complémentaires" 
                  value={antFormData.details || ''} 
                  onChange={(e) => setAntFormData({ ...antFormData, details: e.target.value })} 
                  placeholder="Détails du suivi..."
                  rows={4}
                />
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button onClick={handleSaveAnt} className="btn" style={{ flex: 1, background: 'var(--primary)', color: 'white', padding: '0.8rem', borderRadius: '30px', fontWeight: 'bold' }}>
                <Check size={18} style={{ marginRight: '0.5rem' }}/> Confirmer
              </button>
              <button onClick={() => setActiveAnt(null)} className="btn" style={{ flex: 1, background: 'transparent', color: 'var(--text-main)', border: '1.5px solid var(--surface-border)', padding: '0.8rem', borderRadius: '30px', fontWeight: 'bold' }}>
                Annuler
              </button>
            </div>
          </div>
        ) : !activeAnt ? (
          /* UNSELECTED CATALOG */
          <div className="animate-fade-in">
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>Sélectionnez un antécédent pour renseigner ses détails :</p>
            <div className="premium-tag-bank" style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {catalog.filter(c => c.type === 'med').map(item => {
                const isConfirmed = confirmedAnts.some(a => a.id === item.id);
                if (isConfirmed) return null; // Hide if already confirmed
                return (
                  <button 
                    key={item.id} 
                    className="premium-tag"
                    onClick={() => handleEditAnt(item)}
                  >
                    <Plus size={16} /> {item.label}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', background: 'var(--beige-light)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--surface-border)', maxWidth: '500px' }}>
              <input 
                type="text" 
                style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1.5px solid var(--surface-border)', outline: 'none' }} 
                placeholder="Autre pathologie (Ex: Glaucome...)" 
                id="new-med-input"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    e.preventDefault();
                    const newId = addCustomAntecedent(e.target.value, 'med');
                    if (newId) handleEditAnt({ id: newId, label: e.target.value.trim(), type: 'med' });
                    e.target.value = '';
                  }
                }}
              />
              <button 
                type="button" 
                className="btn"
                style={{ background: 'var(--primary)', color: 'white', fontWeight: 'bold' }}
                onClick={() => {
                  const input = document.getElementById('new-med-input');
                  if (input && input.value.trim()) {
                    const newId = addCustomAntecedent(input.value, 'med');
                    if (newId) handleEditAnt({ id: newId, label: input.value.trim(), type: 'med' });
                    input.value = '';
                  }
                }}
              >
                Ajouter
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* B) Antécédents Chirurgicaux */}
      <div style={{ marginBottom: '3rem' }}>
        <h4 style={{ marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
          Antécédents Chirurgicaux personnels
        </h4>

        {/* LIST OF CONFIRMED SURGICAL ANTECEDENTS */}
        {confirmedChir.length > 0 && !activeAnt && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {confirmedChir.map(ant => (
              <div key={ant.id} className="animate-fade-in" style={{ background: 'var(--beige)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--surface-border)', position: 'relative' }}>
                <h5 style={{ margin: '0 0 0.5rem 0', color: 'var(--noir)', paddingRight: '3rem' }}>{ant.label}</h5>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <p style={{ margin: '0 0 0.25rem 0' }}><strong>Date :</strong> {ant.date || 'Non précisée'}</p>
                  <p style={{ margin: '0 0 0.25rem 0' }}><strong>Lieu :</strong> {ant.lieu || 'Non précisé'}</p>
                  <p style={{ margin: '0 0 0.25rem 0' }}><strong>Indication :</strong> {ant.indication || 'Non précisée'}</p>
                  <p style={{ margin: '0' }}><strong>Suites :</strong> {ant.suites || 'Non précisées'}</p>
                </div>
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEditAnt({ id: ant.id, label: ant.label, type: 'chir' }, ant)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '0.2rem' }}><Edit3 size={18} /></button>
                  <button onClick={() => handleDeleteConfirmedAnt(ant.id, 'chir')} style={{ background: 'transparent', border: 'none', color: 'var(--text-light)', cursor: 'pointer', padding: '0.2rem' }}><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ACTIVE FORM FOR SURGERY */}
        {activeAnt && antFormData.type === 'chir' ? (
          <div className="animate-fade-in" style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '16px', border: '1.5px solid var(--primary)', boxShadow: 'var(--shadow-sm)', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h5 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--primary)' }}>Détails de l'intervention : {antFormData.label}</h5>
              <button onClick={() => setActiveAnt(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-light)', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              <PremiumInput 
                id="date" 
                label="Date de l'intervention (ou année)" 
                value={antFormData.date || ''} 
                onChange={(e) => setAntFormData({ ...antFormData, date: e.target.value })} 
                placeholder="Ex: 2019, Il y a 5 ans..." 
              />
              <PremiumInput 
                id="lieu" 
                label="Lieu / Hôpital" 
                value={antFormData.lieu || ''} 
                onChange={(e) => setAntFormData({ ...antFormData, lieu: e.target.value })} 
                placeholder="Ex: Hôpital Principal..." 
              />
              <PremiumInput 
                id="indication" 
                label="Indication (Motif)" 
                value={antFormData.indication || ''} 
                onChange={(e) => setAntFormData({ ...antFormData, indication: e.target.value })} 
                placeholder="Ex: Appendicite aiguë..." 
              />
              <PremiumInput 
                id="suites" 
                label="Suites opératoires" 
                value={antFormData.suites || ''} 
                onChange={(e) => setAntFormData({ ...antFormData, suites: e.target.value })} 
                placeholder="Ex: Simples, infection cicatrice..." 
              />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button onClick={handleSaveAnt} className="btn" style={{ flex: 1, background: 'var(--primary)', color: 'white', padding: '0.8rem', borderRadius: '30px', fontWeight: 'bold' }}>
                <Check size={18} style={{ marginRight: '0.5rem' }}/> Confirmer
              </button>
              <button onClick={() => setActiveAnt(null)} className="btn" style={{ flex: 1, background: 'transparent', color: 'var(--text-main)', border: '1.5px solid var(--surface-border)', padding: '0.8rem', borderRadius: '30px', fontWeight: 'bold' }}>
                Annuler
              </button>
            </div>
          </div>
        ) : !activeAnt ? (
          /* UNSELECTED CATALOG */
          <div className="animate-fade-in">
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>Sélectionnez un antécédent chirurgical pour renseigner ses détails :</p>
            <div className="premium-tag-bank" style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {catalog.filter(c => c.type === 'chir').map(item => {
                const isConfirmed = confirmedChir.some(a => a.id === item.id);
                if (isConfirmed) return null; // Hide if already confirmed
                return (
                  <button 
                    key={item.id} 
                    className="premium-tag"
                    onClick={() => handleEditAnt(item)}
                  >
                    <Plus size={16} /> {item.label}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', background: 'var(--beige-light)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--surface-border)', maxWidth: '500px' }}>
              <input 
                type="text" 
                className="input-field"
                style={{ flex: 1 }} 
                placeholder="Autre intervention (Ex: Césarienne...)" 
                id="new-chir-input"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    e.preventDefault();
                    const newId = addCustomAntecedent(e.target.value, 'chir');
                    if (newId) handleEditAnt({ id: newId, label: e.target.value.trim(), type: 'chir' });
                    e.target.value = '';
                  }
                }}
              />
              <button 
                type="button" 
                className="btn"
                style={{ background: 'var(--primary)', color: 'white', fontWeight: 'bold' }}
                onClick={() => {
                  const input = document.getElementById('new-chir-input');
                  if (input && input.value.trim()) {
                    const newId = addCustomAntecedent(input.value, 'chir');
                    if (newId) handleEditAnt({ id: newId, label: input.value.trim(), type: 'chir' });
                    input.value = '';
                  }
                }}
              >
                Ajouter
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* C) Antécédents Gynéco-Obstétricaux */}
      {patientSexe !== 'M' && (
        <div style={{ marginBottom: '3rem' }}>
          <h4 style={{ marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
            Antécédents Gynéco-Obstétricaux personnels
          </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          <PremiumInput
            id="menarche"
            label="Ménarche (âge des premières règles, en ans)"
            type="number"
            value={data?.menarche || ''}
            onChange={handleChange}
          />
          <PremiumInput
            id="duree_cycles"
            label="Durée des cycles"
            value={data?.duree_cycles || ''}
            onChange={handleChange}
          />
          <PremiumInput
            id="ddr"
            label="DDR (Date des Dernières Règles)"
            type="date"
            value={data?.ddr || ''}
            onChange={handleChange}
          />
          <PremiumInput
            id="gestite"
            label="Gestité (G)"
            type="number"
            value={data?.gestite || ''}
            onChange={handleChange}
          />
          <PremiumInput
            id="parite"
            label="Parité (P)"
            type="number"
            value={data?.parite || ''}
            onChange={handleChange}
          />
          <PremiumInput
            id="enfants_vivants"
            label="Nombre d'enfants vivants"
            type="number"
            value={data?.enfants_vivants || ''}
            onChange={handleChange}
          />
          <PremiumInput
            id="fausses_couches"
            label="Nombre de fausses couches"
            type="number"
            value={data?.fausses_couches || ''}
            onChange={handleChange}
          />
          <PremiumInput
            id="avortements"
            label="Nombre d'avortements"
            type="number"
            value={data?.avortements || ''}
            onChange={handleChange}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { id: 'cycles_reguliers', label: 'Cycles réguliers' },
            { id: 'contraception_en_cours', label: 'Contraception en cours' },
            { id: 'menopause', label: 'Ménopause' }
          ].map((item) => (
            <PremiumCheckbox
              key={item.id}
              id={item.id}
              label={item.label}
              checked={data?.[item.id] || false}
              onChange={() => handleCheck(item.id)}
            />
          ))}
        </div>
        {(data?.cycles_reguliers || data?.contraception_en_cours || data?.menopause) && (
          <div className="animate-fade-in">
            <PremiumTextArea
              id="gyneco_details"
              label="Détails gynéco-obstétricaux"
              value={data?.gyneco_details || ''}
              onChange={handleChange}
              placeholder="Type de contraception, voie d'accouchement, etc."
            />
          </div>
        )}
      </div>

      )}
      {/* D) Antécédents Familiaux */}
      <div style={{ marginBottom: '3rem' }}>
        <h4 style={{ marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
          Antécédents Familiaux
        </h4>
        
        {/* ASCENDANTS */}
        <div style={{ marginBottom: '2rem' }}>
          <h5 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--noir)' }}>1. Ascendants</h5>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1.5rem', background: 'var(--beige)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Père</div>
            <div className="input-group">
              <label className="input-label" htmlFor="statut_pere">Statut</label>
              <select className="input-field" id="statut_pere" value={data?.statut_pere || ''} onChange={handleChange}>
                <option value="">Sélectionner...</option>
                <option value="vivant">Vivant</option>
                <option value="decede">Décédé</option>
                <option value="inconnu">Inconnu</option>
              </select>
            </div>
            {data?.statut_pere === 'vivant' && (
              <PremiumInput id="sante_pere" label="État de santé (ex: bonne santé apparente, HTA...)" value={data?.sante_pere || ''} onChange={handleChange} />
            )}
            {data?.statut_pere === 'decede' && (
              <PremiumInput id="cause_deces_pere" label="Cause du décès" value={data?.cause_deces_pere || ''} onChange={handleChange} />
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', background: 'var(--beige)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Mère</div>
            <div className="input-group">
              <label className="input-label" htmlFor="statut_mere">Statut</label>
              <select className="input-field" id="statut_mere" value={data?.statut_mere || ''} onChange={handleChange}>
                <option value="">Sélectionner...</option>
                <option value="vivante">Vivante</option>
                <option value="decedee">Décédée</option>
                <option value="inconnue">Inconnue</option>
              </select>
            </div>
            {data?.statut_mere === 'vivante' && (
              <PremiumInput id="sante_mere" label="État de santé (ex: bonne santé apparente, diabète...)" value={data?.sante_mere || ''} onChange={handleChange} />
            )}
            {data?.statut_mere === 'decedee' && (
              <PremiumInput id="cause_deces_mere" label="Cause du décès" value={data?.cause_deces_mere || ''} onChange={handleChange} />
            )}
          </div>
        </div>

        {/* CONJOINT(E) */}
        <div style={{ marginBottom: '2rem' }}>
          <h5 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--noir)' }}>2. Conjoint(e)</h5>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', background: 'var(--beige)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
            <div className="input-group">
              <label className="input-label" htmlFor="statut_conjoint">Statut</label>
              <select className="input-field" id="statut_conjoint" value={data?.statut_conjoint || ''} onChange={handleChange}>
                <option value="aucun">Aucun(e)</option>
                <option value="vivant">Vivant(e)</option>
                <option value="decede">Décédé(e)</option>
                <option value="divorce">Divorcé(e)</option>
              </select>
            </div>
            {(data?.statut_conjoint === 'vivant' || data?.statut_conjoint === 'divorce') && (
              <PremiumInput id="sante_conjoint" label="État de santé / Pathologie associée" value={data?.sante_conjoint || ''} onChange={handleChange} />
            )}
            {data?.statut_conjoint === 'decede' && (
              <PremiumInput id="cause_deces_conjoint" label="Cause du décès" value={data?.cause_deces_conjoint || ''} onChange={handleChange} />
            )}
          </div>
        </div>

        {/* COLLATÉRAUX */}
        <div style={{ marginBottom: '2rem' }}>
          <h5 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--noir)' }}>3. Collatéraux (Frères et Sœurs)</h5>
          <PremiumTextArea
            id="collateraux_details"
            label="Détails"
            value={data?.collateraux_details || ''}
            onChange={handleChange}
            placeholder="Ex: 3 frères dont 2 en bonne santé et 1 décédé de..."
            rows={2}
          />
        </div>

        {/* DESCENDANTS */}
        <div style={{ marginBottom: '2rem' }}>
          <h5 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--noir)' }}>4. Descendants (Enfants)</h5>
          <PremiumTextArea
            id="descendants_details"
            label="Détails"
            value={data?.descendants_details || ''}
            onChange={handleChange}
            placeholder="Ex: 2 enfants en bonne santé apparente..."
            rows={2}
          />
        </div>
        
      </div>

      {/* E) Antécédents Allergiques */}
      <div style={{ marginBottom: '3rem' }}>
        <h4 style={{ marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
          Antécédents Allergiques
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { id: 'allergie_medicamenteuse', label: 'Allergie médicamenteuse connue' },
            { id: 'allergie_alimentaire', label: 'Allergie alimentaire' },
            { id: 'rhinite_allergique', label: 'Allergie saisonnière / Rhinite allergique' }
          ].map((item) => (
            <PremiumCheckbox
              key={item.id}
              id={item.id}
              label={item.label}
              checked={data?.[item.id] || false}
              onChange={() => handleCheck(item.id)}
            />
          ))}
        </div>
        {hasAller && (
          <div className="animate-fade-in">
            <PremiumTextArea
              id="allergies_details"
              label="Molécule(s) / Aliment(s) incriminé(s)"
              value={data?.allergies_details || ''}
              onChange={handleChange}
              placeholder="Précisez..."
            />
          </div>
        )}
      </div>

      {/* F) Mode de Vie */}
      <div style={{ marginBottom: '3rem' }}>
        <h4 style={{ marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
          Mode de Vie
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { id: 'consommation_tabac', label: 'Consommation de Tabac' },
            { id: 'consommation_alcool', label: 'Consommation d\'Alcool' },
            { id: 'consommation_drogues', label: 'Consommation de Drogues / Stupéfiants' },
            { id: 'sedentaire', label: 'Sédentaire' },
            { id: 'sportif', label: 'Sportif' },
            { id: 'vaccination_jour', label: 'Vaccination à jour' }
          ].map((item) => (
            <PremiumCheckbox
              key={item.id}
              id={item.id}
              label={item.label}
              checked={data?.[item.id] || false}
              onChange={() => handleCheck(item.id)}
            />
          ))}
        </div>

        {data?.consommation_tabac && (
          <div className="animate-fade-in" style={{ marginBottom: '1rem' }}>
            <PremiumInput
              id="paquets_annees"
              label="Quantification tabac (Paquets-Années)"
              value={data?.paquets_annees || ''}
              onChange={handleChange}
            />
          </div>
        )}
        
        {data?.consommation_alcool && (
          <div className="animate-fade-in" style={{ marginBottom: '1rem' }}>
            <PremiumInput
              id="quantif_alcool"
              label="Quantification alcool"
              value={data?.quantif_alcool || ''}
              onChange={handleChange}
            />
          </div>
        )}

        {hasModeVie && (
          <div className="animate-fade-in">
            <PremiumTextArea
              id="mode_vie_details"
              label="Détails mode de vie"
              value={data?.mode_vie_details || ''}
              onChange={handleChange}
              placeholder="Habitat, alimentation, conditions de vie..."
            />
          </div>
        )}
      </div>



      {/* --- TAG MANAGER MODAL --- */}
      {isManagerOpen && createPortal(
        <div className="tag-manager-modal-overlay" onClick={() => setIsManagerOpen(false)}>
          <div className="tag-manager-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ padding: '1.5rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings size={20} color="var(--primary)" />
                Gestionnaire de la banque d'antécédents
              </h3>
              <button onClick={() => setIsManagerOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body" style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              <p style={{ color: 'var(--text-light)', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: 1.5 }}>
                Configurez ici votre banque globale d'antécédents. Vous pouvez supprimer les antécédents personnalisés que vous avez créés par erreur. Les antécédents par défaut ne peuvent pas être supprimés.
              </p>

              <div style={{ display: 'grid', gap: '2rem' }}>
                <div>
                  <h5 style={{ marginBottom: '1rem', color: 'var(--noir)' }}>Antécédents Médicaux</h5>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {catalog.filter(c => c.type === 'med').map(tag => (
                      <div key={tag.id} style={{ display: 'flex', alignItems: 'center', background: 'var(--beige)', border: '1px solid var(--surface-border)', padding: '0.4rem 0.8rem', borderRadius: '30px', gap: '0.5rem', fontSize: '0.9rem' }}>
                        <span>{tag.label}</span>
                        {tag.id.startsWith('custom_') && (
                          <button onClick={() => deleteCustomAntecedent(tag.id)} style={{ background: 'transparent', border: 'none', color: '#e74c3c', cursor: 'pointer', padding: 0, display: 'flex' }} title="Supprimer">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 style={{ marginBottom: '1rem', color: 'var(--noir)' }}>Antécédents Chirurgicaux</h5>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {catalog.filter(c => c.type === 'chir').map(tag => (
                      <div key={tag.id} style={{ display: 'flex', alignItems: 'center', background: 'var(--beige)', border: '1px solid var(--surface-border)', padding: '0.4rem 0.8rem', borderRadius: '30px', gap: '0.5rem', fontSize: '0.9rem' }}>
                        <span>{tag.label}</span>
                        {tag.id.startsWith('custom_') && (
                          <button onClick={() => deleteCustomAntecedent(tag.id)} style={{ background: 'transparent', border: 'none', color: '#e74c3c', cursor: 'pointer', padding: 0, display: 'flex' }} title="Supprimer">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer" style={{ padding: '1.5rem', borderTop: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'flex-end', background: 'var(--beige)' }}>
              <button className="btn" onClick={() => setIsManagerOpen(false)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
});
