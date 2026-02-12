import type { Metadata } from "next";
import { GolfDashboard } from "@/components/golf-dashboard";

export const metadata: Metadata = {
  title: "Golf Manager | Juux",
  description: "Golf 사용자, 팀, 개인라운드, 팀매치 통합 관리"
};

export default function GolfPage() {
  return <GolfDashboard />;
}
