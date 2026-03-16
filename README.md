# Juux Landing (Next.js)

메인 랜딩 페이지와 골프 대시보드를 포함한 Next.js 프로젝트입니다.

## 시작하기

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 주요 기능

- Hero 섹션 (`Juux.net`, 배지형 정보 요소)
- Drop Space (`/drop`) 임시 파일 업로드/다운로드/삭제
- Services 섹션 (아이콘 + 서비스명, 데스크탑 8열 / 모바일 2열)
- Golf 섹션 (Team Match / My Rounds 요약)
- Golf 관리 페이지 (`/golf`, 사용자/팀/라운드/매치 CRUD API 연동)
- Favorite 섹션 (데스크탑 카드형 / 모바일 리스트형)
- Footer 섹션 (네비게이션/서비스 링크)
- `public/images` 정적 자산 사용

## 주요 경로

- `app/page.tsx`
- `app/drop/page.tsx`
- `app/golf/page.tsx`
- `app/api/golf/**`
- `app/api/drop/**`
- `components/hero-section.tsx`
- `components/services-section.tsx`
- `components/golf-dashboard.tsx`
- `data/services.ts`
- `app/globals.css`

## 환경 변수

```bash
DROPBOX_DIR=./storage/dropbox
DROPBOX_MAX_FILE_MB=500
GOLF_DB_HOST=127.0.0.1
GOLF_DB_PORT=3306
GOLF_DB_USER=root
GOLF_DB_PASSWORD=
GOLF_DB_NAME=golf
```

`lib/mysql.ts`에서 위 값을 읽어 MySQL 연결 풀을 생성합니다.

`/drop` 기능은 `DROPBOX_DIR`에 파일을 저장합니다. 다수 파일 드래그앤드롭 업로드를 지원하고, 폴더 선택 업로드 시 하위 파일 구조를 유지합니다. 파일은 개별 다운로드, 폴더는 zip 다운로드를 지원합니다.

## 배포 (Docker)

### 1) 서버 준비

서버에서 프로젝트 루트로 이동 후:

```bash
cp .env.prod.example .env.prod
# .env.prod에서 MYSQL_ROOT_PASSWORD 수정
```

기존 nginx/mysql 컨테이너 정리(필요 시):

```bash
./scripts/server_reset_old_containers.sh
```

### 2) 서비스 배포

```bash
./scripts/server_deploy.sh
```

- Next.js: `juux-app`
- MySQL: `juux-mysql`
- Nginx: `juux-nginx` (80 포트)

### 3) 로컬 MySQL -> 서버 MySQL 마이그레이션

로컬에서 실행:

```bash
REMOTE_SSH=user@server \
SRC_MYSQL_USER=root \
SRC_MYSQL_PASSWORD=your_local_mysql_password \
./scripts/migrate_mysql_to_server.sh
```

기본값:
- 원격 컨테이너: `juux-mysql`
- 원격 배치 경로: `/tmp/juux_all_db.sql`
- 로컬에서 시스템 DB(`mysql`, `sys`, `information_schema`, `performance_schema`) 제외 후 모든 DB 마이그레이션
