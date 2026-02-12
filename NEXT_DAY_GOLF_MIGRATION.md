# Golf 데이터 마이그레이션 작업 노트 (다음 작업용)

## 1) 오늘 결정사항 요약
- 아키텍처는 **분리형 컨테이너**로 유지:
  - `web(app)` + `db(mysql)` + `reverse-proxy(nginx)`
- DB는 우선 **MySQL 유지**:
  - 기존 데이터 활용/마이그레이션 비용 최소화
- 대상 데이터는 `sveltt` DB 전체가 아니라 아래 8개 테이블만 사용:
  - `course_holes`
  - `golf_courses`
  - `hole_scores`
  - `rounds`
  - `team`
  - `team_match`
  - `team_match_hole`
  - `users`
- 신규 DB 이름은 `golf`

## 2) 확인된 덤프 파일
- 경로: `/home/juu/project/db_dump_20260211.sql`
- 파일 내 `sveltt` 및 골프 관련 테이블의 `CREATE TABLE`/`INSERT INTO` 존재 확인 완료

## 3) 내일 실행 절차 (복붙용)
```bash
# 0) 변수
DUMP=/home/juu/project/db_dump_20260211.sql
MYSQL_ROOT_PASSWORD='rootpass'
MYSQL_CONT=golf-mysql

# 1) 로컬 MySQL 컨테이너 실행
docker run -d --name $MYSQL_CONT \
  -e MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD \
  -p 3306:3306 \
  -v golf_mysql_data:/var/lib/mysql \
  mysql:8.0

# 2) 원본 덤프 전체 복원 (sveltt 포함)
cat $DUMP | docker exec -i $MYSQL_CONT \
  mysql -uroot -p$MYSQL_ROOT_PASSWORD

# 3) 대상 DB 생성
docker exec -i $MYSQL_CONT mysql -uroot -p$MYSQL_ROOT_PASSWORD -e "CREATE DATABASE IF NOT EXISTS golf;"

# 4) sveltt에서 필요한 8개 테이블만 덤프
docker exec -i $MYSQL_CONT \
  mysqldump -uroot -p$MYSQL_ROOT_PASSWORD \
  sveltt course_holes golf_courses hole_scores rounds team team_match team_match_hole users \
  > /home/juu/project/golf_only.sql

# 5) golf DB로 복원
cat /home/juu/project/golf_only.sql | docker exec -i $MYSQL_CONT \
  mysql -uroot -p$MYSQL_ROOT_PASSWORD golf
```

## 4) 검증 쿼리
```bash
docker exec -i $MYSQL_CONT mysql -uroot -p$MYSQL_ROOT_PASSWORD -e "USE golf; SHOW TABLES;"
docker exec -i $MYSQL_CONT mysql -uroot -p$MYSQL_ROOT_PASSWORD -e "SELECT COUNT(*) FROM golf.rounds; SELECT COUNT(*) FROM golf.team_match;"
```

## 5) 선택 정리 작업 (필요 시)
`golf`만 남기고 `sveltt`를 정리하고 싶으면:
```bash
docker exec -i $MYSQL_CONT mysql -uroot -p$MYSQL_ROOT_PASSWORD -e "DROP DATABASE IF EXISTS sveltt;"
```

## 6) 참고
- `mysqldump: Couldn't execute 'show create table general_log' ...` 오류는 시스템 DB 덤프 시 발생하는 케이스이며,
  앱 DB/테이블만 덤프하면 회피 가능.
- `Using a password on the command line interface can be insecure.`는 경고이며 치명적 오류는 아님.

---

## 7) 현재 진행현황 (2026-02-12)

### DB/마이그레이션
- 로컬 MySQL 기준 `golf` DB 마이그레이션 완료.
- `project` DB는 마이그 대상에서 제외하기로 확정.
- 추가 마이그 스크립트 정리 완료:
  - `DB/migrate_golf_tables.sh` (골프 8개 테이블 이관)
  - `DB/migrate_additional_non_golf.sh` (`password_manager` + `sveltt(골프 제외)`)
- 스크립트 내 루트 비밀번호 하드코딩 제거하고 환경변수 방식으로 원복 완료.

### 웹 기능 구현(단일 페이지 + 모달)
- 골프 관리 단일 페이지 추가: `app/golf/page.tsx`
- 실제 UI 컴포넌트 추가: `components/golf-dashboard.tsx`
  - 한 화면에서 `개인 라운드 / 팀 매치` 조회
  - 사용자/팀 관리 모달 (등록/수정)
  - 라운드/팀매치 등록 모달
- API 라우트 추가:
  - 조회: `app/api/golf/dashboard/route.ts`
  - 사용자: `app/api/golf/users/route.ts`, `app/api/golf/users/[id]/route.ts`
  - 팀: `app/api/golf/teams/route.ts`, `app/api/golf/teams/[id]/route.ts`
  - 라운드: `app/api/golf/rounds/route.ts`
  - 팀매치: `app/api/golf/matches/route.ts`
- DB 연결/쿼리 레이어 추가:
  - `lib/mysql.ts`
  - `lib/golf-repository.ts`
  - `lib/golf-api-utils.ts`
- 스타일 적용:
  - `app/globals.css`에 `/golf` 페이지 스타일 추가
  - 홈 골프 섹션에서 `/golf` 이동 링크 연결 (`components/golf-section.tsx`)

### 실행 상태
- `npm run lint` 통과.
- `npm install`은 네트워크 문제(`EAI_AGAIN`)로 실패하여 `mysql2` 설치 미완료.
- 따라서 `npx tsc --noEmit` / `next build`은 `mysql2/promise` 모듈 없음으로 실패.

---

## 8) 내일 해야 할 일 (우선순위)

### P0. 실행 환경 마무리
1. 의존성 설치
```bash
cd /home/juu/project/juux
npm install
```
2. 환경변수 파일 설정 (`.env.local`)
```env
GOLF_DB_HOST=127.0.0.1
GOLF_DB_PORT=3306
GOLF_DB_USER=root
GOLF_DB_PASSWORD=YOUR_PASSWORD
GOLF_DB_NAME=golf
```
3. 빌드/실행 확인
```bash
npm run lint
npx tsc --noEmit
npm run dev
```
접속: `http://localhost:3000/golf`

### P1. 기능 점검
1. 사용자 등록/수정 API + UI 동작 확인
2. 팀 등록/수정 API + UI 동작 확인
3. 개인 라운드 등록 후 목록 반영 확인
4. 팀 매치 등록 후 목록 반영 확인

### P2. 후속 개선(필요 시)
1. 라운드/매치 **수정** 기능 추가 (현재는 등록 중심)
2. `team_match_hole.winner_team` 값 규칙 통일
   - 현재 데이터에 `0/1/2`와 `team_id` 의미가 혼재 가능성 있음
3. 유효성 강화
   - 팀 생성 시 동일 사용자 중복 금지(앱 단 + DB 제약)
   - 팀 매치 시 동일 팀 매칭 금지
4. 비밀번호 저장 정책 재검토(평문 저장 금지, 해시 적용)

---

## 9) 참고 파일
- 마이그 스크립트: `DB/migrate_golf_tables.sh`
- 추가 마이그 스크립트: `DB/migrate_additional_non_golf.sh`
- 골프 페이지: `app/golf/page.tsx`
- 골프 UI: `components/golf-dashboard.tsx`
- API 루트: `app/api/golf/*`
- DB 연동: `lib/mysql.ts`, `lib/golf-repository.ts`
