import { useState, useEffect } from 'react';

const defaultCatalog = [
  // Cognition
  { id: 'cog_normal', label: 'Fonctions cognitives normales', category: 'cognition' },
  { id: 'cog_desoriente', label: 'Désorientation Temporo-Spatiale', category: 'cognition' },
  { id: 'cog_aphasie', label: 'Aphasie', category: 'cognition' },
  { id: 'cog_dysarthrie', label: 'Dysarthrie', category: 'cognition' },
  { id: 'cog_amnesie', label: 'Amnésie', category: 'cognition' },
  { id: 'cog_apraxie', label: 'Apraxie', category: 'cognition' },
  { id: 'cog_agnosie', label: 'Agnosie', category: 'cognition' },

  // Méningé
  { id: 'meninge_raideur', label: 'Raideur de la nuque', category: 'meninge' },
  { id: 'meninge_kernig', label: 'Signe de Kernig', category: 'meninge' },
  { id: 'meninge_brudzinski', label: 'Signe de Brudzinski', category: 'meninge' },
  { id: 'meninge_photo', label: 'Photophobie', category: 'meninge' },
  { id: 'meninge_phono', label: 'Phonophobie', category: 'meninge' },

  // Crâniens (si gérés via checkbox supplémentaires éventuelles)
  { id: 'cranien_pf', label: 'Paralysie faciale (PF)', category: 'cranien' },

  // Moteur : Motricité (Trophisme)
  { id: 'mot_amyotrophie', label: 'Amyotrophie', category: 'motricite_trophisme' },
  { id: 'mot_hypertrophie', label: 'Hypertrophie', category: 'motricite_trophisme' },
  { id: 'mot_fasciculations', label: 'Fasciculations musculaires', category: 'motricite_trophisme' },
  { id: 'mot_retractions', label: 'Rétractions tendineuses', category: 'motricite_trophisme' },

  // Moteur : Force
  { id: 'moteur_epreuve_bras', label: 'Déficit à l\'épreuve des bras tendus (MS)', category: 'moteur_force' },
  { id: 'moteur_barre', label: 'Déficit à la manœuvre de Barré (MI)', category: 'moteur_force' },
  { id: 'moteur_mingazzini', label: 'Déficit à la manœuvre de Mingazzini (MI)', category: 'moteur_force' },
  { id: 'moteur_hemiplegie', label: 'Hémiplégie', category: 'moteur_force' },
  { id: 'moteur_hemiparesie', label: 'Hémiparésie', category: 'moteur_force' },
  { id: 'moteur_paraplegie', label: 'Paraplégie', category: 'moteur_force' },
  { id: 'moteur_paraparesie', label: 'Paraparésie', category: 'moteur_force' },
  { id: 'moteur_tetraplegie', label: 'Tétraplégie', category: 'moteur_force' },

  // Moteur : Tonus
  { id: 'tonus_normal', label: 'Tonus normal', category: 'moteur_tonus' },
  { id: 'tonus_spastique', label: 'Hypertonie Spastique (Élastique, Pyramidale)', category: 'moteur_tonus' },
  { id: 'tonus_plastique', label: 'Hypertonie Plastique (Roue dentée, Extra-pyramidale)', category: 'moteur_tonus' },
  { id: 'tonus_hypotonie', label: 'Hypotonie (Flaccidité)', category: 'moteur_tonus' },

  // Moteur : Tétanie / Postures
  { id: 'tetanie_decerebration', label: 'Rigidité de décérébration (MS: extension/rotation interne, MI: extension)', category: 'moteur_tetanie' },
  { id: 'tetanie_decortication', label: 'Rigidité de décortication (MS: flexion, MI: extension)', category: 'moteur_tetanie' },

  // Réflexes Cutanés et Archaïques
  { id: 'cutane_plant_normal', label: 'Réflexe cutané plantaire normal (Flexion)', category: 'reflexes_cutane' },
  { id: 'cutane_babinski_d', label: 'Signe de Babinski Droit', category: 'reflexes_cutane' },
  { id: 'cutane_babinski_g', label: 'Signe de Babinski Gauche', category: 'reflexes_cutane' },
  { id: 'cutane_abdo_aboli_d', label: 'Abolition des réflexes cutanés abdominaux Droit', category: 'reflexes_cutane' },
  { id: 'cutane_abdo_aboli_g', label: 'Abolition des réflexes cutanés abdominaux Gauche', category: 'reflexes_cutane' },
  { id: 'archaique_grasping', label: 'Grasping reflex (Libération frontale)', category: 'reflexes_cutane' },
  { id: 'archaique_palmo', label: 'Réflexe palmo-mentonnier', category: 'reflexes_cutane' },

  // Ataxie Statique (Posture et Station debout)
  { id: 'coord_romberg', label: 'Signe de Romberg', category: 'coordination_statique' },
  { id: 'coord_polygone', label: 'Élargissement du polygone de sustentation', category: 'coordination_statique' },
  
  // Ataxie Cinétique (Mouvement)
  { id: 'coord_dysmetrie_dn', label: 'Dysmétrie (Épreuve Doigt-Nez altérée)', category: 'coordination_cinetique' },
  { id: 'coord_dysmetrie_tg', label: 'Dysmétrie (Épreuve Talon-Genou altérée)', category: 'coordination_cinetique' },
  { id: 'coord_adiadoco', label: 'Adiadococinésie (Épreuve des marionnettes altérée)', category: 'coordination_cinetique' },
  { id: 'coord_asynergie', label: 'Asynergie', category: 'coordination_cinetique' },

  // Syndrome Extra-pyramidal
  { id: 'extra_aucun', label: 'Aucun syndrome extra-pyramidal', category: 'extra_park' },
  { id: 'extra_akinesie', label: 'Akinésie', category: 'extra_park' },
  { id: 'extra_bradykinesie', label: 'Bradykinésie', category: 'extra_park' },
  { id: 'extra_amimie', label: 'Amimie (Faciès figé)', category: 'extra_park' },
  { id: 'extra_tremblement_repos', label: 'Tremblement de repos', category: 'extra_park' },
  { id: 'extra_rigidite', label: 'Rigidité extra-pyramidale', category: 'extra_park' },

  // Mouvements anormaux
  { id: 'mvts_aucun', label: 'Aucun mouvement anormal', category: 'extra_mvts' },
  { id: 'mvts_tremblement_action', label: 'Tremblement d\'action / d\'attitude', category: 'extra_mvts' },
  { id: 'mvts_choree', label: 'Chorée', category: 'extra_mvts' },
  { id: 'mvts_athetose', label: 'Athétose', category: 'extra_mvts' },
  { id: 'mvts_dystonie', label: 'Dystonie', category: 'extra_mvts' },
  { id: 'mvts_myoclonies', label: 'Myoclonies', category: 'extra_mvts' },
  { id: 'mvts_asterixis', label: 'Astérixis (Flapping tremor)', category: 'extra_mvts' },

  // Sensibilité : Superficielle
  { id: 'sens_sup_normale', label: 'Sensibilité superficielle intacte', category: 'sens_sup' },
  { id: 'sens_sup_anesthesie', label: 'Anesthésie cutanée', category: 'sens_sup' },
  { id: 'sens_sup_hypoesth', label: 'Hypoesthésie cutanée', category: 'sens_sup' },
  { id: 'sens_sup_hyperesth', label: 'Hyperesthésie', category: 'sens_sup' },
  { id: 'sens_sup_allodynie', label: 'Allodynie', category: 'sens_sup' },
  { id: 'sens_sup_thermique', label: 'Troubles de la sensibilité thermique', category: 'sens_sup' },
  { id: 'sens_sup_algique', label: 'Troubles de la sensibilité algique (douleur)', category: 'sens_sup' },

  // Sensibilité : Profonde
  { id: 'sens_prof_normale', label: 'Sensibilité profonde (proprioceptive) intacte', category: 'sens_prof' },
  { id: 'sens_prof_pallesth', label: 'Abolition de la pallesthésie (Diapason)', category: 'sens_prof' },
  { id: 'sens_prof_arthro', label: 'Troubles de l\'arthrokinésie (Sens de position des orteils)', category: 'sens_prof' },

  // Marche
  { id: 'marche_normale', label: 'Marche spontanée normale', category: 'marche_marche' },
  { id: 'marche_fauchage', label: 'Marche en fauchage', category: 'marche_marche' },
  { id: 'marche_steppage', label: 'Marche en steppage', category: 'marche_marche' },
  { id: 'marche_ebrieuse', label: 'Marche ébrieuse (Ataxique cérébelleuse)', category: 'marche_marche' },
  { id: 'marche_talonnante', label: 'Marche talonnante (Ataxique proprioceptive)', category: 'marche_marche' },
  { id: 'marche_parkinson', label: 'Marche parkinsonienne (Petits pas, festination)', category: 'marche_marche' },
  { id: 'marche_dandinement', label: 'Marche dandinante (Myopathique)', category: 'marche_marche' },

  // Sphincters
  { id: 'sphincter_normal', label: 'Continence urinaire et fécale normale', category: 'marche_sphincter' },
  { id: 'sphincter_retention', label: 'Rétention aiguë d\'urines (Globe vésical)', category: 'marche_sphincter' },
  { id: 'sphincter_fuite_urine', label: 'Incontinence / Fuites urinaires', category: 'marche_sphincter' },
  { id: 'sphincter_incont_fecale', label: 'Incontinence fécale', category: 'marche_sphincter' },
  { id: 'sphincter_perineale', label: 'Anesthésie en selle', category: 'marche_sphincter' },
];

export function useNeuroCatalog() {
  const [catalog, setCatalog] = useState(() => {
    const saved = localStorage.getItem('neuroCatalog');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge custom signs with default catalog so new updates apply
      const customSigns = parsed.filter(item => item.isCustom);
      return [...defaultCatalog, ...customSigns];
    }
    return defaultCatalog;
  });

  useEffect(() => {
    localStorage.setItem('neuroCatalog', JSON.stringify(catalog));
  }, [catalog]);

  const addCustomSign = (label, category) => {
    if (!label.trim()) return null;
    const newSign = {
      id: `custom_${Date.now()}`,
      label: label.trim(),
      category,
      isCustom: true
    };
    setCatalog(prev => [...prev, newSign]);
    return newSign;
  };

  const updateCustomSign = (id, newLabel) => {
    setCatalog(prev => prev.map(item => 
      item.id === id ? { ...item, label: newLabel } : item
    ));
  };

  const deleteCustomSign = (id) => {
    setCatalog(prev => prev.filter(item => item.id !== id));
  };

  const getCatalogByCategory = (category) => {
    return catalog.filter(item => item.category === category);
  };

  return { 
    catalog, 
    getCatalogByCategory, 
    addCustomSign, 
    updateCustomSign, 
    deleteCustomSign 
  };
}
