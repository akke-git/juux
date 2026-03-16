import { listStoredFiles, saveUploadedFile } from "@/lib/dropbox";

export const runtime = "nodejs";

const DEFAULT_MAX_FILE_MB = 500;

function getMaxFileBytes() {
  const maxFileMb = Number(process.env.DROPBOX_MAX_FILE_MB ?? DEFAULT_MAX_FILE_MB);
  return maxFileMb * 1024 * 1024;
}

export async function GET() {
  try {
    const files = await listStoredFiles();
    return Response.json({ files });
  } catch (error) {
    const message = error instanceof Error ? error.message : "목록을 불러오지 못했습니다.";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData
      .getAll("files")
      .filter((value): value is File => value instanceof File && value.size > 0);

    if (files.length === 0) {
      return Response.json({ error: "업로드할 파일이 없습니다." }, { status: 400 });
    }

    const maxFileBytes = getMaxFileBytes();
    const oversize = files.find((file) => file.size > maxFileBytes);

    if (oversize) {
      return Response.json(
        { error: `${oversize.name} 파일이 최대 업로드 용량을 초과했습니다.` },
        { status: 400 }
      );
    }

    const uploaded = [];

    for (const file of files) {
      uploaded.push(await saveUploadedFile(file));
    }

    return Response.json({ files: uploaded }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "업로드에 실패했습니다.";
    return Response.json({ error: message }, { status: 500 });
  }
}
