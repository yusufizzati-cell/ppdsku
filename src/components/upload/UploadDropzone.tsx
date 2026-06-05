"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { validateFile, formatFileSize } from "@/lib/upload-config";

type UploadState = "idle" | "selected" | "uploading" | "error";

export function UploadDropzone() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const pickFile = useCallback((f: File) => {
    const v = validateFile(f.type, f.size);
    if (!v.ok) {
      setError(v.error ?? "File tidak valid.");
      setState("error");
      setFile(null);
      return;
    }
    setError("");
    setFile(f);
    setState("selected");
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files?.[0];
      if (f) pickFile(f);
    },
    [pickFile]
  );

  const handleUpload = async () => {
    if (!file) return;
    setState("uploading");
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json?.error?.message ?? "Upload gagal.");
        setState("error");
        return;
      }

      // Redirect to upload detail
      router.push(`/uploads/${json.data.upload.id}`);
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
      setState("error");
    }
  };

  const reset = () => {
    setFile(null);
    setState("idle");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      {/* Dropzone */}
      {!file && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
            dragOver
              ? "border-primary-400 bg-primary-50"
              : "border-navy-200 bg-white hover:border-primary-300 hover:bg-navy-50"
          }`}
        >
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
            <UploadCloud size={28} className="text-primary-600" />
          </div>
          <p className="mb-1 text-base font-semibold text-navy-900">
            Tarik file ke sini atau klik untuk pilih
          </p>
          <p className="text-sm text-navy-500">
            PDF (maks 10 MB) atau gambar JPG/PNG (maks 5 MB)
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) pickFile(f);
            }}
          />
        </div>
      )}

      {/* Selected file preview */}
      {file && (
        <div className="rounded-2xl border border-navy-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
              <FileText size={20} className="text-primary-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-navy-900">
                {file.name}
              </p>
              <p className="text-xs text-navy-400">{formatFileSize(file.size)}</p>
            </div>
            {state !== "uploading" && (
              <button
                onClick={reset}
                className="text-navy-400 hover:text-navy-600"
                aria-label="Hapus file"
              >
                <X size={18} />
              </button>
            )}
          </div>
          <div className="mt-4">
            <Button
              onClick={handleUpload}
              disabled={state === "uploading"}
              fullWidth
              className="gap-2"
            >
              {state === "uploading" ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Mengupload...
                </>
              ) : (
                "Upload Soal"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-xl bg-danger-50 p-3 text-sm text-danger-700">
          {error}
        </div>
      )}
    </div>
  );
}
