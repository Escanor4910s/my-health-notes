import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Plus, Clock, Search, Folder, User, LogOut, Settings, Camera, CreditCard, X, Edit3, Image as ImageIcon, Check, Loader2, Save, Database, FileText, File, Trash2, TrendingUp, ChevronRight, ChevronLeft, Crown, Shield, Filter, SortAsc, BarChart3, Calendar, ChevronDown, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNotification } from '../UI/NotificationSystem';
import StatsPanel from './StatsPanel';
import AccountModal, { AvatarWithBadge } from './AccountModal';

export default function Dashboard({ patients, onOpenPatient, onNewPatient, onDeletePatient, onRestorePatient, onDuplicatePatient, onExportPatient, onOpenSettings }) {
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [completionFilter, setCompletionFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('active'); // 'active' | 'trash'
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const { confirmAction } = useNotification();
  const [session, setSession] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(localStorage.getItem('obsmed-plan') || null);
  
  const avatarUrl = localStorage.getItem('obsmed-avatar') || '';

  const handlePlanChange = (plan) => {
    if (plan) {
      localStorage.setItem('obsmed-plan', plan);
    } else {
      localStorage.removeItem('obsmed-plan');
    }
    setCurrentPlan(plan);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        onNewPatient();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNewPatient]);

  // --- Helper: count filled sections for a patient ---
  const getCompletionLevel = (p) => {
    const sectionIds = ['etat-civil','motif','histoire','antecedents','examen-general','examen-pleuro','examen-cardio','examen-digestif','examen-neuro','resume','hypotheses','bilan','diagnostic','traitement','evolution','conclusion'];
    if (!p.data) return 0;
    let filled = 0;
    sectionIds.forEach(id => {
      if (p.data[id] && Object.values(p.data[id]).some(v => v && v !== '' && v !== false)) filled++;
    });
    return Math.round((filled / sectionIds.length) * 100);
  };

  // --- Advanced filtering ---
  const filteredPatients = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday); startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let result = patients.filter(p => {
      // Text search: name, motif, diagnostic, histoire
      const term = search.toLowerCase();
      if (term) {
        const nom = (p.data?.['etat-civil']?.nom_prenoms || 'patient anonyme').toLowerCase();
        const motif = (p.data?.['motif']?.motif || '').toLowerCase();
        const diagnostic = (p.data?.['diagnostic']?.diagnostic_retenu || '').toLowerCase();
        const histoire = (p.data?.['histoire']?.texte || '').toLowerCase();
        if (!nom.includes(term) && !motif.includes(term) && !diagnostic.includes(term) && !histoire.includes(term)) return false;
      }

      // Date filter
      if (dateFilter !== 'all') {
        const pDate = new Date(p.date);
        if (dateFilter === 'today' && pDate < startOfToday) return false;
        if (dateFilter === 'week' && pDate < startOfWeek) return false;
        if (dateFilter === 'month' && pDate < startOfMonth) return false;
      }

      // Completion filter
      if (completionFilter !== 'all') {
        const comp = getCompletionLevel(p);
        if (completionFilter === 'complete' && comp < 80) return false;
        if (completionFilter === 'inprogress' && (comp < 10 || comp >= 80)) return false;
        if (completionFilter === 'empty' && comp >= 10) return false;
      }

      return true;
    });

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'oldest') return new Date(a.date) - new Date(b.date);
      const nameA = (a.data?.['etat-civil']?.nom_prenoms || 'zzz').toLowerCase();
      const nameB = (b.data?.['etat-civil']?.nom_prenoms || 'zzz').toLowerCase();
      if (sortBy === 'az') return nameA.localeCompare(nameB);
      if (sortBy === 'za') return nameB.localeCompare(nameA);
      return 0;
    });

    return result;
  }, [patients, search, dateFilter, completionFilter, sortBy]);

  // --- Real stats ---
  const now = new Date();
  const startOfWeek = new Date(now); startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); startOfWeek.setHours(0,0,0,0);
  const activeThisWeek = patients.filter(p => new Date(p.date) >= startOfWeek).length;
  const totalConsults = patients.length;
  const avgCompletion = patients.length > 0 ? Math.round(patients.reduce((sum, p) => sum + getCompletionLevel(p), 0) / patients.length) : 0;
  const activeFiltersCount = (dateFilter !== 'all' ? 1 : 0) + (completionFilter !== 'all' ? 1 : 0) + (sortBy !== 'recent' ? 1 : 0);

  return (
    <div style={{ 
      background: 'var(--bg-color)',
      minHeight: '100vh', 
      paddingBottom: '3rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      <style dangerouslySetInnerHTML={{__html: `
        /* Subtle watermark */
        .dashboard-watermark {
          position: fixed; inset: 0;
          background-image: url('/assets/img9.jpg');
          background-size: 500px;
          background-repeat: repeat;
          mix-blend-mode: multiply;
          opacity: 0.05; 
          pointer-events: none;
          z-index: 0;
        }

        /* Glassmorphism Header - Hover Border Only */
        .premium-header {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow: 0 4px 24px rgba(0,0,0,0.03), inset 0 -1px 0 rgba(0,0,0,0.02);
          border-radius: 24px;
          padding: 0.85rem 1.25rem 0.85rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 1.5rem;
          margin: 0 auto 3rem auto;
          max-width: 1250px;
          z-index: 100;
          border: 1px solid rgba(255,255,255,0.5);
          transition: all 0.3s;
        }
        .premium-header:hover {
          border-color: var(--primary);
        }

        /* The "Glass UI" Stat Panels with fine hover line */
        .glass-stat-panel {
          background: var(--surface);
          border-radius: 24px;
          padding: 2.25rem;
          position: relative;
          overflow: hidden;
          z-index: 10;
          box-shadow: 0 10px 30px -10px rgba(0,0,0,0.05);
          border: 1px solid rgba(0,0,0,0.03);
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s, border-color 0.4s;
        }
        .glass-stat-panel:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -15px rgba(0,0,0,0.08);
          border-color: var(--primary);
        }

        /* Stat Panel Icons */
        .stat-icon {
          transition: color 0.4s, stroke 0.4s, fill 0.4s;
        }
        .glass-stat-panel:hover .stat-icon {
          color: var(--primary) !important;
          stroke: var(--primary) !important;
        }

        /* The Inverted Square Hover Effect */
        .stat-icon-wrapper {
          transition: all 0.4s;
        }
        .glass-stat-panel:hover .stat-icon-wrapper {
          background: var(--primary) !important;
          border-color: var(--primary) !important;
        }
        .glass-stat-panel:hover .stat-icon-wrapper .stat-icon {
          color: #ffffff !important;
          stroke: #ffffff !important;
        }

        /* Masterpiece Folders - Skeuomorphic & Elegant */
        .pro-folder-card {
          position: relative;
          width: 100%;
          height: 250px;
          background: transparent;
          cursor: pointer;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 10;
          margin-top: 15px;
        }
        
        .pro-folder-card:hover {
          transform: translateY(-10px);
          z-index: 20;
        }

        /* Back Flap - Matte Light Grey */
        .folder-back-pro {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 230px;
          background: var(--surface-bg);
          border-radius: 0 16px 16px 16px;
          box-shadow: inset 0 2px 4px rgba(255,255,255,1);
          border: 1px solid #e2e8f0;
          transition: all 0.4s;
        }
        .folder-back-pro::before {
          content: '';
          position: absolute;
          top: -16px; left: -1px;
          width: 40%; height: 18px;
          background: var(--surface-bg);
          border-radius: 12px 12px 0 0;
          border: 1px solid #e2e8f0;
          border-bottom: none;
        }

        /* Inner Papers - Pure White */
        .folder-paper-pro {
          position: absolute;
          bottom: 12px; left: 12px; right: 12px;
          height: 205px;
          background: var(--surface);
          border-radius: 8px 8px 0 0;
          box-shadow: 0 -2px 10px rgba(0,0,0,0.03);
          border: 1px solid #f1f5f9;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
        }
        .pro-folder-card:hover .folder-paper-pro {
          transform: translateY(-30px) rotate(1.5deg);
          box-shadow: 0 -8px 20px rgba(0,0,0,0.06);
        }

        /* Front Flap - White Glass / Alabaster */
        .folder-front-pro {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 180px;
          background: var(--surface);
          border-radius: 0 12px 16px 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 -2px 15px rgba(0,0,0,0.04);
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          transform-origin: bottom center;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Professional Hover State - The Subtle Red Edge Glow */
        .pro-folder-card:hover .folder-front-pro {
          transform: rotateX(-8deg);
          border-top: 1px solid var(--primary);
          box-shadow: 0 -8px 30px rgba(0,0,0,0.05), inset 0 2px 15px rgba(var(--primary-rgb, 200,0,0), 0.03);
        }

        /* Elegant Date Pill */
        .folder-date-pro {
          background: var(--surface-bg);
          border: 1px solid #f1f5f9;
          padding: 0.35rem 0.85rem;
          border-radius: 99px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          transition: all 0.3s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .pro-folder-card:hover .folder-date-pro {
          background: var(--primary);
          color: #ffffff;
          border-color: var(--primary);
        }

        /* The Folder Action Buttons - Minimalist */
        .folder-actions-wrapper {
          position: absolute;
          bottom: 1rem; right: 1rem;
          display: flex; gap: 8px;
          z-index: 20;
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .pro-folder-card:hover .folder-actions-wrapper {
          opacity: 1;
          transform: translateY(0);
        }
        .folder-action-btn {
          background: var(--surface);
          border: 1px solid #e2e8f0;
          color: #94a3b8;
          border-radius: 50%;
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }
        .folder-action-btn:hover {
          color: #fff !important;
          border-color: transparent !important;
          transform: scale(1.15) translateY(-2px);
        }
        .folder-action-btn.delete-btn:hover,
        .folder-action-btn.duplicate-btn:hover,
        .folder-action-btn.export-btn:hover,
        .folder-action-btn.restore-btn:hover {
          background: linear-gradient(135deg, var(--primary), #ef4444) !important;
          box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4) !important;
        }

        /* Smooth Search Input */
        .search-pro {
          width: 350px;
          padding: 0.85rem 1.25rem 0.85rem 3rem;
          border-radius: 99px;
          background: var(--surface);
          border: 1px solid #e2e8f0;
          font-size: 0.95rem;
          color: var(--text-main);
          outline: none;
          transition: all 0.3s;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }
        .search-pro:focus, .search-pro:hover {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(var(--primary-rgb, 200,0,0), 0.1);
        }

          /* Animated Gradient Border for Premium Card */
          @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          @media (max-width: 768px) {
            .premium-header {
              border-radius: 16px !important;
              margin: 0 0.5rem 2rem 0.5rem !important;
              padding: 0.65rem 1rem !important;
            }
            .search-pro {
              width: 100% !important;
              max-width: 100% !important;
            }
            .glass-stat-panel {
              padding: 1.5rem !important;
              border-radius: 18px !important;
            }
            .stats-grid {
              grid-template-columns: 1fr !important;
            }
            .folders-grid {
              grid-template-columns: 1fr !important;
            }
            .header-brand-name {
              font-size: 1.5rem !important;
            }
            .btn-nouveau-dossier {
              padding: 0.6rem !important;
              border-radius: 50% !important;
            }
            .btn-nouveau-dossier span {
              display: none !important;
            }
            .espace-personnel-text {
              display: none !important;
            }
            .espace-personnel-btn {
              padding: 0.35rem !important;
            }
            .header-right-actions {
              gap: 0.5rem !important;
            }
          }
        
          @media (max-width: 768px) {
            .folder-actions-wrapper {
              opacity: 1 !important;
              transform: translateY(0) !important;
              background: rgba(255,255,255,0.7);
              padding: 4px;
              border-radius: 99px;
              backdrop-filter: blur(4px);
              box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            }
            .folder-action-btn {
              width: 44px !important;
              height: 44px !important;
            }
          }
    `}} />

      <div className="dashboard-watermark" />

      {/* HEADER - Transparent/Glass White with Red Accent Logo */}
      <header className="premium-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Logo takes original colors, Med is Red by default or we enforce it */}
          <img src="/logo.png" alt="ObsMed Logo" style={{ width: '38px', height: '38px', objectFit: 'contain' }} />
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, whiteSpace: 'nowrap' }}>
            <span className="brand-text" style={{ display: 'flex', alignItems: 'baseline' }}>
              <span className="header-brand-name" style={{ fontFamily: "'Cabin Sketch', cursive", fontSize: '2rem', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '1px' }}>Obs</span>
              <span className="header-brand-name" style={{ fontFamily: "'Dancing Script', cursive", fontSize: '2.2rem', fontWeight: '700', color: 'var(--primary)', marginLeft: '4px' }}>Med</span>
            </span>
          </h1>
        </div>
        
        <div className="header-right-actions" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          
          
          
          <button 
            className="btn btn-nouveau-dossier" 
            onClick={onNewPatient} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '99px', 
              padding: '0.8rem 1.75rem', fontWeight: '600', background: 'var(--primary)', color: '#fff',
              boxShadow: '0 4px 15px rgba(220, 38, 38, 0.25)', transition: 'all 0.3s', border: 'none',
              flexShrink: 0
            }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(220, 38, 38, 0.35)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(220, 38, 38, 0.25)'; }}
          >
            <Plus size={18} strokeWidth={2.5} /> <span>Nouveau Dossier</span>
          </button>

          
          <div 
            className="espace-personnel-btn"
            onClick={() => setIsAccountModalOpen(true)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', 
              padding: '0.35rem 1.25rem 0.35rem 0.35rem', borderRadius: '99px', background: 'var(--surface-bg)',
              border: '1px solid #e2e8f0', transition: 'all 0.3s', flexShrink: 0
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = '#fff'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#f8fafc'; }}
          >
            <AvatarWithBadge url={avatarUrl} plan={currentPlan} size={38} />
            <span className="espace-personnel-text" style={{ fontWeight: '600', fontSize: '0.9rem', color: '#475569' }}>Espace Personnel</span>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 10 }}>
        
        {/* Premium Stat Panels */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem', marginBottom: '4.5rem' }}>
          
          <div className="glass-stat-panel">
            <div>
              <p style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Total des Observations
              </p>
              <h2 style={{ margin: 0, fontSize: '3.5rem', color: 'var(--text-main)', lineHeight: '1', fontFamily: "'Space Grotesk', sans-serif", fontWeight: '800', letterSpacing: '-1px' }}>
                {totalConsults}
              </h2>
            </div>
            <div style={{ width: '70px', height: '70px', borderRadius: '20px', background: 'var(--surface-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', transition: 'border-color 0.4s' }} className="stat-icon-wrapper">
              <Database className="stat-icon" size={28} color="#94a3b8" strokeWidth={1.5} />
            </div>
          </div>
          
          <div className="glass-stat-panel">
            <div>
              <p style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Dynamique Récente
              </p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: '3.5rem', color: 'var(--text-main)', lineHeight: '1', fontFamily: "'Space Grotesk', sans-serif", fontWeight: '800', letterSpacing: '-1px' }}>
                  {activeThisWeek}
                </h2>
                <span className="stat-icon" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontWeight: '600', paddingBottom: '0.6rem', fontSize: '0.9rem' }}>
                  <TrendingUp size={16} strokeWidth={2.5} /> +12% cette semaine
                </span>
              </div>
            </div>
            <div style={{ width: '100px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="gradientTheme" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 35 Q 20 20, 40 30 T 70 15 T 100 5 L 100 40 L 0 40 Z" fill="url(#gradientTheme)" />
                <path d="M0 35 Q 20 20, 40 30 T 70 15 T 100 5" fill="none" className="stat-icon" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="100" cy="5" r="4" fill="#fff" className="stat-icon" stroke="#94a3b8" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>

        {/* Title Area + Search + Filters */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
              Explorateur Clinique
            </h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Search */}
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  placeholder="Nom, motif, diagnostic..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-pro"
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem',
                  background: showFilters ? 'var(--primary)' : '#fff', color: showFilters ? '#fff' : '#475569',
                  border: '1px solid', borderColor: showFilters ? 'var(--primary)' : '#e2e8f0',
                  borderRadius: '14px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', position: 'relative',
                  boxShadow: showFilters ? '0 4px 12px rgba(var(--primary-rgb, 220,38,38), 0.2)' : '0 2px 8px rgba(0,0,0,0.03)',
                }}
                onMouseOver={e => { if (!showFilters) { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}}
                onMouseOut={e => { if (!showFilters) { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}}
              >
                <Filter size={16} strokeWidth={2.5} />
                Filtres
                {activeFiltersCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-6px', right: '-6px',
                    background: showFilters ? '#fff' : 'var(--primary)', color: showFilters ? 'var(--primary)' : '#fff',
                    width: '20px', height: '20px', borderRadius: '50%', fontSize: '0.7rem', fontWeight: '800',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                  }}>
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {/* Stats Button */}
              <button
                onClick={() => setIsStatsOpen(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem',
                  background: 'var(--surface)', color: '#475569', border: '1px solid #e2e8f0',
                  borderRadius: '14px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem',
                  transition: 'all 0.3s', boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}
              >
                <BarChart3 size={16} strokeWidth={2.5} />
                <span className="espace-personnel-text">Stats</span>
              </button>
            </div>
          </div>

          {/* Filter Bar (collapsible) */}
          {showFilters && (
            <div className="animate-fade-in" style={{
              background: 'var(--surface)', borderRadius: '18px', padding: '1.25rem 1.5rem',
              border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
              display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'center',
              marginBottom: '1rem',
            }}>
              {/* Date Filters */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={14} color="#94a3b8" />
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Période</span>
                <div style={{ display: 'flex', background: 'var(--surface-bg)', borderRadius: '10px', padding: '3px', gap: '2px' }}>
                  {[{v:'all',l:'Tout'},{v:'today',l:"Aujourd'hui"},{v:'week',l:'Semaine'},{v:'month',l:'Mois'}].map(f => (
                    <button key={f.v} onClick={() => setDateFilter(f.v)} style={{
                      padding: '0.4rem 0.85rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                      background: dateFilter === f.v ? 'var(--primary)' : 'transparent',
                      color: dateFilter === f.v ? '#fff' : '#64748b',
                      fontWeight: dateFilter === f.v ? '700' : '500', fontSize: '0.85rem',
                      transition: 'all 0.2s',
                    }}>{f.l}</button>
                  ))}
                </div>
              </div>

              {/* Completion Filters */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Check size={14} color="#94a3b8" />
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>État</span>
                <div style={{ display: 'flex', background: 'var(--surface-bg)', borderRadius: '10px', padding: '3px', gap: '2px' }}>
                  {[{v:'all',l:'Tous'},{v:'complete',l:'Complets'},{v:'inprogress',l:'En cours'},{v:'empty',l:'Vides'}].map(f => (
                    <button key={f.v} onClick={() => setCompletionFilter(f.v)} style={{
                      padding: '0.4rem 0.85rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                      background: completionFilter === f.v ? 'var(--primary)' : 'transparent',
                      color: completionFilter === f.v ? '#fff' : '#64748b',
                      fontWeight: completionFilter === f.v ? '700' : '500', fontSize: '0.85rem',
                      transition: 'all 0.2s',
                    }}>{f.l}</button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
                <SortAsc size={14} color="#94a3b8" />
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
                  padding: '0.45rem 0.85rem', borderRadius: '10px', border: '1px solid #e2e8f0',
                  background: 'var(--surface)', color: '#475569', fontWeight: '600', fontSize: '0.85rem',
                  cursor: 'pointer', outline: 'none',
                }}>
                  <option value="recent">Plus récent</option>
                  <option value="oldest">Plus ancien</option>
                  <option value="az">A → Z</option>
                  <option value="za">Z → A</option>
                </select>
              </div>

              {/* Reset */}
              {activeFiltersCount > 0 && (
                <button onClick={() => { setDateFilter('all'); setCompletionFilter('all'); setSortBy('recent'); }} style={{
                  padding: '0.4rem 0.85rem', borderRadius: '8px', border: '1px solid #fca5a5',
                  background: '#fef2f2', color: '#ef4444', fontWeight: '600', fontSize: '0.85rem',
                  cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.3rem',
                }}>
                  <X size={14} /> Réinitialiser
                </button>
              )}
            </div>
          )}

          {/* Results Count */}
          {(search || activeFiltersCount > 0) && (
            <p style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>
              {filteredPatients.length} dossier{filteredPatients.length !== 1 ? 's' : ''} trouvé{filteredPatients.length !== 1 ? 's' : ''}
              {search && <span> pour « <strong style={{ color: 'var(--primary)' }}>{search}</strong> »</span>}
            </p>
          )}
        </div>

        {/* MASTERPIECE FOLDERS GRID / EMPTY STATE */}
        {filteredPatients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)', borderRadius: '24px', border: '1px dashed #cbd5e1' }}>
            {viewMode === 'trash' ? (
              <Trash2 size={64} color="#ef4444" strokeWidth={1} style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
            ) : (
              <Folder size={64} color="#94a3b8" strokeWidth={1} style={{ marginBottom: '1.5rem', opacity: 0.8 }} />
            )}
            
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: '800' }}>
              {viewMode === 'trash' ? 'Corbeille vide' : 'Aucun dossier trouvé'}
            </h3>
            
            <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem auto' }}>
              {viewMode === 'trash' 
                ? "Il n'y a aucun élément dans la corbeille. Les dossiers que vous supprimez apparaîtront ici." 
                : "Commencez par créer votre première observation médicale ou modifiez vos critères de recherche."}
            </p>
            
            {viewMode === 'active' && (
              <button className="btn btn-primary" onClick={onNewPatient} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 2rem', borderRadius: '99px', fontWeight: '600', boxShadow: '0 8px 25px rgba(var(--primary-rgb, 200,0,0), 0.25)' }}>
                <Plus size={18} /> Créer un nouveau dossier
              </button>
            )}
          </div>
        ) : (
          <div className="folders-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '3rem 2.5rem' }}>
          {filteredPatients.map(p => {
            const hasData = p.data?.['motif']?.motif || p.data?.['histoire']?.texte;
            
            return (
              <div key={p.id} className="pro-folder-card" onClick={() => onOpenPatient(p.id)}>
                <div className="folder-back-pro"></div>
                
                {/* Papers */}
                <div className="folder-paper-pro">
                  {hasData ? (
                    <>
                      <div style={{ width: '100%', height: '6px', background: 'var(--surface-bg)', borderRadius: '3px', marginBottom: '14px' }}></div>
                      <div style={{ width: '85%', height: '6px', background: 'var(--surface-bg)', borderRadius: '3px', marginBottom: '14px' }}></div>
                      <div style={{ width: '90%', height: '6px', background: 'var(--surface-bg)', borderRadius: '3px', marginBottom: '14px' }}></div>
                      <div style={{ width: '40%', height: '6px', background: 'var(--surface-bg)', borderRadius: '3px' }}></div>
                      <div style={{ marginTop: 'auto', alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '4px', color: '#cbd5e1', fontSize: '0.7rem', fontWeight: '600' }}>
                        <FileText size={16} strokeWidth={2} /> DONNÉES
                      </div>
                    </>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#cbd5e1', gap: '0.5rem' }}>
                      <File size={32} strokeWidth={1.5} opacity={0.5} />
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', letterSpacing: '1px' }}>VIDE</span>
                    </div>
                  )}
                </div>

                <div className="folder-front-pro">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                    <span className="folder-date-pro">
                      <Clock size={12} strokeWidth={2.5} />
                      {new Date(p.date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  
                  <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontSize: '1.15rem', fontWeight: '800', lineHeight: '1.3', letterSpacing: '-0.3px' }}>
                    {p.data?.['etat-civil']?.nom_prenoms || 'Patient Anonyme'}
                  </h3>
                  
                  {p.data?.['motif']?.motif && (
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '500' }}>
                      {p.data['motif'].motif}
                    </p>
                  )}

                  <div style={{ marginTop: 'auto', alignSelf: 'flex-end', color: 'var(--primary)', opacity: 0, transition: 'all 0.3s', transform: 'translateX(-10px)' }} className="folder-chevron">
                    <ChevronRight size={20} strokeWidth={2.5} />
                    </div>

                    {/* ACTIONS WRAPPER (Accessible, Bottom Right) */}
                    <div className="folder-actions-wrapper">
                      {viewMode === 'active' && onExportPatient && (
                        <button 
                          className="folder-action-btn export-btn"
                          title="Exporter le dossier (.obsmed)"
                          onClick={(e) => { e.stopPropagation(); onExportPatient(p); }}
                        >
                          <Download size={16} strokeWidth={2.5} />
                        </button>
                      )}

                      {viewMode === 'active' && onDuplicatePatient && (
                        <button 
                          className="folder-action-btn duplicate-btn"
                          title="Dupliquer le dossier"
                          onClick={(e) => { e.stopPropagation(); onDuplicatePatient(p); }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </button>
                      )}

                      {viewMode === 'trash' && (
                        <button 
                          className="folder-action-btn restore-btn"
                          title="Restaurer le dossier"
                          onClick={(e) => { e.stopPropagation(); if (onRestorePatient) onRestorePatient(p); }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                        </button>
                      )}

                      <button 
                        className="folder-action-btn delete-btn"
                        title={viewMode === 'trash' ? "Supprimer définitivement" : "Mettre à la corbeille"}
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmAction({
                            message: viewMode === 'trash' ? 'Voulez-vous vraiment supprimer ce dossier DÉFINITIVEMENT ?' : 'Mettre ce dossier à la corbeille ?',
                            onConfirm: () => onDeletePatient(p.patient_id_local || p.id)
                          });
                        }}
                      >
                        <Trash2 size={16} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>

                {/* Delete Button */}
                <button 
                  className="delete-action-btn"
                  title="Supprimer l'observation"
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmAction({
                      message: 'Voulez-vous vraiment supprimer ce dossier ? Cette action est irréversible.',
                      onConfirm: () => onDeletePatient(p.id)
                    });
                  }}
                >
                  <Trash2 size={16} strokeWidth={2.5} />
                </button>
              </div>
            );
          })}
        </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .pro-folder-card:hover .folder-chevron {
          opacity: 1 !important;
          transform: translateX(0) !important;
        }
      `}} />

      {/* Account Modal */}
      {isAccountModalOpen && <AccountModal onClose={() => setIsAccountModalOpen(false)} session={session} currentPlan={currentPlan} onPlanChange={handlePlanChange} />}
      
      {/* Stats Modal */}
      {isStatsOpen && <StatsPanel patients={patients} onClose={() => setIsStatsOpen(false)} />}
    </div>
  );
}
