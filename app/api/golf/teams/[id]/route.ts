import { updateTeam } from "@/lib/golf-repository";
import { badRequest, toNumber, toStringValue } from "@/lib/golf-api-utils";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const teamId = Number(id);

    if (!Number.isFinite(teamId)) {
      return badRequest("유효하지 않은 팀 ID입니다.");
    }

    const body = await request.json();
    const team_name = toStringValue(body.team_name);
    const user1_id = toNumber(body.user1_id);
    const user2_id = toNumber(body.user2_id);

    if (!team_name || !user1_id || !user2_id) {
      return badRequest("team_name, user1_id, user2_id는 필수입니다.");
    }

    if (user1_id === user2_id) {
      return badRequest("같은 사용자를 중복 선택할 수 없습니다.");
    }

    await updateTeam(teamId, {
      team_name,
      user1_id,
      user2_id,
      team_image: toStringValue(body.team_image)
    });

    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "failed to update team";
    return Response.json({ error: message }, { status: 500 });
  }
}
