"use client";

import { createClient } from "@/lib/supabase/client";
import { QuizResponse, SessionResult } from "@/engine/scorer";

export interface PersistParams {
  specialty: string;
  mode: string;
  result: SessionResult;
  responses: QuizResponse[];
}

export interface PersistOutcome {
  ok: boolean;
  sessionId?: string;
  authenticated: boolean;
  error?: string;
}

/**
 * Persists a finished quiz session for the logged-in user.
 * - Creates a quiz_sessions row
 * - Bulk inserts question_responses
 * - Accumulates topic_abilities (merges with existing)
 *
 * Returns { authenticated: false } for guests (no error — expected).
 */
export async function persistQuizSession(
  params: PersistParams
): Promise<PersistOutcome> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, authenticated: false };
  }

  // 1. Create the session row
  const { data: session, error: sessionErr } = await supabase
    .from("quiz_sessions")
    .insert({
      user_id: user.id,
      specialty: params.specialty,
      mode: params.mode,
      finished_at: new Date().toISOString(),
      total_questions: params.result.totalQuestions,
      correct_count: params.result.correctCount,
      overall_percent: params.result.overallPercent,
    })
    .select()
    .single();

  if (sessionErr || !session) {
    return { ok: false, authenticated: true, error: sessionErr?.message };
  }

  // 2. Bulk insert question responses
  if (params.responses.length > 0) {
    const responseRows = params.responses.map((r) => ({
      session_id: session.id,
      user_id: user.id,
      question_id: r.questionId,
      selected_answer: r.selectedAnswer,
      correct_answer: r.correctAnswer,
      is_correct: r.isCorrect,
      topic: r.topic,
      difficulty: r.difficulty,
      discrimination: r.discrimination,
      ability_before: r.abilityBefore,
      ability_after: r.abilityAfter,
    }));

    const { error: respErr } = await supabase
      .from("question_responses")
      .insert(responseRows);

    if (respErr) {
      return { ok: false, authenticated: true, error: respErr.message };
    }
  }

  // 3. Accumulate topic abilities (read existing, merge, upsert)
  const { data: existingAbilities } = await supabase
    .from("topic_abilities")
    .select("*")
    .eq("user_id", user.id)
    .eq("specialty", params.specialty);

  const existingMap = new Map(
    (existingAbilities ?? []).map((a) => [a.topic, a])
  );

  const abilityRows = params.result.topicBreakdown.map((t) => {
    const ex = existingMap.get(t.topic);
    return {
      user_id: user.id,
      specialty: params.specialty,
      topic: t.topic,
      theta: t.theta,
      percent: t.percent,
      answered_count: (ex?.answered_count ?? 0) + t.answeredCount,
      correct_count: (ex?.correct_count ?? 0) + t.correctCount,
      updated_at: new Date().toISOString(),
    };
  });

  if (abilityRows.length > 0) {
    const { error: abErr } = await supabase
      .from("topic_abilities")
      .upsert(abilityRows, { onConflict: "user_id,specialty,topic" });

    if (abErr) {
      return { ok: false, authenticated: true, error: abErr.message };
    }
  }

  return { ok: true, authenticated: true, sessionId: session.id };
}
