const fs = require('fs');

let content = fs.readFileSync('src/components/Screens/AccountModal.jsx', 'utf8');

// Inject the import if missing
if (!content.includes("updateProfileSettings")) {
    content = content.replace(
        "import { X, User, Shield, Camera, Upload, Trash2, Mail, Key } from 'lucide-react';",
        "import { X, User, Shield, Camera, Upload, Trash2, Mail, Key } from 'lucide-react';\nimport { updateProfileSettings } from '../../lib/profile';"
    );
}

// Ensure session is available or passed as prop (it might not be, so we import supabase)
if (!content.includes("import { supabase }")) {
    content = content.replace(
        "import { updateProfileSettings }",
        "import { updateProfileSettings } from '../../lib/profile';\nimport { supabase } from '../../lib/supabase';"
    );
}

// Find the save changes logic
// Wait, AccountModal usually saves on changes immediately or when closed. Let's see how it's done.
