import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Settings, Check, X, Edit3, Trash2 } from 'lucide-react';
import { PremiumCheckbox } from '../Form/PremiumCheckbox';

export function CheckboxGridManager({ 
  categoryName, 
  catalogHook, 
  data, 
  updateData, 
  dataKeyPrefix = 'checks'
}) {
  const { catalog, getCatalogByCategory, addCustomSign, updateCustomSign, deleteCustomSign } = catalogHook;
  
  const [addingCategory, setAddingCategory] = useState(null);
  const [newSignInput, setNewSignInput] = useState('');
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [editingSign, setEditingSign] = useState(null);

  const items = getCatalogByCategory(categoryName);

  const getCheck = (id) => !!data?.[dataKeyPrefix]?.[id];
  const toggleCheck = (id) => {
    updateData({ [dataKeyPrefix]: { ...(data?.[dataKeyPrefix] || {}), [id]: !getCheck(id) } });
  };

  const handleAddSignSubmit = () => {
    if (newSignInput.trim()) {
      addCustomSign(newSignInput, categoryName);
      setNewSignInput('');
      setAddingCategory(null);
    }
  };

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
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSignSubmit(); } }}
              autoFocus
            />
            <button type="button" className="premium-tag" onClick={handleAddSignSubmit} style={{ padding: '0 1rem', background: 'var(--primary)', color: 'white', border: 'none' }}>
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
                <Settings size={20} /> Gestion des Signes Personnalisés
              </h3>
              <button onClick={() => setIsManagerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={24} />
              </button>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Modifiez ou supprimez les signes que vous avez ajoutés. Les signes modifiés seront disponibles pour vos futurs patients.
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
                    <button 
                      className="premium-tag" 
                      onClick={() => setEditingSign(null)}
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ flex: 1, padding: '0.6rem 1rem', background: 'var(--surface-border)', borderRadius: '8px', fontSize: '0.95rem' }}>
                      {item.label} <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>({item.category})</span>
                    </div>
                    <button className="premium-tag" onClick={() => setEditingSign(item)} title="Modifier">
                      <Edit3 size={16} />
                    </button>
                    <button className="premium-tag" onClick={() => deleteCustomSign(item.id)} style={{ color: 'crimson', borderColor: 'rgba(220,20,60,0.3)' }} title="Supprimer">
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
