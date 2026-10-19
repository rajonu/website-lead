#!/usr/bin/env bash
set -e

PI_HOST="${PI_HOST:-home-server}"
PI_USER="${PI_USER:-raj}"
PI_TARGET_DIR="/home/raj/website-lead"

echo "🚀 [1/4] Building Next.js locally on Mac (super-fast)..."
npm run build

echo "📦 [2/4] Syncing pre-built standalone app to Raspberry Pi ($PI_HOST)..."
ssh "$PI_USER@$PI_HOST" "mkdir -p $PI_TARGET_DIR/.next/standalone $PI_TARGET_DIR/data"

rsync -avz --delete --exclude 'data' \
  .next/standalone/ "$PI_USER@$PI_HOST:$PI_TARGET_DIR/.next/standalone/"

rsync -avz --ignore-existing \
  data/ "$PI_USER@$PI_HOST:$PI_TARGET_DIR/data/"

rsync -avz scripts/ "$PI_USER@$PI_HOST:$PI_TARGET_DIR/scripts/"

# Ensure standalone directory symlinks to persistent data
ssh "$PI_USER@$PI_HOST" "ln -sfn $PI_TARGET_DIR/data $PI_TARGET_DIR/.next/standalone/data"



echo "🔧 [3/4] Restarting website-lead systemd service on Pi..."
ssh "$PI_USER@$PI_HOST" "sudo -n systemctl restart website-lead.service"

echo "🔍 [4/4] Verifying service health..."
sleep 1.5
ssh "$PI_USER@$PI_HOST" "if sudo systemctl is-active website-lead.service >/dev/null; then echo '✅ Service is ACTIVE on Raspberry Pi!'; else echo '❌ Service failed to start!'; sudo journalctl -u website-lead.service -n 20 --no-pager; exit 1; fi"

echo "🎉 Fast deployment complete in seconds! Dashboard: https://lead.d4f.me | Previews: https://live.d4f.me"
