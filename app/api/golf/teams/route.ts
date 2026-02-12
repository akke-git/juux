import { createTeam } from "@/lib/golf-repository";
import { badRequest, toNumber, toStringValue } from "@/lib/golf-api-utils";

export async function POST(request: Request) {
  try {
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

    const id = await createTeam({
      team_name,
      user1_id,
      user2_id,
      team_image: toStringValue(body.team_image)
    });

    return Response.json({ id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "failed to create team";
    return Response.json({ error: message }, { status: 500 });
  }
}
