import { supabase } from './supabase';

/**
 * Charge le profil de l'utilisateur connecté depuis Supabase.
 * Enregistre les préférences dans le localStorage pour le mode hors-ligne.
 */
export async function loadUserProfile(userId) {
  if (!userId) return null;
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = No rows found
    
    if (data) {
      // Synchronisation vers le local (Offline First)
      if (data.avatar_url) localStorage.setItem('obsmed-avatar', data.avatar_url);
      if (data.language) localStorage.setItem('obsmed-lang', data.language);
      if (data.auto_save) localStorage.setItem('obsmed-autosave', data.auto_save);
      if (data.export_format) localStorage.setItem('obsmed-export', data.export_format);
      if (data.theme) localStorage.setItem('obsmed-dark', data.theme === 'dark' ? 'true' : 'false');
      if (data.accent_theme) localStorage.setItem('obsmed-accenttheme', data.accent_theme);
      if (data.bg_theme) localStorage.setItem('obsmed-bgtheme', data.bg_theme);
      if (data.ai_name) localStorage.setItem('obsmed-ai-name', data.ai_name);
      if (data.pin_hash) localStorage.setItem('obsmed-pin', data.pin_hash);
      
      // Sync des catalogues
      if (data.custom_catalogs) {
        if (data.custom_catalogs.symptom_types) localStorage.setItem('obsmed_custom_symptom_types', JSON.stringify(data.custom_catalogs.symptom_types));
        if (data.custom_catalogs.symptom_fields) localStorage.setItem('obsmed_custom_symptom_fields', JSON.stringify(data.custom_catalogs.symptom_fields));
        if (data.custom_catalogs.antecedents) localStorage.setItem('obsmed-antecedents-catalog', JSON.stringify(data.custom_catalogs.antecedents));
        // Les autres catalogues dynamiques peuvent être ajoutés ici
      }
    }
    return data;
  } catch (err) {
    console.error('Erreur lors du chargement du profil:', err);
    return null;
  }
}

/**
 * Met à jour une propriété du profil dans Supabase.
 * Fonctionne en arrière-plan.
 */
export async function updateProfileSettings(userId, updates) {
  if (!userId) return;
  
  try {
    // Upsert the profile (it should exist due to the auth trigger, but upsert is safer)
    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        id: userId, 
        ...updates,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
      
    if (error) throw error;
  } catch (err) {
    console.error('Erreur lors de la mise à jour du profil:', err);
  }
}

/**
 * Met à jour un catalogue spécifique dans la colonne JSONB custom_catalogs
 */
export async function updateCustomCatalog(userId, catalogName, catalogData) {
  if (!userId) return;
  
  try {
    // D'abord, récupérer l'état actuel des catalogues
    const { data: profile } = await supabase
      .from('profiles')
      .select('custom_catalogs')
      .eq('id', userId)
      .single();
      
    const currentCatalogs = profile?.custom_catalogs || {};
    currentCatalogs[catalogName] = catalogData;
    
    // Mettre à jour avec la nouvelle structure
    await updateProfileSettings(userId, { custom_catalogs: currentCatalogs });
  } catch (err) {
    console.error(`Erreur lors de la mise à jour du catalogue ${catalogName}:`, err);
  }
}
