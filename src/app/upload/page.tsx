import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { Card } from "@/components/ui/Card";
import { Info, FileStack } from "lucide-react";

export const dynamic = "force-dynamic";

export default function UploadPage() {
  return (
    <DashboardShell>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Upload Soal</h1>
          <p className="text-sm text-navy-500">
            Upload soal tryout kamu (PDF/foto). AI akan mengekstrak soal otomatis.
          </p>
        </div>

        {/* AI disclaimer */}
        <div className="flex items-start gap-2 rounded-xl bg-primary-50 p-3 text-sm text-primary-700">
          <Info size={16} className="mt-0.5 flex-shrink-0" />
          <span>
            Hasil ekstraksi AI perlu kamu review sebelum dipakai latihan. Akurasi
            soal adalah tanggung jawab kamu.
          </span>
        </div>

        <UploadDropzone />

        <div className="flex items-center justify-between">
          <Link
            href="/uploads"
            className="inline-flex items-center gap-2 text-sm text-navy-500 hover:text-navy-700"
          >
            <FileStack size={16} />
            Lihat semua upload
          </Link>
          <Link
            href="/onkrad/quiz"
            className="text-sm text-navy-400 hover:text-navy-600"
          >
            Belum punya soal? Coba demo →
          </Link>
        </div>

        <Card padding="md" className="bg-navy-50">
          <p className="text-xs text-navy-500">
            Tips: foto/scan yang jelas dan lurus menghasilkan ekstraksi lebih
            akurat. Hindari gambar blur atau miring.
          </p>
        </Card>
      </div>
    </DashboardShell>
  );
}
