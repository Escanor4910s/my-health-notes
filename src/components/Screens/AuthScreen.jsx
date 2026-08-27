import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { User, Lock, Loader2, ArrowRight, UserCircle, Building2, GraduationCap } from 'lucide-react';
import './AuthScreen.css';
import { useNotification } from '../UI/NotificationSystem';

export default function AuthScreen({ onLoginSuccess }) {
  const { notify } = useNotification();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resetSent, setResetSent] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [university, setUniversity] = useState('');
  const [level, setLevel] = useState('');

  const getPasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 8) strength += 25;
    if (/[A-Z]/.test(pass)) strength += 25;
    if (/[0-9]/.test(pass)) strength += 25;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 25;
    return strength;
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("Veuillez saisir votre adresse e-mail pour réinitialiser le mot de passe.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setResetSent(true);
      notify({ type: 'success', message: 'Lien de réinitialisation envoyé par e-mail.' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        if (password.length < 8) {
          throw new Error("Le mot de passe doit contenir au moins 8 caractères.");
        }
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              university: university,
              level: level
            }
          }
        });
        if (error) throw error;
        notify({ type: 'success', message: 'Compte créé avec succès ! Vous pouvez maintenant vous connecter.' });
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setError(null);
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setUniversity('');
    setLevel('');
  }

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  }

  return (
    <div className="auth-master-container">
      
      {/* SIMPLIFIED BACKGROUND SYSTEM - ONLY PHASE 1 TO KEEP UX CLEAN */}
      <div className="bg-system">
        <div className="bg-phase bg-layer-tribal">
          <div className="faint-layer"></div>
          <div className="draw-layer draw-anim-sweep"></div>
        </div>
      </div>

      {/* NON-RIGID, ELEGANT MODAL WITH BRANDED ANIMATED BORDER */}
      <div className={`auth-modal-wrapper ${!isLogin ? 'signup-mode' : ''}`}>
        
        {/* New Circular Motif (media_1787068433370.jpg) as Watermark */}
        <div className="modal-motif-container">
          <div className="motif-watermark"></div>
        </div>

        <div className="auth-modal-content">
          
          {/* WOW EFFECT 3D CUBE ANIMATION WITH DUAL-FONT LOGO TEXT */}
          <div className={`logo-text-anim-container ${!isLogin ? 'small-cube' : ''}`}>
            <div className="cube-spinner">
              <div className="cube-face face-front">
                <img src="/logo.png" alt="Logo" className="cube-logo" />
              </div>
              <div className="cube-face face-bottom">
                <div className="cube-text" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', background: 'transparent', whiteSpace: 'nowrap' }}>
                  <span style={{ fontFamily: "'Cabin Sketch', cursive", fontSize: '2.5rem', fontWeight: '700', color: '#111', letterSpacing: '1px' }}>Obs</span>
                  <span style={{ fontFamily: "'Dancing Script', cursive", fontSize: '2.8rem', fontWeight: '700', color: 'var(--primary)', marginLeft: '2px' }}>Med</span>
                </div>
              </div>
            </div>
          </div>

          {error && <div className="auth-error-alert">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form-elements">
            
            {!isLogin && (
              <div className="signup-grid">
                <div className="input-group">
                  <label>Prénom</label>
                  <div className="input-field-wrapper">
                    <UserCircle className="input-icon" size={18} />
                    <input 
                      type="text" 
                      value={firstName} 
                      onChange={e => setFirstName(e.target.value)} 
                      placeholder="Jean" 
                      required={!isLogin} 
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Nom</label>
                  <div className="input-field-wrapper">
                    <UserCircle className="input-icon" size={18} />
                    <input 
                      type="text" 
                      value={lastName} 
                      onChange={e => setLastName(e.target.value)} 
                      placeholder="Dupont" 
                      required={!isLogin} 
                    />
                  </div>
                </div>

                <div className="input-group full-width">
                  <label>Faculté de Médecine</label>
                  <div className="input-field-wrapper">
                    <Building2 className="input-icon" size={18} />
                    <input 
                      type="text" 
                      value={university} 
                      onChange={e => setUniversity(e.target.value)} 
                      placeholder="Ex: FMPOS, Paris Descartes..." 
                      required={!isLogin} 
                    />
                  </div>
                </div>

                <div className="input-group full-width">
                  <label>Niveau / Année d'étude</label>
                  <div className="input-field-wrapper select-wrapper">
                    <GraduationCap className="input-icon" size={18} />
                    <select 
                      value={level} 
                      onChange={e => setLevel(e.target.value)} 
                      required={!isLogin}
                      className="auth-select"
                    >
                      <option value="" disabled>Sélectionnez votre niveau</option>
                      <option value="PCEM2 / DFGSM2">2ème année (DFGSM2)</option>
                      <option value="DCEM1 / DFGSM3">3ème année (DFGSM3)</option>
                      <option value="DCEM2 / DFASM1">4ème année (DFASM1)</option>
                      <option value="DCEM3 / DFASM2">5ème année (DFASM2)</option>
                      <option value="DCEM4 / DFASM3">6ème année (DFASM3)</option>
                      <option value="Interne">Interne des hôpitaux</option>
                      <option value="Docteur">Docteur en Médecine</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="input-group">
              <label>Email professionnel</label>
              <div className="input-field-wrapper">
                <User className="input-icon" size={18} />
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="docteur@hopital.fr" 
                  required 
                />
              </div>
            </div>
            
            <div className="input-group">
              <label>Mot de passe</label>
              <div className="input-field-wrapper">
                <Lock className="input-icon" size={18} />
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                  minLength={8}
                />
              </div>
              {!isLogin && password && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ height: '4px', width: '100%', background: 'var(--surface-border)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ 
                      height: '100%', 
                      width: `${getPasswordStrength(password)}%`, 
                      background: getPasswordStrength(password) < 50 ? '#ef4444' : getPasswordStrength(password) < 75 ? '#f59e0b' : '#10b981',
                      transition: 'all 0.3s'
                    }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {getPasswordStrength(password) < 50 ? 'Faible' : getPasswordStrength(password) < 75 ? 'Moyen' : 'Fort'} (8 caractères min.)
                  </span>
                </div>
              )}
            </div>
            
            <button type="submit" className="btn-primary-auth dashboard-hover" disabled={loading}>
              {loading ? <Loader2 size={20} className="animate-spin" /> : (
                <>
                  {isLogin ? 'Se connecter' : 'Créer un compte'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {isLogin && (
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button 
                type="button" 
                onClick={handleResetPassword} 
                disabled={loading}
                style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}
              >
                Mot de passe oublié ? (Saisissez votre e-mail d'abord)
              </button>
            </div>
          )}

          {isLogin && (
            <>
              <div className="auth-divider">
                <span>OU</span>
              </div>

              <button type="button" className="btn-google-auth dashboard-hover" onClick={handleGoogleLogin}>
                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continuer avec Google
              </button>
            </>
          )}

          <div className="toggle-wrapper">
            <button 
              type="button" 
              onClick={toggleMode} 
              className="btn-toggle-auth"
            >
              {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà membre ? Se connecter"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
