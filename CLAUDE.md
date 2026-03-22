# Claude Code 作業ルール

## 重要：速度優先の原則

- **既存単語との手動重複チェックは絶対にしない**（build.js が自動で重複除外する）
- 画像や指示を受けたら、即座に `words_additions.js` に書き始める
- 余計な調査・確認をせず、最短ステップで完了させる

## 単語追加の手順（3ステップ）

### 1. `words_additions.js` に単語を追加

画像・指示から単語を抽出し、即座に書く。重複は build.js が自動スキップするので気にしない。

```javascript
const WORDS_ADDITIONS = [
  { en:"Term", de:"German", abbr:"", ja:"日本語", note:"説明", example:"Example sentence.", cat:"common", level:"basic", dept:"GEN" },
];
```

### 2. ビルド

```bash
node build.js
```

自動処理：重複チェック → words.js マージ → sw.js バージョン更新 → words_additions.js リセット

### 3. コミット & プッシュ

```bash
git add words.js words_additions.js sw.js
git commit -m "○○の単語を追加"
git push -u origin <ブランチ名>
```

## dept 値一覧（28科）

| コード | 診療科 | グループ |
|--------|--------|----------|
| GEN | 共通 | - |
| ER | 救急科 | - |
| IM | 総合内科 | 内科系 |
| CV | 循環器内科 | 内科系 |
| RESP | 呼吸器内科 | 内科系 |
| GI | 消化器内科 | 内科系 |
| NEURO | 神経内科 | 内科系 |
| RHEUM | リウマチ科 | 内科系 |
| ENDO | 内分泌・代謝科 | 内科系 |
| NEPH | 腎臓内科 | 内科系 |
| HEME | 血液内科 | 内科系 |
| ONCO | 腫瘍内科 | 内科系 |
| INFECT | 感染症内科 | 内科系 |
| SURG | 外科 | 外科系 |
| ORTHO | 整形外科 | 外科系 |
| NSURG | 脳神経外科 | 外科系 |
| CSURG | 心臓血管外科 | 外科系 |
| PSURG | 形成外科 | 外科系 |
| PED | 小児科 | その他 |
| OB | 産婦人科 | その他 |
| PSY | 精神科 | その他 |
| DERM | 皮膚科 | その他 |
| URO | 泌尿器科 | その他 |
| OPH | 眼科 | その他 |
| ENT | 耳鼻咽喉科 | その他 |
| RAD | 放射線科 | その他 |
| ANES | 麻酔科 | その他 |
| HEMONC | 血液腫瘍 | 内科系 |

## ブランチ
- 作業ブランチ: `claude/` で始まるブランチ
- main へのマージ: auto-merge ワークフローが自動で行う（--ff-only）
- main への直接 push は 403 で不可

## ファイル構成

| ファイル | 役割 |
|---------|------|
| `words_additions.js` | 新規単語の入力先（ビルド後リセット） |
| `words.js` | 全単語データ（ソース兼出力・2925語） |
| `build.js` | 重複チェック + words.js マージ + sw.js キャッシュ更新 + 必須フィールド検証 |
| `deploy.sh` | ビルド → コミット → push を一括実行 |
| `sw.js` | Service Worker（キャッシュバージョン管理） |
| `index.html` | メインアプリ（検索・ブックマーク・フラッシュカード） |
| `admin.html` | 管理ツール（単語追加・一覧編集・エクスポート） |
