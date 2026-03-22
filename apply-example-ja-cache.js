/**
 * .example_ja_translate_cache.json を words_base.js にマージ（未設定の exampleJa のみ）
 * node apply-example-ja-cache.js && node build.js
 */
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const CACHE_PATH = path.join(dir, '.example_ja_translate_cache.json');

function esc(s) {
  return (s || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

let code = fs.readFileSync(path.join(dir, 'words_base.js'), 'utf8');
code = code.replace('const WORDS_DB', 'var WORDS_DB');
eval(code);

let cache = {};
try {
  cache = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
} catch {
  console.log('キャッシュなし');
}

const out = WORDS_DB.map((t) => {
  let exampleJa = t.exampleJa && String(t.exampleJa).trim() ? t.exampleJa : '';
  if (!exampleJa && t.example) {
    const c = cache[t.example];
    if (c !== undefined && c !== null && String(c).trim()) exampleJa = String(c).trim();
  }
  return {
    en: t.en,
    de: t.de || t.en,
    abbr: t.abbr || '',
    ja: t.ja,
    note: t.note || '',
    example: t.example || '',
    exampleJa,
    cat: t.cat,
    level: t.level,
    dept: t.dept,
  };
});

const lines = ['const WORDS_DB = ['];
out.forEach((t) => {
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

const n = out.filter((t) => t.exampleJa && t.exampleJa.trim()).length;
console.log('exampleJa あり:', n, '/', out.length);
