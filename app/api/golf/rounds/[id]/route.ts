import { deleteRound, updateRound } from "@/lib/golf-repository";
import { badRequest, toNumber, toStringValue } from "@/lib/golf-api-utils";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const roundId = Number(id);

    if (!Number.isFinite(roundId)) {
      return badRequest("유효하지 않은 라운드 ID입니다.");
    }

    const body = await request.json();
    const user_id = toNumber(body.user_id);
    const course_id = toNumber(body.course_id);
    const play_date = toStringValue(body.play_date);

    if (!user_id || !course_id || !play_date) {
      return badRequest("user_id, course_id, play_date는 필수입니다.");
    }

    await updateRound(roundId, {
      user_id,
      course_id,
      play_date,
      weather: toStringValue(body.weather),
      total_score: toNumber(body.total_score),
      notes: toStringValue(body.notes)
    });

    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "failed to update round";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const roundId = Number(id);

    if (!Number.isFinite(roundId)) {
      return badRequest("유효하지 않은 라운드 ID입니다.");
    }

    await deleteRound(roundId);
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "failed to delete round";
    return Response.json({ error: message }, { status: 500 });
  }
}
