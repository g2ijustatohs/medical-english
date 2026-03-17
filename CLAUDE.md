# Claude Code 作業ルール

## 単語追加後の必須手順

単語追加・変更を行ったら、**必ず以下をすべて実行すること**：

1. `node build.js` でビルド
2. `git add` & `git commit` & `git push`
3. **sw.js のキャッシュバージョンを +1 してコミット・プッシュ**
   - 例: `'medical-en-v7'` → `'medical-en-v8'`
4. **`git rebase origin/main` してから `git push --force-with-lease`**
   - これをしないと auto-merge ワークフローが失敗してページに反映されない

```bash
# 毎回このセットで締める
git fetch origin
git rebase origin/main
git push --force-with-lease origin claude/review-code-issues-zUUV7
# → 数秒後に origin/main が更新される（GitHub Pages に反映）
```

## ブランチ
- 作業ブランチ: `claude/review-code-issues-zUUV7`
- main へのマージ: auto-merge ワークフローが自動で行う（--ff-only）
- main への直接 push は 403 で不可
