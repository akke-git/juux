#!/usr/bin/env bash
set -euo pipefail

# 추가 마이그 전용 스크립트
# - 포함: password_manager 전체, sveltt(골프 8개 제외)
# - 제외: project, golf
#
# Usage:
#   MYSQL_ROOT_PASSWORD='your-pass' ./migrate_additional_non_golf.sh
#   MYSQL_CONT=mysql MYSQL_ROOT_PASSWORD='your-pass' ./migrate_additional_non_golf.sh /path/to/db_dump.sql

DUMP_FILE="${1:-/home/juu/project/juux/DB/db_dump_20260211.sql}"
MYSQL_CONT="${MYSQL_CONT:-mysql}"
MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-}"
TMP_CONT="${TMP_CONT:-mysql-tmp-extra-$$}"

if [[ -z "${MYSQL_ROOT_PASSWORD}" ]]; then
  echo "[ERROR] MYSQL_ROOT_PASSWORD 환경변수를 설정하세요."
  exit 1
fi

if [[ ! -f "${DUMP_FILE}" ]]; then
  echo "[ERROR] 덤프 파일이 없습니다: ${DUMP_FILE}"
  exit 1
fi

PM_DUMP="/tmp/password_manager_only_$$.sql"
SV_DUMP="/tmp/sveltt_except_golf_$$.sql"

cleanup() {
  rm -f "${PM_DUMP}" "${SV_DUMP}" || true
  docker rm -f "${TMP_CONT}" >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "[1/7] 대상(mysql) 컨테이너 접속 확인..."
docker exec "${MYSQL_CONT}" mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" -e "SELECT 1;" >/dev/null

echo "[2/7] 임시 MySQL 컨테이너 실행: ${TMP_CONT}"
docker run -d --name "${TMP_CONT}" -e MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD}" mysql:8.0 >/dev/null

echo "[3/7] 임시 MySQL 기동 대기..."
for i in {1..60}; do
  if docker exec "${TMP_CONT}" mysqladmin ping -h127.0.0.1 -uroot -p"${MYSQL_ROOT_PASSWORD}" --silent >/dev/null 2>&1; then
    break
  fi
  sleep 2
  if [[ "$i" -eq 60 ]]; then
    echo "[ERROR] 임시 MySQL 컨테이너 기동 시간 초과"
    exit 1
  fi
done

echo "[4/7] 서버 덤프를 임시 MySQL에 복원..."
cat "${DUMP_FILE}" | docker exec -i "${TMP_CONT}" mysql -uroot -p"${MYSQL_ROOT_PASSWORD}"

echo "[5/7] password_manager 전체 덤프 추출..."
docker exec -i "${TMP_CONT}" mysqldump -uroot -p"${MYSQL_ROOT_PASSWORD}" --databases password_manager > "${PM_DUMP}"

echo "[6/7] sveltt(골프 8개 제외) 덤프 추출..."
docker exec -i "${TMP_CONT}" mysqldump -uroot -p"${MYSQL_ROOT_PASSWORD}" --databases sveltt \
  --ignore-table=sveltt.course_holes \
  --ignore-table=sveltt.golf_courses \
  --ignore-table=sveltt.hole_scores \
  --ignore-table=sveltt.rounds \
  --ignore-table=sveltt.team \
  --ignore-table=sveltt.team_match \
  --ignore-table=sveltt.team_match_hole \
  --ignore-table=sveltt.users \
  > "${SV_DUMP}"

echo "[7/7] 대상(mysql)에 추가 마이그 적용..."
cat "${PM_DUMP}" | docker exec -i "${MYSQL_CONT}" mysql -uroot -p"${MYSQL_ROOT_PASSWORD}"
cat "${SV_DUMP}" | docker exec -i "${MYSQL_CONT}" mysql -uroot -p"${MYSQL_ROOT_PASSWORD}"

echo "[VERIFY] DB 목록 (project 제외 기대)"
docker exec "${MYSQL_CONT}" mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" -e "SHOW DATABASES;"

echo "[VERIFY] sveltt 테이블 목록 (골프 8개 제외 기대)"
docker exec "${MYSQL_CONT}" mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" -e "SHOW TABLES FROM sveltt;"

echo "[DONE] 추가 마이그 완료: password_manager + sveltt(골프 제외)"
