import React, { useState, useCallback } from 'react';
import { PremiumTextArea } from '../Form/PremiumInput';
import { Plus, ChevronDown, ChevronRight, Trash2, Calendar, Stethoscope, FlaskConical, MessageCircle, Pill } from 'lucide-react';

const CATEGORIES = [
  { id: 'signes_cliniques', label: 'Signes cliniques', icon: Stethoscope, color: '#3b82f6', bgColor: '#eff6ff' },
  { id: 'signes_paracliniques', label: 'Signes paracliniques', icon: FlaskConical, color: '#8b5cf6', bgColor: '#f5f3ff' },
  { id: 'plaintes', label: 'Plaintes', icon: MessageCircle, color: '#f59e0b', bgColor: '#fffbeb' },
  { id: 'traitements', label: 'Traitements administrés', icon: Pill, color: '#10b981', bgColor: '#ecfdf5' },
];

function DayEntry({ day, dayData, onUpdate, onRemove }) {
  const [expandedCat, setExpandedCat] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleCatChange = useCallback((catId, value) => {
    onUpdate({ ...dayData, [catId]: value });
  }, [dayData, onUpdate]);

  const toggleCat = useCallback((catId) => {
    setExpandedCat(prev => prev === catId ? null : catId);
  }, []);

  const filledCount = CATEGORIES.filter(c => dayData[c.id]?.trim()).length;

  return (
    <div 
      className="form-card"
      style={{ 
        padding: 0, borderRadius: '20px', overflow: 'hidden',
        border: '1px solid var(--surface-border)', 
        background: 'var(--surface)', 
        boxShadow: isHovered ? '0 12px 30px -8px rgba(0,0,0,0.08)' : '0 4px 12px -4px rgba(0,0,0,0.04)',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isHovered ? 'translateY(-2px)' : 'none',
      }}
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
    >
      {/* Day Header */}
      <div style={{ 
        padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'var(--surface-bg)', borderBottom: '1px solid var(--surface-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            width: '42px', height: '42px', borderRadius: '14px', 
            background: 'linear-gradient(135deg, var(--primary), #ef4444)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(var(--primary-rgb, 220,38,38), 0.25)'
          }}>
            <Calendar size={20} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)' }}>
              {day || 'Jour non défini'}
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '500' }}>
              {filledCount}/{CATEGORIES.length} catégories renseignées
            </span>
          </div>
        </div>
        <button
          onClick={onRemove}
          title="Supprimer ce jour"
          style={{
            background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer',
            padding: '0.5rem', borderRadius: '10px', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onMouseOver={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2'; }}
          onMouseOut={e => { e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.background = 'transparent'; }}
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Categories Accordion */}
      <div style={{ padding: '0.5rem' }}>
        {CATEGORIES.map(cat => {
          const CatIcon = cat.icon;
          const isOpen = expandedCat === cat.id;
          const hasContent = dayData[cat.id]?.trim();
          
          return (
            <div key={cat.id} style={{ marginBottom: '2px' }}>
              <button
                onClick={() => toggleCat(cat.id)}
                style={{
                  width: '100%', padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
                  background: isOpen ? cat.bgColor : 'transparent',
                  border: 'none', borderRadius: '12px', cursor: 'pointer',
                  transition: 'all 0.25s ease', textAlign: 'left',
                }}
                onMouseOver={e => { if (!isOpen) e.currentTarget.style.background = '#f8fafc'; }}
                onMouseOut={e => { if (!isOpen) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ 
                  width: '32px', height: '32px', borderRadius: '10px',
                  background: isOpen ? cat.color : (hasContent ? cat.bgColor : '#f1f5f9'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.25s',
                }}>
                  <CatIcon size={16} color={isOpen ? '#fff' : (hasContent ? cat.color : '#94a3b8')} strokeWidth={2} />
                </div>
                <span style={{ 
                  flex: 1, fontWeight: isOpen ? '700' : '600', fontSize: '0.95rem',
                  color: isOpen ? cat.color : 'var(--text-main)',
                  transition: 'all 0.25s',
                }}>
                  {cat.label}
                  {day && <span style={{ color: '#94a3b8', fontWeight: '400', fontSize: '0.85rem' }}> ({day})</span>}
                </span>
                {hasContent && !isOpen && (
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
                )}
                <span style={{ color: '#94a3b8', transition: 'transform 0.25s', transform: isOpen ? 'rotate(0)' : 'rotate(-90deg)' }}>
                  <ChevronDown size={16} />
                </span>
              </button>

              {isOpen && (
                <div className="animate-fade-in" style={{ padding: '0.5rem 1rem 1rem 1rem' }}>
                  <PremiumTextArea
                    id={`${cat.id}_${day}`}
                    label=""
                    placeholder={`Décrire les ${cat.label.toLowerCase()} pour ${day || 'ce jour'}...`}
                    value={dayData[cat.id] || ''}
                    onChange={e => handleCatChange(cat.id, e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Evolution({ data, updateData }) {
  const [newDay, setNewDay] = useState('');
  const days = data?.days || [];

  const addDay = useCallback(() => {
    const dayLabel = newDay.trim() || `J${days.length + 1}`;
    const exists = days.some(d => d.day === dayLabel);
    if (exists) return;
    
    updateData({ 
      days: [...days, { day: dayLabel, signes_cliniques: '', signes_paracliniques: '', plaintes: '', traitements: '' }]
    });
    setNewDay('');
  }, [newDay, days, updateData]);

  const updateDay = useCallback((index, updatedDayData) => {
    const updated = [...days];
    updated[index] = { ...updated[index], ...updatedDayData };
    updateData({ days: updated });
  }, [days, updateData]);

  const removeDay = useCallback((index) => {
    updateData({ days: days.filter((_, i) => i !== index) });
  }, [days, updateData]);

  return (
    <div className="animate-fade-in glass-panel" style={{ padding: '3rem' }}>
      <header className="section-header"><h2>Évolution</h2></header>

      {/* Add Day Input */}
      <div className="form-card" style={{ 
        padding: '1.5rem', marginBottom: '2rem', borderRadius: '20px',
        background: 'var(--surface-bg)', border: '2px dashed var(--surface-border)',
        display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: '700', color: '#475569', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Ajouter un jour d'évolution
          </label>
          <input
            type="text"
            value={newDay}
            onChange={e => setNewDay(e.target.value)}
            placeholder="Ex : J1, J2, J3..."
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addDay(); } }}
            className="input-field"
            style={{ 
              width: '100%', padding: '0.85rem 1.25rem', borderRadius: '14px',
              border: '1px solid var(--surface-border)', background: 'var(--surface)',
              fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)',
              outline: 'none', transition: 'all 0.3s',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 4px rgba(var(--primary-rgb, 220,38,38), 0.1)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--surface-border)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
        <button
          onClick={addDay}
          className="btn btn-primary"
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.85rem 1.75rem', borderRadius: '14px', fontWeight: '700',
            fontSize: '0.95rem', marginTop: '1.5rem',
            boxShadow: '0 4px 12px rgba(var(--primary-rgb, 220,38,38), 0.2)',
          }}
        >
          <Plus size={18} strokeWidth={2.5} /> Ajouter
        </button>
      </div>

      {/* Days List */}
      {days.length === 0 ? (
        <div style={{ 
          textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8',
          background: 'var(--surface-bg)', borderRadius: '20px', border: '1px solid var(--surface-border)',
        }}>
          <Calendar size={48} strokeWidth={1.5} style={{ marginBottom: '1rem', opacity: 0.4 }} />
          <p style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 0.5rem 0', color: '#64748b' }}>
            Aucun jour d'évolution enregistré
          </p>
          <p style={{ fontSize: '0.9rem', margin: 0 }}>
            Ajoutez un jour pour commencer à suivre l'évolution du patient.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {days.map((dayEntry, index) => (
            <DayEntry
              key={`${dayEntry.day}-${index}`}
              day={dayEntry.day}
              dayData={dayEntry}
              onUpdate={(updated) => updateDay(index, updated)}
              onRemove={() => removeDay(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default React.memo(Evolution);
