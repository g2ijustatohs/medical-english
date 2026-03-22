const fs = require('fs');
const path = require('path');
const dir = __dirname;

// BASE読み込み
let baseCode = fs.readFileSync(path.join(dir, 'words_base.js'), 'utf8');
baseCode = baseCode.replace('const WORDS_DB', 'var WORDS_DB');
eval(baseCode);
const base = WORDS_DB;

// ADDITIONS読み込み
let addCode = fs.readFileSync(path.join(dir, 'words_additions.js'), 'utf8');
addCode = addCode.replace('const WORDS_ADDITIONS', 'var WORDS_ADDITIONS');
eval(addCode);
const additions = (typeof WORDS_ADDITIONS !== 'undefined') ? WORDS_ADDITIONS : [];

// 重複除外してマージ
const existingEn = new Set(base.map(function(t){ return t.en; }));
const newOnes = additions.filter(function(t){ return !existingEn.has(t.en); });
const all = base.concat(newOnes);

// words.js書き出し
function esc(s){ return (s||'').replace(/\\/g,'\\\\').replace(/"/g,'\\"'); }
const lines = ['const WORDS_DB = ['];
all.forEach(function(t){
  lines.push('{ en:"'+esc(t.en)+'", de:"'+esc(t.de||t.en)+'", abbr:"'+esc(t.abbr||'')+'", ja:"'+esc(t.ja)+'", note:"'+esc(t.note||'')+'", example:"'+esc(t.example||'')+'", exampleJa:"'+esc(t.exampleJa||'')+'", cat:"'+t.cat+'", level:"'+t.level+'", dept:"'+t.dept+'" },');
});
lines.push('];');
fs.writeFileSync(path.join(dir, 'words.js'), lines.join('\n'));

// 新単語があればwords_base.jsを更新してwords_additions.jsをリセット
if (newOnes.length > 0) {
  fs.writeFileSync(path.join(dir, 'words_base.js'), lines.join('\n'));
  fs.writeFileSync(path.join(dir, 'words_additions.js'), 'const WORDS_ADDITIONS = [\n  // ここに追加単語を書く\n];\n');
  console.log('words.js 生成完了: '+base.length+'語(base) + '+newOnes.length+'語(new) = '+all.length+'語');
  console.log('✅ words_base.js を '+all.length+'語に更新');
  console.log('✅ words_additions.js をリセット');
} else {
  console.log('words.js 生成完了: '+all.length+'語（新規追加なし）');
}

if (additions.length > newOnes.length) {
  console.log((additions.length - newOnes.length)+'語は重複のためスキップ');
}
