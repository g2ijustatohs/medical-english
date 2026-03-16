const fs = require('fs');
const path = require('path');
const dir = __dirname;

let baseCode = fs.readFileSync(path.join(dir, 'words_base.js'), 'utf8');
baseCode = baseCode.replace('const WORDS_DB', 'var WORDS_DB');
eval(baseCode);
const base = WORDS_DB;

let addCode = fs.readFileSync(path.join(dir, 'words_additions.js'), 'utf8');
addCode = addCode.replace('const WORDS_ADDITIONS', 'var WORDS_ADDITIONS');
eval(addCode);
const additions = (typeof WORDS_ADDITIONS !== 'undefined') ? WORDS_ADDITIONS : [];

const existingEn = new Set(base.map(function(t){ return t.en; }));
const newOnes = additions.filter(function(t){ return !existingEn.has(t.en); });
const all = base.concat(newOnes);

function esc(s){ return (s||'').replace(/\\/g,'\\\\').replace(/"/g,'\\"'); }
const lines = ['const WORDS_DB = ['];
all.forEach(function(t){
  lines.push('{ en:"'+esc(t.en)+'", de:"'+esc(t.de||t.en)+'", abbr:"'+esc(t.abbr||'')+'", ja:"'+esc(t.ja)+'", note:"'+esc(t.note||'')+'", example:"'+esc(t.example||'')+'", cat:"'+t.cat+'", level:"'+t.level+'", dept:"'+t.dept+'" },');
});
lines.push('];');
fs.writeFileSync(path.join(dir, 'words.js'), lines.join('\n'));
console.log('words.js 生成完了: '+base.length+'語(base) + '+newOnes.length+'語(new) = '+all.length+'語');
