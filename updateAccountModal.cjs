const fs = require('fs');

let content = fs.readFileSync('src/components/Screens/AccountModal.jsx', 'utf8');

// Inject the import
if (!content.includes("updateProfileSettings")) {
    content = content.replace(
        "import { X, User, Shield, Camera, Upload, Trash2, Mail, Key } from 'lucide-react';",
        "import { X, User, Shield, Camera, Upload, Trash2, Mail, Key } from 'lucide-react';\nimport { updateProfileSettings } from '../../lib/profile';"
    );
}

// Replace handleSaveSettings
content = content.replace(
    /const handleSaveSettings = \(\) => \{\s*localStorage\.setItem\('obsmed-lang', language\);\s*localStorage\.setItem\('obsmed-autosave', autoSave\);\s*localStorage\.setItem\('obsmed-export', exportFormat\);\s*notify\(\{ type: 'success', message: '.*?' \}\);\s*\};/g,
    `const handleSaveSettings = () => {
    localStorage.setItem('obsmed-lang', language);
    localStorage.setItem('obsmed-autosave', autoSave);
    localStorage.setItem('obsmed-export', exportFormat);
    if (session?.user?.id) {
      updateProfileSettings(session.user.id, {
        language,
        auto_save: autoSave,
        export_format: exportFormat
      });
    }
    notify({ type: 'success', message: 'Paramètres enregistrés !' });
  };`
);

// Replace avatar save
content = content.replace(
    /setAvatarUrl\(reader\.result\);\s*localStorage\.setItem\('obsmed-avatar', reader\.result\);\s*notify\(\{ type: 'success', message: '.*?' \}\);/g,
    `setAvatarUrl(reader.result);
          localStorage.setItem('obsmed-avatar', reader.result);
          if (session?.user?.id) {
            updateProfileSettings(session.user.id, { avatar_url: reader.result });
          }
          notify({ type: 'success', message: 'Photo mise à jour !' });`
);

// Replace avatar delete
content = content.replace(
    /onClick=\{\(\) => \{ setAvatarUrl\(''\); localStorage\.removeItem\('obsmed-avatar'\); \}\}/g,
    `onClick={() => { 
        setAvatarUrl(''); 
        localStorage.removeItem('obsmed-avatar'); 
        if(session?.user?.id) updateProfileSettings(session.user.id, { avatar_url: null }); 
    }}`
);

fs.writeFileSync('src/components/Screens/AccountModal.jsx', content, 'utf8');
console.log('AccountModal updated for Cloud Sync.');
