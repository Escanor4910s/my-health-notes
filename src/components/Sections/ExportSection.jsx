import React, { useState } from 'react';
import { Loader2, FileDown, FileEdit, FileSignature, Settings, X, Mail, CheckCircle2, Circle } from 'lucide-react';
import { askAI, compactDossier } from '../../lib/ai';
import { escapeHtml } from '../../lib/html';
import { getInstitutionSettings, saveInstitutionSettings } from '../../lib/institution';

const SECTION_LABELS = {
  'etat-civil': 'État civil',
  'motif': 'Motif de consultation',
  'histoire': 'Histoire de la maladie',
  'antecedents': 'Antécédents',
  'examen-general': 'Examen Général',
  'examen-physique': 'Examen Physique Spécialisé',
  'resume': 'Résumé Syndromique',
  'hypotheses': 'Hypothèses Diagnostiques',
  'bilan': 'Bilan Paraclinique',
  'diagnostic': 'Diagnostic Retenu',
  'traitement': 'Traitement & Surveillance',
  'evolution': 'Évolution',
  'conclusion': 'Conclusion & Pronostic'
};

const val = (obj, key) => escapeHtml(obj?.[key] || '');
const listChecked = (data, mapping) => {
  if (!data) return '';
  return Object.entries(mapping)
    .filter(([key]) => data[key])
    .map(([, label]) => label)
    .join(', ') || 'Aucun';
};

function ExportSection({ data }) {
  const [aiLoading, setAiLoading] = useState(false);
  const [letterLoading, setLetterLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  
  const [exportOptions, setExportOptions] = useState(() => {
    const opts = {};
    Object.keys(SECTION_LABELS).forEach(k => { opts[k] = true; });
    return opts;
  });
  const [showOptions, setShowOptions] = useState(false);

  const toggleOption = (k) => {
    setExportOptions(prev => ({ ...prev, [k]: !prev[k] }));
  };

  const mdToHTML = (md) => {
    let html = md;
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    html = html.replace(/^\* (.*$)/gim, '<ul><li>$1</li></ul>');
    html = html.replace(/<\/ul>\n<ul>/gim, '');
    html = html.replace(/\n/gim, '<br>');
    return html;
  };

  const buildFilteredData = () => {
    const filtered = {};
    for (const key of Object.keys(data)) {
      // Map exact keys or specialized physical exam sections to the overarching category
      let optionKey = key;
      if (key.startsWith('examen-') && key !== 'examen-general') {
        optionKey = 'examen-physique';
      }
      if (exportOptions[optionKey] !== false) {
        filtered[key] = data[key];
      }
    }
    return filtered;
  };

  const generateHTMLContent = () => {
    const filteredData = buildFilteredData();
    const ec = filteredData['etat-civil'] || {};
    const motif = filteredData['motif'] || {};
    const hdm = filteredData['histoire'] || {};
    const atcd = filteredData['antecedents'] || {};
    const eg = filteredData['examen-general'] || {};
    const resume = filteredData['resume'] || {};
    const hypotheses = filteredData['hypotheses'] || {};
    const bilan = filteredData['bilan'] || {};
    const diagnostic = filteredData['diagnostic'] || {};
    const traitement = filteredData['traitement'] || {};
    const evolution = filteredData['evolution'] || {};
    const conclusion = filteredData['conclusion'] || {};
    
    // Check if specialized physical exams are included
    const hasPhysique = exportOptions['examen-physique'];

    let html = '';
    
    if (exportOptions['etat-civil']) {
      html += `<h2>État Civil</h2>
      <p><strong>Nom & Prénoms :</strong> ${val(ec, 'nom_prenoms')} <br>
      <strong>Âge :</strong> ${val(ec, 'age')} | <strong>Sexe :</strong> ${val(ec, 'sexe')} <br>
      <strong>Profession :</strong> ${val(ec, 'profession')} | <strong>Origine :</strong> ${val(ec, 'origine')}</p>`;
    }

    if (exportOptions['motif']) {
      html += `<h2>Motif de Consultation</h2><p>${val(motif, 'motif')}</p>`;
    }

    if (exportOptions['histoire']) {
      html += `<h2>Histoire de la Maladie</h2><p>${val(hdm, 'texte')}</p>`;
    }

    if (exportOptions['antecedents']) {
      html += `<h2>Antécédents</h2>
      <p><strong>Médicaux :</strong> ${val(atcd, 'medicaux')}</p>
      <p><strong>Chirurgicaux :</strong> ${val(atcd, 'chirurgicaux')}</p>
      <p><strong>Familiaux :</strong> ${val(atcd, 'familiaux')}</p>`;
    }

    if (exportOptions['examen-general']) {
      html += `<h2>Examen Général</h2>
      <p><strong>État Général :</strong> ${val(eg, 'etat_general')}<br>
      <strong>Constantes :</strong> TA: ${val(eg, 'ta')} mmHg | FC: ${val(eg, 'fc')} bpm | FR: ${val(eg, 'fr')} /min | T°: ${val(eg, 'temperature')} °C</p>`;
    }

    if (hasPhysique) {
      const pleuro = filteredData['examen-pleuro'] || {};
      const cardio = filteredData['examen-cardio'] || {};
      const digestif = filteredData['examen-digestif'] || {};
      const neuro = filteredData['examen-neuro'] || {};
      if (pleuro.inspection || cardio.inspection || digestif.inspection || neuro.inspection) {
         html += `<h2>Examen Physique Spécialisé</h2>`;
         if (pleuro.inspection) html += `<h3>Pleuro-pulmonaire</h3><p>${val(pleuro, 'inspection')}</p>`;
         if (cardio.inspection) html += `<h3>Cardio-vasculaire</h3><p>${val(cardio, 'inspection')}</p>`;
         if (digestif.inspection) html += `<h3>Digestif</h3><p>${val(digestif, 'inspection')}</p>`;
         if (neuro.inspection) html += `<h3>Neurologique</h3><p>${val(neuro, 'inspection')}</p>`;
      }
    }

    if (exportOptions['resume'] && resume.texte) {
      html += `<h2>Résumé Syndromique</h2><p>${val(resume, 'texte')}</p>`;
    }

    if (exportOptions['hypotheses'] && hypotheses.liste) {
      html += `<h2>Hypothèses Diagnostiques</h2><p>${val(hypotheses, 'liste')}</p>`;
    }

    if (exportOptions['bilan']) {
      html += `<h2>Bilan Paraclinique</h2>
      <p><strong>Biologie :</strong> ${val(bilan, 'biologie')}</p>
      <p><strong>Imagerie :</strong> ${val(bilan, 'imagerie')}</p>`;
    }

    if (exportOptions['diagnostic'] && diagnostic.diagnostic_retenu) {
      html += `<h2>Diagnostic Retenu</h2><p>${val(diagnostic, 'diagnostic_retenu')}</p>`;
    }

    if (exportOptions['traitement']) {
      html += `<h2>Traitement & Surveillance</h2><p>${val(traitement, 'traitement_recu')}</p>`;
    }
    
    if (exportOptions['evolution'] && evolution.texte) {
      html += `<h2>Évolution</h2><p>${val(evolution, 'texte')}</p>`;
    }
    
    if (exportOptions['conclusion'] && conclusion.texte) {
      html += `<h2>Conclusion</h2><p>${val(conclusion, 'texte')}</p>`;
    }

    return html;
  };

  const getFullHTML = () => {
    const inst = getInstitutionSettings();
    return `<html><head><meta charset="utf-8"><title>Observation</title>
      <style>
        @page { size: A4; margin: 2cm; }
        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; color: #000; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 25px; }
        .inst-name { font-size: 16pt; font-weight: bold; text-transform: uppercase; margin: 0 0 5px 0; }
        .inst-contact { font-size: 11pt; color: #444; margin: 0; }
        h1 { font-size: 16pt; text-align: center; text-transform: uppercase; margin-bottom: 30px; }
        h2 { font-size: 13pt; text-transform: uppercase; border-bottom: 1px solid #999; margin-top: 25px; padding-bottom: 4px; }
        h3 { font-size: 12pt; text-decoration: underline; margin-top: 15px; }
        p { margin: 10px 0; }
      </style></head><body>
        <div class="header">
          <p class="inst-name">${inst?.name || 'CENTRE HOSPITALIER'}</p>
          <p class="inst-contact">${inst?.department || 'Service de Médecine'}</p>
          ${inst?.address ? `<p class="inst-contact">${inst.address}</p>` : ''}
          ${inst?.phone ? `<p class="inst-contact">Tél: ${inst.phone}</p>` : ''}
        </div>
        <h1>Observation Médicale</h1>
        ${generateHTMLContent()}
      </body></html>`;
  };

  const downloadPDF = () => {
    const w = window.open('', '_blank');
    w.document.write(getFullHTML());
    w.document.close();
    w.onload = () => { w.print(); };
  };

  const downloadWord = () => {
    const blob = new Blob(['\ufeff' + getFullHTML()], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const nom = data?.['etat-civil']?.nom_prenoms || 'Patient';
    link.href = url;
    link.download = `Observation_${nom.replace(/\s+/g, '_')}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAI = async () => {
    if (aiLoading) return;
    setAiLoading(true);
    setAiError('');
    try {
      const filteredDossier = compactDossier(buildFilteredData());
      const md = await askAI('export', { dossier: filteredDossier });
      const nom = data?.['etat-civil']?.nom_prenoms || 'Patient';
      const html = `<html><head><meta charset="utf-8"><title>Rapport - ${nom}</title>
        <style>
          @page { size: A4; margin: 2cm; }
          body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; }
          h1 { font-size: 17pt; text-align: center; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 8px; }
          h2 { font-size: 13pt; text-transform: uppercase; border-bottom: 1px solid #999; margin-top: 22px; }
        </style></head><body><h1>Rapport Clinique d'Expertise</h1>${mdToHTML(md)}</body></html>`;
      const w = window.open('', '_blank');
      w.document.write(html);
      w.document.close();
      w.onload = () => { w.print(); };
    } catch (e) {
      setAiError(e.message);
    } finally {
      setAiLoading(false);
    }
  };

  const generateLetter = async () => {
    if (letterLoading) return;
    setLetterLoading(true);
    setAiError('');
    try {
      const filteredDossier = compactDossier(buildFilteredData());
      const inst = getInstitutionSettings();
      const userPrompt = `Rédige une lettre de liaison confraternelle professionnelle pour adresser ce patient à un confrère.
      Médecin expéditeur / Service : ${inst?.name || 'Médecin traitant'}, ${inst?.department || ''}.
      Voici les données du dossier sélectionnées par le médecin :

${filteredDossier}


      Formatte la réponse directement en HTML complet structuré pour impression, avec en-tête, lieu et date du jour (en haut à droite), objet, formule d'appel ("Cher confrère,"), corps du texte clair et concis (avec les antécédents, l'histoire, la clinique, le diagnostic et le traitement), et formule de politesse finale.`;
      
      const res = await askAI('chat', { history: [{ role: 'user', content: userPrompt }] });
      let html = res;
      // Strip markdown codeblocks if AI wraps in ```html
      html = html.replace(/```html/gi, '').replace(/```/g, '');
      
      const w = window.open('', '_blank');
      w.document.write(html);
      w.document.close();
      w.onload = () => { w.print(); };
    } catch (e) {
      setAiError(e.message);
    } finally {
      setLetterLoading(false);
    }
  };

  return (
    <div className="animate-fade-in glass-panel" style={{ 
      padding: '4rem 3rem', 
      textAlign: 'center',
      maxWidth: '1200px',
      margin: '0 auto',
      background: 'var(--surface)',
      borderRadius: '24px',
      boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)'
    }}>
      <header className="section-header" style={{ borderBottom: 'none', marginBottom: '1.5rem', justifyContent: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', background: 'linear-gradient(135deg, var(--primary), var(--text-main))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Finaliser l'Observation
        </h2>
      </header>
      
      <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: '1.6' }}>
        Votre dossier clinique est complet. Personnalisez les sections à exporter et choisissez le format idéal pour le partage.
      </p>

      {/* Export Options Panel */}
      <div style={{ marginBottom: '3rem', textAlign: 'left', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
        <button onClick={() => setShowOptions(!showOptions)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Settings size={20} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#0f172a' }}>Export Sélectif</h3>
          </div>
          <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>
            {Object.values(exportOptions).filter(Boolean).length} / {Object.keys(exportOptions).length} sections incluses
          </span>
        </button>
        
        {showOptions && (
          <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
            {Object.entries(SECTION_LABELS).map(([k, label]) => (
              <div key={k} onClick={() => toggleOption(k)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                {exportOptions[k] ? <CheckCircle2 size={20} color="var(--primary)" /> : <Circle size={20} color="#cbd5e1" />}
                <span style={{ fontSize: '0.95rem', fontWeight: exportOptions[k] ? '600' : '500', color: exportOptions[k] ? '#0f172a' : '#64748b' }}>{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .export-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; justify-content: center; }
        @media (max-width: 1024px) { .export-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .export-grid { grid-template-columns: 1fr; } }
        .export-card-premium { position: relative; display: flex; flex-direction: column; align-items: center; gap: 1.25rem; padding: 2rem 1.5rem; border-radius: 20px; border: 1px solid var(--surface-border); background: var(--surface-bg); cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 4px 15px rgba(0,0,0,0.02); overflow: hidden; }
        .export-card-premium::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: var(--primary); transform: scaleX(0); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); transform-origin: center; }
        .export-card-premium:hover { transform: translateY(-6px); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.12); border-color: transparent; background: var(--surface); }
        .export-card-premium:hover::before { transform: scaleX(1); }
        .card-icon-container { position: relative; width: 70px; height: 70px; display: flex; align-items: center; justify-content: center; }
        .card-icon-ring { position: absolute; inset: 0; border-radius: 50%; border: 1.5px dashed currentColor; opacity: 0.15; transition: all 0.5s; }
        .export-card-premium:hover .card-icon-ring { transform: rotate(90deg) scale(1.1); opacity: 0.8; }
        .card-icon-wrapper { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: transform 0.3s; background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.4)); box-shadow: 0 8px 20px -5px rgba(0,0,0,0.08); position: relative; z-index: 2; }
        .export-card-premium:hover .card-icon-wrapper { transform: scale(1.05); }
        .card-title { margin: 0 0 0.5rem 0; font-size: 1.1rem; font-weight: 800; color: var(--text-main); }
      `}} />

      <div className="export-grid">
        {/* PDF Card */}
        <button onClick={downloadPDF} className="export-card-premium">
          <div className="card-icon-container" style={{ color: '#ef4444' }}>
            <div className="card-icon-ring"></div>
            <div className="card-icon-wrapper"><FileDown size={24} strokeWidth={2} color="#ef4444" /></div>
          </div>
          <div><h3 className="card-title">Format PDF</h3><span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Impression standard & Partage sécurisé.</span></div>
        </button>

        {/* Word Card */}
        <button onClick={downloadWord} className="export-card-premium">
          <div className="card-icon-container" style={{ color: '#3b82f6' }}>
            <div className="card-icon-ring"></div>
            <div className="card-icon-wrapper"><FileEdit size={24} strokeWidth={2} color="#3b82f6" /></div>
          </div>
          <div><h3 className="card-title">Format Word</h3><span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Modification et ajustements ultérieurs.</span></div>
        </button>
        
        {/* Lettre de Liaison (New) */}
        <button onClick={generateLetter} disabled={letterLoading} className="export-card-premium" style={{ cursor: letterLoading ? 'wait' : 'pointer', opacity: letterLoading ? 0.7 : 1 }}>
          <div className="card-icon-container" style={{ color: '#8b5cf6' }}>
            <div className="card-icon-ring"></div>
            <div className="card-icon-wrapper">
              {letterLoading ? <Loader2 size={24} className="animate-spin" color="#8b5cf6" /> : <Mail size={24} strokeWidth={2} color="#8b5cf6" />}
            </div>
          </div>
          <div><h3 className="card-title">Lettre de Liaison</h3><span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{letterLoading ? 'Rédaction IA...' : "Courrier confraternel rédigé par l'IA."}</span></div>
        </button>

        {/* Humanized Expert Report Card */}
        <button onClick={exportAI} disabled={aiLoading} className="export-card-premium" style={{ cursor: aiLoading ? 'wait' : 'pointer', opacity: aiLoading ? 0.7 : 1 }}>
          <div className="card-icon-container" style={{ color: 'var(--primary)' }}>
            <div className="card-icon-ring"></div>
            <div className="card-icon-wrapper">
              {aiLoading ? <Loader2 size={24} className="animate-spin" color="var(--primary)" /> : <FileSignature size={24} strokeWidth={2} color="var(--primary)" />}
            </div>
          </div>
          <div><h3 className="card-title">Rapport d'Expert</h3><span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{aiLoading ? 'Compilation...' : 'Synthèse clinique IA optimisée.'}</span></div>
        </button>
      </div>

      {aiError && (
        <div style={{ marginTop: '2rem', padding: '1rem', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '12px', color: '#b91c1c', fontSize: '0.95rem', display: 'inline-block' }}>
          {aiError}
        </div>
      )}
    </div>
  );
}

export default React.memo(ExportSection);
