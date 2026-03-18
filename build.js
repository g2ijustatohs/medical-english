const fs = require('fs');
const path = require('path');
const dir = __dirname;

// BASE読み込み（eval→Functionで安全に）
let baseCode = fs.readFileSync(path.join(dir, 'words_base.js'), 'utf8');
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

// 重複除外してマージ（en + abbr の組み合わせで判定）
function dedupKey(t){ return t.en + '||' + (t.abbr||''); }
const existingKeys = new Set(base.map(dedupKey));
const newOnes = additions.filter(function(t){ return !existingKeys.has(dedupKey(t)); });
const all = base.concat(newOnes);

// words.js書き出し
function esc(s){ return (s||'').replace(/\\/g,'\\\\').replace(/"/g,'\\"'); }
const lines = ['const WORDS_DB = ['];
all.forEach(function(t){
  lines.push('{ en:"'+esc(t.en)+'", de:"'+esc(t.de||t.en)+'", abbr:"'+esc(t.abbr||'')+'", ja:"'+esc(t.ja)+'", note:"'+esc(t.note||'')+'", example:"'+esc(t.example||'')+'", cat:"'+t.cat+'", level:"'+t.level+'", dept:"'+t.dept+'" },');
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
    console.log('✅ sw.js キャッシュバージョン: v' + oldVer + ' → v' + newVer);
  }
}
