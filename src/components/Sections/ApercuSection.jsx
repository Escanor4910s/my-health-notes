import React, { useState } from 'react';
import SymptomModal from '../UI/SymptomModal';

function ApercuSection({ data }) {
  const d = (section, key) => data?.[section]?.[key];
  const or = (val, fallback = 'Néant') => val || fallback;
  const Neant = () => <span style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Néant</span>;

  const [selectedSymptom, setSelectedSymptom] = useState(null);

  // Helper to parse narrative and highlight symptoms
  const renderHighlightedNarrative = (text, symptomes = []) => {
    if (!text) return <Neant />;
    if (!symptomes || symptomes.length === 0) return <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>;

    // Create an array of words to search for, sorted by length descending to match longest first
    const searchTerms = symptomes.map(s => ({
      type: s.type.toLowerCase(),
      original: s
    })).sort((a, b) => b.type.length - a.type.length);

    let parts = [{ text, isMatch: false }];

    searchTerms.forEach(term => {
      const newParts = [];
      parts.forEach(part => {
        if (part.isMatch) {
          newParts.push(part);
          return;
        }

        const regex = new RegExp(`(${term.type}s?)`, 'gi'); // match plural too (e.g. "douleurs")
        const split = part.text.split(regex);
        
        split.forEach(s => {
          if (s.toLowerCase() === term.type || s.toLowerCase() === term.type + 's') {
            newParts.push({ text: s, isMatch: true, symptom: term.original });
          } else if (s) {
            newParts.push({ text: s, isMatch: false });
          }
        });
      });
      parts = newParts;
    });

    return (
      <span style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
        {parts.map((part, i) => 
          part.isMatch ? (
            <span 
              key={i} 
              className="highlight-symptom"
              onClick={() => setSelectedSymptom(part.symptom)}
              title="Cliquez pour voir les caractéristiques"
            >
              {part.text}
            </span>
          ) : (
            <span key={i}>{part.text}</span>
          )
        )}
      </span>
    );
  };

  // Remove inline styles in favor of CSS classes
  const sectionSubtitleStyle = {
    fontFamily: 'var(--font-body)',
    fontSize: '1.05rem',
    fontWeight: '600',
    color: 'var(--text-main)',
    marginTop: '1.5rem',
    marginBottom: '0.5rem',
    textDecoration: 'underline',
    textDecorationColor: '#e5e2dd',
    textUnderlineOffset: '4px'
  };

  const labelStyle = { fontWeight: '600', color: 'var(--text-muted)', marginRight: '0.5rem' };
  const valueStyle = { color: 'var(--text-main)' };

  const Line = ({ label, value }) => (
    <div style={{ marginBottom: '0.4rem' }}>
      <span style={labelStyle}>{label} :</span>
      <span style={valueStyle}>{value || <Neant />}</span>
    </div>
  );
  
  const TextBlock = ({ label, text }) => {
    if (!text) return <Line label={label} value={null} />;
    return (
      <div style={{ marginBottom: '0.8rem' }}>
        <div style={labelStyle}>{label} :</div>
        <div style={{ ...valueStyle, paddingLeft: '1rem', borderLeft: '2px solid #f0efeb', marginTop: '0.3rem', whiteSpace: 'pre-wrap' }}>
          {text}
        </div>
      </div>
    );
  };

  // Helper for checkboxes
  const renderCheckboxes = (sectionKey, mapping) => {
    const sectionData = data?.[sectionKey] || {};
    const checked = Object.entries(mapping).filter(([key]) => sectionData[key]);
    if (checked.length === 0) return <Neant />;
    return (
      <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
        {checked.map(([key, label]) => (
          <li key={key} style={valueStyle}>{label}</li>
        ))}
      </ul>
    );
  };

  const medKeys = {
    hta: 'HTA', diabete: 'Diabète', asthme: 'Asthme', tuberculose: 'Tuberculose', vih: 'VIH/SIDA', drepanocytose: 'Drépanocytose', epilepsie: 'Épilepsie', ugd: 'UGD', cardiopathie: 'Cardiopathie', nephropathie: 'Néphropathie', hepatite_b: 'Hépatite B', hepatite_c: 'Hépatite C', avc: 'AVC', raa: 'RAA', paludisme_grave: 'Paludisme grave', hospitalisation: 'Hospitalisations antérieures', transfusion: 'Transfusions sanguines'
  };
  const lifestyleKeys = {
    tabac: 'Tabac', alcool: 'Alcool', drogues: 'Drogues/Stupéfiants', sedentaire: 'Sédentaire', sportif: 'Sportif', vaccination_jour: 'Vaccination à jour'
  };
  const allergyKeys = {
    allergie_medicamenteuse: 'Allergie médicamenteuse', allergie_alimentaire: 'Allergie alimentaire', allergie_saisonniere: 'Allergie saisonnière'
  };
  const mhdKeys = {
    repos_lit: 'Repos au lit',
    regime_sans_sel: 'Régime sans sel',
    regime_hyposode: 'Régime hyposodé',
    regime_diabetique: 'Régime diabétique',
    regime_hypoprotidique: 'Régime hypoprotidique',
    regime_hyperprotidique: 'Régime hyperprotidique',
    regime_hypocalorique: 'Régime hypocalorique',
    regime_pauvre_residus: 'Régime pauvre en résidus',
    arret_tabac: 'Arrêt tabac / alcool',
    hydratation: 'Hydratation abondante',
    regime_riche_fer: 'Régime riche en fer',
    regime_sans_gluten: 'Régime sans gluten'
  };
  const examBiologieKeys = {
    nfs: 'NFS',
    crp: 'CRP',
    ge_goutte_epaisse: 'GE/Goutte épaisse',
    glycemie_ajun: 'Glycémie à jeun',
    urea: 'Urée',
    creatininemie: 'Créatininémie',
    ionogramme: 'Ionogramme sanguin',
    bilan_hepatique: 'Bilan hépatique (ASAT, ALAT)',
    bilan_lipidique: 'Bilan lipidique',
    tp_tck: 'TP/TCK',
    serologie_vih: 'Sérologie VIH',
    ecbu: 'ECBU',
    coproculture: 'Coproculture'
  };
  const examImagerieKeys = {
    rx_thorax: 'Radiographie du thorax',
    rx_abdomen: 'ASP',
    rx_os: 'Radiographie osseuse',
    echographie_abdo: 'Échographie abdominale',
    echographie_pelvienne: 'Échographie pelvienne',
    echographie_cardiaque: 'Échographie cardiaque',
    tdm_cerebrale: 'TDM cérébrale',
    tdm_tap: 'TDM TAP',
    irm: 'IRM',
    ecg: 'ECG'
  };

  const calculateIMC = () => {
    const poids = parseFloat(d('examen-physique', 'poids'));
    const taille = parseFloat(d('examen-physique', 'taille'));
    if (poids && taille && taille > 0) {
      const tailleM = taille > 3 ? taille / 100 : taille; // handle cm or m
      return (poids / (tailleM * tailleM)).toFixed(1);
    }
    return null;
  };
  const imc = calculateIMC();

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <SymptomModal symptom={selectedSymptom} onClose={() => setSelectedSymptom(null)} />

      {/* TITLE */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 className="apercu-main-title">Observation Médicale</h2>
        <p style={{ color: 'var(--text-light)', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.9rem', marginTop: '0.5rem' }}>Aperçu Final</p>
      </div>

      {/* ANALYSE IA */}
      <div className="apercu-page" style={{ borderLeft: '3px solid var(--primary)' }}>
        <div className="apercu-page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} /> Analyse IA du dossier
        </div>
        {!aiContent && !aiLoading && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Laissez l'IA organiser les informations saisies, repérer les données manquantes et proposer une synthèse.
          </p>
        )}
        {aiLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
            <Loader2 size={16} className="animate-spin" /> Analyse du dossier en cours...
          </div>
        )}
        {aiError && <p style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>{aiError}</p>}
        {aiContent && <Markdown content={aiContent} />}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <button className="btn btn-primary" disabled={aiLoading} onClick={() => runAI('apercu')}>
            <Sparkles size={16} /> {aiContent ? 'Relancer l\'analyse' : 'Analyser avec l\'IA'}
          </button>
          <button className="btn btn-secondary" disabled={aiLoading} onClick={() => runAI('synthese')}>
            <FileText size={16} /> Résumé syndromique
          </button>
        </div>
      </div>


      {/* PAGE 1: IDENTITÉ */}
      <div className="apercu-page">
        <div className="apercu-page-title">1. Identité du patient</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <Line label="Nom et Prénoms" value={d('etat-civil', 'nom_prenoms')} />
            <Line label="Âge" value={d('etat-civil', 'age')} />
            <Line label="Sexe" value={d('etat-civil', 'sexe')} />
            <Line label="Profession" value={d('etat-civil', 'profession')} />
            <Line label="Domicile" value={d('etat-civil', 'domicile')} />
          </div>
          <div>
            <Line label="Situation matrimoniale" value={d('etat-civil', 'statut_matrimonial')} />
            <Line label="Nationalité" value={d('etat-civil', 'nationalite')} />
            <Line label="N° Dossier" value={d('etat-civil', 'numero_dossier')} />
            <Line label="Date d'entrée" value={d('etat-civil', 'date_entree')} />
            <Line label="Contact" value={d('etat-civil', 'contact')} />
          </div>
        </div>
      </div>

      {/* PAGE 2: MOTIF */}
      <div className="apercu-page">
        <div className="apercu-page-title">2. Motif de consultation</div>
        <Line label="Motif principal" value={d('motif', 'motif_principal')} />
        <Line label="Date d'admission" value={d('motif', 'date_admission')} />
        <Line label="Heure d'admission" value={d('motif', 'heure_admission')} />
        <Line label="Mode d'arrivée" value={
          (d('motif', 'type_arrivee') || '') + 
          (d('motif', 'details_arrivee') ? ` - ${d('motif', 'details_arrivee')}` : '')
        } />
      </div>

      {/* PAGE 3: HISTOIRE */}
      <div className="apercu-page">
        <div className="apercu-page-title">3. Histoire de la maladie</div>
        <div style={{ ...valueStyle, paddingLeft: '1rem', borderLeft: '2px solid #f0efeb', marginTop: '0.3rem', marginBottom: '2rem' }}>
          {renderHighlightedNarrative(d('histoire', 'synthese_narrative'), d('histoire', 'symptomes'))}
        </div>
        
        {/* Fallback display if old data is still present */}
        {d('histoire', 'premier_signe') && !d('histoire', 'synthese_narrative') && (
          <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--beige-light)', borderRadius: '4px' }}>
            <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', marginBottom: '1rem' }}>Ancienne structure de données détectée :</p>
            <Line label="1er signe" value={d('histoire', 'premier_signe')} />
            <Line label="Date de début" value={d('histoire', 'date_debut')} />
            <Line label="Mode de début" value={d('histoire', 'mode_debut')} />
            <Line label="Circonstances" value={d('histoire', 'circonstances')} />
            <Line label="Facteurs déclenchants" value={d('histoire', 'facteurs_declenchants')} />
            <Line label="Facteurs aggravants/calmants" value={d('histoire', 'facteurs_aggravants_calmants')} />
            <Line label="Signes associés" value={d('histoire', 'signes_associes')} />
          </div>
        )}
      </div>

      {/* PAGE 4: ANTÉCÉDENTS */}
      <div className="apercu-page">
        <div className="apercu-page-title">4. Antécédents</div>
        
        <div style={sectionSubtitleStyle}>Médicaux</div>
        {renderCheckboxes('antecedents', medKeys)}
        {d('antecedents', 'medicaux_details') && <div style={{marginTop: '0.5rem'}}><span style={labelStyle}>Détails :</span> {d('antecedents', 'medicaux_details')}</div>}
        
        <div style={sectionSubtitleStyle}>Chirurgicaux</div>
        {d('antecedents', 'chirurgicaux_details') ? <div style={valueStyle}>{d('antecedents', 'chirurgicaux_details')}</div> : <Neant />}
        
        <div style={sectionSubtitleStyle}>Gynéco-Obstétricaux</div>
        {d('antecedents', 'gyneco_details') ? <div style={valueStyle}>{d('antecedents', 'gyneco_details')}</div> : <Neant />}

        <div style={sectionSubtitleStyle}>Familiaux</div>
        
        {(!d('antecedents', 'statut_pere') && !d('antecedents', 'statut_mere') && !d('antecedents', 'statut_conjoint') && !d('antecedents', 'collateraux_details') && !d('antecedents', 'descendants_details')) ? (
          <Neant />
        ) : (
          <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem', ...valueStyle }}>
            {d('antecedents', 'statut_pere') && (
              <li style={{ marginBottom: '0.3rem' }}>
                <span style={{ fontWeight: '600' }}>Père :</span> {d('antecedents', 'statut_pere') === 'vivant' ? `Vivant ${d('antecedents', 'sante_pere') ? `(${d('antecedents', 'sante_pere')})` : ''}` : d('antecedents', 'statut_pere') === 'decede' ? `Décédé ${d('antecedents', 'cause_deces_pere') ? `(Cause : ${d('antecedents', 'cause_deces_pere')})` : ''}` : 'Inconnu'}
              </li>
            )}
            {d('antecedents', 'statut_mere') && (
              <li style={{ marginBottom: '0.3rem' }}>
                <span style={{ fontWeight: '600' }}>Mère :</span> {d('antecedents', 'statut_mere') === 'vivante' ? `Vivante ${d('antecedents', 'sante_mere') ? `(${d('antecedents', 'sante_mere')})` : ''}` : d('antecedents', 'statut_mere') === 'decedee' ? `Décédée ${d('antecedents', 'cause_deces_mere') ? `(Cause : ${d('antecedents', 'cause_deces_mere')})` : ''}` : 'Inconnue'}
              </li>
            )}
            {d('antecedents', 'statut_conjoint') && d('antecedents', 'statut_conjoint') !== 'aucun' && (
              <li style={{ marginBottom: '0.3rem' }}>
                <span style={{ fontWeight: '600' }}>Conjoint(e) :</span> {d('antecedents', 'statut_conjoint') === 'vivant' ? `Vivant(e) ${d('antecedents', 'sante_conjoint') ? `(${d('antecedents', 'sante_conjoint')})` : ''}` : d('antecedents', 'statut_conjoint') === 'divorce' ? `Divorcé(e) ${d('antecedents', 'sante_conjoint') ? `(${d('antecedents', 'sante_conjoint')})` : ''}` : `Décédé(e) ${d('antecedents', 'cause_deces_conjoint') ? `(Cause : ${d('antecedents', 'cause_deces_conjoint')})` : ''}`}
              </li>
            )}
            {d('antecedents', 'collateraux_details') && (
              <li style={{ marginBottom: '0.3rem' }}><span style={{ fontWeight: '600' }}>Fratrie :</span> {d('antecedents', 'collateraux_details')}</li>
            )}
            {d('antecedents', 'descendants_details') && (
              <li style={{ marginBottom: '0.3rem' }}><span style={{ fontWeight: '600' }}>Descendants :</span> {d('antecedents', 'descendants_details')}</li>
            )}
          </ul>
        )}
        
        <div style={sectionSubtitleStyle}>Allergiques</div>
        {renderCheckboxes('antecedents', allergyKeys)}
        {d('antecedents', 'allergies_details') && <div style={{marginTop: '0.5rem'}}><span style={labelStyle}>Détails :</span> {d('antecedents', 'allergies_details')}</div>}
        
        <div style={sectionSubtitleStyle}>Mode de vie</div>
        {renderCheckboxes('antecedents', lifestyleKeys)}
        {d('antecedents', 'mode_vie_details') && <div style={{marginTop: '0.5rem'}}><span style={labelStyle}>Détails :</span> {d('antecedents', 'mode_vie_details')}</div>}
      </div>

      {/* PAGE 5: EXAMEN GÉNÉRAL */}
      <div className="apercu-page">
        <div className="apercu-page-title">5. Examen général et Constantes</div>
        
        <div style={sectionSubtitleStyle}>Constantes Vitales</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', backgroundColor: '#fcfbf9', padding: '1.5rem', borderRadius: '4px', border: '1px solid #f0efeb', marginBottom: '1.5rem' }}>
          <Line label="Température" value={d('examen-physique', 'temperature') ? `${d('examen-physique', 'temperature')} °C` : null} />
          <Line label="Pouls" value={d('examen-physique', 'pouls') ? `${d('examen-physique', 'pouls')} bpm` : null} />
          <Line label="TA" value={d('examen-physique', 'ta') ? `${d('examen-physique', 'ta')} mmHg` : null} />
          <Line label="SpO2" value={d('examen-physique', 'spo2') ? `${d('examen-physique', 'spo2')} %` : null} />
          <Line label="FR" value={d('examen-physique', 'fr') ? `${d('examen-physique', 'fr')} cpm` : null} />
          <Line label="Poids" value={d('examen-physique', 'poids') ? `${d('examen-physique', 'poids')} kg` : null} />
          <Line label="Taille" value={d('examen-physique', 'taille') ? `${d('examen-physique', 'taille')} ${d('examen-physique', 'taille') > 3 ? 'cm' : 'm'}` : null} />
          <Line label="IMC" value={imc ? `${imc} kg/m²` : null} />
          <Line label="Glasgow" value={d('examen-physique', 'glasgow') ? `${d('examen-physique', 'glasgow')}/15` : null} />
        </div>

        <div style={sectionSubtitleStyle}>État Général</div>
        <Line label="Morphotype" value={d('examen-physique', 'morphotype')} />
        <Line label="État nutritionnel" value={d('examen-physique', 'etat_nutritionnel')} />
        <Line label="État d'hydratation" value={d('examen-physique', 'etat_hydratation')} />
        <Line label="Coloration des téguments" value={d('examen-physique', 'coloration_teguments')} />

        <div style={{ marginTop: '2rem' }}>
          {d('examen-physique', 'pleuro_notes') && <TextBlock label="Appareil Pleuro-pulmonaire" text={d('examen-physique', 'pleuro_notes')} />}
          {d('examen-physique', 'cardio_notes') && <TextBlock label="Appareil Cardio-circulatoire" text={d('examen-physique', 'cardio_notes')} />}
          {d('examen-physique', 'digestif_notes') && <TextBlock label="Appareil Digestif" text={d('examen-physique', 'digestif_notes')} />}
          {d('examen-physique', 'neuro_notes') && <TextBlock label="Appareil Neurologique" text={d('examen-physique', 'neuro_notes')} />}
          {d('examen-physique', 'uro_notes') && <TextBlock label="Appareil Uro-Néphrologique" text={d('examen-physique', 'uro_notes')} />}
          {d('examen-physique', 'locomoteur_notes') && <TextBlock label="Appareil Locomoteur" text={d('examen-physique', 'locomoteur_notes')} />}
          {d('examen-physique', 'dermato_notes') && <TextBlock label="Appareil Dermatologique" text={d('examen-physique', 'dermato_notes')} />}
          {d('examen-physique', 'orl_notes') && <TextBlock label="Examen ORL" text={d('examen-physique', 'orl_notes')} />}
          {d('examen-physique', 'ganglions_notes') && <TextBlock label="Aires Ganglionnaires" text={d('examen-physique', 'ganglions_notes')} />}
          {d('examen-physique', 'gyneco_exam_notes') && <TextBlock label="Examen Gynécologique" text={d('examen-physique', 'gyneco_exam_notes')} />}
        </div>
      </div>

      {/* PAGE 7: RÉSUMÉ ET HYPOTHÈSES */}
      <div className="apercu-page">
        <div className="apercu-page-title">7. Résumé Syndromique</div>
        <TextBlock label="Résumé" text={d('resume', 'resume')} />
        <TextBlock label="Problème(s) posé(s)" text={d('resume', 'probleme')} />
      </div>

      {/* PAGE 7: HYPOTHÈSES DIAGNOSTIQUES */}
      <div className="apercu-page">
        <div className="apercu-page-title">8. Hypothèses Diagnostiques</div>
        {data?.hypotheses?.hypotheses?.length > 0 ? (
          data.hypotheses.hypotheses.map((hypo, idx) => (
            <div key={idx} style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #f0efeb', borderRadius: '4px' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '1rem' }}>
                Hypothèse {idx + 1} : {hypo.nom || <Neant />}
              </div>
              
              <div style={sectionSubtitleStyle}>Arguments pour :</div>
              {hypo.arguments_pour_epidemio && <TextBlock label="Épidémiologiques" text={hypo.arguments_pour_epidemio} />}
              {hypo.arguments_pour_clinique && <TextBlock label="Cliniques" text={hypo.arguments_pour_clinique} />}
              {hypo.arguments_pour_paraclinique && <TextBlock label="Paracliniques" text={hypo.arguments_pour_paraclinique} />}
              {!hypo.arguments_pour_epidemio && !hypo.arguments_pour_clinique && !hypo.arguments_pour_paraclinique && <Neant />}

              <div style={sectionSubtitleStyle}>Arguments contre :</div>
              {hypo.arguments_contre_epidemio && <TextBlock label="Épidémiologiques" text={hypo.arguments_contre_epidemio} />}
              {hypo.arguments_contre_clinique && <TextBlock label="Cliniques" text={hypo.arguments_contre_clinique} />}
              {hypo.arguments_contre_paraclinique && <TextBlock label="Paracliniques" text={hypo.arguments_contre_paraclinique} />}
              {!hypo.arguments_contre_epidemio && !hypo.arguments_contre_clinique && !hypo.arguments_contre_paraclinique && <Neant />}
            </div>
          ))
        ) : (
          <Neant />
        )}
      </div>

      {/* PAGE 9: BILAN ET DIAGNOSTIC */}
      <div className="apercu-page">
        <div className="apercu-page-title">9. Bilan Paraclinique</div>
        
        <div style={sectionSubtitleStyle}>A) Examens Biologiques</div>
        {data?.bilansBiologiques && Object.keys(data.bilansBiologiques).length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            {Object.keys(data.bilansBiologiques).map(key => {
              const exam = data.bilansBiologiques[key];
              const formatBioKey = (k) => {
                const map = {
                  'nfs_gr': 'Hématies', 'nfs_hb': 'Hémoglobine', 'nfs_ht': 'Hématocrite', 'nfs_vgm': 'VGM', 'nfs_tcmh': 'TCMH', 'nfs_ccmh': 'CCMH', 'nfs_retic': 'Réticulocytes',
                  'nfs_leuco': 'Leucocytes', 'nfs_pnn': 'PNN', 'nfs_pne': 'PNE', 'nfs_pnb': 'PNB', 'nfs_lympho': 'Lymphocytes', 'nfs_mono': 'Monocytes',
                  'nfs_plaq': 'Plaquettes', 'nfs_vpm': 'VPM', 'nfs_anisocytose': 'Anisocytose', 'nfs_poikilocytose': 'Poïkilocytose', 'nfs_schizocytes': 'Schizocytes', 'nfs_blastes': 'Blastes',
                  'nfs_commentaires': 'Commentaires', 'crp_val': 'CRP', 'vs_val1': 'VS (1ère H)', 'vs_val2': 'VS (2ème H)', 'iono_na': 'Natrémie', 'iono_k': 'Kaliémie',
                  'iono_cl': 'Chlorémie', 'iono_ca': 'Calcémie', 'glycemie_val': 'Glycémie', 'hba1c': 'HbA1c', 'creatinine_val': 'Créatininémie', 'dfg_val': 'DFG',
                  'uree_val': 'Urée', 'asat_val': 'ASAT', 'alat_val': 'ALAT', 'transa_ratio': 'Ratio ASAT/ALAT', 'bili_totale': 'Bilirubine Totale',
                  'bili_conj': 'Bilirubine Conjuguée', 'bili_libre': 'Bilirubine Libre', 'resultat': 'Résultat', 'status': 'Statut'
                };
                if (map[k]) return map[k];
                if (k.endsWith('_status')) return 'Interprétation';
                let name = k.replace(/^.*_/, '');
                return name.charAt(0).toUpperCase() + name.slice(1);
              };

              return (
                <div key={key} style={{ padding: '1rem', background: 'var(--beige-light)', borderRadius: 'var(--radius-sm)' }}>
                  <h5 style={{ color: 'var(--primary)', margin: '0 0 0.5rem 0' }}>{exam.label}</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    {Object.entries(exam.data || {}).map(([k, v]) => {
                      if (!v) return null;
                      return (
                        <div key={k} style={{ display: 'flex' }}>
                          <strong style={{ minWidth: '150px' }}>{formatBioKey(k)} :</strong>
                          <span>{v}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : <Neant />}
        
        <div style={sectionSubtitleStyle}>B) Examens d'Imagerie</div>
        {data?.bilansRadiologiques && Object.keys(data.bilansRadiologiques).length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            {Object.keys(data.bilansRadiologiques).map(key => {
              const exam = data.bilansRadiologiques[key];
              return (
                <div key={key} style={{ padding: '0.75rem 1rem', background: 'var(--beige-light)', borderRadius: 'var(--radius-sm)' }}>
                  <h5 style={{ color: 'var(--primary)', margin: '0 0 0.25rem 0' }}>{exam.label}</h5>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    <strong>Statut:</strong> {exam.data?.status || 'Non précisé'}
                    {exam.data?.resultat_details && (
                      <div style={{ marginTop: '0.25rem' }}><strong>Détails:</strong> {exam.data.resultat_details}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : <Neant />}
        
        <div style={sectionSubtitleStyle}>C) Autres Explorations</div>
        {data?.autresExplorations && Object.keys(data.autresExplorations).length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            {Object.keys(data.autresExplorations).map(key => {
              const exam = data.autresExplorations[key];
              return (
                <div key={key} style={{ padding: '0.75rem 1rem', background: 'var(--beige-light)', borderRadius: 'var(--radius-sm)' }}>
                  <h5 style={{ color: 'var(--primary)', margin: '0 0 0.25rem 0' }}>{exam.label}</h5>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    <strong>Statut:</strong> {exam.data?.status || 'Non précisé'}
                    {exam.data?.resultat_details && (
                      <div style={{ marginTop: '0.25rem' }}><strong>Détails:</strong> {exam.data.resultat_details}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : <Neant />}
        
        {/* Fallback old data */}
        {(d('paraclinique', 'radio_autres') || d('paraclinique', 'explo_autres')) && (
          <div style={{ marginTop: '2rem' }}>
            <div style={sectionSubtitleStyle}>Notes additionnelles (Ancien format)</div>
            {d('paraclinique', 'radio_autres') && <TextBlock label="Imagerie" text={d('paraclinique', 'radio_autres')} />}
            {d('paraclinique', 'explo_autres') && <TextBlock label="Explorations" text={d('paraclinique', 'explo_autres')} />}
          </div>
        )}
      </div>

      {/* PAGE 9: DIAGNOSTICS */}
      <div className="apercu-page">
        <div className="apercu-page-title">10. Diagnostic Retenu</div>
        
        <div style={sectionSubtitleStyle}>Diagnostics Retenus</div>
        <TextBlock label="Diagnostic(s) retenu(s)" text={d('diagnostic', 'diagnostics_retenus')} />
        <TextBlock label="Arguments en faveur" text={d('diagnostic', 'arguments_diagnostic')} />

        <div style={sectionSubtitleStyle}>Diagnostic Étiologique</div>
        <TextBlock label="Diagnostic étiologique" text={d('diagnostic', 'diagnostic_etio')} />
        {d('diagnostic', 'est_pathologie_infectieuse') && (
          <TextBlock label="Description du germe / Agent pathogène" text={d('diagnostic', 'germe_description')} />
        )}

        <div style={sectionSubtitleStyle}>Diagnostics Différentiels</div>
        {data?.diagnostic?.diffDiagnostics?.length > 0 ? (
          data.diagnostic.diffDiagnostics.map((diag, idx) => (
            <div key={idx} style={{ marginBottom: '1rem' }}>
              <div style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.2rem' }}>❖ {diag.nom || <Neant />}</div>
              {diag.arguments && <div style={{ paddingLeft: '1.5rem', color: 'var(--text-main)' }}><span style={labelStyle}>Arguments contre :</span> {diag.arguments}</div>}
            </div>
          ))
        ) : (
          <TextBlock label="Diagnostic(s) différentiel(s)" text={d('diagnostic', 'diagnostic_differentiel') || 'Aucun diagnostic différentiel'} />
        )}

        <div style={sectionSubtitleStyle}>Diagnostic Topographique</div>
        <TextBlock label="Diagnostic topographique" text={d('diagnostic', 'diagnostic_topo')} />
      </div>

      {/* PAGE 10: TRAITEMENT */}
      <div className="apercu-page">
        <div className="apercu-page-title">11. Traitement et Surveillance</div>
        <TextBlock label="But du traitement" text={d('traitement', 'but_traitement')} />
        
        <div style={sectionSubtitleStyle}>Moyens : Mesures hygiéno-diététiques</div>
        {renderCheckboxes('traitement', mhdKeys)}
        {d('traitement', 'mesures_details') && <TextBlock label="Détails" text={d('traitement', 'mesures_details')} />}

        <div style={sectionSubtitleStyle}>Moyens : Traitement médical</div>
        
        {/* Étiologique */}
        <div style={{ fontWeight: '600', color: 'var(--primary)', marginTop: '1rem', marginBottom: '0.5rem' }}>Traitement Étiologique :</div>
        {data?.traitement?.medsEtiologique?.length > 0 ? (
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            {data.traitement.medsEtiologique.map((med, idx) => (
              med.molecule && (
                <li key={idx} style={{ marginBottom: '0.5rem', ...valueStyle }}>
                  <strong>{med.molecule}</strong> {med.dose && ` - ${med.dose}`} {med.posologie && ` - ${med.posologie}`}
                </li>
              )
            ))}
          </ul>
        ) : <div style={{ marginBottom: '1rem' }}><Neant /></div>}
        {d('traitement', 'ttt_etiologique') && <TextBlock label="Détails" text={d('traitement', 'ttt_etiologique')} />}

        {/* Symptomatique */}
        <div style={{ fontWeight: '600', color: 'var(--primary)', marginTop: '1rem', marginBottom: '0.5rem' }}>Traitement Symptomatique :</div>
        {data?.traitement?.medsSymptomatique?.length > 0 ? (
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            {data.traitement.medsSymptomatique.map((med, idx) => (
              med.molecule && (
                <li key={idx} style={{ marginBottom: '0.5rem', ...valueStyle }}>
                  <strong>{med.molecule}</strong> {med.dose && ` - ${med.dose}`} {med.posologie && ` - ${med.posologie}`}
                </li>
              )
            ))}
          </ul>
        ) : <div style={{ marginBottom: '1rem' }}><Neant /></div>}
        {d('traitement', 'ttt_symptomatique') && <TextBlock label="Détails" text={d('traitement', 'ttt_symptomatique')} />}

        {/* Adjuvant */}
        <div style={{ fontWeight: '600', color: 'var(--primary)', marginTop: '1rem', marginBottom: '0.5rem' }}>Traitement Adjuvant :</div>
        {data?.traitement?.medsAdjuvant?.length > 0 ? (
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
            {data.traitement.medsAdjuvant.map((med, idx) => (
              med.molecule && (
                <li key={idx} style={{ marginBottom: '0.5rem', ...valueStyle }}>
                  <strong>{med.molecule}</strong> {med.dose && ` - ${med.dose}`} {med.posologie && ` - ${med.posologie}`}
                </li>
              )
            ))}
          </ul>
        ) : <div style={{ marginBottom: '1rem' }}><Neant /></div>}
        {d('traitement', 'ttt_adjuvant') && <TextBlock label="Détails" text={d('traitement', 'ttt_adjuvant')} />}

        <div style={sectionSubtitleStyle}>Moyens : Traitement chirurgical</div>
        <TextBlock label="Détails" text={d('traitement', 'ttt_chirurgical')} />
        
        <div style={sectionSubtitleStyle}>Surveillance</div>
        <TextBlock label="Clinique" text={d('traitement', 'surveillance_clinique')} />
        <TextBlock label="Paraclinique" text={d('traitement', 'surveillance_paraclinique')} />
      </div>

      {/* PAGE 11: ÉVOLUTION */}
      {data?.evolution?.days && data.evolution.days.length > 0 && (
        <div className="apercu-page">
          <div className="apercu-page-title">11. Évolution</div>
          <div style={{ 
            overflowX: 'auto', 
            marginBottom: '1.5rem', 
            borderRadius: '16px', 
            border: '1px solid #e2e8f0', 
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)',
            background: '#fff'
          }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: '700px', fontSize: '0.95rem' }}>
              <thead>
                <tr>
                  <th style={{ 
                    padding: '1.25rem 1rem', 
                    textAlign: 'left', 
                    fontWeight: '800', 
                    color: '#0f172a',
                    background: '#f8fafc',
                    position: 'sticky', 
                    left: 0, 
                    zIndex: 2,
                    borderBottom: '2px solid #e2e8f0',
                    borderRight: '2px solid #e2e8f0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontSize: '0.85rem'
                  }}>
                    Paramètres
                  </th>
                  {data.evolution.days.map((dayObj, idx) => (
                    <th key={idx} style={{ 
                      padding: '1.25rem 1rem',
                      textAlign: 'center', 
                      background: 'linear-gradient(135deg, var(--primary), #ef4444)', 
                      color: '#fff', 
                      borderBottom: '2px solid var(--primary)',
                      borderRight: idx === data.evolution.days.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.2)',
                      fontWeight: '800',
                      letterSpacing: '1px',
                      boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.1)'
                    }}>
                      {dayObj.day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 'signes_cliniques', label: 'Signes cliniques' },
                  { id: 'signes_paracliniques', label: 'Signes paracliniques' },
                  { id: 'plaintes', label: 'Plaintes' },
                  { id: 'traitements', label: 'Traitements' },
                ].map((param, rowIdx, arr) => (
                  <tr key={param.id} style={{ 
                    background: rowIdx % 2 === 0 ? '#fff' : '#f8fafc',
                    transition: 'background 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
                  onMouseOut={(e) => e.currentTarget.style.background = rowIdx % 2 === 0 ? '#fff' : '#f8fafc'}
                  >
                    <td style={{ 
                      padding: '1.25rem 1rem', 
                      fontWeight: '700', 
                      color: 'var(--primary)', 
                      position: 'sticky', 
                      left: 0, 
                      background: rowIdx % 2 === 0 ? '#fff' : '#f8fafc', 
                      zIndex: 1, 
                      borderRight: '2px solid #e2e8f0',
                      borderBottom: rowIdx === arr.length - 1 ? 'none' : '1px solid #e2e8f0',
                      whiteSpace: 'nowrap'
                    }}>
                      {param.label}
                    </td>
                    {data.evolution.days.map((dayObj, idx) => (
                      <td key={idx} style={{ 
                        padding: '1.25rem 1rem', 
                        borderRight: idx === data.evolution.days.length - 1 ? 'none' : '1px solid #e2e8f0',
                        borderBottom: rowIdx === arr.length - 1 ? 'none' : '1px solid #e2e8f0',
                        color: dayObj[param.id] ? '#334155' : '#cbd5e1',
                        lineHeight: '1.6',
                        verticalAlign: 'top'
                      }}>
                        {dayObj[param.id] ? (
                          <div style={{ whiteSpace: 'pre-wrap' }}>{dayObj[param.id]}</div>
                        ) : (
                          <div style={{ fontStyle: 'italic', textAlign: 'center' }}>-</div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAGE 12: CONCLUSION ET PRONOSTIC */}
      <div className="apercu-page">
        <div className="apercu-page-title">12. Conclusion et Pronostic</div>
        <Line label="Pronostic" value={d('conclusion', 'pronostic')} />
        <TextBlock label="Risques encourus" text={d('conclusion', 'risques_encourus')} />
        <TextBlock label="Conclusion" text={d('conclusion', 'conclusion')} />
      </div>

    </div>
  );
}


export default React.memo(ApercuSection);

