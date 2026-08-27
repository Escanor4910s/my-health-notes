import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, Settings, LayoutDashboard, PlusCircle, Activity, UserPlus, Zap } from 'lucide-react';

export default function CommandPalette({ isOpen, onClose, navigateTo }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  
  const commands = [
    { id: 'etat-civil', title: 'Aller à: État civil', icon: UserPlus, action: () => navigateTo('etat-civil') },
    { id: 'motif', title: 'Aller à: Motif de consultation', icon: Activity, action: () => navigateTo('motif') },
    { id: 'histoire', title: 'Aller à: Histoire de la maladie', icon: FileText, action: () => navigateTo('histoire') },
    { id: 'examen-general', title: 'Aller à: Examen Général', icon: Zap, action: () => navigateTo('examen-general') },
    { id: 'dashboard', title: 'Retour au tableau de bord', icon: LayoutDashboard, action: () => navigateTo('dashboard') },
    { id: 'settings', title: 'Ouvrir les paramètres', icon: Settings, action: () => window.dispatchEvent(new CustomEvent('open-settings')) }
  ];

  const filteredCommands = commands.filter(c => c.title.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('open-command-palette'));
        }
        return;
      }

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < filteredCommands.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="animate-fade-in"
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '15vh',
        background: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(8px)'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '100%', maxWidth: '600px',
          background: 'var(--surface)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--surface-border)',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--surface-border)' }}>
          <Search size={20} color="var(--text-muted)" style={{ marginRight: '1rem' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            placeholder="Rechercher une action ou taper une commande..."
            style={{
              flex: 1, border: 'none', background: 'transparent',
              fontSize: '1.1rem', color: 'var(--text-main)', outline: 'none'
            }}
          />
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-color)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--surface-border)' }}>
            ESC
          </div>
        </div>

        <div style={{ maxHeight: '350px', overflowY: 'auto', padding: '0.5rem' }}>
          {filteredCommands.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Aucune commande trouvée pour "{query}"
            </div>
          ) : (
            filteredCommands.map((cmd, index) => {
              const isSelected = index === selectedIndex;
              const Icon = cmd.icon;
              return (
                <div
                  key={cmd.id}
                  onClick={() => { cmd.action(); onClose(); }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{
                    display: 'flex', alignItems: 'center', padding: '0.75rem 1rem',
                    cursor: 'pointer', borderRadius: '8px',
                    background: isSelected ? 'var(--primary)' : 'transparent',
                    color: isSelected ? '#fff' : 'var(--text-main)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Icon size={18} style={{ marginRight: '1rem', opacity: isSelected ? 1 : 0.6 }} />
                  <span style={{ fontWeight: isSelected ? '500' : 'normal' }}>{cmd.title}</span>
                  {isSelected && (
                    <span style={{ marginLeft: 'auto', fontSize: '0.75rem', opacity: 0.8 }}>
                      Entrée ↵
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
