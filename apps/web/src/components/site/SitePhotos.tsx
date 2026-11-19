"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { deleteSitePhotoAction, uploadSitePhotoAction } from "@/lib/site/actions";
import type { SitePhoto } from "@/lib/site/repository";

const dayFmt = new Intl.DateTimeFormat("th-TH", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "2-digit",
});
const timeFmt = new Intl.DateTimeFormat("th-TH", {
  hour: "2-digit",
  minute: "2-digit",
});

const todayStr = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

/** Longest edge after downscaling — plenty for progress photos. */
const MAX_EDGE = 1920;
const JPEG_QUALITY = 0.82;

/**
 * Shrinks a photo in the browser before it is sent.
 *
 * A serverless request body tops out around 4.5MB, and a modern phone camera
 * clears that on its own, so sending originals fails exactly when someone is
 * standing on site with a good camera. Returns the original untouched if the
 * browser cannot decode it (HEIC on a browser without support, say) so the
 * upload still gets a chance rather than being dropped here.
 */
async function downscale(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    // Already small enough and already a JPEG: nothing to gain.
    if (scale === 1 && file.type === "image/jpeg" && file.size < 2_000_000) {
      bitmap.close();
      return file;
    }
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", {
      type: "image/jpeg",
    });
  } catch {
    return file;
  }
}

export function SitePhotos({
  projectId,
  photos,
  canEdit,
}: {
  projectId: string;
  photos: SitePhoto[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [picked, setPicked] = useState<File[]>([]);
  const [caption, setCaption] = useState("");
  const [takenAt, setTakenAt] = useState(todayStr());
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<SitePhoto | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // One day per heading, so a week of work reads as a diary rather than a pile.
  const byDay = useMemo(() => {
    const groups = new Map<string, SitePhoto[]>();
    for (const p of photos) {
      const key = p.takenAt.slice(0, 10);
      const list = groups.get(key);
      if (list) list.push(p);
      else groups.set(key, [p]);
    }
    return Array.from(groups.entries());
  }, [photos]);

  const clearPicker = () => {
    setPicked([]);
    if (fileRef.current) fileRef.current.value = "";
  };

  /**
   * One request per photo, in sequence. Batching them into a single action
   * would blow the body limit again on any realistic set, and this way a
   * failure on photo 4 does not throw away the three already stored.
   */
  const uploadAll = async () => {
    if (picked.length === 0) return;
    setError(null);
    setProgress({ done: 0, total: picked.length });

    let failed = 0;
    for (let i = 0; i < picked.length; i++) {
      const small = await downscale(picked[i]!);
      const fd = new FormData();
      fd.set("projectId", projectId);
      fd.set("photo", small);
      fd.set("caption", caption);
      fd.set("takenAt", takenAt);
      const res = await uploadSitePhotoAction(fd);
      if (!res.ok) {
        failed += 1;
        setError(res.error);
      }
      setProgress({ done: i + 1, total: picked.length });
    }

    setProgress(null);
    const stored = picked.length - failed;
    clearPicker();
    if (stored > 0) {
      setCaption("");
      router.refresh();
    }
    if (failed > 0) {
      setError(
        `อัพโหลดสำเร็จ ${stored} รูป ไม่สำเร็จ ${failed} รูป — ลองใหม่เฉพาะรูปที่ขาด`
      );
    }
  };

  const remove = (id: string) =>
    startTransition(async () => {
      await deleteSitePhotoAction(projectId, id);
      router.refresh();
    });

  const uploading = progress !== null;

  return (
    <div className="space-y-4">
      {canEdit && (
        <div className="space-y-2 rounded-md border border-dashed border-[#ddd6c8] p-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[auto_1fr]">
            <label className="flex items-center gap-2 text-body-sm text-text-secondary">
              วันที่ทำงาน
              <input
                type="date"
                value={takenAt}
                onChange={(e) => setTakenAt(e.target.value)}
                disabled={uploading}
                className="h-10 rounded-md border border-[#e2ddd0] bg-white px-3 text-body-sm text-text-primary focus:border-primary-600 focus:outline-none"
              />
            </label>
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              disabled={uploading}
              placeholder="คำอธิบายงาน เช่น เทพื้นชั้น 2 โซน A"
              className="h-10 w-full rounded-md border border-[#e2ddd0] bg-white px-3 text-body-sm text-text-primary focus:border-primary-600 focus:outline-none"
            />
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            capture="environment"
            disabled={uploading}
            onChange={(e) => setPicked(Array.from(e.target.files ?? []))}
            className="block w-full text-body-sm text-text-secondary file:mr-3 file:rounded-md file:border-0 file:bg-primary-700 file:px-4 file:py-2 file:text-body-sm file:font-medium file:text-white hover:file:bg-primary-600 disabled:opacity-50"
          />

          {picked.length > 0 && !uploading && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-body-sm text-text-primary">
                เลือกไว้ {picked.length} รูป
              </span>
              <button
                type="button"
                onClick={uploadAll}
                className="inline-flex h-9 items-center rounded-md bg-primary-700 px-4 text-body-sm font-medium text-white hover:bg-primary-600"
              >
                อัพโหลด {picked.length} รูป
              </button>
              <button
                type="button"
                onClick={clearPicker}
                className="inline-flex h-9 items-center px-2 text-body-sm text-text-secondary"
              >
                ล้าง
              </button>
            </div>
          )}

          {uploading && (
            <div>
              <p className="text-caption text-text-secondary">
                กำลังอัพโหลด {progress.done}/{progress.total} รูป…
              </p>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#e7e1d5]">
                <div
                  className="h-full rounded-full bg-primary-700 transition-all"
                  style={{
                    width: `${Math.round(
                      (progress.done / progress.total) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}

          <p className="text-caption text-text-secondary">
            เลือกได้ครั้งละหลายรูป — ทุกรูปในชุดนี้จะใช้วันที่และคำอธิบายเดียวกัน
          </p>
        </div>
      )}

      {error && <p className="text-caption text-danger">{error}</p>}

      {photos.length === 0 ? (
        <p className="text-body-sm text-text-secondary">ยังไม่มีรูปหน้างาน</p>
      ) : (
        <div className="space-y-5">
          {byDay.map(([day, list]) => (
            <div key={day}>
              <div className="mb-2 flex items-baseline gap-2 border-b border-[#f0ece2] pb-1">
                <h3 className="text-body-sm font-semibold text-text-primary">
                  {dayFmt.format(new Date(`${day}T00:00:00`))}
                </h3>
                <span className="text-caption text-text-secondary">
                  {list.length} รูป
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {list.map((p) => (
                  <figure key={p.id} className="group relative">
                    <button
                      type="button"
                      onClick={() => setLightbox(p)}
                      className="block w-full overflow-hidden rounded-md border border-[#ece7db]"
                    >
                      {/* Plain <img>: Supabase Storage URLs change per upload,
                          so there is no fixed remote pattern to configure. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.url}
                        alt={p.caption ?? "รูปหน้างาน"}
                        loading="lazy"
                        className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </button>
                    {p.caption && (
                      <figcaption className="mt-1 truncate text-caption text-text-primary">
                        {p.caption}
                      </figcaption>
                    )}
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => remove(p.id)}
                        aria-label="ลบรูป"
                        className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                      >
                        ×
                      </button>
                    )}
                  </figure>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
          role="presentation"
        >
          <div className="max-h-full max-w-3xl overflow-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox.url}
              alt={lightbox.caption ?? "รูปหน้างาน"}
              className="max-h-[80vh] w-auto rounded-md"
            />
            <p className="mt-2 text-center text-body-sm text-white">
              {lightbox.caption}
              <span className="block text-caption text-white/70">
                {dayFmt.format(new Date(lightbox.takenAt))}{" "}
                {timeFmt.format(new Date(lightbox.takenAt))}
                {lightbox.uploaderName && ` · โดย ${lightbox.uploaderName}`}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
