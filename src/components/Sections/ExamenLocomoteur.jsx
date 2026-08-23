import React, { useState, useRef, useEffect } from 'react';
import { Activity, Beaker, PersonStanding, ChevronLeft, ChevronRight, Edit3, Undo, Redo } from 'lucide-react';
import { PremiumTextArea } from '../Form/PremiumInput';
import { useDynamicCatalog } from '../../utils/useDynamicCatalog';
import { DEFAULT_LOCOMOTEUR } from '../../utils/catalogs/locomoteurCatalog';
import { CheckboxGridManager } from '../UI/CheckboxGridManager';

function ExamenLocomoteur({ data, updateData }) {
  const [activeTab, setActiveTab] = useState('os');
  const scrollContainerRef = useRef(null);

  const locomoteurCatalogHook = useDynamicCatalog('locomoteurCatalog', DEFAULT_LOCOMOTEUR);

  const [history, setHistory] = useState([data?.synthese_locomoteur || '']);
  const [historyIndex, setHistoryIndex] = useState(0);

  const handleChange = (e) => updateData({ [e.target.id]: e.target.value });

  useEffect(() => {
    generateSynthesis();
  }, [data?.loco_checks, data?.locomoteur_notes]);

  useEffect(() => {
    const currentSynthese = data?.synthese_locomoteur || '';
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
  }, [data?.synthese_locomoteur]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      updateData({ synthese_locomoteur: history[newIndex] });
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      updateData({ synthese_locomoteur: history[newIndex] });
    }
  };

  const generateSynthesis = () => {
    let parts = [];
    const checks = data?.loco_checks || {};
    
    const activeChecks = locomoteurCatalogHook.catalog.filter(c => checks[c.id]).map(c => c.label);
    if (activeChecks.length > 0) {
      parts.push(`Signes de l'appareil locomoteur : ${activeChecks.join(', ')}.`);
    }

    if (data?.locomoteur_notes) {
      parts.push(`Notes complémentaires : ${data.locomoteur_notes}`);
    }

    const draft = parts.join('\n');
    updateData({ synthese_locomoteur: draft });
  };

  const tabs = [
    { id: 'os', label: 'Système Osseux', icon: <Beaker size={14} /> },
    { id: 'articulation', label: 'Système Articulaire', icon: <Activity size={14} /> },
    { id: 'rachis', label: 'Rachis', icon: <PersonStanding size={14} /> },
    { id: 'muscle', label: 'Système Musculaire', icon: <Activity size={14} /> }
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
          <PersonStanding className="section-icon" />
          Examen de l'Appareil Locomoteur
        </h2>
      </header>

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

      {activeTab === 'os' && (
        <div className="animate-fade-in">
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px dashed var(--surface-border)', paddingBottom: '0.5rem' }}>Examen Osseux</h3>
          <CheckboxGridManager 
            categoryName="loco_os" 
            catalogHook={locomoteurCatalogHook} 
            data={data} 
            updateData={updateData} 
            dataKeyPrefix="loco_checks"
          />
        </div>
      )}

      {activeTab === 'articulation' && (
        <div className="animate-fade-in">
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px dashed var(--surface-border)', paddingBottom: '0.5rem' }}>Examen Articulaire</h3>
          <CheckboxGridManager 
            categoryName="loco_articulation" 
            catalogHook={locomoteurCatalogHook} 
            data={data} 
            updateData={updateData} 
            dataKeyPrefix="loco_checks"
          />
        </div>
      )}

      {activeTab === 'rachis' && (
        <div className="animate-fade-in">
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px dashed var(--surface-border)', paddingBottom: '0.5rem' }}>Examen du Rachis</h3>
          <CheckboxGridManager 
            categoryName="loco_rachis" 
            catalogHook={locomoteurCatalogHook} 
            data={data} 
            updateData={updateData} 
            dataKeyPrefix="loco_checks"
          />
        </div>
      )}

      {activeTab === 'muscle' && (
        <div className="animate-fade-in">
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px dashed var(--surface-border)', paddingBottom: '0.5rem' }}>Examen Musculaire (Extra-Neuro)</h3>
          <CheckboxGridManager 
            categoryName="loco_muscle" 
            catalogHook={locomoteurCatalogHook} 
            data={data} 
            updateData={updateData} 
            dataKeyPrefix="loco_checks"
          />
        </div>
      )}

      {/* --- SYNTHÈSE --- */}
      <div style={{ marginTop: '2.5rem', paddingTop: '2.5rem', borderTop: '2px dashed var(--surface-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
          <h4 style={{ margin: 0, color: 'var(--primary)' }}>Synthèse de l'Examen Locomoteur</h4>
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
          id="synthese_locomoteur" 
          label="Résumé formaté de l'examen" 
          rows={5} 
          value={data?.synthese_locomoteur || ''} 
          onChange={handleChange} 
        />
        <PremiumTextArea 
          id="locomoteur_notes" 
          label="Précisions et remarques libres" 
          rows={3} 
          value={data?.locomoteur_notes || ''} 
          onChange={handleChange} 
        />
      </div>
    </div>
  );
}


export default React.memo(ExamenLocomoteur);

