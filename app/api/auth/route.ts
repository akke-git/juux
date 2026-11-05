import { cookies } from "next/headers";
import { AUTH_COOKIE, AUTH_MAX_AGE } from "@/lib/auth-token";
import { checkPassword, issueToken } from "@/lib/site-auth";

export const runtime = "nodejs";

// 간단한 무차별 대입 방지: 클라이언트별 15분에 실패 10회까지
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 10;
const failures = new Map<string, { count: number; resetAt: number }>();

function clientKey(request: Request) {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

function isLocked(key: string) {
  const entry = failures.get(key);
  if (!entry) return false;
  if (Date.now() > entry.resetAt) {
    failures.delete(key);
    return false;
  }
  return entry.count >= MAX_FAILURES;
}

function recordFailure(key: string) {
  const now = Date.now();
  const entry = failures.get(key);
  if (!entry || now > entry.resetAt) {
    failures.set(key, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

export async function POST(request: Request) {
  const key = clientKey(request);

  if (isLocked(key)) {
    return Response.json(
      { error: "시도가 너무 많습니다. 잠시 후 다시 시도하세요." },
      { status: 429 }
    );
  }

  let password = "";
  try {
    const body = await request.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    // 잘못된 요청 본문은 실패로 처리
  }

  if (!(await checkPassword(password))) {
    recordFailure(key);
    await new Promise((resolve) => setTimeout(resolve, 800));
    return Response.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  failures.delete(key);
  (await cookies()).set(AUTH_COOKIE, await issueToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_MAX_AGE
  });

  return Response.json({ ok: true });
}

export async function DELETE() {
  (await cookies()).delete(AUTH_COOKIE);
  return Response.json({ ok: true });
}
