import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PremiumInput, PremiumTextArea } from '../Form/PremiumInput';
import { useSymptomCatalog } from '../../utils/useSymptomCatalog';
import { Plus, Trash2, ChevronDown, ChevronUp, Edit3, Save, X, Settings, Check, Activity, FileText, Undo, Redo } from 'lucide-react';

function HistoireMaladie({ data, updateData }) {
  const symptomes = data?.symptomes || [];

  const synthese = data?.synthese_narrative || '';
  const [history, setHistory] = useState([synthese]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const handleSyntheseChange = (val) => {
    updateData({ synthese_narrative: val });
  };
  
  // Track external changes or typing with a simple debounce-like or interval logic for history
  // Actually, let's just push to history on blur or after 1 second of inactivity to avoid storing every character
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (history[historyIndex] !== synthese) {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(synthese);
        // keep last 50 edits
        if (newHistory.length > 50) newHistory.shift();
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    }, 1000); // 1s debounce
    return () => clearTimeout(timeout);
  }, [synthese, history, historyIndex]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      updateData({ synthese_narrative: prev });
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      updateData({ synthese_narrative: next });
    }
  };


  const { types, fields, getFields, addCustomType, updateTypeFields, deleteCustomType } = useSymptomCatalog();
  
  // Tag Manager Modal State
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [selectedTagToEdit, setSelectedTagToEdit] = useState(null);
  const [managerCustomName, setManagerCustomName] = useState('');
  const [editableFields, setEditableFields] = useState([]);

  // 1. SELECTING TAGS
  const toggleSymptomSelection = (type) => {
    const existing = symptomes.find(s => s.type === type);
    if (existing) {
      updateData({ symptomes: symptomes.filter(s => s.id !== existing.id) });
    } else {
      const newSymptom = {
        id: Date.now(),
        type,
        caracteristiques: {},
        isExpanded: true
      };
      updateData({ symptomes: [...symptomes, newSymptom] });
    }
  };

  const toggleSymptomExpanded = (id) => {
    updateData({
      symptomes: symptomes.map(s => s.id === id ? { ...s, isExpanded: !s.isExpanded } : s)
    });
  };

  const updateSymptomField = (symptomId, fieldId, value) => {
    updateData({
      symptomes: symptomes.map(s => {
        if (s.id === symptomId) {
          return {
            ...s,
            caracteristiques: { ...s.caracteristiques, [fieldId]: value }
          };
        }
        return s;
      })
    });
  };

  // 2. TAG MANAGER LOGIC
  const openManagerToEdit = (type) => {
    setSelectedTagToEdit(type);
    setEditableFields(JSON.parse(JSON.stringify(getFields(type))));
  };

  const openManagerToCreate = () => {
    setSelectedTagToEdit(null);
    setManagerCustomName('');
    setEditableFields([
      { id: 'description_libre', label: 'Description détaillée', type: 'textarea' }
    ]);
  };

  const saveManagerChanges = () => {
    let targetType = selectedTagToEdit;
    
    // If creating a new one
    if (!targetType) {
      if (!managerCustomName.trim()) return; // needs a name
      targetType = managerCustomName.trim();
      addCustomType(targetType);
    }

    // Save fields
    updateTypeFields(targetType, editableFields);
    setSelectedTagToEdit(null);
    setIsManagerOpen(false);
  };

  const updateEditableFieldLabel = (fieldId, newLabel) => {
    setEditableFields(editableFields.map(f => f.id === fieldId ? { ...f, label: newLabel } : f));
  };

  const removeEditableField = (fieldId) => {
    setEditableFields(editableFields.filter(f => f.id !== fieldId));
  };

  const addNewEditableField = () => {
    const newId = 'custom_field_' + Date.now();
    setEditableFields([...editableFields, { id: newId, label: 'Nouveau caractère', type: 'text' }]);
  };

  // 3. VALIDATION LOGIC
  const checkMissingSymptoms = () => {
    return symptomes.filter(s => {
      const regex = new RegExp(`(${s.type}s?)`, 'i');
      return !regex.test(synthese);
    });
  };
  const missingSymptoms = checkMissingSymptoms();
  const presentSymptoms = symptomes.filter(s => !missingSymptoms.includes(s));

  return (
    <div className="animate-fade-in glass-panel" style={{ padding: '3rem', position: 'relative' }}>
      <header className="section-header">
        <h2>Histoire de la Maladie</h2>
      </header>
      
      {/* --- BANQUE DE TAGS (AVAILABLE TAGS) --- */}
      <div style={{ marginBottom: '3rem' }}>
        <h4 style={{ marginBottom: '1.5rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Banque de Signes Fonctionnels</span>
          <button 
            className="tag-manager-btn"
            onClick={() => {
              openManagerToCreate();
              setIsManagerOpen(true);
            }}
          >
            <Settings size={16} /> Gérer les tags
          </button>
        </h4>
        
        <div className="premium-tag-bank">
          {types.filter(t => t !== 'Autre').map(type => {
            const isSelected = symptomes.some(s => s.type === type);
            return (
              <div 
                key={type} 
                className={`premium-tag ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleSymptomSelection(type)}
              >
                {isSelected ? <Check size={16} /> : <Plus size={16} />}
                {type}
              </div>
            );
          })}
        </div>
      </div>

      {/* --- SELECTED TAGS DROPDOWNS --- */}
      {symptomes.length > 0 && (
        <div style={{ marginBottom: '4rem' }}>
          <h4 style={{ marginBottom: '1.5rem', color: 'var(--text-main)', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
            Caractéristiques des signes sélectionnés
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {symptomes.map((symptom) => {
              const symptomFields = getFields(symptom.type);
              
              return (
                <div key={symptom.id} className="symptom-dropdown-container">
                  <div 
                    className="symptom-dropdown-header"
                    onClick={() => toggleSymptomExpanded(symptom.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Activity size={18} />
                      {symptom.type}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation(); // prevent expanding
                          toggleSymptomSelection(symptom.type); // deselect
                        }} 
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Retirer ce signe"
                      >
                        <Trash2 size={18} />
                      </button>
                      {symptom.isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                  
                  {symptom.isExpanded && (
                    <div className="symptom-dropdown-content animate-fade-in">
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {symptomFields.map(field => {
                          const val = symptom.caracteristiques[field.id] || '';
                          if (field.type === 'select') {
                            return (
                              <div key={field.id} className="input-group">
                                <label className="input-label">{field.label}</label>
                                <select className="input-field" value={val} onChange={(e) => updateSymptomField(symptom.id, field.id, e.target.value)}>
                                  <option value=""></option>
                                  {field.options && field.options.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              </div>
                            );
                          } else if (field.type === 'textarea') {
                            return (
                              <div key={field.id} style={{ gridColumn: '1 / -1' }}>
                                <PremiumTextArea 
                                  id={`${symptom.id}_${field.id}`} 
                                  label={field.label} 
                                  value={val} 
                                  onChange={(e) => updateSymptomField(symptom.id, field.id, e.target.value)} 
                                  rows={2} 
                                  placeholder={field.placeholder}
                                />
                              </div>
                            );
                          } else {
                            return (
                              <PremiumInput 
                                key={field.id}
                                id={`${symptom.id}_${field.id}`} 
                                label={field.label} 
                                value={val} 
                                onChange={(e) => updateSymptomField(symptom.id, field.id, e.target.value)} 
                                placeholder={field.placeholder}
                              />
                            );
                          }
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- SYNTHÈSE --- */}
      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
          <h4 style={{ margin: 0, color: 'var(--primary)' }}>Synthèse Narrative (HDM)</h4>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button 
              type="button" 
              className="premium-tag"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              title="Annuler (Retour en arrire)"
              style={{ padding: '8px', opacity: historyIndex <= 0 ? 0.5 : 1, cursor: historyIndex <= 0 ? 'default' : 'pointer', background: 'var(--surface-border)', color: 'var(--noir)' }}
            >
              <Undo size={16} />
            </button>
            <button 
              type="button" 
              className="premium-tag"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              title="Rtablir (Retour en avant)"
              style={{ padding: '8px', opacity: historyIndex >= history.length - 1 ? 0.5 : 1, cursor: historyIndex >= history.length - 1 ? 'default' : 'pointer', background: 'var(--surface-border)', color: 'var(--noir)' }}
            >
              <Redo size={16} />
            </button>
          <button 
            className="premium-tag" 
            onClick={() => {
              if (symptomes.length === 0) return;
              let generatedText = "Le début de la symptomatologie remonterait à il y a environ [DURÉE], marqué par l'apparition de :\n\n";
              
              symptomes.forEach(s => {
                generatedText += `- **${s.type}**`;
                const chars = Object.entries(s.caracteristiques).filter(([_, val]) => val && val.trim() !== '');
                if (chars.length > 0) {
                  generatedText += " caractérisé(e) par :\n";
                  chars.forEach(([key, val]) => {
                    const fieldName = getFields(s.type).find(f => f.id === key)?.label || key;
                    generatedText += `  • ${fieldName} : ${val}\n`;
                  });
                } else {
                  generatedText += ".\n";
                }
                generatedText += "\n";
              });
              
              updateData({ synthese_narrative: generatedText });
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', borderColor: 'var(--primary)' }}
          >
            <Edit3 size={14} /> Générer un brouillon
          </button>
          </div>
        </div>
        <PremiumTextArea 
          id="synthese_narrative" 
          label="Rédigez l'histoire de la maladie complète" 
          placeholder="Le début de la symptomatologie remonterait à il y a environ 3 semaines, marqué par l'apparition d'une douleur abdominale de type crampe..." 
          rows={10} 
          value={synthese} 
          onChange={(e) => handleSyntheseChange(e.target.value)} 
        />
        
        {symptomes.length > 0 && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: missingSymptoms.length > 0 ? '#fff3f3' : '#f0fdf4', border: `1px solid ${missingSymptoms.length > 0 ? '#fecdd3' : '#bbf7d0'}`, borderRadius: '4px' }}>
            <h5 style={{ marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '0.9rem' }}>Vérification des signes fonctionnels :</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem' }}>
              {presentSymptoms.map(s => (
                <div key={`p_${s.id}`} style={{ color: '#166534' }}>✅ <strong>{s.type}</strong> mentionné(e) dans le récit.</div>
              ))}
              {missingSymptoms.map(s => (
                <div key={`m_${s.id}`} style={{ color: '#991b1b' }}>❌ <strong>{s.type}</strong> est sélectionné(e) mais non trouvé(e) dans le texte ! N'oubliez pas de le/la souligner.</div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- TAG MANAGER MODAL --- */}
      {isManagerOpen && createPortal(
        <div className="tag-manager-modal-overlay" onClick={() => setIsManagerOpen(false)}>
          <div className="tag-manager-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings size={20} color="var(--primary)" />
                Gestionnaire de Tags (Banque)
              </h3>
              <button onClick={() => setIsManagerOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <p style={{ color: 'var(--text-light)', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: 1.5 }}>
                Configurez ici votre banque globale de signes fonctionnels. Les modifications apportées affecteront toutes vos futures observations.
              </p>

              {/* Choix du tag à éditer */}
              <div style={{ marginBottom: '2rem' }}>
                <label className="input-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Sélectionner un tag à modifier :</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {types.filter(t => t !== 'Autre').map(type => (
                    <button
                      key={`edit_${type}`}
                      onClick={() => openManagerToEdit(type)}
                      style={{
                        padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s',
                        background: selectedTagToEdit === type ? 'var(--primary)' : 'var(--surface-hover)',
                        color: selectedTagToEdit === type ? 'white' : 'var(--text-main)',
                        border: selectedTagToEdit === type ? '1px solid var(--primary)' : '1px solid var(--surface-border)',
                        fontWeight: selectedTagToEdit === type ? 'bold' : 'normal'
                      }}
                    >
                      {type}
                    </button>
                  ))}
                  <button
                    onClick={openManagerToCreate}
                    style={{
                      padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s',
                      background: !selectedTagToEdit ? 'var(--brown-subtle)' : 'transparent',
                      color: 'var(--primary)', border: '1.5px dashed var(--primary)',
                      display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 'bold'
                    }}
                  >
                    <Plus size={14} /> Nouveau Tag
                  </button>
                </div>
              </div>

              <div style={{ background: 'var(--surface-hover)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--surface-border)' }}>
                {!selectedTagToEdit ? (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <PremiumInput
                      id="new_tag_name"
                      label="Nom du nouveau Tag"
                      value={managerCustomName}
                      onChange={(e) => setManagerCustomName(e.target.value)}
                      placeholder="Ex: Palpitations..."
                    />
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h4 style={{ color: 'var(--primary)', margin: 0 }}>Modification des champs pour "{selectedTagToEdit}"</h4>
                    {/* The delete button is only shown if it's a custom tag (not one of the base types) */}
                    {!['Douleur', 'Vomissements', 'Fièvre', 'Masse', 'Céphalées', 'Toux', 'Diarrhée', 'Autre'].includes(selectedTagToEdit) && (
                      <button 
                        onClick={() => {
                          if(window.confirm(`Voulez-vous vraiment supprimer le tag "${selectedTagToEdit}" ?`)) {
                            if(deleteCustomType(selectedTagToEdit)) {
                              // If deleted, reset modal view
                              setSelectedTagToEdit(null);
                              // Also remove from current observation if it was selected
                              updateData({ symptomes: symptomes.filter(s => s.type !== selectedTagToEdit) });
                            }
                          }
                        }}
                        style={{ padding: '0.4rem 0.8rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', cursor: 'pointer', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}
                      >
                        <Trash2 size={14} /> Supprimer ce tag
                      </button>
                    )}
                  </div>
                )}

                <label className="input-label" style={{ marginBottom: '1rem', display: 'block' }}>Champs de caractérisation (Formulaire déroulant) :</label>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
                  {editableFields.map((field, idx) => (
                    <div key={field.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', background: 'var(--surface)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--surface-border)' }}>
                      <span style={{ color: 'var(--text-light)', fontWeight: 'bold', width: '20px' }}>{idx + 1}.</span>
                      <input 
                        type="text" 
                        value={field.label} 
                        onChange={(e) => updateEditableFieldLabel(field.id, e.target.value)}
                        style={{ flex: 1, padding: '0.5rem', border: 'none', borderBottom: '1px solid var(--surface-border)', background: 'transparent', color: 'var(--text-main)', fontSize: '0.95rem' }}
                        placeholder="Nom de la question (ex: Intensité)"
                      />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', minWidth: '80px', textAlign: 'center', background: 'var(--surface-hover)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        {field.type === 'textarea' ? 'Texte long' : (field.type === 'select' ? 'Liste' : 'Texte court')}
                      </span>
                      <button onClick={() => removeEditableField(field.id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.2rem' }} title="Retirer ce champ">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                  <button onClick={addNewEditableField} style={{ background: 'transparent', border: '1.5px dashed var(--text-light)', color: 'var(--text-main)', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Plus size={16} /> Ajouter une question (caractéristique)
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--surface-border)', paddingTop: '1.5rem' }}>
                  <button onClick={() => setIsManagerOpen(false)} style={{ padding: '0.8rem 1.5rem', background: 'transparent', border: '1px solid var(--surface-border)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-main)' }}>
                    Annuler
                  </button>
                  <button onClick={saveManagerChanges} style={{ padding: '0.8rem 1.5rem', background: 'var(--primary)', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    <Save size={18} /> Enregistrer les modifications
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      , document.body)}

    </div>
  );
}


export default React.memo(HistoireMaladie);

