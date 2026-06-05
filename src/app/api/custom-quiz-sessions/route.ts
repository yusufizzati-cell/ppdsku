import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function err(code: string, message: string, status: number) {
  return NextResponse.json(
    { success: false, error: { code, message } },
    { status }
  );
}

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SECRET_KEY!;
  return createClient(url, key);
}

interface CustomQuizResponseInput {
  question_id: string;
  selected_answer: string;
  correct_answer: string;
  is_correct: boolean;
  topic?: string | null;
  subtopic?: string | null;
}

/**
 * POST /api/custom-quiz-sessions
 * Persists a reviewed-upload practice quiz without updating IRT abilities.
 */
export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("UNAUTHORIZED", "Silakan login.", 401);

  let body: {
    upload_id?: string;
    total_questions?: number;
    correct_count?: number;
    responses?: CustomQuizResponseInput[];
  };

  try {
    body = await request.json();
  } catch {
    return err("VALIDATION_ERROR", "Request body tidak valid.", 400);
  }

  if (!body.upload_id || !Array.isArray(body.responses)) {
    return err("VALIDATION_ERROR", "upload_id dan responses wajib diisi.", 400);
  }

  const { data: upload } = await supabase
    .from("uploads")
    .select("id")
    .eq("id", body.upload_id)
    .maybeSingle();

  if (!upload) return err("NOT_FOUND", "Upload tidak ditemukan.", 404);

  const totalQuestions = body.total_questions ?? body.responses.length;
  const correctCount = body.correct_count ?? body.responses.filter((r) => r.is_correct).length;
  const overallPercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const admin = createAdminClient();
  const { data: session, error: sessionErr } = await admin
    .from("quiz_sessions")
    .insert({
      user_id: user.id,
      specialty: "custom-upload",
      mode: "reviewed-upload",
      finished_at: new Date().toISOString(),
      total_questions: totalQuestions,
      correct_count: correctCount,
      overall_percent: overallPercent,
    })
    .select()
    .single();

  if (sessionErr || !session) {
    return err("INTERNAL_ERROR", "Gagal menyimpan sesi quiz.", 500);
  }

  const responseRows = body.responses.map((r) => ({
    session_id: session.id,
    user_id: user.id,
    question_id: r.question_id,
    selected_answer: r.selected_answer,
    correct_answer: r.correct_answer,
    is_correct: r.is_correct,
    topic: r.topic ?? "Custom Upload",
    subtopic: r.subtopic ?? null,
    difficulty: 0.5,
    discrimination: 1.0,
    ability_before: null,
    ability_after: null,
  }));

  if (responseRows.length > 0) {
    const { error: respErr } = await admin
      .from("question_responses")
      .insert(responseRows);

    if (respErr) {
      return err("INTERNAL_ERROR", "Gagal menyimpan jawaban quiz.", 500);
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      session_id: session.id,
      total_questions: totalQuestions,
      correct_count: correctCount,
      overall_percent: overallPercent,
    },
  });
}
