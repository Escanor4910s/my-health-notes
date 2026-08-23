const fs = require('fs');

// UPDATE App.jsx
let app_content = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Pass globalData to sections
app_content = app_content.replace(
  "const props = (id) => ({ data: formData[id], updateData: getUpdater(id) });",
  "const props = (id) => ({ data: formData[id], updateData: getUpdater(id), globalData: formData });"
);

// 2. Modify dynamic ALL_SECTIONS_FLAT based on formData
// Wait, we can't change ALL_SECTIONS_FLAT globally if it depends on formData without making it a derived variable.
// In App.jsx, ALL_SECTIONS_FLAT is a global const. We should derive `activeSectionsList` inside the component.
// Let's replace usages of `ALL_SECTIONS_FLAT` in the return block with a derived array.
const old_carousel_map = `{ALL_SECTIONS_FLAT.map((s, index) => {`;
const new_carousel_map = `
                {(() => {
                  const activeSectionsList = ALL_SECTIONS_FLAT.filter(s => {
                    if (s.id === 'examen-gyneco' && formData['etat-civil']?.sexe === 'M') return false;
                    return true;
                  });
                  return activeSectionsList.map((s, index) => {
`;
app_content = app_content.replace(old_carousel_map, new_carousel_map);

const old_active_index = `const activeIndex = ALL_SECTIONS_FLAT.findIndex(x => x.id === activeSection);`;
const new_active_index = `const activeIndex = activeSectionsList.findIndex(x => x.id === activeSection);`;
app_content = app_content.replace(old_active_index, new_active_index);

// Close the IIFE map
const old_end_map = `                  );
                })}
              </div>`;
const new_end_map = `                  );
                  });
                })()}
              </div>`;
app_content = app_content.replace(old_end_map, new_end_map);

// 3. Remove the title, change mask, change opacity/blur calculation
const old_styles = `                  // Calculate dynamic styles
                  const scale = isActive ? 1.35 : Math.max(0, 1 - 0.22 * absOffset);
                  const translateX = offset * 52; // pixels spacing
                  const opacity = isActive ? 1 : Math.max(0, 0.7 - 0.15 * absOffset);
                  const blur = isActive ? 0 : absOffset * 1.2;
                  const zIndex = 20 - absOffset;
                  
                  const isVisible = absOffset <= 4;`;

const new_styles = `                  // Calculate dynamic styles
                  const scale = isActive ? 1.35 : Math.max(0, 1 - 0.15 * absOffset);
                  const translateX = offset * 52; // pixels spacing
                  const opacity = isActive ? 1 : Math.max(0, 0.9 - 0.1 * absOffset);
                  const blur = isActive ? 0 : absOffset * 0.7;
                  const zIndex = 20 - absOffset;
                  
                  const isVisible = absOffset <= 6;`;
app_content = app_content.replace(old_styles, new_styles);

// Remove title div completely
const old_title_block = `                      {isActive && (
                        <div className="shortcut-active-title">
                          {s.title}
                        </div>
                      )}`;
app_content = app_content.replace(old_title_block, "");

// Widen the mask
app_content = app_content.replace(
  "maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'",
  "maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'"
);

// We must also update currentIndex calculation around line 315 so previous/next buttons skip Gyneco for men
const old_current_index = `  const currentIndex = ALL_SECTIONS_FLAT.findIndex(s => s.id === activeSection);
  const prevSection = currentIndex > 0 ? ALL_SECTIONS_FLAT[currentIndex - 1] : null;
  const nextSection = currentIndex < ALL_SECTIONS_FLAT.length - 1 ? ALL_SECTIONS_FLAT[currentIndex + 1] : null;`;
const new_current_index = `  const activeSectionsListGlobal = ALL_SECTIONS_FLAT.filter(s => {
    if (s.id === 'examen-gyneco' && formData['etat-civil']?.sexe === 'M') return false;
    return true;
  });
  const currentIndex = activeSectionsListGlobal.findIndex(s => s.id === activeSection);
  const prevSection = currentIndex > 0 ? activeSectionsListGlobal[currentIndex - 1] : null;
  const nextSection = currentIndex < activeSectionsListGlobal.length - 1 ? activeSectionsListGlobal[currentIndex + 1] : null;`;
app_content = app_content.replace(old_current_index, new_current_index);

fs.writeFileSync('src/App.jsx', app_content, 'utf8');


// UPDATE Antecedents.jsx (hide gyneco section for men)
let ant_content = fs.readFileSync('src/components/Sections/Antecedents.jsx', 'utf8');
const old_ant = `{/* C) Antécédents Gynéco-Obstétricaux */}
      <div style={{ marginBottom: '3rem' }}>`;
const new_ant = `{/* C) Antécédents Gynéco-Obstétricaux */}
      {props.globalData?.['etat-civil']?.sexe !== 'M' && (
      <div style={{ marginBottom: '3rem' }}>`;

const old_ant_close = `            onChange={handleChange}
          />
        </div>
      </div>

      {/* D) Antécédents Familiaux */}`;
const new_ant_close = `            onChange={handleChange}
          />
        </div>
      </div>
      )}

      {/* D) Antécédents Familiaux */}`;

// Let's do it safer by parsing lines
let ant_lines = ant_content.split('\n');
let gyneco_start = -1;
let gyneco_end = -1;
for (let i = 0; i < ant_lines.length; i++) {
  if (ant_lines[i].includes('{/* C) Antécédents Gynéco-Obstétricaux */}')) {
    gyneco_start = i;
  }
  if (ant_lines[i].includes('{/* D) Antécédents Familiaux */}')) {
    gyneco_end = i;
  }
}

if (gyneco_start !== -1 && gyneco_end !== -1) {
  ant_lines.splice(gyneco_start + 1, 0, "      {props.globalData?.['etat-civil']?.sexe !== 'M' && (");
  // offset by 1 because we added a line
  ant_lines.splice(gyneco_end + 1, 0, "      )}");
  fs.writeFileSync('src/components/Sections/Antecedents.jsx', ant_lines.join('\n'), 'utf8');
}


// UPDATE index.css (Change shape to Leaf/Teardrop, update check indicator to glowing border)
let css_content = fs.readFileSync('src/index.css', 'utf8');

const old_shortcut_css = `.shortcut-circle {
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
}`;

const new_shortcut_css = `.shortcut-circle {
  width: 44px;
  height: 44px;
  border-radius: 20px 8px 20px 8px; /* Original leaf/teardrop shape */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  border: 2px solid transparent;
  transform-origin: center center;
}

.shortcut-circle.empty {
  background: var(--beige);
  color: var(--text-light);
  border-color: var(--surface-border);
}

/* Premium Completion State - Soft Glowing Aura instead of a dot */
.shortcut-circle.filled {
  background: var(--surface);
  color: var(--primary);
  border-color: var(--primary);
  box-shadow: 0 0 12px var(--primary-light), inset 0 0 8px rgba(0,0,0,0.02);
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
  border-radius: 14px; /* Organic morph on hover */
}

/* Remove the old check dot completely */
.circle-check-dot {
  display: none;
}`;

css_content = css_content.replace(old_shortcut_css, new_shortcut_css);
fs.writeFileSync('src/index.css', css_content, 'utf8');

console.log("Updates applied successfully!");
