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
 * POST /api/extracted-questions/:id/approve
 * Marks question as approved (ready for adaptive quiz).
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("UNAUTHORIZED", "Silakan login.", 401);

  // Verify ownership
  const { data: existing } = await supabase
    .from("extracted_questions")
    .select("id, review_status")
    .eq("id", params.id)
    .maybeSingle();

  if (!existing) return err("NOT_FOUND", "Soal tidak ditemukan.", 404);

  const admin = createAdminClient();
  const { data: updated, error: updateErr } = await admin
    .from("extracted_questions")
    .update({
      review_status: "approved",
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (updateErr || !updated) {
    return err("INTERNAL_ERROR", "Gagal approve soal.", 500);
  }

  return NextResponse.json({
    success: true,
    data: { question: updated },
    message: "Soal disetujui.",
  });
}
