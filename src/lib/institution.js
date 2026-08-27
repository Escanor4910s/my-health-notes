const STORAGE_KEY = 'obsmed-institution';

const DEFAULT_SETTINGS = {
  pays: 'République du Sénégal',
  ministere: 'Ministère de la Santé et de l\'Action Sociale',
  etablissement: 'Centre Hospitalier National Universitaire',
  ville: '',
  ligne1: 'RÉPUBLIQUE DU SÉNÉGAL',
  ligne2: 'MINISTÈRE DE LA SANTÉ ET DE L\'ACTION SOCIALE',
  ligne3: 'CENTRE HOSPITALIER NATIONAL UNIVERSITAIRE',
  titreDocument: 'DOSSIER D\'OBSERVATION MÉDICALE',
};

export function getInstitutionSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveInstitutionSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Erreur lors de la sauvegarde des paramètres institution', e);
  }
}
