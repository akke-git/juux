import { deleteTeamMatch, updateTeamMatch } from "@/lib/golf-repository";
import { badRequest, toNumber, toStringValue } from "@/lib/golf-api-utils";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const matchId = Number(id);

    if (!Number.isFinite(matchId)) {
      return badRequest("유효하지 않은 팀 매치 ID입니다.");
    }

    const body = await request.json();
    const team1_id = toNumber(body.team1_id);
    const team2_id = toNumber(body.team2_id);
    const course_id = toNumber(body.course_id);
    const match_date = toStringValue(body.match_date);

    if (!team1_id || !team2_id || !course_id || !match_date) {
      return badRequest("team1_id, team2_id, course_id, match_date는 필수입니다.");
    }

    if (team1_id === team2_id) {
      return badRequest("같은 팀끼리 매치를 생성할 수 없습니다.");
    }

    await updateTeamMatch(matchId, {
      team1_id,
      team2_id,
      course_id,
      match_date,
      handicap_team: toNumber(body.handicap_team),
      handicap_amount: toNumber(body.handicap_amount),
      match_status: toStringValue(body.match_status),
      winner: toNumber(body.winner)
    });

    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "failed to update team match";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const matchId = Number(id);

    if (!Number.isFinite(matchId)) {
      return badRequest("유효하지 않은 팀 매치 ID입니다.");
    }

    await deleteTeamMatch(matchId);
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "failed to delete team match";
    return Response.json({ error: message }, { status: 500 });
  }
}
