import re

with open(r'C:\Users\7MAKSACOD PC\.gemini\antigravity\scratch\medical-observation\src\components\Screens\Dashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

abonnement_ui = '''              {activeTab === 'abonnement' && (
                <div className="animate-fade-in" style={{ padding: '0', position: 'relative' }}>
                  {currentPlan ? (
                    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '2.5rem', marginBottom: '2.5rem', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                          <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.6rem', fontWeight: '800' }}>Votre Abonnement</h3>
                          <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>Vous êtes actuellement abonné au plan <strong style={{ color: currentPlan === 'premium' ? 'var(--primary)' : '#0f172a' }}>{currentPlan === 'premium' ? 'Premium' : 'Standard'}</strong>.</p>
                        </div>
                        <div style={{ background: currentPlan === 'premium' ? '#fef2f2' : '#f8fafc', color: currentPlan === 'premium' ? 'var(--primary)' : '#475569', padding: '0.75rem 1.5rem', borderRadius: '99px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {currentPlan === 'premium' ? <Crown size={20} /> : <Shield size={20} />}
                          {currentPlan === 'premium' ? 'Plan Actif' : 'Plan Actif'}
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

                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => onPlanChange(null)} style={{ padding: '0.85rem 1.5rem', background: '#fff', color: '#ef4444', border: '1px solid #fca5a5', borderRadius: '99px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', flex: 1 }} onMouseOver={e => e.currentTarget.style.background = '#fef2f2'} onMouseOut={e => e.currentTarget.style.background = '#fff'}>
                          Résilier l\'abonnement
                        </button>
                        <button onClick={() => onPlanChange(currentPlan === "premium" ? "standard" : "premium")} style={{ padding: '0.85rem 1.5rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '99px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', flex: 1 }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
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
                      
                      <div className="subscription-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', position: 'relative', zIndex: 1 }}>
                        
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
                        <div style={{ background: '#0f172a', borderRadius: '32px', padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', position: 'relative', transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)', cursor: 'pointer', zIndex: 1, boxShadow: '0 25px 50px -12px rgba(var(--primary-rgb, 220,38,38), 0.3)' }} onMouseOver={e => {e.currentTarget.style.transform='translateY(-12px)'; e.currentTarget.style.boxShadow='0 40px 80px -15px rgba(var(--primary-rgb, 220,38,38), 0.4)'}} onMouseOut={e => {e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 25px 50px -12px rgba(var(--primary-rgb, 220,38,38), 0.3)'}}>
                          
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
                            <span style={{ fontSize: '3rem', fontWeight: '800', color: '#fff', letterSpacing: '-2px', whiteSpace: 'nowrap', lineHeight: '1' }}>{billingCycle === 'annuel' ? '4 000' : '5 000'}</span>
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
              )}'''

start_str = "{activeTab === 'abonnement' && ("
end_str_param = "{activeTab === 'parametres' && ("

start_idx = content.find(start_str)
end_idx = content.find(end_str_param)

if start_idx != -1 and end_idx != -1:
    chunk_before_parametres = content[start_idx:end_idx]
    last_brace = chunk_before_parametres.rfind(")}")
    
    if last_brace != -1:
        new_content = content[:start_idx] + abonnement_ui + "\n              " + content[start_idx + last_brace + 2:]
        
        # Remove mobile logout wrapper
        new_content = re.sub(r'<div className="mobile-logout-wrapper"[\s\S]*?</div>\s*</div>\s*</div>\s*</>', '</div>\s*</div>\s*</>', new_content)
        
        with open(r'C:\Users\7MAKSACOD PC\.gemini\antigravity\scratch\medical-observation\src\components\Screens\Dashboard.jsx', 'w', encoding='utf-8') as fw:
            fw.write(new_content)
        print("Success")
    else:
        print("Could not find closing brace")
else:
    print("Could not find start or end tags")
