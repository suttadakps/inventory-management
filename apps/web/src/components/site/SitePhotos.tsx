"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { deleteSitePhotoAction, uploadSitePhotoAction } from "@/lib/site/actions";
import type { SitePhoto } from "@/lib/site/repository";

const dateFmt = new Intl.DateTimeFormat("th-TH", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

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
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<SitePhoto | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setError(null);
    setUploading(true);
    const fd = new FormData();
    fd.set("projectId", projectId);
    fd.set("photo", file);
    fd.set("caption", caption);
    const res = await uploadSitePhotoAction(fd);
    setUploading(false);
    if (res.ok) {
      setCaption("");
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } else {
      setError(res.error);
    }
  };

  const remove = (id: string) =>
    startTransition(async () => {
      await deleteSitePhotoAction(projectId, id);
      router.refresh();
    });

  return (
    <div className="space-y-3">
      {canEdit && (
        <div className="space-y-2 rounded-md border border-dashed border-[#ddd6c8] p-3">
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="คำอธิบายรูป (ไม่บังคับ)"
            className="h-10 w-full rounded-md border border-[#e2ddd0] bg-white px-3 text-body-sm text-text-primary focus:border-primary-600 focus:outline-none"
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void upload(f);
            }}
            className="block w-full text-body-sm text-text-secondary file:mr-3 file:rounded-md file:border-0 file:bg-primary-700 file:px-4 file:py-2 file:text-body-sm file:font-medium file:text-white hover:file:bg-primary-600 disabled:opacity-50"
          />
          {uploading && (
            <p className="text-caption text-text-secondary">
              กำลังอัพโหลด…
            </p>
          )}
        </div>
      )}

      {error && <p className="text-caption text-danger">{error}</p>}

      {photos.length === 0 ? (
        <p className="text-body-sm text-text-secondary">ยังไม่มีรูปหน้างาน</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((p) => (
            <figure key={p.id} className="group relative">
              <button
                type="button"
                onClick={() => setLightbox(p)}
                className="block w-full overflow-hidden rounded-md border border-[#ece7db]"
              >
                {/* Plain <img>: these are Supabase Storage URLs that change per
                    upload, so there is no fixed remote pattern to configure. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url}
                  alt={p.caption ?? "รูปหน้างาน"}
                  loading="lazy"
                  className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
                />
              </button>
              <figcaption className="mt-1 text-caption text-text-secondary">
                {p.caption && (
                  <span className="block truncate text-text-primary">
                    {p.caption}
                  </span>
                )}
                {dateFmt.format(new Date(p.takenAt))}
              </figcaption>
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
              {lightbox.uploaderName && (
                <span className="block text-caption text-white/70">
                  โดย {lightbox.uploaderName} ·{" "}
                  {dateFmt.format(new Date(lightbox.takenAt))}
                </span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
