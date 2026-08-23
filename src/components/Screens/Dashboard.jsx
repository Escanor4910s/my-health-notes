import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Plus, Clock, Search, Folder, User, LogOut, Settings, Camera, CreditCard, X, Edit3, Image as ImageIcon, Check, Loader2, Save, Database, FileText, File, Trash2, TrendingUp, ChevronRight, ChevronLeft, Crown, Shield, Filter, SortAsc, BarChart3, Calendar, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNotification } from '../UI/NotificationSystem';
import StatsPanel from './StatsPanel';

const AvatarWithBadge = ({ url, plan, size = 38 }) => (
  <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
    <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#fff', border: '2px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {url ? <img src={url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={size * 0.5} color="#94a3b8" strokeWidth={1.5} />}
    </div>
    {plan && (
      <div style={{
        position: 'absolute', bottom: '-6px', left: '50%', transform: 'translateX(-50%)',
        background: plan === 'premium' ? 'linear-gradient(135deg, #2563eb, #1e40af)' : 'linear-gradient(135deg, #64748b, #475569)',
        color: '#fff', fontSize: size < 40 ? '8px' : '10px', fontWeight: '800',
        padding: size < 40 ? '2px 6px' : '3px 10px', borderRadius: '12px',
        border: '2px solid #fff', whiteSpace: 'nowrap',
        boxShadow: '0 2px 5px rgba(0,0,0,0.15)', letterSpacing: '0.5px'
      }}>
        {plan === 'premium' ? 'PLUS' : 'STD'}
      </div>
    )}
  </div>
);

const SETTINGS_OPTIONS = {
  language: ['Français', 'English', 'Español'],
  autoSave: ['1 minute', '3 minutes', '5 minutes', 'Désactivé'],
  exportFormat: ['PDF', 'Word', 'JSON', 'Texte Brut'],
};

// --- ACCOUNT MODAL COMPONENT ---
function AccountModal({ onClose, session, currentPlan, onPlanChange }) {
  const [activeTab, setActiveTab] = useState('profil');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [billingCycle, setBillingCycle] = useState('mensuel');
  
  const TABS = [
    { id: 'profil', icon: Edit3, label: 'Profil & Identité' },
    { id: 'photo', icon: Camera, label: 'Photo de profil' },
    { id: 'abonnement', icon: CreditCard, label: 'Abonnement' },
    { id: 'parametres', icon: Settings, label: 'Préférences' },
  ];

  const scrollLeft = () => {
    const idx = TABS.findIndex(t => t.id === activeTab);
    if (idx > 0) setActiveTab(TABS[idx - 1].id);
  };
  const scrollRight = () => {
    const idx = TABS.findIndex(t => t.id === activeTab);
    if (idx < TABS.length - 1) setActiveTab(TABS[idx + 1].id);
  };
  
  const meta = session?.user?.user_metadata || {};
  const [firstName, setFirstName] = useState(meta.first_name || '');
  const [lastName, setLastName] = useState(meta.last_name || '');
  const [university, setUniversity] = useState(meta.university || '');
  const [level, setLevel] = useState(meta.level || '');
  
  const [avatarUrl, setAvatarUrl] = useState(localStorage.getItem('obsmed-avatar') || '');
  const fileInputRef = useRef(null);

  const [language, setLanguage] = useState(localStorage.getItem('obsmed-lang') || 'Français');
  const [autoSave, setAutoSave] = useState(localStorage.getItem('obsmed-autosave') || '3 minutes');
  const [exportFormat, setExportFormat] = useState(localStorage.getItem('obsmed-export') || 'PDF');

  const { notify } = useNotification();

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { first_name: firstName, last_name: lastName, university: university, level: level }
      });
      if (error) throw error;
      notify({ type: 'success', message: 'Profil mis à jour !' });
    } catch (err) {
      notify({ type: 'error', message: 'Erreur: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem('obsmed-lang', language);
    localStorage.setItem('obsmed-autosave', autoSave);
    localStorage.setItem('obsmed-export', exportFormat);
    notify({ type: 'success', message: 'Paramètres enregistrés !' });
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
        localStorage.setItem('obsmed-avatar', reader.result);
        notify({ type: 'success', message: 'Photo mise à jour !' });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
  /* Custom scrollbar for tabs */
  .account-tabs-nav {
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    scrollbar-color: rgba(var(--primary-rgb, 220,38,38), 0.4) transparent;
  }
  .account-tabs-nav::-webkit-scrollbar { height: 4px; }
  .account-tabs-nav::-webkit-scrollbar-track { background: transparent; }
  .account-tabs-nav::-webkit-scrollbar-thumb { background: rgba(var(--primary-rgb, 220,38,38), 0.2); border-radius: 4px; transition: background 0.3s; }
  .account-tabs-nav:hover::-webkit-scrollbar-thumb, .account-tabs-nav:active::-webkit-scrollbar-thumb { background: var(--primary); }

  .mobile-scroll-btn { display: none; }
  .account-tab-btn {
    padding: 1rem 0.5rem; display: flex; align-items: center; gap: 0.5rem;
    background: transparent; border: none; border-bottom: 2px solid transparent; 
    cursor: pointer; white-space: nowrap; font-weight: 600; transition: all 0.2s; font-size: 0.95rem;
  }
  .account-tab-btn.inactive { color: #64748b; }
  .account-tab-btn.active { color: var(--primary); border-bottom: 2px solid var(--primary); font-weight: 700; }

  /* Coverflow Styles */
  .coverflow-scroll-btn {
    display: flex !important; align-items: center !important; justify-content: center !important;
    background: var(--surface-border, #f1f5f9); border: none; border-radius: 50%;
    width: 36px; height: 36px; cursor: pointer; color: #334155; flex-shrink: 0;
    transition: all 0.2s;
  }
  .coverflow-scroll-btn:hover { background: #e2e8f0; }

    /* ===== MOBILE LAYOUT FIXES ===== */
  @media (max-width: 768px) {
    .account-modal-content { 
      width: 95% !important; 
      max-width: 100% !important; 
      height: 90vh !important; /* Fixed height so flex: 1 works */
      max-height: 95vh !important;
      border-radius: 24px !important; 
      margin: auto !important;
    }
    .account-layout { min-height: 0 !important; flex: 1 !important; }
    .account-tabs-wrapper { 
      padding: 0.75rem 0.5rem !important; 
      gap: 0.5rem !important; 
      display: flex !important; 
      align-items: center !important; 
    }
    .coverflow-scroll-btn {
      background: transparent !important; color: #64748b !important;
      width: 30px !important; height: 30px !important;
    }
    .account-body {
      padding: 1.25rem 1rem !important;
      overflow-y: auto !important;
      overflow-x: hidden !important;
    }
    
    /* Modal header: stack title and actions vertically */
    .account-modal-header {
      flex-wrap: wrap !important;
      gap: 0.75rem !important;
      padding: 1rem 1.25rem !important;
    }
    .account-modal-header h2 {
      font-size: 1.15rem !important;
    }
    .account-modal-header .header-actions {
      margin-left: auto !important;
    }
    .account-modal-header .header-actions .logout-pill-btn {
      padding: 0.4rem 0.85rem !important;
      font-size: 0.8rem !important;
    }
    
    /* Subscription cards: single column, smaller */
    .subscription-grid {
      grid-template-columns: 1fr !important;
      gap: 1.25rem !important;
    }
    .subscription-card {
      padding: 1.25rem 1rem !important;
      border-radius: 20px !important;
    }
    .subscription-card h4 {
      font-size: 1.15rem !important;
    }
    .subscription-card p {
      font-size: 0.85rem !important;
    }
    .subscription-card .price-display {
      font-size: 1.75rem !important;
    }
    .subscription-card ul li {
      font-size: 0.9rem !important;
      gap: 0.5rem !important;
    }
    .subscription-card button {
      padding: 0.85rem !important;
      font-size: 0.95rem !important;
    }
    
    /* Profile grid: single column */
    .profile-grid {
      grid-template-columns: 1fr !important;
    }
    
    /* Photo profile: stack vertically */
    .photo-profile-flex {
      flex-direction: column !important;
      align-items: center !important;
      text-align: center !important;
      gap: 1rem !important;
    }
    .photo-profile-flex > div {
      justify-content: center !important;
      flex-wrap: wrap !important;
    }
    
    /* Active subscription card */
    .active-sub-card {
      padding: 1.25rem 1rem !important;
      border-radius: 20px !important;
    }
    .active-sub-card h3 { font-size: 1.15rem !important; }
    .active-sub-header {
      flex-direction: column !important;
      gap: 0.75rem !important;
      align-items: flex-start !important;
    }
    .active-sub-actions {
      flex-direction: column !important;
    }
    .active-sub-actions button {
      width: 100% !important;
      padding: 0.75rem 1rem !important;
      font-size: 0.9rem !important;
    }
    
    /* Billing toggle */
    .billing-toggle-wrapper {
      flex-direction: column !important;
      align-items: center !important;
    }
  }
  
  @media (max-width: 480px) {
    .account-modal-content {
      width: 100% !important;
      max-height: 100vh !important;
      border-radius: 0 !important;
    }
    .account-body {
      padding: 1rem 0.75rem !important;
    }
    .account-body h3 {
      font-size: 1.15rem !important;
    }
  }
      `}} />
      <div className="account-modal-overlay animate-fade-in" onClick={onClose} style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
        backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
      }}>
        <div className="account-modal-content" onClick={e => e.stopPropagation()} style={{
          background: '#ffffff', width: '90%', maxWidth: '1000px', maxHeight: '90vh',
          borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.05)',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}>
          <div className="account-modal-header" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', background: '#fafafa' }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '800', letterSpacing: '-0.5px', minWidth: 0 }}>
              <AvatarWithBadge url={avatarUrl} plan={currentPlan} size={32} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Mon Espace Personnel</span>
            </h2>
            <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
              <button 
                className="logout-pill-btn"
                onClick={() => supabase.auth.signOut()}
                style={{ 
                  background: '#fef2f2', color: '#ef4444', border: '1px solid #fee2e2', borderRadius: '99px',
                  padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                  fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 2px 5px rgba(239, 68, 68, 0.1)', whiteSpace: 'nowrap'
                }}
                onMouseOver={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 15px rgba(239, 68, 68, 0.25)'; e.currentTarget.style.borderColor = '#ef4444'; }}
                onMouseOut={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 5px rgba(239, 68, 68, 0.1)'; e.currentTarget.style.borderColor = '#fee2e2'; }}
              >
                <LogOut size={16} strokeWidth={2.5} /> Déconnexion
              </button>
              <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', color: '#64748b', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0 }} onMouseOver={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = '#fff' }} onMouseOut={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b' }}>
                <X size={18} />
              </button>
            </div>
          </div>
          <div className="account-layout" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <div className="account-tabs-wrapper" style={{ borderBottom: '1px solid #f1f5f9', background: '#fafafa', padding: '1rem 2rem', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <button className="coverflow-scroll-btn left" onClick={scrollLeft} disabled={activeTab === 'profil'} style={{ opacity: activeTab === 'profil' ? 0.3 : 1, zIndex: 20 }}><ChevronLeft size={20} /></button>
                
                <div className="coverflow-container" style={{ position: 'relative', height: '50px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', WebkitMaskImage: 'linear-gradient(to right, transparent, black 15px, black calc(100% - 15px), transparent)', maskImage: 'linear-gradient(to right, transparent, black 15px, black calc(100% - 15px), transparent)' }}>
                  {[
                    { id: 'profil', icon: Edit3, label: 'Profil & Identité' },
                    { id: 'photo', icon: Camera, label: 'Photo de profil' },
                    { id: 'abonnement', icon: CreditCard, label: 'Abonnement' },
                    { id: 'parametres', icon: Settings, label: 'Préférences' },
                  ].map((tab, i, arr) => {
                    const currentIndex = arr.findIndex(t => t.id === activeTab);
                    const diff = i - currentIndex;
                    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
                    const spacing = isMobile ? 140 : 180;
                    const translateX = diff * spacing; 
                    const scale = diff === 0 ? 1 : 0.85;
                    const opacity = diff === 0 ? 1 : Math.max(1 - Math.abs(diff) * 0.4, 0.2);
                    const blur = diff === 0 ? 0 : 2;
                    const zIndex = 10 - Math.abs(diff);
                    const TabIcon = tab.icon;
                    return (
                      <button 
                         key={tab.id} 
                         onClick={() => setActiveTab(tab.id)}
                         className="coverflow-tab-pill"
                         style={{
                             position: 'absolute', transform: `translateX(${translateX}px) scale(${scale})`, opacity, filter: `blur(${blur}px)`, zIndex, transition: 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)', padding: '0.65rem 1.25rem', 
                             background: diff === 0 ? 'var(--primary)' : '#fff', 
                             color: diff === 0 ? '#fff' : '#475569', 
                             border: '1px solid', 
                             borderColor: diff === 0 ? 'var(--primary)' : '#e2e8f0', 
                             borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '0.4rem', 
                             fontWeight: diff === 0 ? '700' : '500', whiteSpace: 'nowrap', cursor: 'pointer', 
                             fontSize: '0.9rem',
                             boxShadow: diff === 0 ? '0 4px 15px rgba(var(--primary-rgb, 220,38,38),0.3)' : '0 2px 5px rgba(0,0,0,0.05)'
                         }}
                      >
                        <TabIcon size={15} strokeWidth={diff === 0 ? 2.5 : 2} /> {tab.label}
                      </button>
                    )
                  })}
                </div>

                <button className="coverflow-scroll-btn right" onClick={scrollRight} disabled={activeTab === 'parametres'} style={{ opacity: activeTab === 'parametres' ? 0.3 : 1, zIndex: 20 }}><ChevronRight size={20} /></button>
              </div>

            <div className="account-body" style={{ flex: 1, padding: '2.5rem', overflowY: 'auto', overflowX: 'hidden', background: '#ffffff' }}>


              {activeTab === 'profil' && (
                <div className="animate-fade-in">
                  <h3 style={{ margin: '0 0 2.5rem 0', color: 'var(--primary)', fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.25px' }}>Informations Personnelles</h3>
                  <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.95rem', fontWeight: '700', color: '#334155' }}>Prénom</label>
                      <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} style={{ width: '100%', padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', outline: 'none', transition: 'all 0.3s', fontSize: '1.05rem', color: '#0f172a', fontWeight: '500', background: '#f8fafc', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }} onFocus={e => {e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 4px rgba(var(--primary-rgb, 220,38,38), 0.1)'; e.target.style.background = '#fff'}} onBlur={e => {e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)'; e.target.style.background = '#f8fafc'}} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.95rem', fontWeight: '700', color: '#334155' }}>Nom</label>
                      <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} style={{ width: '100%', padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', outline: 'none', transition: 'all 0.3s', fontSize: '1.05rem', color: '#0f172a', fontWeight: '500', background: '#f8fafc', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }} onFocus={e => {e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 4px rgba(var(--primary-rgb, 220,38,38), 0.1)'; e.target.style.background = '#fff'}} onBlur={e => {e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)'; e.target.style.background = '#f8fafc'}} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.95rem', fontWeight: '700', color: '#334155' }}>Structure Médicale / Faculté</label>
                      <input type="text" value={university} onChange={e => setUniversity(e.target.value)} style={{ width: '100%', padding: '1rem 1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', outline: 'none', transition: 'all 0.3s', fontSize: '1.05rem', color: '#0f172a', fontWeight: '500', background: '#f8fafc', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }} onFocus={e => {e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 4px rgba(var(--primary-rgb, 220,38,38), 0.1)'; e.target.style.background = '#fff'}} onBlur={e => {e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)'; e.target.style.background = '#f8fafc'}} />
                    </div>
                  </div>
                  <button className="btn btn-primary" onClick={handleSaveProfile} disabled={loading} style={{ marginTop: '3rem', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 2.5rem', borderRadius: '99px', fontWeight: '700', fontSize: '1.05rem', boxShadow: '0 8px 20px rgba(var(--primary-rgb, 220, 38, 38), 0.25)', transition: 'all 0.3s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />} Enregistrer les modifications
                  </button>
                </div>
              )}
              
              {activeTab === 'photo' && (
                <div className="animate-fade-in" style={{ padding: '0 1rem' }}>
                  <h3 style={{ margin: '0 0 1.5rem 0', color: '#0f172a', fontSize: '1.35rem', fontWeight: '800' }}>Identité Visuelle</h3>
                  <div className="photo-profile-flex" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', background: '#fff', padding: '2rem', borderRadius: '20px', border: '1px solid #f1f5f9' }}>
                    <AvatarWithBadge url={avatarUrl} plan={currentPlan} size={140} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Format PNG ou JPG. Max 5MB.</p>
                      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarUpload} style={{ display: 'none' }} />
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn btn-primary" onClick={() => fileInputRef.current.click()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '99px', padding: '0.6rem 1.5rem' }}>
                          <ImageIcon size={18} /> Télécharger
                        </button>
                        {avatarUrl && (
                          <button onClick={() => { setAvatarUrl(''); localStorage.removeItem('obsmed-avatar'); }} style={{ background: '#f1f5f9', border: 'none', color: '#475569', cursor: 'pointer', borderRadius: '99px', padding: '0.6rem 1.5rem', fontWeight: '500', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.color = '#ef4444'} onMouseOut={e => e.currentTarget.style.color = '#475569'}>
                            Retirer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'parametres' && (
                <div className="animate-fade-in">
                  <h3 style={{ margin: '0 0 2rem 0', color: '#0f172a', fontSize: '1.2rem', fontWeight: '700' }}>Préférences Système</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '400px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>Sauvegarde Automatique</label>
                      <select value={autoSave} onChange={e => setAutoSave(e.target.value)} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', cursor: 'pointer', background: '#fff' }}>
                        {SETTINGS_OPTIONS.autoSave.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>Format d'exportation par défaut</label>
                      <select value={exportFormat} onChange={e => setExportFormat(e.target.value)} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', cursor: 'pointer', background: '#fff' }}>
                        {SETTINGS_OPTIONS.exportFormat.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <button className="btn btn-primary" onClick={handleSaveSettings} style={{ marginTop: '1rem', width: 'fit-content', borderRadius: '99px', padding: '0.75rem 2rem' }}>
                      Enregistrer
                    </button>
                  </div>
                </div>
              )}
              
              {activeTab === 'abonnement' && (
                <div className="animate-fade-in" style={{ padding: '0', position: 'relative' }}>
                  {currentPlan ? (
                    <div className="active-sub-card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '2.5rem', marginBottom: '2.5rem', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
                      <div className="active-sub-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                          <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.6rem', fontWeight: '800' }}>Votre Abonnement</h3>
                          <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>Vous êtes actuellement abonné au plan <strong style={{ color: currentPlan === 'premium' ? 'var(--primary)' : '#0f172a' }}>{currentPlan === 'premium' ? 'Premium' : 'Standard'}</strong>.</p>
                        </div>
                        <div style={{ background: currentPlan === 'premium' ? '#fef2f2' : '#f8fafc', color: currentPlan === 'premium' ? 'var(--primary)' : '#475569', padding: '0.75rem 1.5rem', borderRadius: '99px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
                          {currentPlan === 'premium' ? <Crown size={20} /> : <Shield size={20} />}
                          Plan Actif
                        </div>
                      </div>

                      {/* Jauge / ProgressBar */}
                      <div style={{ marginBottom: '2.5rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
                          <span style={{ fontWeight: '700', color: '#0f172a' }}>Jours restants</span>
                          <span style={{ fontWeight: '800', fontSize: '1.25rem', color: currentPlan === 'premium' ? 'var(--primary)' : '#0f172a' }}>12 <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>/ 30</span></span>
                        </div>
                        <div style={{ height: '8px', width: '100%', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                          <div style={{ width: '40%', height: '100%', background: currentPlan === 'premium' ? 'linear-gradient(90deg, #ef4444, #b91c1c)' : '#0f172a', borderRadius: '99px', transition: 'width 1s ease-in-out' }}></div>
                        </div>
                        <p style={{ margin: '0.75rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>Prochain prélèvement le 15 Septembre 2026.</p>
                      </div>

                      <div className="active-sub-actions" style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => onPlanChange(null)} style={{ padding: '0.85rem 1.5rem', background: '#fff', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '99px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', flex: 1 }} onMouseOver={e => e.currentTarget.style.background = '#fef2f2'} onMouseOut={e => e.currentTarget.style.background = '#fff'}>
                          Résilier l'abonnement
                        </button>
                        <button onClick={() => onPlanChange(currentPlan === 'premium' ? 'standard' : 'premium')} style={{ padding: '0.85rem 1.5rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '99px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', flex: 1 }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
                          Changer de plan
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Premium Background Glow */}
                      <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '80%', height: '300px', background: 'radial-gradient(ellipse at top, rgba(var(--primary-rgb, 220,38,38), 0.15), transparent 70%)', pointerEvents: 'none', zIndex: 0 }}></div>
                      
                      <div style={{ textAlign: 'center', marginBottom: '2.5rem', position: 'relative', zIndex: 1 }}>
                        <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '2rem', fontWeight: '900', letterSpacing: '-0.75px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                          <span style={{ background: 'linear-gradient(135deg, #0f172a, #334155)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Choisissez votre plan</span>
                        </h3>
                        <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: '0.35rem', borderRadius: '99px', alignItems: 'center', gap: '0.5rem' }}>
                          <button onClick={() => setBillingCycle('mensuel')} style={{ padding: '0.5rem 1.5rem', border: 'none', borderRadius: '99px', background: billingCycle === 'mensuel' ? '#fff' : 'transparent', color: billingCycle === 'mensuel' ? '#0f172a' : '#64748b', fontWeight: billingCycle === 'mensuel' ? '700' : '500', cursor: 'pointer', boxShadow: billingCycle === 'mensuel' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.3s' }}>
                            Mensuel
                          </button>
                          <button onClick={() => setBillingCycle('annuel')} style={{ padding: '0.5rem 1.5rem', border: 'none', borderRadius: '99px', background: billingCycle === 'annuel' ? '#fff' : 'transparent', color: billingCycle === 'annuel' ? '#0f172a' : '#64748b', fontWeight: billingCycle === 'annuel' ? '700' : '500', cursor: 'pointer', boxShadow: billingCycle === 'annuel' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.3s', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            Annuel <span style={{ background: '#fee2e2', color: '#ef4444', padding: '2px 6px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800' }}>-20%</span>
                          </button>
                        </div>
                      </div>
                      
                      <div className="subscription-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '2.5rem', position: 'relative', zIndex: 1 }}>
                        
                        {/* Formule Standard */}
                        <div className="subscription-card" style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '32px', padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', position: 'relative', transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)', cursor: 'pointer', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)' }} onMouseOver={e => {e.currentTarget.style.transform='translateY(-12px)'; e.currentTarget.style.boxShadow='0 30px 60px -15px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor='var(--primary)'}} onMouseOut={e => {e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 10px 30px -10px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor='#e2e8f0'}}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div>
                              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#0f172a', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                Standard
                              </h4>
                              <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>L'essentiel pour démarrer.</p>
                            </div>
                            <div style={{ color: '#94a3b8' }}><Shield size={28} strokeWidth={1.5} /></div>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '2.5rem' }}>
                            <span style={{ fontSize: '3rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-2px', whiteSpace: 'nowrap', lineHeight: '1' }}>{billingCycle === 'annuel' ? '1 600' : '2 000'}</span>
                            <span style={{ color: '#64748b', fontWeight: '600', whiteSpace: 'nowrap' }}>FCFA / mois</span>
                          </div>
                          
                          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 3rem 0', display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
                            {['Création de dossiers illimitée', 'Sauvegarde cloud sécurisée', 'Export PDF & Word', 'Catalogue de base'].map((item, i) => (
                              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', color: '#475569', fontSize: '1.05rem', lineHeight: '1.5' }}>
                                <div style={{ color: '#fff', flexShrink: 0, marginTop: '2px', background: 'var(--primary)', padding: '4px', borderRadius: '50%' }}><Check size={14} strokeWidth={3} /></div>
                                {item}
                              </li>
                            ))}
                          </ul>
                          
                          <button onClick={() => onPlanChange('standard')} style={{ width: '100%', background: '#f8fafc', color: '#0f172a', border: '1px solid #e2e8f0', padding: '1.25rem', borderRadius: '99px', fontSize: '1.1rem', fontWeight: '700', cursor: 'pointer', transition: 'all 0.4s', marginTop: 'auto', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }} onMouseOver={e => {e.currentTarget.style.background='#0f172a'; e.currentTarget.style.color='#fff'; e.currentTarget.style.borderColor='#0f172a'; e.currentTarget.style.transform='scale(1.02)'; e.currentTarget.style.boxShadow='0 12px 20px -5px rgba(0,0,0,0.15)'}} onMouseOut={e => {e.currentTarget.style.background='#f8fafc'; e.currentTarget.style.color='#0f172a'; e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='0 4px 6px -1px rgba(0, 0, 0, 0.05)'}}>
                            S'abonner
                          </button>
                        </div>
    
                        {/* Formule Premium */}
                        <div className="subscription-card" style={{ background: '#0f172a', borderRadius: '32px', padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', position: 'relative', transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)', cursor: 'pointer', zIndex: 1, boxShadow: '0 25px 50px -12px rgba(var(--primary-rgb, 220,38,38), 0.3)' }} onMouseOver={e => {e.currentTarget.style.transform='translateY(-12px)'; e.currentTarget.style.boxShadow='0 40px 80px -15px rgba(var(--primary-rgb, 220,38,38), 0.4)'}} onMouseOut={e => {e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 25px 50px -12px rgba(var(--primary-rgb, 220,38,38), 0.3)'}}>
                          
                          {/* Premium Glow effect */}
                          <div style={{ position: 'absolute', inset: 0, borderRadius: '32px', border: '2px solid rgba(255,255,255,0.1)', pointerEvents: 'none', zIndex: 1 }}></div>
                          <div style={{ position: 'absolute', top: 0, left: '20%', width: '60%', height: '1px', background: 'linear-gradient(90deg, transparent, var(--primary), transparent)', opacity: 0.8 }}></div>
    
                          <div style={{ position: 'absolute', top: '-16px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, var(--primary), #ef4444)', color: '#fff', fontSize: '0.85rem', fontWeight: '800', padding: '0.5rem 1.5rem', borderRadius: '99px', letterSpacing: '1px', boxShadow: '0 4px 15px rgba(var(--primary-rgb, 220,38,38), 0.4)', whiteSpace: 'nowrap', zIndex: 2, textTransform: 'uppercase' }}>
                            Recommandé
                          </div>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div>
                              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#fff', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                Premium
                              </h4>
                              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem' }}>Le choix des pros.</p>
                            </div>
                            <div style={{ color: '#fff' }}><Crown size={28} strokeWidth={2} /></div>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '2.5rem' }}>
                            <span className="price-display" style={{ fontSize: '3rem', fontWeight: '800', color: '#fff', letterSpacing: '-2px', whiteSpace: 'nowrap', lineHeight: '1' }}>{billingCycle === 'annuel' ? '4 000' : '5 000'}</span>
                            <span style={{ color: '#94a3b8', fontWeight: '600', whiteSpace: 'nowrap' }}>FCFA / mois</span>
                          </div>
                          
                          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 3rem 0', display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
                            {['Tout de la formule Standard', "Synthèse automatisée par l'IA", 'Aperçu clinique intelligent avancé', "Support prioritaire 24/7"].map((item, i) => (
                              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', color: '#e2e8f0', fontSize: '1.05rem', lineHeight: '1.5', fontWeight: i > 0 ? '700' : '500' }}>
                                <div style={{ color: '#fff', flexShrink: 0, marginTop: '2px', background: 'linear-gradient(135deg, var(--primary), #ef4444)', padding: '4px', borderRadius: '50%', boxShadow: '0 2px 10px rgba(var(--primary-rgb, 220,38,38), 0.4)' }}><Check size={14} strokeWidth={4} /></div>
                                {item}
                              </li>
                            ))}
                          </ul>
                          
                          <button onClick={() => onPlanChange('premium')} style={{ width: '100%', background: 'linear-gradient(135deg, var(--primary), #ef4444)', color: '#fff', border: 'none', padding: '1.25rem', borderRadius: '99px', fontSize: '1.1rem', fontWeight: '800', cursor: 'pointer', transition: 'all 0.3s', marginTop: 'auto', boxShadow: '0 8px 25px rgba(var(--primary-rgb, 220,38,38), 0.3)' }} onMouseOver={e => {e.currentTarget.style.transform='scale(1.02)'; e.currentTarget.style.boxShadow='0 12px 30px rgba(var(--primary-rgb, 220,38,38), 0.5)'}} onMouseOut={e => {e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.boxShadow='0 8px 25px rgba(var(--primary-rgb, 220,38,38), 0.3)'}}>
                            S'abonner
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            </div>
            
          </div>
        </div>
      </>
  );
}

// --- MAIN DASHBOARD COMPONENT ---
export default function Dashboard({ patients, onOpenPatient, onNewPatient, onDeletePatient }) {
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [completionFilter, setCompletionFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);
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
      background: 'linear-gradient(135deg, #f4f6f9 0%, #e2e8f0 100%)',
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
          background: #ffffff;
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
          background: #f1f5f9;
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
          background: #f1f5f9;
          border-radius: 12px 12px 0 0;
          border: 1px solid #e2e8f0;
          border-bottom: none;
        }

        /* Inner Papers - Pure White */
        .folder-paper-pro {
          position: absolute;
          bottom: 12px; left: 12px; right: 12px;
          height: 205px;
          background: #ffffff;
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
          background: #ffffff;
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
          background: #f8fafc;
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

        /* The Delete Button - Minimalist */
        .delete-action-btn {
          position: absolute;
          bottom: 1rem; right: 1rem;
          background: #fff;
          border: 1px solid #e2e8f0;
          color: #94a3b8;
          border-radius: 50%;
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
          z-index: 20;
          opacity: 0;
          transform: translateY(10px);
        }
        .pro-folder-card:hover .delete-action-btn {
          opacity: 1;
          transform: translateY(0);
        }
        .delete-action-btn:hover {
          background: #ef4444;
          color: #fff;
          border-color: #ef4444;
          transform: scale(1.1);
        }

        /* Smooth Search Input */
        .search-pro {
          width: 350px;
          padding: 0.85rem 1.25rem 0.85rem 3rem;
          border-radius: 99px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          font-size: 0.95rem;
          color: #0f172a;
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
        `}} />

      <div className="dashboard-watermark" />

      {/* HEADER - Transparent/Glass White with Red Accent Logo */}
      <header className="premium-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Logo takes original colors, Med is Red by default or we enforce it */}
          <img src="/logo.png" alt="ObsMed Logo" style={{ width: '38px', height: '38px', objectFit: 'contain' }} />
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, whiteSpace: 'nowrap' }}>
            <span className="brand-text" style={{ display: 'flex', alignItems: 'baseline' }}>
              <span className="header-brand-name" style={{ fontFamily: "'Cabin Sketch', cursive", fontSize: '2rem', fontWeight: '700', color: '#0f172a', letterSpacing: '1px' }}>Obs</span>
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
              padding: '0.35rem 1.25rem 0.35rem 0.35rem', borderRadius: '99px', background: '#f8fafc',
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
              <h2 style={{ margin: 0, fontSize: '3.5rem', color: '#0f172a', lineHeight: '1', fontFamily: "'Space Grotesk', sans-serif", fontWeight: '800', letterSpacing: '-1px' }}>
                {totalConsults}
              </h2>
            </div>
            <div style={{ width: '70px', height: '70px', borderRadius: '20px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', transition: 'border-color 0.4s' }} className="stat-icon-wrapper">
              <Database className="stat-icon" size={28} color="#94a3b8" strokeWidth={1.5} />
            </div>
          </div>
          
          <div className="glass-stat-panel">
            <div>
              <p style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Dynamique Récente
              </p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: '3.5rem', color: '#0f172a', lineHeight: '1', fontFamily: "'Space Grotesk', sans-serif", fontWeight: '800', letterSpacing: '-1px' }}>
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
            <h2 style={{ margin: 0, fontSize: '1.8rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
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
                  background: '#fff', color: '#475569', border: '1px solid #e2e8f0',
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
              background: '#fff', borderRadius: '18px', padding: '1.25rem 1.5rem',
              border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
              display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'center',
              marginBottom: '1rem',
            }}>
              {/* Date Filters */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={14} color="#94a3b8" />
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Période</span>
                <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '10px', padding: '3px', gap: '2px' }}>
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
                <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '10px', padding: '3px', gap: '2px' }}>
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
                  background: '#fff', color: '#475569', fontWeight: '600', fontSize: '0.85rem',
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
            <Folder size={64} color="#94a3b8" strokeWidth={1} style={{ marginBottom: '1.5rem', opacity: 0.8 }} />
            <h3 style={{ margin: '0 0 1rem 0', color: '#0f172a', fontSize: '1.5rem', fontWeight: '800' }}>Aucun dossier trouvé</h3>
            <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem auto' }}>Commencez par créer votre première observation médicale ou modifiez vos critères de recherche.</p>
            <button className="btn btn-primary" onClick={onNewPatient} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 2rem', borderRadius: '99px', fontWeight: '600', boxShadow: '0 8px 25px rgba(var(--primary-rgb, 200,0,0), 0.25)' }}>
              <Plus size={18} /> Créer un nouveau dossier
            </button>
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
                      <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px', marginBottom: '14px' }}></div>
                      <div style={{ width: '85%', height: '6px', background: '#f1f5f9', borderRadius: '3px', marginBottom: '14px' }}></div>
                      <div style={{ width: '90%', height: '6px', background: '#f1f5f9', borderRadius: '3px', marginBottom: '14px' }}></div>
                      <div style={{ width: '40%', height: '6px', background: '#f1f5f9', borderRadius: '3px' }}></div>
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
                  
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.15rem', fontWeight: '800', lineHeight: '1.3', letterSpacing: '-0.3px' }}>
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
