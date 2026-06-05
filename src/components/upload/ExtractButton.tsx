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
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/extraction-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upload_id: uploadId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.error?.message ?? "Gagal memulai ekstraksi."
        );
      }

      // Redirect to review page after extraction completes
      router.push(`/uploads/${uploadId}/review`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      setIsLoading(false);
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
      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
