const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, 'words_base.js'), 'utf8');
fs.writeFileSync(path.join(__dirname, 'words.js'), src);

const count = (src.match(/\{ en:/g) || []).length;
console.log('words.js 生成完了: ' + count + '語');
