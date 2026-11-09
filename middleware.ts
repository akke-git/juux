import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, isValidToken } from "@/lib/auth-token";

// 로그인 없이 접근 가능한 경로
const PUBLIC_PATHS = new Set(["/login", "/api/auth"]);

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  if (await isValidToken(request.cookies.get(AUTH_COOKIE)?.value)) {
    // juutoki 화면은 상대 경로를 쓰므로 /toki → /toki/ 로 보낸다.
    // next.config의 redirects는 /toki/ 까지 잡아 루프가 생기므로 원본 URL로 직접 판단한다.
    if (new URL(request.url).pathname === "/toki") {
      return NextResponse.redirect(new URL("/toki/" + search, externalOrigin(request)));
    }
    return NextResponse.next();
  }

  // /toki/api/* 는 juutoki의 API. 화면이 fetch로 부르므로 로그인 페이지 대신 401을 준다
  if (pathname.startsWith("/api/") || pathname.startsWith("/toki/api/")) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const loginUrl = new URL("/login", externalOrigin(request));
  if (pathname !== "/") {
    loginUrl.searchParams.set("next", pathname + search);
  }
  return NextResponse.redirect(loginUrl);
}

// 프록시(Nginx) 뒤에서는 request.url이 컨테이너 내부 주소이므로
// 프록시가 넘겨준 Host / X-Forwarded-Proto로 바깥 주소를 만든다
function externalOrigin(request: NextRequest) {
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? request.nextUrl.host;
  const proto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
    request.nextUrl.protocol.replace(":", "");
  return `${proto}://${host}`;
}

export const config = {
  // 빌드 산출물(JS/CSS/폰트), 이미지 최적화, 공개 아이콘 이미지는 제외
  matcher: ["/((?!_next/static|_next/image|images/|favicon.ico|robots.txt).*)"]
};
