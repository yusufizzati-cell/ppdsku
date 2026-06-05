import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { UPLOAD_BUCKET } from "@/lib/upload-config";

function err(code: string, message: string, status: number) {
  return NextResponse.json(
    { success: false, error: { code, message } },
    { status }
  );
}

/**
 * GET /api/uploads/:id — upload detail (ownership enforced via RLS).
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

  const { data: upload, error } = await supabase
    .from("uploads")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error) return err("INTERNAL_ERROR", "Gagal memuat upload.", 500);
  if (!upload) return err("NOT_FOUND", "Upload tidak ditemukan.", 404);

  return NextResponse.json({ success: true, data: { upload } });
}

/**
 * DELETE /api/uploads/:id — remove upload + storage file.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("UNAUTHORIZED", "Silakan login.", 401);

  const { data: upload } = await supabase
    .from("uploads")
    .select("id, file_path")
    .eq("id", params.id)
    .maybeSingle();

  if (!upload) return err("NOT_FOUND", "Upload tidak ditemukan.", 404);

  // Remove storage file (best effort)
  await supabase.storage.from(UPLOAD_BUCKET).remove([upload.file_path]);

  const { error: delErr } = await supabase
    .from("uploads")
    .delete()
    .eq("id", params.id);

  if (delErr) return err("INTERNAL_ERROR", "Gagal menghapus upload.", 500);

  return NextResponse.json({ success: true, message: "Upload dihapus." });
}
