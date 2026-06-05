import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  UPLOAD_BUCKET,
  validateFile,
  buildStoragePath,
  FREE_MAX_UPLOADS,
} from "@/lib/upload-config";
import { getSubscriptionStatus } from "@/lib/subscription";
import { randomUUID } from "crypto";

function err(code: string, message: string, status: number) {
  return NextResponse.json(
    { success: false, error: { code, message } },
    { status }
  );
}

/**
 * POST /api/uploads — multipart/form-data
 * Validates file, enforces usage limit (free), uploads to Storage,
 * and creates an `uploads` row.
 */
export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return err("UNAUTHORIZED", "Silakan login untuk mengupload soal.", 401);
  }

  // Parse multipart
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return err("VALIDATION_ERROR", "Request tidak valid.", 400);
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return err("VALIDATION_ERROR", "File tidak ditemukan.", 400);
  }

  // Validate type & size
  const validation = validateFile(file.type, file.size);
  if (!validation.ok || !validation.fileKind) {
    return err(
      validation.code ?? "VALIDATION_ERROR",
      validation.error ?? "File tidak valid.",
      400
    );
  }

  // Usage limit (free tier)
  const sub = await getSubscriptionStatus(user.id);
  if (!sub.isPro) {
    const { count } = await supabase
      .from("uploads")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if ((count ?? 0) >= FREE_MAX_UPLOADS) {
      return err(
        "USAGE_LIMIT_EXCEEDED",
        `Batas ${FREE_MAX_UPLOADS} upload gratis tercapai. Upgrade ke PRO untuk lebih banyak.`,
        402
      );
    }
  }

  // Build storage path & upload
  const uploadId = randomUUID();
  const storagePath = buildStoragePath(user.id, uploadId, file.name);

  const arrayBuffer = await file.arrayBuffer();
  const { error: storageErr } = await supabase.storage
    .from(UPLOAD_BUCKET)
    .upload(storagePath, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (storageErr) {
    return err(
      "INTERNAL_ERROR",
      `Gagal menyimpan file: ${storageErr.message}`,
      500
    );
  }

  // Create uploads row
  const { data: upload, error: dbErr } = await supabase
    .from("uploads")
    .insert({
      id: uploadId,
      user_id: user.id,
      file_path: storagePath,
      file_type: validation.fileKind,
      original_filename: file.name,
      file_size: file.size,
      status: "uploaded",
    })
    .select()
    .single();

  if (dbErr || !upload) {
    // Roll back the stored file if DB insert failed
    await supabase.storage.from(UPLOAD_BUCKET).remove([storagePath]);
    return err("INTERNAL_ERROR", "Gagal mencatat upload.", 500);
  }

  return NextResponse.json({
    success: true,
    data: {
      upload: {
        id: upload.id,
        file_path: upload.file_path,
        file_type: upload.file_type,
        original_filename: upload.original_filename,
        file_size: upload.file_size,
        status: upload.status,
        created_at: upload.created_at,
      },
    },
  });
}

/**
 * GET /api/uploads — list current user's uploads.
 */
export async function GET() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return err("UNAUTHORIZED", "Silakan login.", 401);
  }

  const { data, error } = await supabase
    .from("uploads")
    .select("id, original_filename, file_type, status, file_size, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return err("INTERNAL_ERROR", "Gagal memuat daftar upload.", 500);
  }

  return NextResponse.json({ success: true, data: { uploads: data ?? [] } });
}
