import { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import { 
  User, Activity, Clock, ClipboardList, Stethoscope, FileText,
  Download, ChevronDown, ChevronRight, Heart, Wind, Coffee,
  Brain, Droplets, Bone, Scan, CircleDot, Baby,
  Lightbulb, FlaskConical, Target, Pill, CheckCircle, Eye,
  PanelLeftClose, PanelLeftOpen, Menu, Sun, Moon,
  ChevronLeft, ArrowRight, Check, HelpCircle, Settings, Ear, Lock,
  LayoutDashboard, LogOut, TrendingUp, History
} from 'lucide-react';
import './index.css';

import OnboardingTutorial from './components/UI/OnboardingTutorial';
import Dashboard from './components/Screens/Dashboard';
import AuthScreen from './components/Screens/AuthScreen';
import { supabase } from './lib/supabase';
import LockScreen from './components/Screens/LockScreen';
import { NotificationProvider } from './components/UI/NotificationSystem';
const TemplateSelector = lazy(() => import('./components/UI/TemplateSelector'));
const VersionHistory = lazy(() => import('./components/UI/VersionHistory'));
import SyncManager from './components/UI/SyncManager';
import { saveVersionSnapshot, addToSyncQueue } from './lib/syncAndHistory';
const EtatCivil = lazy(() => import('./components/Sections/EtatCivil'));
const MotifConsultation = lazy(() => import('./components/Sections/MotifConsultation'));
const HistoireMaladie = lazy(() => import('./components/Sections/HistoireMaladie'));
const Antecedents = lazy(() => import('./components/Sections/Antecedents'));
const ExamenGeneral = lazy(() => import('./components/Sections/ExamenGeneral'));
const ExamenPleuro = lazy(() => import('./components/Sections/ExamenPleuro'));
const ExamenCardio = lazy(() => import('./components/Sections/ExamenCardio'));
const ExamenDigestif = lazy(() => import('./components/Sections/ExamenDigestif'));
const ExamenNeuro = lazy(() => import('./components/Sections/ExamenNeuro'));
const ExamenUroNephro = lazy(() => import('./components/Sections/ExamenUroNephro'));
const ExamenLocomoteur = lazy(() => import('./components/Sections/ExamenLocomoteur'));
const ExamenDermato = lazy(() => import('./components/Sections/ExamenDermato'));
const ExamenORL = lazy(() => import('./components/Sections/ExamenORL'));
const ExamenAiresGanglionnaires = lazy(() => import('./components/Sections/ExamenAiresGanglionnaires'));
const ExamenGyneco = lazy(() => import('./components/Sections/ExamenGyneco'));
const ResumeSyndromique = lazy(() => import('./components/Sections/ResumeSyndromique'));
const HypothesesDiagnostiques = lazy(() => import('./components/Sections/HypothesesDiagnostiques'));
const BilanParaclinique = lazy(() => import('./components/Sections/BilanParaclinique'));
const DiagnosticRetenu = lazy(() => import('./components/Sections/DiagnosticRetenu'));
const TraitementSurveillance = lazy(() => import('./components/Sections/TraitementSurveillance'));
const ConclusionPronostic = lazy(() => import('./components/Sections/ConclusionPronostic'));
const Evolution = lazy(() => import('./components/Sections/Evolution'));
const ApercuSection = lazy(() => import('./components/Sections/ApercuSection'));
const ExportSection = lazy(() => import('./components/Sections/ExportSection'));

const SECTIONS = [
  { id: 'etat-civil', title: 'État civil', icon: User },
  { id: 'motif', title: 'Motif de consultation', icon: Activity },
  { id: 'histoire', title: 'Histoire de la maladie', icon: Clock },
  { id: 'antecedents', title: 'Antécédents', icon: ClipboardList },
];

const EXAMEN_SUBSECTIONS = [
  { id: 'examen-general', title: 'Général & Constantes', icon: Activity },
  { id: 'examen-pleuro', title: 'Pleuro-pulmonaire', icon: Wind },
  { id: 'examen-cardio', title: 'Cardio-circulatoire', icon: Heart },
  { id: 'examen-digestif', title: 'Digestif', icon: Coffee },
  { id: 'examen-neuro', title: 'Neurologique', icon: Brain },
  { id: 'examen-uro', title: 'Uro-Néphrologique', icon: Droplets },
  { id: 'examen-locomoteur', title: 'Locomoteur', icon: Bone },
  { id: 'examen-dermato', title: 'Dermatologique', icon: Scan },
  { id: 'examen-orl', title: 'ORL', icon: Ear },
  { id: 'examen-ganglions', title: 'Aires Ganglionnaires', icon: CircleDot },
  { id: 'examen-gyneco', title: 'Gynécologique', icon: Baby },
];

const POST_EXAMEN_SECTIONS = [
  { id: 'resume', title: 'Résumé syndromique', icon: FileText },
  { id: 'hypotheses', title: 'Hypothèses diagnostiques', icon: Lightbulb },
  { id: 'bilan', title: 'Bilan paraclinique', icon: FlaskConical },
  { id: 'diagnostic', title: 'Diagnostics', icon: Target },
  { id: 'traitement', title: 'Traitement & Surveillance', icon: Pill },
  { id: 'evolution', title: 'Évolution', icon: TrendingUp },
  { id: 'conclusion', title: 'Conclusion & Pronostic', icon: CheckCircle },
  { id: 'apercu', title: 'Aperçu', icon: Eye },
  { id: 'export', title: 'Télécharger / Exporter', icon: Download },
  { id: 'settings', title: 'Paramètres', icon: Settings },
];

const ALL_SECTIONS_FLAT = [
  ...SECTIONS,
  ...EXAMEN_SUBSECTIONS,
  ...POST_EXAMEN_SECTIONS,
];

const ACCENT_THEMES = [
  { id: 'default', name: 'Original (Marron)', color1: '#D4C7B1', color2: '#8B6914' },
  { id: 'mint', name: 'Menthe Fraîche', color1: '#34D399', color2: '#059669' },
  { id: 'neon', name: 'Néon Bio', color1: '#BEF264', color2: '#65A30D' },
  { id: 'crimson', name: 'Rouge Carmin', color1: '#FDA4AF', color2: '#BE123C' },
  { id: 'cerulean', name: 'Bleu Azur', color1: '#7DD3FC', color2: '#0369A1' },
  { id: 'navy', name: 'Bleu Marine', color1: '#93C5FD', color2: '#1E3A8A' },
];

const BG_THEMES = [
  { id: 'default', name: 'Classique (Beige)', color1: '#F7F3EC', color2: '#F0E8DA' },
  { id: 'mint', name: 'Menthe Douce', color1: '#F4FDF9', color2: '#ECFDF5' },
  { id: 'neon', name: 'Néon Doux', color1: '#F9FDEE', color2: '#F4FCE3' },
  { id: 'frost', name: 'Givre Boréal', color1: '#F8FAFC', color2: '#F0F4F8' },
  { id: 'studio', name: 'Blanc Studio', color1: '#FAFAFA', color2: '#F5F5F5' },
];

const SettingsSection = ({ accentTheme, bgTheme, setAccentTheme, setBgTheme }) => {
  const [localAccent, setLocalAccent] = useState(accentTheme);
  const [localBg, setLocalBg] = useState(bgTheme);

  const selectedAccentColor = ACCENT_THEMES.find(t => t.id === localAccent)?.color2 || 'var(--primary)';
  const selectedBgColor = BG_THEMES.find(t => t.id === localBg)?.color2 || 'var(--primary)';

  return (
    <div className="section-content fade-in" style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '1.6rem', color: 'var(--text-main)', marginBottom: '1.5rem', fontFamily: 'var(--font-display)', fontWeight: 600 }}>Paramètres</h2>
      
      {/* ACCENT THEMES */}
      <div className="form-card theme-section-card" style={{ padding: '2rem', background: 'var(--surface)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', marginBottom: '2rem', transition: 'all 0.3s' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-main)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings size={20} color="var(--primary)" />
          Thème d'accentuation
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {ACCENT_THEMES.map(theme => (
            <button
              key={theme.id}
              onClick={() => setLocalAccent(theme.id)}
              className="theme-btn"
              style={{
                padding: '1.2rem 1rem', borderRadius: '12px', border: localAccent === theme.id ? '2px solid var(--primary)' : '2px solid var(--surface-border)',
                background: localAccent === theme.id ? 'var(--surface-hover)' : 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.2s'
              }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `linear-gradient(135deg, ${theme.color1}, ${theme.color2})` }} />
              <span>{theme.name}</span>
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button 
            onClick={() => setAccentTheme(localAccent)} 
            className="dynamic-confirm-btn"
            style={{
              padding: '0.8rem 2rem',
              borderRadius: '30px',
              border: '1px solid var(--noir)',
              background: 'transparent',
              color: 'var(--text-main)',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = selectedAccentColor;
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.border = `1px solid ${selectedAccentColor}`;
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = `0 6px 16px ${selectedAccentColor}40`;
              e.currentTarget.style.fontWeight = '700';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-main)';
              e.currentTarget.style.border = '1px solid var(--noir)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.fontWeight = '500';
            }}
          >
            Appliquer l'accentuation
          </button>
        </div>
      </div>

      {/* BACKGROUND THEMES */}
      <div className="form-card theme-section-card" style={{ padding: '2rem', background: 'var(--surface)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', transition: 'all 0.3s' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-main)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{width: 20, height: 20, borderRadius: 4, background: 'var(--primary)'}}></div>
          Thème d'arrière-plan
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {BG_THEMES.map(theme => (
            <button
              key={theme.id}
              onClick={() => setLocalBg(theme.id)}
              className="theme-btn"
              style={{
                padding: '1.2rem 1rem', borderRadius: '12px', border: localBg === theme.id ? '2px solid var(--primary)' : '2px solid var(--surface-border)',
                background: localBg === theme.id ? 'var(--surface-hover)' : 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.2s'
              }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `linear-gradient(135deg, ${theme.color1}, ${theme.color2})` }} />
              <span>{theme.name}</span>
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button 
            onClick={() => setBgTheme(localBg)} 
            className="dynamic-confirm-btn"
            style={{
              padding: '0.8rem 2rem',
              borderRadius: '30px',
              border: '1px solid var(--noir)',
              background: 'transparent',
              color: 'var(--text-main)',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = selectedBgColor;
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.border = `1px solid ${selectedBgColor}`;
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = `0 6px 16px ${selectedBgColor}40`;
              e.currentTarget.style.fontWeight = '700';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-main)';
              e.currentTarget.style.border = '1px solid var(--noir)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.fontWeight = '500';
            }}
          >
            Appliquer l'arrière-plan
          </button>
        </div>
      </div>
    </div>
  );
};

const MobileDashboardButton = ({ onGoDashboard }) => {
  const [isVisible, setIsVisible] = useState(true);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleInteraction = () => {
      setIsVisible(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    };

    window.addEventListener('scroll', handleInteraction, { passive: true });
    window.addEventListener('touchmove', handleInteraction, { passive: true });
    
    handleInteraction(); // start initial timer

    return () => {
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('touchmove', handleInteraction);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media (min-width: 1025px) {
          .mobile-floating-dashboard-btn { display: none !important; }
        }
      `}} />
      <button 
        onClick={onGoDashboard}
        className="mobile-floating-dashboard-btn"
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 9999,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(220, 38, 38, 0.15)',
          boxShadow: '0 10px 30px rgba(220, 38, 38, 0.2), 0 0 0 1px rgba(255,255,255,0.7) inset',
          color: 'var(--primary)',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isVisible ? 1 : 0,
          pointerEvents: isVisible ? 'auto' : 'none',
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(-15px) scale(0.9)',
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <LayoutDashboard size={22} strokeWidth={2.5} />
      </button>
    </>
  );
};

function AppContent() {
  const [session, setSession] = useState(null);
  const [appMode, setAppMode] = useState(() => {
    return localStorage.getItem('obsmed-pin') ? 'locked' : 'dashboard';
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    const loadPatients = async () => {
      const { data, error } = await supabase.from('patients').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        setPatients(data.map(p => ({ id: p.patient_id_local, date: p.created_at, data: p.data })));
      }
    };
    loadPatients();
  }, [session]);
  const [patients, setPatients] = useState(() => {
    try { const saved = localStorage.getItem('obsmed-patients'); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });
  const [currentPatientId, setCurrentPatientId] = useState(null);
  
  const [activeSection, setActiveSection] = useState('etat-civil');
  const [accentTheme, setAccentTheme] = useState(() => localStorage.getItem('obsmed-accenttheme') || 'crimson');
  const [bgTheme, setBgTheme] = useState(() => localStorage.getItem('obsmed-bgtheme') || 'frost');
  const [isExamenOpen, setIsExamenOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showFloatingBtn, setShowFloatingBtn] = useState(false);
  const [pageKey, setPageKey] = useState(0); 
  const [forceTutorial, setForceTutorial] = useState(false);
  const pillsContainerRef = useRef(null);
  
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('obsmed-dark') === 'true');
  const [showSplash, setShowSplash] = useState(() => localStorage.getItem('obsmed-splash-seen') !== 'true');
  const [splashExiting, setSplashExiting] = useState(false);
  const [saveTime, setSaveTime] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(() => {
    try { const saved = localStorage.getItem('obsmed-data'); return saved ? JSON.parse(saved) : {}; } catch { return {}; }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('obsmed-dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-accent-theme', accentTheme);
    document.documentElement.setAttribute('data-bg-theme', bgTheme);
    localStorage.setItem('obsmed-accenttheme', accentTheme);
    localStorage.setItem('obsmed-bgtheme', bgTheme);
  }, [accentTheme, bgTheme]);

  useEffect(() => {
    if (pillsContainerRef.current) {
      const activePill = pillsContainerRef.current.querySelector('.section-pill.active');
      if (activePill) {
        const container = pillsContainerRef.current;
        const scrollLeft = activePill.offsetLeft - (container.clientWidth / 2) + (activePill.clientWidth / 2);
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  }, [activeSection]);

  const [showVersionHistory, setShowVersionHistory] = useState(false);

  useEffect(() => {
    if (appMode !== 'editor' || !currentPatientId) return;
    setIsSaving(true);
    const timeout = setTimeout(() => {
      setPatients(prev => {
        const newPatients = [...prev];
        const idx = newPatients.findIndex(p => p.id === currentPatientId);
        const oldData = idx >= 0 ? newPatients[idx].data : {};
        
        // Version History Snapshot
        saveVersionSnapshot(currentPatientId, formData, oldData);

        if (idx >= 0) {
          newPatients[idx].data = formData;
          newPatients[idx].lastEdit = new Date().toISOString();
        } else {
          newPatients.push({
            id: currentPatientId,
            date: new Date().toISOString(),
            data: formData
          });
        }
        
        // Data Sync logic
        if (session) {
          if (navigator.onLine) {
            supabase.from('patients').upsert({
              user_id: session.user.id,
              patient_id_local: currentPatientId,
              data: formData,
              updated_at: new Date().toISOString()
            }, { onConflict: 'patient_id_local' }).then(({error}) => {
              if(error) console.error("Supabase sync error:", error);
            });
          } else {
            addToSyncQueue({ type: 'upsert', patientId: currentPatientId, data: formData });
          }
        }

        localStorage.setItem('obsmed-patients', JSON.stringify(newPatients));
        return newPatients;
      });
      setSaveTime(new Date());
      setIsSaving(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, [formData, currentPatientId, appMode, session]);

  useEffect(() => {
    let timeout;
    const resetTimer = () => {
      clearTimeout(timeout);
      if (appMode !== 'locked' && localStorage.getItem('obsmed-pin')) {
        timeout = setTimeout(() => setAppMode('locked'), 5 * 60 * 1000); // 5 min
      }
    };
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    resetTimer();
    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
      clearTimeout(timeout);
    };
  }, [appMode]);

  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const handleNewPatient = () => {
    setShowTemplateSelector(true);
  };

  const handleTemplateSelect = (templateData) => {
    const id = 'pat_' + Date.now();
    setCurrentPatientId(id);
    setFormData(templateData?.defaultData || {});
    setActiveSection('etat-civil');
    setAppMode('editor');
    setShowTemplateSelector(false);
  };

  const handleOpenPatient = (id) => {
    const pat = patients.find(p => p.id === id);
    if (pat) {
      setFormData(pat.data || {});
      setCurrentPatientId(id);
      setActiveSection('etat-civil');
      setAppMode('editor');
    }
  };

  const updateFormData = useCallback((sectionId, data) => {
    setFormData(prev => ({ ...prev, [sectionId]: { ...prev[sectionId], ...data } }));
  }, []);

  const updatersRef = useRef({});
  const getUpdater = useCallback((id) => {
    if (!updatersRef.current[id]) updatersRef.current[id] = (d) => updateFormData(id, d);
    return updatersRef.current[id];
  }, [updateFormData]);

  const progress = useMemo(() => {
    const sectionIds = ALL_SECTIONS_FLAT.map(s => s.id);
    let filled = 0;
    sectionIds.forEach(id => {
      if (formData[id] && Object.keys(formData[id]).length > 0) {
        const hasValue = Object.values(formData[id]).some(v => v && v !== '' && v !== false);
        if (hasValue) filled++;
      }
    });
    return Math.round((filled / sectionIds.length) * 100);
  }, [formData]);

  const sectionHasData = useCallback((id) => {
    if (!formData[id]) return false;
    return Object.values(formData[id]).some(v => v && v !== '' && v !== false);
  }, [formData]);

  const navigateTo = useCallback((sectionId) => {
    setActiveSection(sectionId);
    setPageKey(k => k + 1);
    if (EXAMEN_SUBSECTIONS.some(s => s.id === sectionId)) setIsExamenOpen(true);
    if (window.innerWidth <= 1024) setIsMobileMenuOpen(false);
    window.scrollTo(0, 0);
  }, []);

  const activeSectionsListGlobal = ALL_SECTIONS_FLAT.filter(s => {
    if (s.id === 'examen-gyneco' && formData['etat-civil']?.sexe === 'M') return false;
    return true;
  });
  const currentIndex = activeSectionsListGlobal.findIndex(s => s.id === activeSection);
  const prevSection = currentIndex > 0 ? activeSectionsListGlobal[currentIndex - 1] : null;
  const nextSection = currentIndex < activeSectionsListGlobal.length - 1 ? activeSectionsListGlobal[currentIndex + 1] : null;

  const renderActiveSection = () => {
    const props = (id) => ({ data: formData[id], updateData: getUpdater(id), patientSexe: formData['etat-civil']?.sexe });
    switch (activeSection) {
      case 'etat-civil': return <EtatCivil {...props('etat-civil')} />;
      case 'motif': return <MotifConsultation {...props('motif')} />;
      case 'histoire': return <HistoireMaladie {...props('histoire')} />;
      case 'antecedents': return <Antecedents {...props('antecedents')} />;
      case 'examen-general': return <ExamenGeneral {...props('examen-general')} />;
      case 'examen-pleuro': return <ExamenPleuro {...props('examen-pleuro')} />;
      case 'examen-cardio': return <ExamenCardio {...props('examen-cardio')} />;
      case 'examen-digestif': return <ExamenDigestif {...props('examen-digestif')} />;
      case 'examen-neuro': return <ExamenNeuro {...props('examen-neuro')} />;
      case 'examen-uro': return <ExamenUroNephro {...props('examen-uro')} />;
      case 'examen-locomoteur': return <ExamenLocomoteur {...props('examen-locomoteur')} />;
      case 'examen-dermato': return <ExamenDermato {...props('examen-dermato')} />;
      case 'examen-orl': return <ExamenORL {...props('examen-orl')} />;
      case 'examen-ganglions': return <ExamenAiresGanglionnaires {...props('examen-ganglions')} />;
      case 'examen-gyneco': return <ExamenGyneco {...props('examen-gyneco')} />;
      case 'resume': return <ResumeSyndromique {...props('resume')} />;
      case 'hypotheses': return <HypothesesDiagnostiques {...props('hypotheses')} />;
      case 'bilan': return <BilanParaclinique {...props('bilan')} />;
      case 'diagnostic': return <DiagnosticRetenu {...props('diagnostic')} />;
      case 'traitement': return <TraitementSurveillance {...props('traitement')} />;
      case 'evolution': return <Evolution {...props('evolution')} />;
      case 'conclusion': return <ConclusionPronostic {...props('conclusion')} />;
      case 'apercu': return <ApercuSection data={formData} onNavigate={navigateTo} />;
      case 'export': return <ExportSection data={formData} />;
      case 'settings': return <SettingsSection accentTheme={accentTheme} bgTheme={bgTheme} setAccentTheme={setAccentTheme} setBgTheme={setBgTheme} />;
      default: return <EtatCivil {...props('etat-civil')} />;
    }
  };

  const NavItem = ({ section, isSub = false }) => {
    const Icon = section.icon;
    const isActive = activeSection === section.id;
    const hasDot = sectionHasData(section.id);
    return (
      <button
        className={`nav-item-btn ${isActive ? 'active' : ''}`}
        onClick={() => navigateTo(section.id)}
        title={isSidebarCollapsed ? section.title : undefined}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%',
          padding: isSub ? '0.55rem 0.85rem 0.55rem 2.4rem' : '0.7rem 1rem',
          borderRadius: '10px', background: isActive ? 'var(--noir)' : 'transparent',
          color: isActive ? 'var(--blanc)' : 'var(--text-main)', border: 'none',
          cursor: 'pointer', textAlign: 'left',
          fontSize: isSub ? '0.85rem' : '0.94rem', fontWeight: isActive ? '700' : '600',
          fontFamily: 'var(--font-body)', marginBottom: '2px', position: 'relative',
        }}
      >
        <Icon size={isSub ? 14 : 17} strokeWidth={isActive ? 2.5 : 2} style={{ minWidth: '17px' }} />
        <span className="nav-label">{section.title}</span>
        {hasDot && !isActive && (
          <span style={{ position: 'absolute', right: '10px', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }} className="nav-label" />
        )}
      </button>
    );
  };

  const GroupLabel = ({ children, first = false }) => (
    <p className="nav-group-label" style={{
      fontSize: '0.68rem', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.1em',
      padding: '0.5rem 1rem 0.35rem', marginTop: first ? '0' : '1.2rem', fontFamily: 'var(--font-body)',
    }}>{children}</p>
  );

  const formatSaveTime = () => {
    if (!saveTime) return '';
    return saveTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  if (!session) {
    return <AuthScreen />;
  }

  if (appMode === 'locked') {
    return <LockScreen onUnlock={() => setAppMode('dashboard')} />;
  }

  const handleDeletePatient = async (id) => {
    try {
      const { error } = await supabase.from('patients').delete().eq('patient_id_local', id);
      if (error) throw error;
      setPatients(prev => prev.filter(p => p.id !== id));
      localStorage.setItem('obsmed-patients', JSON.stringify(patients.filter(p => p.id !== id)));
    } catch (err) {
      console.error('Erreur suppression:', err);
    }
  };

  if (appMode === 'dashboard') {
    return (
      <>
        <Dashboard patients={patients} onOpenPatient={handleOpenPatient} onNewPatient={handleNewPatient} onDeletePatient={handleDeletePatient} />
        {showTemplateSelector && (
          <Suspense fallback={null}>
            <TemplateSelector onSelect={handleTemplateSelect} onClose={() => setShowTemplateSelector(false)} />
          </Suspense>
        )}
      </>
    );
  }

  return (
    <>
      <MobileDashboardButton onGoDashboard={() => setIsMobileMenuOpen(true)} />
      
      {showSplash && (
        <div className={`splash-screen ${splashExiting ? 'exiting' : ''}`}>
          <div className="splash-logo">
            <img src="/logo.png" alt="Logo" className="brand-logo splash-brand-logo" />
            <h1>ObsMed<span style={{ color: 'var(--primary)' }}>.</span></h1>
          </div>
          <p className="splash-subtitle">Bienvenue, futur Docteur. Prêt(e) à rédiger votre observation ?</p>
          <button className="splash-btn" onClick={() => { setSplashExiting(true); localStorage.setItem('obsmed-splash-seen', 'true'); setTimeout(() => setShowSplash(false), 500); }}>Commencer</button>
        </div>
      )}

      <div className="app-layout" style={{ display: 'flex', minHeight: '100vh' }}>
        <div className={`mobile-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setIsMobileMenuOpen(false)} />
        <button className={`fab-menu ${showFloatingBtn && !isMobileMenuOpen ? 'visible' : ''}`} onClick={() => setIsMobileMenuOpen(true)}>
          <Menu size={20} />
        </button>

        <aside className={`app-sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`} style={{ width: '280px', minWidth: '280px', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', borderRight: '2px solid var(--surface-border)', background: 'var(--sidebar-bg)', overflowY: 'auto' }}>
          
          <div className="sidebar-brand" style={{ marginBottom: '1rem', paddingLeft: '0.75rem' }}>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <img src="/logo.png" alt="Logo" className="brand-logo sidebar-brand-logo" />
              <span className="brand-text" style={{ display: 'flex', alignItems: 'baseline', whiteSpace: 'nowrap' }}>
                <span style={{ fontFamily: "'Cabin Sketch', cursive", fontSize: '1.9rem', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '1px' }}>Obs</span>
                <span style={{ fontFamily: "'Dancing Script', cursive", fontSize: '2.1rem', fontWeight: '700', color: 'var(--primary)', marginLeft: '2px' }}>Med</span>
              </span>
            </h1>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', width: '100%', padding: '0 0.25rem' }}>
            <button 
              className="exit-folder-btn"
              onClick={() => { if (window.confirm('Êtes-vous sûr de vouloir quitter ce dossier et retourner à l\'accueil ?')) { setAppMode('dashboard'); } }} 
              title="Quitter le dossier"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                padding: isSidebarCollapsed ? '0.4rem' : '0.4rem 0.8rem', 
                background: '#fee2e2', color: '#ef4444',
                border: 'none', borderRadius: '99px', cursor: 'pointer',
                fontWeight: '600', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                fontSize: '0.8rem', flexShrink: 0
              }}
              onMouseOver={e => {e.currentTarget.style.background = '#fecaca'; e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.2)';}}
              onMouseOut={e => {e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none';}}
            >
              <LogOut size={14} strokeWidth={2.5} />
              {!isSidebarCollapsed && <span>Quitter</span>}
            </button>

            <div style={{ display: 'flex', gap: '4px' }}>
              <button className="top-icon-btn theme-toggle" onClick={() => setShowVersionHistory(true)} title="Historique des versions"><History size={16} /></button>
              <button className="top-icon-btn theme-toggle" onClick={() => setForceTutorial(true)} title="Tutoriel de prise en main"><HelpCircle size={16} /></button>
              <button className="top-icon-btn theme-toggle" onClick={() => setDarkMode(!darkMode)} title={darkMode ? 'Mode clair' : 'Mode sombre'}>{darkMode ? <Sun size={16} /> : <Moon size={16} />}</button>
              <button className="top-icon-btn theme-toggle desktop-only" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} title={isSidebarCollapsed ? 'Étendre' : 'Réduire'}>{isSidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}</button>
            </div>
          </div>

          <nav className="nav-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <GroupLabel first>Interrogatoire</GroupLabel>
            {SECTIONS.map(s => <NavItem key={s.id} section={s} />)}
            
            <GroupLabel>Examen Clinique</GroupLabel>
            <button className="nav-item-btn" onClick={() => { if (isSidebarCollapsed) setIsSidebarCollapsed(false); setIsExamenOpen(!isExamenOpen); }} title={isSidebarCollapsed ? "Examen physique" : undefined} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0.7rem 1rem', borderRadius: '10px', background: isExamenOpen ? 'var(--brown-subtle)' : 'transparent', color: 'var(--text-main)', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '0.94rem', fontWeight: '600', fontFamily: 'var(--font-body)', marginBottom: '2px', position: 'relative' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Stethoscope size={17} strokeWidth={2} style={{ minWidth: '17px' }} /><span className="nav-label">Examen physique</span></span>
              <span className="nav-chevron">{isExamenOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}</span>
            </button>
            {isExamenOpen && !isSidebarCollapsed && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                {EXAMEN_SUBSECTIONS.map(s => <NavItem key={s.id} section={s} isSub />)}
              </div>
            )}

            <GroupLabel>Synthèse & Conclusion</GroupLabel>
            {POST_EXAMEN_SECTIONS.map(s => <NavItem key={s.id} section={s} />)}
          </nav>
        </aside>

        <main className="app-main" style={{ flex: 1, padding: '2rem 3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
          <div className="app-main-watermark" />
          <OnboardingTutorial forceRun={forceTutorial} onComplete={() => setForceTutorial(false)} />
          <div style={{ width: '100%', maxWidth: '920px', overflow: 'hidden' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', width: '100%', overflow: 'hidden' }}>
              <div className="shortcut-carousel-container" style={{ position: 'relative', width: '100%', height: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginBottom: '1.5rem', maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}>
                
                {(() => {
                  const activeSectionsList = ALL_SECTIONS_FLAT.filter(s => {
                    if (s.id === 'examen-gyneco' && formData['etat-civil']?.sexe === 'M') return false;
                    return true;
                  });
                  return activeSectionsList.map((s, index) => {

                  const hasData = sectionHasData(s.id);
                  const isActive = activeSection === s.id;
                  
                  const activeIndex = activeSectionsList.findIndex(x => x.id === activeSection);
                  const offset = index - activeIndex;
                  const absOffset = Math.abs(offset);
                  
                  // Calculate dynamic styles
                  const scale = isActive ? 1.35 : Math.max(0, 1 - 0.15 * absOffset);
                  const translateX = offset * 52; // pixels spacing
                  const opacity = isActive ? 1 : Math.max(0, 0.9 - 0.1 * absOffset);
                  const blur = isActive ? 0 : absOffset * 0.7;
                  const zIndex = 20 - absOffset;
                  
                  const isVisible = absOffset <= 6;
                  
                  const stateClass = isActive ? 'active' : (hasData ? 'filled' : 'empty');
                  const Icon = s.icon;
                  
                  if (!isVisible) return null;

                  return (
                    <div 
                      key={s.id} 
                      className={`shortcut-circle ${stateClass}`} 
                      onClick={() => navigateTo(s.id)} 
                      title={s.title}
                      style={{
                        position: 'absolute',
                        transform: `translateX(${translateX}px) scale(${scale})`,
                        opacity: opacity,
                        filter: `blur(${blur}px)`,
                        zIndex: zIndex,
                        transition: 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)'
                      }}
                    >
                      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                      {hasData && !isActive && <span className="circle-check-dot" />}

                    </div>
                  );
                  });
                })()}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                <div className="progress-track liquid-track" style={{ flex: 1, position: 'relative', overflow: 'hidden', borderRadius: '20px', height: '14px', background: 'var(--surface-border)', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div className="liquid-progress" style={{ width: `${Math.max(progress, 2)}%`, height: '100%', position: 'absolute', left: 0, top: 0, background: 'var(--primary)', borderRadius: '20px', transition: 'width 0.5s cubic-bezier(0.22, 1, 0.36, 1)' }}>
                    <div className="liquid-wave"></div>
                  </div>
                </div>
                <span className="progress-label" style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '1rem', minWidth: '40px' }}>{progress}%</span>
              </div>
              
              <div className="top-actions-right" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <SyncManager session={session} />
                
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div className={`save-indicator ${isSaving ? 'saving' : ''}`}>
                    <span className="save-dot" />
                    {saveTime ? `Sauvegardé à ${formatSaveTime()}` : 'Non sauvegardé'}
                  </div>
                </div>
              </div>
            </div>

            <div key={pageKey} className="page-enter">
              <Suspense fallback={<div className="loading-spinner">Chargement...</div>}>
                {renderActiveSection()}
              </Suspense>
            </div>

            {activeSection !== 'apercu' && activeSection !== 'export' && (
              <div className="nav-footer">
                <button className={`nav-footer-btn ${!prevSection ? 'invisible' : ''}`} onClick={() => prevSection && navigateTo(prevSection.id)}>
                  <ChevronLeft size={16} />{prevSection?.title || ''}
                </button>
                <button className={`nav-footer-btn ${!nextSection ? 'invisible' : ''}`} onClick={() => nextSection && navigateTo(nextSection.id)}>
                  {nextSection?.title || ''}<ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
          </main>
        </div>

        {showVersionHistory && (
          <Suspense fallback={null}>
            <VersionHistory
              patientId={currentPatientId}
              currentData={formData}
              onRestore={(data) => {
                setFormData(data);
                setShowVersionHistory(false);
              }}
              onClose={() => setShowVersionHistory(false)}
            />
          </Suspense>
        )}
      </>
    );
}

export default function App() {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
}







