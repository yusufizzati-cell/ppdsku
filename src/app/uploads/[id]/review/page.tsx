import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ReviewQuestionCard } from "@/components/upload/ReviewQuestionCard";
import type { ExtractedQuestionRow } from "@/lib/extraction";

export const dynamic = "force-dynamic";

export default async function UploadReviewPage({
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

  const { data: job } = await supabase
    .from("extraction_jobs")
    .select("*")
    .eq("upload_id", upload.id)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: questions } = job
    ? await supabase
        .from("extracted_questions")
        .select("*")
        .eq("job_id", job.id)
        .order("question_number", { ascending: true })
    : { data: [] };

  const items = (questions ?? []) as ExtractedQuestionRow[];
  const approved = items.filter((q) => q.review_status === "approved").length;
  const rejected = items.filter((q) => q.review_status === "rejected").length;
  const pending = items.filter((q) => q.review_status === "pending").length;
  const edited = items.filter((q) => q.review_status === "edited").length;
  const withoutAnswer = items.filter((q) => !q.answer_key).length;

  return (
    <DashboardShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <Link
          href={`/uploads/${upload.id}`}
          className="inline-flex items-center gap-2 text-sm text-navy-500 hover:text-navy-700"
        >
          <ArrowLeft size={16} />
          Kembali ke upload
        </Link>

        <Card padding="lg">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-navy-400">Review hasil ekstraksi</p>
              <h1 className="text-2xl font-bold text-navy-900">
                {upload.original_filename}
              </h1>
              <p className="mt-2 text-sm text-navy-500">
                AI extraction tidak final. Approve hanya soal yang sudah kamu cek.
                Soal tanpa answer key tidak boleh masuk scoring adaptif.
              </p>
            </div>
            <Badge variant={job ? "success" : "warning"}>
              {job ? `${items.length} soal` : "belum diekstrak"}
            </Badge>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-5">
            <Stat label="Pending" value={pending} />
            <Stat label="Edited" value={edited} />
            <Stat label="Approved" value={approved} />
            <Stat label="Rejected" value={rejected} />
            <Stat label="Tanpa kunci" value={withoutAnswer} />
          </div>
        </Card>

        {!job && (
          <Card padding="lg" className="text-center">
            <p className="text-sm text-navy-500">
              Belum ada extraction job selesai untuk upload ini.
            </p>
          </Card>
        )}

        {job && items.length === 0 && (
          <Card padding="lg" className="text-center">
            <p className="text-sm text-navy-500">
              Extraction job selesai, tapi belum ada soal tersimpan.
            </p>
          </Card>
        )}

        {items.map((question) => (
          <ReviewQuestionCard key={question.id} question={question} />
        ))}
      </div>
    </DashboardShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-navy-50 p-3 text-center">
      <p className="text-lg font-bold text-navy-900">{value}</p>
      <p className="text-xs text-navy-400">{label}</p>
    </div>
  );
}
