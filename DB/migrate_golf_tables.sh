#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   MYSQL_ROOT_PASSWORD='your-pass' ./migrate_golf_tables.sh
#   MYSQL_CONT=mysql MYSQL_ROOT_PASSWORD='your-pass' ./migrate_golf_tables.sh /path/to/dump.sql

DUMP_FILE="${1:-/home/juu/project/juux/DB/db_dump_20260211.sql}"
MYSQL_CONT="${MYSQL_CONT:-mysql}"
MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-}"
SOURCE_DB="${SOURCE_DB:-sveltt}"
TARGET_DB="${TARGET_DB:-golf}"

TABLES=(
  course_holes
  golf_courses
  hole_scores
  rounds
  team
  team_match
  team_match_hole
  users
)

if [[ -z "${MYSQL_ROOT_PASSWORD}" ]]; then
  echo "[ERROR] MYSQL_ROOT_PASSWORD 환경변수를 설정하세요."
  exit 1
fi

if [[ ! -f "${DUMP_FILE}" ]]; then
  echo "[ERROR] 덤프 파일이 없습니다: ${DUMP_FILE}"
  exit 1
fi

echo "[1/5] MySQL 컨테이너 접속 확인..."
docker exec "${MYSQL_CONT}" mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" -e "SELECT 1;" >/dev/null

echo "[2/5] ${SOURCE_DB} DB 존재 여부 확인..."
SOURCE_EXISTS=$(docker exec "${MYSQL_CONT}" mysql -N -s -uroot -p"${MYSQL_ROOT_PASSWORD}" \
  -e "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME='${SOURCE_DB}';")

if [[ -z "${SOURCE_EXISTS}" ]]; then
  echo "[INFO] ${SOURCE_DB} DB가 없어 덤프 전체를 먼저 복원합니다: ${DUMP_FILE}"
  cat "${DUMP_FILE}" | docker exec -i "${MYSQL_CONT}" mysql -uroot -p"${MYSQL_ROOT_PASSWORD}"
else
  echo "[INFO] ${SOURCE_DB} DB가 이미 존재하여 덤프 전체 복원은 건너뜁니다."
fi

echo "[3/5] 대상 DB 생성: ${TARGET_DB}"
docker exec "${MYSQL_CONT}" mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" \
  -e "CREATE DATABASE IF NOT EXISTS \`${TARGET_DB}\`;"

echo "[4/5] ${SOURCE_DB} -> ${TARGET_DB} 골프 테이블 이관"
TMP_DUMP="/tmp/golf_only_$$.sql"

docker exec "${MYSQL_CONT}" mysqldump -uroot -p"${MYSQL_ROOT_PASSWORD}" \
  "${SOURCE_DB}" "${TABLES[@]}" > "${TMP_DUMP}"

docker exec -i "${MYSQL_CONT}" mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" "${TARGET_DB}" < "${TMP_DUMP}"
rm -f "${TMP_DUMP}"

echo "[5/5] 검증"
docker exec "${MYSQL_CONT}" mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" -e "
  USE \`${TARGET_DB}\`;
  SHOW TABLES;
  SELECT 'rounds' AS table_name, COUNT(*) AS cnt FROM \`${TARGET_DB}\`.rounds
  UNION ALL
  SELECT 'team_match' AS table_name, COUNT(*) AS cnt FROM \`${TARGET_DB}\`.team_match;
"

echo "[DONE] 골프 테이블 마이그레이션 완료"
