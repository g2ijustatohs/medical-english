const fs = require('fs');
const path = require('path');
const dir = __dirname;

// words.js をソース兼出力として読み込み
let baseCode = fs.readFileSync(path.join(dir, 'words.js'), 'utf8');
baseCode = baseCode.replace('const WORDS_DB', 'var WORDS_DB');
const base = new Function(baseCode + '; return WORDS_DB;')();

// ADDITIONS読み込み
let addCode = fs.readFileSync(path.join(dir, 'words_additions.js'), 'utf8');
addCode = addCode.replace('const WORDS_ADDITIONS', 'var WORDS_ADDITIONS');
const additions = new Function(addCode + '; return typeof WORDS_ADDITIONS !== "undefined" ? WORDS_ADDITIONS : [];')();

// 必須フィールド検証
const required = ['en', 'ja', 'cat', 'level', 'dept'];
additions.forEach(function(t, i){
  var missing = required.filter(function(f){ return !t[f]; });
  if (missing.length > 0) {
    console.error('⚠️  additions['+i+'] "'+t.en+'" に必須フィールドがありません: '+missing.join(', '));
    process.exit(1);
  }
});

// 重複除外してマージ（en の大文字小文字無視で判定）
function normalize(s){ return (s||'').toLowerCase().replace(/[^a-z0-9]/g,''); }
const existingEn = new Set(base.map(function(t){ return normalize(t.en); }));
const newOnes = [];
const skipped = [];
additions.forEach(function(t){
  var normEn = normalize(t.en);
  if (existingEn.has(normEn)) {
    skipped.push(t.en + (t.abbr ? ' ('+t.abbr+')' : ''));
  } else {
    newOnes.push(t);
    existingEn.add(normEn);
  }
});
const all = base.concat(newOnes);

// words.js書き出し
function esc(s){ return (s||'').replace(/\\/g,'\\\\').replace(/"/g,'\\"'); }
const lines = ['const WORDS_DB = ['];
all.forEach(function(t){
  var ja = (t.example_ja ? t.example_ja : t.exampleJa) || '';
  var exJa = ja ? ', example_ja:"'+esc(ja)+'"' : '';
  lines.push('{ en:"'+esc(t.en)+'", de:"'+esc(t.de||t.en)+'", abbr:"'+esc(t.abbr||'')+'", ja:"'+esc(t.ja)+'", note:"'+esc(t.note||'')+'", example:"'+esc(t.example||'')+'", cat:"'+t.cat+'", level:"'+t.level+'", dept:"'+t.dept+'"'+exJa+' },');
});
lines.push('];');
fs.writeFileSync(path.join(dir, 'words.js'), lines.join('\n'));

// 新単語があればwords_additions.jsをリセット
if (newOnes.length > 0) {
  fs.writeFileSync(path.join(dir, 'words_additions.js'), 'const WORDS_ADDITIONS = [\n  // ここに追加単語を書く\n];\n');
  console.log(base.length+'語 + '+newOnes.length+'語(new) = '+all.length+'語');
  console.log('✅ words.js 更新完了');
} else {
  console.log(all.length+'語（新規追加なし）');
}

if (skipped.length > 0) {
  console.log('⏭ '+skipped.length+'語は重複スキップ:');
  skipped.forEach(function(s){ console.log('   - '+s); });
}

// sw.js キャッシュバージョン自動更新（新規追加があった場合のみ）
if (newOnes.length > 0) {
  const swPath = path.join(dir, 'sw.js');
  let swCode = fs.readFileSync(swPath, 'utf8');
  const match = swCode.match(/const CACHE = 'medical-en-v(\d+)'/);
  if (match) {
    const oldVer = parseInt(match[1]);
    const newVer = oldVer + 1;
    swCode = swCode.replace(
      "const CACHE = 'medical-en-v" + oldVer + "'",
      "const CACHE = 'medical-en-v" + newVer + "'"
    );
    fs.writeFileSync(swPath, swCode);
    console.log('✅ sw.js キャッシュ: v' + oldVer + ' → v' + newVer);
  }
}
