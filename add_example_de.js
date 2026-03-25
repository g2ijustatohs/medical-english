const fs = require('fs');

// Read translations from JSON file
const translations = JSON.parse(fs.readFileSync('/tmp/batch_de.json', 'utf8'));

const content = fs.readFileSync('words.js', 'utf8');
const lines = content.split('\n');

let applied = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Skip lines that already have example_de
  if (line.includes('example_de:')) continue;

  const exMatch = line.match(/example:"([^"]*)"/);
  if (exMatch && translations[exMatch[1]]) {
    const de = translations[exMatch[1]].replace(/"/g, '\\"');
    // Insert example_de before the closing },
    lines[i] = line.replace(/ \},\s*$/, `, example_de:"${de}" },`);
    applied++;
  }
}

fs.writeFileSync('words.js', lines.join('\n'));
console.log(`Applied ${applied} translations`);
