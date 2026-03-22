/**
 * words_base.js に exampleJa を付与（example_ja_seed.js の訳をマージ、未登録は空文字）
 * 実行: node migrate-example-ja.js && node build.js
 */
const fs = require('fs');
const path = require('path');
const dir = __dirname;

const SEED = fs.existsSync(path.join(dir, 'example_ja_seed.js'))
  ? require(path.join(dir, 'example_ja_seed.js'))
  : {};

let code = fs.readFileSync(path.join(dir, 'words_base.js'), 'utf8');
code = code.replace('const WORDS_DB', 'var WORDS_DB');
eval(code);

function esc(s) {
  return (s || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

const out = WORDS_DB.map(function (t) {
  const ja =
    (t.exampleJa != null && String(t.exampleJa).length > 0
      ? t.exampleJa
      : SEED[t.en]) || '';
  return {
    en: t.en,
    de: t.de || t.en,
    abbr: t.abbr || '',
    ja: t.ja,
    note: t.note || '',
    example: t.example || '',
    exampleJa: ja,
    cat: t.cat,
    level: t.level,
    dept: t.dept,
  };
});

const lines = ['const WORDS_DB = ['];
out.forEach(function (t) {
  lines.push(
    '{ en:"' +
      esc(t.en) +
      '", de:"' +
      esc(t.de) +
      '", abbr:"' +
      esc(t.abbr) +
      '", ja:"' +
      esc(t.ja) +
      '", note:"' +
      esc(t.note) +
      '", example:"' +
      esc(t.example) +
      '", exampleJa:"' +
      esc(t.exampleJa) +
      '", cat:"' +
      t.cat +
      '", level:"' +
      t.level +
      '", dept:"' +
      t.dept +
      '" },'
  );
});
lines.push('];');
fs.writeFileSync(path.join(dir, 'words_base.js'), lines.join('\n'));
console.log('words_base.js 更新: ' + out.length + '語（exampleJa シード ' + Object.keys(SEED).length + ' 件）');
