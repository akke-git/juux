import { getGolfDashboardData } from "@/lib/golf-repository";

export async function GET() {
  try {
    const data = await getGolfDashboardData();
    return Response.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "failed to load dashboard";
    return Response.json({ error: message }, { status: 500 });
  }
}
