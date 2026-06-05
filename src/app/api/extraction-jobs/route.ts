import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { extractWithGemini, extractWithOcr } from "@/lib/extraction";
import type { ExtractedQuestionRaw } from "@/lib/extraction";
import { UPLOAD_BUCKET } from "@/lib/upload-config";

function err(code: string, message: string, status: number) {
  return NextResponse.json(
    { success: false, error: { code, message } },
    { status }
  );
}

/**
 * Creates a Supabase admin client (service role) for server-side mutations
 * that need to bypass RLS (e.g., updating job status during async processing).
 */
function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SECRET_KEY!;
  return createClient(url, key);
}

/**
 * POST /api/extraction-jobs
 * Body: { upload_id: string }
 * Creates an extraction job and starts AI extraction.
 */
export async function POST(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("UNAUTHORIZED", "Silakan login.", 401);

  // Parse body
  let body: { upload_id?: string };
  try {
    body = await request.json();
  } catch {
    return err("VALIDATION_ERROR", "Request body tidak valid.", 400);
  }

  const { upload_id } = body;
  if (!upload_id) {
    return err("VALIDATION_ERROR", "upload_id wajib diisi.", 400);
  }

  // Verify upload exists and belongs to user (RLS enforced)
  const { data: upload, error: uploadErr } = await supabase
    .from("uploads")
    .select("*")
    .eq("id", upload_id)
    .maybeSingle();

  if (uploadErr || !upload) {
    return err("NOT_FOUND", "Upload tidak ditemukan.", 404);
  }

  if (upload.status !== "uploaded" && upload.status !== "failed") {
    return err(
      "INVALID_STATE",
      `Upload status "${upload.status}" — hanya status "uploaded" atau "failed" yang bisa diekstrak.`,
      409
    );
  }

  // Check for existing active job
  const { data: existingJob } = await supabase
    .from("extraction_jobs")
    .select("id, status")
    .eq("upload_id", upload_id)
    .in("status", ["pending", "processing"])
    .maybeSingle();

  if (existingJob) {
    return err(
      "ALREADY_PROCESSING",
      "Extraction sudah berjalan untuk upload ini.",
      409
    );
  }

  // Check Gemini API key
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return err(
      "CONFIG_ERROR",
      "Gemini API key belum dikonfigurasi. Hubungi admin.",
      500
    );
  }

  const admin = createAdminClient();

  // Create extraction job
  const { data: job, error: jobErr } = await admin
    .from("extraction_jobs")
    .insert({
      upload_id,
      user_id: user.id,
      status: "processing",
      method: "gemini",
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (jobErr || !job) {
    return err("INTERNAL_ERROR", "Gagal membuat extraction job.", 500);
  }

  // Update upload status to "extracting"
  await admin
    .from("uploads")
    .update({ status: "extracting", updated_at: new Date().toISOString() })
    .eq("id", upload_id);

  // Download file from storage
  const { data: fileData, error: storageErr } = await admin.storage
    .from(UPLOAD_BUCKET)
    .download(upload.file_path);

  if (storageErr || !fileData) {
    await admin
      .from("extraction_jobs")
      .update({
        status: "failed",
        error_message: `Gagal download file: ${storageErr?.message ?? "unknown"}`,
        completed_at: new Date().toISOString(),
      })
      .eq("id", job.id);
    await admin
      .from("uploads")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("id", upload_id);
    return err("INTERNAL_ERROR", "Gagal mengambil file dari storage.", 500);
  }

  const arrayBuffer = await fileData.arrayBuffer();
  const mimeType =
    upload.file_type === "pdf" ? "application/pdf" : "image/jpeg";

  // Try Gemini first
  let result = await extractWithGemini(arrayBuffer, mimeType, geminiKey);

  // Fallback to OCR if Gemini fails
  if (!result.success && upload.file_type === "pdf") {
    result = await extractWithOcr(arrayBuffer, mimeType);
  }

  if (!result.success || result.questions.length === 0) {
    await admin
      .from("extraction_jobs")
      .update({
        status: "failed",
        method: result.method,
        error_message:
          result.error ?? "Tidak ada soal yang berhasil diekstrak.",
        completed_at: new Date().toISOString(),
      })
      .eq("id", job.id);
    await admin
      .from("uploads")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("id", upload_id);

    return NextResponse.json(
      {
        success: false,
        data: { job_id: job.id },
        error: {
          code: "EXTRACTION_FAILED",
          message:
            result.error ?? "Tidak ada soal yang berhasil diekstrak.",
        },
      },
      { status: 422 }
    );
  }

  // Save extracted questions
  const questionsToInsert = result.questions.map(
    (q: ExtractedQuestionRaw, idx: number) => ({
      job_id: job.id,
      user_id: user.id,
      question_number: q.question_number ?? idx + 1,
      question_text: q.question_text,
      options: q.options,
      answer_key: q.answer_key ?? null,
      explanation: q.explanation ?? null,
      topic: q.topic ?? null,
      subtopic: q.subtopic ?? null,
      difficulty_estimate: q.difficulty_estimate ?? null,
      confidence: q.confidence ?? 0.5,
      answer_confidence: q.answer_confidence ?? 0,
      review_status: "pending",
      source_page: q.source_page ?? null,
      source_region: q.source_region ?? null,
      raw_text: q.raw_text ?? null,
    })
  );

  const { error: insertErr } = await admin
    .from("extracted_questions")
    .insert(questionsToInsert);

  if (insertErr) {
    await admin
      .from("extraction_jobs")
      .update({
        status: "failed",
        error_message: `Gagal menyimpan soal: ${insertErr.message}`,
        completed_at: new Date().toISOString(),
      })
      .eq("id", job.id);
    await admin
      .from("uploads")
      .update({ status: "failed", updated_at: new Date().toISOString() })
      .eq("id", upload_id);
    return err("INTERNAL_ERROR", "Gagal menyimpan hasil ekstraksi.", 500);
  }

  // Mark job completed
  await admin
    .from("extraction_jobs")
    .update({
      status: "completed",
      method: result.method,
      total_extracted: result.questions.length,
      completed_at: new Date().toISOString(),
    })
    .eq("id", job.id);

  // Mark upload extracted
  await admin
    .from("uploads")
    .update({ status: "extracted", updated_at: new Date().toISOString() })
    .eq("id", upload_id);

  return NextResponse.json(
    {
      success: true,
      data: {
        job_id: job.id,
        method: result.method,
        total_extracted: result.questions.length,
        metadata: result.metadata,
      },
    },
    { status: 201 }
  );
}

/**
 * GET /api/extraction-jobs
 * Lists extraction jobs for the current user.
 */
export async function GET() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return err("UNAUTHORIZED", "Silakan login.", 401);

  const { data: jobs, error } = await supabase
    .from("extraction_jobs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return err("INTERNAL_ERROR", "Gagal memuat extraction jobs.", 500);
  }

  return NextResponse.json({ success: true, data: { jobs } });
}
