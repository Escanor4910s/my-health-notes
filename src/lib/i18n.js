import { getInstitutionSettings } from './institution';

const DICTIONARY = {
  fr: {
    'sidebar.etat_civil': 'État Civil & Données',
    'sidebar.motif': 'Motif d\'Hospitalisation',
    'sidebar.histoire': 'Histoire de la Maladie',
    'sidebar.antecedents': 'Antécédents',
    'sidebar.examen_physique': 'Examen Physique',
    'sidebar.examen_general': 'Examen Général',
    'sidebar.examen_pleuro': 'Pleuro-pulmonaire',
    'sidebar.examen_cardio': 'Cardiovasculaire',
    'sidebar.examen_digestif': 'Digestif',
    'sidebar.examen_neuro': 'Neurologique',
    'sidebar.examen_uro': 'Uro-génital',
    'sidebar.examen_loco': 'Locomoteur',
    'sidebar.examen_dermato': 'Dermatologique',
    'sidebar.examen_orl': 'ORL & Stomato',
    'sidebar.examen_ganglions': 'Aires Ganglionnaires',
    'sidebar.examen_gyneco': 'Gynéco-Obstétrique',
    'sidebar.resume': 'Résumé Syndromique',
    'sidebar.hypotheses': 'Hypothèses Diagnostiques',
    'sidebar.bilan': 'Bilan Paraclinique',
    'sidebar.diagnostic': 'Diagnostic Retenu',
    'sidebar.traitement': 'Traitement & Surveillance',
    'sidebar.evolution': 'Évolution & Suites',
    'sidebar.conclusion': 'Conclusion & Pronostic',
    'sidebar.apercu': 'Aperçu',
    'sidebar.export': 'Télécharger / Exporter',
    'sidebar.settings': 'Préférences',
    'sidebar.group.interrogatoire': 'Interrogatoire',
    'sidebar.group.examen': 'Examen Clinique',
    'sidebar.group.synthese': 'Synthèse & Conclusion',
  },
  en: {
    'sidebar.etat_civil': 'Patient Demographics',
    'sidebar.motif': 'Chief Complaint',
    'sidebar.histoire': 'History of Present Illness',
    'sidebar.antecedents': 'Medical History',
    'sidebar.examen_physique': 'Physical Examination',
    'sidebar.examen_general': 'General Exam',
    'sidebar.examen_pleuro': 'Respiratory',
    'sidebar.examen_cardio': 'Cardiovascular',
    'sidebar.examen_digestif': 'Gastrointestinal',
    'sidebar.examen_neuro': 'Neurological',
    'sidebar.examen_uro': 'Genitourinary',
    'sidebar.examen_loco': 'Musculoskeletal',
    'sidebar.examen_dermato': 'Dermatological',
    'sidebar.examen_orl': 'ENT & Oral',
    'sidebar.examen_ganglions': 'Lymph Nodes',
    'sidebar.examen_gyneco': 'OB/GYN',
    'sidebar.resume': 'Clinical Summary',
    'sidebar.hypotheses': 'Differential Diagnosis',
    'sidebar.bilan': 'Investigations',
    'sidebar.diagnostic': 'Final Diagnosis',
    'sidebar.traitement': 'Treatment & Monitoring',
    'sidebar.evolution': 'Clinical Course',
    'sidebar.conclusion': 'Prognosis & Conclusion',
    'sidebar.apercu': 'Preview',
    'sidebar.export': 'Download / Export',
    'sidebar.settings': 'Préférences',
    'sidebar.group.interrogatoire': 'History',
    'sidebar.group.examen': 'Physical Examination',
    'sidebar.group.synthese': 'Assessment & Plan',
  }
};

export function t(key) {
  const settings = getInstitutionSettings();
  const lang = settings.language || 'fr';
  
  if (DICTIONARY[lang] && DICTIONARY[lang][key]) {
    return DICTIONARY[lang][key];
  }
  
  // Fallback to fr
  return DICTIONARY['fr'][key] || null;
}
