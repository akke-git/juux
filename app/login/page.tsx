import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/site-auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in | Juux",
  robots: { index: false, follow: false }
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  if (await isAuthed()) {
    redirect("/");
  }

  const { next } = await searchParams;
  return <LoginForm next={next} />;
}
