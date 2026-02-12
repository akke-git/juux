import { updateUser } from "@/lib/golf-repository";
import { badRequest, toNumber, toStringValue } from "@/lib/golf-api-utils";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const userId = Number(id);

    if (!Number.isFinite(userId)) {
      return badRequest("유효하지 않은 사용자 ID입니다.");
    }

    const body = await request.json();
    const username = toStringValue(body.username);
    const email = toStringValue(body.email);

    if (!username || !email) {
      return badRequest("username, email은 필수입니다.");
    }

    await updateUser(userId, {
      username,
      email,
      password: toStringValue(body.password),
      display_name: toStringValue(body.display_name),
      handicap: toNumber(body.handicap),
      profile_image: toStringValue(body.profile_image)
    });

    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "failed to update user";
    return Response.json({ error: message }, { status: 500 });
  }
}
