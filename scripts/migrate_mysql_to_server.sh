#!/usr/bin/env bash
set -euo pipefail

# Usage example:
# REMOTE_SSH=user@server \
# REMOTE_APP_DIR=/opt/juux \
# SRC_MYSQL_USER=root SRC_MYSQL_PASSWORD=pass \
# ./scripts/migrate_mysql_to_server.sh

: "${REMOTE_SSH:?REMOTE_SSH is required (e.g. user@server)}"

REMOTE_APP_DIR=${REMOTE_APP_DIR:-/opt/juux}
REMOTE_MYSQL_CONTAINER=${REMOTE_MYSQL_CONTAINER:-mysql}
SRC_MYSQL_HOST=${SRC_MYSQL_HOST:-127.0.0.1}
SRC_MYSQL_PORT=${SRC_MYSQL_PORT:-3306}
SRC_MYSQL_USER=${SRC_MYSQL_USER:-root}
: "${SRC_MYSQL_PASSWORD:?SRC_MYSQL_PASSWORD is required}"

TMP_DUMP="/tmp/juux_all_db_$(date +%Y%m%d_%H%M%S).sql"
REMOTE_DUMP="/tmp/juux_all_db.sql"

echo "[INFO] collecting source DB list..."
DB_LIST=$(mysql \
  -h "$SRC_MYSQL_HOST" \
  -P "$SRC_MYSQL_PORT" \
  -u "$SRC_MYSQL_USER" \
  "-p$SRC_MYSQL_PASSWORD" \
  -Nse "SHOW DATABASES" | grep -Ev '^(information_schema|performance_schema|mysql|sys)$' || true)

if [[ -z "$DB_LIST" ]]; then
  echo "[ERROR] no user databases found on source MySQL"
  exit 1
fi

echo "[INFO] dumping databases: $DB_LIST"
mysqldump \
  -h "$SRC_MYSQL_HOST" \
  -P "$SRC_MYSQL_PORT" \
  -u "$SRC_MYSQL_USER" \
  "-p$SRC_MYSQL_PASSWORD" \
  --single-transaction \
  --routines \
  --triggers \
  --databases $DB_LIST > "$TMP_DUMP"

echo "[INFO] copying dump to remote..."
scp "$TMP_DUMP" "$REMOTE_SSH:$REMOTE_DUMP"

echo "[INFO] importing dump into remote container: $REMOTE_MYSQL_CONTAINER"
ssh "$REMOTE_SSH" "docker exec -i $REMOTE_MYSQL_CONTAINER sh -lc 'mysql -uroot -p\"\$MYSQL_ROOT_PASSWORD\"' < $REMOTE_DUMP && rm -f $REMOTE_DUMP"

rm -f "$TMP_DUMP"
echo "[DONE] migration complete"
