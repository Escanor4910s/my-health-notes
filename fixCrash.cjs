const fs = require('fs');

let ant_content = fs.readFileSync('src/components/Sections/Antecedents.jsx', 'utf8');

// The line is: export default React.memo(function Antecedents({ data, updateData }) {
ant_content = ant_content.replace(
  "export default React.memo(function Antecedents({ data, updateData }) {",
  "export default React.memo(function Antecedents({ data, updateData, globalData }) {"
);
// replace props.globalData with globalData
ant_content = ant_content.replace(
  "{props.globalData?.['etat-civil']?.sexe !== 'M' && (",
  "{globalData?.['etat-civil']?.sexe !== 'M' && ("
);

fs.writeFileSync('src/components/Sections/Antecedents.jsx', ant_content, 'utf8');
console.log("Crash fixed in Antecedents.jsx");
