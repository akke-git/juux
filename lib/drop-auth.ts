import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const DROP_AUTH_COOKIE = "drop_auth";
export const DROP_AUTH_MAX_AGE = 60 * 60 * 24 * 90; // 90일

function getPassword() {
  const password = process.env.DROP_PASSWORD;
  return password && password.length > 0 ? password : null;
}

// 비밀번호를 바꾸면 기존 로그인 쿠키는 모두 무효가 된다.
function expectedToken(password: string) {
  return createHmac("sha256", password).update("juux-drop-auth-v1").digest("hex");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function checkPassword(input: string) {
  const password = getPassword();
  if (!password) return false;
  return safeEqual(expectedToken(input), expectedToken(password));
}

export function issueToken() {
  const password = getPassword();
  if (!password) throw new Error("DROP_PASSWORD가 설정되지 않았습니다.");
  return expectedToken(password);
}

export async function isDropAuthed() {
  const password = getPassword();
  if (!password) return false; // 비밀번호 미설정 시 항상 차단 (fail closed)
  const token = (await cookies()).get(DROP_AUTH_COOKIE)?.value;
  return !!token && safeEqual(token, expectedToken(password));
}

/** 인증되지 않았으면 401 응답을, 인증됐으면 null을 반환한다. */
export async function requireDropAuth() {
  if (await isDropAuthed()) return null;
  return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
}
