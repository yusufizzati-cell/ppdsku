"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface ExtractButtonProps {
  uploadId: string;
}

export function ExtractButton({ uploadId }: ExtractButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async () => {
    setIsLoading(true);
    setStatusText("Mengirim file ke AI extractor... biasanya 10-45 detik.");
    setError(null);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 60_000);

    try {
      const res = await fetch("/api/extraction-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upload_id: uploadId }),
        signal: controller.signal,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.error?.message ?? "Gagal memulai ekstraksi."
        );
      }

      setStatusText("Ekstraksi selesai. Membuka halaman review...");
      router.push(`/uploads/${uploadId}/review`);
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error && err.name === "AbortError"
          ? "Ekstraksi terlalu lama dan dihentikan. Coba ulangi dengan file lebih kecil/jelas."
          : err instanceof Error
          ? err.message
          : "Terjadi kesalahan.";
      setError(message);
      setStatusText(null);
      setIsLoading(false);
    } finally {
      window.clearTimeout(timeoutId);
    }
  };

  return (
    <div>
      <Button
        fullWidth
        onClick={handleExtract}
        disabled={isLoading}
      >
        {isLoading ? "Mengekstrak..." : "Mulai Ekstraksi AI"}
      </Button>
      {statusText && !error && (
        <p className="mt-2 text-center text-sm text-navy-500">{statusText}</p>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
