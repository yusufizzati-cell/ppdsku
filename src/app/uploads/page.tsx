import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatFileSize } from "@/lib/upload-config";
import { FileText, Image as ImageIcon, UploadCloud } from "lucide-react";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, { text: string; variant: "default" | "info" | "success" | "danger" }> = {
  uploaded: { text: "Belum diekstrak", variant: "default" },
  extracting: { text: "Mengekstrak", variant: "info" },
  extracted: { text: "Siap direview", variant: "success" },
  failed: { text: "Gagal", variant: "danger" },
};

export default async function UploadsPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: uploads } = user
    ? await supabase
        .from("uploads")
        .select("id, original_filename, file_type, status, file_size, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  const list = uploads ?? [];

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Upload Saya</h1>
            <p className="text-sm text-navy-500">
              Semua soal yang sudah kamu upload.
            </p>
          </div>
          <Link href="/upload">
            <Button className="gap-2">
              <UploadCloud size={16} />
              Upload Baru
            </Button>
          </Link>
        </div>

        {list.length === 0 ? (
          <Card padding="lg" className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
              <UploadCloud size={28} className="text-primary-600" />
            </div>
            <h2 className="mb-2 text-lg font-bold text-navy-900">
              Belum ada upload
            </h2>
            <p className="mb-6 text-sm text-navy-500">
              Upload soal tryout kamu untuk mulai membuat adaptive quiz personal.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link href="/upload">
                <Button>Upload Soal</Button>
              </Link>
              <Link href="/onkrad/quiz">
                <Button variant="secondary">Coba Demo</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {list.map((u) => {
              const status = statusLabel[u.status] ?? statusLabel.uploaded;
              return (
                <Link key={u.id} href={`/uploads/${u.id}`}>
                  <Card hover padding="md" className="cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-100">
                        {u.file_type === "pdf" ? (
                          <FileText size={20} className="text-navy-500" />
                        ) : (
                          <ImageIcon size={20} className="text-navy-500" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-navy-900">
                          {u.original_filename}
                        </p>
                        <p className="text-xs text-navy-400">
                          {formatFileSize(u.file_size)} ·{" "}
                          {new Date(u.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <Badge variant={status.variant}>{status.text}</Badge>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
