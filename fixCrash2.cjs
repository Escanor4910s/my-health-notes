const fs = require('fs');

let content = fs.readFileSync('src/App.jsx', 'utf8');

const profileLogic = `
  useEffect(() => {
    if (session?.user?.id) {
      import('./lib/profile.js').then(({ loadUserProfile }) => {
        loadUserProfile(session.user.id).then((profile) => {
          if (profile) {
            if (profile.theme) {
              setDarkMode(profile.theme === 'dark');
            }
            if (profile.bg_theme) setBgTheme(profile.bg_theme);
            if (profile.accent_theme) setAccentTheme(profile.accent_theme);
          }
        });
      });
    }
  }, [session]);

  useEffect(() => {
    if (session?.user?.id) {
      import('./lib/profile.js').then(({ updateProfileSettings }) => {
        updateProfileSettings(session.user.id, {
          theme: darkMode ? 'dark' : 'light',
          accent_theme: accentTheme,
          bg_theme: bgTheme
        });
      });
    }
  }, [darkMode, accentTheme, bgTheme, session]);
`;

// Remove the logic from wherever it is right now (the bad injection near the end)
const regexToRemove = /[\r\n\s]*useEffect\(\(\) => \{\s*if \(session\?\.user\?\.id\) \{\s*import\('\.\/lib\/profile(\.js)?'\)\.then\(\(\{ loadUserProfile \}\) => \{[\s\S]*?\}, \[darkMode, accentTheme, bgTheme, session\]\);/g;

content = content.replace(regexToRemove, '');

// Insert it right after `const [showVersionHistory, setShowVersionHistory] = useState(false);`
const targetPoint = "  const [showVersionHistory, setShowVersionHistory] = useState(false);";
if (content.includes(targetPoint)) {
  content = content.replace(targetPoint, targetPoint + "\n" + profileLogic);
  fs.writeFileSync('src/App.jsx', content);
  console.log('App.jsx fixed successfully (Moved hooks to safe zone).');
} else {
  console.log('Could not find target point.');
}
