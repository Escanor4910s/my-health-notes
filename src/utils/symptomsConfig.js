export const SYMPTOM_TYPES = [
  'Douleur',
  'Vomissements',
  'Fièvre',
  'Masse',
  'Céphalées',
  'Toux',
  'Diarrhée',
  'Autre'
];

export const SYMPTOM_FIELDS = {
  'Douleur': [
    { id: 'mode_installation', label: 'Mode d\'installation', type: 'select', options: ['Brutal', 'Progressif', 'Insidieux'] },
    { id: 'siege', label: 'Siège', type: 'text' },
    { id: 'irradiation', label: 'Irradiation', type: 'text' },
    { id: 'intensite', label: 'Intensité', type: 'text', placeholder: 'Ex: 8/10, atroce...' },
    { id: 'type_douleur', label: 'Type / Caractère', type: 'text', placeholder: 'Ex: Brûlure, crampe, piqûre...' },
    { id: 'facteurs_declenchants', label: 'Facteurs déclenchants', type: 'text' },
    { id: 'facteurs_aggravants', label: 'Facteurs aggravants', type: 'text' },
    { id: 'facteurs_calmants', label: 'Facteurs calmants', type: 'text' },
    { id: 'signes_accompagnateurs', label: 'Signes d\'accompagnement', type: 'textarea' }
  ],
  'Vomissements': [
    { id: 'mode_installation', label: 'Mode d\'installation', type: 'select', options: ['Brutal', 'Progressif'] },
    { id: 'aspect', label: 'Aspect', type: 'select', options: ['Alimentaire', 'Bilieux', 'Fécaloïde', 'Hémorragique (Hématémèse)'] },
    { id: 'frequence', label: 'Fréquence / Abondance', type: 'text' },
    { id: 'horaire', label: 'Horaire', type: 'text', placeholder: 'Ex: Post-prandial, matinal...' },
    { id: 'signes_accompagnateurs', label: 'Signes d\'accompagnement', type: 'textarea' }
  ],
  'Fièvre': [
    { id: 'mode_installation', label: 'Mode d\'installation', type: 'select', options: ['Brutal', 'Progressif'] },
    { id: 'intensite', label: 'Intensité (Chiffrée si possible)', type: 'text', placeholder: 'Ex: 39.5°C' },
    { id: 'courbe', label: 'Aspect de la courbe', type: 'select', options: ['Continue', 'Rémittente', 'Intermittente', 'Ondulante', 'Hectique'] },
    { id: 'signes_accompagnateurs', label: 'Signes d\'accompagnement (Frissons, sueurs...)', type: 'textarea' }
  ],
  'Masse': [
    { id: 'siege', label: 'Siège exact', type: 'text' },
    { id: 'taille', label: 'Taille / Volume', type: 'text' },
    { id: 'consistance', label: 'Consistance', type: 'select', options: ['Molle', 'Ferme', 'Dure', 'Rénitente'] },
    { id: 'sensibilite', label: 'Sensibilité', type: 'select', options: ['Indolore', 'Douloureuse'] },
    { id: 'mobilite', label: 'Mobilité par rapport aux plans', type: 'text' },
    { id: 'evolution', label: 'Évolution', type: 'text' }
  ],
  'Céphalées': [
    { id: 'mode_installation', label: 'Mode d\'installation', type: 'select', options: ['Brutal', 'Progressif'] },
    { id: 'siege', label: 'Siège', type: 'select', options: ['Frontal', 'Occipital', 'Hémicrânien', 'En casque'] },
    { id: 'intensite', label: 'Intensité', type: 'text' },
    { id: 'pulsatilite', label: 'Caractère pulsatile ?', type: 'select', options: ['Oui', 'Non'] },
    { id: 'facteurs_declenchants', label: 'Facteurs déclenchants', type: 'text' },
    { id: 'signes_accompagnateurs', label: 'Signes d\'accompagnement (Phonophobie, photophobie...)', type: 'textarea' }
  ],
  'Toux': [
    { id: 'caractere', label: 'Caractère', type: 'select', options: ['Sèche', 'Grasse / Productive'] },
    { id: 'horaire', label: 'Horaire', type: 'select', options: ['Diurne', 'Nocturne', 'Permanente'] },
    { id: 'facteurs_declenchants', label: 'Facteurs déclenchants', type: 'text' },
    { id: 'expectorations', label: 'Expectorations (Aspect)', type: 'text', placeholder: 'Ex: Muqueuse, purulente, hémoptoïque...' }
  ],
  'Diarrhée': [
    { id: 'mode_installation', label: 'Mode d\'installation', type: 'select', options: ['Aiguë', 'Chronique'] },
    { id: 'frequence', label: 'Fréquence (selles/jour)', type: 'text' },
    { id: 'aspect', label: 'Aspect des selles', type: 'select', options: ['Aqueuse', 'Glaireuse', 'Sanglante (Dysenterie)', 'Graisseuse (Stéatorrhée)'] },
    { id: 'signes_accompagnateurs', label: 'Signes d\'accompagnement', type: 'textarea' }
  ],
  'Autre': [
    { id: 'description_libre', label: 'Description détaillée', type: 'textarea' }
  ]
};

// Fallback for missing definitions
export const getSymptomFields = (type) => {
  return SYMPTOM_FIELDS[type] || SYMPTOM_FIELDS['Autre'];
};
