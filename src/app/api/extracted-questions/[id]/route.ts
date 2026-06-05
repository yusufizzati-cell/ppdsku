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

/**
 * GET /api/extracted-questions/:id
 * Returns single extracted question.
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

  const { data: question, error } = await supabase
    .from("extracted_questions")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error) return err("INTERNAL_ERROR", "Gagal memuat soal.", 500);
  if (!question) return err("NOT_FOUND", "Soal tidak ditemukan.", 404);

  return NextResponse.json({ success: true, data: { question } });
}

/**
 * PATCH /api/extracted-questions/:id
 * Update extracted question fields (edit during review).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("UNAUTHORIZED", "Silakan login.", 401);

  // Verify ownership via RLS read
  const { data: existing } = await supabase
    .from("extracted_questions")
    .select("id")
    .eq("id", params.id)
    .maybeSingle();

  if (!existing) return err("NOT_FOUND", "Soal tidak ditemukan.", 404);

  // Parse body
  let body: Partial<{
    question_text: string;
    options: Record<string, string>;
    answer_key: string | null;
    explanation: string | null;
    topic: string | null;
    subtopic: string | null;
  }>;
  try {
    body = await request.json();
  } catch {
    return err("VALIDATION_ERROR", "Request body tidak valid.", 400);
  }

  // Build update payload (only allowed fields)
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (body.question_text !== undefined) {
    if (!body.question_text.trim()) {
      return err("VALIDATION_ERROR", "question_text tidak boleh kosong.", 400);
    }
    updates.question_text = body.question_text.trim();
  }

  if (body.options !== undefined) {
    if (typeof body.options !== "object") {
      return err("VALIDATION_ERROR", "options harus object.", 400);
    }
    updates.options = body.options;
  }

  if (body.answer_key !== undefined) {
    const key = body.answer_key?.toUpperCase().trim() || null;
    if (key && !/^[A-E]$/.test(key)) {
      return err("VALIDATION_ERROR", "answer_key harus A/B/C/D/E atau null.", 400);
    }
    updates.answer_key = key;
  }

  if (body.explanation !== undefined) {
    updates.explanation = body.explanation?.trim() || null;
  }

  if (body.topic !== undefined) {
    updates.topic = body.topic?.trim() || null;
  }

  if (body.subtopic !== undefined) {
    updates.subtopic = body.subtopic?.trim() || null;
  }

  // Mark as edited if changed
  if (Object.keys(updates).length > 1) {
    updates.review_status = "edited";
  }

  const admin = createAdminClient();
  const { data: updated, error: updateErr } = await admin
    .from("extracted_questions")
    .update(updates)
    .eq("id", params.id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (updateErr || !updated) {
    return err("INTERNAL_ERROR", "Gagal update soal.", 500);
  }

  return NextResponse.json({
    success: true,
    data: { question: updated },
  });
}
