# Juux 서버 배포 가이드 (컨테이너명: `juux`, `mysql`)

## 구성 요약

| 항목 | 내용 |
|---|---|
| 컨테이너 | 2개 (`juux` 앱, `mysql` DB) |
| 포트 | 서버 80 → Next.js 3000 직접 연결 (nginx 없음) |
| DB | MySQL 8.4, 볼륨으로 데이터 영구 보존 |
| 앱 빌드 | Next.js standalone (multi-stage Docker 빌드) |
| 배포 경로 | `/opt/juux` |

**최초 배포:** 접속 → 코드 배치 → 환경변수 → 컨테이너 정리 → 실행 → DB 마이그레이션
**재배포:** `git pull` → `server_deploy.sh`

---

아래 순서대로 그대로 실행하면 됩니다.

## 0) 준비물

- 서버 SSH 정보: `서버계정@서버IP`
- Git 저장소 URL
- 로컬 MySQL 비밀번호
- 서버에 Docker / Docker Compose 설치
- 로컬 PC에 `mysql-client` 설치 (단계 6 마이그레이션 시 필요)
  - Ubuntu/Debian: `sudo apt install mysql-client`
  - macOS: `brew install mysql-client`

---

## 1) 서버 접속

실행 위치: **내 PC 터미널**

```bash
ssh 서버계정@서버IP
```

예시:

```bash
ssh ubuntu@1.2.3.4
```

---

## 2) 서버에 프로젝트 코드 배치

실행 위치: **서버 터미널**

```bash
sudo mkdir -p /opt/juux
sudo chown -R $USER:$USER /opt/juux
cd /opt/juux
```

처음 배포:

```bash
git clone <저장소URL> .
```

이미 배포된 적이 있으면:

```bash
git pull
```

---

## 3) 서버 환경변수 파일 생성

실행 위치: **서버 터미널**

```bash
cd /opt/juux
cp .env.prod.example .env.prod
nano .env.prod
```

아래 항목을 반드시 입력:

```env
MYSQL_ROOT_PASSWORD=강한비밀번호
MYSQL_DATABASE=golf
TZ=Asia/Seoul
```

---

## 4) 기존 컨테이너 정리 (삭제)

> ⚠️ **최초 배포 시에만 실행.** 코드 업데이트 재배포 시에는 이 단계를 건너뛰고 단계 5만 실행하세요.
> (mysql 컨테이너가 삭제되면 볼륨은 유지되지만 불필요하게 DB가 내려갑니다)

실행 위치: **서버 터미널**

```bash
cd /opt/juux
./scripts/server_reset_old_containers.sh
```

기본 삭제 대상:

- `nginx`
- `mysql`
- `juux`
- `juux-nginx`
- `juux-mysql`
- `juux-app`

---

## 5) 새 컨테이너 생성/실행

실행 위치: **서버 터미널**

```bash
cd /opt/juux
./scripts/server_deploy.sh
```

생성되는 컨테이너 (2개):

- 앱: `juux` (포트 80으로 직접 서비스)
- DB: `mysql`

상태 확인:

```bash
docker compose --env-file .env.prod -f docker-compose.prod.yml ps
```

---

## 6) 로컬 MySQL -> 서버 MySQL 전체 마이그레이션

실행 위치: **내 PC 터미널** (서버 아님)

```bash
cd /home/juu/project/juux

REMOTE_SSH=서버계정@서버IP \
SRC_MYSQL_USER=root \
SRC_MYSQL_PASSWORD=로컬MYSQL비밀번호 \
./scripts/migrate_mysql_to_server.sh
```

예시:

```bash
REMOTE_SSH=ubuntu@1.2.3.4 \
SRC_MYSQL_USER=root \
SRC_MYSQL_PASSWORD=abcd1234 \
./scripts/migrate_mysql_to_server.sh
```

이 스크립트는 시스템 DB를 제외한 모든 로컬 DB를 dump해서 서버의 `mysql` 컨테이너로 import 합니다.

---

## 7) 마이그레이션 확인

실행 위치: **서버 터미널**

```bash
docker exec -it mysql sh -lc 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e "SHOW DATABASES;"'
docker exec -it mysql sh -lc 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e "USE golf; SHOW TABLES;"'
```

---

## 8) 장애 시 로그 확인

실행 위치: **서버 터미널**

```bash
cd /opt/juux
docker compose --env-file .env.prod -f docker-compose.prod.yml logs -f juux
docker compose --env-file .env.prod -f docker-compose.prod.yml logs -f mysql
```

---

## 9) HTTPS 설정 (권장)

현재 nginx는 HTTP(80)만 지원합니다. 외부 접근이 있는 서버라면 HTTPS 설정을 권장합니다.

**옵션 A. Cloudflare 프록시 (가장 간단)**

1. 도메인의 DNS를 Cloudflare로 위임
2. A 레코드에 서버 IP 등록, 프록시(주황 구름) 활성화
3. Cloudflare가 자동으로 HTTPS 처리 — 서버 설정 불필요

**옵션 B. Let's Encrypt + certbot**

```bash
# 서버에서 실행
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d 도메인명
```
