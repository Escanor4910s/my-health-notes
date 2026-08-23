import React, { useState, useRef, useEffect } from 'react';
import { Activity, Beaker, User, Search, ChevronLeft, ChevronRight, Edit3, Undo, Redo } from 'lucide-react';
import { PremiumTextArea } from '../Form/PremiumInput';
import { useDynamicCatalog } from '../../utils/useDynamicCatalog';
import { DEFAULT_URONEPHRO } from '../../utils/catalogs/uroNephroCatalog';
import { CheckboxGridManager } from '../UI/CheckboxGridManager';

function ExamenUroNephro({ data, updateData }) {
  const [activeTab, setActiveTab] = useState('miction');
  const scrollContainerRef = useRef(null);

  const uroNephroCatalogHook = useDynamicCatalog('uroNephroCatalog', DEFAULT_URONEPHRO);

  const [history, setHistory] = useState([data?.synthese_uronephro || '']);
  const [historyIndex, setHistoryIndex] = useState(0);

  const handleChange = (e) => updateData({ [e.target.id]: e.target.value });

  useEffect(() => {
    generateSynthesis();
  }, [data?.uronephro_checks, data?.uronephro_notes]);

  useEffect(() => {
    const currentSynthese = data?.synthese_uronephro || '';
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
  }, [data?.synthese_uronephro]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      updateData({ synthese_uronephro: history[newIndex] });
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      updateData({ synthese_uronephro: history[newIndex] });
    }
  };

  const generateSynthesis = () => {
    let parts = [];
    const checks = data?.uronephro_checks || {};
    
    const activeChecks = uroNephroCatalogHook.catalog.filter(c => checks[c.id]).map(c => c.label);
    if (activeChecks.length > 0) {
      parts.push(`Signes uro-néphrologiques : ${activeChecks.join(', ')}.`);
    }

    if (data?.uronephro_notes) {
      parts.push(`Notes complémentaires : ${data.uronephro_notes}`);
    }

    const draft = parts.join('\n');
    updateData({ synthese_uronephro: draft });
  };

  const tabs = [
    { id: 'miction', label: 'Troubles Mictionnels', icon: <Beaker size={14} /> },
    { id: 'rein', label: 'Examen des Reins', icon: <Search size={14} /> },
    { id: 'ogen', label: 'Organes Génitaux Externes', icon: <User size={14} /> },
    { id: 'gyneco', label: 'Pelvien / Gynéco', icon: <Activity size={14} /> }
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
          <Beaker className="section-icon" />
          Examen Uro-Néphrologique & Génital
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

      {activeTab === 'miction' && (
        <div className="animate-fade-in">
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px dashed var(--surface-border)', paddingBottom: '0.5rem' }}>Troubles de la Miction</h3>
          <CheckboxGridManager 
            categoryName="uro_miction" 
            catalogHook={uroNephroCatalogHook} 
            data={data} 
            updateData={updateData} 
            dataKeyPrefix="uronephro_checks"
          />
        </div>
      )}

      {activeTab === 'rein' && (
        <div className="animate-fade-in">
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px dashed var(--surface-border)', paddingBottom: '0.5rem' }}>Examen Rénal et Lombaire</h3>
          <CheckboxGridManager 
            categoryName="uro_rein" 
            catalogHook={uroNephroCatalogHook} 
            data={data} 
            updateData={updateData} 
            dataKeyPrefix="uronephro_checks"
          />
        </div>
      )}

      {activeTab === 'ogen' && (
        <div className="animate-fade-in">
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px dashed var(--surface-border)', paddingBottom: '0.5rem' }}>Organes Génitaux Externes</h3>
          <CheckboxGridManager 
            categoryName="uro_ogen" 
            catalogHook={uroNephroCatalogHook} 
            data={data} 
            updateData={updateData} 
            dataKeyPrefix="uronephro_checks"
          />
        </div>
      )}

      {activeTab === 'gyneco' && (
        <div className="animate-fade-in">
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px dashed var(--surface-border)', paddingBottom: '0.5rem' }}>Examen Pelvien / Gynécologique (TV)</h3>
          <CheckboxGridManager 
            categoryName="uro_gyneco" 
            catalogHook={uroNephroCatalogHook} 
            data={data} 
            updateData={updateData} 
            dataKeyPrefix="uronephro_checks"
          />
        </div>
      )}

      {/* --- SYNTHÈSE --- */}
      <div style={{ marginTop: '2.5rem', paddingTop: '2.5rem', borderTop: '2px dashed var(--surface-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
          <h4 style={{ margin: 0, color: 'var(--primary)' }}>Synthèse de l'Examen Uro-Néphrologique</h4>
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
          id="synthese_uronephro" 
          label="Résumé formaté de l'examen" 
          rows={5} 
          value={data?.synthese_uronephro || ''} 
          onChange={handleChange} 
        />
        <PremiumTextArea 
          id="uronephro_notes" 
          label="Précisions et remarques libres" 
          rows={3} 
          value={data?.uronephro_notes || ''} 
          onChange={handleChange} 
        />
      </div>
    </div>
  );
}


export default React.memo(ExamenUroNephro);

