import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function err(code: string, message: string, status: number) {
  return NextResponse.json(
    { success: false, error: { code, message } },
    { status }
  );
}

/**
 * GET /api/extraction-jobs/:id
 * Returns job detail + extracted questions.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("UNAUTHORIZED", "Silakan login.", 401);

  // Fetch job (RLS ensures ownership)
  const { data: job, error: jobErr } = await supabase
    .from("extraction_jobs")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (jobErr) return err("INTERNAL_ERROR", "Gagal memuat job.", 500);
  if (!job) return err("NOT_FOUND", "Extraction job tidak ditemukan.", 404);

  // Fetch extracted questions for this job
  const { data: questions, error: qErr } = await supabase
    .from("extracted_questions")
    .select("*")
    .eq("job_id", job.id)
    .order("question_number", { ascending: true });

  if (qErr) {
    return err("INTERNAL_ERROR", "Gagal memuat soal yang diekstrak.", 500);
  }

  return NextResponse.json({
    success: true,
    data: {
      job,
      questions: questions ?? [],
      summary: {
        total: questions?.length ?? 0,
        with_answer: questions?.filter((q) => q.answer_key !== null).length ?? 0,
        high_confidence: questions?.filter((q) => q.confidence >= 0.8).length ?? 0,
        pending_review: questions?.filter((q) => q.review_status === "pending").length ?? 0,
      },
    },
  });
}
