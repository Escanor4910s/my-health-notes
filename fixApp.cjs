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

if (!content.includes('loadUserProfile(session.user.id)')) {
  content = content.replace(/return \(\) => subscription\.unsubscribe\(\);[\r\n\s]+\}, \[\]\);/, match => match + "\n" + profileLogic);
  fs.writeFileSync('src/App.jsx', content);
  console.log('App.jsx fixed');
} else {
  console.log('App.jsx already has profile logic');
}
