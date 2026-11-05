import { cookies } from "next/headers";
import { AUTH_COOKIE, computeToken, getSitePassword, isValidToken, safeEqual } from "./auth-token";

export async function checkPassword(input: string) {
  const password = getSitePassword();
  if (!password) return false;
  return safeEqual(await computeToken(input), await computeToken(password));
}

export async function issueToken() {
  const password = getSitePassword();
  if (!password) throw new Error("SITE_PASSWORD가 설정되지 않았습니다.");
  return computeToken(password);
}

export async function isAuthed() {
  return isValidToken((await cookies()).get(AUTH_COOKIE)?.value);
}

/**
 * 미들웨어가 1차로 막지만, 민감한 API는 핸들러 안에서도 한 번 더 확인한다.
 * 인증되지 않았으면 401 응답을, 인증됐으면 null을 반환한다.
 */
export async function requireAuth() {
  if (await isAuthed()) return null;
  return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
}
