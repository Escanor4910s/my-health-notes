const fs = require('fs');

const hookFiles = [
    'src/utils/useSymptomCatalog.js',
    'src/utils/useAntecedentsCatalog.js'
];

hookFiles.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    // Inject imports
    if (!content.includes("updateCustomCatalog")) {
        content = "import { supabase } from '../lib/supabase';\nimport { updateCustomCatalog } from '../lib/profile';\n" + content;
    }
    
    // We will do a generic replacement for symptom_types/fields and antecedents
    if (file.includes('SymptomCatalog') && !content.includes("updateCustomCatalog(session.user.id, 'symptom_types'")) {
        content = content.replace(
            /localStorage\.setItem\('obsmed_custom_symptom_types', JSON\.stringify\((.*?)\)\);/g,
            `localStorage.setItem('obsmed_custom_symptom_types', JSON.stringify($1));
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.id) updateCustomCatalog(session.user.id, 'symptom_types', $1);
      });`
        );
        content = content.replace(
            /localStorage\.setItem\('obsmed_custom_symptom_fields', JSON\.stringify\((.*?)\)\);/g,
            `localStorage.setItem('obsmed_custom_symptom_fields', JSON.stringify($1));
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.id) updateCustomCatalog(session.user.id, 'symptom_fields', $1);
      });`
        );
    }
    
    if (file.includes('AntecedentsCatalog') && !content.includes("updateCustomCatalog(session.user.id, 'antecedents'")) {
        content = content.replace(
            /localStorage\.setItem\('obsmed-antecedents-catalog', JSON\.stringify\((.*?)\)\);/g,
            `localStorage.setItem('obsmed-antecedents-catalog', JSON.stringify($1));
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.id) updateCustomCatalog(session.user.id, 'antecedents', $1);
      });`
        );
    }

    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file} for Cloud Sync`);
});
