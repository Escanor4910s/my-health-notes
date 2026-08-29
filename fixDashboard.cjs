const fs = require('fs');
let code = fs.readFileSync('src/components/Screens/Dashboard.jsx', 'utf8');

const replacement = `  const [avatarUrl, setAvatarUrl] = useState(() => localStorage.getItem('obsmed-avatar') || '');

  useEffect(() => {
    const handleProfileUpdate = () => {
      setAvatarUrl(localStorage.getItem('obsmed-avatar') || '');
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    window.addEventListener('storage', handleProfileUpdate);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
    };
  }, []);`;

code = code.replace(/const avatarUrl = localStorage\.getItem\('obsmed-avatar'\) \|\| '';/, replacement);
fs.writeFileSync('src/components/Screens/Dashboard.jsx', code);
console.log('Dashboard.jsx made reactive.');
