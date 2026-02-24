#!/usr/bin/env bash
set -euo pipefail

# Remove old nginx/mysql containers if they exist.
# You can override target names:
# TARGET_CONTAINERS="nginx mysql juux juux-nginx juux-mysql juux-app" ./scripts/server_reset_old_containers.sh

TARGET_CONTAINERS=${TARGET_CONTAINERS:-"nginx mysql juux juux-nginx juux-mysql juux-app"}

for name in $TARGET_CONTAINERS; do
  if docker ps -a --format '{{.Names}}' | grep -Fxq "$name"; then
    echo "[INFO] removing container: $name"
    docker rm -f "$name"
  else
    echo "[INFO] not found: $name"
  fi
done

echo "[DONE] container cleanup complete"
