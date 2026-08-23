import React, { useState, useRef, useEffect } from 'react';
import { Activity, Thermometer, ChevronLeft, ChevronRight, Edit3, Undo, Redo, User, Eye, Sun } from 'lucide-react';
import { PremiumTextArea } from '../Form/PremiumInput';
import { useDynamicCatalog } from '../../utils/useDynamicCatalog';
import { DEFAULT_GENERAL } from '../../utils/catalogs/generalCatalog';
import { CheckboxGridManager } from '../UI/CheckboxGridManager';

function ExamenGeneral({ data, updateData }) {
  const [activeTab, setActiveTab] = useState('etat');
  const scrollContainerRef = useRef(null);

  const generalCatalogHook = useDynamicCatalog('generalCatalog', DEFAULT_GENERAL);

  const [history, setHistory] = useState([data?.synthese_general || '']);
  const [historyIndex, setHistoryIndex] = useState(0);

  const handleChange = (e) => updateData({ [e.target.id]: e.target.value });

  useEffect(() => {
    generateSynthesis();
  }, [data?.general_checks, data?.general_notes]);

  useEffect(() => {
    const currentSynthese = data?.synthese_general || '';
    const lastSaved = history[historyIndex];
    if (currentSynthese !== lastSaved) {
      const timer = setTimeout(() => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(currentSynthese);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [data?.synthese_general]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      updateData({ synthese_general: history[newIndex] });
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      updateData({ synthese_general: history[newIndex] });
    }
  };

  const generateSynthesis = () => {
    let parts = [];
    const checks = data?.general_checks || {};
    
    const activeChecks = generalCatalogHook.catalog.filter(c => checks[c.id]).map(c => c.label);
    if (activeChecks.length > 0) {
      parts.push(`Examen Général : ${activeChecks.join(', ')}.`);
    }

    if (data?.general_notes) {
      parts.push(`Notes complémentaires : ${data.general_notes}`);
    }

    const draft = parts.join('\n');
    updateData({ synthese_general: draft });
  };

  const tabs = [
    { id: 'etat', label: 'État Général & Conscience', icon: <User size={14} /> },
    { id: 'facies', label: 'Faciès & Muqueuses', icon: <Eye size={14} /> },
    { id: 'tissu', label: 'Tissu sous-cutané / Hydratation', icon: <Sun size={14} /> },
    { id: 'endo', label: 'Glandes Endocrines', icon: <Activity size={14} /> }
  ];

  const scrollLeft = () => {
    if (scrollContainerRef.current) scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
  };

  return (
    <div className="animate-fade-in glass-panel" style={{ padding: '3rem' }}>
      <header className="section-header">
        <h2 className="section-title">
          <Thermometer className="section-icon" />
          Examen Général & Constantes
        </h2>
      </header>

      <h4 style={{ marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '1px dashed var(--surface-border)', paddingBottom: '0.5rem' }}>
        Constantes Vitales & Anthropométrie
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
        <div className="input-group">
            <label className="input-label" htmlFor="temperature">Température</label>
            <div className="input-with-unit">
                <input type="number" step="0.1" id="temperature" className="input-field" value={data?.temperature || ''} onChange={handleChange} placeholder="37.5" />
                <span className="unit-label">°C</span>
            </div>
        </div>
        <div className="input-group">
            <label className="input-label" htmlFor="pouls">Pouls</label>
            <div className="input-with-unit">
                <input type="number" id="pouls" className="input-field" value={data?.pouls || ''} onChange={handleChange} placeholder="80" />
                <span className="unit-label">bpm</span>
            </div>
        </div>
        <div className="input-group">
            <label className="input-label" htmlFor="frequence_respiratoire">Fréquence Respiratoire</label>
            <div className="input-with-unit">
                <input type="number" id="frequence_respiratoire" className="input-field" value={data?.frequence_respiratoire || ''} onChange={handleChange} placeholder="16" />
                <span className="unit-label">c/min</span>
            </div>
        </div>
        <div className="input-group">
            <label className="input-label">Tension Artérielle</label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input type="number" id="tension_systolique" className="input-field" style={{ flex: 1 }} value={data?.tension_systolique || ''} onChange={handleChange} placeholder="Sys" />
                <span style={{ color: 'var(--text-muted)' }}>/</span>
                <input type="number" id="tension_diastolique" className="input-field" style={{ flex: 1 }} value={data?.tension_diastolique || ''} onChange={handleChange} placeholder="Dia" />
                <span className="unit-label" style={{ marginLeft: '0.5rem' }}>mmHg</span>
            </div>
        </div>
        <div className="input-group">
            <label className="input-label" htmlFor="sato2">Saturation O2 (SpO2)</label>
            <div className="input-with-unit">
                <input type="number" id="sato2" className="input-field" value={data?.sato2 || ''} onChange={handleChange} placeholder="98" />
                <span className="unit-label">%</span>
            </div>
        </div>
        <div className="input-group">
            <label className="input-label" htmlFor="poids">Poids</label>
            <div className="input-with-unit">
                <input type="number" id="poids" className="input-field" value={data?.poids || ''} onChange={handleChange} placeholder="70" />
                <span className="unit-label">kg</span>
            </div>
        </div>
        <div className="input-group">
          <label className="input-label" htmlFor="taille">Taille</label>
          <div className="input-with-unit">
            <input type="number" step="0.01" id="taille" className="input-field" value={data?.taille || ''} onChange={handleChange} placeholder="1.75" />
            <span className="unit-label">m</span>
          </div>
        </div>
        <div className="input-group">
          <label className="input-label">IMC (Calcul Automatique)</label>
          <div className="input-field" style={{ backgroundColor: 'var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {(() => {
              if (data?.poids && data?.taille) {
                const imc = (parseFloat(data.poids) / (parseFloat(data.taille) * parseFloat(data.taille))).toFixed(1);
                let color = 'var(--text-secondary)';
                let label = '';
                
                if (imc < 18.5) { color = '#3b82f6'; label = 'Dénutrition'; }
                else if (imc >= 18.5 && imc <= 24.9) { color = '#22c55e'; label = 'Normal'; }
                else if (imc >= 25 && imc <= 29.9) { color = '#f59e0b'; label = 'Surpoids'; }
                else { color = 'var(--danger)'; label = 'Obésité'; }

                return (
                  <>
                    <span style={{ fontWeight: 'bold' }}>{imc} kg/m²</span>
                    <span style={{ 
                      backgroundColor: color, 
                      color: 'white', 
                      padding: '0.2rem 0.6rem', 
                      borderRadius: '12px', 
                      fontSize: '0.8rem', 
                      fontWeight: 'bold',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      {label}
                    </span>
                  </>
                );
              }
              return <span>-</span>;
            })()}
          </div>
        </div>
      </div>

      <h4 style={{ marginBottom: '1.5rem', color: 'var(--primary)', borderBottom: '1px dashed var(--surface-border)', paddingBottom: '0.5rem' }}>
        Examen Physique Général
      </h4>

      {/* Premium Tab Carousel */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2.5rem', gap: '0.5rem' }}>
        <button onClick={scrollLeft} style={{ background: 'var(--surface-border)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-main)', flexShrink: 0 }}>
          <ChevronLeft size={20} />
        </button>
        
        <div 
          ref={scrollContainerRef}
          style={{ 
            display: 'flex', gap: '0.8rem', overflowX: 'auto', padding: '0.5rem 0',
            scrollbarWidth: 'none', msOverflowStyle: 'none', scrollSnapType: 'x mandatory', flex: 1
          }}
        >
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                scrollSnapAlign: 'center',
                padding: '0.75rem 1.25rem',
                background: activeTab === tab.id ? 'var(--primary)' : 'var(--surface)',
                color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                border: `1px solid ${activeTab === tab.id ? 'var(--primary)' : 'var(--surface-border)'}`,
                borderRadius: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: activeTab === tab.id ? 'bold' : '500',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <button onClick={scrollRight} style={{ background: 'var(--surface-border)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-main)', flexShrink: 0 }}>
          <ChevronRight size={20} />
        </button>
      </div>

      {activeTab === 'etat' && (
        <div className="animate-fade-in">
          <CheckboxGridManager categoryName="gen_etat" catalogHook={generalCatalogHook} data={data} updateData={updateData} dataKeyPrefix="general_checks" />
        </div>
      )}

      {activeTab === 'facies' && (
        <div className="animate-fade-in">
          <CheckboxGridManager categoryName="gen_facies" catalogHook={generalCatalogHook} data={data} updateData={updateData} dataKeyPrefix="general_checks" />
        </div>
      )}

      {activeTab === 'tissu' && (
        <div className="animate-fade-in">
          <CheckboxGridManager categoryName="gen_tissu" catalogHook={generalCatalogHook} data={data} updateData={updateData} dataKeyPrefix="general_checks" />
        </div>
      )}

      {activeTab === 'endo' && (
        <div className="animate-fade-in">
          <CheckboxGridManager categoryName="gen_endo" catalogHook={generalCatalogHook} data={data} updateData={updateData} dataKeyPrefix="general_checks" />
        </div>
      )}

      {/* --- SYNTHÈSE --- */}
      <div style={{ marginTop: '2.5rem', paddingTop: '2.5rem', borderTop: '2px dashed var(--surface-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
          <h4 style={{ margin: 0, color: 'var(--primary)' }}>Synthèse de l'Examen Général</h4>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button 
              type="button" 
              className="premium-tag"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              title="Annuler (Retour en arrière)"
              style={{ padding: '8px', opacity: historyIndex <= 0 ? 0.5 : 1, cursor: historyIndex <= 0 ? 'default' : 'pointer', background: 'var(--surface-border)', color: 'var(--text-main)' }}
            >
              <Undo size={16} />
            </button>
            <button 
              type="button" 
              className="premium-tag"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              title="Rétablir (Retour en avant)"
              style={{ padding: '8px', opacity: historyIndex >= history.length - 1 ? 0.5 : 1, cursor: historyIndex >= history.length - 1 ? 'default' : 'pointer', background: 'var(--surface-border)', color: 'var(--text-main)' }}
            >
              <Redo size={16} />
            </button>
            <button 
              className="premium-tag" 
              onClick={generateSynthesis}
              style={{ background: 'var(--brown-subtle)', color: 'var(--primary)', borderColor: 'var(--primary)', fontWeight: 'bold' }}
            >
              <Edit3 size={16} /> Regénérer
            </button>
          </div>
        </div>
        <PremiumTextArea 
          id="synthese_general" 
          label="Résumé formaté de l'examen" 
          rows={5} 
          value={data?.synthese_general || ''} 
          onChange={handleChange} 
        />
        <PremiumTextArea 
          id="general_notes" 
          label="Précisions et remarques libres" 
          rows={3} 
          value={data?.general_notes || ''} 
          onChange={handleChange} 
        />
      </div>
    </div>
  );
}


export default React.memo(ExamenGeneral);

