const fs = require('fs');

let content = fs.readFileSync('src/App.jsx', 'utf8');

const sessionUseEffect = `
  useEffect(() => {
    if (session?.user?.id) {
      import('./lib/profile').then(({ loadUserProfile }) => {
        loadUserProfile(session.user.id).then((profile) => {
          if (profile) {
            if (profile.theme) {
              setDarkMode(profile.theme === 'dark');
              setIsDarkMode(profile.theme === 'dark');
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

// Insert after the existing session useEffect
if (!content.includes("loadUserProfile(session.user.id)")) {
    content = content.replace(
        /return \(\) => subscription\.unsubscribe\(\);\n  \}, \[\]\);/g,
        `return () => subscription.unsubscribe();\n  }, []);\n${sessionUseEffect}`
    );
    fs.writeFileSync('src/App.jsx', content, 'utf8');
    console.log('App.jsx updated for profile sync.');
} else {
    console.log('App.jsx already has profile sync.');
}
