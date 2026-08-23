const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'components', 'Sections', 'Antecedents.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add Settings icon
content = content.replace('Plus, Trash2, Edit3, Check, X', 'Plus, Trash2, Edit3, Check, X, Settings');

// 2. Add Modal states and confirmedChir
const stateInsert = `  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const confirmedChir = data?.antecedents_chirurgicaux_list || [];\n`;
content = content.replace('  const confirmedAnts = data?.antecedents_medicaux_list || [];', stateInsert + '  const confirmedAnts = data?.antecedents_medicaux_list || [];');

// 3. Modify handleEditAnt to also accept type in antFormData
content = content.replace(
  'setAntFormData(existingData || { id: item.id, label: item.label });',
  'setAntFormData(existingData || { id: item.id, label: item.label, type: item.type || \'med\' });'
);

// 4. Update handleSaveAnt
const saveLogic = `  const handleSaveAnt = () => {
    if (!activeAnt) return;
    const type = antFormData.type || catalog.find(c => c.id === activeAnt)?.type || 'med';
    
    if (type === 'chir') {
      const existingIndex = confirmedChir.findIndex(a => a.id === activeAnt);
      let newList = [...confirmedChir];
      if (existingIndex >= 0) newList[existingIndex] = antFormData;
      else newList.push(antFormData);
      updateData({ antecedents_chirurgicaux_list: newList });
    } else {
      const existingIndex = confirmedAnts.findIndex(a => a.id === activeAnt);
      let newList = [...confirmedAnts];
      if (existingIndex >= 0) newList[existingIndex] = antFormData;
      else newList.push(antFormData);
      updateData({ antecedents_medicaux_list: newList });
    }
    setActiveAnt(null);
    setAntFormData({});
  };`;
content = content.replace(/  const handleSaveAnt = \(\) => \{[\s\S]*?setAntFormData\(\{\}\);\n  \};/, saveLogic);

// 5. Update handleDeleteConfirmedAnt
const deleteLogic = `  const handleDeleteConfirmedAnt = (idToRemove, type = 'med') => {
    if (type === 'chir') {
      updateData({ antecedents_chirurgicaux_list: confirmedChir.filter(a => a.id !== idToRemove) });
    } else {
      updateData({ antecedents_medicaux_list: confirmedAnts.filter(a => a.id !== idToRemove) });
    }
  };`;
content = content.replace(/  const handleDeleteConfirmedAnt = \(idToRemove\) => \{[\s\S]*?  \};/, deleteLogic);

// 6. Fix "button" styles to use .premium-tag in the medical section
content = content.replace(/className="premium-tag-bank" style=\{\{.*?\}\}/g, 'className="premium-tag-bank"');
// Wait, I will just write a regex for the medical tag button:
content = content.replace(
  /<button[\s\S]*?key=\{item\.id\}[\s\S]*?style=\{\{[\s\S]*?\}\}[\s\S]*?onMouseEnter=\{.*?\}[\s\S]*?onMouseLeave=\{.*?\}[\s\S]*?onClick=\{\(\) => handleEditAnt\(item\)\}[\s\S]*?>/g,
  '<button key={item.id} className="premium-tag" onClick={() => handleEditAnt(item)}>'
);

// 7. Change Trash icon call to include type in medical section
content = content.replace(
  /<button onClick=\{\(\) => handleDeleteConfirmedAnt\(ant\.id\)\}/g,
  '<button onClick={() => handleDeleteConfirmedAnt(ant.id, "med")}'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Script completed');
