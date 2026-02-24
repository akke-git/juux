#!/usr/bin/env bash
set -euo pipefail

APP_DIR=${APP_DIR:-$(pwd)}
cd "$APP_DIR"

if [[ ! -f ".env.prod" ]]; then
  echo "[ERROR] .env.prod not found. Create it from .env.prod.example first."
  exit 1
fi

echo "[INFO] building and starting services..."
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d --build

echo "[INFO] current status:"
docker compose --env-file .env.prod -f docker-compose.prod.yml ps

echo "[DONE] deploy complete"
