import type { Metadata } from "next";
import { isDropAuthed } from "@/lib/drop-auth";
import { DropClient } from "./drop-client";
import { DropLogin } from "./drop-login";

export const metadata: Metadata = {
  title: "Drop Space | Juux",
  description: "간단한 임시 파일 업로드와 다운로드"
};

export const dynamic = "force-dynamic";

export default async function DropPage() {
  if (!(await isDropAuthed())) {
    return <DropLogin />;
  }

  return <DropClient />;
}
