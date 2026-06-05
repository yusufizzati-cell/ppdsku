import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatFileSize } from "@/lib/upload-config";
import { FileText, Image as ImageIcon, ArrowLeft } from "lucide-react";
import { ExtractButton } from "@/components/upload/ExtractButton";

export const dynamic = "force-dynamic";

export default async function UploadDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <DashboardShell>
        <Card padding="lg" className="text-center">
          <p className="text-navy-500">Silakan login.</p>
        </Card>
      </DashboardShell>
    );
  }

  const { data: upload } = await supabase
    .from("uploads")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!upload) notFound();

  const statusInfo: Record<string, string> = {
    uploaded: "File berhasil diupload. Siap untuk diekstrak oleh AI.",
    extracting: "AI sedang mengekstrak soal dari file kamu...",
    extracted: "Ekstraksi selesai. Review hasilnya sebelum mulai quiz.",
    failed: "Ekstraksi gagal. Coba upload ulang file yang lebih jelas.",
  };

  return (
    <DashboardShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <Link
          href="/uploads"
          className="inline-flex items-center gap-2 text-sm text-navy-500 hover:text-navy-700"
        >
          <ArrowLeft size={16} />
          Kembali ke daftar
        </Link>

        <Card padding="lg">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-100">
              {upload.file_type === "pdf" ? (
                <FileText size={24} className="text-navy-500" />
              ) : (
                <ImageIcon size={24} className="text-navy-500" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-navy-900">
                {upload.original_filename}
              </p>
              <p className="text-xs text-navy-400">
                {formatFileSize(upload.file_size)} ·{" "}
                {upload.file_type.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-navy-50 p-4">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-sm font-medium text-navy-700">Status:</span>
              <Badge
                variant={
                  upload.status === "extracted"
                    ? "success"
                    : upload.status === "failed"
                    ? "danger"
                    : upload.status === "extracting"
                    ? "info"
                    : "default"
                }
              >
                {upload.status}
              </Badge>
            </div>
            <p className="text-sm text-navy-500">
              {statusInfo[upload.status] ?? ""}
            </p>
          </div>

          {/* State-driven CTA. */}
          <div className="mt-6">
            {upload.status === "uploaded" && (
              <ExtractButton uploadId={upload.id} />
            )}
            {upload.status === "extracted" && (
              <Link href={`/uploads/${upload.id}/review`}>
                <Button fullWidth>Review Hasil</Button>
              </Link>
            )}
            {upload.status === "failed" && (
              <Link href="/upload">
                <Button fullWidth variant="secondary">
                  Upload Ulang
                </Button>
              </Link>
            )}
          </div>
        </Card>

        <p className="text-center text-xs text-navy-400">
          Review hasil ekstraksi wajib dilakukan sebelum soal masuk quiz adaptif.
        </p>
      </div>
    </DashboardShell>
  );
}
