/**
 * 英語 example を機械翻訳で日本語 exampleJa に一括投入（未設定のみ）
 * 既存の exampleJa・example_ja_seed.js の内容は上書きしない
 *
 * npm install
 * node fill-example-ja-translate.js
 * node build.js
 */
const fs = require('fs');
const path = require('path');
const { translate } = require('google-translate-api-x');

const dir = __dirname;
const CACHE_PATH = path.join(dir, '.example_ja_translate_cache.json');

function esc(s) {
  return (s || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function loadCache() {
  try {
    return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 0), 'utf8');
}

let code = fs.readFileSync(path.join(dir, 'words_base.js'), 'utf8');
code = code.replace('const WORDS_DB', 'var WORDS_DB');
eval(code);

const cache = loadCache();
/** 既に words_base にある訳をキャッシュに載せ、再翻訳しない */
WORDS_DB.forEach((t) => {
  if (t.example && t.exampleJa && String(t.exampleJa).trim()) {
    cache[t.example] = t.exampleJa.trim();
  }
});
let translated = 0;

/** 未訳のユニーク例文 */
const toTranslate = new Set();
WORDS_DB.forEach((t) => {
  const hasJa = t.exampleJa && String(t.exampleJa).trim();
  if (hasJa || !t.example || !String(t.example).trim()) return;
  const ex = t.example;
  if (cache[ex]) return;
  toTranslate.add(ex);
});

const list = [...toTranslate];
console.log('ユニーク例文（未キャッシュ）:', list.length, '件');

async function run() {
  for (let i = 0; i < list.length; i++) {
    const text = list[i];
    try {
      const res = await translate(text, {
        to: 'ja',
        forceTo: true,
        forceBatch: false,
        rejectOnPartialFail: false,
      });
      const ja = (res && res.text) ? String(res.text).trim() : '';
      if (!ja) {
        console.warn('空訳:', text.slice(0, 60));
      }
      cache[text] = ja;
      translated++;
      if ((i + 1) % 50 === 0) {
        saveCache(cache);
        console.log('…', i + 1, '/', list.length);
      }
    } catch (e) {
      console.error('失敗:', text.slice(0, 80), e.message || e);
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const res = await translate(text, {
          to: 'ja',
          forceTo: true,
          forceBatch: false,
          rejectOnPartialFail: false,
        });
        cache[text] = (res && res.text) ? String(res.text).trim() : '';
        translated++;
      } catch (e2) {
        console.error('再試行も失敗、空でスキップ:', text.slice(0, 60));
        cache[text] = '';
      }
    }
    await new Promise((r) => setTimeout(r, 280));
  }
  saveCache(cache);

  const fullCache = loadCache();
  const out = WORDS_DB.map((t) => {
    let exampleJa = (t.exampleJa && String(t.exampleJa).trim()) ? t.exampleJa : '';
    if (!exampleJa && t.example) {
      const c = fullCache[t.example];
      if (c !== undefined && c !== null) exampleJa = String(c).trim();
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

  const withJa = out.filter((t) => t.exampleJa && t.exampleJa.trim()).length;
  console.log('完了。exampleJa あり:', withJa, '/', out.length);
  console.log('次: node build.js');
}

run().catch((e) => {
  console.error(e);
  saveCache(cache);
  process.exit(1);
});
