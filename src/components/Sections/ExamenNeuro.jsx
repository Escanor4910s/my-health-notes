import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { PremiumInput, PremiumTextArea } from '../Form/PremiumInput';
import { PremiumCheckbox } from '../Form/PremiumCheckbox';
import { Brain, Eye, Activity, GitCommit, Footprints, Edit3, Undo, Redo, Plus, Trash2, Settings, Check, X, Layers, Stethoscope, ChevronLeft, ChevronRight, User, HelpCircle } from 'lucide-react';
import { useNeuroCatalog } from '../../utils/useNeuroCatalog';

const GlasgowPill = ({ options, value, onChange, label }) => (
  <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--surface)', border: '1px solid var(--surface-border)', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {options.map(opt => (
        <button
          type="button"
          key={opt.val}
          onClick={() => onChange(opt.val)}
          style={{
            padding: '0.6rem 1.2rem',
            background: value == opt.val ? 'var(--primary)' : 'transparent',
            color: value == opt.val ? 'white' : 'var(--text-main)',
            border: `1px solid ${value == opt.val ? 'var(--primary)' : 'var(--surface-border)'}`,
            borderRadius: '24px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: value == opt.val ? 'bold' : '500',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: value == opt.val ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
          }}
          onMouseEnter={(e) => {
            if (value != opt.val) {
              e.target.style.borderColor = 'var(--primary)';
              e.target.style.color = 'var(--primary)';
            }
          }}
          onMouseLeave={(e) => {
            if (value != opt.val) {
              e.target.style.borderColor = 'var(--surface-border)';
              e.target.style.color = 'var(--text-main)';
            }
          }}
        >
          <span style={{ fontSize: '1.1rem', marginRight: '0.3rem' }}>{opt.val}</span> {opt.label}
        </button>
      ))}
    </div>
  </div>
);

// Composant Stickman interactif pour la cotation MRC (0 à 5)
const StickmanMRC = ({ data, updateData }) => {
  const [activeLimb, setActiveLimb] = useState(null);

  const limbs = [
    { id: 'mrc_msd', label: 'Bras Droit (MSD)', cx: 70, cy: 110, rx: 15, ry: 40, transform: 'rotate(-30 70 110)' },
    { id: 'mrc_msg', label: 'Bras Gauche (MSG)', cx: 130, cy: 110, rx: 15, ry: 40, transform: 'rotate(30 130 110)' },
    { id: 'mrc_mid', label: 'Jambe Droite (MID)', cx: 85, cy: 230, rx: 15, ry: 50, transform: 'rotate(-10 85 230)' },
    { id: 'mrc_mig', label: 'Jambe Gauche (MIG)', cx: 115, cy: 230, rx: 15, ry: 50, transform: 'rotate(10 115 230)' }
  ];

  const handleScore = (id, score) => {
    updateData({ [id]: score });
    setActiveLimb(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--surface)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--surface-border)', position: 'relative' }}>
      <p style={{ margin: '0 0 1rem 0', fontWeight: 600, color: 'var(--text-main)' }}>Cotation Segmentaire (MRC)</p>
      
      <svg width="200" height="320" viewBox="0 0 200 320" style={{ overflow: 'visible' }}>
        {/* Head */}
        <circle cx="100" cy="40" r="25" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="4" />
        {/* Torso */}
        <rect x="75" y="75" width="50" height="90" rx="15" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="4" />
        
        {/* Limbs */}
        {limbs.map(limb => (
          <g key={limb.id}>
            <ellipse 
              cx={limb.cx} cy={limb.cy} rx={limb.rx} ry={limb.ry} transform={limb.transform}
              fill={data?.[limb.id] ? "var(--primary-light, #dbeafe)" : "#f8fafc"} 
              stroke={data?.[limb.id] ? "var(--primary)" : "#cbd5e1"} 
              strokeWidth="3" 
              style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              onClick={() => setActiveLimb(activeLimb === limb.id ? null : limb.id)}
            />
            {/* Score Text or Plus Icon inside Limb */}
            <text 
              x={limb.cx} y={limb.cy + 5} 
              textAnchor="middle" 
              fill={data?.[limb.id] ? "var(--primary)" : "#64748b"} 
              fontWeight="bold"
              fontSize={data?.[limb.id] ? "16" : "20"}
              style={{ pointerEvents: 'none', transition: 'all 0.2s' }}
              transform={limb.transform}
            >
              {data?.[limb.id] || '+'}
            </text>
          </g>
        ))}
      </svg>

      {activeLimb && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          zIndex: 10, display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '180px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--primary)' }}>
              {limbs.find(l => l.id === activeLimb)?.label}
            </span>
            <button onClick={() => setActiveLimb(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={16}/></button>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[0, 1, 2, 3, 4, 5].map(score => (
              <button
                key={score}
                onClick={() => handleScore(activeLimb, `${score}/5`)}
                style={{
                  width: '40px', height: '40px', borderRadius: '8px', border: '1px solid var(--surface-border)',
                  background: data?.[activeLimb] === `${score}/5` ? 'var(--primary)' : 'var(--surface)',
                  color: data?.[activeLimb] === `${score}/5` ? 'white' : 'var(--text-main)',
                  fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                {score}
              </button>
            ))}
            <button 
              onClick={() => handleScore(activeLimb, '')}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', borderRadius: '8px', border: '1px solid #fca5a5', background: '#fee2e2', color: '#991b1b', cursor: 'pointer', fontWeight: 600 }}
            >Effacer</button>
          </div>
        </div>
      )}
    </div>
  );
};

// Matrice des ROT
const RotMatrix = ({ data, updateData }) => {
  const rotList = [
    { id: 'bicipital', label: 'Bicipital' },
    { id: 'styloradial', label: 'Stylo-radial' },
    { id: 'tricipital', label: 'Tricipital' },
    { id: 'cubitopronateur', label: 'Cubito-pronateur' },
    { id: 'rotulien', label: 'Rotulien (Patellaire)' },
    { id: 'achilleen', label: 'Achilléen' }
  ];

  const options = ["", "Normal", "Aboli", "Diminué", "Vif", "Polycinétique", "Diffusé"];

  const handleChange = (id, side, val) => {
    updateData({ [`rot_${id}_${side}`]: val });
  };

  return (
    <div style={{ background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--surface-border)', overflow: 'hidden', marginBottom: '2rem' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead style={{ background: 'var(--surface-border)' }}>
          <tr>
            <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Réflexe</th>
            <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-main)', textAlign: 'center' }}>Droite</th>
            <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-main)', textAlign: 'center' }}>Gauche</th>
          </tr>
        </thead>
        <tbody>
          {rotList.map((rot, idx) => (
            <tr key={rot.id} style={{ borderTop: idx > 0 ? '1px solid var(--surface-border)' : 'none' }}>
              <td style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-main)' }}>{rot.label}</td>
              <td style={{ padding: '0.5rem 1rem' }}>
                <select 
                  className="premium-input" 
                  style={{ width: '100%', padding: '0.5rem' }}
                  value={data?.[`rot_${rot.id}_droit`] || ''}
                  onChange={(e) => handleChange(rot.id, 'droit', e.target.value)}
                >
                  {options.map(o => <option key={o} value={o}>{o || '-- Sélectionner --'}</option>)}
                </select>
              </td>
              <td style={{ padding: '0.5rem 1rem' }}>
                <select 
                  className="premium-input" 
                  style={{ width: '100%', padding: '0.5rem' }}
                  value={data?.[`rot_${rot.id}_gauche`] || ''}
                  onChange={(e) => handleChange(rot.id, 'gauche', e.target.value)}
                >
                  {options.map(o => <option key={o} value={o}>{o || '-- Sélectionner --'}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

function ExamenNeuro({ data, updateData }) {
  const [activeTab, setActiveTab] = useState('conscience');
  const [history, setHistory] = useState([data?.synthese_neuro || '']);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const scrollContainerRef = useRef(null);

  const { catalog, getCatalogByCategory, addCustomSign, updateCustomSign, deleteCustomSign } = useNeuroCatalog();
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [editingSign, setEditingSign] = useState(null);
  
  const [addingCategory, setAddingCategory] = useState(null);
  const [newSignInput, setNewSignInput] = useState('');

  const handleChange = (e) => updateData({ [e.target.id]: e.target.value });
  
  const getNestedData = (category, key) => data?.[category]?.[key] || '';
  const setNestedData = (category, key, value) => {
    updateData({ [category]: { ...(data?.[category] || {}), [key]: value } });
  };

  const getCheck = (id) => !!data?.neuro_checks?.[id];
  const toggleCheck = (id) => {
    updateData({ neuro_checks: { ...(data?.neuro_checks || {}), [id]: !getCheck(id) } });
  };

  const y = parseInt(getNestedData('glasgow', 'yeux') || 0);
  const v = parseInt(getNestedData('glasgow', 'verbal') || 0);
  const m = parseInt(getNestedData('glasgow', 'moteur') || 0);
  const glasgowTotal = (y > 0 && v > 0 && m > 0) ? (y + v + m) : 0;

  useEffect(() => {
    const currentSynthese = data?.synthese_neuro || '';
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
  }, [data?.synthese_neuro]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      updateData({ synthese_neuro: history[newIndex] });
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      updateData({ synthese_neuro: history[newIndex] });
    }
  };

  const generateSynthesis = () => {
    let parts = [];
    
    // Glasgow
    if (glasgowTotal > 0) {
      let gDesc = "Conscient";
      if (glasgowTotal <= 8) gDesc = "Comateux";
      else if (glasgowTotal <= 12) gDesc = "Obnubilé";
      else if (glasgowTotal <= 14) gDesc = "Somnolent";
      parts.push(`Patient ${gDesc.toLowerCase()}, GCS ${glasgowTotal}/15 (Y${y} V${v} M${m}).`);
    }
    if (data?.pupilles) parts.push(`Pupilles: ${data.pupilles}.`);

    // Dynamic checks
    const activeChecks = catalog.filter(c => getCheck(c.id)).map(c => c.label);
    if (activeChecks.length > 0) {
      parts.push(`Signes cliniques positifs: ${activeChecks.join(', ')}.`);
    }
    
    // Cranien special format
    if (data?.cranien_toutes_normales) {
      parts.push("Paires crâniennes normales.");
    } else {
      let craniens = [];
      const roms = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
      roms.forEach(rom => {
        if (data[`cranien_${rom}`]) craniens.push(`${rom}: ${data[`cranien_${rom}`]}`);
      });
      if (craniens.length > 0) parts.push(`Anomalies crâniennes: ${craniens.join(', ')}.`);
    }

    // MRC
    let mrc = [];
    if (data?.mrc_msd) mrc.push(`MSD ${data.mrc_msd}`);
    if (data?.mrc_msg) mrc.push(`MSG ${data.mrc_msg}`);
    if (data?.mrc_mid) mrc.push(`MID ${data.mrc_mid}`);
    if (data?.mrc_mig) mrc.push(`MIG ${data.mrc_mig}`);
    if (mrc.length > 0) parts.push(`Cotation motrice (MRC) : ${mrc.join(', ')}.`);

    // ROT
    const rotList = ['bicipital', 'styloradial', 'tricipital', 'cubitopronateur', 'rotulien', 'achilleen'];
    let rotStr = [];
    rotList.forEach(r => {
      const dr = data[`rot_${r}_droit`];
      const ga = data[`rot_${r}_gauche`];
      if (dr || ga) {
        if (dr === ga) rotStr.push(`${r} bilatéralement ${dr.toLowerCase()}`);
        else rotStr.push(`${r} droit ${dr ? dr.toLowerCase() : 'non fait'}, gauche ${ga ? ga.toLowerCase() : 'non fait'}`);
      }
    });
    if (rotStr.length > 0) parts.push(`Réflexes ostéotendineux : ${rotStr.join(' ; ')}.`);

    // Notes
    if (data?.cranien_notes) parts.push(`Notes crâniens: ${data.cranien_notes}`);
    if (data?.cognition_notes) parts.push(`Cognition: ${data.cognition_notes}`);
    if (data?.reflexes_notes) parts.push(`Notes réflexes: ${data.reflexes_notes}`);
    if (data?.coordination_notes) parts.push(`Coordination: ${data.coordination_notes}`);
    if (data?.sensibilite_notes) parts.push(`Sensibilité: ${data.sensibilite_notes}`);

    const draft = parts.join(' \n');
    updateData({ synthese_neuro: draft });
  };

  const tabs = [
    { id: 'conscience', label: 'Conscience', icon: <Brain size={14} /> },
    { id: 'cognition', label: 'Cognition', icon: <Layers size={14} /> },
    { id: 'meninge', label: 'Méningé', icon: <Activity size={14} /> },
    { id: 'cranien', label: 'Crâniens', icon: <Eye size={14} /> },
    { id: 'moteur', label: 'Moteur', icon: <Stethoscope size={14} /> },
    { id: 'reflexes', label: 'Réflexes', icon: <GitCommit size={14} /> },
    { id: 'coordination', label: 'Coord.', icon: <GitCommit size={14} /> },
    { id: 'extrapyramidal', label: 'Extra-P.', icon: <Activity size={14} /> },
    { id: 'sensibilite', label: 'Sensibilité', icon: <Stethoscope size={14} /> },
    { id: 'sphincters', label: 'Sphincters', icon: <Footprints size={14} /> }
  ];

  const scrollLeft = () => {
    if (scrollContainerRef.current) scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
  };

  const handleAddSignSubmit = (category) => {
    if (newSignInput.trim()) {
      addCustomSign(newSignInput, category);
      setNewSignInput('');
      setAddingCategory(null);
    }
  };

  const renderCheckboxGrid = (categoryName) => {
    const items = getCatalogByCategory(categoryName);
    return (
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          {items.map(item => (
            <PremiumCheckbox 
              key={item.id} 
              id={item.id} 
              label={item.label} 
              checked={getCheck(item.id)} 
              onChange={() => toggleCheck(item.id)} 
            />
          ))}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          {addingCategory === categoryName ? (
            <div style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '200px' }}>
              <input 
                type="text" 
                className="premium-input" 
                style={{ flex: 1, padding: '0.5rem 1rem' }} 
                placeholder="Nouveau signe..."
                value={newSignInput}
                onChange={(e) => setNewSignInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSignSubmit(categoryName); } }}
                autoFocus
              />
              <button type="button" className="premium-tag" onClick={() => handleAddSignSubmit(categoryName)} style={{ padding: '0 1rem', background: 'var(--primary)', color: 'white', border: 'none' }}>
                <Check size={16} />
              </button>
              <button type="button" className="premium-tag" onClick={() => setAddingCategory(null)} style={{ padding: '0 1rem' }}>
                <X size={16} />
              </button>
            </div>
          ) : (
            <button 
              type="button" 
              className="tag-manager-btn"
              onClick={() => { setAddingCategory(categoryName); setNewSignInput(''); }}
            >
              <Plus size={16} /> Ajouter un signe
            </button>
          )}

          <button 
            type="button" 
            className="tag-manager-btn"
            onClick={() => setIsManagerOpen(true)}
          >
            <Settings size={16} /> Gérer les signes
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in glass-panel" style={{ padding: '3rem' }}>
      <header className="section-header">
        <h2 className="section-title">
          <Brain className="section-icon" />
          Examen Neurologique Complet
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
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <button onClick={scrollRight} style={{ background: 'var(--surface-border)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-main)', flexShrink: 0 }}>
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Tabs Content */}
      {activeTab === 'conscience' && (
        <div className="animate-fade-in">
          <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>Score de Glasgow (GCS)</span>
            <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{glasgowTotal > 0 ? `${glasgowTotal}/15` : '-/15'}</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
            <GlasgowPill label="Ouverture des yeux (Y)" value={getNestedData('glasgow', 'yeux')} onChange={(val) => setNestedData('glasgow', 'yeux', val)} options={[
                { val: 4, label: "Spontanée" }, { val: 3, label: "À l'appel" }, { val: 2, label: "À la douleur" }, { val: 1, label: "Nulle" }
              ]} />
            <GlasgowPill label="Réponse verbale (V)" value={getNestedData('glasgow', 'verbal')} onChange={(val) => setNestedData('glasgow', 'verbal', val)} options={[
                { val: 5, label: "Orientée" }, { val: 4, label: "Confuse" }, { val: 3, label: "Inappropriée" }, { val: 2, label: "Incompréhensible" }, { val: 1, label: "Nulle" }
              ]} />
            <GlasgowPill label="Réponse motrice (M)" value={getNestedData('glasgow', 'moteur')} onChange={(val) => setNestedData('glasgow', 'moteur', val)} options={[
                { val: 6, label: "Obéit aux ordres" }, { val: 5, label: "Localise la douleur" }, { val: 4, label: "Évitement/retrait" }, { val: 3, label: "Flexion (Décortication)" }, { val: 2, label: "Extension (Décérébration)" }, { val: 1, label: "Nulle" }
              ]} />
          </div>
          <PremiumInput id="pupilles" label="Examen Pupillaire (Mydriase, Myosis, Réactivité)" value={data?.pupilles || ''} onChange={handleChange} />
        </div>
      )}

      {activeTab === 'cognition' && (
        <div className="animate-fade-in">
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px dashed var(--surface-border)', paddingBottom: '0.5rem' }}>Fonctions Cognitives & Supérieures</h3>
          {renderCheckboxGrid('cognition')}
          <PremiumTextArea id="cognition_notes" label="Détails (ex: Empan, test des 3 mots, paraphasies...)" rows={3} value={data?.cognition_notes || ''} onChange={handleChange} />
        </div>
      )}

      {activeTab === 'meninge' && (
        <div className="animate-fade-in">
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px dashed var(--surface-border)', paddingBottom: '0.5rem' }}>Syndrome Méningé & Rachis</h3>
          {renderCheckboxGrid('meninge')}
        </div>
      )}

      {activeTab === 'cranien' && (
        <div className="animate-fade-in">
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px dashed var(--surface-border)', paddingBottom: '0.5rem' }}>Paires Crâniennes (I à XII)</h3>
          
          <div style={{ marginBottom: '2rem' }}>
            <label className="radio-card-label" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid var(--surface-border)', borderRadius: '12px', background: 'var(--surface)', cursor: 'pointer', transition: 'all 0.2s ease' }}>
              <input 
                type="checkbox" 
                style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
                checked={!!data?.cranien_toutes_normales}
                onChange={(e) => updateData({ cranien_toutes_normales: e.target.checked })}
              />
              <span style={{ fontSize: '1rem', fontWeight: 600, color: data?.cranien_toutes_normales ? 'var(--primary)' : 'var(--text-main)' }}>Toutes les paires crâniennes sont normales</span>
            </label>
          </div>

          {!data?.cranien_toutes_normales && (
            <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <PremiumTextArea id="cranien_I" label="I - Nerf Olfactif" rows={1} value={data?.cranien_I || ''} onChange={handleChange} />
              <PremiumTextArea id="cranien_II" label="II - Nerf Optique" rows={1} value={data?.cranien_II || ''} onChange={handleChange} />
              <PremiumTextArea id="cranien_III" label="III - Moteur Oculaire Commun" rows={1} value={data?.cranien_III || ''} onChange={handleChange} />
              <PremiumTextArea id="cranien_IV" label="IV - Nerf Pathétique" rows={1} value={data?.cranien_IV || ''} onChange={handleChange} />
              <PremiumTextArea id="cranien_V" label="V - Nerf Trijumeau" rows={1} value={data?.cranien_V || ''} onChange={handleChange} />
              <PremiumTextArea id="cranien_VI" label="VI - Moteur Oculaire Externe" rows={1} value={data?.cranien_VI || ''} onChange={handleChange} />
              <PremiumTextArea id="cranien_VII" label="VII - Nerf Facial" rows={1} value={data?.cranien_VII || ''} onChange={handleChange} />
              <PremiumTextArea id="cranien_VIII" label="VIII - Cochléo-vestibulaire" rows={1} value={data?.cranien_VIII || ''} onChange={handleChange} />
              <PremiumTextArea id="cranien_IX" label="IX - Nerf Glosso-pharyngien" rows={1} value={data?.cranien_IX || ''} onChange={handleChange} />
              <PremiumTextArea id="cranien_X" label="X - Nerf Pneumogastrique" rows={1} value={data?.cranien_X || ''} onChange={handleChange} />
              <PremiumTextArea id="cranien_XI" label="XI - Nerf Spinal" rows={1} value={data?.cranien_XI || ''} onChange={handleChange} />
              <PremiumTextArea id="cranien_XII" label="XII - Grand Hypoglosse" rows={1} value={data?.cranien_XII || ''} onChange={handleChange} />
            </div>
          )}
          <PremiumTextArea id="cranien_notes" label="Notes globales sur les nerfs crâniens" rows={2} value={data?.cranien_notes || ''} onChange={handleChange} />
        </div>
      )}

      {activeTab === 'moteur' && (
        <div className="animate-fade-in">
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px dashed var(--surface-border)', paddingBottom: '0.5rem' }}>Motricité</h3>
          
          <div style={{ paddingLeft: '1.5rem', borderLeft: '2px solid var(--surface-border)', marginBottom: '2rem' }}>
            <h4 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Volontaire (Trophisme)</h4>
            {renderCheckboxGrid('motricite_trophisme')}
            
            <h4 style={{ color: 'var(--danger)', marginBottom: '1rem', marginTop: '2rem' }}>Involontaire (Mouvements Anormaux)</h4>
            {renderCheckboxGrid('extra_mvts')}
          </div>

          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px dashed var(--surface-border)', paddingBottom: '0.5rem' }}>Tonus Musculaire</h3>
          {renderCheckboxGrid('moteur_tonus')}

          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px dashed var(--surface-border)', paddingBottom: '0.5rem', marginTop: '2rem' }}>Tétanie & Postures Anormales</h3>
          {renderCheckboxGrid('moteur_tetanie')}

          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px dashed var(--surface-border)', paddingBottom: '0.5rem', marginTop: '2rem' }}>Force Musculaire (Épreuves Globales)</h3>
          {renderCheckboxGrid('moteur_force')}

          <div style={{ marginTop: '2rem' }}>
            <StickmanMRC data={data} updateData={updateData} />
          </div>
        </div>
      )}

      {activeTab === 'reflexes' && (
        <div className="animate-fade-in">
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px dashed var(--surface-border)', paddingBottom: '0.5rem' }}>Réflexes Ostéotendineux (ROT)</h3>
          <RotMatrix data={data} updateData={updateData} />

          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px dashed var(--surface-border)', paddingBottom: '0.5rem' }}>Réflexes Cutanés et Archaïques</h3>
          {renderCheckboxGrid('reflexes_cutane')}
          
          <PremiumTextArea id="reflexes_notes" label="Notes complémentaires sur les réflexes" rows={2} value={data?.reflexes_notes || ''} onChange={handleChange} />
        </div>
      )}

      {activeTab === 'coordination' && (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <label className="radio-card-label" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid var(--surface-border)', borderRadius: '12px', background: 'var(--surface)', cursor: 'pointer', transition: 'all 0.2s ease', flex: 1 }}>
              <input 
                type="checkbox" 
                style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
                checked={!!data?.coordination_normale}
                onChange={(e) => updateData({ coordination_normale: e.target.checked })}
              />
              <span style={{ fontSize: '1rem', fontWeight: 600, color: data?.coordination_normale ? 'var(--primary)' : 'var(--text-main)' }}>Coordination normale (Ataxie absente)</span>
            </label>
            <div style={{ marginLeft: '1rem', position: 'relative', cursor: 'help' }} title="L'épreuve de coordination évalue la synergie des mouvements. L'ataxie statique est évaluée par le maintien postural (signe de Romberg, polygone). L'ataxie cinétique est évaluée par l'exécution du mouvement (épreuve doigt-nez, talon-genou, marionnettes).">
              <HelpCircle size={28} color="var(--primary)" />
            </div>
          </div>

          {!data?.coordination_normale && (
            <div className="animate-fade-in">
              <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px dashed var(--surface-border)', paddingBottom: '0.5rem' }}>Station debout et marche</h3>
              
              <div style={{ paddingLeft: '1.5rem', borderLeft: '2px solid var(--surface-border)', marginBottom: '2rem' }}>
                <h4 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Ataxie statique</h4>
                {renderCheckboxGrid('coordination_statique')}

                <h4 style={{ color: 'var(--danger)', marginBottom: '1rem', marginTop: '2rem' }}>Troubles de la marche</h4>
                {renderCheckboxGrid('marche_marche')}
              </div>

              <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px dashed var(--surface-border)', paddingBottom: '0.5rem', marginTop: '2rem' }}>Mouvements (Coordination segmentaire)</h3>
              
              <div style={{ paddingLeft: '1.5rem', borderLeft: '2px solid var(--surface-border)', marginBottom: '2rem' }}>
                <h4 style={{ color: 'var(--danger)', marginBottom: '1rem' }}>Ataxie cinétique</h4>
                {renderCheckboxGrid('coordination_cinetique')}
              </div>
            </div>
          )}

          <PremiumTextArea id="coordination_notes" label="Précisions" rows={2} value={data?.coordination_notes || ''} onChange={handleChange} />
        </div>
      )}

      {activeTab === 'extrapyramidal' && (
        <div className="animate-fade-in">
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px dashed var(--surface-border)', paddingBottom: '0.5rem' }}>Syndrome Parkinsonien (Extra-pyramidal)</h3>
          {renderCheckboxGrid('extra_park')}
        </div>
      )}

      {activeTab === 'sensibilite' && (
        <div className="animate-fade-in">
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px dashed var(--surface-border)', paddingBottom: '0.5rem' }}>Sensibilité Superficielle (Tact, Algique, Thermique)</h3>
          {renderCheckboxGrid('sens_sup')}

          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px dashed var(--surface-border)', paddingBottom: '0.5rem' }}>Sensibilité Profonde (Proprioceptive)</h3>
          {renderCheckboxGrid('sens_prof')}

          <PremiumTextArea id="sensibilite_notes" label="Topographie des troubles sensitifs (ex: niveau D4)" rows={2} value={data?.sensibilite_notes || ''} onChange={handleChange} />
        </div>
      )}

      {activeTab === 'sphincters' && (
        <div className="animate-fade-in">
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', borderBottom: '1px dashed var(--surface-border)', paddingBottom: '0.5rem' }}>Fonctions Sphinctériennes</h3>
          {renderCheckboxGrid('marche_sphincter')}
        </div>
      )}

      {/* --- SYNTHÈSE --- */}
      <div style={{ marginTop: '2.5rem', paddingTop: '2.5rem', borderTop: '2px dashed var(--surface-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
          <h4 style={{ margin: 0, color: 'var(--primary)' }}>Synthèse de l'Examen Neurologique</h4>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button 
              type="button" 
              className="premium-tag"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              title="Annuler (Retour en arrière)"
              style={{ padding: '8px', opacity: historyIndex <= 0 ? 0.5 : 1, cursor: historyIndex <= 0 ? 'default' : 'pointer', background: 'var(--surface-border)', color: 'var(--noir)' }}
            >
              <Undo size={16} />
            </button>
            <button 
              type="button" 
              className="premium-tag"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              title="Rétablir (Retour en avant)"
              style={{ padding: '8px', opacity: historyIndex >= history.length - 1 ? 0.5 : 1, cursor: historyIndex >= history.length - 1 ? 'default' : 'pointer', background: 'var(--surface-border)', color: 'var(--noir)' }}
            >
              <Redo size={16} />
            </button>
            <button 
              className="premium-tag" 
              onClick={generateSynthesis}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', borderColor: 'var(--primary)' }}
            >
              <Edit3 size={14} /> Générer une synthèse
            </button>
          </div>
        </div>
        <PremiumTextArea 
          id="synthese_neuro" 
          label="Résumé complet de l'examen neurologique" 
          placeholder="Générez automatiquement un brouillon complet basé sur vos sélections..." 
          rows={6} 
          value={data?.synthese_neuro || ''} 
          onChange={(e) => updateData({ synthese_neuro: e.target.value })} 
        />
      </div>

      {isManagerOpen && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: 'var(--surface)', padding: '2rem', borderRadius: '16px',
            width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                <Settings size={20} /> Gestion des Signes Neurologiques
              </h3>
              <button onClick={() => setIsManagerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={24} />
              </button>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Modifiez ou supprimez les signes neurologiques pour personnaliser votre examen. Les signes ajoutés seront disponibles pour vos futurs patients.
            </p>

            {catalog.filter(i => i.isCustom).length === 0 && (
              <div style={{ padding: '1rem', background: 'var(--surface-border)', borderRadius: '8px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Aucun signe personnalisé n'a été ajouté pour le moment.
              </div>
            )}
            
            {catalog.filter(i => i.isCustom).map(item => (
              <div key={item.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                {editingSign?.id === item.id ? (
                  <>
                    <input 
                      type="text" 
                      className="premium-input" 
                      style={{ flex: 1, padding: '0.5rem' }}
                      value={editingSign.label} 
                      onChange={e => setEditingSign({...editingSign, label: e.target.value})}
                    />
                    <button 
                      className="premium-tag" 
                      onClick={() => { updateCustomSign(item.id, editingSign.label); setEditingSign(null); }}
                      style={{ background: '#4ade80', color: '#166534', borderColor: '#4ade80' }}
                    >
                      <Check size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ flex: 1, padding: '0.6rem', background: 'var(--surface-border)', borderRadius: '8px', fontSize: '0.9rem' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--primary)', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }}>{item.category.replace('_', ' ')}</span>
                      {item.label}
                    </div>
                    <button className="premium-tag" onClick={() => setEditingSign(item)} style={{ padding: '0.6rem' }}>
                      <Edit3 size={16} />
                    </button>
                    <button className="premium-tag" onClick={() => deleteCustomSign(item.id)} style={{ padding: '0.6rem', background: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5' }}>
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}


export default React.memo(ExamenNeuro);

