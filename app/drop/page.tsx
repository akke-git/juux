import type { Metadata } from "next";
import { DropClient } from "./drop-client";

export const metadata: Metadata = {
  title: "Drop Space | Juux",
  description: "간단한 임시 파일 업로드와 다운로드"
};

export default function DropPage() {
  return <DropClient />;
}
