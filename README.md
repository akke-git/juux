# Juux Landing (Next.js)

현재 `new.pen` 디자인 기준으로 메인 랜딩 페이지를 구현한 Next.js 프로젝트입니다.

## 시작하기

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 구현 범위

- Hero 섹션 (`Juux.net`, 배지형 정보 요소)
- Services 섹션 (아이콘 + 서비스명, 데스크탑 8열 / 모바일 2열)
- Golf Rounds 섹션 (Team Match / My Rounds)
- Blog 섹션 (데스크탑 카드형 / 모바일 리스트형)
- Footer 섹션 (네비게이션/서비스 링크)
- `public/images`의 PNG 아이콘/배경 사용

## 주요 경로

- `app/page.tsx`
- `components/hero-section.tsx`
- `components/services-section.tsx`
- `data/services.ts`
- `app/globals.css`

## 로컬 MySQL (Docker Compose)

```bash
cp .env.mysql.example .env.mysql
docker compose --env-file .env.mysql -f docker-compose.mysql.yml up -d
```

접속 정보 기본값:
- Host: `127.0.0.1`
- Port: `3306`
- User: `root`
- Password: `.env.mysql`의 `MYSQL_ROOT_PASSWORD`
- DB: `golf`
