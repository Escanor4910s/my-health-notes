import React, { useState } from 'react';
import { Loader2, FileDown, FileEdit, FileSignature, Settings, X } from 'lucide-react';
import { askAI, compactDossier } from '../../lib/ai';
import { escapeHtml } from '../../lib/html';
import { getInstitutionSettings, saveInstitutionSettings } from '../../lib/institution';

// Helper: convert checkbox data to a readable string
const listChecked = (data, mapping) => {
  if (!data) return '';
  return Object.entries(mapping)
    .filter(([key]) => data[key])
    .map(([, label]) => label)
    .join(', ') || 'Aucun';
};

const val = (obj, key) => escapeHtml(obj?.[key] || '');


function ExportSection({ data }) {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');


  const generateHTMLContent = () => {
    const ec = data['etat-civil'] || {};
    const motif = data['motif'] || {};
    const hdm = data['histoire'] || {};
    const atcd = data['antecedents'] || {};
    const eg = data['examen-general'] || {};
    const pleuro = data['examen-pleuro'] || {};
    const cardio = data['examen-cardio'] || {};
    const digestif = data['examen-digestif'] || {};
    const neuro = data['examen-neuro'] || {};
    const uro = data['examen-uro'] || {};
    const loco = data['examen-locomoteur'] || {};
    const dermato = data['examen-dermato'] || {};
    const orl = data['examen-orl'] || {};
    const gang = data['examen-ganglions'] || {};
    const gyneco = data['examen-gyneco'] || {};
    const resume = data['resume'] || {};
    const hyp = data['hypotheses'] || {};
    const bilan = data['bilan'] || {};
    const diag = data['diagnostic'] || {};
    const ttt = data['traitement'] || {};
    const concl = data['conclusion'] || {};

    // Antecedents medicaux
    const atcdMedicaux = listChecked(atcd, {
      hta: 'HTA', diabete: 'Diabète', asthme: 'Asthme', tuberculose: 'Tuberculose',
      vih: 'VIH/SIDA', drepanocytose: 'Drépanocytose', epilepsie: 'Épilepsie',
      ugd: 'UGD', cardiopathie: 'Cardiopathie', nephropathie: 'Néphropathie',
      hepatite_b: 'Hépatite B', hepatite_c: 'Hépatite C', avc: 'AVC',
      raa: 'RAA', paludisme_grave: 'Paludisme grave',
      hospitalisation: 'Hospitalisation(s) antérieure(s)',
      transfusion: 'Transfusion(s) sanguine(s)'
    });

    return `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Observation Médicale - ${val(ec,'nom_prenoms')}</title>
        <style>
          @page { size: A4; margin: 2cm; }
          body { font-family: 'Times New Roman', Times, serif; line-height: 1.5; color: #000; font-size: 12pt; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .header h1 { font-size: 18pt; margin: 0; text-transform: uppercase; }
          .header p { margin: 2px 0; font-size: 11pt; font-weight: bold; }
          h2 { font-size: 14pt; color: #000; margin-top: 20px; border-bottom: 1px solid #000; padding-bottom: 3px; text-transform: uppercase; page-break-after: avoid; }
          h3 { font-size: 12pt; color: #333; margin-top: 15px; text-decoration: underline; page-break-after: avoid; }
          p { margin: 8px 0; text-align: justify; }
          .patient-info { display: flex; flex-wrap: wrap; border: 1px solid #000; padding: 10px; margin-bottom: 20px; }
          .patient-info div { width: 50%; box-sizing: border-box; padding: 2px 5px; }
          .label { font-weight: bold; }
          .section { margin-bottom: 20px; page-break-inside: avoid; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          td { padding: 4px 8px; border: 1px solid #000; }
          td.label-cell { font-weight: bold; width: 40%; background-color: #f2f2f2; }
          .signature { margin-top: 50px; text-align: right; page-break-inside: avoid; }
          .signature p { margin: 5px 0; }
          /* Highlight symptoms explicitly for HDM */
          .highlight { font-weight: bold; text-decoration: underline; }
          @media print {
            body { font-size: 11pt; }
            h2 { background-color: #e6e6e6; padding: 4px; border: 1px solid #000; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <p>RÉPUBLIQUE DU SÉNÉGAL</p>
          <p>MINISTÈRE DE LA SANTÉ ET DE L'ACTION SOCIALE</p>
          <p>CENTRE HOSPITALIER NATIONAL UNIVERSITAIRE</p>
          <br/>
          <h1>DOSSIER D'OBSERVATION MÉDICALE</h1>
        </div>
        
        <div class="section">
          <h2>1. IDENTITÉ DU PATIENT</h2>
          <div class="patient-info">
            <div><span class="label">Nom et Prénoms :</span> ${val(ec,'nom_prenoms')}</div>
            <div><span class="label">Numéro de dossier :</span> ${val(ec,'numero_dossier')}</div>
            <div><span class="label">Âge :</span> ${val(ec,'age')} ans</div>
            <div><span class="label">Date d'entrée :</span> ${val(ec,'date_entree')}</div>
            <div><span class="label">Sexe :</span> ${ec.sexe === 'M' ? 'Masculin' : ec.sexe === 'F' ? 'Féminin' : ''}</div>
            <div><span class="label">Nationalité :</span> ${val(ec,'nationalite')}</div>
            <div><span class="label">Profession :</span> ${val(ec,'profession')}</div>
            <div><span class="label">Situation mat. :</span> ${val(ec,'situation_matrimoniale')}</div>
            <div style="width: 100%;"><span class="label">Domicile :</span> ${val(ec,'domicile')}</div>
            <div style="width: 100%;"><span class="label">Contact :</span> ${val(ec,'contact')}</div>
          </div>
        </div>
        
        <div class="section">
          <h2>2. MOTIF DE CONSULTATION</h2>
          <p><span class="label">Motif principal :</span> ${val(motif,'motif_principal')}</p>
          <p><span class="label">Admission le :</span> ${val(motif,'date_admission')} à ${val(motif,'heure_admission')}</p>
          ${motif.type_arrivee ? `<p><span class="label">Mode d'arrivée :</span> ${motif.type_arrivee} — ${val(motif,'details_arrivee')}</p>` : ''}
        </div>
        
        <div class="section">
          <h2>3. HISTOIRE DE LA MALADIE</h2>
          <p style="white-space: pre-wrap;">${val(hdm,'synthese_narrative') || `<i>Synthèse non générée. Voici les éléments bruts :</i><br/>
          <b>1er signe :</b> ${val(hdm,'premier_signe')} | <b>Début :</b> ${val(hdm,'date_debut')} | <b>Mode :</b> ${val(hdm,'mode_debut')}<br/>
          <b>Signes associés :</b> ${val(hdm,'signes_associes')}<br/>
          <b>Évolution :</b> ${val(hdm,'evolution')}
          `}</p>
        </div>
        
        <div class="section">
          <h2>4. ANTÉCÉDENTS</h2>
          <h3>Médicaux</h3>
          <p>${atcdMedicaux || 'RAS'}</p>
          ${atcd.medicaux_details ? `<p><i>${atcd.medicaux_details}</i></p>` : ''}
          <h3>Chirurgicaux</h3>
          <p>${val(atcd,'chirurgicaux_details') || 'RAS'}</p>
          <h3>Gynéco-Obstétricaux</h3>
          <p>DDR: ${val(atcd,'ddr')} | Gestité: ${val(atcd,'gestite')} Parité: ${val(atcd,'parite')} | Enfants vivants: ${val(atcd,'enfants_vivants')}</p>
          ${atcd.gyneco_details ? `<p><i>${atcd.gyneco_details}</i></p>` : ''}
          <h3>Mode de vie & Toxiques</h3>
          <p>${val(atcd,'mode_vie_details') || 'RAS'}</p>
          <h3>Allergies</h3>
          <p>${val(atcd,'allergies_details') || 'Pas d allergie connue'}</p>
        </div>
        
        <div class="section">
          <h2>5. EXAMEN PHYSIQUE</h2>
          <h3>Constantes vitales</h3>
          <table>
            <tr><td class="label-cell">Température</td><td>${val(eg,'temperature')} °C</td><td class="label-cell">FR</td><td>${val(eg,'freq_resp')} c/min</td></tr>
            <tr><td class="label-cell">Pouls</td><td>${val(eg,'pouls')} bpm</td><td class="label-cell">Poids</td><td>${val(eg,'poids')} kg</td></tr>
            <tr><td class="label-cell">Tension Artérielle</td><td>${val(eg,'tension')} mmHg</td><td class="label-cell">Taille</td><td>${val(eg,'taille')} cm</td></tr>
            <tr><td class="label-cell">SpO2</td><td>${val(eg,'spo2')} %</td><td class="label-cell">Diurèse</td><td>${val(eg,'diurese')} mL/24h</td></tr>
          </table>
          
          ${pleuro.pleuro_notes ? `<h3>Pleuro-Pulmonaire</h3><p>${pleuro.pleuro_notes}</p>` : ''}
          ${cardio.cardio_notes ? `<h3>Cardio-Circulatoire</h3><p>${cardio.cardio_notes}</p>` : ''}
          ${digestif.digestif_notes ? `<h3>Digestif</h3><p>${digestif.digestif_notes}</p>` : ''}
          ${neuro.neuro_notes ? `<h3>Neurologique</h3><p>${neuro.neuro_notes}</p>` : ''}
          ${uro.uro_notes ? `<h3>Uro-Néphrologique</h3><p>${uro.uro_notes}</p>` : ''}
          ${loco.locomoteur_notes ? `<h3>Locomoteur</h3><p>${loco.locomoteur_notes}</p>` : ''}
          ${dermato.dermato_notes ? `<h3>Dermatologique</h3><p>${dermato.dermato_notes}</p>` : ''}
          ${orl.orl_notes ? `<h3>ORL</h3><p>${orl.orl_notes}</p>` : ''}
          ${gang.ganglions_notes ? `<h3>Aires Ganglionnaires</h3><p>${gang.ganglions_notes}</p>` : ''}
          ${gyneco.gyneco_exam_notes ? `<h3>Gynécologique</h3><p>${gyneco.gyneco_exam_notes}</p>` : ''}
        </div>
        
        <div class="section">
          <h2>6. RÉSUMÉ SYNDROMIQUE</h2>
          <p>${val(resume,'resume')}</p>
          <p><span class="label">Problème posé :</span> ${val(resume,'probleme')}</p>
        </div>
        
        <div class="section">
          <h2>7. HYPOTHÈSES DIAGNOSTIQUES</h2>
          ${hyp.hypothese_1 ? `<p><span class="label">1ère Hypothèse :</span> ${hyp.hypothese_1}</p><p>${val(hyp,'arguments_1')}</p>` : '<p>Aucune hypothèse formulée.</p>'}
          ${hyp.hypothese_2 ? `<p><span class="label">2ème Hypothèse :</span> ${hyp.hypothese_2}</p><p>${val(hyp,'arguments_2')}</p>` : ''}
          ${hyp.hypothese_3 ? `<p><span class="label">3ème Hypothèse :</span> ${hyp.hypothese_3}</p><p>${val(hyp,'arguments_3')}</p>` : ''}
        </div>
        
        <div class="section">
          <h2>8. BILAN PARACLINIQUE DEMANDÉ</h2>
          ${val(bilan,'bio_autres') ? `<h3>Biologique</h3><p>${bilan.bio_autres}</p>` : ''}
          ${val(bilan,'bio_creatinine_mg_l') ? `<p>Créatininémie: ${bilan.bio_creatinine_mg_l} mg/L</p>` : ''}
          ${val(bilan,'radio_autres') ? `<h3>Imagerie</h3><p>${bilan.radio_autres}</p>` : ''}
          ${val(bilan,'explo_autres') ? `<h3>Explorations diverses</h3><p>${bilan.explo_autres}</p>` : ''}
        </div>
        
        <div class="section">
          <h2>9. DIAGNOSTIC RETENU</h2>
          <p>${val(diag,'diagnostic_retenu')}</p>
          ${diag.arguments_diagnostic ? `<p><span class="label">Arguments :</span> ${diag.arguments_diagnostic}</p>` : ''}
        </div>
        
        <div class="section">
          <h2>10. TRAITEMENT ET SURVEILLANCE</h2>
          ${ttt.ttt_etiologique ? `<h3>Étiologique</h3><p>${ttt.ttt_etiologique}</p>` : ''}
          ${ttt.ttt_symptomatique ? `<h3>Symptomatique</h3><p>${ttt.ttt_symptomatique}</p>` : ''}
          ${ttt.ttt_adjuvant ? `<h3>Adjuvant</h3><p>${ttt.ttt_adjuvant}</p>` : ''}
          ${ttt.surveillance_clinique ? `<h3>Surveillance clinique</h3><p>${ttt.surveillance_clinique}</p>` : ''}
          ${ttt.surveillance_paraclinique ? `<h3>Surveillance paraclinique</h3><p>${ttt.surveillance_paraclinique}</p>` : ''}
        </div>
        
        <div class="section">
          <h2>11. CONCLUSION ET PRONOSTIC</h2>
          ${concl.pronostic ? `<p><span class="label">Pronostic :</span> ${concl.pronostic}</p>` : ''}
          <p>${val(concl,'conclusion')}</p>
        </div>
        
        <div class="signature">
          <p>Le Médecin traitant / L'Interne</p>
          <br/><br/><br/>
          <p>Signature et Cachet</p>
        </div>
      </body>
      </html>
    `;
  };

  const downloadWord = () => {
    const html = generateHTMLContent();
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Observation_Medicale.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    const html = generateHTMLContent();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
    };
  };

  const mdToHTML = (md) =>
    md
      .split('\n')
      .map((l) => {
        const t = l.trim();
        if (t.startsWith('### ')) return `<h3>${t.slice(4)}</h3>`;
        if (t.startsWith('## ')) return `<h2>${t.slice(3)}</h2>`;
        if (t.startsWith('# ')) return `<h1>${t.slice(2)}</h1>`;
        if (t.startsWith('- ') || t.startsWith('* ')) return `<li>${t.slice(2)}</li>`;
        if (!t) return '';
        return `<p>${t}</p>`;
      })
      .join('\n')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  const exportAI = async () => {
    if (aiLoading) return;
    setAiLoading(true);
    setAiError('');
    try {
      const md = await askAI('export', { dossier: compactDossier(data) });
      const nom = data?.['etat-civil']?.nom_prenoms || 'Patient';
      const html = `<html><head><meta charset="utf-8"><title>Observation Médicale - ${nom}</title>
        <style>
          @page { size: A4; margin: 2cm; }
          body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; color: #000; }
          h1 { font-size: 17pt; text-align: center; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 8px; }
          h2 { font-size: 13pt; text-transform: uppercase; border-bottom: 1px solid #999; margin-top: 22px; }
          h3 { font-size: 12pt; }
          li { margin-left: 18px; }
        </style></head><body><h1>Observation Médicale</h1>${mdToHTML(md)}</body></html>`;
      const w = window.open('', '_blank');
      w.document.write(html);
      w.document.close();
      w.onload = () => {
        w.print();
        w.onafterprint = () => w.close();
      };
    } catch (e) {
      setAiError(e.message);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="animate-fade-in glass-panel" style={{ 
      padding: '4rem 3rem', 
      textAlign: 'center',
      maxWidth: '1000px', // Wider to fit 3 cards comfortably
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
      
      <p style={{ color: 'var(--text-muted)', marginBottom: '3.5rem', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 3.5rem', lineHeight: '1.6' }}>
        Votre dossier clinique est complet. Choisissez le format d'exportation qui convient le mieux à vos besoins.
      </p>

      {/* Embedded CSS for responsive grid and hover effects sans "AI Template" look */}
      <style dangerouslySetInnerHTML={{__html: `
        .export-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          justify-content: center;
        }
        @media (max-width: 768px) {
          .export-grid {
            grid-template-columns: 1fr;
          }
        }
        .export-card-premium {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          padding: 2.5rem 1.5rem;
          border-radius: 24px;
          border: 1px solid var(--surface-border);
          background: var(--surface-bg);
          cursor: pointer;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 15px rgba(0,0,0,0.02);
          overflow: hidden;
        }
        .export-card-premium::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: var(--primary);
          transform: scaleX(0);
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          transform-origin: center;
        }
        .export-card-premium:hover {
          transform: translateY(-8px);
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.12);
          border-color: transparent;
          background: var(--surface);
        }
        .export-card-premium:hover::before {
          transform: scaleX(1);
        }
        .export-card-premium:hover .card-title {
          color: var(--primary);
        }
        .export-card-premium:hover .card-icon-wrapper {
          transform: scale(1.05);
        }
        .export-card-premium:hover .card-icon-ring {
          transform: rotate(90deg) scale(1.1);
          opacity: 0.8;
        }
        /* Sophisticated Circular Icon Wrapper */
        .card-icon-container {
          position: relative;
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .card-icon-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 1.5px dashed currentColor;
          opacity: 0.15;
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .card-icon-wrapper {
          width: 64px; height: 64px;
          border-radius: 50%; /* Organic circle, not an AI square */
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          background: linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.4));
          box-shadow: 0 8px 20px -5px rgba(0,0,0,0.08), inset 0 2px 4px rgba(255,255,255,0.5);
          position: relative;
          z-index: 2;
        }
        .card-title {
          margin: 0 0 0.5rem 0;
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-main);
          transition: color 0.3s;
        }
      `}} />

      <div className="export-grid">
        {/* PDF Card */}
        <button onClick={downloadPDF} className="export-card-premium">
          <div className="card-icon-container" style={{ color: '#ef4444' }}>
            <div className="card-icon-ring"></div>
            <div className="card-icon-wrapper">
              <FileDown size={28} strokeWidth={1.5} color="#ef4444" />
            </div>
          </div>
          <div>
            <h3 className="card-title">Format PDF</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>Idéal pour le partage et la consultation clinique.</span>
          </div>
        </button>

        {/* Word Card */}
        <button onClick={downloadWord} className="export-card-premium">
          <div className="card-icon-container" style={{ color: '#3b82f6' }}>
            <div className="card-icon-ring"></div>
            <div className="card-icon-wrapper">
              <FileEdit size={28} strokeWidth={1.5} color="#3b82f6" />
            </div>
          </div>
          <div>
            <h3 className="card-title">Format Word</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>Idéal si vous souhaitez ajuster vos notes médicales.</span>
          </div>
        </button>

        {/* Humanized Expert Report Card (Disguised AI) */}
        <button onClick={exportAI} disabled={aiLoading} className="export-card-premium" style={{ cursor: aiLoading ? 'wait' : 'pointer', opacity: aiLoading ? 0.7 : 1 }}>
          <div className="card-icon-container" style={{ color: 'var(--primary)' }}>
            <div className="card-icon-ring"></div>
            <div className="card-icon-wrapper">
              {aiLoading ? <Loader2 size={28} className="animate-spin" color="var(--primary)" /> : <FileSignature size={28} strokeWidth={1.5} color="var(--primary)" />}
            </div>
          </div>
          <div>
            <h3 className="card-title">Rapport d'Expert</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
              {aiLoading ? "Compilation des données cliniques..." : "Synthèse clinique optimisée prête pour l'archivage."}
            </span>
          </div>
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

