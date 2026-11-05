"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./drop-page.module.css";

export function DropLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!password) return;

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/drop/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error ?? "로그인에 실패했습니다.");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <div className={styles.heroTop}>
            <Link href="/" className={styles.backButton}>
              Back
            </Link>
            <p className={styles.eyebrow}>Drop Space</p>
          </div>
          <h1 className={styles.title}>File Transfer</h1>
          <p className={styles.description}>
            비밀번호를 입력하세요. 이 기기에서는 90일 동안 다시 묻지 않습니다.
          </p>
        </section>

        <form className={styles.loginForm} onSubmit={handleSubmit}>
          <input
            className={styles.loginInput}
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
          {error ? <p className={styles.loginError}>{error}</p> : null}
        </form>
      </div>
    </main>
  );
}
