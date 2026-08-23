const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'components', 'Sections', 'Antecedents.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace header
const newHeader = `<header className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Antécédents</h2>
        <button 
          className="tag-manager-btn"
          onClick={() => setIsManagerOpen(true)}
        >
          <Settings size={18} /> Gérer la banque
        </button>
      </header>`;
content = content.replace(/<header className="section-header">\s*<h2>Antécédents<\/h2>\s*<\/header>/, newHeader);

// 2. Replace Antécédents Chirurgicaux (lines 135-168)
const surgicalSectionRegex = /\{\/\* B\) Antécédents Chirurgicaux \*\/\}(.|\n)*?\{\/\* C\) Antécédents Gynéco-Obstétricaux \*\/\}/;

const surgicalSection = `{/* B) Antécédents Chirurgicaux */}
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

      {/* C) Antécédents Gynéco-Obstétricaux */}`;

content = content.replace(surgicalSectionRegex, surgicalSection);

// 3. Add Modal at the end (before last closing div)
const modalContent = `

      {/* --- TAG MANAGER MODAL --- */}
      {isManagerOpen && (
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
      )}
    </div>
  );
});`;
content = content.replace(/    <\/div>\s*  \);\s*}\);/, modalContent);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Script completed');
