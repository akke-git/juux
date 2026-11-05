// 미들웨어(Edge)와 API(Node) 양쪽에서 쓰므로 Web Crypto만 사용한다.

export const AUTH_COOKIE = "juux_auth";
export const AUTH_MAX_AGE = 60 * 60 * 24 * 90; // 90일

export function getSitePassword() {
  const password = process.env.SITE_PASSWORD;
  return password && password.length > 0 ? password : null;
}

// 비밀번호를 바꾸면 기존 로그인 쿠키는 모두 무효가 된다.
export async function computeToken(password: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode("juux-site-auth-v1"));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** 쿠키 토큰이 유효한지 확인. 비밀번호 미설정 시 항상 false (fail closed). */
export async function isValidToken(token: string | undefined) {
  const password = getSitePassword();
  if (!password || !token) return false;
  return safeEqual(token, await computeToken(password));
}
