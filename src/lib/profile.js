import { supabase } from './supabase';

/**
 * Charge le profil de l'utilisateur connecté depuis Supabase.
 * Synchronise automatiquement les données locales existantes vers le Cloud si elles n'y sont pas encore.
 */
export async function loadUserProfile(userId) {
  if (!userId) return null;
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error && error.code !== 'PGRST116') throw error; 
    
    let profileData = data || {};
    let needsMigration = false;
    const migrationUpdates = {};

    // 1. Migration automatique de l'avatar local vers le Cloud
    if (!profileData.avatar_url) {
      const localAvatar = localStorage.getItem('obsmed-avatar');
      if (localAvatar) {
        migrationUpdates.avatar_url = localAvatar;
        needsMigration = true;
      }
    }

    // 2. Migration automatique des catalogues personnalisés
    if (!profileData.custom_catalogs || Object.keys(profileData.custom_catalogs).length === 0) {
      const customTypes = localStorage.getItem('obsmed_custom_symptom_types');
      const customFields = localStorage.getItem('obsmed_custom_symptom_fields');
      const antecedents = localStorage.getItem('obsmed-antecedents-catalog');
      
      if (customTypes || customFields || antecedents) {
        migrationUpdates.custom_catalogs = {
          symptom_types: customTypes ? JSON.parse(customTypes) : undefined,
          symptom_fields: customFields ? JSON.parse(customFields) : undefined,
          antecedents: antecedents ? JSON.parse(antecedents) : undefined,
        };
        needsMigration = true;
      }
    }

    // 3. Migration du thème
    if (!profileData.theme) {
       const localDark = localStorage.getItem('obsmed-dark');
       if (localDark === 'true') {
          migrationUpdates.theme = 'dark';
          needsMigration = true;
       }
    }

    // Si des données locales n'étaient pas dans le cloud, on les pousse
    if (needsMigration) {
      console.log('Migration automatique des données locales vers Supabase...');
      await updateProfileSettings(userId, migrationUpdates);
      profileData = { ...profileData, ...migrationUpdates };
    }

    // 4. On s'assure que le localStorage est toujours à jour avec le Cloud (Offline First)
    if (profileData) {
      if (profileData.avatar_url) localStorage.setItem('obsmed-avatar', profileData.avatar_url);
      if (profileData.language) localStorage.setItem('obsmed-lang', profileData.language);
      if (profileData.auto_save) localStorage.setItem('obsmed-autosave', profileData.auto_save);
      if (profileData.export_format) localStorage.setItem('obsmed-export', profileData.export_format);
      if (profileData.theme) localStorage.setItem('obsmed-dark', profileData.theme === 'dark' ? 'true' : 'false');
      if (profileData.accent_theme) localStorage.setItem('obsmed-accenttheme', profileData.accent_theme);
      if (profileData.bg_theme) localStorage.setItem('obsmed-bgtheme', profileData.bg_theme);
      if (profileData.ai_name) localStorage.setItem('obsmed-ai-name', profileData.ai_name);
      if (profileData.pin_hash) localStorage.setItem('obsmed-pin', profileData.pin_hash);
      
      
      if (profileData.custom_catalogs) {
        if (profileData.custom_catalogs.symptom_types) localStorage.setItem('obsmed_custom_symptom_types', JSON.stringify(profileData.custom_catalogs.symptom_types));
        if (profileData.custom_catalogs.symptom_fields) localStorage.setItem('obsmed_custom_symptom_fields', JSON.stringify(profileData.custom_catalogs.symptom_fields));
        if (profileData.custom_catalogs.antecedents) localStorage.setItem('obsmed-antecedents-catalog', JSON.stringify(profileData.custom_catalogs.antecedents));
      }
      
      // DECLENCHE LA REACTIVITE DU DASHBOARD
      window.dispatchEvent(new Event('profileUpdated'));

    return profileData;
  } catch (err) {
    console.error('Erreur lors du chargement du profil:', err);
    return null;
  }
}

export async function updateProfileSettings(userId, updates) {
  if (!userId) return;
  try {
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

export async function updateCustomCatalog(userId, catalogName, catalogData) {
  if (!userId) return;
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('custom_catalogs')
      .eq('id', userId)
      .single();
      
    const currentCatalogs = profile?.custom_catalogs || {};
    currentCatalogs[catalogName] = catalogData;
    await updateProfileSettings(userId, { custom_catalogs: currentCatalogs });
  } catch (err) {
    console.error(`Erreur lors de la mise à jour du catalogue ${catalogName}:`, err);
  }
}
