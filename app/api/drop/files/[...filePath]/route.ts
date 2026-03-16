import { Readable } from "node:stream";
import { deleteStoredFile, encodeDownloadFileName, getStoredFile } from "@/lib/dropbox";

export const runtime = "nodejs";

type Params = {
  params: Promise<{
    filePath: string[];
  }>;
};

function resolveRelativePath(filePath: string[]) {
  return filePath
    .map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    })
    .join("/");
}

export async function GET(_: Request, context: Params) {
  try {
    const { filePath } = await context.params;
    const target = await getStoredFile(resolveRelativePath(filePath));

    return new Response(Readable.toWeb(target.stream) as ReadableStream, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Length": String(target.size),
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeDownloadFileName(target.name)}`,
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    const message =
      error instanceof Error && "code" in error && error.code === "ENOENT"
        ? "파일을 찾을 수 없습니다."
        : error instanceof Error
          ? error.message
          : "다운로드에 실패했습니다.";

    return Response.json({ error: message }, { status: 404 });
  }
}

export async function DELETE(_: Request, context: Params) {
  try {
    const { filePath } = await context.params;
    await deleteStoredFile(resolveRelativePath(filePath));
    return Response.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error && "code" in error && error.code === "ENOENT"
        ? "파일을 찾을 수 없습니다."
        : error instanceof Error
          ? error.message
          : "삭제에 실패했습니다.";

    return Response.json({ error: message }, { status: 404 });
  }
}
