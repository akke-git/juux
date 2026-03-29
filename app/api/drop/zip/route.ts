import { PassThrough, Readable } from "node:stream";
import archiver from "archiver";
import { getStoredFile, encodeDownloadFileName } from "@/lib/dropbox";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const paths: unknown = body.paths;

    if (!Array.isArray(paths) || paths.length === 0) {
      return Response.json({ error: "파일 경로가 필요합니다." }, { status: 400 });
    }

    const safePaths = paths.filter(
      (p): p is string => typeof p === "string" && p.length > 0
    );

    if (safePaths.length === 0) {
      return Response.json({ error: "유효한 파일 경로가 없습니다." }, { status: 400 });
    }

    const archive = archiver("zip", { zlib: { level: 6 } });
    const output = new PassThrough();

    archive.on("error", (error: Error) => {
      output.destroy(error);
    });

    archive.pipe(output);

    for (const relativePath of safePaths) {
      try {
        const file = await getStoredFile(relativePath);
        archive.append(file.stream, { name: relativePath });
      } catch {
        // skip missing files
      }
    }

    void archive.finalize();

    const timestamp = new Date().toISOString().slice(0, 10);
    const zipName = `drop-${safePaths.length}files-${timestamp}.zip`;

    return new Response(Readable.toWeb(output) as ReadableStream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeDownloadFileName(zipName)}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "ZIP 생성에 실패했습니다.";
    return Response.json({ error: message }, { status: 500 });
  }
}
