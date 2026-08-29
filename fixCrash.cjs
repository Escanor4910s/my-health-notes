const fs = require('fs');

let content = fs.readFileSync('src/App.jsx', 'utf8');

const profileLogic = `
  useEffect(() => {
    if (session?.user?.id) {
      import('./lib/profile').then(({ loadUserProfile }) => {
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
      import('./lib/profile').then(({ updateProfileSettings }) => {
        updateProfileSettings(session.user.id, {
          theme: darkMode ? 'dark' : 'light',
          accent_theme: accentTheme,
          bg_theme: bgTheme
        });
      });
    }
  }, [darkMode, accentTheme, bgTheme, session]);
`;

// Remove the old injection
// It starts with `  useEffect(() => {\n    if (session?.user?.id) {\n      import('./lib/profile').then(({ loadUserProfile }) => {`
// And ends at `  }, [darkMode, accentTheme, bgTheme, session]);`

const regexToRemove = /[\r\n\s]*useEffect\(\(\) => \{\s*if \(session\?\.user\?\.id\) \{\s*import\('\.\/lib\/profile'\)\.then\(\(\{ loadUserProfile \}\) => \{[\s\S]*?\}, \[darkMode, accentTheme, bgTheme, session\]\);/g;

content = content.replace(regexToRemove, '');

// Insert at the safe point before the return
const targetPoint = "  if (appMode === 'dashboard') {";
content = content.replace(targetPoint, profileLogic + "\n" + targetPoint);

fs.writeFileSync('src/App.jsx', content);
console.log('App.jsx fixed successfully.');
