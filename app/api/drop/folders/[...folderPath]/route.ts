import { PassThrough } from "node:stream";
import { Readable } from "node:stream";
import archiver from "archiver";
import { encodeDownloadFileName, getStoredFolder } from "@/lib/dropbox";

export const runtime = "nodejs";

type Params = {
  params: Promise<{
    folderPath: string[];
  }>;
};

function resolveRelativePath(folderPath: string[]) {
  return folderPath
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
    const { folderPath } = await context.params;
    const target = await getStoredFolder(resolveRelativePath(folderPath));

    const archive = archiver("zip", {
      zlib: { level: 9 }
    });
    const output = new PassThrough();

    archive.on("error", (error: Error) => {
      output.destroy(error);
    });

    archive.pipe(output);
    archive.directory(target.absolutePath, target.name);
    void archive.finalize();

    return new Response(Readable.toWeb(output) as ReadableStream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeDownloadFileName(`${target.name}.zip`)}`,
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    const message =
      error instanceof Error && "code" in error && (error.code === "ENOENT" || error.code === "ENOTDIR")
        ? "폴더를 찾을 수 없습니다."
        : error instanceof Error
          ? error.message
          : "폴더 다운로드에 실패했습니다.";

    return Response.json({ error: message }, { status: 404 });
  }
}
