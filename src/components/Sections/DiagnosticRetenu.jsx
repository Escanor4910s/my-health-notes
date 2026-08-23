import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Plus, Trash2, ShieldAlert } from 'lucide-react';
import { PremiumInput, PremiumTextArea } from '../Form/PremiumInput';
import { PremiumCheckbox } from '../Form/PremiumCheckbox';

function DiagnosticRetenu({ data, updateData }) {
  const [open, setOpen] = useState({ retenus: true, etio: false, diff: false, topo: false });
  const [diffDiagnostics, setDiffDiagnostics] = useState(data?.diffDiagnostics || [{ id: 1, nom: '', arguments: '' }]);
  
  const toggle = (key) => setOpen(prev => ({ ...prev, [key]: !prev[key] }));
  
  const handleChange = (e) => {
    const { name, id, value, type, checked } = e.target;
    const key = name || id;
    updateData({ [key]: type === 'checkbox' ? checked : value });
  };

  useEffect(() => {
    updateData({ diffDiagnostics });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diffDiagnostics]);

  const addDiffDiagnostic = () => {
    setDiffDiagnostics([...diffDiagnostics, { id: Date.now(), nom: '', arguments: '' }]);
  };

  const removeDiffDiagnostic = (id) => {
    setDiffDiagnostics(diffDiagnostics.filter(d => d.id !== id));
  };

  const updateDiffDiagnostic = (id, field, value) => {
    setDiffDiagnostics(diffDiagnostics.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const AccordionHeader = ({ label, sectionKey }) => (
    <button onClick={() => toggle(sectionKey)} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
      padding: '0.9rem 1.2rem', borderRadius: '12px',
      background: open[sectionKey] ? 'rgba(139,111,71,0.08)' : 'var(--beige-light)',
      border: '1.5px solid ' + (open[sectionKey] ? 'var(--surface-border)' : 'transparent'),
      cursor: 'pointer', marginBottom: open[sectionKey] ? '1rem' : '0.5rem',
      fontSize: '0.95rem', fontWeight: '600', fontFamily: 'var(--font-body)',
      color: 'var(--text-main)', transition: 'all 0.2s ease',
    }}>
      <span>{label}</span>
      {open[sectionKey] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
    </button>
  );

  return (
    <div className="animate-fade-in glass-panel" style={{ padding: '3rem' }}>
      <header className="section-header"><h2>Diagnostics</h2></header>

      {/* 1. Diagnostics Retenus */}
      <AccordionHeader label="Diagnostics Retenus" sectionKey="retenus" />
      {open.retenus && <div style={{ marginBottom: '1.5rem' }}>
        <PremiumTextArea id="diagnostics_retenus" label="Diagnostic(s) retenu(s)" placeholder="Le(s) diagnostic(s) final(s) après confrontation clinico-paraclinique..." value={data?.diagnostics_retenus || ''} onChange={handleChange} rows={4} />
        <PremiumTextArea id="arguments_diagnostic" label="Arguments en faveur" placeholder="Arguments cliniques et paracliniques..." value={data?.arguments_diagnostic || ''} onChange={handleChange} rows={4} />
      </div>}

      {/* 2. Diagnostic Étiologique */}
      <AccordionHeader label="Diagnostic Étiologique" sectionKey="etio" />
      {open.etio && <div style={{ marginBottom: '1.5rem' }}>
        <PremiumTextArea id="diagnostic_etio" label="Diagnostic étiologique" placeholder="Ex: Pneumopathie à pneumocoque, Paludisme à Plasmodium falciparum..." value={data?.diagnostic_etio || ''} onChange={handleChange} rows={3} />
        
        <div style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>
          <PremiumCheckbox 
            id="est_pathologie_infectieuse" 
            name="est_pathologie_infectieuse" 
            label="Il s'agit d'une pathologie infectieuse / parasitaire (Afficher la description du germe)" 
            checked={data?.est_pathologie_infectieuse || false} 
            onChange={handleChange} 
          />
        </div>

        {data?.est_pathologie_infectieuse && (
          <div className="animate-fade-in" style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.5)', borderRadius: '10px', border: '1px solid var(--surface-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <ShieldAlert size={16} color="var(--primary)" />
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.05em' }}>
                Description du Germe / Agent Pathogène
              </h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', fontStyle: 'italic' }}>
              Décrivez le germe responsable : famille, morphologie, habitat, mode de transmission, cycle de reproduction...
            </p>
            <PremiumTextArea id="germe_description" label="Caractéristiques du germe" placeholder="Description détaillée du germe..." value={data?.germe_description || ''} onChange={handleChange} rows={5} />
          </div>
        )}
      </div>}

      {/* 3. Diagnostic Différentiel */}
      <AccordionHeader label="Diagnostic Différentiel" sectionKey="diff" />
      {open.diff && <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '1rem' }}>
          Listez vos diagnostics différentiels. Si aucun, laissez vide.
        </p>

        {diffDiagnostics.map((diag, index) => (
          <div key={diag.id} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr auto', gap: '1rem', alignItems: 'start', marginBottom: '1rem', padding: '1rem', background: 'var(--surface-color)', borderRadius: '8px', border: '1px solid var(--surface-border)' }}>
            <div style={{ marginTop: '2rem', fontSize: '1.2rem', color: 'var(--primary)', fontWeight: 'bold' }}>❖</div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ fontSize: '0.85rem' }}>Diagnostic évoqué</label>
              <input type="text" className="input-field" placeholder="Ex: Tuberculose pulmonaire" value={diag.nom || ''} onChange={(e) => updateDiffDiagnostic(diag.id, 'nom', e.target.value)} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" style={{ fontSize: '0.85rem' }}>Arguments pour l'écarter (Contre)</label>
              <textarea className="input-field" placeholder="Ex: Pas de sueurs nocturnes, BK crachats négatifs..." rows="2" style={{ resize: 'vertical' }} value={diag.arguments || ''} onChange={(e) => updateDiffDiagnostic(diag.id, 'arguments', e.target.value)} />
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <button type="button" onClick={() => removeDiffDiagnostic(diag.id)} style={{ padding: '0.6rem', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer' }} title="Supprimer">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        
        <button type="button" onClick={addDiffDiagnostic} style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', backgroundColor: 'transparent', border: '2px dashed var(--primary)', color: 'var(--primary)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: '500' }}>
          <Plus size={18} />
          Ajouter un diagnostic différentiel
        </button>
      </div>}

      {/* 4. Diagnostic Topographique */}
      <AccordionHeader label="Diagnostic Topographique" sectionKey="topo" />
      {open.topo && <div style={{ marginBottom: '1.5rem' }}>
        <PremiumTextArea id="diagnostic_topo" label="Diagnostic topographique" placeholder="Ex: Poumon droit, lobe inférieur..." value={data?.diagnostic_topo || ''} onChange={handleChange} rows={3} />
      </div>}

    </div>
  );
}


export default React.memo(DiagnosticRetenu);

