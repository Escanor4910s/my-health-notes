import { supabase } from '../lib/supabase';
import { updateCustomCatalog } from '../lib/profile';
import { useState, useEffect } from 'react';

const DEFAULT_ANTECEDENTS = [
  { id: 'hta', label: 'HTA', type: 'med' },
  { id: 'diabete', label: 'Diabète', type: 'med' },
  { id: 'asthme', label: 'Asthme', type: 'med' },
  { id: 'tuberculose', label: 'Tuberculose', type: 'med' },
  { id: 'vih_sida', label: 'VIH/SIDA', type: 'med' },
  { id: 'drepanocytose', label: 'Drépanocytose', type: 'med' },
  { id: 'epilepsie', label: 'Épilepsie', type: 'med' },
  { id: 'ugd', label: 'Ulcère gastro-duodénal (UGD)', type: 'med' },
  { id: 'cardiopathie', label: 'Cardiopathie', type: 'med' },
  { id: 'nephropathie', label: 'Néphropathie', type: 'med' },
  { id: 'hepatite_b', label: 'Hépatite B', type: 'med' },
  { id: 'hepatite_c', label: 'Hépatite C', type: 'med' },
  { id: 'avc', label: 'AVC', type: 'med' },
  { id: 'raa', label: 'Rhumatisme Articulaire Aigu (RAA)', type: 'med' },
  { id: 'paludisme_grave', label: 'Paludisme grave', type: 'med' },
  { id: 'hospitalisation_anterieure', label: 'Hospitalisation(s) antérieure(s)', type: 'med' },
  { id: 'transfusion_anterieure', label: 'Transfusions sanguines antérieures', type: 'med' },
  // Antécédents chirurgicaux
  { id: 'appendicectomie', label: 'Appendicectomie', type: 'chir' },
  { id: 'cesarienne', label: 'Césarienne', type: 'chir' },
  { id: 'hernie', label: 'Hernie', type: 'chir' },
  { id: 'fracture_osteosynthese', label: 'Fracture / Ostéosynthèse', type: 'chir' },
  { id: 'cholecystectomie', label: 'Cholécystectomie', type: 'chir' }
];

export function useAntecedentsCatalog() {
  const [catalog, setCatalog] = useState(DEFAULT_ANTECEDENTS);

  // Charger le catalogue depuis le localStorage au montage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('obsmed-antecedents-catalog');
      if (saved) {
        setCatalog(JSON.parse(saved));
      } else {
        setCatalog(DEFAULT_ANTECEDENTS);
        localStorage.setItem('obsmed-antecedents-catalog', JSON.stringify(DEFAULT_ANTECEDENTS));
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.id) updateCustomCatalog(session.user.id, 'antecedents', DEFAULT_ANTECEDENTS);
      });
      }
    } catch (e) {
      console.error("Erreur lecture catalogue antécédents:", e);
      setCatalog(DEFAULT_ANTECEDENTS);
    }
  }, []);

  const addCustomAntecedent = (label, type = 'med') => {
    if (!label.trim()) return null;
    
    // Générer un ID sûr
    const baseId = label.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    const newId = `custom_${baseId}_${Date.now()}`;
    
    const newEntry = { id: newId, label: label.trim(), type };
    
    setCatalog(prev => {
      // Vérifier s'il n'existe pas déjà
      if (prev.some(item => item.label.toLowerCase() === label.trim().toLowerCase())) {
        return prev;
      }
      const updated = [...prev, newEntry];
      localStorage.setItem('obsmed-antecedents-catalog', JSON.stringify(updated));
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.id) updateCustomCatalog(session.user.id, 'antecedents', updated);
      });
      return updated;
    });
    
    return newId;
  };

  const deleteCustomAntecedent = (idToRemove) => {
    // Empêcher la suppression des antécédents par défaut
    if (DEFAULT_ANTECEDENTS.some(d => d.id === idToRemove)) {
      console.warn("Impossible de supprimer un antécédent par défaut.");
      return;
    }
    
    setCatalog(prev => {
      const updated = prev.filter(item => item.id !== idToRemove);
      localStorage.setItem('obsmed-antecedents-catalog', JSON.stringify(updated));
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.id) updateCustomCatalog(session.user.id, 'antecedents', updated);
      });
      return updated;
    });
  };

  return { catalog, addCustomAntecedent, deleteCustomAntecedent };
}
