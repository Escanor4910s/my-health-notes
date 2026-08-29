import React, { useState, useEffect, useRef } from 'react';
import { User, Building2, Keyboard, Globe, Save, ArrowLeft, Upload, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { useNotification } from '../UI/NotificationSystem';

import { getInstitutionSettings, saveInstitutionSettings } from '../../lib/institution';

export default function SettingsScreen({ onBack }) {
  const [activeTab, setActiveTab] = useState('profil');
  const [settings, setSettings] = useState({
    doctorName: '',
    specialty: '',
    etablissement: '',
    clinicPhone: '',
    clinicAddress: '',
    clinicLogo: '',
    language: 'fr'
  });
  const fileInputRef = useRef(null);
  const { notify } = useNotification();

  useEffect(() => {
    setSettings(getInstitutionSettings());
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, clinicLogo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const saveSettings = () => {
    saveInstitutionSettings(settings);
    notify({ type: 'success', message: 'Paramètres sauvegardés avec succès.' });
  };

  return (
    <div className="dashboard-layout animate-fade-in" style={{ height: '100vh', overflowY: 'auto', background: 'var(--bg-main)' }}>
      
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={onBack} className="btn" style={{ padding: '0.6rem', borderRadius: '50%' }}>
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: '2rem', color: 'var(--text-main)' }}>Paramètres</h1>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>Personnalisez votre expérience et vos documents</p>
            </div>
          </div>
          <button onClick={saveSettings} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Save size={18} /> Enregistrer
          </button>
        </div>

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          
          {/* Sidebar Menu */}
          <div style={{ flex: '0 0 250px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <TabButton active={activeTab === 'profil'} onClick={() => setActiveTab('profil')} icon={<User size={18} />} label="Profil & Structure" />
            <TabButton active={activeTab === 'raccourcis'} onClick={() => setActiveTab('raccourcis')} icon={<Keyboard size={18} />} label="Raccourcis Clavier" />
            <TabButton active={activeTab === 'langue'} onClick={() => setActiveTab('langue')} icon={<Globe size={18} />} label="Langue & i18n" />
          </div>

          {/* Content Area */}
          <div style={{ flex: '1', minWidth: '300px', background: 'var(--surface)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--surface-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            
            {activeTab === 'profil' && (
              <div className="animate-fade-in">
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-main)', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
                  Informations du Médecin
                </h3>
                <div style={{ display: 'grid', gap: '1.25rem', marginBottom: '3rem' }}>
                  <InputGroup label="Nom complet (avec titre)" name="doctorName" value={settings.doctorName} onChange={handleChange} placeholder="Dr. Jean Dupont" />
                  <InputGroup label="Spécialité" name="specialty" value={settings.specialty} onChange={handleChange} placeholder="Chirurgie Générale" />
                </div>

                <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-main)', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
                  Profil de la Structure (Clinique/Hôpital)
                </h3>
                <div style={{ display: 'grid', gap: '1.25rem' }}>
                  <InputGroup label="Nom de l'établissement" name="etablissement" value={settings.etablissement} onChange={handleChange} placeholder="Hôpital Central" />
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Logo de l'établissement (utilisé pour les exports)
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '80px', height: '80px', borderRadius: '12px', border: '1px dashed var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--beige-light)', overflow: 'hidden' }}>
                        {settings.clinicLogo ? (
                          <img src={settings.clinicLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                          <ImageIcon size={24} color="var(--text-light)" />
                        )}
                      </div>
                      <button onClick={() => fileInputRef.current.click()} className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Upload size={16} /> Choisir une image
                      </button>
                      {settings.clinicLogo && (
                        <button onClick={() => setSettings(prev => ({...prev, clinicLogo: ''}))} className="btn" style={{ color: 'var(--danger)' }}>
                          Supprimer
                        </button>
                      )}
                      <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" style={{ display: 'none' }} />
                    </div>
                  </div>

                  <InputGroup label="Téléphone" name="clinicPhone" value={settings.clinicPhone} onChange={handleChange} placeholder="+33 1 23 45 67 89" />
                  <InputGroup label="Adresse complète" name="clinicAddress" value={settings.clinicAddress} onChange={handleChange} placeholder="123 Rue de la Santé, 75000 Paris" />
                </div>
              </div>
            )}

            {activeTab === 'raccourcis' && (
              <div className="animate-fade-in">
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-main)', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
                  Raccourcis Clavier
                </h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  Les raccourcis sont actifs en Mode Éditeur pour accélérer votre saisie.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <ShortcutRow label="Ouvrir la palette de commandes" shortcut="Ctrl + K" />
                  <ShortcutRow label="Sauvegarder le dossier" shortcut="Ctrl + S" />
                  <ShortcutRow label="Passer à la section suivante" shortcut="Alt + Droite" />
                  <ShortcutRow label="Passer à la section précédente" shortcut="Alt + Gauche" />
                  <ShortcutRow label="Basculer le Mode Focus" shortcut="Ctrl + Maj + F" />
                </div>
                <div style={{ marginTop: '2rem', padding: '1rem', background: '#e0f2fe', color: '#0369a1', borderRadius: '8px', fontSize: '0.9rem' }}>
                  La personnalisation des touches sera disponible dans une prochaine mise à jour.
                </div>
              </div>
            )}

            {activeTab === 'langue' && (
              <div className="animate-fade-in">
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-main)', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
                  Préférences de Langue
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: settings.language === 'fr' ? 'var(--beige-light)' : 'transparent', border: '1px solid', borderColor: settings.language === 'fr' ? 'var(--primary)' : 'var(--surface-border)', borderRadius: '12px', cursor: 'pointer' }}>
                    <input type="radio" name="language" value="fr" checked={settings.language === 'fr'} onChange={handleChange} style={{ width: '1.2rem', height: '1.2rem' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>Français</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Langue par défaut</div>
                    </div>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: settings.language === 'en' ? 'var(--beige-light)' : 'transparent', border: '1px solid', borderColor: settings.language === 'en' ? 'var(--primary)' : 'var(--surface-border)', borderRadius: '12px', cursor: 'pointer' }}>
                    <input type="radio" name="language" value="en" checked={settings.language === 'en'} onChange={handleChange} style={{ width: '1.2rem', height: '1.2rem' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>English (Beta)</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Traduction partielle de l'interface</div>
                    </div>
                  </label>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem',
      width: '100%', textAlign: 'left', borderRadius: '12px', border: 'none',
      background: active ? 'var(--primary)' : 'transparent',
      color: active ? '#fff' : 'var(--text-main)',
      fontWeight: '500', fontSize: '0.95rem', cursor: 'pointer',
      transition: 'all 0.2s ease'
    }}
  >
    {icon} {label}
  </button>
);

const InputGroup = ({ label, name, value, onChange, placeholder }) => (
  <div>
    <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '500' }}>
      {label}
    </label>
    <input
      type="text"
      name={name}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: '100%', padding: '0.8rem 1rem', borderRadius: '10px',
        border: '1px solid var(--surface-border)', background: 'var(--bg-main)',
        color: 'var(--text-main)', fontSize: '1rem', outline: 'none'
      }}
    />
  </div>
);

const ShortcutRow = ({ label, shortcut }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--surface-border)' }}>
    <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{label}</span>
    <kbd style={{ background: 'var(--surface)', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid var(--surface-border)', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
      {shortcut}
    </kbd>
  </div>
);
