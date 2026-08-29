const fs = require('fs');
let code = fs.readFileSync('src/lib/profile.js', 'utf8');

const eventDispatch = `
      if (profileData.custom_catalogs) {
        if (profileData.custom_catalogs.symptom_types) localStorage.setItem('obsmed_custom_symptom_types', JSON.stringify(profileData.custom_catalogs.symptom_types));
        if (profileData.custom_catalogs.symptom_fields) localStorage.setItem('obsmed_custom_symptom_fields', JSON.stringify(profileData.custom_catalogs.symptom_fields));
        if (profileData.custom_catalogs.antecedents) localStorage.setItem('obsmed-antecedents-catalog', JSON.stringify(profileData.custom_catalogs.antecedents));
      }
      
      // DECLENCHE LA REACTIVITE DU DASHBOARD
      window.dispatchEvent(new Event('profileUpdated'));
`;

code = code.replace(/if \(profileData\.custom_catalogs\) \{[\s\S]*?\}\s*\}/, eventDispatch);
fs.writeFileSync('src/lib/profile.js', code);
console.log('profile.js updated to dispatch event');
