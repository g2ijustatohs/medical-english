#!/bin/bash
# 単語追加デプロイスクリプト
# 使い方: ./deploy.sh "コミットメッセージ"
set -e

BRANCH=$(git branch --show-current)
MSG="${1:-単語追加}"

echo "=== ビルド ==="
node build.js

echo ""
echo "=== コミット & プッシュ ==="
git add words.js words_additions.js sw.js
git commit -m "$MSG" || { echo "変更なし、終了します"; exit 0; }

echo ""
echo "=== Rebase & Push ==="
git fetch origin main
git rebase origin/main
git push --force-with-lease origin "$BRANCH"

echo ""
echo "✅ 完了！数秒後に GitHub Pages に反映されます"
