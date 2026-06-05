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
  question_number?: number | null;
  question_text?: string | null;
  options?: Record<string, string> | null;
  explanation?: string | null;
  topic?: string | null;
  subtopic?: string | null;
  source_page?: number | null;
  source_region?: string | null;
  extraction_confidence?: number | null;
  answer_confidence?: number | null;
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

  let savedResponses: Array<{ id: string; question_id: string }> = [];
  if (responseRows.length > 0) {
    const { data: insertedResponses, error: respErr } = await admin
      .from("question_responses")
      .insert(responseRows)
      .select("id, question_id");

    if (respErr) {
      return err("INTERNAL_ERROR", "Gagal menyimpan jawaban quiz.", 500);
    }

    savedResponses = insertedResponses ?? [];
  }

  const responseIdByQuestion = new Map(
    savedResponses.map((r) => [r.question_id, r.id])
  );

  const attemptRows = body.responses
    .filter((r) => r.question_text && r.options)
    .map((r, idx) => ({
      session_id: session.id,
      question_response_id: responseIdByQuestion.get(r.question_id) ?? null,
      extracted_question_id: r.question_id,
      upload_id: body.upload_id,
      user_id: user.id,
      question_number: r.question_number ?? idx + 1,
      question_text: r.question_text!,
      options: r.options ?? {},
      selected_answer: r.selected_answer,
      correct_answer: r.correct_answer,
      is_correct: r.is_correct,
      explanation: r.explanation ?? null,
      topic: r.topic ?? "Custom Upload",
      subtopic: r.subtopic ?? null,
      source_page: r.source_page ?? null,
      source_region: r.source_region ?? null,
      extraction_confidence: r.extraction_confidence ?? null,
      answer_confidence: r.answer_confidence ?? null,
    }));

  if (attemptRows.length > 0) {
    const { error: attemptErr } = await admin
      .from("custom_question_attempts")
      .insert(attemptRows);

    if (attemptErr) {
      return err("INTERNAL_ERROR", "Gagal menyimpan snapshot review quiz.", 500);
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
