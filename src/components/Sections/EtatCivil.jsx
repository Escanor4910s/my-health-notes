import React from 'react';
import { PremiumInput } from '../Form/PremiumInput';

function EtatCivil({ data, updateData }) {
  const handleChange = (e) => { updateData({ [e.target.id]: e.target.value }); };

  return (
    <div className="animate-fade-in glass-panel" style={{ padding: '3rem' }}>
      <header className="section-header">
        <h2>État Civil</h2>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
        <PremiumInput id="nom_prenoms" label="Nom et Prénoms" value={data?.nom_prenoms || ''} onChange={handleChange} required />
        <PremiumInput id="age" type="number" label="Âge" value={data?.age || ''} onChange={handleChange} required />
        
        <div className="input-group">
          <label className="input-label" htmlFor="sexe">Sexe</label>
          <select className="input-field" id="sexe" value={data?.sexe || ''} onChange={handleChange}>
            <option value=""></option>
            <option value="M">Masculin</option>
            <option value="F">Féminin</option>
          </select>
        </div>
        
        <PremiumInput id="profession" label="Profession" value={data?.profession || ''} onChange={handleChange} />
        <PremiumInput id="domicile" label="Domicile" value={data?.domicile || ''} onChange={handleChange} />
        <PremiumInput id="region_origine" label="Région d'origine" value={data?.region_origine || ''} onChange={handleChange} />
        <PremiumInput id="lateralite" label="Latéralité" value={data?.lateralite || ''} onChange={handleChange} />
        <PremiumInput id="contact" label="Contact" value={data?.contact || ''} onChange={handleChange} />
        
        <div className="input-group">
          <label className="input-label" htmlFor="situation_matrimoniale">Situation matrimoniale</label>
          <select className="input-field" id="situation_matrimoniale" value={data?.situation_matrimoniale || ''} onChange={handleChange}>
            <option value=""></option>
            <option value="Célibataire">Célibataire</option>
            <option value="Marié(e)">Marié(e)</option>
            <option value="Divorcé(e)">Divorcé(e)</option>
            <option value="Veuf/Veuve">Veuf/Veuve</option>
          </select>
        </div>
        
        <PremiumInput id="nationalite" label="Nationalité" value={data?.nationalite || ''} onChange={handleChange} />
        <PremiumInput id="religion" label="Religion" value={data?.religion || ''} onChange={handleChange} />
        <PremiumInput id="numero_dossier" label="Numéro de dossier" value={data?.numero_dossier || ''} onChange={handleChange} />
        <PremiumInput id="date_entree" type="date" label="Date d'entrée dans le service" value={data?.date_entree || ''} onChange={handleChange} />
        <PremiumInput id="personne_urgence" label="Personne à contacter (urgence)" value={data?.personne_urgence || ''} onChange={handleChange} />
        <PremiumInput id="contact_urgence" label="Contact de la personne (urgence)" placeholder="Numéro de téléphone" value={data?.contact_urgence || ''} onChange={handleChange} />
        <PremiumInput id="assurance" label="Assurance / Couverture maladie" value={data?.assurance || ''} onChange={handleChange} />
      </div>
    </div>
  );
}


export default React.memo(EtatCivil);

