import { createTeamMatch } from "@/lib/golf-repository";
import { badRequest, toNumber, toStringValue } from "@/lib/golf-api-utils";

export async function POST(request: Request) {
  try {
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

    const holeResultItems: Record<string, unknown>[] = Array.isArray(body.hole_results)
      ? (body.hole_results as Record<string, unknown>[])
      : [];

    const holeResults = holeResultItems
      .map((item) => ({
        hole_number: toNumber(item.hole_number),
        winner_team: toNumber(item.winner_team)
      }))
      .filter((item) => item.hole_number)
      .map((item) => ({
        hole_number: item.hole_number as number,
        winner_team: item.winner_team
      }));

    const id = await createTeamMatch({
      team1_id,
      team2_id,
      course_id,
      match_date,
      handicap_team: toNumber(body.handicap_team),
      handicap_amount: toNumber(body.handicap_amount),
      match_status: toStringValue(body.match_status),
      winner: toNumber(body.winner),
      hole_results: holeResults
    });

    return Response.json({ id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "failed to create team match";
    return Response.json({ error: message }, { status: 500 });
  }
}
