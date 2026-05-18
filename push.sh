#!/bin/bash
# One-command push helper for Spark.
# Usage:  ./push.sh "what changed"
# Or just: ./push.sh   (uses a default message)

set -e

MSG="${1:-spark update}"

echo "→ git add ."
git add .

if git diff --cached --quiet; then
  echo "Nothing to commit. Working tree is clean."
  exit 0
fi

echo "→ git commit -m \"$MSG\""
git commit -m "$MSG"

echo "→ git push"
git push

echo ""
echo "✓ Pushed. Vercel will deploy in ~30 seconds."
