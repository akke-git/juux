"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./drop-page.module.css";

type DropFile = {
  name: string;
  size: number;
  uploadedAt: string;
  relativePath: string;
};

type DropFolder = {
  path: string;
  name: string;
  fileCount: number;
};

function buildFileUrl(relativePath: string) {
  return `/api/drop/files/${relativePath.split("/").map(encodeURIComponent).join("/")}`;
}

function buildFolderZipUrl(relativePath: string) {
  return `/api/drop/folders/${relativePath.split("/").map(encodeURIComponent).join("/")}`;
}

function formatSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  const units = ["KB", "MB", "GB"];
  let value = size / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(isoDate));
}

export function DropClient() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<DropFile[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloadingMany, setIsDownloadingMany] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [, setDragDepth] = useState(0);

  async function refreshFiles() {
    setIsLoading(true);

    try {
      const response = await fetch("/api/drop/files", { cache: "no-store" });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "파일 목록을 불러오지 못했습니다.");
      }

      setFiles(result.files);
      setSelected((prev) =>
        prev.filter((relativePath) =>
          result.files.some((file: DropFile) => file.relativePath === relativePath)
        )
      );
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "파일 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void refreshFiles();
  }, []);

  useEffect(() => {
    const folderInput = folderInputRef.current;

    if (!folderInput) {
      return;
    }

    folderInput.setAttribute("webkitdirectory", "");
    folderInput.setAttribute("directory", "");
  }, []);

  async function uploadFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) {
      return;
    }

    const formData = new FormData();

    Array.from(fileList).forEach((file) => {
      formData.append("files", file);
    });

    setIsUploading(true);
    setStatusMessage(`${fileList.length}개 파일 업로드 중`);

    try {
      const response = await fetch("/api/drop/files", {
        method: "POST",
        body: formData
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "업로드에 실패했습니다.");
      }

      await refreshFiles();
      setStatusMessage(`${result.files.length}개 파일 업로드 완료`);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (folderInputRef.current) {
        folderInputRef.current.value = "";
      }
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  }

  function toggleSelection(relativePath: string) {
    setSelected((prev) =>
      prev.includes(relativePath)
        ? prev.filter((item) => item !== relativePath)
        : [...prev, relativePath]
    );
  }

  async function handleDelete(relativePath: string) {
    const confirmed = window.confirm(`"${relativePath}" 파일을 삭제할까요?`);

    if (!confirmed) {
      return;
    }

    setStatusMessage(`"${relativePath}" 삭제 중`);

    try {
      const response = await fetch(buildFileUrl(relativePath), {
        method: "DELETE"
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "삭제에 실패했습니다.");
      }

      setFiles((prev) => prev.filter((file) => file.relativePath !== relativePath));
      setSelected((prev) => prev.filter((item) => item !== relativePath));
      setStatusMessage(`"${relativePath}" 삭제 완료`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "삭제에 실패했습니다.");
    }
  }

  async function deleteSelected() {
    if (selected.length === 0) {
      return;
    }

    const confirmed = window.confirm(`선택한 ${selected.length}개 파일을 삭제할까요?`);

    if (!confirmed) {
      return;
    }

    setStatusMessage(`${selected.length}개 파일 삭제 중`);

    const failed: string[] = [];

    for (const relativePath of selected) {
      try {
        const response = await fetch(buildFileUrl(relativePath), {
          method: "DELETE"
        });

        if (!response.ok) {
          failed.push(relativePath);
        }
      } catch {
        failed.push(relativePath);
      }
    }

    await refreshFiles();

    if (failed.length > 0) {
      setStatusMessage(`${failed.length}개 파일 삭제 실패`);
      return;
    }

    setSelected([]);
    setStatusMessage(`${selected.length}개 파일 삭제 완료`);
  }

  function downloadOne(relativePath: string) {
    const anchor = document.createElement("a");
    anchor.href = buildFileUrl(relativePath);
    anchor.download = relativePath.split("/").pop() ?? relativePath;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  }

  async function downloadSelected() {
    if (selected.length === 0) {
      return;
    }

    setIsDownloadingMany(true);
    setStatusMessage(`${selected.length}개 파일 다운로드 시작`);

    try {
      for (const relativePath of selected) {
        downloadOne(relativePath);
        await new Promise((resolve) => window.setTimeout(resolve, 180));
      }

      setStatusMessage(
        "선택한 파일 다운로드를 시작했습니다. 브라우저가 다중 다운로드 허용을 물으면 승인하세요."
      );
    } finally {
      setIsDownloadingMany(false);
    }
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function openFolderPicker() {
    folderInputRef.current?.click();
  }

  function downloadFolder(relativePath: string) {
    const anchor = document.createElement("a");
    anchor.href = buildFolderZipUrl(relativePath);
    anchor.download = `${relativePath.split("/").pop() ?? relativePath}.zip`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  }

  function handleDragEnter(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setDragDepth((prev) => prev + 1);
    setIsDragging(true);
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "copy";
    setIsDragging(true);
  }

  function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setDragDepth((prev) => {
      const next = Math.max(prev - 1, 0);
      if (next === 0) {
        setIsDragging(false);
      }
      return next;
    });
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setDragDepth(0);
    setIsDragging(false);
    void uploadFiles(event.dataTransfer.files);
  }

  const folders = Array.from(
    files.reduce((map, file) => {
      const segments = file.relativePath.split("/");

      if (segments.length < 2) {
        return map;
      }

      let currentPath = "";

      for (let index = 0; index < segments.length - 1; index += 1) {
        currentPath = currentPath ? `${currentPath}/${segments[index]}` : segments[index];

        const existing = map.get(currentPath);
        map.set(currentPath, {
          path: currentPath,
          name: segments[index],
          fileCount: existing ? existing.fileCount + 1 : 1
        });
      }

      return map;
    }, new Map<string, DropFolder>())
  )
    .map(([, folder]) => folder)
    .sort((a, b) => a.path.localeCompare(b.path));

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <div className={styles.heroTop}>
            <Link href="/" className={styles.backButton}>
              Back
            </Link>
            <p className={styles.eyebrow}>Drop Space</p>
          </div>
          <h1 className={styles.title}>File Transfer</h1>
          <p className={styles.description}>파일을 임시 업로드/다운로드 할 수 있는 공간입니다.</p>
        </section>

        <section className={styles.panelGrid}>
          <div className={styles.dropPanel}>
            <input
              ref={fileInputRef}
              className={styles.hiddenInput}
              type="file"
              multiple
              onChange={(event) => {
                void uploadFiles(event.target.files);
              }}
            />
            <input
              ref={folderInputRef}
              className={styles.hiddenInput}
              type="file"
              multiple
              onChange={(event) => {
                void uploadFiles(event.target.files);
              }}
            />

            <div
              className={`${styles.dropZone} ${isDragging ? styles.dropZoneActive : ""}`}
              onClick={openFilePicker}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openFilePicker();
                }
              }}
            >
              <div>
                <div className={styles.dropIcon}>+</div>
                <h2 className={styles.dropTitle}>Drop files here</h2>
                <p className={styles.dropText}>Drag and drop or click to upload.</p>
                <div className={styles.hintRow}>
                  <span className={styles.hint}>Multi upload</span>
                  <span className={styles.hint}>Direct download</span>
                  <span className={styles.hint}>Manual delete</span>
                </div>
              </div>
            </div>

            <div className={styles.toolbar}>
              <div className={styles.status}>
                {isUploading ? "업로드 중..." : statusMessage}
              </div>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.buttonMuted}
                  onClick={openFilePicker}
                  disabled={isUploading}
                >
                  파일 선택
                </button>
                <button
                  type="button"
                  className={styles.buttonMuted}
                  onClick={openFolderPicker}
                  disabled={isUploading}
                >
                  폴더 선택
                </button>
                <button
                  type="button"
                  className={styles.button}
                  onClick={() => void refreshFiles()}
                  disabled={isLoading || isUploading}
                >
                  목록 새로고침
                </button>
              </div>
            </div>
          </div>

          <aside className={styles.listPanel}>
            <div className={styles.listHeader}>
              <div>
                <h2 className={styles.listTitle}>보관 중인 파일</h2>
                <div className={styles.listMeta}>
                  {isLoading
                    ? "목록 불러오는 중"
                    : `${folders.length}개 폴더 · ${files.length}개 파일`}
                </div>
              </div>
            </div>

            {folders.length > 0 ? (
              <div className={styles.folderSection}>
                <h3 className={styles.sectionLabel}>Folders</h3>
                <div className={styles.folderList}>
                  {folders.map((folder) => (
                    <article key={folder.path} className={styles.folderCard}>
                      <div>
                        <p className={styles.fileName}>{folder.name}</p>
                        <p className={styles.fileInfo}>
                          {folder.path} · {folder.fileCount} files
                        </p>
                      </div>
                      <button
                        type="button"
                        className={styles.buttonMuted}
                        onClick={() => downloadFolder(folder.path)}
                      >
                        Zip download
                      </button>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}

            {selected.length > 0 ? (
              <div className={styles.selectionBar}>
                <span>{selected.length}개 선택됨</span>
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.button}
                    onClick={() => void downloadSelected()}
                    disabled={isDownloadingMany}
                  >
                    선택 파일 바로 다운로드
                  </button>
                  <button
                    type="button"
                    className={styles.dangerButton}
                    onClick={() => void deleteSelected()}
                  >
                    선택 파일 삭제
                  </button>
                </div>
              </div>
            ) : null}

            {files.length === 0 && !isLoading ? (
              <div className={styles.empty}>아직 업로드된 파일이 없습니다.</div>
            ) : (
              <div className={styles.fileSection}>
                <h3 className={styles.sectionLabel}>Files</h3>
                <div className={styles.fileList}>
                {files.map((file) => (
                  <article key={file.relativePath} className={styles.fileCard}>
                    <div className={styles.fileTop}>
                      <input
                        className={styles.checkbox}
                        type="checkbox"
                        checked={selected.includes(file.relativePath)}
                        onChange={() => toggleSelection(file.relativePath)}
                        aria-label={`${file.relativePath} 선택`}
                      />
                      <div>
                        <p className={styles.fileName}>{file.name}</p>
                        <p className={styles.fileInfo}>
                          {formatSize(file.size)} · {formatDate(file.uploadedAt)}
                        </p>
                        {file.relativePath !== file.name ? (
                          <p className={styles.fileInfo}>{file.relativePath}</p>
                        ) : null}
                      </div>
                      <div className={styles.fileActions}>
                        <button
                          type="button"
                          className={styles.textButton}
                          onClick={() => downloadOne(file.relativePath)}
                        >
                          다운로드
                        </button>
                        <button
                          type="button"
                          className={styles.dangerButton}
                          onClick={() => void handleDelete(file.relativePath)}
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
                </div>
              </div>
            )}
          </aside>
        </section>
      </div>
    </main>
  );
}
