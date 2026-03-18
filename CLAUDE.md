# Claude Code 作業ルール

## 単語追加の手順

### 1. `words_additions.js` に単語を追加

```javascript
const WORDS_ADDITIONS = [
  { en:"Term", de:"German", abbr:"", ja:"日本語", note:"説明", example:"Example sentence.", cat:"common", level:"basic", dept:"GEN" },
];
```

### 2. デプロイ（1コマンド）

```bash
./deploy.sh "○○科の単語を追加"
```

これだけで以下がすべて自動実行されます：
- `node build.js`（words.js 生成 + words_base.js 更新 + sw.js キャッシュバージョン +1）
- `git add` & `git commit`
- `git fetch` & `git rebase origin/main`
- `git push --force-with-lease`

数秒後に auto-merge → GitHub Pages に反映。

### 手動で実行する場合

```bash
node build.js                    # ビルド（sw.js のバージョンも自動更新）
git add words.js words_additions.js sw.js
git commit -m "単語追加"
git fetch origin main
git rebase origin/main
git push --force-with-lease origin <ブランチ名>
```

## ブランチ
- 作業ブランチ: `claude/` で始まるブランチ
- main へのマージ: auto-merge ワークフローが自動で行う（--ff-only）
- main への直接 push は 403 で不可

## ファイル構成

| ファイル | 役割 |
|---------|------|
| `words_additions.js` | 新規単語の入力先（ビルド後リセット） |
| `words.js` | 全単語データ（ソース兼出力） |
| `build.js` | ビルド + sw.js キャッシュ更新 + 必須フィールド検証 |
| `deploy.sh` | ビルド → コミット → push を一括実行 |
| `sw.js` | Service Worker（キャッシュバージョン管理） |
