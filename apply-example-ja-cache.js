/**
 * .example_ja_translate_cache.json を words.js にマージ（未設定の example_ja のみ）
 * node apply-example-ja-cache.js && node build.js
 */
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const CACHE_PATH = path.join(dir, '.example_ja_translate_cache.json');

function esc(s) {
  return (s || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function getJa(t) {
  const a = t.example_ja && String(t.example_ja).trim() ? t.example_ja : '';
  const b = t.exampleJa && String(t.exampleJa).trim() ? t.exampleJa : '';
  return a || b || '';
}

let code = fs.readFileSync(path.join(dir, 'words.js'), 'utf8');
code = code.replace('const WORDS_DB', 'var WORDS_DB');
eval(code);

let cache = {};
try {
  cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
} catch {
  console.log('キャッシュなし');
}

const out = WORDS_DB.map((t) => {
  let example_ja = getJa(t);
  if (!example_ja && t.example) {
    const c = cache[t.example];
    if (c !== undefined && c !== null && String(c).trim()) example_ja = String(c).trim();
  }
  return {
    en: t.en,
    de: t.de || t.en,
    abbr: t.abbr || '',
    ja: t.ja,
    note: t.note || '',
    example: t.example || '',
    example_ja,
    cat: t.cat,
    level: t.level,
    dept: t.dept,
  };
});

const lines = ['const WORDS_DB = ['];
out.forEach((t) => {
  const ja = t.example_ja || '';
  const exJaField = ja ? ', example_ja:"' + esc(ja) + '"' : '';
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
      '", cat:"' +
      t.cat +
      '", level:"' +
      t.level +
      '", dept:"' +
      t.dept +
      '"' +
      exJaField +
      ' },'
  );
});
lines.push('];');
fs.writeFileSync(path.join(dir, 'words.js'), lines.join('\n'));

const n = out.filter((t) => t.example_ja && t.example_ja.trim()).length;
console.log('example_ja あり:', n, '/', out.length);
