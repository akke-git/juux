"use client";

import { useState } from "react";
import styles from "./login.module.css";

// 오픈 리다이렉트 방지: 같은 사이트 내부 경로만 허용
function safeNext(next: string | undefined) {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\")
    ? next
    : "/";
}

export function LoginForm({ next }: { next?: string }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!password) return;

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error ?? "로그인에 실패했습니다.");
      }

      // 전체 새로고침으로 이동해 쿠키가 확실히 반영되게 한다
      window.location.replace(safeNext(next));
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Juux</p>
          <h1 className={styles.title}>Sign in</h1>
          <p className={styles.description}>
            비밀번호를 입력하세요. 이 기기에서는 90일 동안 다시 묻지 않습니다.
          </p>
        </section>

        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="비밀번호"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoFocus
          />
          <button className={styles.button} type="submit" disabled={isSubmitting || !password}>
            {isSubmitting ? "확인 중..." : "들어가기"}
          </button>
          {error ? <p className={styles.error}>{error}</p> : null}
        </form>
      </div>
    </main>
  );
}
