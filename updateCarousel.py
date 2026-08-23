import re

# UPDATE App.jsx
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    app_content = f.read()

old_block = """              <div ref={pillsContainerRef} className="section-indicators" style={{ width: '100%' }}>
                {ALL_SECTIONS_FLAT.map(s => {
                  const hasData = sectionHasData(s.id);
                  const isActive = activeSection === s.id;
                  const stateClass = isActive ? 'active' : (hasData ? 'filled' : 'empty');
                  const Icon = s.icon;
                  return (
                    <div key={s.id} className={`section-pill ${stateClass}`} onClick={() => navigateTo(s.id)} title={s.title}>
                      <span className="pill-icon"><Icon size={12} /></span>
                      <span className="pill-check">{hasData && <Check size={8} strokeWidth={4} />}</span>
                    </div>
                  );
                })}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                <div className="progress-track" style={{ flex: 1 }}>
                  <div className="progress-fill" style={{ width: `${Math.max(progress, 2)}%` }} />
                </div>
                <span className="progress-label">{progress}%</span>
              </div>"""

new_block = """              <div className="shortcut-carousel-container" style={{ position: 'relative', width: '100%', height: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginBottom: '1.5rem', maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' }}>
                {ALL_SECTIONS_FLAT.map((s, index) => {
                  const hasData = sectionHasData(s.id);
                  const isActive = activeSection === s.id;
                  
                  const activeIndex = ALL_SECTIONS_FLAT.findIndex(x => x.id === activeSection);
                  const offset = index - activeIndex;
                  const absOffset = Math.abs(offset);
                  
                  // Calculate dynamic styles
                  const scale = isActive ? 1.35 : Math.max(0, 1 - 0.22 * absOffset);
                  const translateX = offset * 52; // pixels spacing
                  const opacity = isActive ? 1 : Math.max(0, 0.7 - 0.15 * absOffset);
                  const blur = isActive ? 0 : absOffset * 1.2;
                  const zIndex = 20 - absOffset;
                  
                  const isVisible = absOffset <= 4;
                  
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
                      {isActive && (
                        <div className="shortcut-active-title">
                          {s.title}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                <div className="progress-track liquid-track" style={{ flex: 1, position: 'relative', overflow: 'hidden', borderRadius: '20px', height: '14px', background: 'var(--surface-border)', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div className="liquid-progress" style={{ width: `${Math.max(progress, 2)}%`, height: '100%', position: 'absolute', left: 0, top: 0, background: 'var(--primary)', borderRadius: '20px', transition: 'width 0.5s cubic-bezier(0.22, 1, 0.36, 1)' }}>
                    <div className="liquid-wave"></div>
                  </div>
                </div>
                <span className="progress-label" style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '1rem', minWidth: '40px' }}>{progress}%</span>
              </div>"""

app_content = app_content.replace(old_block, new_block)

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(app_content)


# UPDATE index.css
with open('src/index.css', 'r', encoding='utf-8') as f:
    css_content = f.read()

css_old_block = """.section-indicators::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

.section-pill {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.68rem;
  font-weight: 600;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.2s var(--ease-out);
  border: 1.5px solid transparent;
  letter-spacing: 0.01em;
}

/* Empty state */
.section-pill.empty {
  background: var(--beige);
  color: var(--text-light);
  border-color: var(--surface-border);
}

/* Filled state */
.section-pill.filled {
  background: rgba(90, 138, 94, 0.12);
  color: var(--success);
  border-color: rgba(90, 138, 94, 0.3);
}

/* Active state */
.section-pill.active {
  background: var(--noir);
  color: var(--blanc);
  border-color: var(--noir);
  transform: scale(1.05);
  box-shadow: var(--shadow-sm);
}

.section-pill:hover:not(.active) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-xs);
  border-color: var(--primary);
}

.section-pill .pill-icon {
  width: 12px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-pill .pill-check {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-pill.filled .pill-check {
  background: var(--success);
  color: white;
}

.section-pill.empty .pill-check {
  border: 1.5px solid var(--text-light);
  background: transparent;
}"""

css_new_block = """/* ═══════════════════════════════════════════════════════════
   KONAMI CAROUSEL & SHORTCUT CIRCLES
   ═══════════════════════════════════════════════════════════ */
.shortcut-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  border: 2px solid transparent;
}

.shortcut-circle.empty {
  background: var(--beige);
  color: var(--text-light);
  border-color: var(--surface-border);
}

.shortcut-circle.filled {
  background: rgba(90, 138, 94, 0.15);
  color: var(--success);
  border-color: rgba(90, 138, 94, 0.4);
}

.shortcut-circle.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.shortcut-circle:hover:not(.active) {
  border-color: var(--primary);
  color: var(--primary);
}

.circle-check-dot {
  position: absolute;
  top: 0;
  right: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--success);
  border: 2px solid white;
}

.shortcut-active-title {
  position: absolute;
  bottom: -22px;
  white-space: nowrap;
  font-size: 0.6rem;
  font-weight: 700;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  pointer-events: none;
  animation: fadeInTitle 0.3s ease-out forwards;
}

@keyframes fadeInTitle {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ═══════════════════════════════════════════════════════════
   LIQUID PROGRESS BAR
   ═══════════════════════════════════════════════════════════ */
.liquid-progress {
  overflow: hidden;
  position: relative;
}

.liquid-wave {
  position: absolute;
  top: -8px;
  left: 0;
  width: 200%;
  height: 100%;
  background-image: 
    radial-gradient(ellipse at center, rgba(255,255,255,0.3) 0%, transparent 70%);
  background-size: 30px 100%;
  background-repeat: repeat-x;
  animation: waveAction 2s linear infinite;
  opacity: 0.8;
}

@keyframes waveAction {
  0% { transform: translateX(0); }
  100% { transform: translateX(-30px); }
}"""

css_content = css_content.replace(css_old_block, css_new_block)

with open('src/index.css', 'w', encoding='utf-8') as f:
    f.write(css_content)

print("Updates applied successfully.")
