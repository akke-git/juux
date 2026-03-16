import { createReadStream } from "node:fs";
import { mkdir, readdir, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export type StoredFile = {
  name: string;
  size: number;
  uploadedAt: string;
  relativePath: string;
};

const DEFAULT_DROPBOX_DIR = path.join(process.cwd(), "storage", "dropbox");

function getDropboxDir() {
  return process.env.DROPBOX_DIR
    ? path.resolve(process.env.DROPBOX_DIR)
    : DEFAULT_DROPBOX_DIR;
}

function sanitizeFileName(fileName: string) {
  const trimmed = fileName.trim();
  const baseName = path.basename(trimmed).replace(/[\u0000-\u001f\u007f]/g, "");

  if (!baseName || baseName === "." || baseName === "..") {
    throw new Error("유효한 파일 이름이 아닙니다.");
  }

  return baseName;
}

function sanitizeRelativePath(relativePath: string) {
  const normalized = relativePath.replace(/\\/g, "/").trim();
  const segments = normalized
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => sanitizeFileName(segment));

  if (segments.length === 0) {
    throw new Error("유효한 경로가 아닙니다.");
  }

  return segments.join("/");
}

async function ensureDropboxDir() {
  await mkdir(getDropboxDir(), { recursive: true });
}

async function resolveUniqueFileName(relativePath: string) {
  const safePath = sanitizeRelativePath(relativePath);
  const directory = path.dirname(safePath);
  const originalName = path.basename(safePath);
  const ext = path.extname(originalName);
  const stem = path.basename(originalName, ext);

  let candidate = safePath;
  let suffix = 1;

  while (true) {
    try {
      await stat(path.join(getDropboxDir(), candidate));
      suffix += 1;
      candidate =
        directory === "."
          ? `${stem} (${suffix})${ext}`
          : `${directory}/${stem} (${suffix})${ext}`;
    } catch {
      return candidate;
    }
  }
}

export async function saveUploadedFile(file: File) {
  await ensureDropboxDir();

  const relativeSourcePath =
    "webkitRelativePath" in file && typeof file.webkitRelativePath === "string" && file.webkitRelativePath
      ? file.webkitRelativePath
      : file.name;

  const relativePath = await resolveUniqueFileName(relativeSourcePath);
  const filePath = path.join(getDropboxDir(), relativePath);
  const buffer = Buffer.from(await file.arrayBuffer());

  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, buffer);

  const fileStat = await stat(filePath);

  return {
    name: path.basename(relativePath),
    size: fileStat.size,
    uploadedAt: fileStat.mtime.toISOString(),
    relativePath
  } satisfies StoredFile;
}

async function walkDropbox(relativeDir = ""): Promise<StoredFile[]> {
  const targetDir = path.join(getDropboxDir(), relativeDir);
  const entries = await readdir(targetDir, { withFileTypes: true });
  const files: StoredFile[] = [];

  for (const entry of entries) {
    if (entry.name === ".gitkeep") {
      continue;
    }

    const nextRelativePath = relativeDir ? `${relativeDir}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      files.push(...(await walkDropbox(nextRelativePath)));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const fileStat = await stat(path.join(getDropboxDir(), nextRelativePath));
    files.push({
      name: entry.name,
      size: fileStat.size,
      uploadedAt: fileStat.mtime.toISOString(),
      relativePath: nextRelativePath
    });
  }

  return files;
}

export async function listStoredFiles() {
  await ensureDropboxDir();
  const files = await walkDropbox();

  return files.sort((a, b) => Date.parse(b.uploadedAt) - Date.parse(a.uploadedAt));
}

export async function deleteStoredFile(relativePath: string) {
  const safePath = sanitizeRelativePath(relativePath);
  await unlink(path.join(getDropboxDir(), safePath));
}

export async function getStoredFile(relativePath: string) {
  const safePath = sanitizeRelativePath(relativePath);
  const filePath = path.join(getDropboxDir(), safePath);
  const fileStat = await stat(filePath);

  return {
    name: path.basename(safePath),
    size: fileStat.size,
    stream: createReadStream(filePath)
  };
}

export async function getStoredFolder(relativePath: string) {
  const safePath = sanitizeRelativePath(relativePath);
  const folderPath = path.join(getDropboxDir(), safePath);
  const folderStat = await stat(folderPath);

  if (!folderStat.isDirectory()) {
    const error = new Error("폴더를 찾을 수 없습니다.");
    Object.assign(error, { code: "ENOTDIR" });
    throw error;
  }

  return {
    name: path.basename(safePath),
    relativePath: safePath,
    absolutePath: folderPath
  };
}

export function encodeDownloadFileName(fileName: string) {
  return encodeURIComponent(fileName).replace(/['()*]/g, (char) =>
    `%${char.charCodeAt(0).toString(16).toUpperCase()}`
  );
}
