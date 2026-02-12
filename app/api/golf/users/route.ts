import { createUser } from "@/lib/golf-repository";
import { badRequest, toNumber, toStringValue } from "@/lib/golf-api-utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const username = toStringValue(body.username);
    const email = toStringValue(body.email);
    const password = toStringValue(body.password);

    if (!username || !email || !password) {
      return badRequest("username, email, password는 필수입니다.");
    }

    const id = await createUser({
      username,
      email,
      password,
      display_name: toStringValue(body.display_name),
      handicap: toNumber(body.handicap),
      profile_image: toStringValue(body.profile_image)
    });

    return Response.json({ id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "failed to create user";
    return Response.json({ error: message }, { status: 500 });
  }
}
