import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ReviewedQuizClient } from "@/components/upload/ReviewedQuizClient";
import type { ReviewedQuizQuestion } from "@/components/upload/ReviewedQuizClient";

export const dynamic = "force-dynamic";

export default async function ReviewedUploadQuizPage({
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
          <p className="mb-4 text-navy-500">Silakan login untuk mulai quiz.</p>
          <Link href="/auth/login">
            <Button>Login</Button>
          </Link>
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
    .select("id")
    .eq("upload_id", upload.id)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: questions } = job
    ? await supabase
        .from("extracted_questions")
        .select("id, question_text, options, answer_key, explanation, topic, subtopic")
        .eq("job_id", job.id)
        .eq("review_status", "approved")
        .not("answer_key", "is", null)
        .order("question_number", { ascending: true })
    : { data: [] };

  const quizQuestions = (questions ?? []) as ReviewedQuizQuestion[];

  return (
    <DashboardShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          href={`/uploads/${upload.id}/review`}
          className="inline-flex items-center gap-2 text-sm text-navy-500 hover:text-navy-700"
        >
          <ArrowLeft size={16} />
          Kembali ke review
        </Link>

        <Card padding="lg">
          <p className="text-sm text-navy-400">Quiz dari soal reviewed</p>
          <h1 className="text-2xl font-bold text-navy-900">
            {upload.original_filename}
          </h1>
          <p className="mt-2 text-sm text-navy-500">
            Mode ini hanya memakai soal yang sudah kamu approve dan punya answer key.
            Hasil disimpan sebagai practice custom, tidak mengubah IRT adaptive core.
          </p>
        </Card>

        {quizQuestions.length === 0 ? (
          <Card padding="lg" className="text-center">
            <p className="mb-4 text-sm text-navy-500">
              Belum ada soal approved dengan answer key untuk dijadikan quiz.
            </p>
            <Link href={`/uploads/${upload.id}/review`}>
              <Button>Review Soal Dulu</Button>
            </Link>
          </Card>
        ) : (
          <ReviewedQuizClient uploadId={upload.id} questions={quizQuestions} />
        )}
      </div>
    </DashboardShell>
  );
}
