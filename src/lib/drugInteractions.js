// Dictionnaire minimal des interactions médicamenteuses majeures et contre-indications
// Format: { molecule1: { molecule2: { severity: 'high' | 'moderate', message: '...' } } }

export const DRUG_INTERACTIONS = {
  'methotrexate': {
    'ibuprofene': { severity: 'high', message: "Risque d'augmentation de la toxicité hématologique du méthotrexate." },
    'diclofenac': { severity: 'high', message: "Risque de toxicité hématologique grave du méthotrexate." },
    'ketoprofene': { severity: 'high', message: "Risque de toxicité hématologique." },
    'aspirine': { severity: 'high', message: "Risque de toxicité hématologique." },
    'trimethoprime': { severity: 'high', message: "Risque de pancytopénie sévère (antagonisme folique additif)." },
  },
  'amiodarone': {
    'digoxine': { severity: 'high', message: "Augmentation de la digoxinémie, risque de troubles du rythme graves." },
    'haloperidol': { severity: 'high', message: "Risque de torsades de pointes (allongement du QT)." },
    'citalopram': { severity: 'high', message: "Risque de torsades de pointes (allongement du QT)." },
    'sotalol': { severity: 'high', message: "Risque majeur de torsades de pointes." },
  },
  'warfarine': {
    'amiodarone': { severity: 'high', message: "Augmentation de l'effet anticoagulant et du risque hémorragique." },
    'miconazole': { severity: 'high', message: "Risque hémorragique très important (inhibition du CYP2C9)." },
    'aspirine': { severity: 'moderate', message: "Majoration du risque hémorragique (antiagrégant + anticoagulant)." },
    'ibuprofene': { severity: 'moderate', message: "Majoration du risque hémorragique." },
  },
  'simvastatine': {
    'clarithromycine': { severity: 'high', message: "Risque accru de rhabdomyolyse (inhibition du CYP3A4)." },
    'erythromycine': { severity: 'high', message: "Risque accru de myopathie/rhabdomyolyse." },
    'itraconazole': { severity: 'high', message: "Risque de rhabdomyolyse majeure." },
    'amiodarone': { severity: 'moderate', message: "Risque dose-dépendant de rhabdomyolyse." },
  },
  'spironolactone': {
    'enalapril': { severity: 'high', message: "Risque d'hyperkaliémie sévère (potentiellement mortelle)." },
    'ramipril': { severity: 'high', message: "Risque d'hyperkaliémie sévère." },
    'losartan': { severity: 'high', message: "Risque d'hyperkaliémie." },
    'valsartan': { severity: 'high', message: "Risque d'hyperkaliémie." },
    'potassium': { severity: 'high', message: "Risque majeur d'hyperkaliémie." },
  },
  'allopurinol': {
    'azathioprine': { severity: 'high', message: "Risque de toxicité hématologique majeure (inhibition de la xanthine oxydase)." },
    'mercaptopurine': { severity: 'high', message: "Risque de toxicité hématologique sévère." }
  },
  'lithium': {
    'ibuprofene': { severity: 'high', message: "Augmentation de la lithémie pouvant atteindre des valeurs toxiques." },
    'furosemide': { severity: 'high', message: "Risque de toxicité par diminution de l'excrétion rénale du lithium." },
    'hydrochlorothiazide': { severity: 'high', message: "Augmentation très importante de la lithémie." },
    'enalapril': { severity: 'high', message: "Risque de surdosage en lithium." }
  },
  'tramadol': {
    'fluoxetine': { severity: 'high', message: "Risque de syndrome sérotoninergique et de convulsions." },
    'paroxetine': { severity: 'high', message: "Risque de syndrome sérotoninergique." },
    'venlafaxine': { severity: 'high', message: "Syndrome sérotoninergique potentiel." }
  },
  'colchicine': {
    'clarithromycine': { severity: 'high', message: "Risque de toxicité aiguë de la colchicine (souvent fatale)." },
    'erythromycine': { severity: 'high', message: "Risque de surdosage en colchicine." },
    'verapamil': { severity: 'moderate', message: "Risque de toxicité de la colchicine." },
    'diltiazem': { severity: 'moderate', message: "Risque de toxicité de la colchicine." }
  },
  'clozapine': {
    'carbamazepine': { severity: 'high', message: "Risque majoré d'agranulocytose grave (toxicité médullaire additive)." }
  }
};

/**
 * Normalise un nom de médicament pour la comparaison (minuscules, sans accents, espaces trimés).
 */
const normalizeDrug = (name) => {
  if (!name) return "";
  return name.toLowerCase()
             .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
             .trim();
};

/**
 * Analyse une liste de médicaments et retourne un tableau d'interactions détectées.
 * @param {Array<string>} medications - Tableau des noms de molécules ou médicaments
 * @returns {Array<{ drug1: string, drug2: string, severity: string, message: string }>}
 */
export const checkInteractions = (medications) => {
  const interactions = [];
  if (!medications || medications.length < 2) return interactions;

  const normalizedMeds = medications.map(m => ({ original: m, normalized: normalizeDrug(m) }));

  for (let i = 0; i < normalizedMeds.length; i++) {
    for (let j = i + 1; j < normalizedMeds.length; j++) {
      const m1 = normalizedMeds[i];
      const m2 = normalizedMeds[j];

      // Vérification croisée
      for (const [key1, targets] of Object.entries(DRUG_INTERACTIONS)) {
        for (const [key2, interactionData] of Object.entries(targets)) {
          // Si m1 contient key1 et m2 contient key2, ou l'inverse
          if ((m1.normalized.includes(key1) && m2.normalized.includes(key2)) ||
              (m1.normalized.includes(key2) && m2.normalized.includes(key1))) {
            
            interactions.push({
              drug1: m1.original,
              drug2: m2.original,
              severity: interactionData.severity,
              message: interactionData.message
            });
          }
        }
      }
    }
  }

  // Déduplication (au cas où un même couple est détecté plusieurs fois via des mots clés similaires)
  const uniqueInteractions = [];
  const seenKeys = new Set();
  
  for (const interaction of interactions) {
    const key = [interaction.drug1, interaction.drug2].sort().join('|');
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      uniqueInteractions.push(interaction);
    }
  }

  return uniqueInteractions;
};
