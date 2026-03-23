const fs = require('fs');
const translations = [
"QRS延長と意識変容に基づきTCA過量摂取が疑われた。",
"体表面積40%に及ぶ広範な表皮剥離を伴うTENと診断された。",
"ECG、心エコー、EEGを含むTLOC精査が行われた。",
];
const lines = fs.readFileSync('words.js', 'utf8').split('\n');
let count = 0;
for (let i = 2870; i <= 2872 && i < lines.length; i++) {
  const line = lines[i];
  if (!line.startsWith('{')) continue;
  if (line.includes('example_ja:')) continue;
  const ja = translations[count];
  if (!ja) break;
  lines[i] = line.replace(
    /example:"([^"]*)"(,\s*cat:)/,
    `example:"$1", example_ja:"${ja}"$2`
  );
  count++;
}
fs.writeFileSync('words.js', lines.join('\n'));
console.log(`Batch 5c: Processed ${count} entries`);
