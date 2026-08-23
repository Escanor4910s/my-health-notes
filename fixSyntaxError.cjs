const fs = require('fs');

function fixSyntax(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace("), document.body)}", ", document.body)}");
  fs.writeFileSync(file, content, 'utf8');
}

fixSyntax('src/components/Sections/Antecedents.jsx');
fixSyntax('src/components/Sections/HistoireMaladie.jsx');

console.log("Syntax fixed");
