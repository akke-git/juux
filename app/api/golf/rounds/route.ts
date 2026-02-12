import { createRound } from "@/lib/golf-repository";
import { badRequest, toNumber, toStringValue } from "@/lib/golf-api-utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const user_id = toNumber(body.user_id);
    const course_id = toNumber(body.course_id);
    const play_date = toStringValue(body.play_date);

    if (!user_id || !course_id || !play_date) {
      return badRequest("user_id, course_id, play_date는 필수입니다.");
    }

    const holeScoreItems: Record<string, unknown>[] = Array.isArray(body.hole_scores)
      ? (body.hole_scores as Record<string, unknown>[])
      : [];

    const holeScores = holeScoreItems
      .map((item) => ({
            hole_number: toNumber(item.hole_number),
            score: toNumber(item.score),
            putts: toNumber(item.putts),
            fairway_hit: item.fairway_hit === null || item.fairway_hit === undefined ? null : Boolean(item.fairway_hit),
            green_in_regulation:
              item.green_in_regulation === null || item.green_in_regulation === undefined
                ? null
                : Boolean(item.green_in_regulation),
            sand_save: item.sand_save === null || item.sand_save === undefined ? null : Boolean(item.sand_save),
            penalty_strokes: toNumber(item.penalty_strokes),
            course_name: toStringValue(item.course_name)
          }))
      .filter((item) => item.hole_number && item.score)
      .map((item) => ({
        hole_number: item.hole_number as number,
        score: item.score as number,
        putts: item.putts,
        fairway_hit: item.fairway_hit,
        green_in_regulation: item.green_in_regulation,
        sand_save: item.sand_save,
        penalty_strokes: item.penalty_strokes,
        course_name: item.course_name
      }));

    const id = await createRound({
      user_id,
      course_id,
      play_date,
      weather: toStringValue(body.weather),
      total_score: toNumber(body.total_score),
      notes: toStringValue(body.notes),
      hole_scores: holeScores
    });

    return Response.json({ id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "failed to create round";
    return Response.json({ error: message }, { status: 500 });
  }
}
