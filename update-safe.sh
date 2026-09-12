#!/data/data/com.termux/files/usr/bin/bash
set -e
cd "$(dirname "$0")"

echo "═══ 1. Guardando cambios locales ═══"
git add -A
git commit -m "WIP $(date +%Y-%m-%d_%H:%M)" || echo "  (nada nuevo)"

echo "═══ 2. Bajando cambios oficiales ═══"
git fetch origin
git checkout main
git pull origin main

echo "═══ 3. Reaplicando tus cambios custom ═══"
git checkout custom
if git rebase main; then
  echo "✓ Rebase sin conflictos"
else
  echo "⚠️ CONFLICTOS. Resuélvelos y luego: git rebase --continue"
  echo "   o cancelar con: git rebase --abort"
  exit 1
fi

echo "═══ 4. Reiniciando bot ═══"
pm2 restart wa-bot
echo "✓ Actualización completa"
