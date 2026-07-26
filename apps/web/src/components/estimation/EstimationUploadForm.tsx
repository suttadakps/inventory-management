"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { uploadEstimationFileAction } from "@/lib/estimation/actions";
import type { AiProvider } from "@/lib/estimation/shared";

const ACCEPTED = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
const MAX_BYTES = 4 * 1024 * 1024;

export function EstimationUploadForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<AiProvider>("claude");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError("กรุณาเลือกไฟล์");
      return;
    }
    if (!ACCEPTED.includes(file.type)) {
      setError("รองรับเฉพาะไฟล์ PDF, PNG, JPG, WEBP");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("ไฟล์ใหญ่เกิน 4MB กรุณาลดขนาดไฟล์");
      return;
    }

    setError(null);
    setPending(true);
    const formData = new FormData();
    formData.set("file", file);
    formData.set("provider", provider);

    startTransition(async () => {
      const res = await uploadEstimationFileAction(projectId, formData);
      setPending(false);
      if (res.ok) {
        router.push(`/projects/${projectId}/estimation/${res.extractionId}`);
      } else {
        setError(res.error);
      }
    });
  };

  const radioCls =
    "flex h-10 flex-1 items-center justify-center rounded-md border text-body-sm font-medium transition-colors";

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1.5 block text-body-sm font-medium text-text-primary">
          เลือก AI ที่ใช้วิเคราะห์
        </label>
        <div className="flex max-w-sm gap-2">
          <button
            type="button"
            onClick={() => setProvider("claude")}
            className={`${radioCls} ${
              provider === "claude"
                ? "border-primary-700 bg-primary-700 text-white"
                : "border-[#e2ddd0] bg-white text-text-primary hover:bg-[#faf8f3]"
            }`}
          >
            Claude
          </button>
          <button
            type="button"
            onClick={() => setProvider("chatgpt")}
            className={`${radioCls} ${
              provider === "chatgpt"
                ? "border-primary-700 bg-primary-700 text-white"
                : "border-[#e2ddd0] bg-white text-text-primary hover:bg-[#faf8f3]"
            }`}
          >
            ChatGPT
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp"
        className="block w-full text-body-sm text-text-primary file:mr-4 file:h-10 file:rounded-md file:border-0 file:bg-primary-700 file:px-4 file:text-body-sm file:font-medium file:text-white hover:file:bg-primary-600"
      />
      {error && <p className="text-caption text-danger">{error}</p>}
      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="inline-flex h-10 items-center rounded-md bg-primary-700 px-4 text-body-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50"
      >
        {pending ? "กำลังอัปโหลดและวิเคราะห์ด้วย AI…" : "อัปโหลดและเริ่มวิเคราะห์"}
      </button>
    </div>
  );
}
